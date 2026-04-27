// server/api/subscribe.post.ts
const _rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 heure

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = _rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    _rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

export default defineEventHandler(async (event) => {
  const { brevoApiKey, brevoListId } = useRuntimeConfig()

  if (!brevoApiKey || !brevoListId) {
    throw createError({ statusCode: 500, message: 'Configuration serveur manquante.' })
  }

  const body = await readBody(event)
  const { prenom, email, consent } = body ?? {}

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, message: 'Trop de tentatives. Réessayez dans une heure.' })
  }

  if (!prenom || typeof prenom !== 'string' || prenom.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Prénom requis.' })
  }

  if (stripHtml(prenom.trim()).length > 100) {
    throw createError({ statusCode: 400, message: 'Prénom trop long.' })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Email invalide.' })
  }

  if (consent !== true) {
    throw createError({ statusCode: 400, message: 'Consentement requis.' })
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      listIds: [Number(brevoListId)],
      attributes: {
        PRENOM: stripHtml(prenom.trim()),
        CONSENT: true,
        SOURCE: 'website',
      },
      updateEnabled: false,
    }),
  })

  // 201 = créé avec succès
  if (res.status === 201) {
    return { ok: true }
  }

  const data = await res.json().catch(() => ({}))

  // Brevo renvoie 400 + code "duplicate_parameter" si le contact existe déjà
  // (updateEnabled: false) — silencieux pour l'utilisateur, ce n'est pas une erreur
  if (res.status === 400 && data?.code === 'duplicate_parameter') {
    return { ok: true }
  }

  const message = data?.message ?? 'Erreur technique, réessayez.'
  throw createError({ statusCode: 500, message })
})
