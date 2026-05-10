// server/api/metiers/request.post.ts
const _rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3
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

async function brevoUpsertContact(opts: {
  email: string
  apiKey: string
  listId: number
  attributes: Record<string, string>
  updateEnabled: boolean
}): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': opts.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: opts.email,
      listIds: [opts.listId],
      attributes: opts.attributes,
      updateEnabled: opts.updateEnabled,
    }),
  })

  if (res.status === 201) return { ok: true, status: 201, data: null }

  const data = await res.json().catch(() => ({}))

  // Brevo renvoie 400 + code "duplicate_parameter" si le contact existe déjà
  // sur la liste — on le traite comme un succès silencieux.
  if (res.status === 400 && data?.code === 'duplicate_parameter') {
    return { ok: true, status: 400, data }
  }

  return { ok: false, status: res.status, data }
}

export default defineEventHandler(async (event) => {
  const { brevoApiKey, brevoListId, brevoMetierWaitlistListId } = useRuntimeConfig()

  if (!brevoApiKey || !brevoMetierWaitlistListId) {
    throw createError({ statusCode: 500, message: 'Configuration serveur manquante.' })
  }

  const body = await readBody(event)
  const { email, metier, subscribeNewsletter, website } = body ?? {}

  // Honeypot anti-bot : silencieux, pas d'appel Brevo, pas de rate-limit incrémenté
  if (website) {
    return { ok: true }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, message: 'Trop de demandes depuis ton réseau. Réessaie dans une heure.' })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Email invalide.' })
  }

  const safeMetier = typeof metier === 'string'
    ? stripHtml(metier.slice(0, 200))
    : ''

  if (!safeMetier) {
    throw createError({ statusCode: 400, message: 'Le nom du métier est requis.' })
  }

  // Appel #1 : waitlist (toujours)
  const waitlistRes = await brevoUpsertContact({
    email,
    apiKey: brevoApiKey,
    listId: Number(brevoMetierWaitlistListId),
    attributes: {
      SOURCE: 'metier_request',
      REQUESTED_JOB: safeMetier,
    },
    updateEnabled: true,
  })

  if (!waitlistRes.ok) {
    const message = waitlistRes.data?.message ?? 'Erreur technique, réessaie.'
    throw createError({ statusCode: 500, message })
  }

  // Appel #2 : newsletter (conditionnel)
  if (subscribeNewsletter === true && brevoListId) {
    const newsletterRes = await brevoUpsertContact({
      email,
      apiKey: brevoApiKey,
      listId: Number(brevoListId),
      attributes: { SOURCE: 'metier_request' },
      updateEnabled: false,
    })
    if (!newsletterRes.ok) {
      // La waitlist (#1) a réussi — on ne fait pas échouer le flow utilisateur
      // sur l'opt-in newsletter. On log et on continue.
      console.error('[metiers/request] newsletter opt-in failed', {
        status: newsletterRes.status,
        data: newsletterRes.data,
      })
    }
  }

  return { ok: true }
})
