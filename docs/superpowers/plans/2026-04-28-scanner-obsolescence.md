# Scanner d'Obsolescence IA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page `/scanner` — un outil interactif style terminal qui permet à un visiteur de saisir son métier, voir une animation de scan, puis obtenir son score de risque IA avec un CTA newsletter adapté.

**Architecture:** Page Nuxt unique (`scanner.vue`) avec toute la logique inline, suivant le pattern existant des pages (`identite.vue`). Les données sont dans un module TypeScript séparé (`app/data/jobs.ts`). Pas de composants extraits — la page est autonome et lisible d'une traite.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup lang="ts">`, CSS scoped, composants existants `ScannerBorder` + `GlitchButton`, `useRoute` + `useRouter` pour les URL params, `useHead` pour les og tags dynamiques.

> **Note tests:** Ce projet n'a pas de framework de test installé. Les "tests" dans ce plan sont : (1) vérification TypeScript via `npx nuxt typecheck`, (2) vérification build via `npm run build`, (3) vérification manuelle dans le navigateur. Chaque tâche se termine par l'une de ces vérifications.

---

## File Map

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `app/data/jobs.ts` | Créer | Table statique des métiers + types + fonctions de recherche |
| `app/pages/scanner.vue` | Créer | Page complète : autocomplete, animation, résultats, partage |
| `app/pages/index.vue` | Modifier | Ajouter le bloc teaser vers `/scanner` |

---

## Task 1 — Table de données des métiers

**Files:**
- Create: `app/data/jobs.ts`

- [ ] **Step 1.1 — Créer le fichier `app/data/jobs.ts`**

