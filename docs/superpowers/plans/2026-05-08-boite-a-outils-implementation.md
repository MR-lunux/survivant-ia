# La Boîte à Outils + TRC-01 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer une nouvelle catégorie « La Boîte à Outils » (page liste `/outils` + page détail `/outils/[slug]`), un premier kit `TRC-01` (quiz interactif de 5 questions sur la résilience cognitive avec écran de résultat tier-coloré et CTA newsletter contextualisé), un composant `<KitCallout>` à insérer en footer d'article, et l'article-parent du TRC-01.

**Architecture:** Nuxt Content (collection `outils`) pour stocker chaque kit en `.md` avec frontmatter YAML structuré (data quiz dans le frontmatter, copy SEO dans le body Markdown). Composant de rendu dispatché par `kind` (`<KitQuiz>` pour V1, futurs `<KitCheatsheet>`/`<KitVideo>`/etc.). Couplage 1-1 obligatoire kit ↔ article-parent via champ `relatedKit` sur l'article. `<NewsletterForm>` modifié pour accepter des props overridable (kicker/h3/body) et un contexte de tracking (kit_id, tier) — pas de duplication de la logique Brevo.

**Tech Stack:**
- Nuxt 4.x + Vue 3.5 + TypeScript
- `@nuxt/content` 3.x (zod schema)
- `@nuxtjs/sitemap` 8.x (sitemap auto)
- `nuxt-og-image` 6.x (images OG via satori)
- `posthog-js` 1.x (tracking, via composable `usePosthogEvent` existant)
- Pas de framework de tests installé → vérification via `npm run dev` (visuel + console `[ph]` events) et `npm run build` final

**Spec source:** [docs/superpowers/specs/2026-05-07-boite-a-outils-design.md](../specs/2026-05-07-boite-a-outils-design.md)

---

## File Structure

### Files to create

| Path | Responsibility |
|---|---|
| `content/outils/trc-01.md` | Data du premier kit : frontmatter (questions, paliers, CTA newsletter par tier) + body Markdown éditorial (intro + outro SEO) |
| `content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md` | Article-parent du TRC-01 (~600 mots), avec `relatedKit: trc-01` dans le frontmatter |
| `app/pages/outils/index.vue` | Page liste `/outils` (header + counter + filtres désactivés + grille KitCard + bottom-note + SEO + tracking) |
| `app/pages/outils/[slug].vue` | Page détail kit (frame commune : breadcrumb + kicker + title + specs + bandeau parent + body + composant rendu par `kind` + footer commun) |
| `app/components/KitCard.vue` | Carte d'un kit pour la grille de la page liste (variant `coming` pour placeholder) |
| `app/components/KitCallout.vue` | Bloc CTA « article → kit » à insérer en footer d'article (carte cliquable avec tracking) |
| `app/components/kits/KitQuiz.vue` | Composant interactif `kind: quiz` : state machine + dispatch sous-composants |
| `app/components/kits/KitQuizQuestion.vue` | Sous-composant : affiche une question + 2 choix `[ A ]`/`[ B ]` |
| `app/components/kits/KitQuizResult.vue` | Sous-composant : écran résultat (carte tier-colorée + animations + bouton recommencer + NewsletterForm contextualisé) |

### Files to modify

| Path | Modification |
|---|---|
| `content.config.ts` | Ajouter collection `outils` avec schéma zod ; ajouter `relatedKit?: string` au schéma `rapports` |
| `app/components/AppHeader.vue` | Ajouter `<NuxtLink to="/outils">Boîte à Outils</NuxtLink>` entre Rapports et Fréquence |
| `app/components/NewsletterForm.vue` | Accepter props `kicker?`, `h3?`, `body?`, `context?`, `kitId?`, `tier?` (defaults = comportement actuel inchangé) ; passer ces props dans les events PostHog |
| `app/pages/rapports/[...slug].vue` | Insertion conditionnelle de `<KitCallout>` avant `<NewsletterForm>` si `article.relatedKit` est défini |

### Files NOT to modify (anti-regression)

- `app/pages/scanner.vue` — le wording "diagnostic" y reste (c'est *Le Diagnostic IA* du Scanner, distinct des kits)
- `app/components/KickerLabel.vue` — réutilisé tel quel
- `app/pages/index.vue` — pas de section Boîte à Outils sur la home en V1 (phase 2)

---

## Task 1 — Configuration Nuxt Content : collection `outils` + champ `relatedKit`

**Files:**
- Modify: `content.config.ts`

- [ ] **Step 1: Read the current content.config.ts**

```bash
cat content.config.ts
```

Expected: schema actuel avec collection `rapports` uniquement.

- [ ] **Step 2: Replace the file content with the extended schema**

Remplacer le contenu intégral de `content.config.ts` par :

```typescript
// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    rapports: defineCollection({
      type: 'page',
      source: 'rapports/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        category: z.enum(['soft-skills', 'comprendre-ia', 'cas-pratiques']),
        relatedKit: z.string().optional(),
      }),
    }),
    outils: defineCollection({
      type: 'page',
      source: 'outils/*.md',
      schema: z.object({
        id: z.string(),
        kind: z.enum(['quiz', 'cheatsheet', 'video', 'fiche', 'calculator']),
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        kicker: z.string(),
        parentArticleSlug: z.string(),
        specs: z.array(z.string()).default([]),
        calloutPitch: z.string().optional(),
        data: z.any(),
      }),
    }),
  },
})
```

- [ ] **Step 3: Start dev server and verify no schema error**

Run: `npm run dev`
Expected: server démarre, pas d'erreur Nuxt Content au boot. Si erreur "Cannot find collection 'outils'" → c'est normal car le dossier `content/outils/` n'existe pas encore (sera créé en Task 2).

Stop: Ctrl+C après vérif (~5s).

- [ ] **Step 4: Commit**

```bash
git add content.config.ts
git commit -m "feat(content): ajouter collection outils + champ relatedKit sur rapports"
```

---

## Task 2 — Data du premier kit : `content/outils/trc-01.md`

**Files:**
- Create: `content/outils/trc-01.md`

- [ ] **Step 1: Create the directory if needed**

```bash
mkdir -p content/outils
```

- [ ] **Step 2: Write the kit file**

Créer `content/outils/trc-01.md` avec le contenu intégral suivant :

```markdown
---
id: TRC-01
kind: quiz
title: Test de Résilience Cognitive
subtitle: 5 questions pour mesurer ta dépendance à l'IA
description: Test rapide pour évaluer si l'IA est devenue ta béquille cognitive — score immédiat, sans inscription.
kicker: KIT · TRC-01
parentArticleSlug: offloading-cognitif-quand-l-ia-pense-a-ta-place
specs:
  - "5 QUESTIONS"
  - "~2 MIN"
  - "TEST INTERACTIF"
  - "RÉSULTAT IMMÉDIAT"
calloutPitch: "Le test qui prolonge l'article : où en es-tu, vraiment, sur l'offloading cognitif ? Score immédiat, sans inscription, résultat privé."
data:
  questions:
    - id: 1
      label: "RÉFLEXE INITIAL"
      prompt: "Face à un problème complexe ou un nouveau projet, quel est ton premier réflexe ?"
      choices:
        - { key: "A", text: "J'esquisse la structure mentalement ou sur papier.", points: 0 }
        - { key: "B", text: "J'ouvre l'IA pour qu'elle me donne un plan.", points: 1 }
    - id: 2
      label: "PROCESSUS DE VALIDATION"
      prompt: "L'IA te génère un rapport de 3 pages. Comment le valides-tu ?"
      choices:
        - { key: "A", text: "Je le lis ligne par ligne avec un esprit critique.", points: 0 }
        - { key: "B", text: "Je le scanne en diagonale, ça a l'air pro, je valide.", points: 1 }
    - id: 3
      label: "RÉSILIENCE TECHNIQUE"
      prompt: "Demain, panne mondiale. Plus aucune IA n'est accessible. Ton état ?"
      choices:
        - { key: "A", text: "Je suis ralenti, mais je connais mon métier.", points: 0 }
        - { key: "B", text: "Je suis incapable de fournir mes livrables.", points: 1 }
    - id: 4
      label: "RÉSOLUTION D'ERREUR"
      prompt: "Une formule ou un bout de code généré par l'IA plante. Que fais-tu ?"
      choices:
        - { key: "A", text: "Je lis l'erreur pour comprendre ce qui cloche.", points: 0 }
        - { key: "B", text: "Je demande à l'IA : « corrige ça, ça ne marche pas ».", points: 1 }
    - id: 5
      label: "CAPITALISATION"
      prompt: "Tu dois refaire une tâche similaire à celle d'il y a 3 mois. Comment fais-tu ?"
      choices:
        - { key: "A", text: "Je me base sur mes notes et mon expérience.", points: 0 }
        - { key: "B", text: "Je redemande un prompt à zéro, je n'ai rien retenu.", points: 1 }
  tiers:
    - range: [0, 1]
      slug: lucide
      color: accent
      label: "SURVIVANT LUCIDE"
      status: "Optimal"
      body: "Tu utilises l'IA comme un multiplicateur de force, pas comme une béquille. Ton cerveau reste le pilote de l'opération. Continue à entretenir cette notion de l'effort."
    - range: [2, 3]
      slug: dependance
      color: mutation
      label: "DÉPENDANCE EN COURS"
      status: "Vigilance"
      body: "L'offloading cognitif commence à s'installer. Tu gagnes en vitesse, mais tu perds en profondeur. Il est temps de réinjecter de la conscience dans tes processus pour éviter l'atrophie."
    - range: [4, 5]
      slug: atrophie
      color: danger
      label: "ATROPHIE CRITIQUE"
      status: "Alerte Rouge"
      body: "Tu es passé en mode passager. Ton esprit critique est en veille prolongée. Si l'IA s'arrête, ton expertise s'effondre. Tu dois entamer une rééducation cognitive d'urgence."
  newsletter:
    lucide:
      kicker: "RESTER UN CRAN DEVANT"
      h3: "Tu pilotes déjà. Reste à la pointe."
      body: "Chaque semaine, des outils et signaux pour garder une longueur d'avance sur les autres dans ton équipe. Cinq minutes de lecture, sans hype, sans funnel."
    dependance:
      kicker: "REPRENDRE LE CONTRÔLE"
      h3: "Le test t'inquiète ? Reste un cran devant."
      body: "Chaque semaine, un article concret pour muscler ton esprit critique et apprendre à piloter l'IA sans y laisser ton cerveau. Cinq minutes de lecture, sans hype, sans funnel."
    atrophie:
      kicker: "RÉÉDUCATION COGNITIVE"
      h3: "Le test est sévère. La rééducation commence ici."
      body: "Chaque semaine, un article concret pour rééduquer ton esprit critique et reprendre le pilote face à l'IA. Pas de théorie, pas de jargon, juste la sortie."
---

Tu utilises l'IA tous les jours. Pour rédiger, pour résumer, pour décider. Mais à quel point ton cerveau est-il devenu dépendant ? Le test suivant te donne, en cinq questions, une mesure simple de ta résilience cognitive face à l'IA.

Aucune réponse n'est jugée. Aucune donnée n'est stockée. Le résultat s'affiche à l'écran et n'est partagé qu'avec toi.

::kit-quiz-slot
::

## Comment lire ton score

Le TRC-01 mesure ta dépendance cognitive sur cinq dimensions : réflexe initial, validation critique, résilience technique, résolution d'erreur, capitalisation. Un score élevé n'est pas un échec. C'est un signal.

Chacun des trois paliers décrit une posture, pas une fatalité. Le palier *DÉPENDANCE EN COURS* est le plus fréquent : il signifie que tu commences à transférer ton effort cognitif à l'IA, mais tu peux encore reprendre le pilote facilement. Le palier *ATROPHIE CRITIQUE* est plus rare et appelle une rééducation : couper l'IA quelques heures par jour, reprendre des notes manuelles, refaire des choses « sans l'aide ».

Les seuils sont indicatifs et calibrés pour un usage personnel. Le test n'est ni clinique ni standardisé. Il sert de signal, pas de verdict.

## Sources

Ce test est inspiré des travaux de recherche sur l'**offloading cognitif** (Risko & Gilbert, 2016, *Trends in Cognitive Sciences*) et plus récemment sur l'**over-reliance** des utilisateurs face aux modèles génératifs (Bhatti et al., 2024). Les questions ont été adaptées au contexte du salarié en poste, sans formation tech.

Pour aller plus loin, lis l'article-parent qui explique le mécanisme cognitif derrière ce test, et abonne-toi à La Fréquence pour recevoir chaque semaine un article concret sur le pilotage de l'IA dans ton métier.
```

> **Note pour l'engineer** : la directive `::kit-quiz-slot` est un marker dans le Markdown ; la page `[slug].vue` insérera le composant `<KitQuiz>` à cet emplacement (voir Task 6). Le rendu utilise un slot custom MDC, pas un composant directement importé dans le Markdown — ça évite d'avoir à enregistrer globalement le composant `<KitQuiz>` pour MDC.

- [ ] **Step 3: Start dev server and verify the file is parsed without zod error**

Run: `npm run dev`
Expected: server démarre proprement. Aller sur `http://localhost:3000/outils/trc-01` → 404 (normal, la page n'existe pas encore) mais aucune erreur Nuxt Content au boot.

Stop: Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add content/outils/trc-01.md
git commit -m "content(outils): ajouter le premier kit TRC-01 (Test de Résilience Cognitive)"
```

---

## Task 3 — Page liste `/outils` (skeleton)

**Files:**
- Create: `app/pages/outils/index.vue`

- [ ] **Step 1: Create the directory if needed**

```bash
mkdir -p app/pages/outils
```

- [ ] **Step 2: Write the page skeleton (data + minimal template)**

Créer `app/pages/outils/index.vue` :

```vue
<!-- app/pages/outils/index.vue -->
<script setup lang="ts">
const { data: kits } = await useAsyncData('all-kits', () =>
  queryCollection('outils')
    .order('id', 'ASC')
    .all()
)

const kitCount = computed(() => kits.value?.length ?? 0)
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <Breadcrumbs :items="[{ label: 'Boîte à Outils' }]" />

    <div class="page-header">
      <KickerLabel>LA BOÎTE À OUTILS</KickerLabel>
      <h1>Des <em>instruments de poche</em><br>pour piloter l'IA dans ton métier.</h1>
      <p>Tests, calculateurs, cheatsheets, fiches pratiques. Chaque outil prolonge un article : tu lis pour comprendre, tu utilises l'outil pour appliquer. Tout est gratuit, sans inscription.</p>
    </div>

    <div class="counter-bar">
      <span class="count"><strong>{{ kitCount }}</strong> outil{{ kitCount > 1 ? 's' : '' }} disponible{{ kitCount > 1 ? 's' : '' }} · <span class="muted">+ d'autres en route</span></span>
      <span>RÉSULTATS PRIVÉS · AUCUNE COLLECTE</span>
    </div>

    <div class="kits-grid">
      <pre v-for="kit in kits" :key="kit.id" style="color: var(--color-muted); font-family: var(--font-mono); font-size: 0.8rem;">{{ kit.id }} — {{ kit.title }} → {{ kit.path }}</pre>
    </div>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 3.5rem; max-width: 720px; }
.page-header h1 {
  font-family: var(--font-serif); font-style: italic;
  font-weight: 400;
  font-size: clamp(2.4rem, 5vw, 3.4rem);
  line-height: 1.1;
  margin: 1.25rem 0;
}
.page-header h1 em { color: var(--color-accent); font-style: italic; }
.page-header p {
  font-size: 1.05rem;
  color: var(--color-text-soft);
  line-height: 1.65;
  max-width: 60ch;
}
.counter-bar {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
  border-top: 1px dashed var(--color-hairline);
  border-bottom: 1px dashed var(--color-hairline);
  padding: 0.85rem 0;
  margin-bottom: 2.5rem;
  display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
}
.counter-bar .count strong { color: var(--color-accent); font-weight: 600; }
.counter-bar .muted { color: var(--color-muted-soft); }
.kits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.5rem;
}
</style>
```

- [ ] **Step 3: Start dev server and visit /outils**

Run: `npm run dev`
Open: `http://localhost:3000/outils`
Expected: page se charge, affiche le header, la counter bar (`1 outil disponible · + d'autres en route`), et un `<pre>` avec `TRC-01 — Test de Résilience Cognitive → /outils/trc-01`.

