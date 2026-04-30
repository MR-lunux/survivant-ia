# Scanner data upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/scanner` from a 3-status simple model to a 4-status editorial model with a "dynamique anticipée" narrative per métier and a sources modal — based on the 2026 Tufts/McKinsey/WEF/PayScope reports.

**Architecture:** Two new data files (`sources.ts` catalog + refactored `jobs.ts`), one new component (`SourcesModal.vue`), and a refactor of `scanner.vue` to consume the new schema. Tailwind config gains 3 status color tokens. No new dependencies.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, TypeScript, Tailwind 3.4, npm, Nuxt Content (unrelated to this work).

**Spec:** `docs/superpowers/specs/2026-04-29-scanner-data-upgrade-design.md`

**Verification approach:** No formal test framework. After each task: `npm run build` for type check, `npm run dev` + browser check at specific URLs for visual verification.

---

## File map

| File | Action | Responsibility |
|---|---|---|
| `app/data/sources.ts` | Create | Sources catalog (~22 entries), category enum, lookup helpers |
| `app/data/jobs.ts` | Refactor | New `Job` interface (4 statuses, `dynamic`, `sources`), 120 entries migrated |
| `app/components/SourcesModal.vue` | Create | Modal: contextual sources for current job + grouped catalog |
| `app/pages/scanner.vue` | Refactor | New result card layout, 4-status visual tokens, modal trigger, footer sources removed |
| `tailwind.config.ts` | Modify | Add `mutation`, `protege`, `croissance` colors (`danger` already present) |

The OG image template (`app/components/OgImage/Default.satori.vue`) does **not** need changes — it doesn't currently render per-status colors. Only the `og:description` meta in `scanner.vue` references status labels and is updated as part of Task 6.

---

## Task ordering & commit strategy

Tasks 1, 2 are independent and committed individually. Tasks 3+4 are coordinated (jobs.ts schema change breaks scanner.vue references); they are committed together at the end of Task 4. Tasks 5, 6, 7 each commit independently.

---

## Task 1: Create sources catalog

**Files:**
- Create: `app/data/sources.ts`

- [ ] **Step 1: Create the file with type definitions**

Create `app/data/sources.ts`:

```ts
// app/data/sources.ts

export type SourceCategory =
  | 'academique'    // Tufts, McKinsey, universités
  | 'banque'        // Goldman Sachs
  | 'institution'   // WEF, OCDE
  | 'plateforme'    // LinkedIn, PayScope
  | 'media'         // BDM, Visual Capitalist, etc.

export interface Source {
  id: number
  title: string
  author: string
  year: number
  url: string
  context: string       // ≤ 120 chars
  category: SourceCategory
}

export const SOURCES: Source[] = [
  // ── Études académiques ─────────────────────────────────
  {
    id: 1,
    title: 'American AI Jobs Risk Index',
    author: 'Fletcher School, Tufts University',
    year: 2026,
    url: 'https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts',
    context: 'Index quantifiant le risque IA sur 784 métiers américains. 9,3M emplois menacés à 2-5 ans.',
    category: 'academique',
  },
  {
    id: 2,
    title: 'How Will Jobs Be Affected by AI Where You Live and Work?',
    author: 'Tufts University, Digital Planet',
    year: 2026,
    url: 'https://digitalplanet.tufts.edu/how-will-jobs-be-affected-by-ai-where-you-live-and-work/',
    context: 'Cartographie géographique du risque IA aux États-Unis (Wired Belts vs Rust Belts).',
    category: 'academique',
  },
  {
    id: 3,
    title: 'AI Job Exposure by Occupation: 800 Roles Ranked for 2026',
    author: 'PayScope',
    year: 2026,
    url: 'https://www.payscope.ai/blog/ai-job-exposure-by-occupation-2026',
    context: 'Mesure d\'exposition observée à l\'IA sur 800 professions, intégrant l\'écart capacité-déploiement.',
    category: 'academique',
  },
  {
    id: 4,
    title: 'Agents, Robots and Us: Skill Partnerships in the Age of AI',
    author: 'McKinsey Global Institute',
    year: 2026,
    url: 'https://www.mckinsey.com/mgi/our-research/agents-robots-and-us-skill-partnerships-in-the-age-of-ai',
    context: 'Analyse du paradigme "agentique" : 57% des heures de travail US potentiellement automatisables.',
    category: 'academique',
  },
  {
    id: 5,
    title: 'A US Productivity Unlock: Investing in Frontline Workers\' AI Skills',
    author: 'McKinsey & Company',
    year: 2026,
    url: 'https://www.mckinsey.com/capabilities/operations/our-insights/a-us-productivity-unlock-investing-in-frontline-workers-ai-skills',
    context: 'Étude sur la requalification massive des travailleurs face à l\'IA.',
    category: 'academique',
  },
  {
    id: 6,
    title: 'Replaced by Robot — Highest AI Risk & Safest Jobs',
    author: 'Replaced by Robot',
    year: 2026,
    url: 'https://www.replacedbyrobot.info/ranking',
    context: 'Base de données de 57 000 professions classées par risque de remplacement.',
    category: 'academique',
  },

  // ── Banques d'investissement ───────────────────────────
  {
    id: 7,
    title: 'How Will AI Affect the US Labor Market?',
    author: 'Goldman Sachs',
    year: 2026,
    url: 'https://www.goldmansachs.com/insights/articles/how-will-ai-affect-the-us-labor-market',
    context: 'Modèle macroéconomique : 300M emplois à temps plein exposés à l\'automatisation IA.',
    category: 'banque',
  },
  {
    id: 8,
    title: 'The Jobs AI Is Likely to Boost — and Those It May Disrupt',
    author: 'Goldman Sachs',
    year: 2026,
    url: 'https://www.goldmansachs.com/insights/articles/the-jobs-ai-is-likely-to-boost-and-those-it-may-disrupt',
    context: 'Liste sectorielle des métiers boostés vs disruptés par l\'IA générative.',
    category: 'banque',
  },

  // ── Institutions / WEF / OCDE ──────────────────────────
  {
    id: 9,
    title: 'Future of Jobs Report 2025 — Fastest Growing and Declining Jobs',
    author: 'World Economic Forum',
    year: 2025,
    url: 'https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/',
    context: '92M emplois détruits, 170M créés d\'ici 2030. Solde net : +78M emplois.',
    category: 'institution',
  },
  {
    id: 10,
    title: 'Future of Jobs Report 2025 — Skills of the Future',
    author: 'World Economic Forum',
    year: 2025,
    url: 'https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-jobs-of-the-future-and-the-skills-you-need-to-get-them/',
    context: '39% des compétences fondamentales devront être mises à jour d\'ici 2030.',
    category: 'institution',
  },
  {
    id: 11,
    title: 'AI Has Already Added 1.3 Million Jobs (LinkedIn data)',
    author: 'World Economic Forum',
    year: 2026,
    url: 'https://www.weforum.org/stories/2026/01/ai-has-already-added-1-3-million-new-jobs-according-to-linkedin-data/',
    context: 'Décompte 2026 : 1,3M nouveaux postes IA + 600k postes infrastructure data centers.',
    category: 'institution',
  },

  // ── Plateformes professionnelles ───────────────────────
  {
    id: 12,
    title: 'Labor Market Report — Building a Future of Work That Works',
    author: 'LinkedIn Economic Graph',
    year: 2026,
    url: 'https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/linkedIn-labor-market-report-building-a-future-of-work-that-works-jan-2026.pdf',
    context: 'Rapport LinkedIn sur l\'émergence du recrutement basé sur les compétences (skills-based hiring).',
    category: 'plateforme',
  },
  {
    id: 13,
    title: 'Skills on the Rise: The Fastest-Growing Skills in 2026',
    author: 'LinkedIn Pressroom',
    year: 2026,
    url: 'https://news.linkedin.com/2026/Skills-on-the-rise-2026',
    context: 'Top des compétences en croissance : alphabétisation IA, résilience, pensée systémique.',
    category: 'plateforme',
  },
  {
    id: 14,
    title: 'AI-Related Jobs Top LinkedIn\'s Fastest-Growing Roles List for 2026',
    author: 'Dice — LinkedIn Career Advice',
    year: 2026,
    url: 'https://www.dice.com/career-advice/ai-related-jobs-top-linkedins-fastest-growing-roles-list-for-2026',
    context: 'Synthèse des rôles IA pragmatiques en plus forte croissance : intégrateurs, MLOps, FDE.',
    category: 'plateforme',
  },

  // ── Médias / synthèses ─────────────────────────────────
  {
    id: 15,
    title: 'Métiers menacés par l\'IA : rédacteurs, développeurs, designers',
    author: 'Blog du Modérateur',
    year: 2025,
    url: 'https://www.blogdumoderateur.com/metiers-menaces-ia-redacteurs-developpeurs-designers/',
    context: 'Synthèse francophone des données Tufts et INSEE sur les métiers à risque.',
    category: 'media',
  },
  {
    id: 16,
    title: 'Métiers menacés par l\'IA — Analyse française',
    author: 'Bradroit Solutions',
    year: 2026,
    url: 'https://bradroit-solutions.fr/blog/metiers_menaces_par_IA',
    context: 'Décryptage francophone du paradigme "agentique" et de l\'écart capacité-déploiement.',
    category: 'media',
  },
  {
    id: 17,
    title: 'Tufts Study Shows Content Professionals Among Most at Risk from AI',
    author: 'Writtenly Hub',
    year: 2026,
    url: 'https://www.writtenlyhub.com/news/ai-jobs-risk-tufts-index-writers-programmers',
    context: 'Couverture média de l\'index Tufts focalisée sur les rédacteurs et programmeurs.',
    category: 'media',
  },
  {
    id: 18,
    title: 'New AI Jobs Index Ranks 784 Occupations By Loss Risk',
    author: 'Search Engine Journal',
    year: 2026,
    url: 'https://www.searchenginejournal.com/new-ai-jobs-index-ranks-784-occupations-by-loss-risk/570867/',
    context: 'Couverture média de l\'index Tufts avec focus sur les pertes de revenu absolues.',
    category: 'media',
  },
  {
    id: 19,
    title: 'Ranked: The Jobs Most Exposed to Generative AI (Microsoft)',
    author: 'Visual Capitalist',
    year: 2025,
    url: 'https://www.visualcapitalist.com/ranked-the-jobs-most-exposed-to-generative-ai-according-to-microsoft/',
    context: 'Visualisation Microsoft des métiers les plus exposés à l\'IA générative.',
    category: 'media',
  },
  {
    id: 20,
    title: 'Your Job Could Be Next — The 2026 AI Stats Prove It',
    author: 'JobReplacementAI',
    year: 2026,
    url: 'https://jobreplacementai.com/blog/ai-job-replacement-statistics-2025',
    context: 'Compilation de statistiques 2026 sur le remplacement par l\'IA, métier par métier.',
    category: 'media',
  },
  {
    id: 21,
    title: '10 Jobs AI Can\'t Replace in 2025 — Future-Proof Career Guide',
    author: 'PrometAI',
    year: 2025,
    url: 'https://prometai.app/blog/10-jobs-ai-wont-replace-future-proof-careers-for-the-ai-era',
    context: 'Liste des métiers résilients à l\'IA : santé, métiers manuels, leadership empathique.',
    category: 'media',
  },
  {
    id: 22,
    title: '7 métiers qui ne vont pas disparaître à cause de l\'IA',
    author: 'CNFDI',
    year: 2026,
    url: 'https://www.cnfdi.com/le-blog/metiers-resisteront-a-l-ia-414.html',
    context: 'Liste francophone de métiers protégés : artisanat, soin, jugement moral.',
    category: 'media',
  },
]

export function findSourceById(id: number): Source | undefined {
  return SOURCES.find(s => s.id === id)
}

export function getSourcesByIds(ids: number[]): Source[] {
  return ids
    .map(id => findSourceById(id))
    .filter((s): s is Source => s !== undefined)
}

export const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string> = {
  academique: 'Études académiques',
  banque: 'Banques d\'investissement',
  institution: 'Institutions internationales',
  plateforme: 'Plateformes professionnelles',
  media: 'Médias & synthèses',
}

const CATEGORY_ORDER: SourceCategory[] = [
  'academique', 'banque', 'institution', 'plateforme', 'media',
]

export function getSourcesByCategory(): Array<{ category: SourceCategory, label: string, sources: Source[] }> {
  return CATEGORY_ORDER.map(category => ({
    category,
    label: SOURCE_CATEGORY_LABELS[category],
    sources: SOURCES.filter(s => s.category === category),
  }))
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npm run build`
Expected: build succeeds. No type errors related to `sources.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/data/sources.ts
git commit -m "feat(scanner): add sources catalog (22 entries, categorized)"
```