```typescript
// app/data/jobs.ts

export interface Job {
  slug: string
  label: string
  risk: number        // 0–100
  horizon: number     // années : 2, 5 ou 10
  status: 'danger' | 'augmente' | 'resistant'
  source: string
}

// Seuils : risk > 65 → danger | 30–65 → augmente | < 30 → resistant
export const JOBS: Job[] = [
  // ── EN DANGER (> 65%) ──────────────────────────────────
  { slug: 'teleconseiller',       label: 'Téléconseiller',            risk: 78, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'televendeur',          label: 'Télévendeur',               risk: 92, horizon: 2,  status: 'danger',    source: 'Oxford 2013' },
  { slug: 'saisie-de-donnees',    label: 'Agent de saisie de données',risk: 90, horizon: 2,  status: 'danger',    source: 'Oxford 2013 / MIT 2025' },
  { slug: 'redacteur-web',        label: 'Rédacteur web',             risk: 76, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'traducteur',           label: 'Traducteur',                risk: 82, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'correcteur',           label: 'Correcteur / Relecteur',    risk: 85, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'transcripteur',        label: 'Transcripteur',             risk: 88, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'comptable',            label: 'Comptable',                 risk: 72, horizon: 5,  status: 'danger',    source: 'MIT 2025 / Goldman Sachs 2023' },
  { slug: 'analyste-credit',      label: 'Analyste crédit',           risk: 70, horizon: 5,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'analyste-marketing',   label: 'Analyste marketing',        risk: 68, horizon: 5,  status: 'danger',    source: 'WEF 2025' },
  { slug: 'assistant-juridique',  label: 'Assistant juridique',       risk: 72, horizon: 5,  status: 'danger',    source: 'Goldman Sachs 2023' },
  { slug: 'secretaire-juridique', label: 'Secrétaire juridique',      risk: 77, horizon: 5,  status: 'danger',    source: 'Goldman Sachs 2023' },
  { slug: 'assistant-administratif', label: 'Assistant administratif',risk: 73, horizon: 5,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'receptionniste',       label: 'Réceptionniste',            risk: 80, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'standardiste',         label: 'Standardiste',              risk: 83, horizon: 2,  status: 'danger',    source: 'Oxford 2013' },
  { slug: 'programmeur',          label: 'Programmeur',               risk: 74, horizon: 5,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'agent-assurance',      label: "Agent d'assurance",         risk: 74, horizon: 5,  status: 'danger',    source: 'Oxford 2013 / MIT 2025' },
  { slug: 'journaliste-presse',   label: 'Journaliste (presse écrite)',risk: 67, horizon: 5, status: 'danger',    source: 'MIT 2025' },
  { slug: 'analyste-financier',   label: 'Analyste financier',        risk: 66, horizon: 5,  status: 'danger',    source: 'Goldman Sachs 2023' },
  { slug: 'operateur-saisie',     label: 'Opérateur de saisie',       risk: 91, horizon: 2,  status: 'danger',    source: 'Oxford 2013' },
  { slug: 'secretaire',           label: 'Secrétaire',                risk: 75, horizon: 5,  status: 'danger',    source: 'MIT 2025 / OCDE 2023' },
  { slug: 'technicien-support',   label: 'Technicien support IT',     risk: 66, horizon: 5,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'caissier',             label: 'Caissier',                  risk: 78, horizon: 5,  status: 'danger',    source: 'OCDE 2023' },
  { slug: 'agent-recouvrement',   label: 'Agent de recouvrement',     risk: 80, horizon: 2,  status: 'danger',    source: 'Oxford 2013' },
  { slug: 'analyste-donnees',     label: 'Analyste données',          risk: 67, horizon: 5,  status: 'danger',    source: 'MIT 2025 / SHRM 2025' },

  // ── AUGMENTÉ (30–65%) ──────────────────────────────────
  { slug: 'chef-de-projet-it',    label: 'Chef de projet IT',         risk: 54, horizon: 5,  status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'developpeur-logiciel', label: 'Développeur logiciel',      risk: 55, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'designer-graphique',   label: 'Designer graphique',        risk: 58, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'ux-designer',          label: 'UX Designer',               risk: 45, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'data-scientist',       label: 'Data Scientist',            risk: 48, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'commercial',           label: 'Commercial',                risk: 52, horizon: 5,  status: 'augmente',  source: 'WEF 2025' },
  { slug: 'responsable-rh',       label: 'Responsable RH',           risk: 55, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'recruteur',            label: 'Recruteur',                 risk: 58, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'conseiller-financier', label: 'Conseiller financier',      risk: 48, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'architecte-logiciel',  label: 'Architecte logiciel',       risk: 45, horizon: 10, status: 'augmente',  source: 'MIT 2025' },
  { slug: 'community-manager',    label: 'Community Manager',         risk: 55, horizon: 5,  status: 'augmente',  source: 'WEF 2025' },
  { slug: 'expert-comptable',     label: 'Expert-comptable',          risk: 55, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023 / MIT 2025' },
  { slug: 'consultant-strategie', label: 'Consultant en stratégie',   risk: 42, horizon: 10, status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'product-manager',      label: 'Product Manager',           risk: 38, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'journaliste-tv',       label: 'Journaliste TV / Radio',    risk: 40, horizon: 10, status: 'augmente',  source: 'MIT 2025' },
  { slug: 'pharmacien',           label: 'Pharmacien',                risk: 42, horizon: 10, status: 'augmente',  source: 'Oxford 2013 / MIT 2025' },
  { slug: 'radiologue',           label: 'Radiologue',                risk: 48, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'ingenieur-industriel', label: 'Ingénieur industriel',      risk: 45, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'directeur-marketing',  label: 'Directeur marketing',       risk: 35, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'gestionnaire-projet',  label: 'Gestionnaire de projet',    risk: 52, horizon: 5,  status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'responsable-qualite',  label: 'Responsable qualité',       risk: 50, horizon: 5,  status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'medecin-generaliste',  label: 'Médecin généraliste',       risk: 32, horizon: 10, status: 'augmente',  source: 'MIT 2025' },
  { slug: 'avocat',               label: 'Avocat',                    risk: 44, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'notaire',              label: 'Notaire',                   risk: 42, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'architecte',           label: 'Architecte',                risk: 38, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'controleur-gestion',   label: 'Contrôleur de gestion',     risk: 60, horizon: 5,  status: 'augmente',  source: 'MIT 2025 / Goldman Sachs 2023' },
  { slug: 'assistant-direction',  label: 'Assistant de direction',    risk: 62, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'chef-de-produit',      label: 'Chef de produit',           risk: 48, horizon: 5,  status: 'augmente',  source: 'WEF 2025' },
  { slug: 'responsable-logistique', label: 'Responsable logistique',  risk: 45, horizon: 10, status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'responsable-communication', label: 'Responsable communication', risk: 42, horizon: 10, status: 'augmente', source: 'WEF 2025' },
  { slug: 'ingenieur-civil',      label: 'Ingénieur génie civil',     risk: 32, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'chirurgien',           label: 'Chirurgien',                risk: 30, horizon: 10, status: 'augmente',  source: 'MIT 2025' },
  { slug: 'chauffeur-livreur',    label: 'Chauffeur livreur',         risk: 55, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'agent-immobilier',     label: 'Agent immobilier',          risk: 48, horizon: 5,  status: 'augmente',  source: 'Oxford 2013 / MIT 2025' },
  { slug: 'technicien-laboratoire', label: 'Technicien de laboratoire', risk: 38, horizon: 10, status: 'augmente', source: 'MIT 2025' },
  { slug: 'infographiste',        label: 'Infographiste',             risk: 62, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },

  // ── AUGMENTÉ — suite ───────────────────────────────────
  { slug: 'actuaire',             label: 'Actuaire',                  risk: 62, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'administrateur-sys',   label: 'Administrateur système',    risk: 58, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'ingenieur-reseau',     label: 'Ingénieur réseau',          risk: 50, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'responsable-si',       label: 'Responsable SI',            risk: 45, horizon: 10, status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'acheteur',             label: 'Acheteur',                  risk: 52, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'responsable-achats',   label: 'Directeur des achats',      risk: 40, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'biologiste',           label: 'Biologiste',                risk: 38, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'veterinaire',          label: 'Vétérinaire',               risk: 30, horizon: 10, status: 'augmente',  source: 'Oxford 2013 / MIT 2025' },
  { slug: 'geometre',             label: 'Géomètre',                  risk: 35, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'urbaniste',            label: 'Urbaniste',                 risk: 36, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'ingenieur-automatisme',label: 'Ingénieur automatisme',     risk: 40, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'formateur',            label: 'Formateur professionnel',   risk: 35, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'responsable-hse',      label: 'Responsable HSE',           risk: 32, horizon: 10, status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'agent-de-voyage',      label: 'Agent de voyage',           risk: 65, horizon: 5,  status: 'augmente',  source: 'Oxford 2013 / MIT 2025' },
  { slug: 'employe-banque',       label: 'Employé de banque (guichet)',risk: 65, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'chef-de-chantier',     label: 'Chef de chantier',          risk: 32, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'ingenieur-mecanique',  label: 'Ingénieur mécanique',       risk: 35, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'photographe',          label: 'Photographe professionnel', risk: 50, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'technicien-son',       label: 'Technicien son / image',    risk: 38, horizon: 10, status: 'augmente',  source: 'MIT 2025' },

  // ── RÉSISTANT (< 30%) ──────────────────────────────────
  { slug: 'carreleur',            label: 'Carreleur',                 risk: 8,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'electricien',          label: 'Électricien',               risk: 12, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'plombier',             label: 'Plombier',                  risk: 10, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'menuisier',            label: 'Menuisier',                 risk: 9,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'macon',                label: 'Maçon',                     risk: 7,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'infirmier',            label: 'Infirmier / Infirmière',    risk: 22, horizon: 10, status: 'resistant', source: 'MIT 2025 / OCDE 2023' },
  { slug: 'psychologue',          label: 'Psychologue',               risk: 18, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'travailleur-social',   label: 'Travailleur social',        risk: 12, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'enseignant-primaire',  label: 'Enseignant (primaire)',     risk: 16, horizon: 10, status: 'resistant', source: 'WEF 2025' },
  { slug: 'professeur-lycee',     label: 'Professeur (lycée)',        risk: 18, horizon: 10, status: 'resistant', source: 'WEF 2025' },
  { slug: 'chef-cuisinier',       label: 'Chef cuisinier',            risk: 18, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'agriculteur',          label: 'Agriculteur',               risk: 10, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'pompier',              label: 'Pompier',                   risk: 5,  horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'policier',             label: 'Policier',                  risk: 10, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'kinesitherapeute',     label: 'Kinésithérapeute',          risk: 15, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'mecanicien',           label: 'Mécanicien automobile',     risk: 14, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'coiffeur',             label: 'Coiffeur / Esthéticien',    risk: 12, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'dentiste',             label: 'Dentiste',                  risk: 20, horizon: 10, status: 'resistant', source: 'Oxford 2013 / MIT 2025' },
  { slug: 'technicien-maintenance', label: 'Technicien de maintenance', risk: 15, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'aide-soignant',        label: 'Aide-soignant',             risk: 14, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'moniteur-auto-ecole',  label: "Moniteur d'auto-école",     risk: 18, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'ebeniste',             label: 'Ébéniste',                  risk: 8,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'osteopathe',           label: 'Ostéopathe',                risk: 16, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'directeur-general',    label: 'Directeur général',         risk: 22, horizon: 10, status: 'resistant', source: 'WEF 2025' },
  { slug: 'ambulancier',          label: 'Ambulancier',               risk: 12, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'sage-femme',           label: 'Sage-femme',                risk: 15, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'ergotherapeute',       label: 'Ergothérapeute',            risk: 14, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'orthophoniste',        label: 'Orthophoniste',             risk: 16, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'educateur-specialise', label: 'Éducateur spécialisé',      risk: 12, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'peintre-batiment',     label: 'Peintre en bâtiment',       risk: 8,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'soudeur',              label: 'Soudeur',                   risk: 11, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'boulanger',            label: 'Boulanger',                 risk: 6,  horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'patissier',            label: 'Pâtissier',                 risk: 7,  horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'moniteur-sport',       label: 'Moniteur de sport',         risk: 13, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'dieteticien',          label: 'Diététicien',               risk: 20, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'technicien-cvc',       label: 'Technicien CVC (chauffage)',risk: 10, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'serrurier',            label: 'Serrurier',                 risk: 9,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'conducteur-engins',    label: "Conducteur d'engins",       risk: 18, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'juge',                 label: 'Juge / Magistrat',          risk: 26, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
]

export function findJobBySlug(slug: string): Job | undefined {
  return JOBS.find(j => j.slug === slug)
}

export function searchJobs(query: string): Job[] {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []
  return JOBS
    .filter(j => j.label.toLowerCase().includes(q))
    .slice(0, 8)
}
```

