// server/utils/ameliorer-prompt-validation.ts
// Validation input pour l'outil "Améliore ton prompt".
// Spécifique : maxLength 4000 (vs 200 pour générateur comptable),
// patterns d'injection légers (on accepte du langage naturel libre).

const MAX_LENGTH = 4000
const MIN_WORDS = 5

// On laisse les URLs passer ici (un prompt peut légitimement contenir un lien).
// Les patterns d'injection lourde sont laissés au modèle (system prompt strict).
const HARD_INJECTION_PATTERNS = [
  /reveal (the|your) (prompt|system)/i,
  /révèle (le|ton) (prompt|système)/i,
  /print (the|your) (prompt|system)/i,
  /show (the|your) (prompt|system)/i,
  /ignore (all|the) previous instructions/i,
  /oublie toutes (les|tes) (instructions|consignes)/i,
]

export interface AmeliorerValidationResult {
  valid: boolean
  reason?: 'empty' | 'too_short' | 'too_long' | 'injection_attempt'
}

export function validateAmeliorerInput(text: string): AmeliorerValidationResult {
  const trimmed = text.trim()
  if (trimmed.length === 0) return { valid: false, reason: 'empty' }
  if (trimmed.length > MAX_LENGTH) return { valid: false, reason: 'too_long' }

  const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length
  if (wordCount < MIN_WORDS) return { valid: false, reason: 'too_short' }

  for (const pattern of HARD_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) return { valid: false, reason: 'injection_attempt' }
  }

  return { valid: true }
}

export function sanitizeAmeliorerInput(text: string): string {
  // Strip control chars, collapse triple-newlines, trim.
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}