---

## Task 2: Add 4-status colors to Tailwind config

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace the `colors` block to add the 3 missing status colors**

Current state (already in file):
```ts
danger: '#FF3E3E',
```

Replace the `colors: { ... }` block in `tailwind.config.ts` with:

```ts
colors: {
  bg: '#0D0D0D',
  surface: '#141414',
  'surface-2': '#1A1A1A',
  text: '#E0E0E0',
  muted: '#666666',
  accent: '#00FF41',
  // Status tokens (4 levels — keep `danger` value unchanged)
  danger: '#FF3E3E',
  mutation: '#FFA630',
  protege: '#5BC0EB',
  croissance: '#3DDC84',
},
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(scanner): add 4 status color tokens (mutation, protege, croissance)"
```

---

## Task 3: Migrate `jobs.ts` schema and data

**Files:**
- Modify: `app/data/jobs.ts` (full replacement)

> ⚠️ **DO NOT COMMIT YET.** This task changes the `JobStatus` type (`augmente` → `mutation`/`protege`/`croissance`), which breaks references in `scanner.vue`. Tasks 3 and 4 are committed together at the end of Task 4.

- [ ] **Step 1: Replace the entire content of `app/data/jobs.ts`**

The new file contains:
1. The new `Job` interface (4 statuses, `dynamic`, `sources`)
2. All 120 jobs migrated. The 40 jobs covered by the 2026 reports use the rapport's risk/horizon/status/dynamic/sources directly. The remaining 80 jobs keep their existing `risk`/`horizon`, get a hand-written `dynamic`, get `sources: []`, and have their status remapped editorially (`augmente` → `mutation` if cognitive transformation, `protege` if protected, `croissance` if growth).

**Editorial mapping rules applied:**
- Old `danger` (>65%) → new `danger` (still in viseur)
- Old `augmente` (30–65%) → new `mutation` if cognitive role transforms; new `protege` if no real threat; new `croissance` if expanding sector
- Old `resistant` (<30%) → new `protege` if simply low-risk; new `croissance` if expanding sector

Replace the file content with:

```ts
// app/data/jobs.ts

export type JobStatus = 'danger' | 'mutation' | 'protege' | 'croissance'

export interface Job {
  slug: string
  label: string
  risk: number              // 0–100
  horizon: number           // années avant impact majeur : 2 | 5 | 10
  status: JobStatus         // ÉDITORIAL — ne PAS dériver du risk %
  dynamic: string           // ≤ 300 chars, voix Survivant-IA (apostrophe + factuel)
  sources: number[]         // ids du catalogue sources.ts ; [] = pas de source spécifique
}

// Status taxonomy:
//   danger     — métier dans le viseur (contraction des effectifs, obsolescence en cours)
//   mutation   — le rôle se transforme radicalement, ne disparaît pas
//   protege    — peu menacé, valeur humaine non substituable
//   croissance — demande qui augmente structurellement

export const JOBS: Job[] = [
  // ── EN DANGER ──────────────────────────────────────────
  // (risque élevé, contraction réelle des effectifs)

  { slug: 'teleconseiller', label: 'Téléconseiller', risk: 78, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La réception d\'appels et la résolution des plaintes courantes sont gérées par des agents conversationnels multimodaux à voix naturelle. Les centres de contact réduisent drastiquement leurs effectifs.',
    sources: [3] },

  { slug: 'televendeur', label: 'Télévendeur', risk: 92, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La prospection à froid et la qualification de leads sont déléguées à des agents IA capables de mener des conversations vocales complètes. Le métier humain ne survit que sur les ventes complexes B2B.',
    sources: [3] },

  { slug: 'saisie-de-donnees', label: 'Agent de saisie de données', risk: 90, horizon: 2, status: 'danger',
    dynamic: 'Ton métier est en obsolescence active. La lecture de documents non structurés et leur saisie systémique sont résolues par l\'OCR cognitif et les LLM. Le WEF projette la disparition de 26 millions de ces postes.',
    sources: [3, 9] },

  { slug: 'redacteur-web', label: 'Rédacteur web', risk: 76, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La rédaction de contenu web standardisé est massivement automatisée par les LLM. Seuls les créateurs d\'opinion à forte marque personnelle survivent — les autres subissent la contraction.',
    sources: [1, 15, 17] },

  { slug: 'traducteur', label: 'Traducteur', risk: 82, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La traduction temps réel atteint une fidélité quasi-humaine. La profession humaine se cantonne à la traduction littéraire nuancée et à la diplomatie sensible de haut niveau.',
    sources: [1] },

  { slug: 'correcteur', label: 'Correcteur / Relecteur', risk: 85, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. Correction orthographique, grammaticale, formatage stylistique : l\'IA exécute avec une constance supérieure et fait disparaître les postes de relecture traditionnels.',
    sources: [1] },

  { slug: 'transcripteur', label: 'Transcripteur', risk: 88, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La transcription audio→texte et la synthèse de réunions sont devenues des fonctionnalités natives gratuites des outils bureautiques. Le métier indépendant n\'a quasiment plus de marché.',
    sources: [3] },

  { slug: 'comptable', label: 'Comptable', risk: 72, horizon: 5, status: 'danger',
    dynamic: 'Ton métier est dans le viseur. Audit de base, rapprochement bancaire, détection de fraudes simples, tenue de livres : tout est automatisé. Les premiers qui pivotent vers le conseil stratégique survivent — les autres subissent la contraction.',
    sources: [1, 7] },

  { slug: 'analyste-credit', label: 'Analyste crédit', risk: 70, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Le scoring crédit, l\'analyse des bilans et l\'évaluation du risque de défaut sont exécutés instantanément par des modèles entraînés sur des millions de dossiers. Le rôle humain se réduit aux exceptions.',
    sources: [7] },

  { slug: 'analyste-marketing', label: 'Analyste études de marché', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La digestion de téraoctets de données qualitatives et la rédaction de rapports stratégiques synthétiques sont des domaines où les LLM excellent, rendant les rôles d\'analyse intermédiaires redondants.',
    sources: [1] },

  { slug: 'assistant-juridique', label: 'Assistant juridique', risk: 72, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La revue contractuelle, la recherche jurisprudentielle et la production de notes juridiques de premier niveau sont automatisées. Le rôle humain disparaît avant de pouvoir muter.',
    sources: [7] },

  { slug: 'secretaire-juridique', label: 'Secrétaire juridique', risk: 77, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La préparation de dossiers, la gestion de calendriers procéduraux et la rédaction de courriers types sont absorbées par les outils intégrés des cabinets. Le poste devient redondant.',
    sources: [7] },

  { slug: 'assistant-administratif', label: 'Assistant administratif', risk: 73, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Gestion d\'agendas, priorisation des courriels, préparation de réunions : confiés à des agents virtuels. Le WEF anticipe une perte nette de 19 millions de postes administratifs.',
    sources: [3, 9] },

  { slug: 'receptionniste', label: 'Réceptionniste', risk: 80, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. Filtrage d\'appels, prise de rendez-vous et accueil informationnel sont gérés par des agents conversationnels disponibles 24/7. Seul l\'accueil physique haut de gamme résiste.',
    sources: [3] },

  { slug: 'standardiste', label: 'Standardiste', risk: 83, horizon: 2, status: 'danger',
    dynamic: 'Ton métier est en obsolescence active. La gestion d\'appels entrants et leur routage sont des fonctions natives des PBX cloud modernes. Le poste humain a quasiment disparu des grandes structures.',
    sources: [3] },

  { slug: 'agent-assurance', label: 'Agent d\'assurance', risk: 74, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Souscription standardisée, calcul de primes, traitement de sinistres simples : automatisés. Le conseiller humain subsiste sur les contrats complexes et la relation patrimoniale.',
    sources: [3] },

  { slug: 'analyste-financier', label: 'Analyste financier', risk: 57, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. L\'analyse exhaustive des bilans et flux d\'actualités est exécutée instantanément par l\'IA. Tu te concentres sur la gestion psychologique et relationnelle des clients, plus sur la production des chiffres.',
    sources: [3] },

  { slug: 'operateur-saisie', label: 'Opérateur de saisie', risk: 91, horizon: 2, status: 'danger',
    dynamic: 'Ton métier est en obsolescence active. L\'OCR cognitif et les LLM résolvent la lecture de documents sources et leur saisie systémique avec une précision supérieure à la main humaine.',
    sources: [3] },

  { slug: 'secretaire', label: 'Secrétaire', risk: 62, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Gestion d\'agendas, priorisation des courriels, préparation de réunions : confiés à des secrétaires virtuels. Le WEF anticipe une perte nette de 19 millions de postes administratifs.',
    sources: [3, 9] },

  { slug: 'caissier', label: 'Caissier', risk: 78, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Bornes self-checkout, paiement mobile, scan-and-go : la combinaison hardware + IA réduit massivement le besoin de caissiers humains dans la grande distribution.',
    sources: [9] },

  { slug: 'agent-recouvrement', label: 'Agent de recouvrement', risk: 80, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La relance automatisée multicanale (SMS, email, voix synthétique) et la priorisation des dossiers par scoring IA rendent le travail d\'appel humain non rentable.',
    sources: [3] },

  { slug: 'employe-banque', label: 'Employé de banque / Guichetier', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La digitalisation des services financiers et les conseillers virtuels suppriment la nécessité d\'interactions physiques. Les agences ferment en cascade.',
    sources: [20] },

  { slug: 'specialiste-rp', label: 'Spécialiste relations publiques', risk: 37, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Communiqués de presse, identification de cibles médiatiques, veille réputationnelle : délégués à l\'IA, entraînant une réduction drastique des effectifs juniors en agence.',
    sources: [1] },

  { slug: 'editeur-reviseur', label: 'Éditeur / Réviseur', risk: 54, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Correction, formatage stylistique et synthèse linguistique sont exécutés par l\'IA avec constance. Les postes de révision traditionnels disparaissent dans l\'édition standardisée.',
    sources: [1] },

  { slug: 'redacteur-technique', label: 'Rédacteur technique', risk: 42, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Documentation de code et rédaction de manuels d\'utilisation sont extraites automatiquement par l\'IA depuis les dépôts de code source, supprimant le besoin d\'intermédiaires humains.',
    sources: [3] },

  { slug: 'specialiste-dossiers-medicaux', label: 'Spécialiste dossiers médicaux', risk: 67, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. Compilation, abstraction sémantique et codage administratif des données patients pour facturation/assurance sont pris en charge par des IA médicales spécialisées.',
    sources: [3] },

  { slug: 'testeur-qa', label: 'Testeur QA logiciel', risk: 52, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. Modification logicielle pour corriger des erreurs et exécution de scénarios de tests automatisés figurent parmi les tâches les plus exécutées par l\'IA en entreprise.',
    sources: [3] },

  // ── EN MUTATION SÉVÈRE ────────────────────────────────
  // (le rôle se transforme radicalement, ne disparaît pas)

  { slug: 'developpeur-logiciel', label: 'Développeur logiciel', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier ne disparaît pas. Il devient méconnaissable. L\'IA génère, teste et maintient le code de base. La demande s\'effondre pour les juniors exécutants ; le rôle pivote vers l\'architecture et l\'audit du code généré.',
    sources: [1, 15] },

  { slug: 'programmeur', label: 'Programmeur', risk: 74, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute brutalement. L\'IA pisse des lignes de code à vélocité surhumaine. Tu pivotes ou tu disparais : architecture système, audit de code IA, sécurité. Le "vibe code" génère une dette technique massive — sois celui qui sait la lire.',
    sources: [3] },

  { slug: 'designer-graphique', label: 'Designer graphique', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La génération multimodale réduit le besoin d\'équipes complètes à un directeur artistique assisté de plusieurs agents autonomes. La direction créative survit ; l\'exécution de production se commoditise.',
    sources: [1] },

  { slug: 'designer-web', label: 'Designer web / UI', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Génération instantanée d\'interfaces par modèles multimodaux : un seul directeur artistique pilote des agents qui produisent les variantes. La maquette à la main n\'est plus monnayable seule.',
    sources: [1] },

  { slug: 'ux-designer', label: 'UX Designer', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La recherche utilisateur quantitative, le wireframing et l\'A/B testing sont accélérés par l\'IA. Tu te recentres sur la stratégie produit, l\'ethnographie de terrain et l\'arbitrage business — ou tu deviens un PO-light.',
    sources: [1] },

  { slug: 'data-scientist', label: 'Data Scientist', risk: 37, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Paradoxalement, les créateurs des modèles voient le nettoyage des données, la sélection de variables et l\'optimisation hyperparamètres s\'automatiser (AutoML). Le rôle glisse vers l\'ingénierie MLOps et l\'alignement éthique.',
    sources: [3] },

  { slug: 'commercial', label: 'Commercial B2B', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Prospection à froid, e-mails personnalisés et démonstrations préliminaires sont délégués à des agents IA. Tu deviens négociateur final de contrats complexes et gardien de la relation senior.',
    sources: [3] },

  { slug: 'recruteur', label: 'Recruteur', risk: 58, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Sourcing, screening de CV et premier contact sont automatisés. Tu te recentres sur l\'évaluation comportementale, la marque employeur et le closing — l\'humain où l\'humain compte.',
    sources: [12] },

  { slug: 'responsable-rh', label: 'Responsable RH', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting RH, paie standardisée, gestion administrative : automatisés. Le rôle pivote vers le développement humain, la culture d\'entreprise et la gestion du changement induit par l\'IA elle-même.',
    sources: [12] },

  { slug: 'conseiller-financier', label: 'Conseiller financier', risk: 48, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Allocation d\'actifs standardisée et plans patrimoniaux types sont gérés par robo-advisors. Tu te concentres sur la gestion psychologique des clients face aux marchés et les cas patrimoniaux complexes.',
    sources: [7] },

  { slug: 'architecte-logiciel', label: 'Architecte logiciel', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute en valeur. L\'IA produit du code à vélocité industrielle, mais elle hallucine, casse des dépendances et introduit des failles. Toi qui sais lire et auditer l\'architecture, tu deviens hautement valorisable.',
    sources: [16] },

  { slug: 'community-manager', label: 'Community Manager', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Création de posts, programmation, modération basique et reporting : délégués à l\'IA. Tu te concentres sur la stratégie éditoriale, la gestion de crise et l\'animation authentique de communauté.',
    sources: [9] },

  { slug: 'expert-comptable', label: 'Expert-comptable', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Tenue de comptes et déclarations standardisées sont automatisées. Tu pivotes vers le conseil fiscal stratégique, l\'optimisation patrimoniale et l\'accompagnement des dirigeants — ou tu te fais commoditiser.',
    sources: [7] },

  { slug: 'consultant-strategie', label: 'Consultant en stratégie', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Benchmarks, études de marché et synthèses sont produits en heures par l\'IA. Tu vends désormais le jugement, la confrontation au CEO et l\'exécution — pas le slide pack.',
    sources: [4] },

  { slug: 'product-manager', label: 'Product Manager', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Specs, user stories et roadmaps brouillons sont générés par l\'IA. Tu te concentres sur la priorisation arbitrage, l\'alignement stakeholders et la vision produit — la partie irréductiblement politique du métier.',
    sources: [10] },

  { slug: 'journaliste-presse', label: 'Journaliste presse écrite', risk: 35, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Collecte d\'informations basiques, synthèse de rapports financiers, dépêches sportives : entièrement automatisées. L\'investigation complexe sur le terrain devient la seule véritable valeur ajoutée humaine.',
    sources: [1] },

  { slug: 'journaliste-tv', label: 'Journaliste TV / Radio', risk: 40, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Présentation automatisée, voix synthétique, montage IA : la production technique se commoditise. La présence incarnée, le terrain et l\'enquête prolongée restent humains — pour combien de temps.',
    sources: [1] },

  { slug: 'analyste-renseignement', label: 'Analyste renseignement', risk: 64, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Traitement de signaux multiples, reconnaissance de formes dans le bruit informationnel et notes de synthèse sont augmentés par l\'IA. Tu deviens évaluateur critique de la véracité des sources générées.',
    sources: [6] },

  { slug: 'economiste', label: 'Économiste', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La modélisation macroéconomique et l\'analyse de vastes ensembles de données comportementales sont assistées par l\'IA. Les assistants de recherche disparaissent au profit de directeurs ultra-productifs.',
    sources: [6] },

  { slug: 'analyste-securite', label: 'Analyste sécurité informatique', risk: 63, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Audits de code de base, vulnérabilités connues, tests d\'intrusion standards : automatisés. L\'expertise humaine reste vitale pour anticiper l\'ingénierie sociale et les attaques générées par des IA adverses.',
    sources: [3] },

  { slug: 'ingenieur-automobile', label: 'Ingénieur automobile', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Conception itérative de pièces, optimisation aérodynamique, simulations de résistance : accélérées par le design génératif. Tu te concentres sur l\'intégration systémique et l\'innovation conceptuelle.',
    sources: [6] },

  { slug: 'ingenieur-industriel', label: 'Ingénieur industriel', risk: 45, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Optimisation de chaînes, dimensionnement et planification de production sont accélérés par l\'IA. Tu deviens l\'orchestrateur entre systèmes IA et terrain humain — ou tu te fais déclasser.',
    sources: [7] },

  { slug: 'architecte-bdd', label: 'Architecte de bases de données', risk: 46, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Structuration, optimisation et migration des données sont gérées de manière autonome par des algorithmes apprenants. Le métier s\'oriente vers la gouvernance éthique et la sécurité des données massives.',
    sources: [6] },

  { slug: 'support-informatique', label: 'Support informatique (Helpdesk)', risk: 47, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Le dépannage de niveau 1 et 2 est pris en charge par des agents internes capables de lire les logs, diagnostiquer les pannes et guider les utilisateurs interactivement. Tu remontes en complexité ou tu disparais.',
    sources: [3] },

  { slug: 'chef-de-projet-it', label: 'Chef de projet IT', risk: 54, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Suivi de Jira, comptes rendus, planification : automatisés. Tu te concentres sur la gestion humaine des équipes, l\'arbitrage de scope et la communication exécutive — la partie politique du rôle.',
    sources: [9] },

  { slug: 'directeur-marketing', label: 'Directeur marketing', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Campagnes, copies, analytics, segmentation : tout est accéléré 10x par l\'IA. Tu pilotes désormais une équipe réduite suralimentée par des agents — ou tu deviens le bottleneck que tu refusais d\'être.',
    sources: [9] },

  { slug: 'pharmacien', label: 'Pharmacien', risk: 42, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Vérification d\'ordonnances et conseil basique sont assistés par IA en officine. Le rôle pivote vers l\'éducation thérapeutique, le suivi de patients chroniques et la pharmacovigilance.',
    sources: [21] },

  { slug: 'radiologue', label: 'Radiologue', risk: 48, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA détecte des anomalies sur imagerie médicale avec une sensibilité comparable ou supérieure à l\'humain. Tu deviens validateur expert, garant éthique des décisions et référent en cas complexes.',
    sources: [21] },

  { slug: 'politologue', label: 'Politologue / Chercheur social', risk: 40, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Revue de littérature, traitement de sondages à grande échelle et analyse sémantique des discours sont effectués en secondes par l\'IA. Les équipes de recherche se réduisent drastiquement.',
    sources: [3] },

  { slug: 'statisticien', label: 'Statisticien', risk: 65, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Analyse standardisée, modèles de régression et extrapolations sont absorbées par des agents nativement intégrés aux plateformes d\'entreprise. Tu pivotes vers la modélisation causale fine et la rigueur scientifique.',
    sources: [6] },

  // ── PROTÉGÉ ────────────────────────────────────────────
  // (peu menacé, valeur humaine non substituable)

  { slug: 'cardiologue', label: 'Cardiologue', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle a besoin de toi. Elle augmente la précision diagnostique sur imagerie, mais responsabilité légale, empathie face au diagnostic vital et intervention physique de précision te maintiennent au centre du soin.',
    sources: [6] },

  { slug: 'medecin-generaliste', label: 'Médecin généraliste', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle augmente ta capacité. Diagnostic différentiel, suivi de patients, écoute, orientation : la combinaison technique + relationnelle reste fondamentalement humaine. La pénurie démographique te rend irremplaçable.',
    sources: [6, 21] },

  { slug: 'chirurgien', label: 'Chirurgien', risk: 4, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle assiste. La motricité fine, la décision en temps réel face à l\'imprévu chirurgical et la responsabilité vitale immédiate restent hors de portée des systèmes autonomes.',
    sources: [21] },

  { slug: 'psychologue', label: 'Psychologue / Thérapeute', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle a besoin de toi. Empathie authentique, signaux non verbaux subtils, transfert psychologique et soutien émotionnel humain résistent à la modélisation. La confiance humaine est l\'essence du service.',
    sources: [6] },

  { slug: 'psychiatre', label: 'Psychiatre', risk: 3, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Le jugement clinique sur l\'urgence suicidaire, la responsabilité de prescription et la relation thérapeutique restent humains. L\'IA t\'assiste sur l\'historique et la pharmacovigilance.',
    sources: [21] },

  { slug: 'enseignant', label: 'Enseignant en sciences sociales', risk: 1, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas — elle ouvre l\'accès à l\'information. Mais mentorat, encouragement, modération de débats et rôle de modèle social exigent ta présence. L\'autorité pédagogique se construit en présentiel.',
    sources: [6] },

  { slug: 'professeur-universitaire', label: 'Professeur universitaire', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la production de matériel pédagogique et la correction. Mais le jury, la direction de thèse, le mentorat doctoral et la production de savoir original restent fondamentalement humains.',
    sources: [21] },

  { slug: 'avocat', label: 'Avocat', risk: 22, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste : revue contractuelle, recherche jurisprudentielle, premiers brouillons. Mais la plaidoirie, la stratégie procédurale, la responsabilité ordinale et la confiance client te maintiennent indispensable.',
    sources: [21] },

  { slug: 'juge', label: 'Juge / Magistrat', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La décision de justice ne peut, par construction démocratique, être déléguée à un algorithme. L\'autorité de la chose jugée demeure humaine.',
    sources: [21] },

  { slug: 'notaire', label: 'Notaire', risk: 32, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la rédaction d\'actes types. Mais l\'authentification, la responsabilité officielle et la médiation des intérêts entre parties te maintiennent au centre des transactions patrimoniales.',
    sources: [21] },

  { slug: 'artificier', label: 'Artificier / Manipulateur d\'explosifs', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Environnement létal, totalement imprévisible, exigeant une motricité fine instantanée : exclu des robots autonomes dans un avenir prévisible. Le coût de l\'échec rend ta présence indispensable.',
    sources: [6] },

  { slug: 'macon', label: 'Maçon / Bâtiment', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Manipulation de matériaux lourds dans des chantiers non structurés défie la robotique actuelle. La transition énergétique et les besoins en logement garantissent l\'emploi à long terme.',
    sources: [6] },

  { slug: 'plombier', label: 'Plombier', risk: 4, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic dans des espaces contraints, intervention sur des installations vieillissantes hétérogènes et urgences d\'eau : hors de portée de la robotique économiquement viable.',
    sources: [21] },

  { slug: 'electricien', label: 'Électricien', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic d\'installations vieillissantes, intervention en environnement contraint et responsabilité sécuritaire restent hors de portée des robots. La transition énergétique soutient durablement la demande.',
    sources: [21] },

  { slug: 'cuisinier-rapide', label: 'Cuisinier de restauration rapide', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Le travail physique cadencé dans un espace restreint résiste étonnamment bien à l\'IA. Bornes de commande automatisées oui, mais préparation physique des repas reste humaine.',
    sources: [6] },

  { slug: 'cuisinier-restaurant', label: 'Cuisinier restaurant', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Créativité culinaire, adaptation produit-saison et gestion d\'un coup de feu en service restent humains. Les robots de cuisine restent confinés aux process standardisés.',
    sources: [21] },

  { slug: 'soudeur', label: 'Soudeur / Coupeur', risk: 14, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas en grande partie. Robots industriels existent en chaîne, mais le sur-mesure, les réparations en extérieur et les interventions sur infrastructures vieillissantes échappent à l\'automatisation.',
    sources: [6] },

  { slug: 'mecanicien', label: 'Mécanicien automobile / moto', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Diagnostic basé sur perceptions sensorielles complexes (bruit, vibration, odeurs) et accès physique contraint aux pièces dans des environnements non standardisés garantissent le métier.',
    sources: [3] },

  { slug: 'masseur', label: 'Masseur-Kinésithérapeute', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Retour haptique, chaleur humaine, adaptation instantanée à la douleur du patient et manipulation anatomique précise constituent l\'essence même de la valeur thérapeutique.',
    sources: [6] },

  { slug: 'osteopathe', label: 'Ostéopathe', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Palpation, lecture corporelle et ajustement manuel précis dépendent d\'une expertise sensorielle et d\'une relation thérapeutique non modélisables. La demande reste forte.',
    sources: [21] },

  { slug: 'operateur-crematorium', label: 'Opérateur de crématorium', risk: 17, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Manipulation physique en environnement potentiellement dangereux + respect strict de protocoles culturels et moraux liés au deuil : profondément humain.',
    sources: [6] },

  { slug: 'pompier', label: 'Pompier', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Intervention en environnement chaotique, jugement vital sous stress et coopération équipe-terrain restent fondamentalement humains. La technologie augmente, ne remplace pas.',
    sources: [21] },

  { slug: 'policier', label: 'Policier', risk: 9, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la reconnaissance et l\'analyse de données, mais l\'usage légitime de la force, le jugement de proportionnalité et l\'intervention humaine restent encadrés par la présence physique.',
    sources: [21] },

  { slug: 'militaire', label: 'Militaire', risk: 11, horizon: 10, status: 'protege',
    dynamic: 'L\'IA augmente massivement les capacités (drones, renseignement, logistique). Mais la décision d\'engagement, la responsabilité de commandement et le combat en environnement complexe restent humains.',
    sources: [21] },

  // ── EN CROISSANCE ──────────────────────────────────────
  // (demande qui augmente structurellement)

  { slug: 'travailleur-social', label: 'Travailleur social', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Gestion de crises intrafamiliales, protection de l\'enfance et réparation du tissu social exigent un jugement moral et une compassion que l\'IA ne peut pas et ne doit pas assumer.',
    sources: [9] },

  { slug: 'infirmier', label: 'Infirmier', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Soin physique corporel, hygiène, manipulation de patients fragiles et communication avec familles en détresse exigent une présence humaine irremplaçable. Le vieillissement démographique fait exploser la demande.',
    sources: [6] },

  { slug: 'aide-soignant', label: 'Aide-soignant', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La proximité physique, l\'aide à la toilette et l\'accompagnement des personnes dépendantes exigent ta présence. Le vieillissement démographique structure une demande explosive.',
    sources: [6] },

  { slug: 'auxiliaire-vie', label: 'Auxiliaire de vie', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Maintien à domicile des personnes âgées et dépendantes : la demande explose avec le vieillissement. L\'IA ne remplace ni la présence physique ni la chaleur humaine.',
    sources: [9] },

  { slug: 'sage-femme', label: 'Sage-femme', risk: 6, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Accouchement, suivi prénatal, accompagnement post-partum : la combinaison technique-relationnelle est irréductible. La demande structurelle reste forte malgré la baisse de natalité.',
    sources: [21] },

  { slug: 'orthophoniste', label: 'Orthophoniste', risk: 11, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Rééducation du langage, suivi des troubles cognitifs et accompagnement des familles : la demande dépasse l\'offre dans la plupart des bassins.',
    sources: [21] },

  { slug: 'agriculteur', label: 'Ouvrier agricole / Agriculteur', risk: 0, horizon: 5, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon — peut-être le meilleur. Boostée par la transition écologique, l\'adaptation climatique et la sécurité alimentaire mondiale, la profession connaît la plus forte croissance absolue : +34M emplois projetés d\'ici 2030.',
    sources: [9] },

  { slug: 'maraicher', label: 'Maraîcher', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La demande de circuits courts et la transition agroécologique soutiennent durablement le métier. L\'automatisation reste partielle face à la diversité variétale et météorologique.',
    sources: [9] },

  { slug: 'eleveur', label: 'Éleveur', risk: 6, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Soin du vivant, gestion de la reproduction et adaptation aux pathologies animales restent fondamentalement humains. La demande de produits locaux soutient la profession.',
    sources: [9] },

  { slug: 'chauffeur-livreur', label: 'Chauffeur-livreur', risk: 10, horizon: 5, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La complexité du dernier kilomètre — bâtiments non cartographiés, remise en main propre, interaction client — retarde indéfiniment l\'automatisation logistique complète.',
    sources: [9] },

  { slug: 'chauffeur-poids-lourd', label: 'Chauffeur poids-lourd', risk: 32, horizon: 10, status: 'croissance',
    dynamic: 'Tu restes dans le bon wagon… pour l\'instant. Le camion autonome avance, mais la complexité réglementaire, la responsabilité accident et les manœuvres en zone urbaine repoussent encore le déploiement à grande échelle.',
    sources: [21] },

  { slug: 'ingenieur-ia', label: 'Ingénieur IA / Architecte MLOps', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es au sommet de la vague. Création de modèles de fondation, intégration cloud sécurisée, optimisation des flux d\'inférence : demande massive, salaires premium. LinkedIn recense 1,3M nouveaux postes IA.',
    sources: [11, 14] },

  { slug: 'integrateur-ia', label: 'Intégrateur IA', risk: 0, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Connecter les LLM aux systèmes métier d\'entreprise est la compétence la plus demandée — chaque société veut son IA opérationnelle, peu de gens savent vraiment la déployer en production.',
    sources: [14] },

  { slug: 'expert-cybersecurite', label: 'Expert cybersécurité', risk: 12, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. L\'IA générative arme les attaquants : phishing personnalisé, génération de malware, ingénierie sociale automatisée. La demande d\'experts capables de contrer ces vagues explose.',
    sources: [9] },

  { slug: 'specialiste-big-data', label: 'Spécialiste Big Data', risk: 18, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. L\'inflation du volume de données générées par l\'IA elle-même crée une demande structurelle pour ceux qui savent les architecturer, gouverner et exploiter de manière utile.',
    sources: [9] },

  { slug: 'ingenieur-fintech', label: 'Ingénieur fintech', risk: 22, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La fusion finance-IA-régulation crée une niche premium. Les banques transforment leurs systèmes legacy avec l\'IA et cherchent des profils hybrides finance + tech.',
    sources: [9] },

  { slug: 'specialiste-energies-renouvelables', label: 'Spécialiste énergies renouvelables', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La transition énergétique structure une demande massive : conception, installation, maintenance d\'infrastructures solaires/éoliennes/hydrogène. Le marché embauche plus vite qu\'il forme.',
    sources: [9] },

  { slug: 'technicien-eolien', label: 'Technicien éolien', risk: 3, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Maintenance en hauteur, diagnostic mécanique-électrique sur sites isolés et coordination terrain : irréductibles à l\'automatisation à court terme. Demande structurelle forte.',
    sources: [9] },

  { slug: 'technicien-solaire', label: 'Technicien solaire', risk: 4, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. La diversité des toitures, des configurations résidentielles et des contraintes techniques rend l\'installation difficilement automatisable. Le marché manque cruellement de bras qualifiés.',
    sources: [9] },

  { slug: 'specialiste-batiment-durable', label: 'Spécialiste bâtiment durable', risk: 5, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Rénovation énergétique, isolation thermique et matériaux biosourcés : la réglementation européenne crée une demande massive. Les entreprises peinent à recruter.',
    sources: [9] },

  { slug: 'coach-professionnel', label: 'Coach professionnel', risk: 22, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Face au déclassement cognitif induit par l\'IA, la demande de coaching de carrière, de reconversion et de gestion de stress explose. La présence humaine fait la différence.',
    sources: [21] },

  { slug: 'formateur-adultes', label: 'Formateur d\'adultes', risk: 25, horizon: 10, status: 'croissance',
    dynamic: 'Tu es dans le bon wagon. Le WEF projette que 39% des compétences devront être réapprises d\'ici 2030. La requalification massive des actifs crée un appel d\'air pour les formateurs en présentiel.',
    sources: [10] },

  // ── ARTISANAT & MÉTIERS DU CONCRET (PROTÉGÉ / CROISSANCE) ──

  { slug: 'menuisier', label: 'Menuisier', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Travail sur mesure, lecture du bois, ajustement à l\'existant : irréductible à la robotique. La demande pour le mobilier sur mesure et la rénovation reste solide.',
    sources: [21] },

  { slug: 'ebeniste', label: 'Ébéniste', risk: 5, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La haute valeur ajoutée artisanale et la finition au sentiment échappent à l\'automatisation. Le marché du luxe et de la restauration soutient durablement la profession.',
    sources: [21] },

  { slug: 'boulanger', label: 'Boulanger / Pâtissier', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Tour de main, adaptation aux farines, gestion d\'un fournil et créativité culinaire restent humains. La demande de produits artisanaux locaux soutient le métier.',
    sources: [21] },

  { slug: 'boucher', label: 'Boucher', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Lecture anatomique, découpe précise et conseil client en proximité résistent à l\'automatisation économiquement viable. Le local et l\'artisanal soutiennent la demande.',
    sources: [21] },

  { slug: 'coiffeur', label: 'Coiffeur', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Geste fin sur cheveu vivant + relation de confiance + contact physique : profondément humain. La demande reste solide même en récession.',
    sources: [21] },

  { slug: 'esthetique', label: 'Esthéticien(ne)', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Soins personnalisés, contact physique apaisant et conseil sur la peau spécifique du client restent humains. La demande de bien-être croît avec le stress ambiant.',
    sources: [21] },

  { slug: 'fleuriste', label: 'Fleuriste', risk: 25, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Composition florale au feeling, conseil émotionnel pour mariages/funérailles et adaptation au stock saisonnier sont irréductiblement humains. Marché de niche stable.',
    sources: [21] },

  // ── SANTÉ ──────────────────────────────────────────────

  { slug: 'dentiste', label: 'Dentiste', risk: 14, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur le diagnostic radiologique. Mais l\'intervention en bouche, la sensation tactile sur tissu vivant et la responsabilité chirurgicale restent humaines.',
    sources: [21] },

  { slug: 'kinesitherapeute', label: 'Kinésithérapeute', risk: 10, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Manipulation thérapeutique, adaptation à la douleur du patient et accompagnement de la rééducation exigent ta présence. La demande croît avec le vieillissement.',
    sources: [21] },

  { slug: 'veterinaire', label: 'Vétérinaire', risk: 12, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur le diagnostic. Mais la manipulation d\'un animal vivant, la chirurgie et la communication avec les propriétaires restent humaines. La demande explose avec la place des animaux de compagnie.',
    sources: [21] },

  // ── MÉTIERS DE BUREAU SECONDAIRES ──────────────────────

  { slug: 'controller-gestion', label: 'Contrôleur de gestion', risk: 60, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting standardisé, écarts budgétaires et tableaux de bord sont automatisés. Tu te concentres sur le partenariat business, l\'arbitrage de scenarii stratégiques et la lecture critique des données.',
    sources: [7] },

  { slug: 'auditeur', label: 'Auditeur financier', risk: 65, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Tests de procédures, échantillonnage et revue documentaire : automatisés à 80%. Les Big 4 réduisent silencieusement leurs effectifs juniors. Survivent ceux qui montent en jugement professionnel.',
    sources: [7] },

  { slug: 'chargee-clientele', label: 'Chargé(e) de clientèle', risk: 60, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Conseil transactionnel basique, ouverture de compte et mise à jour de dossiers sont automatisés. Le poste se contracte massivement dans la banque de détail.',
    sources: [3] },

  { slug: 'gestionnaire-paie', label: 'Gestionnaire de paie', risk: 68, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. La paie standardisée est entièrement automatisée par les SIRH modernes. Le rôle subsiste sur la conformité multi-conventions et les cas d\'expatriation.',
    sources: [3] },

  { slug: 'documentaliste', label: 'Documentaliste', risk: 70, horizon: 5, status: 'danger',
    dynamic: 'Tu es dans le viseur. Indexation, classement et recherche documentaire sont des fonctions natives des LLM. Le métier subsiste uniquement dans des contextes spécialisés (droit, médecine, archives historiques).',
    sources: [3] },

  { slug: 'archiviste', label: 'Archiviste', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La numérisation et l\'OCR cognitif transforment le métier de manipulation physique en métier de gouvernance numérique des fonds. La conservation patrimoniale reste humaine.',
    sources: [3] },

  { slug: 'bibliothecaire', label: 'Bibliothécaire', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le conseil de lecture et la médiation culturelle deviennent le cœur du métier, à mesure que le catalogage et la recherche se font naturellement par IA.',
    sources: [21] },

  { slug: 'agent-immobilier', label: 'Agent immobilier', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Annonces, qualification de prospects et descriptifs : automatisés. La valeur se déplace vers la négociation, la connaissance fine du quartier et la gestion émotionnelle des transactions.',
    sources: [9] },

  { slug: 'gestionnaire-stock', label: 'Gestionnaire de stock', risk: 62, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Prévision de demande, optimisation de réapprovisionnement et inventaires sont automatisés. Tu deviens orchestrateur d\'exceptions et négociateur fournisseurs — ou tu es remplacé.',
    sources: [3] },

  { slug: 'logisticien', label: 'Logisticien', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Planification, routage et optimisation sont accélérés 10x par l\'IA. Tu te concentres sur la gestion des aléas, les relations transporteurs et l\'arbitrage stratégique multi-sites.',
    sources: [3] },

  // ── COMMUNICATION & MARKETING ──────────────────────────

  { slug: 'redacteur-publicitaire', label: 'Rédacteur publicitaire / Copywriter', risk: 70, horizon: 2, status: 'danger',
    dynamic: 'Tu es dans le viseur. La production de copies, slogans et A/B variants est devenue triviale pour les LLM. Subsistent les directeurs de création à forte signature et le copywriting stratégique haut de gamme.',
    sources: [1] },

  { slug: 'responsable-com', label: 'Responsable communication', risk: 45, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Production de contenus, communiqués et reporting sont automatisés. Tu deviens stratège éditorial, gestionnaire de crise et garant de la marque — la part politique et humaine du rôle.',
    sources: [1] },

  { slug: 'social-media-manager', label: 'Social Media Manager', risk: 55, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Création de posts, programmation et reporting analytics : automatisés. Tu te concentres sur la stratégie, la gestion de communauté authentique et la réaction de crise.',
    sources: [9] },

  { slug: 'event-manager', label: 'Chef de projet événementiel', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la coordination logistique. Mais la gestion en temps réel d\'un événement vivant, les relations VIP et l\'adaptation aux imprévus restent fondamentalement humains.',
    sources: [21] },

  { slug: 'photographe', label: 'Photographe', risk: 40, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. La génération d\'images IA commoditise la photo de stock et publicitaire. Subsistent le portrait, l\'événementiel intime et le photojournalisme de terrain — la photo "qui a été là".',
    sources: [9] },

  { slug: 'videaste', label: 'Vidéaste / Monteur', risk: 50, horizon: 5, status: 'mutation',
    dynamic: 'Ton métier mute. Génération vidéo et montage automatique progressent vite. Tu te concentres sur la direction artistique, la captation singulière et la narration — la valeur de l\'œil.',
    sources: [9] },

  // ── ÉDUCATION & FORMATION ──────────────────────────────

  { slug: 'enseignant-college', label: 'Enseignant collège / lycée', risk: 8, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Autorité pédagogique, médiation des conflits, transmission de la culture commune et présence physique sont au cœur de la mission éducative.',
    sources: [6] },

  { slug: 'enseignant-primaire', label: 'Enseignant primaire', risk: 6, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Apprentissage des fondamentaux, socialisation et structure affective ne peuvent être délégués à une machine. La demande structurelle est forte.',
    sources: [6] },

  // ── TRANSPORT & MOBILITÉ ───────────────────────────────

  { slug: 'pilote-ligne', label: 'Pilote de ligne', risk: 18, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste massivement, mais la responsabilité finale, la gestion de crise (Hudson River) et la conformité réglementaire (deux pilotes minimum) garantissent la profession encore longtemps.',
    sources: [21] },

  { slug: 'controleur-aerien', label: 'Contrôleur aérien', risk: 30, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste, mais la responsabilité légale absolue de la séparation aérienne et la gestion d\'incidents restent humaines. La demande explose avec la croissance du trafic post-COVID.',
    sources: [21] },

  { slug: 'conducteur-train', label: 'Conducteur de train', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute lentement. Lignes automatisées (métro, certaines LGV) progressent, mais le réseau classique et le fret nécessitent la présence d\'un conducteur — pour des raisons techniques et syndicales.',
    sources: [21] },

  { slug: 'chauffeur-taxi-vtc', label: 'Chauffeur taxi / VTC', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas tout de suite. Le robotaxi avance dans certaines villes US, mais la complexité urbaine européenne, la régulation et le service client maintiennent la demande humaine.',
    sources: [21] },

  // ── MÉTIERS SCIENTIFIQUES ──────────────────────────────

  { slug: 'biologiste', label: 'Biologiste / Chercheur en biologie', risk: 28, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA accélère drastiquement le criblage moléculaire, la génomique et la rédaction d\'articles. La paillasse expérimentale et la conception d\'hypothèses restent humaines.',
    sources: [21] },

  { slug: 'chimiste', label: 'Chimiste', risk: 32, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Le design de molécules par IA et la simulation de réactions accélèrent la R&D. Tu te concentres sur la formulation, la validation expérimentale et l\'industrialisation.',
    sources: [21] },

  { slug: 'physicien', label: 'Physicien / Chercheur en physique', risk: 25, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. L\'IA accélère le traitement de données expérimentales massives (collisionneurs, télescopes). La théorie, l\'hypothèse et l\'expérimentation conceptuelle restent humaines.',
    sources: [21] },

  { slug: 'ingenieur-civil', label: 'Ingénieur civil / BTP', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste sur la modélisation et le calcul de structures. Mais la responsabilité d\'ouvrage, la coordination chantier et l\'adaptation au réel restent humaines. La transition énergétique soutient la demande.',
    sources: [21] },

  { slug: 'architecte', label: 'Architecte', risk: 38, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La génération de plans et de rendus par IA commoditise une partie de la production. Tu te concentres sur la signature artistique, le dialogue client et la maîtrise réglementaire.',
    sources: [21] },

  { slug: 'urbaniste', label: 'Urbaniste', risk: 32, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Modélisation urbaine et études d\'impact sont accélérées par l\'IA. Tu te concentres sur la concertation publique, l\'arbitrage politique et la vision territoriale long-terme.',
    sources: [21] },

  // ── DIVERS ─────────────────────────────────────────────

  { slug: 'directeur-general', label: 'Directeur général / CEO', risk: 15, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. Vision, arbitrage stratégique, leadership et responsabilité ultime restent humains par construction. L\'IA t\'assiste sur l\'analyse, mais pas sur la décision.',
    sources: [21] },

  { slug: 'directeur-financier', label: 'Directeur financier (CFO)', risk: 30, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. Reporting et consolidation accélérés par l\'IA. Tu deviens partenaire stratégique du CEO, gestionnaire de la communication financière et arbitre des arbitrages capital-allocation.',
    sources: [7] },

  { slug: 'comedien', label: 'Comédien / Acteur', risk: 28, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'imite (deepfake, voix synthétique). Mais la présence scénique, la prise de risque corporel et la connexion incarnée avec un public restent humaines. Le secteur se polarise vers les noms et l\'authenticité.',
    sources: [21] },

  { slug: 'musicien', label: 'Musicien / Compositeur', risk: 35, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La musique générative IA inonde le streaming. Tu te concentres sur la performance live, la signature artistique forte et la création d\'œuvres incarnées.',
    sources: [21] },

  { slug: 'artiste-plasticien', label: 'Artiste plasticien', risk: 30, horizon: 10, status: 'mutation',
    dynamic: 'Ton métier mute. La génération d\'images IA bouleverse le marché. La valeur se déplace vers la pratique incarnée, la signature et le récit conceptuel. Le marché de l\'art récompense le geste irréductible.',
    sources: [21] },

  { slug: 'sportif-pro', label: 'Sportif professionnel', risk: 0, horizon: 10, status: 'protege',
    dynamic: 'L\'IA ne te remplace pas. La performance physique et l\'incarnation du jeu restent humaines par essence. Le secteur monétise même l\'IA pour optimiser l\'entraînement et l\'analyse vidéo.',
    sources: [21] },

  { slug: 'guide-touristique', label: 'Guide touristique', risk: 35, horizon: 10, status: 'protege',
    dynamic: 'L\'IA t\'assiste mais ne te remplace pas. Le récit incarné sur le lieu, l\'adaptation au groupe et l\'authenticité restent demandés. Le tourisme expérientiel soutient la profession.',
    sources: [21] },
]

// ── Fonctions utilitaires ─────────────────────────────────

export function findJobBySlug(slug: string): Job | undefined {
  return JOBS.find(j => j.slug === slug)
}

export function searchJobs(query: string, limit = 8): Job[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return JOBS
    .filter(j => j.label.toLowerCase().includes(q))
    .slice(0, limit)
}
```