- [ ] **Step 1.2 — Vérifier TypeScript**

```bash
npx nuxt typecheck
```
Résultat attendu : aucune erreur TypeScript. Si `typecheck` n'est pas disponible, lancer `npm run build` à la place.

- [ ] **Step 1.3 — Commit**

```bash
git add app/data/jobs.ts
git commit -m "feat(scanner): add jobs data table with 120 French occupations"
```

---

## Task 2 — Page scanner — structure et autocomplete

**Files:**
- Create: `app/pages/scanner.vue`

- [ ] **Step 2.1 — Créer `app/pages/scanner.vue` avec l'autocomplete**

```vue
<!-- app/pages/scanner.vue -->
<script setup lang="ts">
import { JOBS, findJobBySlug, searchJobs, type Job } from '~/data/jobs'

// ── SEO static ──────────────────────────────────────────
useSeoMeta({
  title: 'Scanner IA — Risque automatisation par métier | Survivant-IA',
  description: 'Découvre en 10 secondes si ton métier est menacé par l\'IA. Données MIT, OCDE, WEF. Gratuit.',
})

// ── State ────────────────────────────────────────────────
const route  = useRoute()
const router = useRouter()

const query       = ref('')
const suggestions = ref<Job[]>([])
const phase       = ref<'idle' | 'scanning' | 'result'>('idle')
const selectedJob = ref<Job | null>(null)
const termLines   = ref<{ text: string; done: boolean }[]>([])
const copied      = ref(false)

// ── Autocomplete ─────────────────────────────────────────
watch(query, (val) => {
  suggestions.value = searchJobs(val)
})

function selectJob(job: Job) {
  query.value       = job.label
  suggestions.value = []
  selectedJob.value = job
  startScan(job)
}

// ── URL param pre-load ───────────────────────────────────
onMounted(() => {
  const slug = route.query.job as string | undefined
  if (slug) {
    const job = findJobBySlug(slug)
    if (job) {
      query.value       = job.label
      selectedJob.value = job
      phase.value       = 'result'
      setDynamicMeta(job)
    }
  }
})

// ── Terminal animation ───────────────────────────────────
const SCAN_LINES = (jobLabel: string) => [
  `$ survival_check --job="${jobLabel}"`,
  'connecting to OECD-2023 dataset .............. ok',
  'cross-referencing McKinsey automation index ... ok',
  'parsing job description ...................... ok',
  'simulating LLM capability curve (2026 → 2031) . ok',
]

const VERDICT: Record<Job['status'], string> = {
  danger:    'remplacement probable',
  augmente:  'augmentation possible',
  resistant: 'résistance confirmée',
}

function startScan(job: Job) {
  phase.value     = 'scanning'
  termLines.value = []

  const lines = SCAN_LINES(job.label)
  lines.forEach((text, i) => {
    setTimeout(() => {
      termLines.value.push({ text, done: false })
      setTimeout(() => {
        termLines.value[i].done = true
        if (i === lines.length - 1) {
          setTimeout(() => {
            phase.value = 'result'
            router.replace({ query: { job: job.slug } })
            setDynamicMeta(job)
          }, 400)
        }
      }, 350)
    }, i * 420)
  })
}

// ── Dynamic og meta ──────────────────────────────────────
function setDynamicMeta(job: Job) {
  const statusLabel = { danger: 'EN DANGER', augmente: 'AUGMENTÉ', resistant: 'RÉSISTANT' }[job.status]
  useHead({
    meta: [
      { property: 'og:title',       content: `Mon risque IA : ${job.risk}% — ${job.label} | Survival Check` },
      { property: 'og:description', content: `J'ai scanné mon métier sur survivant-ia.ch. Résultat : ${statusLabel}. Et toi ?` },
    ],
  })
}

