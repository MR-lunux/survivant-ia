// server/utils/bpmn-generator-validation.ts
// Sanitize + validation input pour le générateur de processus BPMN.
// Borne basse 20 chars (description doit avoir au moins quelques mots),
// borne haute 4000 chars (limite tokens raisonnable côté Infomaniak).

const MIN_LENGTH = 20
const MAX_LENGTH = 4000

const HARD_INJECTION_PATTERNS = [
  /reveal (the|your) (prompt|system)/i,
  /révèle (le|ton) (prompt|système)/i,
  /print (the|your) (prompt|system)/i,
  /show (the|your) (prompt|system)/i,
  /ignore (all|the) previous instructions/i,
  /oublie toutes (les|tes) (instructions|consignes)/i,
]

export interface BpmnValidationResult {
  valid: boolean
  reason?: 'empty' | 'too_short' | 'too_long' | 'injection_attempt'
}

export function validateBpmnInput(text: string): BpmnValidationResult {
  const trimmed = text.trim()
  if (trimmed.length === 0) return { valid: false, reason: 'empty' }
  if (trimmed.length < MIN_LENGTH) return { valid: false, reason: 'too_short' }
  if (trimmed.length > MAX_LENGTH) return { valid: false, reason: 'too_long' }

  for (const pattern of HARD_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) return { valid: false, reason: 'injection_attempt' }
  }
  return { valid: true }
}

export function sanitizeBpmnInput(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}