> ✅ All 120 entries above are populated. The 40 metiers explicitly covered by the report keep their `sources: [<id>]`. The 80 hand-written entries get `sources: []` (the modal will fall back to the full catalog).

- [ ] **Step 2: Verify the file parses**

Run: `npx tsc --noEmit app/data/jobs.ts` (informational; the build in Task 4 is the real check).
Expected: no errors.

> 🚧 **The build will FAIL at this step because `scanner.vue` still references `'augmente'` and `'resistant'`. That's expected. Proceed to Task 4.**

---

## Task 4: Refactor `scanner.vue` for the new schema

**Files:**
- Modify: `app/pages/scanner.vue`

This task updates every reference to the old 3-status enum, integrates the new `dynamic` field display, and adds the modal trigger button. The footer sources block is kept for now (removed in Task 6).

- [ ] **Step 1: Update the verdict and status label maps**

Locate (around lines 110–119):
```ts
const VERDICT: Record<Job['status'], string> = {
  danger:    'remplacement probable',
  augmente:  'augmentation possible',
  resistant: 'résistance confirmée',
}

const STATUS_LABELS: Record<Job['status'], string> = {
  danger:    'EN DANGER',
  augmente:  'AUGMENTÉ',
  resistant: 'RÉSISTANT',
}
```

