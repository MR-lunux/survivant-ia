// server/api/generateur-processus-bpmn/generate.post.ts
// Endpoint orchestrateur pour le générateur de processus BPMN.
//
// Flow :
//   1. Rate limit IP (20/jour, namespace dédié)
//   2. Validate longueur + injection patterns
//   3. Modération wordlist sur input
//   4. Call Infomaniak → IR JSON (retry 1× à temp 0.1 si shape ou graphe invalide)
//   5. Modération wordlist sur labels de l'IR (post-check)
//   6. IR → BPMN XML (déterministe)
//   7. PostHog server tracking

import { sanitizeBpmnInput, validateBpmnInput } from '../../utils/bpmn-generator-validation'
import { checkModeration } from '../../utils/ameliorer-prompt-moderation'
import { checkRateLimit } from '../../utils/rate-limit'
import { callBpmnGeneratorChat, isValidBpmnChatResult, type BpmnChatCallResult } from '../../utils/bpmn-generator-chat'
import { irToBpmnXml } from '../../utils/ir-to-bpmn'
import type { BpmnIR } from '../../utils/bpmn-ir-schema'
import { captureBpmnServerEvent } from '../../utils/bpmn-generator-posthog'

const RATE_LIMIT = 20
const NAMESPACE = 'generateur-processus-bpmn'

interface GenerateRequest {
  description: string
  distinct_id?: string
}

function moderateIR(ir: BpmnIR): { ok: boolean; category?: string } {
  const labels: string[] = []
  labels.push(ir.process_name)
  for (const l of ir.lanes) labels.push(l.label)
  for (const n of ir.nodes) if ('label' in n && n.label) labels.push(n.label)
  for (const f of ir.flows) if (f.condition) labels.push(f.condition)
  const joined = labels.join(' ')
  return checkModeration(joined)
}

export default defineEventHandler(async (event) => {
  const start = Date.now()
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  // ─── Rate limit ───
  const rl = checkRateLimit(ip, { namespace: NAMESPACE, limit: RATE_LIMIT })
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setResponseHeader(event, 'X-RateLimit-Remaining', '0')
    setResponseHeader(event, 'X-RateLimit-Reset', String(rl.resetAt))
    await captureBpmnServerEvent({
      event: 'bpmn_generator_api_error',
      properties: { error_type: 'rate_limit', duration_ms: Date.now() - start },
    })
    return { error: 'rate_limit', resetAt: rl.resetAt }
  }
  setResponseHeader(event, 'X-RateLimit-Remaining', String(rl.remaining))

  // ─── Body ───
  const body = await readBody<GenerateRequest>(event)
  if (!body || typeof body.description !== 'string') {
    setResponseStatus(event, 400)
    return { error: 'bad_request' }
  }
  const distinctId = body.distinct_id

  // ─── Sanitize + validate ───
  const sanitized = sanitizeBpmnInput(body.description)
  const validation = validateBpmnInput(sanitized)
  if (!validation.valid) {
    setResponseStatus(event, 400)
    await captureBpmnServerEvent({
      event: 'bpmn_generator_api_error',
      properties: { error_type: 'invalid_input', reason: validation.reason, duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'invalid_input', reason: validation.reason }
  }

  // ─── Modération input ───
  const modIn = checkModeration(sanitized)
  if (!modIn.ok) {
    setResponseStatus(event, 400)
    await captureBpmnServerEvent({
      event: 'bpmn_generator_api_error',
      properties: { error_type: 'bad_input', source: 'input', category: modIn.category, duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'bad_input', message: "Ce contenu n'est pas accepté. Reformule en restant pro." }
  }

  // ─── Call Infomaniak (avec retry 1× si shape/graphe KO) ───
  let chatResult: BpmnChatCallResult
  let retryUsed = false
  try {
    try {
      chatResult = await callBpmnGeneratorChat({ description: sanitized })
    } catch (firstErr) {
      console.warn('[bpmn-generator/generate] first attempt failed, retrying at temp 0.1:', firstErr instanceof Error ? firstErr.message : firstErr)
      retryUsed = true
      chatResult = await callBpmnGeneratorChat({ description: sanitized, temperature: 0.1 })
    }
    if (!isValidBpmnChatResult(chatResult.data)) {
      retryUsed = true
      chatResult = await callBpmnGeneratorChat({ description: sanitized, temperature: 0.1 })
      if (!isValidBpmnChatResult(chatResult.data)) {
        setResponseStatus(event, 502)
        await captureBpmnServerEvent({
          event: 'bpmn_generator_api_error',
          properties: { error_type: 'ir_invalid', duration_ms: Date.now() - start },
          distinctId,
        })
        return { error: 'ir_invalid' }
      }
    }
  } catch (err) {
    console.error('[bpmn-generator/generate] Infomaniak call failed after retry:', err instanceof Error ? err.message : err)
    setResponseStatus(event, 502)
    await captureBpmnServerEvent({
      event: 'bpmn_generator_api_error',
      properties: { error_type: 'ai_unreachable', duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'ai_unreachable' }
  }

  // ─── too_vague ───
  if (chatResult.data.error === 'too_vague') {
    await captureBpmnServerEvent({
      event: 'bpmn_generator_api_error',
      properties: { error_type: 'too_vague', duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'too_vague', message: chatResult.data.message ?? 'Ta description est trop vague. Décris au moins 2 étapes et qui les exécute.' }
  }

  const ir = chatResult.data.ir!

  // ─── Modération post-check sur IR ───
  const modOut = moderateIR(ir)
  if (!modOut.ok) {
    await captureBpmnServerEvent({
      event: 'bpmn_generator_api_error',
      properties: { error_type: 'bad_input', source: 'post_check', category: modOut.category, duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'bad_input', message: "Ce contenu n'est pas accepté. Reformule en restant pro." }
  }

  // ─── Conversion IR → XML ───
  let xml: string
  try {
    xml = await irToBpmnXml(ir)
  } catch (err) {
    console.error('[bpmn-generator/generate] conversion failed:', err instanceof Error ? err.message : err)
    setResponseStatus(event, 500)
    await captureBpmnServerEvent({
      event: 'bpmn_generator_api_error',
      properties: { error_type: 'conversion_failed', duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'conversion_failed' }
  }

  // ─── Success ───
  const gatewayCount = ir.nodes.filter(n => n.type === 'gateway').length
  const subprocessCount = ir.nodes.filter(n => n.type === 'subprocess').length

  await captureBpmnServerEvent({
    event: 'bpmn_generator_api_success',
    properties: {
      duration_ms: Date.now() - start,
      model: chatResult.meta.model,
      input_tokens: chatResult.meta.input_tokens,
      output_tokens: chatResult.meta.output_tokens,
      node_count: ir.nodes.length,
      lane_count: ir.lanes.length,
      gateway_count: gatewayCount,
      subprocess_count: subprocessCount,
      retry_used: retryUsed,
    },
    distinctId,
  })

  return { xml, ir }
})
