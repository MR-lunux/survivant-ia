// Manifest statique des outils Survivant-IA.
//
// On évite queryCollection('outils') au runtime dans les pages dynamiques
// (notamment /scanner/[slug]) parce que @nuxt/content v3 + better-sqlite3
// fait planter le native binding sur Vercel Lambda serverless.
//
// Quand un nouvel outil est ajouté dans content/outils/<slug>.md,
// il faut aussi l'ajouter ici (synchro manuelle pour v1).
// v1.1 envisageable : générer ce manifest au build via un script.
//
// ⚠️ CHECKLIST AJOUT D'UN NOUVEL OUTIL (sinon 404 en prod sur accès direct) :
//   1. content/outils/<slug>.md       — frontmatter + outro
//   2. app/data/outils-manifest.ts    — ce fichier (entrée OUTILS_MANIFEST)
//   3. app/data/outil-ctas.ts         — override CTA si voulu
//   4. app/data/outil-faqs.ts         — FAQs (clé = code)
//   5. nuxt.config.ts → nitro.prerender.routes — AJOUTER '/outils/<slug>'
//      (sinon le sitemap connaît l'URL mais Vercel ne sert pas le static
//       → 404 en accès direct ; nav interne via NuxtLink marche quand même)
//   6. app/pages/outils/[slug].vue    — wire le composant Kit<X> conditionnel
//      si l'outil est interactif (kind: 'app')

export interface OutilManifestEntry {
  code: string
  path: string
  title: string
  subtitle: string
  kind: 'quiz' | 'app' | 'cheatsheet' | 'fiche' | 'video'
  metiers: string[]
}

export const OUTILS_MANIFEST: OutilManifestEntry[] = [
  {
    code: 'generateur-ecriture-comptable',
    path: '/outils/generateur-ecriture-comptable',
    title: 'Générateur d\'écriture comptable',
    subtitle: 'Dicte ou écris une écriture, l\'IA la structure dans ton journal.',
    kind: 'app',
    metiers: ['comptable', 'expert-comptable', 'assistant-administratif'],
  },
  {
    code: 'TRC-01',
    path: '/outils/trc-01',
    title: 'Test de Résilience Cognitive',
    subtitle: '5 questions pour mesurer ta dépendance à l\'IA',
    kind: 'quiz',
    metiers: [],
  },
  {
    code: 'ameliorer-son-prompt',
    path: '/outils/ameliorer-son-prompt',
    title: 'Améliore ton prompt',
    subtitle: 'Colle ton prompt, l\'IA le restructure et te montre ce qui manquait.',
    kind: 'app',
    metiers: [],
  },
]

export function outilsForMetier(metierSlug: string): OutilManifestEntry[] {
  return OUTILS_MANIFEST.filter(o => o.metiers.includes(metierSlug))
}