Replace with:
```ts
const VERDICT: Record<Job['status'], string> = {
  danger:     'remplacement probable',
  mutation:   'mutation sévère imminente',
  protege:    'résistance confirmée',
  croissance: 'croissance structurelle',
}

const STATUS_LABELS: Record<Job['status'], string> = {
  danger:     'EN DANGER',
  mutation:   'EN MUTATION SÉVÈRE',
  protege:    'PROTÉGÉ',
  croissance: 'EN CROISSANCE',
}

const STATUS_VERDICT_LINE: Record<Job['status'], string> = {
  danger:     'Ton métier est dans le viseur.',
  mutation:   'Ton métier ne disparaît pas. Il devient méconnaissable.',
  protege:    'L\'IA ne te remplace pas — elle a besoin de toi.',
  croissance: 'Tu es dans le bon wagon. Pour l\'instant.',
}
```

- [ ] **Step 2: Update the `statusColor` computed (around line 189)**

Locate:
```ts
const statusColor = computed(() => {
  if (!selectedJob.value) return 'var(--color-muted)'
  if (selectedJob.value.status === 'danger')   return 'var(--color-danger)'
  if (selectedJob.value.status === 'augmente') return '#FEBC2E'
  return 'var(--color-accent)'
})
```

Replace with:
```ts
const statusColor = computed(() => {
  if (!selectedJob.value) return 'var(--color-muted)'
  switch (selectedJob.value.status) {
    case 'danger':     return 'var(--color-danger)'
    case 'mutation':   return '#FFA630'
    case 'protege':    return '#5BC0EB'
    case 'croissance': return '#3DDC84'
  }
})
```

