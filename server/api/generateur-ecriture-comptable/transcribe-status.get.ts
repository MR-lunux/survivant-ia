import { peekRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (config.generateurEcritureEnabled === 'false') {
    setResponseStatus(event, 503)
    return { error: 'disabled' }
  }

  // Polling doesn't count against rate limit (the upload already did)
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const rl = peekRateLimit(ip)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    return { error: 'rate_limit' }
  }

  const query = getQuery(event)
  const batchId = typeof query.batch_id === 'string' ? query.batch_id : ''
  if (!batchId || !/^[a-zA-Z0-9_-]{8,128}$/.test(batchId)) {
    setResponseStatus(event, 400)
    return { error: 'bad_batch_id' }
  }

  const token = config.infomaniakAiToken
  const productId = config.infomaniakAiProductId
  if (!token || !productId) {
    setResponseStatus(event, 500)
    return { error: 'config_missing' }
  }

  let result: { status?: string; data?: string; text?: string; language?: string }
  try {
    result = await $fetch(
      `https://api.infomaniak.com/1/ai/${productId}/results/${batchId}`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    )
  } catch (err) {
    const e = err as { statusCode?: number }
    if (e.statusCode === 404) {
      return { status: 'processing' }
    }
    console.error('[generateur-ecriture/transcribe-status] poll failed:', err)
    setResponseStatus(event, 502)
    return { error: 'poll_failed' }
  }

  const status = result.status
  if (status === 'completed' || status === 'done' || status === 'success') {
    let transcription = ''
    let language: string | undefined
    if (result.data) {
      try {
        const parsed = JSON.parse(result.data) as { text?: string; language?: string }
        transcription = parsed.text ?? ''
        language = parsed.language
      } catch {
        transcription = result.text ?? ''
        language = result.language
      }
    } else {
      transcription = result.text ?? ''
      language = result.language
    }

    if (!transcription || transcription.trim() === '') {
      setResponseStatus(event, 400)
      return { error: 'empty_transcription' }
    }

    if (transcription.length > 200) {
      transcription = transcription.slice(0, 200)
    }

    return { status: 'completed', transcription, language }
  }

  if (status === 'failed' || status === 'error') {
    // Whisper couldn't transcribe (silent / too short / noisy audio).
    // Return 200 with a status field so the frontend handles it via
    // its res.error branch, not the network catch — and the user
    // sees a friendly "Aucune parole détectée" instead of a scary 500.
    return { status: 'failed', error: 'transcription_failed' }
  }

  return { status: 'processing' }
})
