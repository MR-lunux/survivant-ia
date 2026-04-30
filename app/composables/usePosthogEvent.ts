// app/composables/usePosthogEvent.ts
// Wrapper centralisé pour capturer un event PostHog.
// No-op silencieux si on est en SSR ou si le plugin n'a pas pu charger (clé manquante, DNT…).

export function usePosthogEvent() {
  const { $posthog } = useNuxtApp()

  function capture(eventName: string, props: Record<string, unknown> = {}) {
    if (!import.meta.client) return
    if (!$posthog) return
    try {
      $posthog.capture(eventName, props)
      if (import.meta.dev) console.log('[ph]', eventName, props)
    } catch (err) {
      if (import.meta.dev) console.warn('[ph] capture failed', err)
    }
  }

  return { capture }
}
