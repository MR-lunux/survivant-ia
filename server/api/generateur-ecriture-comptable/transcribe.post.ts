import { validateAudio } from '../../utils/audio-validation'
import { checkRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (config.generateurEcritureEnabled === 'false') {
    setResponseStatus(event, 503)
    return { error: 'disabled' }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    return { error: 'rate_limit', resetAt: rl.resetAt }
  }

  const form = await readMultipartFormData(event)
  if (!form || form.length === 0) {
    setResponseStatus(event, 400)
    return { error: 'no_file' }
  }

  const audioField = form.find(item => item.name === 'audio')
  if (!audioField) {
    setResponseStatus(event, 400)
    return { error: 'no_audio_field' }
  }

  const buffer = Buffer.from(audioField.data)
  const validation = validateAudio(buffer, audioField.type)
  if (!validation.valid) {
    setResponseStatus(event, 400)
    return { error: 'invalid_audio', reason: validation.reason }
  }

  const token = config.infomaniakAiToken
  const productId = config.infomaniakAiProductId
  if (!token || !productId) {
    console.error('[generateur-ecriture/transcribe] Infomaniak config missing')
    setResponseStatus(event, 500)
    return { error: 'config_missing' }
  }

  const { FormData } = await import('formdata-node')
  const { Blob } = await import('buffer')

  const fd = new FormData()
  const blob = new Blob([buffer])
  fd.append('file', blob, `audio.${validation.detectedExtension}`)
  fd.append('model', 'whisper')
  fd.append('response_format', 'verbose_json')

  let batchResponse: { batch_id?: string }
  try {
    batchResponse = await $fetch<{ batch_id?: string }>(
      `https://api.infomaniak.com/1/ai/${productId}/openai/audio/transcriptions`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd as unknown as BodyInit,
      }
    )
  } catch (err) {
    console.error('[generateur-ecriture/transcribe] Infomaniak upload failed:', err instanceof Error ? err.message : err)
    setResponseStatus(event, 502)
    return { error: 'upload_failed' }
  }

  if (!batchResponse.batch_id) {
    setResponseStatus(event, 502)
    return { error: 'no_batch_id' }
  }

  return { batch_id: batchResponse.batch_id, status: 'processing' }
})