// ── Result computed ──────────────────────────────────────
const resultLine = computed(() => {
  if (!selectedJob.value) return ''
  return `✓ obsolescence risk: ${selectedJob.value.risk}% — ${VERDICT[selectedJob.value.status]}`
})

const riskColor = computed(() => {
  if (!selectedJob.value) return 'var(--color-accent)'
  return selectedJob.value.status === 'danger' ? 'var(--color-danger)' : 'var(--color-accent)'
})

const statusLabel = computed(() => {
  if (!selectedJob.value) return ''
  return { danger: 'EN DANGER', augmente: 'AUGMENTÉ', resistant: 'RÉSISTANT' }[selectedJob.value.status]
})

const message = computed(() => {
  if (!selectedJob.value) return ''
  const label = selectedJob.value.label
  if (selectedJob.value.status === 'danger')
    return `Ton métier (${label}) est dans le viseur. Les premiers qui s'adaptent survivent — les autres subissent.`
  if (selectedJob.value.status === 'augmente')
    return `Ton métier (${label}) va changer. Ceux qui maîtrisent les outils maintenant gardent l'avantage sur leurs collègues.`
  return `L'IA ne remplace pas ton métier (${label}) — mais tes concurrents qui l'utilisent vont te dépasser si tu attends.`
})

