# Scanner SEO long-tail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir les 196 métiers du Scanner v2 en pages statiques SEO-optimisées (`/scanner/[slug]`), avec une browse page (`/metiers`), du contenu éditorial unique par métier (~1000-1200 mots), un FAQ schema, et la suppression du gate newsletter pour libérer la viralité et l'indexabilité Google.

**Architecture:** Schéma `Job` étendu avec `secteur: JobSecteur` (7 valeurs). Routes Nuxt `/scanner/[slug].vue` (page métier statique) et `/metiers/index.vue` (browse). 8 nouveaux composants Vue. OG image dynamique `Metier.satori.vue`. Production éditoriale par 7 grappes sectorielles avec rédacteur agent + reviewer agent par grappe. Gate retiré du flow `/scanner` interactif (composant `ScannerGate.vue` débranché mais conservé pour réactivation future).

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, TypeScript, Tailwind 3.4, Nuxt Content (rapports), @nuxtjs/sitemap, nuxt-og-image (satori), PostHog, npm.

**Spec:** `docs/superpowers/specs/2026-05-09-scanner-seo-longtail-design.md`

**Verification approach:** `npm run build` (capture les erreurs TS au build), `npm run dev` + browser smoke test, grep pour invariants (slugs, mots bannis), Google Rich Results Test pour les schemas, Lighthouse SEO.

---

## File map

| Fichier | Action | Responsabilité |
|---|---|---|
| `app/data/jobs.ts` | edit | Ajouter `JobSecteur` type + champ `secteur` aux 196 entries |
| `app/data/secteurs.ts` | create | Catalogue des 7 secteurs (slug + label affiché + ordre) + helpers |
| `app/utils/job-similars.ts` | create | Helper `getSimilarJobs(job, limit)` + `getJobsBySecteur(secteur)` |
| `content/rapports/2026-04-25-bienvenue-survivant.md` | edit | Frontmatter : ajouter `secteurs:` |
| `content/rapports/2026-05-07-demence-numerique-simple-valideur.md` | edit | Frontmatter : ajouter `secteurs:` |
| `content/rapports/2026-05-08-ia-supprime-inefficience.md` | edit | Frontmatter : ajouter `secteurs:` |
| `content.config.ts` | edit | Étendre le schéma rapport pour accepter `secteurs[]` |
| `app/pages/scanner.vue` | edit | Retirer le flow gate (phase `'gated'` court-circuité), restaurer form newsletter en Section VI |
| `app/pages/scanner/[slug].vue` | create | Page métier statique (~1000-1200 mots) |
| `app/pages/metiers/index.vue` | create | Browse page (search + 7 sections sectorielles) |
| `app/components/MetierCard.vue` | create | Card minimaliste métier (browse + similaires) |
| `app/components/MetierEditorialSection.vue` | create | 3 angles éditoriaux concaténés (Section III) |
| `app/components/MetierFAQ.vue` | create | Accordions FAQ + JSON-LD FAQPage |
| `app/components/MetierArticles.vue` | create | Liste articles thématiques (conditionnelle) |
| `app/components/MetierSimilaires.vue` | create | Bloc 4-5 métiers similaires |
| `app/components/AuthorByline.vue` | create | "Par Mathieu Rerat · Deputy Head of IT · Mis à jour le {date}" |
| `app/components/OgImage/Metier.satori.vue` | create | OG image dynamique pages métier statiques |
| `app/pages/index.vue` | edit | Lien "Voir tous les métiers →" vers `/metiers` |
| `nuxt.config.ts` | edit | Ajouter `routeRules` pour `/scanner/**` et `/metiers` + `prerender.routes` |

---

## Task ordering & commit strategy

3 vagues séquentielles. Chaque vague produit des commits groupés cohérents.

**Vague 1 (Infrastructure)** : Tasks 1.1 → 1.10. Plusieurs commits intermédiaires (data, components, routes, gate-removal, posthog). La page `/scanner/[slug]` est live à la fin de la Vague 1 avec un contenu réduit (= scanner v2 actuel sans les 3 angles ni FAQ — les sections sont stubées avec un message "contenu à venir" ou simplement masquées via v-if).

**Vague 2 (Contenu éditorial)** : Tasks 2.1 → 2.7. Sept grappes sectorielles, une par commit. Chaque grappe est validée par Mathieu via le rapport du reviewer agent avant qu'on enchaîne.

**Vague 3 (QA finale + deploy)** : Tasks 3.1 → 3.2. QA + push.

---

# VAGUE 1 — INFRASTRUCTURE

## Task 1.1: Ajouter le champ `secteur` aux 196 jobs + créer `secteurs.ts`

**Files:**
- Create: `app/data/secteurs.ts`
- Modify: `app/data/jobs.ts`

- [ ] **Step 1: Créer `app/data/secteurs.ts`**

```ts
// app/data/secteurs.ts

export type JobSecteur =
  | 'cognitif-admin-finance-juridique'
  | 'tech-data-design'
  | 'marketing-comm-management'
  | 'sciences-ingenierie'
  | 'sante-care-education'
  | 'manuels-artisanat-transport'
  | 'juridique-extra-securite-divers'

export interface Secteur {
  slug: JobSecteur
  label: string           // affiché sur la browse + dans la section similaires
  shortLabel: string      // version compacte pour les badges
  order: number           // ordre d'affichage sur /metiers (basé sur volume desc)
}

export const SECTEURS: Secteur[] = [
  { slug: 'manuels-artisanat-transport',         label: 'Manuels, artisanat, transport',           shortLabel: 'Manuels & transport',     order: 1 },
  { slug: 'cognitif-admin-finance-juridique',    label: 'Cognitif, admin, finance, juridique',     shortLabel: 'Admin & finance',         order: 2 },
  { slug: 'marketing-comm-management',           label: 'Marketing, communication, management',   shortLabel: 'Marketing & comm',        order: 3 },
  { slug: 'sante-care-education',                label: 'Santé, care, éducation',                  shortLabel: 'Santé & éducation',       order: 4 },
  { slug: 'tech-data-design',                    label: 'Tech, data, design',                      shortLabel: 'Tech & data',             order: 5 },
  { slug: 'sciences-ingenierie',                 label: 'Sciences, ingénierie, supply chain',      shortLabel: 'Sciences & ingénierie',   order: 6 },
  { slug: 'juridique-extra-securite-divers',     label: 'Juridique, sécurité, métiers divers',    shortLabel: 'Sécurité & divers',       order: 7 },
]

export function findSecteurBySlug(slug: JobSecteur): Secteur {
  const found = SECTEURS.find(s => s.slug === slug)
  if (!found) throw new Error(`Secteur ${slug} not found`)
  return found
}

export function getSecteursOrdered(): Secteur[] {
  return [...SECTEURS].sort((a, b) => a.order - b.order)
}
```

- [ ] **Step 2: Étendre l'interface `Job` dans `app/data/jobs.ts`**

Localiser le bloc d'imports/types en haut de `app/data/jobs.ts`. Ajouter l'import et étendre l'interface :

```ts
// En haut du fichier, juste après les types existants
import type { JobSecteur } from './secteurs'

export type JobStatus = 'danger' | 'mutation' | 'protege' | 'croissance'
export type JobQuadrant = 'tiens' | 'pilotes' | 'pivotes' | 'mutes'

export interface Job {
  slug: string
  label: string
  risk: number
  horizon: number
  status: JobStatus
  dynamic: string
  sources: number[]
  quadrant: JobQuadrant
  potential: number
  leviers: string[]
  // ── nouveau pour le sous-projet 4 ─────────────────────
  secteur: JobSecteur
}
```

- [ ] **Step 3: Appliquer le mapping `slug → secteur` aux 196 entries**

Pour chaque entry du tableau `JOBS`, ajouter `, secteur: 'X'` après `leviers: [...]`. Le mapping est dérivé des grappes sectorielles utilisées en Vague 3 du Scanner v2.

**Mapping `slug → JobSecteur`** :

`cognitif-admin-finance-juridique` (~36 entries) :
```
teleconseiller, televendeur, saisie-de-donnees, redacteur-web, traducteur, correcteur, transcripteur,
comptable, analyste-credit, analyste-marketing, assistant-juridique, secretaire-juridique,
assistant-administratif, receptionniste, standardiste, agent-assurance, operateur-saisie,
secretaire, caissier, agent-recouvrement, employe-banque, specialiste-rp, editeur-reviseur,
redacteur-technique, specialiste-dossiers-medicaux, testeur-qa, controleur-gestion,
controller-gestion, auditeur, chargee-clientele, gestionnaire-paie, documentaliste,
redacteur-publicitaire, juriste, greffier, expert-comptable, analyste-financier, assistant-direction
```

`tech-data-design` (~28 entries) :
```
developpeur-logiciel, programmeur, designer-graphique, designer-web, ux-designer, data-scientist,
architecte-logiciel, support-informatique, chef-de-projet-it, infographiste, administrateur-sys,
ingenieur-reseau, responsable-si, ingenieur-fintech, ingenieur-ia, integrateur-ia,
expert-cybersecurite, specialiste-big-data, analyste-securite, architecte-bdd, statisticien,
gestionnaire-projet, business-analyst, asset-manager, portfolio-manager, actuaire,
technicien-support, analyste-donnees
```

`marketing-comm-management` (~28 entries) :
```
commercial, recruteur, responsable-rh, conseiller-financier, community-manager,
social-media-manager, responsable-com, responsable-communication, consultant-strategie,
consultant-it, product-manager, chef-de-produit, journaliste-presse, journaliste-tv,
analyste-renseignement, economiste, directeur-marketing, politologue, expert-immobilier,
agent-immobilier, photographe, videaste, coach-professionnel, formateur, formateur-adultes,
event-manager, archiviste, bibliothecaire
```

`sciences-ingenierie` (~20 entries) :
```
ingenieur-automobile, ingenieur-industriel, ingenieur-mecanique, ingenieur-civil,
ingenieur-automatisme, biologiste, chimiste, physicien, architecte, urbaniste, geometre,
technicien-laboratoire, technicien-son, gestionnaire-stock, logisticien, responsable-logistique,
responsable-qualite, responsable-hse, responsable-achats, acheteur
```

`sante-care-education` (~27 entries) :
```
cardiologue, medecin-generaliste, psychiatre, psychologue, chirurgien, dentiste, veterinaire,
kinesitherapeute, masseur, osteopathe, infirmier, aide-soignant, auxiliaire-vie, sage-femme,
orthophoniste, ergotherapeute, educateur-specialise, dieteticien, ambulancier, travailleur-social,
enseignant, enseignant-primaire, enseignant-college, professeur-universitaire, professeur-lycee,
radiologue, pharmacien
```

`manuels-artisanat-transport` (~38 entries) :
```
macon, plombier, electricien, mecanicien, soudeur, carreleur, peintre-batiment, menuisier,
ebeniste, chef-de-chantier, chef-cuisinier, cuisinier-rapide, cuisinier-restaurant, boulanger,
boucher, patissier, fleuriste, coiffeur, esthetique, technicien-cvc, technicien-eolien,
technicien-solaire, conducteur-engins, technicien-maintenance, serrurier, chauffeur-livreur,
chauffeur-poids-lourd, pilote-ligne, controleur-aerien, conducteur-train, chauffeur-taxi-vtc,
moniteur-auto-ecole, moniteur-sport, agriculteur, maraicher, eleveur, agent-de-voyage
```

`juridique-extra-securite-divers` (~19 entries) :
```
avocat, notaire, juge, artificier, pompier, policier, militaire, operateur-crematorium,
directeur-general, directeur-financier, sportif-pro, comedien, musicien, artiste-plasticien,
guide-touristique, specialiste-energies-renouvelables, specialiste-batiment-durable, pompiste,
ouvrier-agricole
```

Note: `ouvrier-agricole` n'apparaît dans aucune grappe Scanner v2 → rattaché à `juridique-extra-securite-divers` par défaut comme métier "divers".

**Approche pratique** : écrire un script one-shot dans `scripts/migrate-jobs-secteur.mjs` qui parse `jobs.ts`, utilise le mapping ci-dessus pour ajouter `, secteur: 'X'` à chaque entry, et réécrit le fichier. Supprimer le script après usage.

- [ ] **Step 4: Vérifier la couverture**

Run :
```bash
cd /Users/mathieu/Documents/survivor && grep -c "secteur: '" app/data/jobs.ts
```
Expected: 196.

```bash
grep -oE "secteur: '[a-z-]+'" app/data/jobs.ts | sort | uniq -c
```
Expected (volume desc) :
```
   ~38 secteur: 'manuels-artisanat-transport'
   ~38 secteur: 'cognitif-admin-finance-juridique'
   ~28 secteur: 'marketing-comm-management'
   ~28 secteur: 'tech-data-design'
   ~27 secteur: 'sante-care-education'
   ~20 secteur: 'sciences-ingenierie'
   ~19 secteur: 'juridique-extra-securite-divers'
```

- [ ] **Step 5: Build verification**

Run: `npm run build`
Expected: succès, pas d'erreur TS sur l'import `JobSecteur`.

- [ ] **Step 6: Commit**

```bash
git add app/data/secteurs.ts app/data/jobs.ts
git commit -m "feat(seo): ajouter champ secteur (7 valeurs) aux 196 jobs"
```

---

## Task 1.2: Ajouter `secteurs[]` aux frontmatters des rapports + étendre le schéma Content