Stop: Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/pages/outils/index.vue
git commit -m "feat(outils): page liste /outils skeleton (header + counter + grille raw)"
```

---

## Task 4 — Composant `KitCard.vue` (carte d'un kit + variant placeholder)

**Files:**
- Create: `app/components/KitCard.vue`
- Modify: `app/pages/outils/index.vue`

- [ ] **Step 1: Write the KitCard component**

Créer `app/components/KitCard.vue` :

```vue
<!-- app/components/KitCard.vue -->
<script setup lang="ts">
type KitProp = {
  id: string
  kind: string
  title: string
  description: string
  specs: string[]
  path?: string
}

const props = defineProps<{
  kit?: KitProp
  /** Variant 'coming' = placeholder « PROCHAINEMENT » non cliquable */
  variant?: 'kit' | 'coming'
  /** Position in the grid (1-based), used for tracking */
  position?: number
}>()

const emit = defineEmits<{
  'card-click': [{ id: string; position: number }]
}>()

const isComing = computed(() => props.variant === 'coming')
const target = computed(() => {
  if (isComing.value) return undefined
  if (!props.kit?.path) return undefined
  return `${props.kit.path}?from=list`
})

function onClick() {
  if (isComing.value) return
  if (!props.kit) return
  emit('card-click', { id: props.kit.id, position: props.position ?? 0 })
}
</script>

<template>
  <NuxtLink
    v-if="!isComing && target"
    :to="target"
    class="kit-card"
    :data-attr="`kit-card-${kit?.id?.toLowerCase()}`"
    @click="onClick"
  >
    <div class="card-meta">
      <span class="card-id">{{ kit?.id }}</span>
      <span class="card-kind">{{ kit?.kind?.toUpperCase() }}</span>
    </div>
    <h3 class="card-title">{{ kit?.title }}</h3>
    <p class="card-desc">{{ kit?.description }}</p>
    <div class="card-specs">
      <span v-for="(s, i) in kit?.specs ?? []" :key="i">{{ s }}</span>
    </div>
    <div class="card-cta">▶ MESURER MA RÉSILIENCE</div>
  </NuxtLink>

  <div v-else class="kit-card coming" aria-hidden="true">
    <div class="card-meta">
      <span class="card-id">??-??</span>
      <span class="card-kind">PROCHAIN OUTIL</span>
    </div>
    <h3 class="card-title">PROCHAINEMENT</h3>
    <p class="card-desc">Le prochain instrument de la boîte arrive avec son article. Reste à la Fréquence pour le recevoir en premier.</p>
    <div class="card-specs">
      <span>EN PRÉPARATION</span>
    </div>
    <div class="card-cta">— —</div>
  </div>
</template>

<style scoped>
.kit-card {
  position: relative;
  display: flex; flex-direction: column;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.75rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}
.kit-card:hover {
  border-color: var(--color-accent);
  background: var(--color-surface-2);
  transform: translateY(-2px);
}
.kit-card::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 36px; height: 2px;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
  transition: width 0.25s ease;
}
.kit-card:hover::before { width: 60px; }

.card-meta {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}
.card-id { color: var(--color-accent); font-weight: 600; }
.card-kind {
  border: 1px solid var(--color-hairline-strong);
  padding: 0.2rem 0.55rem;
  color: var(--color-muted);
}

.card-title {
  font-family: var(--font-serif); font-style: italic;
  font-weight: 400;
  font-size: 1.45rem; line-height: 1.25;
  margin: 0 0 0.85rem;
  color: var(--color-text);
}
.card-desc {
  font-size: 0.92rem;
  color: var(--color-muted);
  margin: 0 0 1.5rem;
  flex: 1;
}

.card-specs {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted-soft);
  margin-bottom: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-hairline);
  display: flex; gap: 0.85rem; flex-wrap: wrap;
}
.card-specs span:not(:last-child)::after {
  content: '·'; margin-left: 0.85rem; color: var(--color-dim);
}

.card-cta {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
}

/* Coming variant */
.kit-card.coming {
  cursor: default;
  opacity: 0.7;
  border-style: dashed;
  background: transparent;
}
.kit-card.coming:hover { transform: none; border-color: var(--color-rule); background: transparent; }
.kit-card.coming::before { display: none; }
.kit-card.coming .card-id { color: var(--color-muted); }
.kit-card.coming .card-title {
  font-style: normal; font-family: var(--font-mono);
  font-size: 0.95rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--color-muted);
}
.kit-card.coming .card-cta { color: var(--color-muted-soft); }
</style>
```

- [ ] **Step 2: Wire KitCard into the list page**

Modifier `app/pages/outils/index.vue` — remplacer le `<div class="kits-grid">` actuel par :

```vue
    <div class="kits-grid">
      <KitCard
        v-for="(kit, i) in kits ?? []"
        :key="kit.id"
        :kit="{
          id: kit.id,
          kind: kit.kind,
          title: kit.title,
          description: kit.description,
          specs: kit.specs,
          path: kit.path,
        }"
        :position="i + 1"
      />
      <KitCard variant="coming" />
    </div>

    <p class="bottom-note">
      UN OUTIL EN TÊTE QUE TU AIMERAIS TROUVER ICI ?
      <a href="mailto:hello@survivant-ia.ch?subject=Idée%20d'outil%20pour%20la%20Boîte">ÉCRIS-MOI →</a>
    </p>
```

Et ajouter dans le `<style scoped>` :

```css
.bottom-note {
  margin-top: 5rem;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.bottom-note a { color: var(--color-accent); text-decoration: none; }
```

> **Note** : remplacer `hello@survivant-ia.ch` par l'adresse email réelle de contact du site si elle est différente. Vérifier dans `AppFooter.vue` ou `confidentialite.vue` s'il y a déjà une adresse.

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/outils`
Expected: la grille affiche maintenant 2 cartes — une vraie pour TRC-01 (sage menthe accent, hover qui change la border et le top-rule), et un placeholder « PROCHAINEMENT » dashed à droite. Le bottom-note est centré tout en bas. Click sur la vraie carte → navigue vers `/outils/trc-01?from=list` (qui retourne 404 pour l'instant — la page sera créée en Task 6).

Stop: Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/components/KitCard.vue app/pages/outils/index.vue
git commit -m "feat(outils): composant KitCard (variant kit + coming) + intégration page liste"
```

---

## Task 5 — Page liste `/outils` : SEO + tracking + filtres désactivés

**Files:**
- Modify: `app/pages/outils/index.vue`

- [ ] **Step 1: Add SEO meta + JSON-LD + OG image at the top of `<script setup>`**

En haut du `<script setup>` de `app/pages/outils/index.vue`, ajouter avant `useAsyncData` :

```typescript
useSeoMeta({
  title: 'La Boîte à Outils : tests et instruments pour piloter l\'IA | Survivant-IA',
  description: 'Tests, calculateurs, cheatsheets pour les salariés non-tech qui veulent piloter l\'IA dans leur métier. Gratuit, sans inscription, résultats privés.',
  ogTitle: 'La Boîte à Outils — Survivant-IA',
  ogDescription: 'Des instruments de poche pour piloter l\'IA dans ton métier. Chaque outil prolonge un article.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'La Boîte à Outils — Survivant-IA',
  twitterDescription: 'Des instruments de poche pour piloter l\'IA dans ton métier.',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': 'https://survivant-ia.ch/outils#page',
          name: 'La Boîte à Outils',
          description: 'Tests, calculateurs, cheatsheets pour piloter l\'IA dans son métier. Chaque outil prolonge un article.',
          inLanguage: 'fr-CH',
          isPartOf: { '@id': 'https://survivant-ia.ch/#website' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
            { '@type': 'ListItem', position: 2, name: 'Boîte à Outils' },
          ],
        },
      ],
    }),
  }],
})

