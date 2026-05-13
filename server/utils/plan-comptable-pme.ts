// Plan comptable PME (modèle Sterchi) — codes utilisés par le générateur d'écriture.
// Whitelist STRICTE : Infomaniak AI ne peut retourner que ces codes.

export const PLAN_COMPTABLE_PME = {
  '1020': 'Banque',
  '1100': 'Créances clients',
  '1300': 'Stock',
  '2000': 'Dettes fournisseurs',
  '2200': 'TVA due',
  '2300': 'TVA récupérable',
  '3000': 'Ventes',
  '3200': 'Services',
  '4000': 'Achats marchandises',
  '6000': 'Salaires',
  '6300': 'Charges sociales',
  '6500': 'Frais administratifs',
  '6510': 'Fournitures bureau',
  '6570': 'Frais de représentation',
  '6600': 'Charges véhicules',
  '6620': 'Leasing',
  '6700': 'Informatique',
  '6720': 'SaaS / logiciels',
  '6800': 'Marketing',
  '6900': 'Loyers',
} as const

export type CompteCode = keyof typeof PLAN_COMPTABLE_PME

export function isValidCompte(code: string): code is CompteCode {
  return code in PLAN_COMPTABLE_PME
}

export const VALID_TVA_RATES = [0, 2.6, 3.8, 8.1] as const
export type TvaRate = typeof VALID_TVA_RATES[number]

export function isValidTvaRate(rate: number): rate is TvaRate {
  return (VALID_TVA_RATES as readonly number[]).includes(rate)
}