**Files:**
- Modify: `content.config.ts`
- Modify: `content/rapports/2026-04-25-bienvenue-survivant.md`
- Modify: `content/rapports/2026-05-07-demence-numerique-simple-valideur.md`
- Modify: `content/rapports/2026-05-08-ia-supprime-inefficience.md`

- [ ] **Step 1: Lire le content.config.ts actuel**

```bash
cat /Users/mathieu/Documents/survivor/content.config.ts
```

Comprendre le schéma rapport actuel.

- [ ] **Step 2: Étendre le schéma pour accepter `secteurs[]`**

Dans `content.config.ts`, dans la définition du collection `rapports`, ajouter le champ `secteurs` :

```ts
secteurs: z.array(z.enum([
  'cognitif-admin-finance-juridique',
  'tech-data-design',
  'marketing-comm-management',
  'sciences-ingenierie',
  'sante-care-education',
  'manuels-artisanat-transport',
  'juridique-extra-securite-divers',
])).optional()
```

(Ajuster en fonction de la syntaxe Nuxt Content v3 utilisée — `defineCollection` avec `schema: z.object({...})`.)

- [ ] **Step 3: Tagger les 3 rapports existants**

Dans chaque fichier markdown, ajouter le champ `secteurs:` au frontmatter.

`content/rapports/2026-04-25-bienvenue-survivant.md` — message d'accueil générique, à laisser sans secteurs (champ omis ou tableau vide). Justification : article meta non-spécialisé, ne doit pas s'afficher dans le filtrage par secteur.

`content/rapports/2026-05-07-demence-numerique-simple-valideur.md` — sujet : "démence numérique" et "simple valideur". Couvre la dynamique cognitive. Tagger :
```yaml
secteurs:
  - cognitif-admin-finance-juridique
  - tech-data-design
```

`content/rapports/2026-05-08-ia-supprime-inefficience.md` — sujet : "L'IA supprime l'inefficience" + leviers carrière. Couvre l'angle pivot universel. Tagger :
```yaml
secteurs:
  - cognitif-admin-finance-juridique
  - tech-data-design
  - marketing-comm-management
```

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: succès, le content collection accepte les nouveaux frontmatters.

- [ ] **Step 5: Commit**

```bash
git add content.config.ts content/rapports/
git commit -m "feat(seo): étendre schéma rapport avec secteurs[] + tagger les 3 articles existants"
```

---

## Task 1.3: Helpers de filtrage et lookups

**Files:**
- Create: `app/utils/job-similars.ts`

- [ ] **Step 1: Créer le fichier helper**

```ts
// app/utils/job-similars.ts
import type { Job, JobSecteur } from '~/data/jobs'
import { JOBS } from '~/data/jobs'

/**
 * Retourne les jobs du même secteur que `current`, triés par proximité de risk score,
 * limité à `limit` (défaut 5). Exclut le job `current` lui-même.
 */
export function getSimilarJobs(current: Job, limit = 5): Job[] {
  return JOBS
    .filter(j => j.secteur === current.secteur && j.slug !== current.slug)
    .sort((a, b) => Math.abs(a.risk - current.risk) - Math.abs(b.risk - current.risk))
    .slice(0, limit)
}

/**
 * Retourne tous les jobs d'un secteur donné, triés par risk croissant.
 */
export function getJobsBySecteur(secteur: JobSecteur): Job[] {
  return JOBS
    .filter(j => j.secteur === secteur)
    .sort((a, b) => a.risk - b.risk)
}

/**
 * Retourne tous les jobs filtrés par query (label match, case-insensitive).
 * Utilisé sur la browse page /metiers pour la search bar.
 */
export function searchJobsByLabel(query: string): Job[] {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return JOBS
  return JOBS.filter(j => j.label.toLowerCase().includes(q))
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: succès.

- [ ] **Step 3: Commit**

```bash
git add app/utils/job-similars.ts
git commit -m "feat(seo): helpers getSimilarJobs / getJobsBySecteur / searchJobsByLabel"
```

---

## Task 1.4: Retirer le gate du flow `/scanner` interactif

**Files:**
- Modify: `app/pages/scanner.vue`

Le flow actuel passe par `phase === 'gated'` puis `phase === 'unlocked'` après inscription au gate. On court-circuite : après la fin du scan animation, on passe direct à `'unlocked'` (renommage interne pour minimum changement, mais on pourrait aussi simplifier la machine).

- [ ] **Step 1: Lire la machine de phase actuelle**

```bash
grep -nE "phase\.value\s*=\s*'(gated|unlocked|unlocking|scanning|idle)'" app/pages/scanner.vue
```

Identifier les transitions :
- `'gated'` → où est-ce setté ?
- `'unlocked'` → où ?
- `'unlocking'` → transition intermédiaire qu'on peut supprimer ou garder

- [ ] **Step 2: Modifier les transitions**

Remplacer toutes les assignations `phase.value = 'gated'` par `phase.value = 'unlocked'`. Effet : le gate n'apparaît plus jamais — le résultat s'affiche directement après l'animation terminal.

Run :
```bash
grep -nE "phase\.value\s*=\s*'gated'" app/pages/scanner.vue
```
Expected: 0 matches après modification.

- [ ] **Step 3: Conserver le composant `ScannerGate.vue` (débranché)**

Localiser dans le `<template>` :
```vue
<ScannerGate
  v-if="phase === 'gated' && selectedJob"
  :job="selectedJob"
  @unlocked="onGateUnlocked"
/>
```

Comme la condition `phase === 'gated'` ne sera plus jamais vraie, le composant n'est plus rendu. **Garder le code dans le template** (commenté ou non — préférence : laisser tel quel pour permettre une réactivation future via un simple flip de la condition).

Alternative plus propre : envelopper dans une feature flag :
```vue
<!-- Gate désactivé en sous-projet 4 SEO. Réactivable en flippant SCANNER_GATE_ENABLED. -->
<ScannerGate
  v-if="SCANNER_GATE_ENABLED && phase === 'gated' && selectedJob"
  :job="selectedJob"
  @unlocked="onGateUnlocked"
/>
```
Et ajouter en haut du `<script setup>` :
```ts
const SCANNER_GATE_ENABLED = false  // Flip à true pour réactiver le gate
```

- [ ] **Step 4: Restaurer le form newsletter en Section VI**

La Section VI actuelle (post-gate-removal en Scanner v2) affiche un thank-you. La modifier pour afficher le form newsletter inline. Dans le bloc Section VI :

Remplacer le contenu thank-you par :
```vue
<section class="result-section">
  <div class="section-kicker font-mono">
    <span class="num">— VI.</span>
    <span class="label">La suite</span>
  </div>

  <h2 class="suite-headline">Reste un cran devant.</h2>

  <p class="suite-lead">
    Un nouvel article chaque semaine pour piloter l'IA dans ton métier.
    Cinq minutes de lecture, sans hype, sans funnel. Concret, terrain.
  </p>

  <form class="suite-form" @submit.prevent="onSubscribe">
    <div class="suite-form-row">
      <input
        v-model="prenomInput"
        type="text"
        class="suite-input suite-input--prenom"
        placeholder="Prénom"
        required
        autocomplete="given-name"
      />
      <input
        v-model="emailInput"
        type="email"
        class="suite-input"
        placeholder="ton@email.pro"
        required
        autocomplete="email"
      />
      <button type="submit" class="suite-button font-mono" :disabled="submitting">
        {{ submitting ? '...' : 'Rejoindre →' }}
      </button>
    </div>

    <label class="suite-checkbox">
      <input v-model="formationsInterest" type="checkbox" />
      <span>Préviens-moi en avance des formations approfondies (bientôt). Accès en avant-première et tarif lancement.</span>
    </label>

    <label class="suite-checkbox">
      <input v-model="consentChecked" type="checkbox" required />
      <span>J'accepte de recevoir La Fréquence (newsletter hebdo, désinscription en 1 clic).</span>
    </label>

    <p v-if="submitMessage" class="suite-message" :class="{ 'is-error': submitError }">{{ submitMessage }}</p>
  </form>
</section>
```

Et ajouter dans `<script setup>` les refs et `onSubscribe` :

```ts
const prenomInput = ref('')
const emailInput = ref('')
const formationsInterest = ref(false)
const consentChecked = ref(false)
const submitting = ref(false)
const submitError = ref(false)
const submitMessage = ref('')

async function onSubscribe() {
  if (!selectedJob.value) return
  if (!consentChecked.value) {
    submitError.value = true
    submitMessage.value = 'Consentement requis.'
    return
  }
  submitting.value = true
  submitError.value = false
  submitMessage.value = ''

  try {
    const res = await $fetch<{ ok: boolean }>('/api/subscribe', {
      method: 'POST',
      body: {
        prenom: prenomInput.value,
        email: emailInput.value,
        consent: true,
        source: 'scanner_inline',
        job_slug: selectedJob.value.slug,
        job_status: selectedJob.value.status,
        job_quadrant: selectedJob.value.quadrant,
        job_risk: selectedJob.value.risk,
        job_potential: selectedJob.value.potential,
        formations_interest: formationsInterest.value,
      },
    })
    if (res.ok) {
      submitMessage.value = 'C\'est bon. Premier article dans 7 jours max.'
      prenomInput.value = ''
      emailInput.value = ''
      formationsInterest.value = false
      consentChecked.value = false
      capture('newsletter_subscribed_from_scanner', {
        job_slug: selectedJob.value.slug,
        job_quadrant: selectedJob.value.quadrant,
        formations_interest: formationsInterest.value,
      })
    }
  } catch (e: any) {
    submitError.value = true
    submitMessage.value = e?.data?.message ?? 'Erreur technique, réessayez.'
  } finally {
    submitting.value = false
  }
}
```

- [ ] **Step 5: Ajouter les CSS pour le form (s'ils n'existent pas déjà ou ont été supprimés)**

À la fin du `<style scoped>` :

```css
.suite-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
}
.suite-form-row { display: flex; gap: 8px; flex-wrap: wrap; }
.suite-input {
  flex: 1;
  min-width: 180px;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #2A2A2A;
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s;
}
.suite-input:focus { border-color: var(--color-accent); }
.suite-input--prenom { max-width: 140px; }
.suite-button {
  padding: 14px 22px;
  background: var(--color-accent);
  border: none;
  color: var(--color-bg);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}
.suite-button:disabled { opacity: 0.5; cursor: wait; }
.suite-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.55;
}
.suite-checkbox input { margin-top: 3px; flex-shrink: 0; accent-color: var(--color-accent); }
.suite-message { font-size: 13px; margin: 0; color: var(--color-accent); }
.suite-message.is-error { color: var(--color-danger); }
```

- [ ] **Step 6: Build + smoke test**

Run: `npm run build`
Expected: succès.

Manual : `npm run dev`, visiter `/scanner?job=comptable`, confirmer que :
- Le scan démarre
- L'animation terminal joue
- Le résultat s'affiche directement (PAS de gate)
- Le form newsletter apparaît en Section VI

- [ ] **Step 7: Commit**

```bash
git add app/pages/scanner.vue
git commit -m "feat(seo): retirer gate du scanner interactif, restaurer form newsletter en Section VI"
```

---

## Task 1.5: Créer `MetierCard.vue` (utilisé sur browse + similaires)

**Files:**
- Create: `app/components/MetierCard.vue`

- [ ] **Step 1: Créer le composant**

```vue
<!-- app/components/MetierCard.vue -->
<script setup lang="ts">
import type { Job, JobQuadrant } from '~/data/jobs'

defineProps<{
  job: Job
}>()

const QUADRANT_LABEL: Record<JobQuadrant, string> = {
  tiens:    'TU TIENS',
  pilotes:  'TU PILOTES',
  pivotes:  'TU PIVOTES',
  mutes:    'TU MUTES',
}

const QUADRANT_COLOR: Record<JobQuadrant, string> = {
  tiens:    'var(--color-protege)',
  pilotes:  'var(--color-croissance)',
  pivotes:  'var(--color-danger)',
  mutes:    'var(--color-mutation)',
}
</script>

<template>
  <NuxtLink
    :to="`/scanner/${job.slug}`"
    class="metier-card"
    :data-attr="`metier-card-${job.slug}`"
  >
    <h3 class="metier-card-label">{{ job.label }}</h3>
    <div class="metier-card-meta font-mono">
      <span
        class="metier-card-badge"
        :style="{ '--badge-color': QUADRANT_COLOR[job.quadrant] } as any"
      >
        {{ QUADRANT_LABEL[job.quadrant] }}
      </span>
      <span class="metier-card-risk">{{ job.risk }}%</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.metier-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #2A2A2A;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.15s, background 0.15s;
}
.metier-card:hover {
  border-color: var(--color-accent);
  background: rgba(108, 227, 181, 0.03);
}
.metier-card-label {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}
.metier-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  letter-spacing: 0.1em;
}
.metier-card-badge {
  color: var(--badge-color);
  font-weight: 700;
}
.metier-card-risk {
  color: var(--color-muted);
}
</style>
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: succès.

- [ ] **Step 3: Commit**

```bash
git add app/components/MetierCard.vue
git commit -m "feat(seo): MetierCard component (browse + similaires)"
```

---

## Task 1.6: Créer `AuthorByline.vue`

**Files:**
- Create: `app/components/AuthorByline.vue`

