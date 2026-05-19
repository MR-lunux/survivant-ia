// server/utils/ameliorer-prompt-posthog.ts
// Server-side PostHog capture, no-op si NUXT_POSTHOG_SERVER_KEY non set.
// Permet de tracker durée API, tokens, modèle, depuis le serveur — données
// non visibles côté client.

interface CaptureOptions {
  event: string
  properties: Record<string, unknown>
  distinctId?: string
}

export async function captureServerEvent({ event, properties, distinctId }: CaptureOptions): Promise<void> {
  const config = useRuntimeConfig()
  const apiKey = (config as Record<string, unknown>).posthogServerKey as string | undefined
  const host = ((config.public as Record<string, unknown>).posthogHost as string | undefined) || 'https://eu.i.posthog.com'

  if (!apiKey) return  // no-op si pas configuré
  if (!distinctId) distinctId = `server-anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  try {
    await fetch(`${host}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties: {
          ...properties,
          $lib: 'survivant-server',
        },
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (err) {
    console.warn('[ameliorer-prompt/posthog] capture failed:', err instanceof Error ? err.message : err)
  }
}