defineOgImage('Default', {
  title: 'La Boîte à Outils',
  kicker: '// INSTRUMENTS POUR PILOTER L\'IA',
})
```

- [ ] **Step 2: Add tracking events at the top of `<script setup>` (after the SEO block)**

```typescript
const { capture } = usePosthogEvent()

onMounted(() => {
  capture('kit_list_viewed')
})

function onCardClick(payload: { id: string; position: number }) {
  capture('kit_list_card_clicked', payload)
}
```

- [ ] **Step 3: Wire the click handler in the template**

Sur le `<KitCard>` réel, ajouter `@card-click="onCardClick"` :

```vue
      <KitCard
        v-for="(kit, i) in kits ?? []"
        :key="kit.id"
        :kit="…"
        :position="i + 1"
        @card-click="onCardClick"
      />
```

- [ ] **Step 4: Add a disabled-filters bar (UI placeholder for V2)**

Avant `<div class="kits-grid">`, ajouter le bloc filtres :

```vue
    <div class="filters">
      <button class="filter active" type="button">TOUS</button>
      <button class="filter disabled" type="button" disabled>QUIZ</button>
      <button class="filter disabled" type="button" disabled>CHEATSHEET</button>
      <button class="filter disabled" type="button" disabled>FICHE</button>
      <button class="filter disabled" type="button" disabled>VIDÉO</button>
    </div>
```

Et dans `<style scoped>` :

```css
.filters {
  display: flex; gap: 0.6rem; flex-wrap: wrap;
  margin-bottom: 2.5rem;
}
.filter {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--color-hairline);
  color: var(--color-muted);
  background: transparent;
  cursor: not-allowed;
}
.filter.active { color: var(--color-accent); border-color: var(--color-accent); cursor: pointer; }
.filter.disabled { opacity: 0.4; }
```

- [ ] **Step 5: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/outils`
Expected:
- Filtres visibles, `TOUS` actif sage, autres grisés
- Console (F12) → cliquer une carte → log `[ph] kit_list_card_clicked { id: "TRC-01", position: 1 }`
- Console au load → log `[ph] kit_list_viewed`
- View source → balises `<title>`, `<meta>`, `<script type="application/ld+json">` présentes

Stop: Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add app/pages/outils/index.vue
git commit -m "feat(outils): SEO (CollectionPage JSON-LD + OG) + tracking PostHog + filtres désactivés"
```

---

## Task 6 — Page détail `/outils/[slug]` : skeleton (header + body Markdown via `<ContentRenderer>`)

**Files:**
- Create: `app/pages/outils/[slug].vue`

- [ ] **Step 1: Write the page skeleton**

Créer `app/pages/outils/[slug].vue` :

```vue
<!-- app/pages/outils/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

const { data: kit } = await useAsyncData(`kit-${slug}`, () =>
  queryCollection('outils')
    .path(`/outils/${slug}`)
    .first()
)

if (!kit.value) {
  throw createError({ statusCode: 404, statusMessage: 'Kit introuvable' })
}
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <Breadcrumbs
      :items="[
        { label: 'Boîte à Outils', to: '/outils' },
        { label: kit?.id ?? '' },
      ]"
    />

    <article class="kit-page" v-if="kit">
      <header class="kit-header">
        <KickerLabel>{{ kit.kicker }}</KickerLabel>
        <h1 class="kit-title">{{ kit.title }}</h1>
        <div class="kit-specs">
          <template v-for="(s, i) in kit.specs ?? []" :key="i">
            <span class="spec">{{ s }}</span>
            <span v-if="i < (kit.specs.length - 1)" class="dot" aria-hidden="true">·</span>
          </template>
        </div>
      </header>

      <div class="kit-body prose">
        <ContentRenderer :value="kit" />
      </div>
    </article>
  </div>
</template>

<style scoped>
.kit-page { max-width: 780px; margin: 0 auto; }
.kit-header { margin-bottom: 3rem; }
.kit-title {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.15;
  color: var(--color-text);
  margin: 1.25rem 0 1.5rem;
}
.kit-specs {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
  display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
}
.kit-specs .dot { color: var(--color-dim); }
.kit-body { font-size: 1.02rem; line-height: 1.75; color: var(--color-text-soft); }
</style>
```

- [ ] **Step 2: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/outils/trc-01`
Expected:
- Page se charge
- Breadcrumb visible
- Kicker `KIT · TRC-01` avec carré spinning sage
- H1 Playfair italic « Test de Résilience Cognitive »
- Specs `5 QUESTIONS · ~2 MIN · TEST INTERACTIF · RÉSULTAT IMMÉDIAT`
- Le body Markdown s'affiche (intro 2 paragraphes, puis `kit-quiz-slot` rendu en HTML brut — c'est OK pour l'instant, on remplacera en Task 9)
- Outro avec H2 « Comment lire ton score » et « Sources »

Stop: Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/pages/outils/[slug].vue
git commit -m "feat(outils): page détail [slug] skeleton (header + body Markdown via ContentRenderer)"
```

---

## Task 7 — Page détail : bandeau article-parent en haut + carte retour en bas

**Files:**
- Modify: `app/pages/outils/[slug].vue`

- [ ] **Step 1: Add a useAsyncData call to fetch the parent article**

Dans `<script setup>` de `app/pages/outils/[slug].vue`, après le query du kit, ajouter :

```typescript
const { data: parentArticle } = await useAsyncData(`parent-of-${slug}`, async () => {
  if (!kit.value?.parentArticleSlug) return null
  return await queryCollection('rapports')
    .path(`/rapports/${kit.value.parentArticleSlug}`)
    .first()
})
```

- [ ] **Step 2: Add the parent banner at the top of the article (after the header, before the body)**

Dans le template, entre `</header>` et `<div class="kit-body prose">`, insérer :

```vue
      <NuxtLink
        v-if="parentArticle"
        :to="parentArticle.path"
        class="parent-card"
      >
        <div class="parent-info">
          <div class="parent-label">▶ À LIRE D'ABORD</div>
          <div class="parent-title">{{ parentArticle.title }}</div>
        </div>
        <div class="parent-arrow" aria-hidden="true">→</div>
      </NuxtLink>
```

Et après `</div>` de la classe `kit-body`, ajouter :

```vue
      <footer class="kit-footer">
        <NuxtLink
          v-if="parentArticle"
          :to="parentArticle.path"
          class="return-card"
        >
          <div class="return-label">// POUR EN SAVOIR PLUS</div>
          <div class="return-title">{{ parentArticle.title }}</div>
          <p class="return-teaser">{{ parentArticle.description }}</p>
          <span class="return-link">▶ LIRE L'ARTICLE COMPLET</span>
        </NuxtLink>

        <NewsletterForm />
      </footer>
```

- [ ] **Step 3: Add the styles for parent-card, return-card, kit-footer**

Dans le `<style scoped>`, ajouter :

```css
.parent-card {
  display: flex; justify-content: space-between; align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.25rem 1.5rem;
  margin-bottom: 3rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease;
}
.parent-card:hover { border-color: var(--color-accent); }
.parent-info { flex: 1; }
.parent-label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 0.4rem;
}
.parent-title { font-size: 0.95rem; color: var(--color-text-soft); }
.parent-arrow { color: var(--color-accent); font-family: var(--font-mono); font-size: 1.1rem; }