- [ ] **Step 1: Créer le composant**

```vue
<!-- app/components/AuthorByline.vue -->
<script setup lang="ts">
defineProps<{
  dateModified?: string  // ISO date string
}>()

const formattedDate = computed(() => {
  if (!props.dateModified) return ''
  return new Date(props.dateModified).toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <div class="author-byline font-mono">
    <span class="author-prefix">Par</span>
    <NuxtLink to="/identite" class="author-name">Mathieu Rerat</NuxtLink>
    <span class="author-sep">·</span>
    <span class="author-role">Deputy Head of IT</span>
    <span v-if="formattedDate" class="author-sep">·</span>
    <span v-if="formattedDate" class="author-date">Mis à jour le {{ formattedDate }}</span>
  </div>
</template>

<style scoped>
.author-byline {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  text-transform: uppercase;
  padding: 16px 0;
}
.author-name {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s;
}
.author-name:hover { color: var(--color-accent); }
.author-sep { color: #2A2A2A; }
.author-role,
.author-date,
.author-prefix { color: var(--color-muted); }
</style>
```

- [ ] **Step 2: Build + commit**

```bash
npm run build && git add app/components/AuthorByline.vue && git commit -m "feat(seo): AuthorByline component (E-E-A-T signal)"
```

---

## Task 1.7: Créer `MetierFAQ.vue`

**Files:**
- Create: `app/components/MetierFAQ.vue`

- [ ] **Step 1: Créer le composant**

```vue
<!-- app/components/MetierFAQ.vue -->
<script setup lang="ts">
import type { Job } from '~/data/jobs'

const props = defineProps<{
  job: Job
  faq: Array<{ question: string, answer: string }>
}>()

const { capture } = usePosthogEvent()

// JSON-LD FAQPage injecté en <head>
useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: props.faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }),
  }],
}))

function onAccordionToggle(index: number, question: string) {
  capture('metier_faq_opened', {
    slug: props.job.slug,
    question_index: index,
    question_text: question,
  })
}
</script>

<template>
  <section class="metier-faq">
    <div class="section-kicker font-mono">
      <span class="num">— IV.</span>
      <span class="label">Questions fréquentes</span>
    </div>

    <div class="faq-list">
      <details
        v-for="(item, i) in faq"
        :key="i"
        class="faq-item"
        @toggle="onAccordionToggle(i, item.question)"
      >
        <summary class="faq-question">
          <span class="faq-q-text">{{ item.question }}</span>
          <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
        </summary>
        <p class="faq-answer">{{ item.answer }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.metier-faq { padding: 0 32px; }
.section-kicker {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}
.section-kicker .num { color: var(--color-accent); }
.section-kicker .label {
  letter-spacing: 0.22em;
  color: var(--color-text);
  opacity: 0.7;
}

.faq-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(108, 227, 181, 0.12);
}
.faq-item {
  border-bottom: 1px solid rgba(108, 227, 181, 0.12);
  transition: background 0.2s;
}
.faq-item:hover { background: var(--color-surface-2); }
.faq-item[open] { background: var(--color-surface-2); }
.faq-question {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  user-select: none;
}
.faq-question::-webkit-details-marker { display: none; }
.faq-q-text { flex: 1; line-height: 1.45; }
.faq-q-icon {
  flex-shrink: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-muted);
  transition: transform 0.2s ease, color 0.15s;
  width: 1.5em;
  text-align: center;
}
.faq-item[open] .faq-q-icon {
  transform: rotate(45deg);
  color: var(--color-accent);
}
.faq-answer {
  padding: 0 1.5rem 1.5rem;
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-muted);
  max-width: 75ch;
}
</style>
```

- [ ] **Step 2: Build + commit**

```bash
npm run build && git add app/components/MetierFAQ.vue && git commit -m "feat(seo): MetierFAQ component (accordions + JSON-LD FAQPage)"
```

---

## Task 1.8: Créer `MetierEditorialSection.vue` + `MetierArticles.vue` + `MetierSimilaires.vue`

**Files:**
- Create: `app/components/MetierEditorialSection.vue`
- Create: `app/components/MetierArticles.vue`
- Create: `app/components/MetierSimilaires.vue`

- [ ] **Step 1: Créer `MetierEditorialSection.vue`**

```vue
<!-- app/components/MetierEditorialSection.vue -->
<script setup lang="ts">
import type { Job, JobQuadrant } from '~/data/jobs'

defineProps<{
  job: Job
  contexte: string         // Angle 1 — Contexte sectoriel (~200 mots, markdown autorisé)
  trajectoire: string      // Angle 2 — Trajectoire concrète (~250 mots)
  anticipation: string     // Angle 3 — Anticipation 2026-2030 (~200 mots)
}>()

const QUADRANT_HEADING: Record<JobQuadrant, string> = {
  tiens:    'Pourquoi ton métier tient',
  pilotes:  'Pourquoi tu es bien placé',
  pivotes:  'Pourquoi tu dois anticiper',
  mutes:    'Pourquoi ton métier mute',
}
</script>

<template>
  <section class="metier-editorial">
    <div class="section-kicker font-mono">
      <span class="num">— III.</span>
      <span class="label">{{ QUADRANT_HEADING[job.quadrant] }}</span>
    </div>

    <article class="editorial-content">
      <!-- Angle 1 — Contexte sectoriel -->
      <div class="editorial-angle" v-html="contexte" />

      <!-- Angle 2 — Trajectoire concrète -->
      <h3 class="editorial-subheading">Une trajectoire concrète</h3>
      <div class="editorial-angle" v-html="trajectoire" />

      <!-- Angle 3 — Anticipation 2026-2030 -->
      <h3 class="editorial-subheading">Ce qui vient pour ton métier</h3>
      <div class="editorial-angle" v-html="anticipation" />
    </article>
  </section>
</template>

<style scoped>
.metier-editorial { padding: 0 32px; }
.section-kicker {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
}
.section-kicker .num { color: var(--color-accent); }
.section-kicker .label {
  letter-spacing: 0.22em;
  color: var(--color-text);
  opacity: 0.7;
}

.editorial-content {
  max-width: 680px;
}
.editorial-angle {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-text);
  opacity: 0.92;
  margin-bottom: 28px;
}
.editorial-angle :deep(p) { margin: 0 0 1em 0; }
.editorial-angle :deep(p:last-child) { margin-bottom: 0; }
.editorial-angle :deep(strong) { color: var(--color-accent); font-weight: 600; }
.editorial-angle :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-color: rgba(108, 227, 181, 0.35);
  text-underline-offset: 3px;
}
.editorial-angle :deep(a:hover) {
  text-decoration-color: var(--color-accent);
}

.editorial-subheading {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 400;
  color: var(--color-text);
  margin: 36px 0 20px 0;
}
</style>
```

- [ ] **Step 2: Créer `MetierArticles.vue`**

```vue
<!-- app/components/MetierArticles.vue -->
<script setup lang="ts">
import type { Job } from '~/data/jobs'

const props = defineProps<{
  job: Job
}>()

const { capture } = usePosthogEvent()

// Query Nuxt Content : articles dont le frontmatter `secteurs` contient le secteur du job
const { data: articles } = await useAsyncData(
  `metier-articles-${props.job.slug}`,
  () => queryCollection('rapports')
    .where('secteurs', 'IN', [props.job.secteur])
    .order('date', 'DESC')
    .limit(3)
    .all(),
)

function onArticleClick(articleSlug: string) {
  capture('metier_article_clicked', {
    from_slug: props.job.slug,
    article_slug: articleSlug,
  })
}
</script>

<template>
  <div v-if="articles && articles.length > 0" class="metier-articles">
    <h3 class="articles-heading font-mono">Articles thématiques</h3>
    <ul class="articles-list">
      <li v-for="article in articles" :key="article.path" class="article-item">
        <NuxtLink
          :to="article.path"
          class="article-link"
          @click="onArticleClick(article.path)"
        >
          <span class="article-title">{{ article.title }}</span>
          <span v-if="article.description" class="article-desc">{{ article.description }}</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.metier-articles { margin-bottom: 32px; }
.articles-heading {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--color-accent);
  text-transform: uppercase;
  margin: 0 0 16px;
  font-weight: 400;
}
.articles-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.article-item {}
.article-link {
  display: block;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #2A2A2A;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.15s, background 0.15s;
}
.article-link:hover {
  border-color: var(--color-accent);
  background: rgba(108, 227, 181, 0.03);
}
.article-title {
  display: block;
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 18px;
  line-height: 1.3;
  margin-bottom: 4px;
  color: var(--color-text);
}
.article-desc {
  display: block;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.5;
}
</style>
```

- [ ] **Step 3: Créer `MetierSimilaires.vue`**

```vue
<!-- app/components/MetierSimilaires.vue -->
<script setup lang="ts">
import type { Job } from '~/data/jobs'
import { getSimilarJobs } from '~/utils/job-similars'
import MetierCard from './MetierCard.vue'

const props = defineProps<{
  job: Job
}>()

const { capture } = usePosthogEvent()

const similaires = computed(() => getSimilarJobs(props.job, 5))

function onSimilarClick(toSlug: string) {
  capture('metier_similar_clicked', {
    from_slug: props.job.slug,
    to_slug: toSlug,
    from_secteur: props.job.secteur,
  })
}
</script>

<template>
  <div class="metier-similaires">
    <h3 class="similaires-heading font-mono">Métiers similaires</h3>
    <div class="similaires-grid">
      <div
        v-for="similar in similaires"
        :key="similar.slug"
        @click="onSimilarClick(similar.slug)"
      >
        <MetierCard :job="similar" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.metier-similaires {}
.similaires-heading {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--color-accent);
  text-transform: uppercase;
  margin: 0 0 16px;
  font-weight: 400;
}
.similaires-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
</style>
```

- [ ] **Step 4: Build + commit**

```bash
npm run build && git add app/components/Metier*.vue && git commit -m "feat(seo): MetierEditorialSection + MetierArticles + MetierSimilaires"
```

---

## Task 1.9: Créer `Metier.satori.vue` (OG image dynamique pages métier)

**Files:**
- Create: `app/components/OgImage/Metier.satori.vue`

- [ ] **Step 1: Créer le composant**

(Reprend la structure de `Scanner.satori.vue` créé en Scanner v2.)

```vue
<!-- app/components/OgImage/Metier.satori.vue -->
<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  verdict?: string
  quadrant?: 'tiens' | 'pilotes' | 'pivotes' | 'mutes'
  risk?: number
  potential?: number
  secteurLabel?: string
}>(), {
  label: 'Mon métier',
  verdict: 'Tu mutes.',
  quadrant: 'mutes',
  risk: 0,
  potential: 0,
  secteurLabel: '',
})
</script>

<template>
  <div
    style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px;
      background-color: #0F0F0E;
      color: #E8E5DD;
      font-family: 'Inter', sans-serif;
    "
  >
    <!-- Top sage rule -->
    <div style="width: 80px; height: 1px; background-color: #6CE3B5; margin-bottom: 40px;" />

    <!-- Kicker -->
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px;">
      <div style="width: 12px; height: 12px; background-color: #6CE3B5;" />
      <span
        style="
          font-family: 'Space Mono', monospace;
          font-size: 22px;
          letter-spacing: 0.22em;
          color: #6CE3B5;
          text-transform: uppercase;
        "
      >Diagnostic IA · {{ label }}</span>
    </div>

    <!-- Big italic verdict -->
    <div
      style="
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 400;
        font-size: 120px;
        line-height: 1;
        letter-spacing: -0.02em;
        color: #E8E5DD;
        text-align: center;
        margin-bottom: 40px;
      "
    >{{ verdict }}</div>

    <!-- Scores line -->
    <div style="display: flex; align-items: center; gap: 32px; margin-bottom: 32px;">
      <div style="display: flex; align-items: baseline; gap: 8px;">
        <span style="font-family: 'Space Mono', monospace; font-size: 56px; font-weight: 700; color: #FFA630;">{{ risk }}</span>
        <span style="font-family: 'Space Mono', monospace; font-size: 28px; color: #888;">/100</span>
        <span style="font-family: 'Space Mono', monospace; font-size: 18px; letter-spacing: 0.2em; color: #888; text-transform: uppercase; margin-left: 12px;">risque</span>
      </div>
      <span style="font-family: 'Space Mono', monospace; font-size: 28px; color: #2A2A2A;">·</span>
      <div style="display: flex; align-items: baseline; gap: 8px;">
        <span style="font-family: 'Space Mono', monospace; font-size: 56px; font-weight: 700; color: #6CE3B5;">{{ potential }}</span>
        <span style="font-family: 'Space Mono', monospace; font-size: 28px; color: #888;">/100</span>
        <span style="font-family: 'Space Mono', monospace; font-size: 18px; letter-spacing: 0.2em; color: #888; text-transform: uppercase; margin-left: 12px;">levier IA</span>
      </div>
    </div>

    <!-- Secteur label (optional, small) -->
    <div
      v-if="secteurLabel"
      style="
        font-family: 'Space Mono', monospace;
        font-size: 16px;
        letter-spacing: 0.2em;
        color: #888;
        text-transform: uppercase;
        margin-bottom: 40px;
      "
    >{{ secteurLabel }}</div>

    <!-- Bottom sage rule -->
    <div style="width: 80px; height: 1px; background-color: #6CE3B5; margin-bottom: 40px;" />

    <!-- Foot: brand mark + URL -->
    <div style="display: flex; align-items: center; gap: 20px;">
      <svg width="40" height="40" viewBox="0 0 1053.4 1058.4">
        <polygon
          fill="#6CE3B5"
          points="40.7,1019.2 39.7,863.2 234.2,831.7 234.2,604.7 39.7,573.2 39.7,418.2 1014.2,640.7 1011.7,797.2 40.7,1019.2"
        />
        <polygon
          fill="#6CE3B5"
          points="1013.7,256.2 39.7,256.2 39.2,39.7 1013.7,39.2 1013.7,256.2"
        />
      </svg>
      <span
        style="
          font-family: 'Space Mono', monospace;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #C5C2BB;
          text-transform: uppercase;
        "
      >survivant-ia.ch</span>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Build + commit**

```bash
npm run build && git add app/components/OgImage/Metier.satori.vue && git commit -m "feat(seo): Metier.satori.vue OG image dynamique pour pages métier statiques"
```

---

## Task 1.10: Créer la route `/scanner/[slug].vue` (page métier statique)

**Files:**
- Create: `app/data/metier-content.ts` (squelette, sera rempli en Vague 2)
- Create: `app/pages/scanner/[slug].vue`

- [ ] **Step 1: Créer le squelette de contenu éditorial**

Créer `app/data/metier-content.ts` :

```ts
// app/data/metier-content.ts
import type { JobQuadrant } from './jobs'

