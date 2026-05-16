// app/plugins/gtag.client.ts
// Charge GA4 avec Google Consent Mode v2.
// Voir docs/superpowers/specs/2026-05-16-cookies-ga4-design.md §Flow de consentement.

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gtagId = config.public.gtagId as string

  if (!gtagId) {
    if (import.meta.dev) console.warn('[gtag] NUXT_PUBLIC_GTAG_ID missing, analytics disabled')
    return
  }

  // 1. Setup dataLayer + gtag avant tout appel.
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // Conserve la pattern officielle Google (push(arguments)).
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }

  // 2. Consent default : tout en denied, fenêtre 500ms pour update synchrone.
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  })

  // 3. Init GA4. anonymize_ip pour réduire l'empreinte légale.
  window.gtag('js', new Date())
  window.gtag('config', gtagId, { anonymize_ip: true })

  // 4. Charge le script gtag.js (async).
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`
  document.head.appendChild(script)

  // 5. Si l'utilisateur a déjà accepté (visite de retour), update synchrone
  //    AVANT que les 500ms wait_for_update n'expirent.
  const { state } = useConsent()
  if (state.value.analytics === 'granted') {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  }

  // 6. Watch les changements ultérieurs.
  const stopWatcher = watch(() => state.value.analytics, (next) => {
    const granted = next === 'granted'
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
    })
  })

  if (import.meta.hot) {
    import.meta.hot.dispose(() => stopWatcher())
  }
})