.kit-footer {
  margin-top: 5rem;
  border-top: 1px solid var(--color-rule);
  padding-top: 3rem;
}
.return-card {
  display: block;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.5rem 2rem;
  margin-bottom: 3rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease;
}
.return-card:hover { border-color: var(--color-accent); }
.return-label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 0.5rem;
}
.return-title {
  font-family: var(--font-serif); font-style: italic;
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}
.return-teaser { font-size: 0.92rem; color: var(--color-muted); margin: 0 0 0.75rem; }
.return-link {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  color: var(--color-accent);
}
```

- [ ] **Step 4: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/outils/trc-01`
Expected:
- Si l'article-parent (`offloading-cognitif-quand-l-ia-pense-a-ta-place.md`) **n'existe pas encore** → la query retourne `null` → les blocs parent ne s'affichent pas (`v-if="parentArticle"`). C'est OK pour l'instant. Le footer affiche juste le `<NewsletterForm>`.
- Si l'article existe (sera créé en Task 14) → le bandeau parent s'affiche en haut (clic = navigation vers l'article) et la carte retour en bas.

Stop: Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add app/pages/outils/[slug].vue
git commit -m "feat(outils): bandeau article-parent en haut + carte retour en bas + footer NewsletterForm"
```

---

## Task 8 — Composant `KitQuizQuestion.vue` (sous-composant : une question + 2 choix)

**Files:**
- Create: `app/components/kits/KitQuizQuestion.vue`

- [ ] **Step 1: Create the directory if needed**

```bash
mkdir -p app/components/kits
```

- [ ] **Step 2: Write the component**

Créer `app/components/kits/KitQuizQuestion.vue` :

```vue
<!-- app/components/kits/KitQuizQuestion.vue -->
<script setup lang="ts">
type Choice = { key: string; text: string; points: number }
type Question = { id: number; label: string; prompt: string; choices: Choice[] }

const props = defineProps<{
  question: Question
  index: number   // 1-based
  total: number
}>()

const emit = defineEmits<{
  answered: [{ questionId: number; choice: Choice }]
}>()

function pick(choice: Choice) {
  emit('answered', { questionId: props.question.id, choice })
}
</script>

<template>
  <div class="quiz-question">
    <div class="q-label">QUESTION {{ index }} / {{ total }} — {{ question.label }}</div>
    <div class="q-prompt">« {{ question.prompt }} »</div>
    <div class="q-choices">
      <button
        v-for="choice in question.choices"
        :key="choice.key"
        type="button"
        class="q-choice"
        :data-attr="`kit-quiz-choice-${index}-${choice.key.toLowerCase()}`"
        @click="pick(choice)"
      >
        <span class="key">[ {{ choice.key }} ]</span>
        <span class="text">{{ choice.text }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-question {
  display: flex; flex-direction: column;
}
.q-label {
  font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 1rem;
}
.q-prompt {
  font-family: var(--font-serif); font-style: italic;
  font-size: 1.4rem; line-height: 1.4;
  color: var(--color-text);
  margin-bottom: 2rem;
}
.q-choices {
  display: flex; flex-direction: column; gap: 0.75rem;
}
.q-choice {
  display: flex; align-items: flex-start; gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-hairline);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  width: 100%;
  font-family: var(--font-sans);
}
.q-choice:hover { border-color: var(--color-accent); background: rgba(108, 227, 181, 0.04); }
.q-choice .key {
  font-family: var(--font-mono); font-size: 0.85rem;
  color: var(--color-accent); flex-shrink: 0;
}
.q-choice .text { color: var(--color-text-soft); font-size: 0.96rem; }
</style>
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run dev`
Expected: pas d'erreur de compilation Vue/TypeScript dans la console du dev server. Le composant n'est pas encore utilisé, mais Nuxt l'auto-détecte (auto-import).

Stop: Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/components/kits/KitQuizQuestion.vue
git commit -m "feat(kits): composant KitQuizQuestion (une question + 2 choix style terminal)"
```

---

## Task 9 — Composant `KitQuiz.vue` (state machine + advance + back) + intégration dans la page

**Files:**
- Create: `app/components/kits/KitQuiz.vue`
- Modify: `app/pages/outils/[slug].vue` (remplacer `<ContentRenderer>` par un rendu split intro/quiz/outro)

- [ ] **Step 1: Write the KitQuiz component (state machine, no tracking yet, no result yet)**

Créer `app/components/kits/KitQuiz.vue` :

```vue
<!-- app/components/kits/KitQuiz.vue -->
<script setup lang="ts">
type Choice = { key: string; text: string; points: number }
type Question = { id: number; label: string; prompt: string; choices: Choice[] }
type Tier = { range: [number, number]; slug: string; color: string; label: string; status: string; body: string }
type NewsletterVariant = { kicker: string; h3: string; body: string }
type QuizData = {
  questions: Question[]
  tiers: Tier[]
  newsletter: { lucide: NewsletterVariant; dependance: NewsletterVariant; atrophie: NewsletterVariant }
}

const props = defineProps<{
  kitId: string
  data: QuizData
}>()

type State = 'question' | 'decrypting' | 'result'

const state = ref<State>('question')
const currentIndex = ref(0)              // 0-based
const answers = ref<Map<number, Choice>>(new Map())
const total = computed(() => props.data.questions.length)
const currentQuestion = computed(() => props.data.questions[currentIndex.value])

const score = computed(() => {
  let s = 0
  for (const c of answers.value.values()) s += c.points
  return s
})

const tier = computed(() => {
  const s = score.value
  return props.data.tiers.find(t => s >= t.range[0] && s <= t.range[1]) ?? props.data.tiers[0]
})

function onAnswered(payload: { questionId: number; choice: Choice }) {
  answers.value.set(payload.questionId, payload.choice)
  if (currentIndex.value < total.value - 1) {
    currentIndex.value += 1
  } else {
    state.value = 'decrypting'
    // Decrypting animation duration = 1200ms (Task 13 will refine, here we just transition)
    setTimeout(() => { state.value = 'result' }, 1200)
  }
}

function goBack() {
  if (currentIndex.value > 0) currentIndex.value -= 1
}

function restart() {
  answers.value.clear()
  currentIndex.value = 0
  state.value = 'question'
}

defineExpose({ restart })
</script>

<template>
  <div class="kit-quiz" role="region" aria-label="Quiz interactif">
    <div class="quiz-frame">
      <Transition name="fade-slide" mode="out-in">
        <div :key="state + '-' + currentIndex">
          <KitQuizQuestion
            v-if="state === 'question' && currentQuestion"
            :question="currentQuestion"
            :index="currentIndex + 1"
            :total="total"
            @answered="onAnswered"
          />

          <div v-else-if="state === 'decrypting'" class="quiz-decrypting" aria-live="polite">
            <div class="decrypt-label">// CALCUL EN COURS</div>
            <div class="decrypt-bar"><span /></div>
          </div>

          <KitQuizResult
            v-else-if="state === 'result'"
            :kit-id="kitId"
            :score="score"
            :tier="tier"
            :total="total"
            :newsletter-variants="data.newsletter"
            @restart="restart"
          />
        </div>
      </Transition>
    </div>

    <div v-if="state === 'question'" class="quiz-controls">
      <button
        v-if="currentIndex > 0"
        type="button"
        class="back-btn"
        data-attr="kit-quiz-back"
        @click="goBack"
      >◀ Q PRÉCÉDENTE</button>
      <span v-else class="back-spacer"></span>

      <div class="progress" :aria-label="`Question ${currentIndex + 1} sur ${total}`">
        <span
          v-for="(_, i) in data.questions"
          :key="i"
          class="dot"
          :class="{ done: answers.has(data.questions[i].id) }"
        />
      </div>

      <span class="back-spacer"></span>
    </div>
  </div>
</template>

<style scoped>
.kit-quiz {
  margin: 3rem 0;
}
.quiz-frame {
  position: relative;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 2.5rem 2rem;
  min-height: 280px;
}
.quiz-frame::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 60px; height: 3px;
  background: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent-glow);
}

/* Decrypting */
.quiz-decrypting {
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  padding: 3rem 0;
}
.decrypt-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.decrypt-bar {
  width: 240px; height: 2px;
  background: var(--color-hairline);
  overflow: hidden;
  position: relative;
}
.decrypt-bar span {
  display: block; height: 100%; width: 0;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
  animation: decrypt-fill 1.2s ease-out forwards;
}
@keyframes decrypt-fill { to { width: 100%; } }

/* Controls */
.quiz-controls {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1.5rem;
}
.back-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0.5rem 0;
}
.back-btn:hover { color: var(--color-accent); }
.back-spacer { display: inline-block; min-width: 90px; }
.progress { display: flex; gap: 0.4rem; }
.progress .dot {
  width: 28px; height: 2px;
  background: var(--color-hairline);
  transition: background 0.2s;
}
.progress .dot.done {
  background: var(--color-accent);
  box-shadow: 0 0 4px var(--color-accent-glow);
}

/* Transition */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateX(12px); }
.fade-slide-leave-to   { opacity: 0; transform: translateX(-12px); }

@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active, .fade-slide-leave-active { transition: none; }
  .decrypt-bar span { animation: none; width: 100%; }
}
</style>
```

> **Note** : `<KitQuizResult>` n'existe pas encore (créé en Task 11). Pour l'instant, le `<v-else-if="state === 'result'">` produira un warning runtime "unknown component KitQuizResult". C'est OK temporairement — on validera Task 9 sur l'avancement Q1→Q5 + écran decrypting, et Task 11 ajoutera le résultat.

- [ ] **Step 2: Replace `<ContentRenderer>` block in `pages/outils/[slug].vue` with split intro / quiz / outro**

Dans `app/pages/outils/[slug].vue`, remplacer :

```vue
      <div class="kit-body prose">
        <ContentRenderer :value="kit" />
      </div>
```

par :

```vue
      <div class="kit-body prose">
        <ContentRenderer
          :value="kit"
          :components="{ 'kit-quiz-slot': KitQuizSlotMarker }"
        />
      </div>
```

Hmm, en fait le pattern Nuxt Content MDC ne marche pas avec un component en marker. La méthode propre : on **split** le rendu avant et après le marker. On va lire le `kit.body` et le splitter manuellement, OU on rend simplement `<KitQuiz>` après le `<ContentRenderer>` complet.

**Approche pragmatique retenue** : on rend `<ContentRenderer>` pour tout le body (intro + outro), et on insère `<KitQuiz>` **entre** par split du body côté template. Mais Nuxt Content rend déjà tout en un bloc.

**Solution plus simple et propre** : on **enlève le marker** `::kit-quiz-slot ::` du fichier `.md`, et on rend dans cet ordre dans le template :

```vue
      <div class="kit-body prose">
        <ContentRenderer :value="kit" />
        <KitQuiz
          v-if="kit?.kind === 'quiz' && kit?.data"
          :kit-id="kit.id"
          :data="kit.data"
        />
      </div>
```

Mais dans ce cas, l'intro Markdown est rendue AVANT le quiz, et l'outro APRÈS… mais le ContentRenderer rend tout d'une traite.

**Solution finale propre** : utiliser le `excerpt` ou splitter manuellement le body en 2 collections via convention (le frontmatter peut avoir `intro` et `outro` au lieu d'un body unique, et on rend chacun avec un component). C'est plus clean.

**Décision V1** : on stocke l'intro et l'outro dans le frontmatter sous `intro: ""` et `outro: ""` (raw markdown strings), et on les rend via `<MDC :value="kit.intro" />` (composant Nuxt Content qui rend du markdown inline). Le body Markdown du `.md` sert uniquement aux notes éditoriales (non rendues).

**Action concrète** :

a) Modifier `content.config.ts` pour ajouter `intro` et `outro` au schéma de la collection `outils` :

Dans le `schema: z.object({…})` de `outils`, ajouter :

```typescript
        intro: z.string().default(''),
        outro: z.string().default(''),
```

b) Modifier `content/outils/trc-01.md` : déplacer l'intro et l'outro depuis le body vers le frontmatter, sous forme de strings YAML multi-lignes :

```yaml
intro: |
  Tu utilises l'IA tous les jours. Pour rédiger, pour résumer, pour décider. Mais à quel point ton cerveau est-il devenu dépendant ? Le test suivant te donne, en cinq questions, une mesure simple de ta résilience cognitive face à l'IA.

  Aucune réponse n'est jugée. Aucune donnée n'est stockée. Le résultat s'affiche à l'écran et n'est partagé qu'avec toi.

outro: |
  ## Comment lire ton score

  Le TRC-01 mesure ta dépendance cognitive sur cinq dimensions : réflexe initial, validation critique, résilience technique, résolution d'erreur, capitalisation. Un score élevé n'est pas un échec. C'est un signal.

  Chacun des trois paliers décrit une posture, pas une fatalité. Le palier *DÉPENDANCE EN COURS* est le plus fréquent : il signifie que tu commences à transférer ton effort cognitif à l'IA, mais tu peux encore reprendre le pilote facilement. Le palier *ATROPHIE CRITIQUE* est plus rare et appelle une rééducation : couper l'IA quelques heures par jour, reprendre des notes manuelles, refaire des choses « sans l'aide ».

  Les seuils sont indicatifs et calibrés pour un usage personnel. Le test n'est ni clinique ni standardisé. Il sert de signal, pas de verdict.

  ## Sources

  Ce test est inspiré des travaux de recherche sur l'**offloading cognitif** (Risko & Gilbert, 2016, *Trends in Cognitive Sciences*) et plus récemment sur l'**over-reliance** des utilisateurs face aux modèles génératifs (Bhatti et al., 2024). Les questions ont été adaptées au contexte du salarié en poste, sans formation tech.

  Pour aller plus loin, lis l'article-parent qui explique le mécanisme cognitif derrière ce test, et abonne-toi à La Fréquence pour recevoir chaque semaine un article concret sur le pilotage de l'IA dans ton métier.
```

Et **vider** le body du `.md` (juste après le `---` de fin du frontmatter, ne laisser qu'une ligne vide ou un commentaire éditorial qui n'est pas rendu).

c) Modifier `app/pages/outils/[slug].vue` template, remplacer le `<div class="kit-body prose">` complet par :

```vue
      <div class="kit-body prose">
        <MDC v-if="kit.intro" :value="kit.intro" tag="div" />

        <KitQuiz
          v-if="kit.kind === 'quiz' && kit.data"
          :kit-id="kit.id"
          :data="kit.data"
        />

        <MDC v-if="kit.outro" :value="kit.outro" tag="div" />
      </div>
```

> Le composant `<MDC>` est fourni par `@nuxt/content` v3 et permet de rendre du Markdown inline depuis une string. Auto-importé.

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/outils/trc-01`
Expected:
- L'intro Markdown s'affiche (2 paragraphes)
- En dessous, le composant `<KitQuiz>` affiche Q1 (« Face à un problème complexe… ») avec choix `[ A ]` et `[ B ]`
- Les contrôles en bas : pas de bouton « Q précédente » sur Q1, indicateur de progression `● ○ ○ ○ ○`
- Cliquer `[ A ]` → la question avance vers Q2 (transition fluide), bouton « Q précédente » apparaît, dot 1 devient sage
- Cliquer plusieurs fois pour avancer jusqu'à Q5 puis cliquer un choix → écran « CALCUL EN COURS » avec barre qui se remplit en 1.2s
- Après 1.2s : warning console « unknown custom element KitQuizResult » + zone vide. **C'est attendu**, sera fixé en Task 11.
- Sous le quiz, l'outro Markdown (« Comment lire ton score », « Sources ») s'affiche

Stop: Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add content.config.ts content/outils/trc-01.md app/components/kits/KitQuiz.vue app/pages/outils/[slug].vue
git commit -m "feat(kits): KitQuiz state machine (advance/back/decrypt) + split intro/quiz/outro via MDC"
```

---

## Task 10 — Tracking PostHog dans `KitQuiz` (started, question_answered, abandoned, restarted)

**Files:**
- Modify: `app/components/kits/KitQuiz.vue`

- [ ] **Step 1: Add `usePosthogEvent` import and capture calls in the script**

En haut du `<script setup>` de `KitQuiz.vue`, ajouter :

```typescript
const { capture } = usePosthogEvent()
const startedFired = ref(false)
```

- [ ] **Step 2: Modify `onAnswered` to fire `kit_quiz_started`, `kit_quiz_question_answered`, `kit_quiz_completed`**

Remplacer la fonction `onAnswered` par :

