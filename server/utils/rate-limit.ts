// Couche 5 du garde-fou : rate limit IP-based, 10 requêtes / jour / IP.
// Compteur PARTAGÉ entre parse et transcribe (une dictée + parsing = 1 essai).

interface RateLimitEntry {
  count: number
  windowStart: number
}

const store = new Map<string, RateLimitEntry>()
const DAILY_LIMIT = 10

function getZurichMidnightMs(now = Date.now()): number {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const parts = fmt.formatToParts(new Date(now))
  const y = parts.find(p => p.type === 'year')!.value
  const m = parts.find(p => p.type === 'month')!.value
  const day = parts.find(p => p.type === 'day')!.value
  return new Date(`${y}-${m}-${day}T00:00:00+01:00`).getTime()
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const windowStart = getZurichMidnightMs(now)
  const tomorrow = windowStart + 24 * 3600 * 1000
  const entry = store.get(ip)

  if (!entry || entry.windowStart < windowStart) {
    store.set(ip, { count: 1, windowStart })
    return { allowed: true, remaining: DAILY_LIMIT - 1, resetAt: tomorrow }
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: tomorrow }
  }

  entry.count += 1
  return { allowed: true, remaining: DAILY_LIMIT - entry.count, resetAt: tomorrow }
}

// Check WITHOUT incrementing (used by transcribe-status polling)
export function peekRateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const windowStart = getZurichMidnightMs(now)
  const tomorrow = windowStart + 24 * 3600 * 1000
  const entry = store.get(ip)
  if (!entry || entry.windowStart < windowStart) {
    return { allowed: true, remaining: DAILY_LIMIT, resetAt: tomorrow }
  }
  return { allowed: entry.count < DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - entry.count), resetAt: tomorrow }
}