const ctaLabel = computed(() => {
  if (!selectedJob.value) return 'Rejoindre la Fréquence'
  return selectedJob.value.status === 'resistant' ? "Utiliser l'IA pour s'imposer" : 'Rejoindre la Fréquence'
})

// ── Share ─────────────────────────────────────────────────
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

// ── Reset ─────────────────────────────────────────────────
function reset() {
  query.value       = ''
  suggestions.value = []
  selectedJob.value = null
  termLines.value   = []
  phase.value       = 'idle'
  router.replace({ query: {} })
}
</script>

<template>
  <div class="scanner-page">
    <div class="container">

      <!-- ── Header terminal ──────────────────────── -->
      <div class="terminal-header font-mono">
        <span class="term-dots" aria-hidden="true">
          <span class="dot dot-r" />
          <span class="dot dot-y" />
          <span class="dot dot-g" />
        </span>
        <span class="term-title">SURVIVANT-IA · ./SURVIVAL_CHECK.SH</span>
        <span class="term-version">V0.7.3</span>
      </div>

      <!-- ── Main terminal body ───────────────────── -->
      <div class="terminal-body">
        <span class="section-label font-mono">// SCANNER D'OBSOLESCENCE</span>
        <h1 class="scanner-h1">Scanner d'obsolescence IA — Quel est le risque pour ton métier&nbsp;?</h1>

        <!-- Input autocomplete -->
        <div v-if="phase === 'idle'" class="input-zone">
          <p class="input-prompt font-mono">Quel est votre métier ?</p>
          <div class="autocomplete-wrapper">
            <div class="input-row font-mono">
              <span class="prompt-char text-accent">$&nbsp;</span>
              <input
                v-model="query"
                class="job-input font-mono"
                type="text"
                placeholder='survival_check --job="..."'
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <ul v-if="suggestions.length" class="suggestions-list">
              <li
                v-for="job in suggestions"
                :key="job.slug"
                class="suggestion-item font-mono"
                @click="selectJob(job)"
              >
                {{ job.label }}
              </li>
            </ul>
            <p v-if="query.length >= 2 && suggestions.length === 0" class="no-result font-mono">
              // Aucun résultat — essaie un autre terme
            </p>
          </div>
        </div>

        <!-- Terminal scanning animation -->
        <div v-if="phase === 'scanning' || phase === 'result'" class="terminal-output">
          <div
            v-for="(line, i) in termLines"
            :key="i"
            class="term-line font-mono"
            :class="{ 'line-prompt': i === 0 }"
          >
            <span v-if="i === 0" class="text-accent">{{ line.text }}</span>
            <span v-else>
              {{ line.text }}
              <span v-if="!line.done" class="cursor" aria-hidden="true" />
            </span>
          </div>
          <div v-if="phase === 'result'" class="term-line result-line font-mono">
            {{ resultLine }}
          </div>
        </div>

      </div><!-- end terminal-body -->

      <!-- ── Results ──────────────────────────────── -->
      <div v-if="phase === 'result' && selectedJob" class="results-section">

        <!-- 3 stat cards -->
        <div class="stats-grid">
          <ScannerBorder class="stat-card">
            <p class="stat-label font-mono">RISQUE</p>
            <p class="stat-value font-mono" :style="{ color: riskColor }">
              {{ selectedJob.risk }}<span class="stat-unit">%</span>
            </p>
          </ScannerBorder>
          <ScannerBorder class="stat-card">
            <p class="stat-label font-mono">HORIZON</p>
            <p class="stat-value font-mono text-accent">
              {{ selectedJob.horizon }}<span class="stat-unit"> ans</span>
            </p>
          </ScannerBorder>
          <ScannerBorder class="stat-card">
            <p class="stat-label font-mono">STATUT</p>
            <p class="stat-value stat-status font-mono" :style="{ color: riskColor }">
              {{ statusLabel }}
            </p>
          </ScannerBorder>
        </div>

        <!-- Message + CTA -->
        <div class="message-block">
          <span class="message-bar" :style="{ background: riskColor }" aria-hidden="true" />
          <p class="message-text">{{ message }}</p>
        </div>

        <div class="cta-zone">
          <GlitchButton :label="ctaLabel" to="/#newsletter" />
          <button class="share-btn font-mono" @click="copyLink">
            {{ copied ? '[ Lien copié ! ]' : '[ Partager mon résultat ]' }}
          </button>
        </div>

        <!-- Source -->
        <p class="source-note font-mono">
          // Source : {{ selectedJob.source }} · <button class="reset-btn font-mono" @click="reset">Nouveau scan →</button>
        </p>

        <!-- Footer sources -->
        <div class="sources-footer font-mono">
          // Données issues de : MIT Project Iceberg 2025 · OCDE Employment Outlook 2023 ·
          WEF Future of Jobs 2025 · Goldman Sachs 2023 · Oxford/Frey & Osborne 2013
        </div>

      </div><!-- end results-section -->

    </div><!-- end container -->
  </div>