export interface MetierEditorialContent {
  contexte: string         // Angle 1 — Contexte sectoriel (markdown HTML autorisé)
  trajectoire: string      // Angle 2 — Trajectoire concrète
  anticipation: string     // Angle 3 — Anticipation 2026-2030
  faq: Array<{ question: string, answer: string }>   // 5 entries
  dateModified: string     // ISO date
}

/**
 * Map slug → contenu éditorial. Rempli progressivement par les agents en Vague 2.
 * Si un slug n'a pas de contenu ici, la page utilise le fallback per-quadrant
 * (cf. getQuadrantFallbackContent).
 */
export const METIER_CONTENT: Record<string, MetierEditorialContent> = {
  // Rempli par les agents en Vague 2
}

/**
 * Fallback générique par quadrant si un job n'a pas de contenu spécifique.
 * Utilisé en Vague 1 (placeholder) et pour les jobs jamais enrichis.
 */
export function getQuadrantFallbackContent(quadrant: JobQuadrant, dateModified: string): MetierEditorialContent {
  const TEMPLATES: Record<JobQuadrant, Pick<MetierEditorialContent, 'contexte' | 'trajectoire' | 'anticipation' | 'faq'>> = {
    mutes: {
      contexte: '<p>Ton métier est dans une zone de mutation forte. Les rapports 2026 (<a href="https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts" target="_blank" rel="noopener">Tufts AI Jobs Risk Index</a>, McKinsey Global Institute, World Economic Forum) convergent : tes tâches préparatoires basculent dans l\'IA, mais la valeur de ton expertise se déplace vers la validation, l\'arbitrage et la responsabilité. Ceux qui pilotent l\'IA dans leur métier passent devant les autres.</p>',
      trajectoire: '<p>Le pattern qui marche : intégrer un outil IA dans une tâche que tu fais déjà 2-3 heures par semaine, mesurer le gain, le documenter publiquement. En 60 jours, tu deviens la référence interne de ton équipe sur la question.</p>',
      anticipation: '<p>D\'ici 2030 : la valeur ajoutée du junior s\'effondre, celle du senior IA-augmenté triple. Ceux qui ont pris le virage tôt sont ceux que les recruteurs s\'arrachent.</p>',
      faq: [
        { question: 'Mon métier va-t-il disparaître avec l\'IA ?', answer: 'Non, mais il mute. Les tâches préparatoires sont automatisées, l\'expertise humaine se déplace vers la validation et l\'arbitrage. C\'est là que se concentre la valeur.' },
        { question: 'Combien de temps me reste-t-il ?', answer: 'Variable selon ton secteur, mais la fenêtre est de 2 à 5 ans pour repositionner ta valeur. Plus tu attends, plus tu seras commoditisé.' },
        { question: 'Faut-il pivoter de carrière ?', answer: 'Non, repositionner. Ton expertise reste précieuse, mais elle s\'exprime différemment : moins de production, plus de validation et de conseil.' },
        { question: 'Comment se former ?', answer: 'Anthropic Academy (gratuit) pour les bases, puis spécialisation sectorielle. 4-6h par semaine pendant 2 mois suffisent pour passer devant les autres.' },
        { question: 'Quels outils maîtriser en priorité ?', answer: 'Un outil généraliste (Claude ou ChatGPT) + un outil sectoriel propre à ton métier. Trois outils suffisent pour reprendre 4-6h par semaine.' },
      ],
    },
    pilotes: {
      contexte: '<p>Ton métier est solidement positionné face à l\'IA. Les rapports 2026 (<a href="https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts" target="_blank" rel="noopener">Tufts AI Jobs Risk Index</a>, McKinsey, WEF) le confirment : exposition limitée + capacité d\'amplification forte. Tu fais partie de ceux qui peuvent capitaliser sur l\'IA sans subir sa pression.</p>',
      trajectoire: '<p>Le pattern qui marche pour ton profil : construire un agent perso branché sur ton expertise (Claude Projects ou GPTs), documenter publiquement comment tu intègres l\'IA, transformer ta valeur de référent IA en avantage commercial.</p>',
      anticipation: '<p>D\'ici 2030 : ton secteur reste demandeur, et ceux qui auront documenté leur usage IA seront vus comme les leaders d\'opinion. Capitalise maintenant, le marché s\'étend.</p>',
      faq: [
        { question: 'Pourquoi mon métier est protégé ?', answer: 'Combinaison de barrière à l\'automatisation (régulation, présence humaine requise, ou expertise non-codifiable) et de levier IA fort (outils qui amplifient ton impact sans te remplacer).' },
        { question: 'Que dois-je faire pour rester en avance ?', answer: 'Construire un agent IA branché sur ton expertise et documenter ton usage publiquement. Ta valeur de référent monte avant les autres dans ton secteur.' },
        { question: 'Quels outils utiliser ?', answer: 'Un outil généraliste (Claude ou ChatGPT) pour les tâches préparatoires, et 1-2 outils sectoriels pour optimiser ta production. Les Claude Projects ou GPTs personnalisés sont parfaits pour capturer ta méthodologie.' },
        { question: 'Faut-il se former à l\'IA ?', answer: 'Oui mais pas dans une logique défensive. Forme-toi pour augmenter ton output, pas pour éviter d\'être remplacé. Anthropic Academy + DeepLearning.AI sont des bons points de départ gratuits.' },
        { question: 'Combien de temps avant que ça change ?', answer: 'Ton métier reste solidement positionné sur 5-10 ans. Mais la concurrence IA-augmentée arrive : ceux qui pilotent l\'IA dès maintenant prennent l\'avance.' },
      ],
    },
    tiens: {
      contexte: '<p>Ton métier reste solide face à l\'IA. Les rapports 2026 (<a href="https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts" target="_blank" rel="noopener">Tufts AI Jobs Risk Index</a>, McKinsey, WEF) montrent une exposition limitée. L\'IA n\'a ni les moyens techniques ni l\'incentive économique de remplacer ce que tu fais. Stabilité naturelle.</p>',
      trajectoire: '<p>Le pattern qui marche : utiliser l\'IA pour alléger l\'admin, capturer ton savoir terrain (Whisper, Otter pour la dictée), faire une veille hebdo automatisée. Tu libères 3-4 heures par semaine sans toucher à ton cœur de métier.</p>',
      anticipation: '<p>D\'ici 2030 : ta profession reste stable. Le levier IA est modéré (admin + prospection), mais ton métier ne se commoditise pas. Profite-en pour transmettre ton savoir aux générations suivantes.</p>',
      faq: [
        { question: 'Pourquoi mon métier ne risque pas l\'IA ?', answer: 'Combinaison de présence physique requise, motricité fine, jugement humain, ou environnement non-standardisé. L\'IA n\'a pas l\'avantage économique de te remplacer.' },
        { question: 'Dois-je quand même utiliser l\'IA ?', answer: 'Oui, pour alléger ton admin et capturer ton savoir. Pas pour transformer ton cœur de métier — ça reste humain.' },
        { question: 'Quels outils me sont utiles ?', answer: 'Claude ou ChatGPT pour la rédaction admin (devis, factures, courriers), Whisper ou Otter pour dicter tes interventions, un agent veille hebdo pour rester informé.' },
        { question: 'Comment me former sans y passer 100 heures ?', answer: 'Anthropic Academy (gratuit, 5-10 heures suffisent) pour les bases du prompt engineering. Tu n\'as pas besoin de plus pour ton usage.' },
        { question: 'Faut-il que je m\'inquiète à long terme ?', answer: 'Non. Les rapports 2026 sont clairs : ton métier reste demandeur sur 10+ ans. Profite de la stabilité pour transmettre et te former à ton rythme.' },
      ],
    },
    pivotes: {
      contexte: '<p>Ton métier est en contraction structurelle. Les rapports 2026 (<a href="https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts" target="_blank" rel="noopener">Tufts AI Jobs Risk Index</a>, McKinsey, WEF) projettent une réduction massive des effectifs sur 2 à 5 ans, sans levier IA fort pour compenser. Anticiper le pivot est la seule stratégie qui paie.</p>',
      trajectoire: '<p>Le pattern qui marche : identifier le métier adjacent qui croît (souvent dans le même secteur, mais une fonction au-dessus ou de côté), apprendre le prompt engineering en 10 heures, faire la transition pendant que tu as encore le poste actuel comme filet.</p>',
      anticipation: '<p>D\'ici 2030 : la profession aura perdu 30-50% de ses effectifs. Ceux qui auront pivoté tôt seront en position de force ; ceux qui auront attendu subiront le marché du travail saturé.</p>',
      faq: [
        { question: 'Mon métier va-t-il vraiment disparaître ?', answer: 'Pas totalement, mais les effectifs se contractent fortement. Les survivants seront ceux qui auront pivoté vers des rôles de supervision IA, qualité, ou un métier adjacent du même secteur.' },
        { question: 'Vers quel métier pivoter ?', answer: 'Vers une fonction adjacente du même secteur, idéalement avec une dimension humaine ou de supervision IA. Ton expertise reste précieuse — c\'est ton poste actuel qui se contracte, pas tes compétences.' },
        { question: 'Combien de temps me reste-t-il ?', answer: 'Fenêtre de 2 à 5 ans pour anticiper. Plus tu attends, plus le marché du travail sur lequel tu pivoteras sera saturé.' },
        { question: 'Comment commencer le pivot ?', answer: '1. Apprends le prompt engineering en 10h (DeepLearning.AI gratuit). 2. Identifie 3 offres LinkedIn qui combinent ton expertise + AI/supervision. 3. Postule sans démissionner.' },
        { question: 'Faut-il une formation longue ?', answer: 'Pas forcément. La plupart des pivots se font sur la base de tes compétences existantes + une couche IA légère (10-20h de formation autodidacte). C\'est l\'expérience terrain qui compte le plus.' },
      ],
    },
  }

  return {
    ...TEMPLATES[quadrant],
    dateModified,
  }
}

/**
 * Retourne le contenu éditorial pour un job, avec fallback per-quadrant si pas spécifique.
 */
export function getMetierContent(slug: string, quadrant: JobQuadrant, dateModified: string): MetierEditorialContent {
  return METIER_CONTENT[slug] ?? getQuadrantFallbackContent(quadrant, dateModified)
}
```

- [ ] **Step 2: Créer la route `app/pages/scanner/[slug].vue`**

```vue
<!-- app/pages/scanner/[slug].vue -->
<script setup lang="ts">
import { findJobBySlug, type Job, type JobQuadrant } from '~/data/jobs'
import { findSecteurBySlug } from '~/data/secteurs'
import { getMetierContent } from '~/data/metier-content'

const route = useRoute()
const slug = route.params.slug as string

const job = findJobBySlug(slug)
if (!job) {
  throw createError({ statusCode: 404, statusMessage: `Métier "${slug}" introuvable`, fatal: true })
}

const secteur = findSecteurBySlug(job.secteur)

// Date arbitraire de mise à jour de la migration. Sera updaté progressivement par les agents en Vague 2.
const dateModified = '2026-05-09'
const content = getMetierContent(job.slug, job.quadrant, dateModified)

// ── Constants visuels (cohérent avec scanner.vue) ──
const QUADRANT_VERDICT_ITALIC: Record<JobQuadrant, string> = {
  tiens:    'Tu tiens.',
  pilotes:  'Tu pilotes.',
  pivotes:  'Tu pivotes.',
  mutes:    'Tu mutes.',
}

const QUADRANT_LABELS: Record<JobQuadrant, string> = {
  tiens:    'TU TIENS',
  pilotes:  'TU PILOTES',
  pivotes:  'TU PIVOTES',
  mutes:    'TU MUTES',
}