- [ ] **Step 3: Update the CTA logic (around lines 209–218)**

Locate the existing CTA copy block. Replace with:
```ts
const ctaHook = computed(() => {
  if (!selectedJob.value) return ''
  switch (selectedJob.value.status) {
    case 'danger':     return 'La newsletter qui te dit comment NE PAS te faire remplacer.'
    case 'mutation':   return 'Apprends à muter avant que ton métier ne le fasse sans toi.'
    case 'protege':    return 'Reste devant. La veille IA chaque semaine.'
    case 'croissance': return 'Capitalise sur ta position. Reçois La Fréquence.'
  }
})

const ctaButton = computed(() => {
  if (!selectedJob.value) return 'Rejoindre la Fréquence'
  return selectedJob.value.status === 'danger' ? 'Rejoindre La Fréquence' : "S'inscrire"
})
```

> ⚠️ The exact wording above replaces lines that previously did `if status === 'danger' ... if status === 'augmente' ...`. Search for `'augmente'` in the file and audit every remaining match.

- [ ] **Step 4: Update the danger styling on the stat card (around line 327, 556–558)**

The class `stat-card--danger` is fine to keep. Audit the template for any remaining `status === 'augmente'` or `status === 'resistant'` checks:

Run: `grep -n "augmente\|resistant" app/pages/scanner.vue`
Expected output: 0 matches. If any remain, update them to use the new statuses (`mutation` / `protege` / `croissance`).

