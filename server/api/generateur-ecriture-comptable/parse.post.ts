import { validateInput, sanitizeInput } from '../../utils/input-validation'
import { validateAiResponse } from '../../utils/output-validation'
import { checkRateLimit } from '../../utils/rate-limit'
import { callInfomaniakChat } from '../../utils/infomaniak-ai-client'

interface ParseRequest {
  text: string
  currentDate?: string
}

export default defineEventHandler(async (event) => {
  if (process.env.GENERATEUR_ECRITURE_ENABLED === 'false') {
    setResponseStatus(event, 503)
    return { error: 'disabled' }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setResponseHeader(event, 'X-RateLimit-Remaining', '0')
    setResponseHeader(event, 'X-RateLimit-Reset', String(rl.resetAt))
    return { error: 'rate_limit', resetAt: rl.resetAt }
  }
  setResponseHeader(event, 'X-RateLimit-Remaining', String(rl.remaining))

  const body = await readBody<ParseRequest>(event)
  if (!body || typeof body.text !== 'string') {
    setResponseStatus(event, 400)
    return { error: 'bad_request' }
  }
  const sanitized = sanitizeInput(body.text)

  const inputResult = validateInput(sanitized)
  if (!inputResult.valid) {
    setResponseStatus(event, 400)
    return { error: 'invalid_input', reason: inputResult.reason }
  }

  const currentDateISO = body.currentDate ?? new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(currentDateISO)) {
    setResponseStatus(event, 400)
    return { error: 'bad_request' }
  }

  let rawResponse: unknown
  try {
    rawResponse = await callInfomaniakChat({ text: sanitized, currentDateISO })
  } catch (err) {
    console.error('[generateur-ecriture/parse] Infomaniak call failed:', err instanceof Error ? err.message : err)
    setResponseStatus(event, 502)
    return { error: 'ai_unreachable' }
  }

  const validation = validateAiResponse(rawResponse)
  if (!validation.valid) {
    console.warn('[generateur-ecriture/parse] validation_failed:', validation.reason)
    setResponseStatus(event, 502)
    return { error: 'validation_failed' }
  }

  return validation.data
})