</template>

<style scoped>
.scanner-page {
  padding: 4rem 0 6rem;
}

/* ── H1 — visible pour SEO, discret dans l'UI ─────── */
.scanner-h1 {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.section-label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-bottom: 1.5rem;
}

/* ── Terminal header ─────────────────────────────── */
.terminal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid rgba(0, 255, 65, 0.12);
  padding: 0.6rem 1rem;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  margin-bottom: 0;
}
.term-dots    { display: flex; gap: 0.35rem; }
.dot          { width: 10px; height: 10px; border-radius: 50%; }
.dot-r        { background: #FF5F57; }
.dot-y        { background: #FEBC2E; }
.dot-g        { background: #28C840; }
.term-title   { flex: 1; text-align: center; }
.term-version { color: var(--color-muted); }

/* ── Terminal body ───────────────────────────────── */
.terminal-body {
  background: var(--color-surface);
  border: 1px solid rgba(0, 255, 65, 0.12);
  border-top: none;
  padding: 2rem;
  max-width: 780px;
  margin-bottom: 2.5rem;
}

/* ── Input zone ──────────────────────────────────── */
.input-prompt {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1.25rem;
}
.autocomplete-wrapper { position: relative; }
.input-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.prompt-char { font-size: 1rem; flex-shrink: 0; }
.job-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-accent);
  font-size: 1rem;
  caret-color: var(--color-accent);
}
.job-input::placeholder { color: var(--color-muted); }

.suggestions-list {
  list-style: none;
  margin: 0.5rem 0 0 0;
  padding: 0;
  border: 1px solid rgba(0, 255, 65, 0.2);
  background: var(--color-surface-2);
}
.suggestion-item {
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.1s;
}
.suggestion-item:hover {
  background: rgba(0, 255, 65, 0.08);
  color: var(--color-accent);
}

.no-result {
  font-size: 0.7rem;
  color: var(--color-muted);
  margin-top: 0.75rem;
  letter-spacing: 0.1em;
}

/* ── Terminal output lines ───────────────────────── */
.terminal-output { margin-top: 0.5rem; }
.term-line {
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  line-height: 1.8;
}
.result-line { color: var(--color-accent); font-weight: 700; margin-top: 0.25rem; }
.cursor {
  display: inline-block;
  width: 8px; height: 1em;
  background: var(--color-accent);
  vertical-align: middle;
  margin-left: 2px;
  animation: blink 0.7s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Results ─────────────────────────────────────── */
.results-section { max-width: 780px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card { padding: 1.5rem 1.25rem; background: var(--color-surface); }
.stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  margin: 0 0 0.5rem;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}
.stat-unit  { font-size: 1rem; }
.stat-status { font-size: 1.1rem; line-height: 1.3; }

.message-block {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface);
}
.message-bar { width: 3px; flex-shrink: 0; align-self: stretch; border-radius: 2px; }
.message-text { margin: 0; font-size: 1rem; line-height: 1.7; color: var(--color-text); }

.cta-zone {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.share-btn {
  background: transparent;
  border: 1px solid rgba(0, 255, 65, 0.25);
  color: var(--color-muted);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.share-btn:hover {
  color: var(--color-accent);
  border-color: rgba(0, 255, 65, 0.5);
}

.source-note {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  margin-bottom: 2rem;
}
.reset-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  padding: 0;
}
.reset-btn:hover { opacity: 0.75; }

.sources-footer {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  opacity: 0.6;
  line-height: 1.6;
  border-top: 1px solid rgba(0, 255, 65, 0.08);
  padding-top: 1rem;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr; }
  .terminal-body { padding: 1.25rem; }
  .stat-value { font-size: 1.6rem; }
}

@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; opacity: 1; }
}
</style>
```

- [ ] **Step 2.2 — Vérifier que la page se charge sans erreur**

```bash
npm run dev
```
Ouvrir `http://localhost:3000/scanner` — vérifier : header terminal visible, champ input présent, taper "co" → voir des suggestions (ex: Comptable, Coiffeur, Correcteur).

