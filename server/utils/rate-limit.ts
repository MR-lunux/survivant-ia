// Rate limit IP-based, quota journalier configurable (default 10/jour).
// Store partagé Map en mémoire, namespace optionnel pour isoler les quotas
// entre outils. Window = jour calendaire Europe/Zurich.

interface RateLimitEntry {
  count: number
  windowStart: number
}

const store = new Map<string, RateLimitEntry>()

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

const DAILY_LIMIT_DEFAULT = 10

export interface RateLimitOptions {
  namespace?: string
  limit?: number
}

function storeKey(ip: string, namespace: string): string {
  return namespace ? `${namespace}::${ip}` : ip
}

export function checkRateLimit(ip: string, options: RateLimitOptions = {}): RateLimitResult {
  const namespace = options.namespace ?? ''
  const limit = options.limit ?? DAILY_LIMIT_DEFAULT
  const now = Date.now()
  const windowStart = getZurichMidnightMs(now)
  const tomorrow = windowStart + 24 * 3600 * 1000
  const key = storeKey(ip, namespace)
  const entry = store.get(key)

  if (!entry || entry.windowStart < windowStart) {
    store.set(key, { count: 1, windowStart })
    return { allowed: true, remaining: limit - 1, resetAt: tomorrow }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: tomorrow }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetAt: tomorrow }
}

// Check WITHOUT incrementing (used by transcribe-status polling)
export function peekRateLimit(ip: string, options: RateLimitOptions = {}): RateLimitResult {
  const namespace = options.namespace ?? ''
  const limit = options.limit ?? DAILY_LIMIT_DEFAULT
  const now = Date.now()
  const windowStart = getZurichMidnightMs(now)
  const tomorrow = windowStart + 24 * 3600 * 1000
  const key = storeKey(ip, namespace)
  const entry = store.get(key)
  if (!entry || entry.windowStart < windowStart) {
    return { allowed: true, remaining: limit, resetAt: tomorrow }
  }
  return { allowed: entry.count < limit, remaining: Math.max(0, limit - entry.count), resetAt: tomorrow }
}
