// Origin allowlist for the generateur-ecriture-comptable endpoints.
// Without this, any third-party site can have its visitors hit our
// parse/transcribe endpoints via cross-origin POST and burn cost on
// our Infomaniak quota. The browser will send their Origin header;
// we reject anything that isn't survivant-ia.ch (or localhost in dev).

const PROTECTED_PREFIX = '/api/generateur-ecriture-comptable/'

const ALLOWED_ORIGINS = new Set([
  'https://survivant-ia.ch',
  'https://www.survivant-ia.ch',
])

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true
  // dev: localhost on any port + http or https
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true
  return false
}

export default defineEventHandler((event) => {
  const url = event.node.req.url ?? ''
  if (!url.startsWith(PROTECTED_PREFIX)) return

  const origin = getRequestHeader(event, 'origin') ?? ''
  if (!origin) {
    // A POST/GET from a browser via fetch always carries an Origin
    // header. Missing Origin means it's a non-browser caller (curl,
    // server-to-server, scraper). We block to prevent cost burn.
    setResponseStatus(event, 403)
    return { error: 'forbidden_origin' }
  }
  if (!isAllowedOrigin(origin)) {
    setResponseStatus(event, 403)
    return { error: 'forbidden_origin' }
  }
})
