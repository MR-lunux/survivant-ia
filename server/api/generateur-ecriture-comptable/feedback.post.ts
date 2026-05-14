interface FeedbackRequest {
  email?: string
  prochainOutil?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<FeedbackRequest>(event)
  if (!body) {
    setResponseStatus(event, 400)
    return { error: 'bad_request' }
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const prochainOutil = typeof body.prochainOutil === 'string' ? body.prochainOutil.trim().slice(0, 500) : ''

  if (!email && !prochainOutil) {
    setResponseStatus(event, 400)
    return { error: 'nothing_to_submit' }
  }

  if (email) {
    if (!EMAIL_RE.test(email)) {
      setResponseStatus(event, 400)
      return { error: 'bad_email' }
    }

    const { brevoApiKey, brevoListId } = useRuntimeConfig()
    if (!brevoApiKey || !brevoListId) {
      console.error('[generateur-ecriture/feedback] Brevo runtime config missing')
      setResponseStatus(event, 500)
      return { error: 'config_missing' }
    }

    try {
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': brevoApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          listIds: [Number(brevoListId)],
          updateEnabled: true,
          attributes: {
            SOURCE_INSCRIPTION: 'generateur-ecriture-comptable',
            PROCHAIN_OUTIL_SUGGESTION: prochainOutil || undefined,
          },
        }),
      })
      if (!res.ok && res.status !== 204) {
        const txt = await res.text().catch(() => '')
        console.warn('[generateur-ecriture/feedback] Brevo non-OK:', res.status, txt.slice(0, 200))
      }
    } catch (err) {
      console.error('[generateur-ecriture/feedback] Brevo call failed:', err)
      setResponseStatus(event, 502)
      return { error: 'brevo_unreachable' }
    }
  }

  return { ok: true }
})