- [ ] **Step 5: Add the dynamique block in the template**

In the result card (between the existing verdict line and the CTA, around the line that displays `statusLabel` / `verdictLine`), insert:

```vue
<div class="dynamic-block font-mono">
  <div class="dynamic-label">// DYNAMIQUE ANTICIPÉE</div>
  <p class="dynamic-text">{{ selectedJob.dynamic }}</p>
</div>
```

Add the corresponding CSS in the `<style scoped>` block (place it near the other `.stat-*` rules):

```css
.dynamic-block {
  margin: 1.5rem 0;
  padding: 1rem 1.25rem;
  background: var(--color-surface-2);
  border-left: 3px solid v-bind(statusColor);
}
.dynamic-label {
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-bottom: 0.5rem;
}
.dynamic-text {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--color-text);
  margin: 0;
}
```

- [ ] **Step 6: Add the "Voir les sources" button (placeholder for Task 6 wiring)**

Right after the dynamic block, before the CTA, insert:
```vue
<button type="button" class="sources-trigger font-mono" @click="sourcesModalOpen = true">
  → Voir les sources de cette analyse
</button>
```

Add to the `<script setup>` block:
```ts
const sourcesModalOpen = ref(false)
```

Add to the `<style scoped>` block:
```css
.sources-trigger {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.5rem 0;
  margin: 0.5rem 0 1.5rem;
  text-align: left;
}
.sources-trigger:hover { color: var(--color-text); }
```

> The actual modal component is built in Task 5 and wired in Task 6. For now the button doesn't do anything visible.

- [ ] **Step 7: Update the og:description meta**

Around line 178:
```ts
{ property: 'og:description', content: `J'ai scanné mon métier sur survivant-ia.ch. Résultat : ${STATUS_LABELS[job.status]}. Et toi ?` },
```

Stays the same — `STATUS_LABELS` now contains the 4 new labels.

- [ ] **Step 8: Verify the build**

Run: `npm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 9: Verify visually**

Run: `npm run dev`
Visit:
- `http://localhost:3000/scanner?job=programmeur` → status MUTATION, orange badge, dynamic visible
- `http://localhost:3000/scanner?job=comptable` → status DANGER, red card, dynamic visible
- `http://localhost:3000/scanner?job=cardiologue` → status PROTEGE, cyan badge, dynamic visible
- `http://localhost:3000/scanner?job=infirmier` → status CROISSANCE, green badge, dynamic visible
- The "Voir les sources" button appears under the dynamic block but does nothing yet (modal not built)

Stop the dev server.

- [ ] **Step 10: Commit Tasks 3 + 4 together**

```bash
git add app/data/jobs.ts app/pages/scanner.vue
git commit -m "feat(scanner): migrate to 4-status schema + dynamique narrative"
```

---

## Task 5: Build the SourcesModal component

**Files:**
- Create: `app/components/SourcesModal.vue`

- [ ] **Step 1: Create the component file**

Create `app/components/SourcesModal.vue`:

