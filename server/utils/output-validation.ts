import { isValidCompte, isValidTvaRate } from './plan-comptable-pme'

// Couche 4 du garde-fou : validation server-side de la réponse Infomaniak AI
// avant retour au frontend. Si invalide → erreur générique, payload jeté.

export interface AccountingProposition {
  date: string
  libelle: string
  compteDebit: string
  compteCredit: string
  montantHT: number
  tauxTva: number
  montantTva: number
  montantTTC: number
  confidence: number
  note: string
}

export interface AiErrorResponse {
  error: 'hors_scope' | 'contenu_inapproprie' | 'manque_info'
  needed?: string[]
}

export type AiResponse = AccountingProposition | AiErrorResponse

const PROFANITY_EXTENDED = [
  'merde', 'putain', 'connard', 'salope', 'enculé', 'pute', 'bite', 'couille',
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cunt', 'bastard',
  'nigger', 'negro', 'youpin', 'bougnoule', 'pédé', 'tapette',
  'nazi', 'hitler', 'kkk', 'isis', 'islamiste', 'sioniste',
  'cocaine', 'drogue', 'héroïne',
]

const MAX_MONTANT = 1_000_000
const MIN_MONTANT = 0.05
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export interface ValidationOutcome {
  valid: boolean
  reason?: string
  data?: AiResponse
}

export function validateAiResponse(raw: unknown): ValidationOutcome {
  if (typeof raw !== 'object' || raw === null) return { valid: false, reason: 'not_object' }
  const obj = raw as Record<string, unknown>

  if ('error' in obj) {
    const err = obj.error
    if (err === 'hors_scope' || err === 'contenu_inapproprie' || err === 'manque_info') {
      return { valid: true, data: { error: err, needed: obj.needed as string[] | undefined } }
    }
    return { valid: false, reason: 'unknown_error_code' }
  }

  const required = ['date', 'libelle', 'compteDebit', 'compteCredit', 'montantHT', 'tauxTva', 'montantTva', 'montantTTC', 'confidence', 'note']
  for (const f of required) {
    if (!(f in obj)) return { valid: false, reason: `missing_field:${f}` }
  }

  if (typeof obj.date !== 'string' || !ISO_DATE_RE.test(obj.date)) return { valid: false, reason: 'bad_date_format' }
  const dateObj = new Date(obj.date)
  const now = new Date()
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000)
  if (dateObj < fiveYearsAgo || dateObj > tomorrow) return { valid: false, reason: 'date_out_of_range' }

  if (typeof obj.libelle !== 'string' || obj.libelle.length === 0 || obj.libelle.length > 120) {
    return { valid: false, reason: 'bad_libelle' }
  }
  const libelleLower = obj.libelle.toLowerCase()
  for (const word of PROFANITY_EXTENDED) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(libelleLower)) {
      return { valid: false, reason: 'libelle_profanity' }
    }
  }

  if (typeof obj.compteDebit !== 'string' || !isValidCompte(obj.compteDebit)) return { valid: false, reason: 'bad_compte_debit' }
  if (typeof obj.compteCredit !== 'string' || !isValidCompte(obj.compteCredit)) return { valid: false, reason: 'bad_compte_credit' }
  if (obj.compteDebit === obj.compteCredit) return { valid: false, reason: 'same_compte' }

  const montantHT = obj.montantHT, tauxTva = obj.tauxTva, montantTva = obj.montantTva, montantTTC = obj.montantTTC

  if (typeof montantHT !== 'number' || montantHT < MIN_MONTANT || montantHT > MAX_MONTANT) return { valid: false, reason: 'bad_montant_ht' }
  if (typeof tauxTva !== 'number' || !isValidTvaRate(tauxTva)) return { valid: false, reason: 'bad_taux_tva' }
  if (typeof montantTva !== 'number' || montantTva < 0 || montantTva > MAX_MONTANT) return { valid: false, reason: 'bad_montant_tva' }
  if (typeof montantTTC !== 'number' || montantTTC < MIN_MONTANT || montantTTC > MAX_MONTANT) return { valid: false, reason: 'bad_montant_ttc' }

  const computedTTC = montantHT * (1 + tauxTva / 100)
  if (Math.abs(computedTTC - montantTTC) > 0.05) return { valid: false, reason: 'ht_tva_ttc_incoherent' }
  if (Math.abs(montantHT + montantTva - montantTTC) > 0.05) return { valid: false, reason: 'sum_incoherent' }

  if (typeof obj.confidence !== 'number' || obj.confidence < 0 || obj.confidence > 1) return { valid: false, reason: 'bad_confidence' }
  if (typeof obj.note !== 'string') return { valid: false, reason: 'bad_note' }

  return {
    valid: true,
    data: {
      date: obj.date,
      libelle: obj.libelle,
      compteDebit: obj.compteDebit,
      compteCredit: obj.compteCredit,
      montantHT, tauxTva, montantTva, montantTTC,
      confidence: obj.confidence,
      note: obj.note,
    },
  }
}