```typescript
function onAnswered(payload: { questionId: number; choice: Choice }) {
  // Fire kit_quiz_started on the very first answer
  if (!startedFired.value) {
    capture('kit_quiz_started', { id: props.kitId })
    startedFired.value = true
  }

  capture('kit_quiz_question_answered', {
    id: props.kitId,
    question: payload.questionId,
    choice: payload.choice.key,
    points: payload.choice.points,
  })

  answers.value.set(payload.questionId, payload.choice)

  if (currentIndex.value < total.value - 1) {
    currentIndex.value += 1
  } else {
    state.value = 'decrypting'
    capture('kit_quiz_completed', {
      id: props.kitId,
      score: score.value,
      tier: tier.value.slug,
    })
    setTimeout(() => { state.value = 'result' }, 1200)
  }
}
```

- [ ] **Step 3: Modify `restart` to fire `kit_quiz_restarted`**

```typescript
function restart() {
  capture('kit_quiz_restarted', { id: props.kitId })
  answers.value.clear()
  currentIndex.value = 0
  startedFired.value = false
  state.value = 'question'
}
```

- [ ] **Step 4: Add `kit_quiz_abandoned` on unmount or beforeunload (only if started but not completed)**

Avant la fermeture du `<script setup>`, ajouter :

```typescript
function maybeFireAbandoned() {
  if (startedFired.value && state.value === 'question') {
    capture('kit_quiz_abandoned', {
      id: props.kitId,
      last_question: currentIndex.value + 1,
    })
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('beforeunload', maybeFireAbandoned)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('beforeunload', maybeFireAbandoned)
  }
  maybeFireAbandoned()
})
```

- [ ] **Step 5: Verify in dev server with console open**

Run: `npm run dev`
Open: `http://localhost:3000/outils/trc-01` avec DevTools console (F12).
Actions :
1. Cliquer `[ A ]` sur Q1 → console : `[ph] kit_quiz_started { id: "TRC-01" }` puis `[ph] kit_quiz_question_answered { id: "TRC-01", question: 1, choice: "A", points: 0 }`
2. Cliquer `[ B ]` sur Q2 → console : `[ph] kit_quiz_question_answered { id: "TRC-01", question: 2, choice: "B", points: 1 }`
3. Naviguer vers `/` (Home) sans finir → console : `[ph] kit_quiz_abandoned { id: "TRC-01", last_question: 3 }` (ou autre numéro selon où on s'est arrêté)
4. Revenir sur `/outils/trc-01` et finir le quiz (5 réponses) → console à la 5e : `[ph] kit_quiz_question_answered …` puis `[ph] kit_quiz_completed { id: "TRC-01", score: <0-5>, tier: "<slug>" }`
5. (`KitQuizResult` n'existe pas encore donc l'écran reste vide après decrypting — OK)

Stop: Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add app/components/kits/KitQuiz.vue
git commit -m "feat(kits): tracking PostHog (started/answered/completed/restarted/abandoned)"
```

---

## Task 11 — Composant `KitQuizResult.vue` (sans animations) + couleur tier dynamique

**Files:**
- Create: `app/components/kits/KitQuizResult.vue`

- [ ] **Step 1: Write the component**

Créer `app/components/kits/KitQuizResult.vue` :

```vue
<!-- app/components/kits/KitQuizResult.vue -->
<script setup lang="ts">
type Tier = { range: [number, number]; slug: string; color: string; label: string; status: string; body: string }
type NewsletterVariant = { kicker: string; h3: string; body: string }
type NewsletterVariants = { lucide: NewsletterVariant; dependance: NewsletterVariant; atrophie: NewsletterVariant }

const props = defineProps<{
  kitId: string
  score: number
  tier: Tier
  total: number
  newsletterVariants: NewsletterVariants
}>()

const emit = defineEmits<{
  restart: []
}>()

// Map color slug → CSS variable
const colorVar = computed(() => {
  const map: Record<string, string> = {
    accent: 'var(--color-accent)',
    mutation: 'var(--color-mutation)',
    danger: 'var(--color-danger)',
    protege: 'var(--color-protege)',
    croissance: 'var(--color-croissance)',
  }
  return map[props.tier.color] ?? 'var(--color-accent)'
})

const colorVarSoft = computed(() => {
  // Build an rgba shadow color from the same color slug
  const map: Record<string, string> = {
    accent: 'rgba(108, 227, 181, 0.5)',
    mutation: 'rgba(255, 166, 48, 0.5)',
    danger: 'rgba(255, 62, 62, 0.5)',
    protege: 'rgba(91, 192, 235, 0.5)',
    croissance: 'rgba(61, 220, 132, 0.5)',
  }
  return map[props.tier.color] ?? 'rgba(108, 227, 181, 0.5)'
})

const newsletterVariant = computed(() => {
  return props.newsletterVariants[props.tier.slug as keyof NewsletterVariants] ?? props.newsletterVariants.dependance
})
</script>

<template>
  <div
    class="kit-result"
    :style="{
      '--tier-color': colorVar,
      '--tier-color-glow': colorVarSoft,
    }"
  >
    <!-- Result card -->
    <div class="result-card">
      <div class="result-id">{{ kitId }}</div>
      <div class="result-meta">
        <span>DIAGNOSTIC TERMINÉ</span> · <span class="timer">CALCUL: 1.2s</span>
      </div>

      <div class="score-block">
        <div class="score-num">{{ score }}<small>/{{ total }}</small></div>
        <div class="score-info">
          <div class="score-label">// STATUT</div>
          <div class="score-tier">{{ tier.label }}</div>
        </div>
      </div>

      <div class="status-line">
        <span class="led" aria-hidden="true"></span>
        <span class="status-label">NIVEAU :</span>
        <span class="status-value">{{ tier.status.toUpperCase() }}</span>
      </div>

      <p class="result-body">{{ tier.body }}</p>

      <div class="result-actions">
        <button
          type="button"
          class="action-secondary"
          data-attr="kit-quiz-restart"
          @click="emit('restart')"
        >↻ Recommencer le test</button>
      </div>
    </div>

    <!-- Newsletter CTA contextualized by tier -->
    <NewsletterForm
      context="kit-result"
      :kit-id="kitId"
      :tier="tier.slug"
      :kicker="newsletterVariant.kicker"
      :h3="newsletterVariant.h3"
      :body="newsletterVariant.body"
    />
  </div>
</template>

<style scoped>
.kit-result {
  display: flex; flex-direction: column; gap: 2.5rem;
}
.result-card {
  position: relative;
  border: 1px solid var(--tier-color);
  background: var(--color-surface);
  padding: 3rem 2.5rem;
  overflow: hidden;
}
.result-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--tier-color);
  box-shadow: 0 0 20px var(--tier-color-glow);
}
.result-id {
  position: absolute;
  top: 1.25rem; right: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--color-muted);
}
.result-meta {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 1rem;
}
.result-meta .timer { color: var(--tier-color); }

.score-block {
  display: flex; align-items: baseline; gap: 1.5rem;
  margin-bottom: 2rem; padding-bottom: 2rem;
  border-bottom: 1px dashed var(--tier-color-glow);
}
.score-num {
  font-family: var(--font-mono);
  font-size: 5rem; font-weight: 600;
  color: var(--tier-color);
  line-height: 1; letter-spacing: -0.02em;
  text-shadow: 0 0 30px var(--tier-color-glow);
}
.score-num small { font-size: 1.5rem; color: var(--color-muted); margin-left: 0.25rem; font-weight: 400; }
.score-info { flex: 1; padding-bottom: 0.5rem; }
.score-label {
  font-family: var(--font-mono);
  font-size: 0.7rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--color-muted);
  margin-bottom: 0.5rem;
}
.score-tier {
  font-family: var(--font-mono);
  font-size: 1.5rem; font-weight: 600;
  letter-spacing: 0.08em; color: var(--tier-color);
  text-transform: uppercase;
  text-shadow: 0 0 12px var(--tier-color-glow);
}

.status-line {
  font-family: var(--font-mono);
  font-size: 0.85rem; letter-spacing: 0.06em;
  margin-bottom: 1.5rem;
  display: flex; align-items: center; gap: 0.6rem;
}
.led {
  display: inline-block; width: 8px; height: 8px;
  background: var(--tier-color);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--tier-color);
  animation: led-pulse 1.5s infinite;
}
@keyframes led-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
.status-label { color: var(--color-muted); }
.status-value { color: var(--tier-color); font-weight: 600; }

.result-body {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.2rem; line-height: 1.65;
  color: var(--color-text);
  margin: 0 0 2rem;
  padding-left: 1.5rem;
  border-left: 2px solid var(--tier-color);
}

