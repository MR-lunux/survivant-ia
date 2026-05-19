// server/api/ameliorer-prompt/improve.post.ts
// Endpoint orchestrateur pour l'améliorateur de prompt.
//
// Flow :
//   1. Validation input (longueur + injection patterns hard)
//   2. Rate limit IP (namespace 'ameliorer-prompt', 20/jour)
//   3. Modération server-side input (wordlist)
//   4. Call Infomaniak avec system prompt + JSON schema
//   5. Validation shape JSON (retry 1× à temp 0.1 si cassé)
//   6. Post-check modération sur structured output
//   7. PostHog server tracking (no-op si NUXT_POSTHOG_SERVER_KEY absent)

import { validateAmeliorerInput, sanitizeAmeliorerInput } from '../../utils/ameliorer-prompt-validation'
import { checkModeration, checkModerationOnOutput } from '../../utils/ameliorer-prompt-moderation'
import { checkRateLimit } from '../../utils/rate-limit'
import { callAmeliorerChat, isValidShape, type AmeliorerChatResult } from '../../utils/ameliorer-prompt-chat'
import { captureServerEvent } from '../../utils/ameliorer-prompt-posthog'

const RATE_LIMIT = 20  // calls / jour / IP
const NAMESPACE = 'ameliorer-prompt'

interface ImproveRequest {
  prompt_brut: string
  distinct_id?: string  // PostHog distinct_id du client si dispo
}

export default defineEventHandler(async (event) => {
  const start = Date.now()
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  // ─── Rate limit (avant validation pour économiser même les payloads invalides) ───
  const rl = checkRateLimit(ip, { namespace: NAMESPACE, limit: RATE_LIMIT })
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setResponseHeader(event, 'X-RateLimit-Remaining', '0')
    setResponseHeader(event, 'X-RateLimit-Reset', String(rl.resetAt))
    await captureServerEvent({
      event: 'ameliorer_prompt_api_error',
      properties: { error_type: 'rate_limit', duration_ms: Date.now() - start },
    })
    return { error: 'rate_limit', resetAt: rl.resetAt }
  }
  setResponseHeader(event, 'X-RateLimit-Remaining', String(rl.remaining))

  // ─── Read body ───
  const body = await readBody<ImproveRequest>(event)
  if (!body || typeof body.prompt_brut !== 'string') {
    setResponseStatus(event, 400)
    return { error: 'bad_request' }
  }
  const distinctId = body.distinct_id

  // ─── Sanitize + validate ───
  const sanitized = sanitizeAmeliorerInput(body.prompt_brut)
  const validation = validateAmeliorerInput(sanitized)
  if (!validation.valid) {
    setResponseStatus(event, 400)
    await captureServerEvent({
      event: 'ameliorer_prompt_api_error',
      properties: { error_type: 'validation', reason: validation.reason, duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'invalid_input', reason: validation.reason }
  }

  // ─── Modération input ───
  const modIn = checkModeration(sanitized)
  if (!modIn.ok) {
    setResponseStatus(event, 400)
    await captureServerEvent({
      event: 'ameliorer_prompt_api_error',
      properties: { error_type: 'moderation_server', source: 'input', category: modIn.category, duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'bad_input', message: "Ce prompt n'est pas accepté. Survivant-IA refuse les contenus dénigrants, sexuels explicites, ou nocifs. Reformule en restant pro." }
  }

  // ─── Call Infomaniak (avec retry 1× si JSON cassé) ───
  let chatResult: { data: AmeliorerChatResult; meta: { input_tokens: number | null; output_tokens: number | null; model: string } }
  try {
    chatResult = await callAmeliorerChat({ promptBrut: sanitized })
    if (!isValidShape(chatResult.data)) {
      chatResult = await callAmeliorerChat({ promptBrut: sanitized, temperature: 0.1 })
      if (!isValidShape(chatResult.data)) {
        setResponseStatus(event, 502)
        await captureServerEvent({
          event: 'ameliorer_prompt_api_error',
          properties: { error_type: 'bad_json', duration_ms: Date.now() - start },
          distinctId,
        })
        return { error: 'bad_json' }
      }
    }
  } catch (err) {
    console.error('[ameliorer-prompt/improve] Infomaniak call failed:', err instanceof Error ? err.message : err)
    setResponseStatus(event, 502)
    await captureServerEvent({
      event: 'ameliorer_prompt_api_error',
      properties: { error_type: 'api_down', duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'ai_unreachable' }
  }

  // ─── Si l'IA a retourné bad_input ───
  if (chatResult.data.error === 'bad_input') {
    await captureServerEvent({
      event: 'ameliorer_prompt_api_error',
      properties: { error_type: 'moderation_server', source: 'system_prompt', duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'bad_input', message: chatResult.data.message ?? "Ce prompt n'est pas accepté." }
  }

  // ─── Post-check modération sur la sortie ───
  const modOut = checkModerationOnOutput(chatResult.data.structured!)
  if (!modOut.ok) {
    await captureServerEvent({
      event: 'ameliorer_prompt_api_error',
      properties: { error_type: 'moderation_server', source: 'post_check', category: modOut.category, duration_ms: Date.now() - start },
      distinctId,
    })
    return { error: 'bad_input', message: "Ce prompt n'est pas accepté. Reformule en restant pro." }
  }

  // ─── Success ───
  await captureServerEvent({
    event: 'ameliorer_prompt_api_success',
    properties: {
      duration_ms: Date.now() - start,
      model: chatResult.meta.model,
      input_tokens: chatResult.meta.input_tokens,
      output_tokens: chatResult.meta.output_tokens,
      already_solid: chatResult.data.already_solid ?? false,
      additions_count: (chatResult.data.additions ?? []).length,
    },
    distinctId,
  })

  return {
    structured: chatResult.data.structured,
    additions: chatResult.data.additions ?? [],
    already_solid: chatResult.data.already_solid ?? false,
  }
})
