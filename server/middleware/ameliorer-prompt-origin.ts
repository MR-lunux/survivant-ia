// Origin allowlist for the ameliorer-prompt endpoints.
// Without this, any third-party site can have its visitors hit our
// ameliorer-prompt endpoints via cross-origin requests and burn cost
// on our Infomaniak quota.
//
// Browsers send Origin for POST (and other CORS-triggering methods)
// but typically NOT for same-origin GET. We therefore accept the
// request if EITHER Origin OR Referer points to an allowed host.
// curl / server-to-server calls send neither and get rejected.

const PROTECTED_PREFIX = '/api/ameliorer-prompt/'

const ALLOWED_HOSTS = new Set([
  'survivant-ia.ch',
  'www.survivant-ia.ch',
])

function isAllowedHost(host: string): boolean {
  if (ALLOWED_HOSTS.has(host)) return true
  if (host === 'localhost' || host.startsWith('localhost:')) return true
  if (host === '127.0.0.1' || host.startsWith('127.0.0.1:')) return true
  return false
}

function hostOf(headerValue: string): string | null {
  try {
    return new URL(headerValue).host
  } catch {
    return null
  }
}

export default defineEventHandler((event) => {
  const url = event.node.req.url ?? ''
  if (!url.startsWith(PROTECTED_PREFIX)) return

  const origin = getRequestHeader(event, 'origin')
  const referer = getRequestHeader(event, 'referer')

  const originHost = origin ? hostOf(origin) : null
  const refererHost = referer ? hostOf(referer) : null

  if (originHost && isAllowedHost(originHost)) return
  if (refererHost && isAllowedHost(refererHost)) return

  setResponseStatus(event, 403)
  return { error: 'forbidden_origin' }
})