const QUADRANT_DEFINITIONS: Record<JobQuadrant, string> = {
  tiens:    'Métier solide, peu touché par l\'IA. Stabilité naturelle, peu de levier d\'amplification.',
  pilotes:  'Métier solide ET l\'IA t\'amplifie. Avantage concurrentiel rare, à capitaliser maintenant.',
  pivotes:  'Métier en contraction et l\'IA n\'amplifie pas ton rôle. Reconversion à anticiper.',
  mutes:    'Métier en contraction MAIS l\'IA t\'arme. Saute le pas avant les autres.',
}

const QUADRANT_COLOR_VAR: Record<JobQuadrant, string> = {
  tiens:    'var(--color-protege)',
  pilotes:  'var(--color-croissance)',
  pivotes:  'var(--color-danger)',
  mutes:    'var(--color-mutation)',
}

// ── Leviers (per-job ou fallback per-quadrant) ──
import { getLeviersByQuadrant } from '~/data/quadrant-leviers'

const leviersToShow = computed<string[]>(() => {
  if (job.leviers.length > 0) return job.leviers
  return getLeviersByQuadrant(job.quadrant).leviers
})

const leviersIntro = computed<string>(() => {
  if (job.leviers.length > 0) {
    return `Trois actions concrètes pour piloter l'IA dans ton métier de ${job.label.toLowerCase()}.`
  }
  return getLeviersByQuadrant(job.quadrant).intro
})

function parseLevier(levier: string): { title: string, description: string } {
  const sepIndex = levier.indexOf(' — ')
  if (sepIndex === -1) return { title: levier, description: '' }
  return {
    title: levier.slice(0, sepIndex).trim(),
    description: levier.slice(sepIndex + 3).trim(),
  }
}

// ── Form newsletter (Section VI) ──
const { capture } = usePosthogEvent()

const prenomInput = ref('')
const emailInput = ref('')
const formationsInterest = ref(false)
const consentChecked = ref(false)
const submitting = ref(false)
const submitError = ref(false)
const submitMessage = ref('')

async function onSubscribe() {
  if (!consentChecked.value) {
    submitError.value = true
    submitMessage.value = 'Consentement requis.'
    return
  }
  submitting.value = true
  submitError.value = false
  submitMessage.value = ''

  try {
    const res = await $fetch<{ ok: boolean }>('/api/subscribe', {
      method: 'POST',
      body: {
        prenom: prenomInput.value,
        email: emailInput.value,
        consent: true,
        source: 'metier_static',
        job_slug: job.slug,
        job_status: job.status,
        job_quadrant: job.quadrant,
        job_risk: job.risk,
        job_potential: job.potential,
        formations_interest: formationsInterest.value,
      },
    })
    if (res.ok) {
      submitMessage.value = 'C\'est bon. Premier article dans 7 jours max.'
      prenomInput.value = ''
      emailInput.value = ''
      formationsInterest.value = false
      consentChecked.value = false
      capture('newsletter_subscribed_from_metier_page', {
        slug: job.slug,
        quadrant: job.quadrant,
        secteur: job.secteur,
        formations_interest: formationsInterest.value,
      })
    }
  } catch (e: any) {
    submitError.value = true
    submitMessage.value = e?.data?.message ?? 'Erreur technique, réessayez.'
  } finally {
    submitting.value = false
  }
}

// ── PostHog page view enrichi ──
onMounted(() => {
  capture('metier_page_viewed', {
    slug: job.slug,
    quadrant: job.quadrant,
    secteur: job.secteur,
    risk: job.risk,
    potential: job.potential,
    referrer: document.referrer,
  })
})

// ── SEO meta + JSON-LD Article + BreadcrumbList ──
const pageUrl = `https://survivant-ia.ch/scanner/${job.slug}`
const pageTitle = `${job.label} face à l'IA : ${QUADRANT_VERDICT_ITALIC[job.quadrant]} (${job.risk}/100) | Survivant-IA`
const pageDesc = `${job.dynamic.slice(0, 155)}...`

useSeoMeta({
  title: pageTitle,
  description: pageDesc,
  ogTitle: `${job.label} face à l'IA — ${QUADRANT_VERDICT_ITALIC[job.quadrant]}`,
  ogDescription: pageDesc,
  ogUrl: pageUrl,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: `${job.label} face à l'IA — ${QUADRANT_VERDICT_ITALIC[job.quadrant]}`,
  twitterDescription: pageDesc,
})

useHead({
  link: [
    { rel: 'canonical', href: pageUrl },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': `${pageUrl}#article`,
          headline: `${job.label} face à l'IA en 2026`,
          description: pageDesc,
          datePublished: '2026-05-09',
          dateModified: content.dateModified,
          inLanguage: 'fr-CH',
          url: pageUrl,
          author: { '@type': 'Person', '@id': 'https://survivant-ia.ch/identite#person' },
          publisher: { '@type': 'Organization', '@id': 'https://survivant-ia.ch/#organization' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${pageUrl}#page` },
          articleSection: secteur.label,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
            { '@type': 'ListItem', position: 2, name: 'Scanner', item: 'https://survivant-ia.ch/scanner' },
            { '@type': 'ListItem', position: 3, name: job.label },
          ],
        },
      ],
    }),
  }],
})

defineOgImage('Metier', {
  label: job.label,
  verdict: QUADRANT_VERDICT_ITALIC[job.quadrant],
  quadrant: job.quadrant,
  risk: job.risk,
  potential: job.potential,
  secteurLabel: secteur.shortLabel,
})
</script>

<template>
  <article class="metier-page">
    <!-- Author byline (E-E-A-T) -->
    <AuthorByline :date-modified="content.dateModified" />

    <!-- ════ HERO BLOCK ════ -->
    <header class="result-hero">
      <KickerLabel>Diagnostic IA · {{ job.label }}</KickerLabel>

      <h1 class="result-verdict">{{ QUADRANT_VERDICT_ITALIC[job.quadrant] }}</h1>

      <div class="result-scores font-mono">
        <span><strong :style="{ color: 'var(--color-mutation)' }">{{ job.risk }}</strong><span class="score-suffix">/100</span> · risque</span>
        <span class="score-sep">•</span>
        <span><strong :style="{ color: 'var(--color-accent)' }">{{ job.potential }}</strong><span class="score-suffix">/100</span> · levier IA</span>
      </div>

      <p class="result-dynamic">{{ job.dynamic }}</p>
    </header>

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- ════ SECTION I — POSITION (matrice + légende) ════ -->
    <section class="result-section">
      <div class="section-kicker font-mono">
        <span class="num">— I.</span>
        <span class="label">Position dans le cadran</span>
      </div>

      <div class="position-block">
        <div class="matrix-chip">
          <div class="matrix-grid">
            <div
              v-for="q in (['tiens', 'pilotes', 'pivotes', 'mutes'] as JobQuadrant[])"
              :key="q"
              class="matrix-cell"
              :class="{ 'matrix-cell--active': q === job.quadrant }"
              :style="{ '--cell-color': QUADRANT_COLOR_VAR[q] } as any"
            >
              {{ QUADRANT_LABELS[q].replace('TU ', '') }}
            </div>
          </div>
          <div class="matrix-axis-x font-mono">
            <span>← faible</span>
            <span>fort →</span>
          </div>
          <div class="matrix-axis-label font-mono">Levier IA</div>
        </div>

        <ul class="legend-list">
          <li
            v-for="q in (['tiens', 'pilotes', 'pivotes', 'mutes'] as JobQuadrant[])"
            :key="q"
            class="legend-item"
            :class="{ 'legend-item--active': q === job.quadrant }"
            :style="{ '--legend-color': QUADRANT_COLOR_VAR[q] } as any"
          >
            <span class="legend-name font-mono">{{ QUADRANT_LABELS[q] }}</span>
            <span class="legend-def">{{ QUADRANT_DEFINITIONS[q] }}</span>
            <span v-if="q === job.quadrant" class="legend-marker font-mono">← toi</span>
          </li>
        </ul>
      </div>
    </section>

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- ════ SECTION II — LEVIERS ════ -->
    <section class="result-section">
      <div class="section-kicker font-mono">
        <span class="num">— II.</span>
        <span class="label">Tes leviers cette semaine</span>
      </div>
      <p class="leviers-intro">{{ leviersIntro }}</p>
      <ol class="leviers-list">
        <li
          v-for="(levier, i) in leviersToShow"
          :key="i"
          class="levier-item"
        >
          <span class="levier-num font-mono">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="levier-body">
            <h3 class="levier-title">{{ parseLevier(levier).title }}</h3>
            <p class="levier-desc">{{ parseLevier(levier).description }}</p>
          </div>
        </li>
      </ol>
    </section>

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- ════ SECTION III — 3 ANGLES ÉDITORIAUX ════ -->
    <MetierEditorialSection
      :job="job"
      :contexte="content.contexte"
      :trajectoire="content.trajectoire"
      :anticipation="content.anticipation"
    />

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- ════ SECTION IV — FAQ ════ -->
    <MetierFAQ :job="job" :faq="content.faq" />

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- ════ SECTION V — POUR ALLER PLUS LOIN ════ -->
    <section class="result-section">
      <div class="section-kicker font-mono">
        <span class="num">— V.</span>
        <span class="label">Pour aller plus loin</span>
      </div>
      <MetierArticles :job="job" />
      <MetierSimilaires :job="job" />
    </section>

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- ════ SECTION VI — LA SUITE (form newsletter) ════ -->
    <section class="result-section">
      <div class="section-kicker font-mono">
        <span class="num">— VI.</span>
        <span class="label">La suite</span>
      </div>
      <h2 class="suite-headline">Reste un cran devant.</h2>
      <p class="suite-lead">
        Un nouvel article chaque semaine pour piloter l'IA dans ton métier.
        Cinq minutes de lecture, sans hype, sans funnel. Concret, terrain.
      </p>
      <form class="suite-form" @submit.prevent="onSubscribe">
        <div class="suite-form-row">
          <input v-model="prenomInput" type="text" class="suite-input suite-input--prenom" placeholder="Prénom" required autocomplete="given-name" />
          <input v-model="emailInput" type="email" class="suite-input" placeholder="ton@email.pro" required autocomplete="email" />
          <button type="submit" class="suite-button font-mono" :disabled="submitting">
            {{ submitting ? '...' : 'Rejoindre →' }}
          </button>
        </div>
        <label class="suite-checkbox">
          <input v-model="formationsInterest" type="checkbox" />
          <span>Préviens-moi en avance des formations approfondies (bientôt). Accès en avant-première et tarif lancement.</span>
        </label>
        <label class="suite-checkbox">
          <input v-model="consentChecked" type="checkbox" required />
          <span>J'accepte de recevoir La Fréquence (newsletter hebdo, désinscription en 1 clic).</span>
        </label>
        <p v-if="submitMessage" class="suite-message" :class="{ 'is-error': submitError }">{{ submitMessage }}</p>
      </form>
    </section>

    <div class="sage-rule sage-rule--fade" aria-hidden="true"></div>

    <div class="footer-actions font-mono">
      <NuxtLink to="/scanner" class="action-link">↻ Tester un autre métier</NuxtLink>
      <span class="action-sep">·</span>
      <NuxtLink to="/metiers" class="action-link">📋 Voir tous les métiers</NuxtLink>
    </div>
  </article>
</template>

<style scoped>
/* Reuse les styles du scanner.vue v2. La majorité des règles existe déjà.
   Ici on ajoute uniquement les spécifiques à la page statique. */

.metier-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 0 56px;
  font-family: var(--font-sans);
}

.result-hero {
  text-align: center;
  padding: 0 32px;
}

.result-verdict {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: clamp(48px, 10vw, 88px);
  line-height: 1;
  color: var(--color-text);
  margin: 32px 0 20px;
  letter-spacing: -0.02em;
  font-weight: 400;
}

.result-scores {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}
.result-scores strong { font-weight: 700; }
.result-scores .score-suffix { color: #555; }
.result-scores .score-sep { color: #2A2A2A; }

.result-dynamic {
  font-size: 17px;
  line-height: 1.65;
  color: var(--color-text);
  opacity: 0.85;
  max-width: 560px;
  margin: 0 auto;
}

.sage-rule {
  width: 80px;
  height: 1px;
  background: var(--color-accent);
  margin: 64px auto;
}
.sage-rule--fade {
  background: #2A2A2A;
  margin: 64px auto 32px;
}

.result-section { padding: 0 32px; }
.section-kicker {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}
.section-kicker .num { color: var(--color-accent); }
.section-kicker .label {
  letter-spacing: 0.22em;
  color: var(--color-text);
  opacity: 0.7;
}

/* Matrice et légende — copié depuis scanner.vue */
.position-block {
  display: flex;
  gap: 36px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.matrix-chip { width: 160px; flex-shrink: 0; }
.matrix-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  aspect-ratio: 1;
  background: transparent;
  border: 1px solid #2A2A2A;
  padding: 4px;
}
.matrix-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--cell-color);
  background: color-mix(in srgb, var(--cell-color) 12%, transparent);
}
.matrix-cell--active {
  background: var(--cell-color);
  color: var(--color-bg);
  font-weight: 700;
  font-size: 11px;
  box-shadow: inset 0 0 0 2px var(--color-accent), 0 0 14px rgba(108, 227, 181, 0.35);
}
.matrix-axis-x {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 9px;
  color: #555;
  letter-spacing: 0.05em;
}
.matrix-axis-label {
  text-align: center;
  margin-top: 4px;
  font-size: 9px;
  color: #555;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.legend-list {
  flex: 1;
  min-width: 280px;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.legend-item {
  display: flex;
  gap: 14px;
  align-items: baseline;
}
.legend-item--active {
  padding: 8px 12px;
  margin: -8px -12px;
  background: color-mix(in srgb, var(--legend-color) 10%, transparent);
  border-left: 2px solid var(--legend-color);
}
.legend-name {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--legend-color);
  font-weight: 700;
  flex-shrink: 0;
  min-width: 90px;
}
.legend-def {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-muted);
  flex: 1;
}
.legend-item--active .legend-def {
  color: var(--color-text);
  opacity: 0.95;
}
.legend-marker {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--color-accent);
  text-transform: uppercase;
}