.result-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.action-secondary {
  background: transparent;
  border: 1px solid var(--color-hairline-strong);
  color: var(--color-muted);
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.action-secondary:hover { border-color: var(--color-accent); color: var(--color-accent); }

@media (prefers-reduced-motion: reduce) {
  .led { animation: none; }
}

@media (max-width: 640px) {
  .score-block { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .result-card { padding: 1.5rem; }
}
</style>
```

> **Note** : ce composant utilise `<NewsletterForm>` avec des **props nouvelles** (`context`, `kitId`, `tier`, `kicker`, `h3`, `body`) qui n'existent pas encore dans `NewsletterForm.vue`. Vue émet un warning runtime « Extraneous non-props attributes » mais ne casse pas. Task 12 ajoutera ces props proprement.

- [ ] **Step 2: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/outils/trc-01`. Compléter le quiz avec les 5 réponses.
Expected:
- Après l'écran « CALCUL EN COURS » (1.2s), la zone affiche maintenant la carte résultat
- Selon le score, la couleur change : 0-1 = sage menthe, 2-3 = orange mutation, 4-5 = rouge danger
- Score numérique géant, tier name, LED qui pulse, body verdict italic
- Bouton `↻ Recommencer le test` → reset à Q1
- Le `<NewsletterForm>` apparaît sous la carte (avec sa copy par défaut pour l'instant — la variant par tier sera active après Task 12)

Tester les 3 tiers : répondre tout en `[ A ]` (score 0 = lucide), mix (score 3 = dependance), tout en `[ B ]` (score 5 = atrophie).

Stop: Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/components/kits/KitQuizResult.vue
git commit -m "feat(kits): KitQuizResult (carte tier-colorée + score + LED pulse + bouton recommencer)"
```

---

## Task 12 — `NewsletterForm.vue` accepte des props overridable + tracking enrichi

**Files:**
- Modify: `app/components/NewsletterForm.vue`

- [ ] **Step 1: Add new props with defaults that preserve current behavior**

Dans `<script setup>` de `NewsletterForm.vue`, en haut, ajouter (avant les autres `const`) :

```typescript
const props = withDefaults(defineProps<{
  kicker?: string
  h3?: string
  body?: string
  context?: string
  kitId?: string
  tier?: string
}>(), {
  kicker: 'La Fréquence',
  h3: '',
  body: '',
  context: 'standalone',
  kitId: '',
  tier: '',
})

// Default H3 and body keep current behavior if not overridden
const effectiveH3 = computed(() => props.h3 || 'Reste un cran devant. Un nouvel article chaque semaine.')
const effectiveBody = computed(() => props.body || 'Cinq minutes de lecture, sans hype, sans funnel, sans sponsor. Que des outils et signaux que j\'utilise vraiment. Formations approfondies pour ceux qui veulent aller plus loin (bientôt).')
```

- [ ] **Step 2: Replace the hardcoded eyebrow + H2 + lead in the template**

Dans le template, remplacer :

```vue
        <span class="newsletter-eyebrow" data-reveal>La Fréquence</span>
        <h2 id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
          Reste un <em>cran devant</em>.<br>
          <strong>Un nouvel article chaque semaine.</strong>
        </h2>
        <p class="newsletter-lead" data-reveal data-reveal-delay="2">
          Cinq minutes de lecture, sans hype, sans funnel, sans sponsor.
          Que des outils et signaux que j'utilise vraiment. Formations approfondies pour ceux qui veulent aller plus loin (bientôt).
        </p>
```

par :

```vue
        <span class="newsletter-eyebrow" data-reveal>{{ kicker }}</span>
        <h2 id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
          <em>{{ effectiveH3 }}</em>
        </h2>
        <p class="newsletter-lead" data-reveal data-reveal-delay="2">
          {{ effectiveBody }}
        </p>
```

> **Pourquoi `<em>{{ effectiveH3 }}</em>`** : on perd le balisage HTML riche (`<strong>` etc.) du H2 par défaut, mais c'est le compromis pour rendre la copy override simple. Le rendu visuel reste cohérent (italic Playfair sage menthe).

> **Conservation comportement existant** : si aucune prop n'est passée, `effectiveH3` et `effectiveBody` retombent sur les valeurs actuelles, donc les pages existantes (home, footer d'article) continuent à afficher la même copy. Petite différence visuelle : le H2 perd le `<br>` et le `<strong>`, devient italique uniforme. Acceptable car cohérent brand. Si le rendu actuel doit être pixel-identique, on doit conserver l'ancien template par défaut et n'overrider que si props passées — voir alternative ci-dessous.

> **Alternative (préserve à 100% le visuel par défaut)** : utiliser un `v-if` sur les props :
>
> ```vue
> <h2 v-if="props.h3" id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
>   <em>{{ effectiveH3 }}</em>
> </h2>
> <h2 v-else id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
>   Reste un <em>cran devant</em>.<br>
>   <strong>Un nouvel article chaque semaine.</strong>
> </h2>
> ```
>
> **Décision plan** : utiliser l'alternative `v-if` pour garantir aucune régression visuelle sur la home et le footer d'article. C'est plus de markup mais plus sûr.

Donc remplacement final :

```vue
        <span class="newsletter-eyebrow" data-reveal>{{ kicker }}</span>

        <h2 v-if="props.h3" id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
          <em>{{ effectiveH3 }}</em>
        </h2>
        <h2 v-else id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
          Reste un <em>cran devant</em>.<br>
          <strong>Un nouvel article chaque semaine.</strong>
        </h2>

        <p v-if="props.body" class="newsletter-lead" data-reveal data-reveal-delay="2">
          {{ effectiveBody }}
        </p>
        <p v-else class="newsletter-lead" data-reveal data-reveal-delay="2">
          Cinq minutes de lecture, sans hype, sans funnel, sans sponsor.
          Que des outils et signaux que j'utilise vraiment. Formations approfondies pour ceux qui veulent aller plus loin (bientôt).
        </p>
```

- [ ] **Step 3: Enrich PostHog tracking with kit context**

Dans le `<script setup>` de `NewsletterForm.vue`, modifier les fonctions `onEmailFocus` et `submit` pour inclure `context`, `kitId`, `tier` dans les events :

Remplacer `onEmailFocus` :

```typescript
function onEmailFocus() {
  if (focusedOnce.value) return
  focusedOnce.value = true
  capture('newsletter_form_focused', {
    source_page: sourcePage.value,
    context: props.context,
    kit_id: props.kitId || null,
    tier: props.tier || null,
  })
}
```

Et dans `submit`, modifier les 3 `capture` :

```typescript
  capture('newsletter_signup_submitted', {
    source_page: sourcePage.value,
    context: props.context,
    kit_id: props.kitId || null,
    tier: props.tier || null,
  })

  // …

    capture('newsletter_signup_succeeded', {
      source_page: sourcePage.value,
      context: props.context,
      kit_id: props.kitId || null,
      tier: props.tier || null,
    })

  // …

    capture('newsletter_signup_failed', {
      source_page: sourcePage.value,
      context: props.context,
      kit_id: props.kitId || null,
      tier: props.tier || null,
      reason,
      error_message: err?.data?.message ?? err?.message ?? 'unknown',
    })
```

- [ ] **Step 4: Verify in dev server (no regression on existing pages, new behavior on kit result)**

Run: `npm run dev`
Open: `http://localhost:3000/` → scroll vers le footer Newsletter
Expected: copy identique à avant (« Reste un *cran devant*. **Un nouvel article chaque semaine.** » + lead par défaut)

Open: `http://localhost:3000/outils/trc-01` → finir le quiz (5 réponses, ex : tout `[ A ]`)
Expected: sous la carte résultat, le `<NewsletterForm>` affiche maintenant :
- eyebrow `RESTER UN CRAN DEVANT` (variant tier `lucide`)
- H2 italic « Tu pilotes déjà. Reste à la pointe. »
- lead « Chaque semaine, des outils et signaux pour garder une longueur d'avance… »

Refaire avec score 5 (tout `[ B ]`) → tier `atrophie`, eyebrow `RÉÉDUCATION COGNITIVE`, H2 « Le test est sévère. La rééducation commence ici. »

Console (F12) : focus sur l'input email → log `[ph] newsletter_form_focused { source_page: "/outils/trc-01", context: "kit-result", kit_id: "TRC-01", tier: "lucide", … }`

Stop: Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add app/components/NewsletterForm.vue
git commit -m "feat(newsletter): props overridable (kicker/h3/body) + tracking enrichi (kit_id/tier/context)"
```

---

## Task 13 — Animations effet de décryptage : typewriter scramble + compteur de score

**Files:**
- Modify: `app/components/kits/KitQuizResult.vue`

- [ ] **Step 1: Add a scramble composable inline + counter inline**

Dans `<script setup>` de `KitQuizResult.vue`, après les `const` existants, ajouter :

```typescript
// Animated tier name (scramble effect)
const displayedTier = ref('')
const displayedScore = ref(0)
const reducedMotion = computed(() => {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>/?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function scrambleTo(target: string, durationMs: number, onUpdate: (s: string) => void): void {
  if (reducedMotion.value) {
    onUpdate(target)
    return
  }
  const startTime = performance.now()
  const len = target.length
  function frame(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / durationMs)
    // Reveal chars left to right based on progress
    const revealedCount = Math.floor(progress * len)
    let out = ''
    for (let i = 0; i < len; i++) {
      if (i < revealedCount) {
        out += target[i]
      } else if (target[i] === ' ') {
        out += ' '
      } else {
        out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
      }
    }
    onUpdate(out)
    if (progress < 1) requestAnimationFrame(frame)
    else onUpdate(target)
  }
  requestAnimationFrame(frame)
}

function countTo(target: number, durationMs: number, onUpdate: (n: number) => void): void {
  if (reducedMotion.value) {
    onUpdate(target)
    return
  }
  const startTime = performance.now()
  function frame(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / durationMs)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    onUpdate(Math.floor(eased * target))
    if (progress < 1) requestAnimationFrame(frame)
    else onUpdate(target)
  }
  requestAnimationFrame(frame)
}

onMounted(() => {
  if (!import.meta.client) return
  scrambleTo(props.tier.label, 1100, v => { displayedTier.value = v })
  countTo(props.score, 800, v => { displayedScore.value = v })
})
</script>
```

> Attention : retirer le `</script>` final ci-dessus s'il était déjà fermé. Le bloc s'insère **avant** la balise de fermeture du `<script setup>`.

- [ ] **Step 2: Use displayedTier and displayedScore in the template**

Dans le template, remplacer :

```vue
        <div class="score-num">{{ score }}<small>/{{ total }}</small></div>
```

par :

```vue
        <div class="score-num">{{ displayedScore }}<small>/{{ total }}</small></div>
```

Et remplacer :

```vue
          <div class="score-tier">{{ tier.label }}</div>
```

par :

```vue
          <div class="score-tier">{{ displayedTier || ' ' }}</div>
```

> Le `' '` (espace insécable) évite que la zone collapse pendant la première frame (avant que `displayedTier` soit setté).

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/outils/trc-01` → finir le quiz
Expected:
- Après l'écran decrypting, la carte résultat apparaît avec :
  - Le score qui défile rapidement de 0 à la valeur finale (~0.8s)
  - Le tier name qui se révèle de gauche à droite avec des caractères aléatoires qui se résolvent (~1.1s)
- Activer reduced-motion (DevTools → Rendering → Emulate CSS prefers-reduced-motion → reduce) et refaire : les animations sont court-circuitées (affichage direct).

Stop: Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/components/kits/KitQuizResult.vue
git commit -m "feat(kits): animations résultat (scramble tier name + compteur score, respect reduced-motion)"
```

---

## Task 14 — Tracking `kit_viewed` sur la page détail + détection `from`

**Files:**
- Modify: `app/pages/outils/[slug].vue`

- [ ] **Step 1: Add tracking with from detection in `<script setup>`**

Dans `<script setup>` de `app/pages/outils/[slug].vue`, après les `useAsyncData`, ajouter :

```typescript
const { capture } = usePosthogEvent()
const router = useRouter()

onMounted(() => {
  if (!kit.value) return

  const fromQuery = route.query.from
  let from: 'direct' | 'article' | 'list' = 'direct'
  if (fromQuery === 'article' || fromQuery === 'list') from = fromQuery

  capture('kit_viewed', {
    id: kit.value.id,
    kind: kit.value.kind,
    from,
  })

  // Clean the query param from the URL silently (no navigation, no scroll)
  if (fromQuery) {
    router.replace({ path: route.path, query: {} })
  }
})
```

- [ ] **Step 2: Verify in dev server**

Run: `npm run dev`
Open with DevTools console (F12):
1. `http://localhost:3000/outils/trc-01` (direct) → console : `[ph] kit_viewed { id: "TRC-01", kind: "quiz", from: "direct" }`. URL inchangée.
2. `http://localhost:3000/outils` → click sur la carte TRC-01 → URL devient `/outils/trc-01?from=list` puis `/outils/trc-01` (cleanup) → console : `[ph] kit_viewed { …, from: "list" }`
3. `http://localhost:3000/outils/trc-01?from=article` (simulation) → console : `[ph] kit_viewed { …, from: "article" }` + URL nettoyée

Stop: Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/pages/outils/[slug].vue
git commit -m "feat(outils): tracking kit_viewed avec détection from + cleanup query param"
```

---

## Task 15 — SEO de la page détail kit (useSeoMeta + JSON-LD WebApplication + Quiz + Breadcrumb + OG)

**Files:**
- Modify: `app/pages/outils/[slug].vue`

- [ ] **Step 1: Add useSeoMeta + useHead at the top of `<script setup>`**

Dans `<script setup>` de `app/pages/outils/[slug].vue`, après les `useAsyncData` (et avant le tracking onMounted), ajouter :

```typescript
useSeoMeta({
  title: () => kit.value ? `${kit.value.title} (${kit.value.id}) | Survivant-IA` : 'Kit | Survivant-IA',
  description: () => kit.value?.description ?? '',
  ogTitle: () => kit.value ? `${kit.value.title} (${kit.value.id})` : '',
  ogDescription: () => kit.value?.description ?? '',
  twitterCard: 'summary_large_image',
  twitterTitle: () => kit.value?.title ?? '',
  twitterDescription: () => kit.value?.description ?? '',
})

const kitJsonLd = computed(() => {
  if (!kit.value) return ''
  const baseUrl = `https://survivant-ia.ch/outils/${slug}`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebApplication',
      '@id': `${baseUrl}#app`,
      name: `${kit.value.title} (${kit.value.id})`,
      url: baseUrl,
      description: kit.value.description,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'fr-CH',
      isPartOf: { '@id': 'https://survivant-ia.ch/#website' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
        { '@type': 'ListItem', position: 2, name: 'Boîte à Outils', item: 'https://survivant-ia.ch/outils' },
        { '@type': 'ListItem', position: 3, name: kit.value.id },
      ],
    },
  ]

  // Quiz schema (only for kind: quiz)
  if (kit.value.kind === 'quiz' && kit.value.data?.questions) {
    graph.push({
      '@type': 'Quiz',
      '@id': `${baseUrl}#quiz`,
      name: kit.value.title,
      about: kit.value.subtitle,
      educationalLevel: 'Beginner',
      learningResourceType: 'Self-assessment',
      hasPart: kit.value.data.questions.map((q: { id: number; prompt: string; choices: { text: string }[] }) => ({
        '@type': 'Question',
        name: q.prompt,
        suggestedAnswer: q.choices.map((c) => ({ '@type': 'Answer', text: c.text })),
      })),
    })
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
})

useHead({
  script: [{ type: 'application/ld+json', innerHTML: kitJsonLd }],
})

defineOgImage('Default', {
  title: () => kit.value?.title ?? '',
  kicker: () => `// ${kit.value?.kicker ?? ''}`,
})
```

- [ ] **Step 2: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/outils/trc-01` → View page source
Expected:
- `<title>Test de Résilience Cognitive (TRC-01) | Survivant-IA</title>`
- `<meta name="description" content="Test rapide pour évaluer si l'IA est devenue ta béquille cognitive — score immédiat, sans inscription.">`
- `<script type="application/ld+json">…@type":"WebApplication"…@type":"Quiz"…@type":"BreadcrumbList"…</script>`
- `<meta property="og:image" content="…/__og-image__/…trc-01…">`

Stop: Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/pages/outils/[slug].vue
git commit -m "feat(outils): SEO page kit (useSeoMeta + WebApplication/Quiz/Breadcrumb JSON-LD + OG image)"
```

---

## Task 16 — Composant `KitCallout.vue` + insertion conditionnelle dans `pages/rapports/[...slug].vue`

**Files:**
- Create: `app/components/KitCallout.vue`
- Modify: `app/pages/rapports/[...slug].vue`

- [ ] **Step 1: Write the KitCallout component**

Créer `app/components/KitCallout.vue` :

```vue
<!-- app/components/KitCallout.vue -->
<script setup lang="ts">
type KitInfo = {
  id: string
  kind: string
  title: string
  specs: string[]
  path?: string
  calloutPitch?: string
  description?: string
}

const props = defineProps<{
  kit: KitInfo
  fromArticleSlug: string
}>()

const { capture } = usePosthogEvent()

const target = computed(() => `${props.kit.path ?? `/outils/${props.kit.id.toLowerCase()}`}?from=article`)
const pitch = computed(() => props.kit.calloutPitch || props.kit.description || '')

function onClick() {
  capture('kit_cta_clicked_from_article', {
    from_article_slug: props.fromArticleSlug,
    to_kit_id: props.kit.id,
  })
}
</script>

<template>
  <NuxtLink
    :to="target"
    class="kit-callout"
    :data-attr="`kit-callout-${kit.id.toLowerCase()}`"
    @click="onClick"
  >
    <div class="callout-kicker">
      <span class="glyph" aria-hidden="true"></span>
      DU LIRE AU FAIRE
    </div>

    <div class="callout-id-row">
      <span class="callout-id">{{ kit.id }}</span>
      <span class="sep">·</span>
      <span class="callout-kind">{{ kit.kind.toUpperCase() }} INTERACTIF</span>
    </div>

    <h3 class="callout-title">{{ kit.title }}</h3>

    <p class="callout-pitch">{{ pitch }}</p>

    <div class="callout-specs">
      <span v-for="(s, i) in kit.specs" :key="i">{{ s }}</span>
    </div>

    <div class="callout-cta-row">
      <span class="callout-button">▶ MESURER MA RÉSILIENCE</span>
      <span class="callout-side-note">Reste sur le site · Aucune collecte</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.kit-callout {
  display: block;
  position: relative;
  border: 1px solid var(--color-accent-soft);
  background: linear-gradient(135deg, rgba(108, 227, 181, 0.04) 0%, transparent 60%), var(--color-surface);
  padding: 2.5rem 2rem;
  margin: 3rem 0;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease;
  overflow: hidden;
}
.kit-callout::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 80px; height: 3px;
  background: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent-glow);
  transition: width 0.25s ease;
}
.kit-callout:hover { border-color: var(--color-accent); }
.kit-callout:hover::before { width: 140px; }

