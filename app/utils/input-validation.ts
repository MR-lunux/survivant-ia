// Couche 1 du garde-fou : validation input texte côté client.
// Miroir de server/utils/input-validation.ts (pure functions, safe to duplicate).
// Duplication nécessaire car Nuxt 4 refuse les imports server → client en build prod.

const PROFANITY_BLOCKLIST_BASIC = [
  // FR
  'merde', 'putain', 'connard', 'salope', 'enculé', 'pute', 'bite', 'couille',
  // EN
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cunt', 'bastard',
  // racist / discriminatory
  'nigger', 'negro', 'youpin', 'bougnoule', 'pédé', 'tapette',
]

const INJECTION_PATTERNS = [
  /ignore (previous|all|the)/i,
  /oublie tes instructions/i,
  /system\s*:/i,
  /###\s/,
  /<\|/,
  /<\//,
  /jailbreak/i,
  /tu es maintenant/i,
  /you are now/i,
  /act as/i,
  /agis comme/i,
  /reveal (the|your) (prompt|system)/i,
  /révèle (le|ton) (prompt|système)/i,
]

const URL_PATTERN = /https?:\/\//i

export interface ValidationResult {
  valid: boolean
  reason?: string
}

export function validateInput(text: string): ValidationResult {
  const trimmed = text.trim()
  if (trimmed.length === 0) return { valid: false, reason: 'empty' }
  if (trimmed.length > 200) return { valid: false, reason: 'too_long' }
  if (URL_PATTERN.test(trimmed)) return { valid: false, reason: 'url_present' }

  const lower = trimmed.toLowerCase()
  for (const word of PROFANITY_BLOCKLIST_BASIC) {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(lower)) return { valid: false, reason: 'profanity' }
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) return { valid: false, reason: 'injection_attempt' }
  }

  return { valid: true }
}

export function sanitizeInput(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
