// app/composables/useConsent.ts
// Source unique de vérité pour l'état de consentement cookies.
// Voir docs/superpowers/specs/2026-05-16-cookies-ga4-design.md §Flow de consentement.

const STORAGE_KEY = 'cookie-consent'
const CONSENT_VERSION = 1
const TTL_MS = 13 * 30 * 24 * 60 * 60 * 1000 // ~13 mois

type StoredConsent = {
  analytics: boolean
  timestamp: number
  version: number
}

export type ConsentStatus = 'pending' | 'granted' | 'denied'

type ConsentState = {
  analytics: ConsentStatus
  needsChoice: boolean
  isLoaded: boolean
}

function readStorage(): StoredConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredConsent
    if (parsed.version !== CONSENT_VERSION) return null
    if (typeof parsed.timestamp !== 'number') return null
    if (Date.now() - parsed.timestamp > TTL_MS) return null
    return parsed
  } catch (e) {
    if (import.meta.dev) {
      console.warn('[useConsent] readStorage failed:', e instanceof Error ? e.message : String(e))
    }
    return null
  }
}

function writeStorage(analytics: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
      analytics,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    } satisfies StoredConsent))
  } catch (e) {
    if (import.meta.dev) {
      console.warn('[useConsent] writeStorage failed:', e instanceof Error ? e.message : String(e))
    }
    // private browsing, quota, etc. : on tolère silencieusement en prod.
  }
}

export function useConsent() {
  const state = useState<ConsentState>('cookie-consent', () => ({
    analytics: 'pending',
    needsChoice: true,
    isLoaded: false,
  }))

  // Init lazy côté client uniquement.
  if (typeof window !== 'undefined' && !state.value.isLoaded) {
    const stored = readStorage()
    if (stored) {
      state.value.analytics = stored.analytics ? 'granted' : 'denied'
      state.value.needsChoice = false
    } else {
      state.value.analytics = 'pending'
      state.value.needsChoice = true
    }
    state.value.isLoaded = true
  }

  function accept() {
    writeStorage(true)
    state.value.analytics = 'granted'
    state.value.needsChoice = false
  }

  function refuse() {
    writeStorage(false)
    state.value.analytics = 'denied'
    state.value.needsChoice = false
  }

  function openModal() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-settings'))
    }
  }

  return { state, accept, refuse, openModal }
}