.callout-kicker {
  display: inline-flex; align-items: center; gap: 0.6em;
  font-family: var(--font-mono);
  font-size: 0.7rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--color-accent);
  margin-bottom: 1.5rem;
}
.callout-kicker .glyph {
  display: inline-block; width: 0.65em; height: 0.65em;
  background: var(--color-accent);
  box-shadow: 0 0 6px rgba(108, 227, 181, 0.55);
  animation: glyph-spin 8s linear infinite;
}
@keyframes glyph-spin { to { transform: rotate(360deg); } }

.callout-id-row {
  display: flex; gap: 0.85rem; align-items: center;
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--color-muted);
  margin-bottom: 0.85rem;
}
.callout-id { color: var(--color-accent); font-weight: 600; }
.sep { color: var(--color-dim); }

.callout-title {
  font-family: var(--font-serif); font-style: italic;
  font-weight: 400;
  font-size: 1.7rem; line-height: 1.25;
  color: var(--color-text);
  margin: 0 0 1rem;
}

.callout-pitch {
  color: var(--color-text-soft);
  font-size: 1rem; line-height: 1.65;
  margin: 0 0 1.5rem;
}

.callout-specs {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-muted-soft);
  margin-bottom: 1.5rem;
  display: flex; gap: 0.85rem; flex-wrap: wrap;
}
.callout-specs span:not(:last-child)::after {
  content: '·'; margin-left: 0.85rem; color: var(--color-dim);
}

.callout-cta-row {
  display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;
}
.callout-button {
  display: inline-block;
  background: var(--color-accent);
  color: var(--color-bg);
  padding: 0.95rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
}
.callout-side-note {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-muted-soft);
}

@media (prefers-reduced-motion: reduce) {
  .callout-kicker .glyph { animation: none; }
  .kit-callout, .kit-callout::before { transition: none; }
}
</style>
```

- [ ] **Step 2: Insert KitCallout conditionally in `pages/rapports/[...slug].vue`**

Modifier `app/pages/rapports/[...slug].vue` :

a) Dans `<script setup>`, après le query article actuel, ajouter une query du kit-lié :

```typescript
const { data: relatedKit } = await useAsyncData(
  `related-kit-${slug}`,
  async () => {
    if (!article.value?.relatedKit) return null
    return await queryCollection('outils')
      .path(`/outils/${article.value.relatedKit}`)
      .first()
  }
)
```

b) Dans le template, dans le `<div class="article-footer">`, **avant** le bloc `<div class="article-cta">…<NewsletterForm /></div>`, insérer :

```vue
        <KitCallout
          v-if="relatedKit"
          :kit="{
            id: relatedKit.id,
            kind: relatedKit.kind,
            title: relatedKit.title,
            specs: relatedKit.specs,
            path: relatedKit.path,
            calloutPitch: relatedKit.calloutPitch,
            description: relatedKit.description,
          }"
          :from-article-slug="slug as string"
        />
```

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/rapports/2026-04-25-bienvenue-survivant` (article existant SANS `relatedKit`)
Expected: l'article s'affiche normalement, le bloc `<KitCallout>` ne s'affiche **pas**, le `<NewsletterForm>` est en bas comme avant. Aucune régression.