/* Leviers */
.leviers-intro {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 32px;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0 0 36px;
  max-width: 560px;
  font-weight: 400;
}
.leviers-list { list-style: none; padding: 0; margin: 0; }
.levier-item {
  display: flex;
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid #1F1F1F;
}
.levier-item:last-child { border-bottom: 1px solid #1F1F1F; }
.levier-num {
  font-size: 13px;
  color: var(--color-accent);
  letter-spacing: 0.18em;
  flex-shrink: 0;
  min-width: 32px;
  padding-top: 2px;
}
.levier-body { flex: 1; min-width: 0; }
.levier-title {
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.35;
  margin: 0 0 8px;
}
.levier-desc {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--color-text);
  opacity: 0.75;
  line-height: 1.65;
  max-width: 580px;
  margin: 0;
}

/* Suite (form newsletter) */
.suite-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 32px;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0 0 16px;
  font-weight: 400;
}
.suite-lead {
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-text);
  opacity: 0.8;
  max-width: 560px;
  margin: 0 0 28px;
}
.suite-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
}
.suite-form-row { display: flex; gap: 8px; flex-wrap: wrap; }
.suite-input {
  flex: 1;
  min-width: 180px;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #2A2A2A;
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 15px;
  outline: none;
}
.suite-input:focus { border-color: var(--color-accent); }
.suite-input--prenom { max-width: 140px; }
.suite-button {
  padding: 14px 22px;
  background: var(--color-accent);
  border: none;
  color: var(--color-bg);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}
.suite-button:disabled { opacity: 0.5; cursor: wait; }
.suite-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.55;
}
.suite-checkbox input { margin-top: 3px; flex-shrink: 0; accent-color: var(--color-accent); }
.suite-message { font-size: 13px; margin: 0; color: var(--color-accent); }
.suite-message.is-error { color: var(--color-danger); }

