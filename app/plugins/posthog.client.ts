// app/plugins/posthog.client.ts
// PostHog : mode cookieless par défaut, full mode (cookies + session recording) sous consentement.
// Voir docs/superpowers/specs/2026-05-16-cookies-ga4-design.md §Flow de consentement.

import posthog from 'posthog-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const key = config.public.posthogKey as string

  if (!key) {
    if (import.meta.dev) console.warn('[posthog] NUXT_PUBLIC_POSTHOG_KEY missing, analytics disabled')
    return { provide: { posthog: null as null | typeof posthog } }
  }

  const { state } = useConsent()
  const initialGranted = state.value.analytics === 'granted'

  posthog.init(key, {
    api_host: '/_ph',
    ui_host: 'https://eu.posthog.com',
    // Init selon consentement stocké : full mode si granted, sinon cookieless.
    persistence: initialGranted ? 'localStorage+cookie' : 'memory',
    disable_persistence: !initialGranted,
    disable_session_recording: !initialGranted,
    enable_recording_console_log: false,
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    capture_performance: true,
    respect_dnt: true,
    loaded: (ph) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage?.getItem('ph_optout') === '1') {
          ph.opt_out_capturing()
        }
      } catch { /* localStorage may be blocked, ignore */ }
    },
  })

  // Watch les changements de consentement pour basculer entre les modes.
  const stopWatcher = watch(() => state.value.analytics, (next) => {
    if (next === 'granted') {
      posthog.set_config({
        persistence: 'localStorage+cookie',
        disable_persistence: false,
        disable_session_recording: false,
      })
      posthog.startSessionRecording()
    } else {
      // Refus ou révocation : on stoppe le replay et on coupe la persistance.
      // Les cookies déjà déposés ne sont pas effacés (limitation documentée dans /cookies).
      posthog.stopSessionRecording()
      posthog.set_config({
        persistence: 'memory',
        disable_persistence: true,
        disable_session_recording: true,
      })
    }
  })

  // Pageview manuel sur chaque navigation (inchangé).
  const router = useRouter()
  const unsubscribe = router.afterEach((to) => {
    posthog.capture('$pageview', { $current_url: window.location.origin + to.fullPath })
  })

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      stopWatcher()
      unsubscribe()
    })
  }

  return {
    provide: {
      posthog,
    },
  }
})
