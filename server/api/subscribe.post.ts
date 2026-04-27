// server/api/subscribe.post.ts
export default defineEventHandler(async (event) => {
  const { brevoApiKey, brevoListId } = useRuntimeConfig()

  const body = await readBody(event)
  const { prenom, email, consent } = body ?? {}

  if (!prenom || typeof prenom !== 'string' || prenom.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Prénom requis.' })
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
        PRENOM: prenom.trim(),
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