/* Footer actions */
.footer-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #555;
  padding: 0 32px;
}
.action-link {
  color: var(--color-muted);
  text-decoration: none;
  cursor: pointer;
}
.action-link:hover { color: var(--color-text); }
.action-sep { color: #2A2A2A; }

@media (max-width: 640px) {
  .position-block { flex-direction: column; }
  .matrix-chip { width: 100%; max-width: 200px; margin: 0 auto; }
  .legend-list { width: 100%; }
}
</style>
```

- [ ] **Step 3: Build verification**

Run: `npm run build`
Expected: succès. Le build prerender les 196 routes `/scanner/[slug]`.

- [ ] **Step 4: Smoke test**

Run: `npm run dev`. Visiter `http://localhost:3000/scanner/comptable`. Vérifier :
- AuthorByline visible en haut
- Hero verdict italic Tu mutes.
- Scores 72 / 75
- Section I matrice + légende
- Section II 3 leviers (spécifiques car comptable a `leviers: [3]`)
- Section III 3 angles (fallback per-quadrant `mutes` car aucun contenu spécifique encore)
- Section IV FAQ accordions (fallback per-quadrant)
- Section V articles thématiques (probablement 1-2 affichés grâce au tag)
- Section V métiers similaires (4-5 du même secteur)
- Section VI form newsletter
- Footer actions

- [ ] **Step 5: Commit**

```bash
git add app/data/metier-content.ts app/pages/scanner/[slug].vue
git commit -m "feat(seo): page métier statique /scanner/[slug] avec fallback per-quadrant"
```

---

## Task 1.11: Créer la route `/metiers/index.vue` (browse page)

**Files:**
- Create: `app/pages/metiers/index.vue`

- [ ] **Step 1: Créer la page browse**

```vue
<!-- app/pages/metiers/index.vue -->
<script setup lang="ts">
import { JOBS } from '~/data/jobs'
import { getSecteursOrdered, type Secteur } from '~/data/secteurs'
import { searchJobsByLabel } from '~/utils/job-similars'

const { capture } = usePosthogEvent()

const searchQuery = ref('')

// Filtrage : si query, on cherche dans tous les jobs ; sinon on garde tous
const filteredJobs = computed(() => {
  if (searchQuery.value.trim().length === 0) return JOBS
  return searchJobsByLabel(searchQuery.value)
})

// Pour chaque secteur (ordonné), liste des jobs filtrés du secteur
const secteursWithJobs = computed(() => {
  return getSecteursOrdered().map(secteur => ({
    ...secteur,
    jobs: filteredJobs.value
      .filter(j => j.secteur === secteur.slug)
      .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
  })).filter(s => s.jobs.length > 0)
})

const totalCount = computed(() => filteredJobs.value.length)

// Capture search PostHog (debounced)
let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    if (val.trim().length >= 3) {
      capture('metiers_browse_search', {
        query: val.trim(),
        results_count: totalCount.value,
      })
    }
  }, 600)
})

function onMetierClick(secteur: string, slug: string) {
  capture('metiers_browse_secteur_clicked', { secteur, slug })
}

// SEO
useSeoMeta({
  title: 'Tous les métiers face à l\'IA : 196 diagnostics par secteur | Survivant-IA',
  description: 'Cherche ton métier ou explore les 196 diagnostics IA classés par secteur (cognitif, tech, santé, manuels, etc.) pour piloter l\'IA dans ton travail.',
  ogTitle: 'Tous les métiers face à l\'IA — Survivant-IA',
  ogDescription: '196 diagnostics IA par secteur. Cherche le tien.',
  ogUrl: 'https://survivant-ia.ch/metiers',
  ogType: 'website',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://survivant-ia.ch/metiers' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': 'https://survivant-ia.ch/metiers#page',
          name: 'Métiers couverts par Survivant-IA',
          description: 'Les 196 métiers analysés par le Scanner IA, classés par secteur.',
          url: 'https://survivant-ia.ch/metiers',
          inLanguage: 'fr-CH',
          isPartOf: { '@id': 'https://survivant-ia.ch/#website' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
            { '@type': 'ListItem', position: 2, name: 'Tous les métiers' },
          ],
        },
      ],
    }),
  }],
})

defineOgImage('Default', {
  title: 'Tous les métiers face à l\'IA',
  kicker: '196 DIAGNOSTICS · 7 SECTEURS',
})
</script>

<template>
  <div class="metiers-page">
    <header class="metiers-hero">
      <KickerLabel>Métiers couverts</KickerLabel>
      <h1 class="metiers-h1">
        Les <strong>{{ JOBS.length }} métiers</strong> que Survivant-IA analyse.
      </h1>
      <p class="metiers-subtitle">
        Cherche le tien ou explore par secteur.
      </p>
    </header>

    <div class="metiers-search">
      <input
        v-model="searchQuery"
        type="search"
        class="search-input font-mono"
        placeholder="Tape ton métier..."
        autocomplete="off"
      />
      <p v-if="searchQuery" class="search-results">{{ totalCount }} résultat(s)</p>
    </div>

    <div v-for="secteur in secteursWithJobs" :key="secteur.slug" class="secteur-section">
      <h2 class="secteur-heading">
        <span class="secteur-label">{{ secteur.label }}</span>
        <span class="secteur-count font-mono">{{ secteur.jobs.length }}</span>
      </h2>
      <div class="secteur-grid">
        <div
          v-for="job in secteur.jobs"
          :key="job.slug"
          @click="onMetierClick(secteur.slug, job.slug)"
        >
          <MetierCard :job="job" />
        </div>
      </div>
    </div>

    <p v-if="totalCount === 0" class="empty-state">
      Aucun métier trouvé pour "{{ searchQuery }}".
    </p>

    <div class="metiers-cta">
      <p class="cta-text">
        Pas trouvé ton métier ?
      </p>
      <NuxtLink to="/scanner" class="cta-link font-mono">
        Tente le diagnostic interactif →
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.metiers-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 32px;
  font-family: var(--font-sans);
}

.metiers-hero {
  text-align: center;
  margin-bottom: 48px;
}

.metiers-h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: clamp(36px, 6vw, 56px);
  line-height: 1.15;
  color: var(--color-text);
  margin: 24px 0 16px;
  letter-spacing: -0.02em;
  font-weight: 400;
}
.metiers-h1 strong {
  color: var(--color-accent);
  font-weight: 400;
  font-style: italic;
}

.metiers-subtitle {
  font-size: 17px;
  line-height: 1.5;
  color: var(--color-muted);
  max-width: 600px;
  margin: 0 auto;
}

.metiers-search {
  max-width: 560px;
  margin: 0 auto 64px;
  text-align: center;
}
.search-input {
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: 1px solid #2A2A2A;
  color: var(--color-text);
  font-size: 16px;
  letter-spacing: 0.05em;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: var(--color-accent); }
.search-results {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-top: 12px;
}

.secteur-section { margin-bottom: 56px; }
.secteur-heading {
  display: flex;
  align-items: baseline;
  gap: 16px;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 28px;
  font-weight: 400;
  color: var(--color-text);
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(108, 227, 181, 0.15);
}
.secteur-count {
  font-style: normal;
  font-size: 13px;
  letter-spacing: 0.15em;
  color: var(--color-accent);
  text-transform: uppercase;
}

.secteur-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.empty-state {
  text-align: center;
  font-size: 16px;
  color: var(--color-muted);
  padding: 48px 0;
}

.metiers-cta {
  text-align: center;
  margin-top: 64px;
  padding-top: 48px;
  border-top: 1px solid rgba(108, 227, 181, 0.15);
}
.cta-text {
  font-size: 16px;
  color: var(--color-muted);
  margin: 0 0 16px;
}
.cta-link {
  display: inline-block;
  padding: 14px 22px;
  background: var(--color-accent);
  color: var(--color-bg);
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: opacity 0.15s;
}
.cta-link:hover { opacity: 0.85; }
</style>
```

- [ ] **Step 2: Build + smoke test**

Run: `npm run build && npm run dev`. Visiter `http://localhost:3000/metiers`. Vérifier :
- Hero affiche les 196 métiers
- Search bar fonctionne (filtre live)
- 7 sections sectorielles ordonnées par volume desc
- MetierCards cliquables vers `/scanner/[slug]`
- CTA footer vers `/scanner`

- [ ] **Step 3: Commit**

```bash
git add app/pages/metiers/index.vue
git commit -m "feat(seo): browse page /metiers avec search + 7 sections sectorielles"
```

---

## Task 1.12: Update sitemap config + home link vers /metiers

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Étendre routeRules pour les nouvelles routes**

Dans `nuxt.config.ts`, dans le bloc `routeRules`, ajouter :

```ts
'/scanner/**': { sitemap: { priority: 0.8, changefreq: 'monthly' } },
'/metiers':    { sitemap: { priority: 0.85, changefreq: 'monthly' } },
```

- [ ] **Step 2: Étendre prerender pour la browse + index**

Dans `nuxt.config.ts`, dans `nitro.prerender.routes`, ajouter `'/metiers'`. Les 196 routes `/scanner/[slug]` seront découvertes automatiquement via `crawlLinks: true` depuis `/metiers` (qui linke vers chaque métier).

```ts
nitro: {
  prerender: {
    crawlLinks: true,
    routes: ['/', '/rss.xml', '/scanner', '/rapports', '/frequence', '/identite', '/confidentialite', '/metiers'],
  },
},
```

- [ ] **Step 3: Ajouter un lien vers /metiers depuis la home**

Dans `app/pages/index.vue`, identifier l'endroit naturel pour ajouter le lien (probablement dans le footer du hero ou dans la section Bandeau de trajectoire). Ajouter un lien discret :

```vue
<NuxtLink to="/metiers" class="discreet-link">
  Voir tous les métiers couverts →
</NuxtLink>
```

(Lieu exact à valider en regardant la structure de `index.vue`. Si ambiguë, mettre à côté de "Tester mon métier" dans le hero CTA.)

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: succès, sitemap inclut les 197 nouvelles URLs.

- [ ] **Step 5: Vérifier le sitemap**

Run: `curl -s http://localhost:3000/sitemap.xml | grep -c '<url>'`
Expected: ~205 URLs (8 statiques existantes + 196 métier + 1 metiers).

- [ ] **Step 6: Commit**

```bash
git add nuxt.config.ts app/pages/index.vue
git commit -m "feat(seo): sitemap + prerender étendus, lien home vers /metiers"
```

---

# VAGUE 2 — CONTENU ÉDITORIAL

## Tasks 2.1 → 2.7: Production éditoriale par 7 grappes sectorielles

Pour chaque grappe, **un agent rédacteur** produit le contenu (~25-38 jobs × 800 mots = ~20-30k mots), puis **un agent reviewer** lit le diff et flagge les problèmes. Mathieu valide entre chaque grappe.

### Style guide imposé à TOUS les rédacteurs (à inclure dans chaque prompt)

```
Voix Survivant-IA :
- Tutoiement, direct, terrain. Pas de jargon, pas de creux ("opportunité géniale!").
- Lucide sur le constat, transformatif sur l'action.
- Verbes prioritaires : piloter, maîtriser, automatiser, intégrer, basculer, capitaliser, repositionner.
- Mots bannis : méthode (sauf "formations approfondies"), chevaucher, viseur (sauf si suivi immédiat d'un verbe transformatif).

Format strict :

CHAQUE job de la grappe reçoit un objet `MetierEditorialContent` ajouté à `app/data/metier-content.ts` :

```ts
METIER_CONTENT['{slug}'] = {
  contexte: '<p>Angle 1 — Contexte sectoriel (~200 mots). HTML markdown autorisé : <p>, <strong>, <a href target="_blank" rel="noopener">. Citer des chiffres précis du catalogue Sources (Tufts, McKinsey, WEF, Goldman Sachs, etc.). Expliquer pourquoi CE métier est dans CE quadrant avec des données.</p>',

  trajectoire: '<p>Angle 2 — Trajectoire concrète (~250 mots). Vignette ancrée dans des outils réels du secteur (Pennylane pour la finance, Cursor pour le dev, AlphaFold pour la bio, etc.). Pattern : "Le pattern qui marche : [action concrète] avec [outil réel] sur [tâche spécifique]. Gain mesuré : [X heures/semaine ou Y% de productivité]." Pas de fabulation type "Marie 8 ans d\'expérience" — ancrer dans des données ou exemples réalistes.</p>',

  anticipation: '<p>Angle 3 — Anticipation 2026-2030 (~200 mots). 3-5 signaux faibles spécifiques au secteur : outils émergents, tendances réglementaires, pivots professionnels qui prennent de l\'ampleur. Exemple : "D\'ici 2030 : la régulation AI Act va imposer X aux Y." Source-grounded.</p>',

  faq: [
    { question: 'Q1 universelle (mon métier va-t-il disparaître ?)', answer: 'Réponse spécifique au métier avec data précise.' },
    { question: 'Q2 spécifique au métier (quels outils utiliser ?)', answer: 'Réponse avec outils nommés du secteur.' },
    { question: 'Q3 spécifique (comment se former ?)', answer: 'Réponse avec sources de formation réelles.' },
    { question: 'Q4 spécifique (faut-il pivoter ?)', answer: 'Réponse adaptée au quadrant.' },
    { question: 'Q5 universelle (combien de temps me reste-t-il ?)', answer: 'Réponse avec horizon temporel et data.' },
  ],

  dateModified: '2026-05-09',  // ISO date
}
```

**Source-grounding obligatoire (vérifié par reviewer)** :
- Au moins 2 chiffres précis tirés du catalogue Sources Survivant-IA (Tufts, McKinsey, WEF, Goldman Sachs, LinkedIn, etc.)
- Au moins 1 lien sortant vers une source du catalogue (URL complète)
- Au moins 1 mention d'outil réel et nommé pour le secteur

**Cohérence sectorielle stricte** : un agent = une grappe = des outils sectoriels cohérents. Pas de mélange.

**Apostrophes** : échappées en `\'` dans les strings TypeScript (single-quoted), ou triples backticks pour multi-line.

**Format final dans `metier-content.ts`** :

```ts
export const METIER_CONTENT: Record<string, MetierEditorialContent> = {
  'comptable': {
    contexte: '<p>...</p>',
    trajectoire: '<p>...</p>',
    anticipation: '<p>...</p>',
    faq: [
      { question: '...', answer: '...' },
      // 5 entries
    ],
    dateModified: '2026-05-09',
  },
  'analyste-credit': { /* ... */ },
  // etc.
}
```
```

### Catalogue des 22 sources (à inclure dans chaque prompt)

```
Le catalogue Sources Survivant-IA est dans `app/data/sources.ts`. Lire ce fichier
pour avoir les URLs et titres complets. Sources disponibles :

1. Tufts AI Jobs Risk Index 2026
2. Tufts Digital Planet — How Will Jobs Be Affected by AI
3. PayScope — AI Job Exposure 2026 (800 roles)
4. McKinsey Global Institute — Agents, Robots and Us 2026
5. McKinsey — US Productivity Unlock 2026
6. Replaced by Robot — Highest AI Risk Rankings
7. Goldman Sachs — How Will AI Affect the US Labor Market 2026
8. Goldman Sachs — The Jobs AI Is Likely to Boost or Disrupt
9. WEF Future of Jobs Report 2025 — Fastest Growing/Declining
10. WEF Future of Jobs 2025 — Skills of the Future
11. WEF — AI Has Added 1.3M Jobs (LinkedIn data) 2026
12. LinkedIn Economic Graph — Future of Work 2026
13. LinkedIn Pressroom — Skills on the Rise 2026
14. Dice — AI-Related Jobs Top LinkedIn Fastest-Growing 2026
15. Blog du Modérateur — Métiers menacés par l'IA
16. Bradroit Solutions — Métiers menacés par l'IA
17. Writtenly Hub — Tufts Study Content Professionals at Risk
18. Search Engine Journal — New AI Jobs Index 784 Occupations
19. Visual Capitalist — Jobs Most Exposed to Generative AI
20. JobReplacementAI — 2026 AI Stats
21. PrometAI — 10 Jobs AI Can't Replace
22. CNFDI — 7 métiers qui ne vont pas disparaître
```

---

## Task 2.1: Grappe A — Cognitif/admin/finance/juridique (~38 jobs)

**Files:**
- Modify: `app/data/metier-content.ts`

- [ ] **Step 1: Dispatcher l'agent rédacteur (sonnet)**

L'agent rédige le contenu pour les 38 jobs suivants en respectant le style guide ci-dessus :

```
teleconseiller, televendeur, saisie-de-donnees, redacteur-web, traducteur, correcteur,
transcripteur, comptable, analyste-credit, analyste-marketing, assistant-juridique,
secretaire-juridique, assistant-administratif, receptionniste, standardiste,
agent-assurance, operateur-saisie, secretaire, caissier, agent-recouvrement,
employe-banque, specialiste-rp, editeur-reviseur, redacteur-technique,
specialiste-dossiers-medicaux, testeur-qa, controleur-gestion, controller-gestion,
auditeur, chargee-clientele, gestionnaire-paie, documentaliste, redacteur-publicitaire,
juriste, greffier, expert-comptable, analyste-financier, assistant-direction
```

Outils sectoriels propres à cette grappe (à mentionner dans les angles 2 + FAQ) :
- Comptabilité : Pennylane, Dext, Sage, QuickBooks, Claude pour synthèses fiscales
- Juridique : Doctrine, Lexbase, Predictice, Claude pour revue contractuelle, ContractPodAi
- Banque : tools internes + Claude/ChatGPT pour synthèses de dossiers
- Admin : Notion AI, ChatGPT, Otter pour transcription, Whisper
- Rédaction : Claude, ChatGPT, Perplexity, Hemingway pour édition
- Service client : Intercom AI, Zendesk AI, Claude pour synthèses
- Paie : Silae, Sage Paie + IA
- Documentation : ChatGPT pour rédaction technique

Sources de formation à mentionner :
- Anthropic Academy
- DeepLearning.AI Generative AI for Everyone / Building Systems with ChatGPT API
- LinkedIn Learning
- Certifications : CIMA AI in Finance, CISA, IFACI, CNB modules IA, GERESO, ADBS, ENM

- [ ] **Step 2: Build verification après chaque batch**

Run: `npm run build`
Expected: succès, pas d'erreur TS sur le format des strings (apostrophes mal échappées).

- [ ] **Step 3: Spot-check sur 3 jobs au hasard**

Visiter en dev : `/scanner/comptable`, `/scanner/televendeur`, `/scanner/auditeur`. Vérifier :
- Section III affiche 3 angles éditoriaux spécifiques (pas le fallback générique)
- FAQ a 5 questions avec réponses spécifiques
- Au moins 2 chiffres précis et 1 lien sortant dans la Section III

- [ ] **Step 4: Dispatcher l'agent reviewer (haiku)**

Le reviewer lit le diff de la grappe et flagge :
- Drift de voix (incohérence de tonalité entre les jobs)
- Répétition mécanique > 30% entre paragraphes
- Mots bannis présents (`méthode`, `chevaucher`, `viseur` non-contrebalancé)
- Affirmations factuelles non sourcées
- Manque de minimas obligatoires : 2 chiffres + 1 lien + 1 outil par page
- Format strict respecté

Le reviewer rapporte. Mathieu valide ou demande relance ciblée.

- [ ] **Step 5: Commit**

```bash
git add app/data/metier-content.ts
git commit -m "feat(seo): contenu éditorial grappe A — cognitif/admin/finance/juridique (~38 jobs)"
```

---

## Task 2.2: Grappe B — Tech/data/design (~28 jobs)

**Files:**
- Modify: `app/data/metier-content.ts`

Same structure as Task 2.1, but for these 28 jobs:

```
developpeur-logiciel, programmeur, designer-graphique, designer-web, ux-designer,
data-scientist, architecte-logiciel, support-informatique, chef-de-projet-it,
infographiste, administrateur-sys, ingenieur-reseau, responsable-si, ingenieur-fintech,
ingenieur-ia, integrateur-ia, expert-cybersecurite, specialiste-big-data, analyste-securite,
architecte-bdd, statisticien, gestionnaire-projet, business-analyst, asset-manager,
portfolio-manager, actuaire, technicien-support, analyste-donnees
```

Outils sectoriels :
- Dev : Cursor, Claude Code, GitHub Copilot, Aider, Continue.dev, Anthropic Claude API
- Data : DataIku, Hex AI Notebooks, Mode Analytics, AutoML (H2O.ai, Vertex AI)
- Design : Figma AI, Adobe Firefly, Midjourney, v0 by Vercel, Recraft, Galileo AI
- Sécu : Snyk, Wiz, Lacework, Cloudflare AI Gateway
- Ops : Datadog AI, Splunk AI, Pulumi AI, Coralogix
- Réseaux : Cisco Cloud Security, Cloudflare AI
- Finance/IA : Bloomberg Terminal AI, BlackRock Aladdin, Numerai
- IA : LangChain, LlamaIndex, Haystack, MLflow, Weights & Biases
- Stats : Posit Cloud, RStudio + Copilot

Formations :
- Anthropic Academy (Claude API + agentic systems)
- DeepLearning.AI Specializations (Building Systems, MLOps, LangChain)
- Hugging Face Learn
- Cloud certs : AWS ML Specialty, Azure AI Engineer, GCP ML Engineer

Steps 1-5 identiques à Task 2.1. Commit message : `feat(seo): contenu éditorial grappe B — tech/data/design (~28 jobs)`

---

## Task 2.3: Grappe C — Marketing/comm/management (~28 jobs)

**Jobs:**
```
commercial, recruteur, responsable-rh, conseiller-financier, community-manager,
social-media-manager, responsable-com, responsable-communication, consultant-strategie,
consultant-it, product-manager, chef-de-produit, journaliste-presse, journaliste-tv,
analyste-renseignement, economiste, directeur-marketing, politologue, expert-immobilier,
agent-immobilier, photographe, videaste, coach-professionnel, formateur, formateur-adultes,
event-manager, archiviste, bibliothecaire
```

Outils sectoriels :
- Marketing : HubSpot AI, Salesforce Einstein, Adobe Sensei, Marketo, Jasper, Copy.ai
- Sales : Gong, Apollo.io AI, Outreach AI, Drift, Intercom AI
- RH : LinkedIn Recruiter AI, hireEZ, Eightfold AI, HireVue AI, Workday AI
- Comm/PR : Cision, Meltwater AI, Brandwatch, Sprinklr
- Management : Notion AI, Asana AI, Monday.com AI, Linear
- Médias : Lexisnexis AI, Factiva AI, Otter, Whisper
- Photo/vidéo : Runway Gen-3, Sora, ElevenLabs, Suno, Topaz Labs
- Immobilier : PriceHubble, Meilleurs Agents AI, Compass AI, Matterport
- Coaching : Synthesia, Heyday AI, Loom AI

Formations :
- HubSpot AI Marketing certifications
- Reforge AI Strategy
- Coursera Wharton AI for Business
- DeepLearning.AI Marketing Analytics
- Berklee Online (musiciens/médias)

Steps identiques. Commit : `feat(seo): contenu éditorial grappe C — marketing/comm/management (~28 jobs)`

---

## Task 2.4: Grappe D — Sciences/ingénierie (~20 jobs)

**Jobs:**
```
ingenieur-automobile, ingenieur-industriel, ingenieur-mecanique, ingenieur-civil,
ingenieur-automatisme, biologiste, chimiste, physicien, architecte, urbaniste, geometre,
technicien-laboratoire, technicien-son, gestionnaire-stock, logisticien, responsable-logistique,
responsable-qualite, responsable-hse, responsable-achats, acheteur
```

Outils sectoriels : nTopology, Autodesk Generative, Ansys SimAI, Catia AI, Cognite, AspenTech, Palantir Foundry, Spacemaker, Hypar, Finch3D, AlphaFold, ChemAI, Reaxys, BenchSci, Causaly, Wolfram Alpha, Pix4D AI, DroneDeploy, Trimble RealWorks, Benchling, CellProfiler, Opentrons, iZotope Neutron, Auphonic, Topaz Video, Blue Yonder AI, o9 Solutions, SAP IBP AI, Manhattan AI, OptimoRoute, Project44, ETQ Reliance, MasterControl, LexisNexis Risk, Cognex, Coupa AI, SAP Ariba, Sievo, Spendkey, Beroe, Mintec.

Formations : Coursera Industrial AI MIT, AspenTech University, Siemens Digital Industries Academy, AWS Industrial ML, Centrale + AI tracks, Coursera AlphaFold 2, Trimble University, AFNOR certifications.

Steps identiques. Commit : `feat(seo): contenu éditorial grappe D — sciences/ingénierie (~20 jobs)`

---

## Task 2.5: Grappe E — Santé/care/éducation (~27 jobs)

**Jobs:**
```
cardiologue, medecin-generaliste, psychiatre, psychologue, chirurgien, dentiste, veterinaire,
kinesitherapeute, masseur, osteopathe, infirmier, aide-soignant, auxiliaire-vie, sage-femme,
orthophoniste, ergotherapeute, educateur-specialise, dieteticien, ambulancier, travailleur-social,
enseignant, enseignant-primaire, enseignant-college, professeur-universitaire, professeur-lycee,
radiologue, pharmacien
```

Outils sectoriels : Glass.health, Open Evidence, OpenAI o1, DAX Copilot, Abridge, Suki AI, Aidoc, Gleamer, Heuro, Paige, PathAI, Tempus, Owkin, Pearl AI, Overjet, Diagnocat, Pliantia, IDEXX VetLab, Kaia Health, Sword Health, Wysa, Woebot, Daylio, Reflectly, Speeko AI, Loona, Mind & Move, Sigma+ AI, MyFitnessPal AI, Pyxima AI, Pharmagest, Vigibase, FAERS, Lunit, Subtle Medical, Volpara, Khanmigo, Magic School AI, Tutor.com AI, Notion AI, Elicit, Consensus, Semantic Scholar AI.

Formations : DeepLearning.AI AI in Healthcare (Stanford), Coursera Stanford AI in Healthcare, HIMSS AI/ML certifications, French DPC, DU IA en Santé Lille, INSPÉ, CNFPT, Eduscol.

Steps identiques. Commit : `feat(seo): contenu éditorial grappe E — santé/care/éducation (~27 jobs)`

---

## Task 2.6: Grappe F — Manuels/artisanat/transport (~37 jobs)

**Jobs:**
```
macon, plombier, electricien, mecanicien, soudeur, carreleur, peintre-batiment, menuisier,
ebeniste, chef-de-chantier, chef-cuisinier, cuisinier-rapide, cuisinier-restaurant, boulanger,
boucher, patissier, fleuriste, coiffeur, esthetique, technicien-cvc, technicien-eolien,
technicien-solaire, conducteur-engins, technicien-maintenance, serrurier, chauffeur-livreur,
chauffeur-poids-lourd, pilote-ligne, controleur-aerien, conducteur-train, chauffeur-taxi-vtc,
moniteur-auto-ecole, moniteur-sport, agriculteur, maraicher, eleveur, agent-de-voyage
```

Outils sectoriels : Camera2BIM, Matterport, Easilys, Choco AI, Marketman AI, Apicbase, Treatwell, Planity, Atolla, Skin Genius, Floral Frog AI, Helioscope, PVsyst, Uptake AI, SparkCognition, DroneDeploy, CarMD, Bartec AI, ETAI, Mobility Work AI, Praxedo AI, Senseye, IBM Maximo, Stuart, Frichti, Continental VDO, Foreflight, NaviAir AI, Sencrop, Weenat, XAG, Airinov, Greentech, Ag Leader, Naïo, FarmDroid, Connecterra, Smartbow AI, Hopper, Skyscanner.

Formations : AFPA, CNFPT, CFA + modules IA artisans, INRAE, Chambres d'agriculture AgTech IA, Pôle Emploi.

Steps identiques. Commit : `feat(seo): contenu éditorial grappe F — manuels/artisanat/transport (~37 jobs)`

---

## Task 2.7: Grappe G — Juridique-extra/sécurité/divers (~19 jobs)

**Jobs:**
```
avocat, notaire, juge, artificier, pompier, policier, militaire, operateur-crematorium,
directeur-general, directeur-financier, sportif-pro, comedien, musicien, artiste-plasticien,
guide-touristique, specialiste-energies-renouvelables, specialiste-batiment-durable, pompiste,
ouvrier-agricole
```

Outils sectoriels : Doctrine, Lexbase, Predictice, ContractPodAi, Ironclad, Leeway, Bcomp, McKinsey IDA, BCG GenAI tools, Bloomberg Terminal AI, Anaplan, Workday Adaptive, Hudl, Catapult AI, Whoop, Oura, Suno, ElevenLabs, Midjourney, Canva AI, Helioscope, PVsyst, Climaxion AI, Uptake AI, Climate Resolve AI.

Formations : CNB modules IA, ENM modules IA, ENA cycles AI for leaders, HEC AI Business, Reforge AI Strategy, Berklee Online, BBC Academy, BBC.

Steps identiques. Commit : `feat(seo): contenu éditorial grappe G — juridique-extra/sécurité/divers (~19 jobs)`

---

# VAGUE 3 — QA FINALE + DEPLOY

## Task 3.1: QA finale globale

**Files:** Aucune modif. Vérifications.

- [ ] **Step 1: Build production**

Run: `cd /Users/mathieu/Documents/survivor && npm run build 2>&1 | tail -10`
Expected: succès, output bundle ~14-16 MB.

- [ ] **Step 2: Vérifier la couverture du contenu éditorial**

Run :
```bash
grep -c "': {" app/data/metier-content.ts
```
Expected: 196 (un objet par job).

- [ ] **Step 3: Vérifier le sitemap**

Run: `curl -s http://localhost:3000/sitemap.xml | grep -c '<url>'`
Expected: ~205 URLs.

- [ ] **Step 4: Vérifier les schemas JSON-LD via Rich Results Test**

Manuellement ouvrir https://search.google.com/test/rich-results et tester :
- `https://survivant-ia.ch/scanner/comptable` → doit montrer Article + FAQPage + BreadcrumbList valides
- `https://survivant-ia.ch/metiers` → doit montrer CollectionPage + BreadcrumbList valides

- [ ] **Step 5: Lighthouse SEO**

Run dans Chrome DevTools → Lighthouse → SEO sur 3 pages (`/scanner/comptable`, `/scanner/macon`, `/metiers`).
Expected: score SEO ≥ 95 sur chaque page.

- [ ] **Step 6: Spot-check visuel sur 8 pages**

Run: `npm run dev`. Visiter :
- `/scanner/comptable` (mutes)
- `/scanner/developpeur-logiciel` (mutes)
- `/scanner/cardiologue` (pilotes)
- `/scanner/ingenieur-ia` (pilotes)
- `/scanner/macon` (tiens or pilotes — vérifier secteur)
- `/scanner/cuisinier-restaurant` (tiens)
- `/scanner/televendeur` (pivotes)
- `/scanner/saisie-de-donnees` (pivotes)

Pour chacun, vérifier :
- AuthorByline visible en haut
- Hero italic verdict + scores
- Section I matrice + légende correctes
- Section II 3 leviers
- Section III 3 angles éditoriaux SPÉCIFIQUES (pas le fallback)
- Section IV FAQ avec 5 Q/A
- Section V articles thématiques (si match secteur) + 4-5 métiers similaires
- Section VI form newsletter fonctionnel
- Footer actions cliquables

- [ ] **Step 7: Vérifier les invariants brand**

Run :
```bash
grep -nE "'// (SCAN|EN MUTATION|EN DANGER|PROT|EN CROISSANCE|RAPPORT)" app/pages/scanner/[slug].vue app/pages/metiers/index.vue app/components/Metier*.vue
```
Expected: 0 matches.

```bash
grep -E "méthode |chevaucher|mardi" app/data/metier-content.ts | grep -v "formations"
```
Expected: 0 matches.

- [ ] **Step 8: Test PostHog events**

Run: `npm run dev`. Ouvrir DevTools network. Visiter `/scanner/comptable` + cliquer un similaire + ouvrir un FAQ accordion.

Vérifier que les requêtes PostHog `/_ph/...` partent avec ces events :
- `metier_page_viewed`
- `metier_faq_opened`
- `metier_similar_clicked`

- [ ] **Step 9: Test redirect canonical**

Manuellement vérifier sur `/scanner?job=comptable` que le `<link rel="canonical">` du HTML head pointe vers `https://survivant-ia.ch/scanner/comptable`.

```bash
npm run dev &
sleep 5
curl -s 'http://localhost:3000/scanner?job=comptable' | grep canonical
```

- [ ] **Step 10: Pas de commit (verification only)**

---

## Task 3.2: Push & deploy + Google Search Console

**Files:** Aucune modif côté code.

- [ ] **Step 1: Push sur origin/main**

```bash
cd /Users/mathieu/Documents/survivor && git push origin main
```

Vercel détecte le push, lance le build. Attendre ~3 minutes.

- [ ] **Step 2: Vérifier que le déploiement est live**

Visiter https://survivant-ia.ch/scanner/comptable et https://survivant-ia.ch/metiers. Vérifier :
- 200 OK
- Le contenu s'affiche correctement
- L'OG image preview fonctionne (Twitter Card Validator, Facebook Sharing Debugger)

- [ ] **Step 3: Soumettre le sitemap à Google Search Console**

1. Aller sur Google Search Console (déjà configuré pour survivant-ia.ch)
2. Sitemaps → Soumettre `https://survivant-ia.ch/sitemap.xml`
3. Vérifier que GSC reconnaît les nouvelles 197 URLs

- [ ] **Step 4: Vérifier l'indexation manuellement**

Pour 3 pages stratégiques, demander l'indexation via GSC :
- `https://survivant-ia.ch/scanner/comptable`
- `https://survivant-ia.ch/scanner/developpeur-logiciel`
- `https://survivant-ia.ch/metiers`

Pas attendre l'indexation complète (peut prendre 1-2 semaines), juste signaler.

- [ ] **Step 5: Setup PostHog dashboard "Scanner SEO"**

Dans PostHog, créer un dashboard avec les 3 funnels :
1. Browse → métier → newsletter
2. Métier → article
3. Métier → métier similaire

Plus widgets :
- "Top 10 métiers par pageviews" (sur metier_page_viewed.slug)
- "Conversion newsletter par quadrant" (sur newsletter_subscribed_from_metier_page filtré par quadrant)
- "Search queries no_results" (sur metiers_browse_search avec results_count = 0)

- [ ] **Step 6: Pas de commit (deploy only)**

---

## Self-Review

**Spec coverage check :**

Pour chaque criterion de validation du spec section 11 :
- [✓] `secteur` field présent sur 196 jobs → Task 1.1
- [✓] Routes `/scanner/[slug]` × 196 + `/metiers` répondent 200 → Tasks 1.10, 1.11
- [✓] Sitemap contient 197 nouvelles URLs → Task 1.12 + 3.1 step 3
- [✓] Pages métier ont les 6 sections → Task 1.10
- [✓] Browse a 7 sections sectorielles + search bar → Task 1.11
- [✓] Gate retiré du flow `/scanner` interactif → Task 1.4
- [✓] FAQ JSON-LD valide → Task 1.7 + 3.1 step 4
- [✓] Article + Person + BreadcrumbList JSON-LD valides → Task 1.10 + 3.1 step 4
- [✓] OG image dynamique fonctionne → Task 1.9 + 3.2 step 2
- [✓] PostHog events instrumentés → multiple tasks (1.10, 1.11, MetierFAQ, MetierSimilaires, MetierArticles)
- [✓] Tous les slugs Scanner v2 préservés → vérifié implicitement (no slug change in plan)
- [✓] Build clean, copy purgée des `//`, mots bannis absents → Task 3.1 step 7
- [✓] Auteur byline visible → Task 1.6 + 1.10
- [✓] Spot-checks visuels validés → Task 3.1 step 6
- [✓] Sitemap soumis à GSC → Task 3.2 step 3
- [✓] Canonical link `/scanner?job=X` → testé en Task 3.1 step 9

**Placeholder scan :** aucun "TBD" / "TODO" / "fill in details" résiduel.

**Type consistency :** `JobSecteur` défini en `secteurs.ts`, importé dans `jobs.ts`, `job-similars.ts`, `metier-content.ts`. `MetierEditorialContent` interface défini en `metier-content.ts`, utilisé en `[slug].vue` et `MetierEditorialSection.vue`. PostHog event names cohérents (`metier_page_viewed`, `metier_faq_opened`, etc. — pas de typo de snake_case).

**One known caveat :** la canonical `/scanner?job=X` → `/scanner/[slug]` n'est pas explicitement implémentée dans Task 1.4. Le scanner v2 actuel n'a pas de canonical link — il faut l'ajouter au flow interactif. Action : dans Task 1.4 (gate removal), ajouter aussi un `useHead` qui setLink canonical pointant vers `/scanner/{job.slug}` quand un job est sélectionné. À ajouter dans la fonction `setDynamicMeta` existante.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-09-scanner-seo-longtail.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Je dispatche un subagent frais par tâche, review entre chaque, itération rapide. Particulièrement adapté à la Vague 2 où les 7 grappes sont identiques structurellement.

**2. Inline Execution** — J'exécute les tâches dans cette session avec checkpoints.

**Which approach?**
