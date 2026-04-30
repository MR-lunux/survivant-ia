// app/plugins/posthog.client.ts
// Initialise posthog-js en mode anonyme (cookieless).
// Voir docs/superpowers/specs/2026-04-30-posthog-integration-design.md §3.

import posthog from 'posthog-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const key = config.public.posthogKey as string

  if (!key) {
    // Pas de clé en local sans .env → on ne charge rien plutôt que de crasher.
    if (import.meta.dev) console.warn('[posthog] NUXT_PUBLIC_POSTHOG_KEY missing, analytics disabled')
    return { provide: { posthog: null as null | typeof posthog } }
  }

  posthog.init(key, {
    api_host: '/_ph',
    ui_host: 'https://eu.posthog.com',
    persistence: 'memory',
    disable_persistence: true,
    disable_session_recording: true,
    enable_recording_console_log: false,
    capture_pageview: false,           // on le fait manuellement via le router
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

  // Pageview manuel sur chaque navigation, après que le DOM soit settled.
  const router = nuxtApp.$router as { afterEach: (cb: (to: { fullPath: string }) => void) => void }
  router.afterEach((to) => {
    posthog.capture('$pageview', { $current_url: window.location.origin + to.fullPath })
  })

  return {
    provide: {
      posthog,
    },
  }
})