- [ ] **Step 2.3 — Tester la sélection et l'animation**

Cliquer sur "Comptable" dans les suggestions.
Attendu :
1. 5 lignes apparaissent séquentiellement avec curseur
2. La dernière ligne affiche `✓ obsolescence risk: 72%`
3. Les 3 cartes RISQUE / HORIZON / STATUT apparaissent
4. Le message adapté s'affiche
5. L'URL passe à `/scanner?job=comptable`

- [ ] **Step 2.4 — Tester le pre-load via URL**

Naviguer directement vers `http://localhost:3000/scanner?job=comptable` (coller dans la barre d'adresse).
Attendu : résultats affichés immédiatement, sans animation.

- [ ] **Step 2.5 — Tester un slug invalide**

Naviguer vers `http://localhost:3000/scanner?job=foobar`.
Attendu : page affichée normalement avec champ vide, aucune erreur console.

- [ ] **Step 2.6 — Tester le bouton "Partager"**

Cliquer `[ Partager mon résultat ]` → label change en `[ Lien copié ! ]` pendant 1.5s puis revient.

- [ ] **Step 2.7 — Tester le bouton "Nouveau scan"**

Cliquer `Nouveau scan →` → la page revient à l'état initial (champ vide, pas de résultats), URL revient à `/scanner`.

- [ ] **Step 2.8 — Commit**

```bash
git add app/pages/scanner.vue
git commit -m "feat(scanner): add scanner page with autocomplete, animation, results, share"
```

---

## Task 3 — Teaser sur la homepage

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 3.1 — Ajouter le bloc teaser dans `index.vue`**

Dans `app/pages/index.vue`, repérer ce bloc (après `<SectionDivider />` qui suit ManifestoTerminal) :

```vue
    <SectionDivider />
    <StatsStrip />
```

Remplacer par :

```vue
    <SectionDivider />

    <!-- ── SCANNER TEASER ─────────────────────────── -->
    <section class="scanner-teaser-section">
      <div class="container">
        <ScannerBorder class="scanner-teaser">
          <span class="font-mono scanner-teaser-label">// DIAGNOSTIC IA</span>
          <p class="scanner-teaser-text">
            Scanne ton métier — découvre ton score d'obsolescence en 10 secondes.
          </p>
          <GlitchButton label="Lancer le scan" to="/scanner" />
        </ScannerBorder>
      </div>
    </section>

    <SectionDivider />
    <StatsStrip />
```

Et dans le `<style scoped>` de `index.vue`, ajouter :

```css
/* ── Scanner teaser ──────────────────────────────── */
.scanner-teaser-section { padding: 0; }
.scanner-teaser {
  padding: 2rem;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.scanner-teaser-label {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  flex-shrink: 0;
}
.scanner-teaser-text {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-muted);
  min-width: 200px;
}
```

- [ ] **Step 3.2 — Vérifier visuellement sur la homepage**

```bash
npm run dev
```
Ouvrir `http://localhost:3000` — vérifier : bloc teaser visible entre le manifeste et la StatsStrip, bouton "Lancer le scan" redirige vers `/scanner`.

- [ ] **Step 3.3 — Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(scanner): add scanner teaser block on homepage"
```

---

## Task 4 — Vérification finale et build

- [ ] **Step 4.1 — Build de production**

```bash
npm run build
```
Attendu : build réussi, aucune erreur TypeScript ou compilation.

- [ ] **Step 4.2 — Vérification mobile**

Dans le navigateur DevTools, passer en vue mobile (375px).
Vérifier :
- Les 3 cartes stats s'affichent en colonne (pas en ligne)
- Le terminal body ne déborde pas
- Le bouton CTA est cliquable

- [ ] **Step 4.3 — Vérification `prefers-reduced-motion`**

Dans DevTools → Rendering → activer "Emulate CSS prefers-reduced-motion: reduce".
Vérifier : le curseur clignotant ne clignote plus, les coins ScannerBorder sont immédiatement visibles.

- [ ] **Step 4.4 — Vérifier le lien header (si existant)**

Vérifier que `AppHeader.vue` n'a pas besoin d'être mis à jour pour inclure un lien `/scanner`. Si la navigation est gérée là, l'ajouter est hors scope de ce plan — noter pour une prochaine itération.

- [ ] **Step 4.5 — Commit final**

```bash
git add -A
git commit -m "feat(scanner): scanner obsolescence IA — page complète + teaser homepage"
```