(Le test avec un article qui *a* un `relatedKit` se fera en Task 18 quand on créera l'article-parent du TRC-01.)

Stop: Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/components/KitCallout.vue app/pages/rapports/[...slug].vue
git commit -m "feat(article): composant KitCallout + insertion conditionnelle si relatedKit défini"
```

---

## Task 17 — Modification `AppHeader.vue` (ajout entrée nav `Boîte à Outils`)

**Files:**
- Modify: `app/components/AppHeader.vue`

- [ ] **Step 1: Add the new NuxtLink between Rapports and Fréquence**

Dans `app/components/AppHeader.vue`, dans `<nav class="nav">`, **après** la ligne `<NuxtLink to="/rapports" …>Rapports de Survie</NuxtLink>` et **avant** `<NuxtLink to="/frequence" …>La Fréquence</NuxtLink>`, insérer :

```vue
        <NuxtLink to="/outils" class="nav-link" data-attr="header-nav-outils">Boîte à Outils</NuxtLink>
```

- [ ] **Step 2: Verify in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/rapports` (ou n'importe quelle page hors home)
Expected:
- Nav header affiche : `Rapports de Survie · Boîte à Outils · La Fréquence · Identité`
- Click sur `Boîte à Outils` → navigue vers `/outils`, le lien devient sage menthe (état actif via `router-link-active`)

Mobile (DevTools responsive < 640px) :
- Nav passe en wrap, les 4 entrées sont visibles, sans débordement

Stop: Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/components/AppHeader.vue
git commit -m "feat(header): ajouter lien Boîte à Outils entre Rapports et Fréquence"
```

---

## Task 18 — Article-parent du TRC-01 : `content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md`

**Files:**
- Create: `content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md`

> **Note pour l'engineer / Mathieu** : ce contenu est un **draft à valider et retoucher éditorialement** par Mathieu. Le ton, les exemples, et la signature doivent passer la relecture brand. L'objectif technique de cette tâche est d'avoir un article-parent qui : (1) existe (le TRC-01 ne peut pas livrer sans), (2) contient `relatedKit: trc-01` dans son frontmatter, (3) fait au minimum ~600 mots pour le SEO. Mathieu pourra réécrire le corps après merge.

- [ ] **Step 1: Write the file**

Créer `content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md` :

```markdown
---
title: "L'offloading cognitif : quand l'IA pense à ta place"
description: "Le mécanisme cognitif derrière la dépendance à l'IA : pourquoi ton cerveau délègue, ce qu'il y perd, et comment reprendre le pilote sans renoncer aux outils."
date: 2026-05-08
category: comprendre-ia
relatedKit: trc-01
---

Tu fermes l'application. Tu te dis que tu as bien travaillé. Tu as livré trois rapports, écrit deux mails délicats, refait une présentation. Sauf que, si on te demandait demain comment tu as résolu tel point, tu serais incapable de retracer le raisonnement. C'est l'IA qui l'a fait. Tu as validé.

Bienvenue dans l'**offloading cognitif** : le transfert d'une tâche mentale vers un outil externe. C'est un mécanisme vieux comme l'humanité — on délègue à l'agenda, à la calculatrice, à la liste de courses. Mais avec l'IA générative, l'échelle change. Et avec elle, le risque pour ton cerveau, ton expertise, et ta valeur professionnelle.

## Ce que la recherche dit (et ne dit pas)

Le terme « offloading cognitif » a été popularisé par les chercheurs Evan Risko et Sam Gilbert dans un article de référence publié en 2016 dans *Trends in Cognitive Sciences*. Leur thèse : le cerveau humain est un optimiseur d'effort. Dès qu'un outil externe peut prendre en charge une tâche fastidieuse, on lui délègue — pas par paresse, par économie cognitive.

Ce mécanisme est neutre en soi. Écrire une liste de courses, c'est de l'offloading. Utiliser un GPS plutôt que mémoriser un itinéraire, c'est de l'offloading. Le problème n'est pas la délégation. Le problème est l'**atrophie** : quand on délègue trop souvent, le muscle cognitif s'affaiblit. C'est ce que des études récentes sur l'over-reliance face aux modèles génératifs (Bhatti et al., 2024) commencent à documenter dans le contexte du travail intellectuel.

Les chiffres ne sont pas encore stabilisés. Mais les premiers signaux convergent : les utilisateurs intensifs d'IA générative montrent une baisse mesurable de leur capacité à résoudre des problèmes similaires *sans* l'aide de l'outil. Pas définitive, pas dramatique. Réelle.

## Pourquoi ça te concerne, en tant que salarié

Ton métier ne disparaîtra pas demain à cause de l'IA. Mais ta **valeur ajoutée** dans ton équipe, elle, se joue maintenant. Et elle se joue précisément sur ce que l'IA ne fait pas bien : interpréter un contexte ambigu, prendre une décision sous incertitude, remettre en question un livrable propre-en-apparence-mais-faux-au-fond.

Ces compétences ne se développent pas en validant en diagonale. Elles se développent en faisant l'effort de comprendre — même quand l'IA t'a déjà donné la réponse. C'est un effort qu'on choisit, pas qu'on subit. Et c'est cet effort qui te rend irremplaçable, parce que c'est lui qui te permet de juger si la réponse de l'IA est bonne, qui te permet de la défendre devant un client, qui te permet de la retoquer quand elle te paraît off.

Le moment où tu cesses de faire cet effort est le moment où tu deviens interchangeable avec n'importe qui d'autre qui sait ouvrir le même outil que toi. Et ce nombre-là est en train d'exploser.

## Les trois symptômes à surveiller

Trois signes te disent que l'offloading bascule vers la dépendance :

1. **Tu ne sais plus structurer un problème sans IA.** Devant une feuille blanche, ta première pensée est « j'ouvre Claude / GPT pour qu'il me donne un plan ». Tu ne te poses plus la question des angles, du périmètre, des hypothèses. Tu attends qu'on te les serve.

2. **Tu valides ce que l'IA produit sans esprit critique.** Tu lis en diagonale, c'est bien écrit, ça paraît cohérent, tu copies-colles. Tu n'as plus le réflexe de vérifier les chiffres, de remettre en cause une conclusion, de chercher une faille.

3. **Tu n'apprends plus de ce que tu produis.** Tu fais une tâche, tu livres, tu passes à la suivante. Trois mois plus tard, tu dois refaire la même chose, et tu repars de zéro. Aucune capitalisation. L'IA fait le travail, tu valides, tu oublies.

Ces symptômes sont insidieux parce qu'ils s'installent **sans que la productivité baisse**. Au contraire, tu produis plus vite que jamais. Mais ce que tu construis n'a plus de profondeur. Et le jour où l'IA s'arrête, ou bug, ou hallucine de manière plausible, tu n'as plus les armes pour t'en rendre compte.

## Mesure ta posture en 2 minutes

Avant de t'expliquer comment reprendre le pilote, prends deux minutes pour te situer. Le **Test de Résilience Cognitive (TRC-01)** ci-dessous te pose cinq questions courtes sur ton rapport quotidien à l'IA. Le résultat te donne un palier — *Survivant Lucide*, *Dépendance en cours*, ou *Atrophie critique* — et un constat éditorial qui t'oriente.

Aucune donnée n'est stockée. Aucune réponse n'est jugée. C'est un signal pour toi, pas un verdict.

## Reprendre le pilote, sans casser l'outil

Reprendre le pilote ne veut pas dire fermer Claude ou ChatGPT. Cela veut dire **retrouver l'effort là où il a disparu** : esquisser avant de prompter, lire avant de valider, comprendre l'erreur avant de la déléguer. Ces gestes-là sont le contraire d'un retour en arrière. Ils sont la condition pour que l'IA reste un copilote — et non un substitut.

C'est le travail de La Fréquence, semaine après semaine : t'envoyer des outils et des signaux concrets pour rester celui qui pilote, plutôt que celui qui délègue.
```

- [ ] **Step 2: Verify in dev server (the article + the kit page now both link to each other)**

Run: `npm run dev`

Open: `http://localhost:3000/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place`
Expected:
- L'article s'affiche
- En footer (avant le NewsletterForm), le `<KitCallout>` apparaît avec : kicker `DU LIRE AU FAIRE`, ID `TRC-01 · QUIZ INTERACTIF`, titre Playfair italic, pitch, specs, bouton sage `▶ MESURER MA RÉSILIENCE`
- Click sur le bouton → navigation vers `/outils/trc-01?from=article` puis `/outils/trc-01` (cleanup)

Open: `http://localhost:3000/outils/trc-01`
Expected:
- Le bandeau article-parent apparaît maintenant en haut (`▶ À LIRE D'ABORD : L'offloading cognitif : quand l'IA pense à ta place`), cliquable
- En bas, la carte retour article-parent apparaît avec le titre + description de l'article

Console (F12) sur clic du callout : `[ph] kit_cta_clicked_from_article { from_article_slug: "offloading-cognitif-quand-l-ia-pense-a-ta-place", to_kit_id: "TRC-01" }`

Stop: Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md
git commit -m "content(rapports): article-parent du TRC-01 (offloading cognitif, draft à relire)"
```

---

## Task 19 — Build production + smoke test final

**Files:** none (validation only)

- [ ] **Step 1: Run typecheck (if available) and build**

```bash
npm run build
```

Expected: build successful, no error. Surveiller les warnings TypeScript (en particulier sur les types `any` du frontmatter).

> Si une erreur de type apparaît sur `kit.value.data.questions` (TypeScript ne sait pas inférer le type), c'est lié au `z.any()` du schéma. Acceptable en V1 — sinon on raffinera le schéma zod en phase 2.

- [ ] **Step 2: Run preview server and smoke test**

```bash
npm run preview
```

Open: `http://localhost:3000` puis valider chaque critère du spec (section 12) :

- [ ] La nav header affiche `Boîte à Outils` entre `Rapports de Survie` et `La Fréquence`
- [ ] L'URL `/outils` retourne la page liste avec au moins le kit TRC-01 visible
- [ ] L'URL `/outils/trc-01` retourne la page détail du TRC-01 avec le quiz fonctionnel
- [ ] Le quiz TRC-01 affiche une question à la fois, avec transition fluide
- [ ] Le bouton précédent permet de revenir et changer une réponse
- [ ] L'écran résultat affiche le bon tier (couleur, label, body) selon le score 0-5 (tester score 0, 3, 5)
- [ ] L'effet de décryptage est présent (typewriter sur tier name + compteur de score)
- [ ] Le CTA newsletter sur l'écran résultat varie selon le tier (3 variants livrés)
- [ ] Le bouton `↻ Recommencer` reset le quiz à Q1
- [ ] La page liste affiche 1 placeholder « PROCHAINEMENT » + le bottom-note
- [ ] L'article-parent `offloading-cognitif-…` existe et linke vers le TRC-01 via `<KitCallout>`
- [ ] Le `<KitCallout>` ne s'affiche **pas** sur les articles sans `relatedKit` (tester sur `bienvenue-survivant`)
- [ ] Le mot `diagnostic` n'apparaît pas dans les copies des kits — vérifier via grep :
  ```bash
  grep -i "diagnostic" content/outils/*.md app/pages/outils/*.vue app/components/Kit*.vue app/components/kits/*.vue
  ```
  Expected: aucun résultat (sauf éventuellement dans des commentaires développeur, qui sont OK).
- [ ] L'id `TRC-01` apparaît partout (kicker, breadcrumb, card, callout) — pas de DRC-01 résiduel :
  ```bash
  grep -r "DRC-01" content/ app/
  ```
  Expected: aucun résultat.
- [ ] Les 6 events PostHog obligatoires sont émis (vérifier via console dev pendant smoke test : `kit_viewed`, `kit_quiz_started`, `kit_quiz_completed`, `kit_quiz_restarted`, `kit_cta_clicked_from_article`, `kit_list_card_clicked`)
- [ ] Le `<NewsletterForm>` placé sur l'écran résultat envoie `kit_id` + `tier` dans `newsletter_form_focused` / `newsletter_signup_*`
- [ ] JSON-LD `CollectionPage` injecté sur `/outils`, `WebApplication` + `Quiz` injectés sur `/outils/trc-01` (View Source)
- [ ] OG images générées pour `/outils` et `/outils/trc-01` (View Source → `<meta property="og:image">`)
- [ ] La page TRC-01 contient au moins 400-600 mots de copy SEO autour du composant quiz (intro + outro)
- [ ] `prefers-reduced-motion` désactive les animations (DevTools → Rendering → Emulate prefers-reduced-motion → reduce, refaire le quiz)
- [ ] Aucune régression visuelle sur les pages existantes : home, /scanner, /rapports, /rapports/2026-04-25-bienvenue-survivant, /frequence, /identite, /confidentialite

Stop: Ctrl+C.

- [ ] **Step 3: Final commit (if any local fix during smoke test)**

Si des ajustements ont été nécessaires pendant le smoke test, les commiter avec :

```bash
git add -A
git commit -m "fix(boite-a-outils): ajustements smoke test final"
```

Sinon, ne pas créer de commit vide — passer à l'étape suivante.

- [ ] **Step 4: Push and open PR**

```bash
git push -u origin claude/beautiful-shaw-fb8a80
```

Puis créer la PR via `gh pr create` ou interface GitHub. Titre suggéré : `feat: La Boîte à Outils + premier kit TRC-01 (Test de Résilience Cognitive)`. Description : pointer le spec et le plan, lister les fichiers créés/modifiés, mentionner que l'article-parent est un draft à relire éditorialement.

---

## Self-Review

**1. Spec coverage** — checklist contre les sections du spec :

- ✅ Section 3 (décisions structurantes) : wording, URL, nav, couplage 1-1, stockage, convention id — tout couvert (Task 1, 2, 17)
- ✅ Section 4.1 (modèle de données) : frontmatter complet (Task 2), collection zod (Task 1), `relatedKit` (Task 1)
- ✅ Section 4.2 (routing) : `/outils` (Task 3), `/outils/[slug]` (Task 6)
- ✅ Section 4.3 (composants) : tous créés/modifiés (Tasks 4, 6, 8-12, 16, 17)
- ✅ Section 4.4 (config Nuxt Content) : Task 1
- ✅ Section 5.1 (page liste) : Task 3, 4, 5
- ✅ Section 5.2 (page détail frame) : Task 6, 7, 9, 14, 15
- ✅ Section 5.3 (KitCard) : Task 4
- ✅ Section 5.4 (KitCallout) : Task 16
- ✅ Section 6.1 (5 questions TRC-01) : Task 2 (frontmatter)
- ✅ Section 6.2 (3 paliers) : Task 2 + Task 11 (rendu)
- ✅ Section 6.3 (3 CTA newsletter) : Task 2 + Task 11 + Task 12
- ✅ Section 6.4 (mécanique quiz) : Task 9 (state machine, advance, back, progress)
- ✅ Section 6.5 (écran résultat + animations) : Task 11 + Task 13
- ✅ Section 7 (conventions éditoriales) : appliquées dans toutes les copies des Tasks 2, 3, 4, 5, 16, 18 ; vérifiées en Task 19
- ✅ Section 8 (tracking PostHog) : Task 5 (page liste), Task 10 (quiz), Task 12 (newsletter enrichi), Task 14 (kit_viewed), Task 16 (callout)
- ✅ Section 9 (SEO) : Task 5 (liste), Task 15 (détail), incluant JSON-LD, OG, sitemap (auto via @nuxtjs/sitemap)
- ✅ Section 11 (article-parent prérequis) : Task 18
- ✅ Section 12 (critères de validation) : Task 19 (smoke test checklist)

**2. Placeholder scan** — pas de TBD, TODO, "implement later", "add appropriate", "similar to Task N", "fill in details" trouvés. ✅

**3. Type consistency** :
- `Tier`, `Choice`, `Question`, `QuizData`, `NewsletterVariant`, `NewsletterVariants`, `KitInfo`, `KitProp` — types définis dans les composants où ils sont utilisés. Cohérence : `Tier.color` est string mappé par `KitQuizResult` vers une CSS variable. `Tier.range` est `[number, number]` partout.
- `score` (number), `tier` (Tier), `slug` (string), `kitId` (string) — cohérents entre `KitQuiz` (calcul) et `KitQuizResult` (consommation).
- `from` enum `'direct' | 'article' | 'list'` cohérent entre `KitCard` (injecte `?from=list`), `KitCallout` (injecte `?from=article`), et `pages/outils/[slug].vue` (lit le query, fallback `direct`).
- `<NewsletterForm>` props `kicker / h3 / body / context / kitId / tier` cohérentes entre déclaration (Task 12) et consommation (Task 11).

**4. Spec ambiguity check** :
- `setTimeout(1200ms)` pour la transition `decrypting → result` : aligné avec la durée de l'animation de barre (1.2s). ✅
- Animation scramble durée 1.1s, animation compteur 0.8s : se passent **pendant** la phase `result`, pas pendant `decrypting`. C'est cohérent avec le spec ("effet de décryptage Q5 → résultat" puis "compteur qui défile vite suivi d'une mini-pulse").
- Article-parent : si Mathieu réécrit le contenu du `.md` après merge, le `relatedKit: trc-01` doit être préservé (signal documenté dans Task 18). ✅

Aucune correction inline nécessaire. Plan complet et prêt à exécuter.
