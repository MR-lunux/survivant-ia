// Types-only client-side mirror pour les structures de réponse Infomaniak AI.
// Pas de logique de validation côté client — celle-ci vit dans server/utils/output-validation.ts.

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
