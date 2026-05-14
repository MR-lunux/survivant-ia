// Per-outil CTA label for the KitCard on /outils.
// Kept out of @nuxt/content schema to avoid invalidating the prebuilt
// SQLite cache on Vercel (cf. memory/feedback_nuxt_content_schema.md).

const OVERRIDES: Record<string, string> = {
  'trc-01': 'MESURER MA RÉSILIENCE',
  'generateur-ecriture-comptable': 'TESTER GRATUITEMENT',
}

const KIND_DEFAULTS: Record<string, string> = {
  quiz: 'COMMENCER LE TEST',
  app: "OUVRIR L'OUTIL",
  cheatsheet: 'OUVRIR LA FICHE',
  fiche: 'OUVRIR LA FICHE',
  video: 'REGARDER',
  calculator: 'CALCULER',
}

export function getOutilCta(code: string, kind: string): string {
  return OVERRIDES[code] ?? KIND_DEFAULTS[kind] ?? 'OUVRIR'
}