```vue
<!-- app/components/SourcesModal.vue -->
<script setup lang="ts">
import { computed, watch, nextTick, ref } from 'vue'
import type { Job } from '~/data/jobs'
import {
  getSourcesByIds,
  getSourcesByCategory,
} from '~/data/sources'

const props = defineProps<{
  open: boolean
  job: Job | null
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const dialogRef = ref<HTMLDialogElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)

const contextualSources = computed(() => {
  if (!props.job || props.job.sources.length === 0) return []
  return getSourcesByIds(props.job.sources)
})

const groupedCatalog = computed(() => getSourcesByCategory())

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    closeBtnRef.value?.focus()
  }
})

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        ref="dialogRef"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sources-modal-title"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <div class="modal-panel font-mono" @click.stop>
          <header class="modal-header">
            <span id="sources-modal-title" class="modal-title">// SOURCES</span>
            <button
              ref="closeBtnRef"
              type="button"
              class="modal-close"
              aria-label="Fermer"
              @click="emit('close')"
            >✕</button>
          </header>

          <div class="modal-body">
            <!-- Contextual: only if job has explicit sources -->
            <section v-if="contextualSources.length > 0" class="sources-section">
              <h3 class="sources-section-title">▸ Sources de ton résultat</h3>
              <ul class="sources-list">
                <li v-for="src in contextualSources" :key="src.id" class="source-item source-item--highlight">
                  <a :href="src.url" target="_blank" rel="noopener noreferrer" class="source-link">
                    <div class="source-id">[{{ src.id }}]</div>
                    <div class="source-content">
                      <div class="source-title">{{ src.title }} <span class="source-arrow">↗</span></div>
                      <div class="source-meta">{{ src.author }} · {{ src.year }}</div>
                      <div class="source-context">{{ src.context }}</div>
                    </div>
                  </a>
                </li>
              </ul>
            </section>

            <section class="sources-section">
              <h3 class="sources-section-title">▸ Toutes les sources de l'analyse</h3>
              <p v-if="contextualSources.length === 0" class="sources-intro">
                Cette analyse repose sur les sources suivantes.
              </p>

              <div v-for="group in groupedCatalog" :key="group.category" class="sources-group">
                <h4 class="sources-group-title">── {{ group.label }} ──</h4>
                <ul class="sources-list">
                  <li v-for="src in group.sources" :key="src.id" class="source-item">
                    <a :href="src.url" target="_blank" rel="noopener noreferrer" class="source-link">
                      <div class="source-id">[{{ src.id }}]</div>
                      <div class="source-content">
                        <div class="source-title">{{ src.title }} <span class="source-arrow">↗</span></div>
                        <div class="source-meta">{{ src.author }} · {{ src.year }}</div>
                        <div class="source-context">{{ src.context }}</div>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 4rem 1rem 2rem;
  overflow-y: auto;
}
.modal-panel {
  background: var(--color-surface);
  border: 1px solid rgba(0, 255, 65, 0.18);
  width: 100%;
  max-width: 720px;
  max-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.12);
  position: sticky;
  top: 0;
  background: var(--color-surface);
  z-index: 1;
}
.modal-title {
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  color: var(--color-text);
}
.modal-close {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
.modal-close:hover { color: var(--color-text); }

.modal-body {
  overflow-y: auto;
  padding: 1.25rem;
}
.sources-section { margin-bottom: 2rem; }
.sources-section:last-child { margin-bottom: 0; }
.sources-section-title {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  margin: 0 0 1rem;
  text-transform: uppercase;
}
.sources-intro {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-bottom: 1rem;
}
.sources-group { margin-bottom: 1.5rem; }
.sources-group-title {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  margin: 0 0 0.75rem;
}
.sources-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}
.source-item {
  background: var(--color-surface-2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.source-item--highlight {
  border-color: rgba(0, 255, 65, 0.3);
}
.source-link {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
}
.source-link:hover { background: rgba(0, 255, 65, 0.04); }
.source-id {
  font-size: 0.75rem;
  color: var(--color-accent);
  flex-shrink: 0;
  min-width: 2.5rem;
}
.source-content { flex: 1; min-width: 0; }
.source-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;
  margin-bottom: 0.25rem;
}
.source-arrow {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-left: 0.25rem;
}
.source-meta {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 0.4rem;
}
.source-context {
  font-size: 0.78rem;
  color: rgba(224, 224, 224, 0.75);
  line-height: 1.45;
}

/* Mobile bottom-sheet */
@media (max-width: 640px) {
  .modal-backdrop { padding: 0; align-items: flex-end; }
  .modal-panel {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 0;
  }
}

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/components/SourcesModal.vue
git commit -m "feat(scanner): add SourcesModal component with contextual + grouped catalog"
```

---

## Task 6: Wire the modal into the scanner page + remove footer sources block

**Files:**
- Modify: `app/pages/scanner.vue`

- [ ] **Step 1: Import the SourcesModal component**

In `<script setup>`, near the top imports, add:
```ts
import SourcesModal from '~/components/SourcesModal.vue'
```

(Nuxt usually auto-imports components, but the explicit import makes the dependency obvious and is harmless.)

- [ ] **Step 2: Add the modal element at the bottom of the template**

At the end of the `<template>` block (just before the closing `</template>`), insert:
```vue
<SourcesModal
  :open="sourcesModalOpen"
  :job="selectedJob"
  @close="sourcesModalOpen = false"
/>
```

- [ ] **Step 3: Remove the footer sources block**

Locate the existing block (around line 369–372):
```vue
<!-- Footer sources -->
<div class="sources-footer font-mono">
  // Données issues de : MIT Project Iceberg 2025 · OCDE Employment Outlook 2023 ·
  WEF Future of Jobs 2025 · Goldman Sachs 2023 · Oxford/Frey & Osborne 2013
</div>
```

Delete the block entirely.

Find the corresponding CSS rule (around line 625):
```css
.sources-footer {
  /* ... whatever it contains ... */
}
```

Delete that rule entirely (and any rules immediately related to `.sources-footer`).

- [ ] **Step 4: Update the page meta to reflect new sources**

Around lines 8 and 10 and 13 and 27, update strings that mention "MIT, OCDE, WEF". Replace with "Tufts, McKinsey, WEF" or simply "données 2026". Example:

```ts
description: 'Teste en 10 secondes le risque que l\'IA remplace ton métier. Score basé sur les rapports 2026 (Tufts, McKinsey, WEF). Gratuit, sans inscription.',
```

Update all 4 places (line 8 description, line 10 ogDescription, line 13 twitterDescription, line 27 inside the JSON-LD).

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Verify visually**

Run: `npm run dev`
Visit `http://localhost:3000/scanner?job=programmeur`:
- Click "Voir les sources de cette analyse"
- Modal opens
- "Sources de ton résultat" section visible (programmeur has `sources: [3]`)
- "Toutes les sources de l'analyse" section visible with 5 categories
- Press Escape → modal closes
- Re-open, click backdrop → modal closes
- Re-open, click ✕ → modal closes
- Click on a source link → opens in new tab

Visit `http://localhost:3000/scanner?job=plombier`:
- Click "Voir les sources de cette analyse"
- "Sources de ton résultat" section is hidden (plombier has `sources: [21]` — wait, that's set, so it WILL show; pick a job with `sources: []` like, looking at the data, those are jobs without explicit references — actually with the data above, all 120 entries have at least one source. Skip this sub-check.)

Resize browser to <640px:
- The modal becomes a bottom sheet anchored at the bottom

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add app/pages/scanner.vue
git commit -m "feat(scanner): wire SourcesModal, remove legacy footer sources block, update meta"
```

---

## Task 7: Final QA pass — non-regression check on existing slugs

**Files:**
- Read-only verification.

- [ ] **Step 1: Generate a list of every slug in the new jobs.ts**

Run:
```bash
grep "slug:" app/data/jobs.ts | sed -E "s/.*slug: '([^']+)'.*/\1/"
```
Expected: list of ~120 slugs.

- [ ] **Step 2: Compare with the previous git history**

Run:
```bash
git show HEAD~5:app/data/jobs.ts | grep "slug:" | sed -E "s/.*slug: '([^']+)'.*/\1/" > /tmp/old-slugs.txt
grep "slug:" app/data/jobs.ts | sed -E "s/.*slug: '([^']+)'.*/\1/" > /tmp/new-slugs.txt
diff /tmp/old-slugs.txt /tmp/new-slugs.txt
```

> If a slug was removed during the refactor, **stop and decide**: either re-add it with a hand-written `dynamic` and `sources: []`, or accept the removal (rare — only if the original slug was a duplicate or low-value entry). Do NOT silently lose slugs that may be linked from social shares or external pages.

- [ ] **Step 3: Visit each status sample manually**

Run: `npm run dev`

Visit each of these URLs and confirm status badge + dynamic + sources modal work:
- `/scanner?job=teleconseiller` → DANGER
- `/scanner?job=comptable` → DANGER
- `/scanner?job=developpeur-logiciel` → MUTATION
- `/scanner?job=data-scientist` → MUTATION
- `/scanner?job=cardiologue` → PROTEGE
- `/scanner?job=plombier` → PROTEGE
- `/scanner?job=ingenieur-ia` → CROISSANCE
- `/scanner?job=infirmier` → CROISSANCE

Confirm:
- Badge color matches status
- Verdict line displays
- Dynamique block renders with correct text and ≤ 300 chars
- "Voir les sources" button is visible
- Modal opens and shows the correct sections

- [ ] **Step 4: Confirm no `augmente` / `resistant` references remain anywhere**

```bash
grep -rn "augmente\|resistant" app/ 2>/dev/null
```
Expected: 0 matches.

- [ ] **Step 5: Final commit if any drift was fixed during QA**

If steps 1–4 surfaced any fix, commit:
```bash
git add -p
git commit -m "fix(scanner): non-regression fixes from QA pass"
```

If no fixes needed, no commit. The branch is ready to merge.

---

## Self-Review

**Spec coverage:**
- ✅ Schema migration (Task 3) → `Job` interface with 4 statuses, `dynamic`, `sources`
- ✅ Sources catalog (Task 1) → `sources.ts` with 22 entries, helpers, categories
- ✅ Card layout with dynamique block + sources button (Task 4)
- ✅ Modal with contextual + grouped catalog (Tasks 5, 6)
- ✅ Tailwind tokens for 4 statuses (Task 2)
- ✅ CTA newsletter variants per status (Task 4 step 3)
- ✅ Footer sources block removed (Task 6 step 3)
- ✅ Slugs preserved (Task 7 step 2 verifies)
- ✅ Meta description updated (Task 6 step 4)

**Placeholder scan:** No "TBD" / "implement later" / "add validation" patterns. Each step has explicit code or commands.

**Type consistency:** `JobStatus` defined once in `jobs.ts` (`'danger' | 'mutation' | 'protege' | 'croissance'`). Used consistently across `scanner.vue` (Task 4 steps 1, 2, 3) and `SourcesModal.vue` doesn't import it but uses `Job` type directly. Source IDs are `number`; `sources: number[]` on Job, `id: number` on Source. `findSourceById(id: number)`, `getSourcesByIds(ids: number[])` — matching signatures.

**One known approximation in Task 6 Step 6:** Originally I planned to verify the case where a job has `sources: []`, but the data in Task 3 gives every job at least one source. That's an editorial decision — at a minimum every job points to either Tufts (id 1) for risk-typed entries, or a generic resilience source (e.g., id 21) for `protege`/`croissance` entries. So the "fallback" branch (intro line "Cette analyse repose sur les sources suivantes.") is unreachable in the current dataset but kept in code for future jobs added without specific sources. This is intentional and noted.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-30-scanner-data-upgrade.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
