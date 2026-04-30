# PostHog Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher PostHog Cloud EU en mode anonyme/cookieless sur survivant-ia.ch, instrumenter 15 événements custom + autocapture, mettre à jour la politique de confidentialité, créer un dashboard hebdo de pilotage.

**Architecture:** Plugin Nuxt client-only initialise `posthog-js` après mount, avec `persistence: 'memory'` (zéro cookie). Reverse proxy via Nitro (`/_ph/*`) bypasse les ad-blockers. Composable `usePosthogEvent()` centralise le firing pour éviter les erreurs SSR. Catalogue jobs.ts curé fournit des slugs canoniques pour les events scanner. Vérification manuelle via DevTools + PostHog event explorer (pas de framework de tests installé sur le projet — c'est intentionnel ici, voir Note Vérification ci-dessous).

**Tech Stack:** Nuxt 4 · Vue 3 · TypeScript · `posthog-js` (à installer) · @nuxt/content · PostHog Cloud EU (Frankfurt)

**Spec source:** [`docs/superpowers/specs/2026-04-30-posthog-integration-design.md`](../specs/2026-04-30-posthog-integration-design.md)

**Note Vérification (au lieu de TDD strict):** Le projet n'a pas de framework de tests (pas de Vitest, pas de script `test` dans package.json). Installer Vitest **uniquement** pour tester du wiring d'analytics serait du YAGNI. À la place, **chaque task expose une vérification manuelle concrète** : observer la requête réseau vers `/_ph/e/` dans le Network tab des DevTools, et confirmer la présence de l'événement dans le **PostHog Activity feed** (`https://eu.posthog.com/project/<id>/activity/explore`). C'est le standard pour ce type d'intégration et plus fiable que des mocks.

---

## File Structure

| Fichier | Action | Responsabilité |
|---|---|---|
| `app/plugins/posthog.client.ts` | **Create** | Init `posthog-js`, hook router pour `$pageview`, gestion DNT/optout |
| `app/composables/usePosthogEvent.ts` | **Create** | Wrapper type-safe pour `posthog.capture()`, no-op si SSR ou plugin absent |
| `nuxt.config.ts` | **Modify** | `runtimeConfig.public.posthogKey` + `routeRules` reverse proxy |
| `.env.example` | **Modify** | Ajouter `NUXT_PUBLIC_POSTHOG_KEY` |
| `package.json` | **Modify** | Ajout dep `posthog-js` |
| `app/pages/scanner.vue` | **Modify** | 6 events scanner |
| `app/components/NewsletterForm.vue` | **Modify** | 4 events newsletter |
| `app/pages/rapports/[...slug].vue` | **Modify** | `report_read_progress`, `article_internal_link_clicked`, `article_source_clicked` |
| `app/pages/rapports/index.vue` | **Modify** | `report_card_clicked` (avec position) |
| `app/components/ArticleCard.vue` | **Modify** | Émettre un event `click` pour tracking parent |
| `app/pages/index.vue` | **Modify** | `home_cta_clicked` (3 CTAs) + data-attr |
| `app/components/AppHeader.vue` | **Modify** | data-attr sur items de nav |
| `app/components/AppFooter.vue` | **Modify** | data-attr sur liens sociaux |
| `app/pages/confidentialite.vue` | **Modify** | Section "Mesure d'audience anonyme" |

---

## Task 0: Pre-flight (manuel — utilisateur)

**Files:** aucun (actions hors-code)

**Pourquoi:** Impossible de tester ou de déployer sans clé API PostHog.

- [ ] **Step 1 : Créer le compte PostHog Cloud EU**

Aller sur `https://eu.posthog.com/signup`. **Bien choisir EU**, pas US. Créer un projet nommé `survivant-ia`.

- [ ] **Step 2 : Récupérer la clé API publique**

Dans la UI PostHog : Project Settings → Project API Key. Format `phc_xxxxxxxxxxxxxxxx`.

- [ ] **Step 3 : Configurer la rétention et l'anonymisation IP**

Dans la UI PostHog :
- Project Settings → **Data Retention** : passer à **13 mois**
- Project Settings → **Anonymize IPs** : **enabled** (toggle ON)

- [ ] **Step 4 : Créer/éditer le fichier `.env` local**

Dans `/Users/mathieu/Documents/survivor/.env` (à la racine, non commité — `.gitignore` doit déjà l'exclure) :

```
NUXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxx
```

(coller la vraie clé)

- [ ] **Step 5 : Vérifier le `.gitignore`**

```bash
grep -E "^\.env$|^\.env\." /Users/mathieu/Documents/survivor/.gitignore
```

Expected output : au moins `.env` listé. Sinon, ajouter manuellement `.env` au `.gitignore`.

---

## Task 1: Installer `posthog-js`

**Files:**
- Modify: `package.json`

- [ ] **Step 1 : Installer la dépendance**

```bash
cd /Users/mathieu/Documents/survivor && npm install posthog-js
```

Expected : `posthog-js` ajouté à `dependencies` dans package.json (version ≥ 1.180).

- [ ] **Step 2 : Vérifier l'install**

```bash
node -e "console.log(require('./package.json').dependencies['posthog-js'])"
```

Expected : une string de version, ex `"^1.190.0"`.

- [ ] **Step 3 : Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add posthog-js for analytics"
```

---

## Task 2: Configurer runtimeConfig + reverse proxy

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `.env.example`

- [ ] **Step 1 : Ajouter la clé publique dans `runtimeConfig`**

Dans `nuxt.config.ts`, remplacer le bloc `runtimeConfig` existant par :

```ts
  runtimeConfig: {
    brevoApiKey: '',
    brevoListId: '',
    public: {
      posthogKey: '',
    },
  },
```

- [ ] **Step 2 : Ajouter les routes du reverse proxy**

Dans `nuxt.config.ts`, à l'intérieur du bloc `routeRules` existant (juste avant `'/confidentialite'`), ajouter :

```ts
    '/_ph/static/**': { proxy: 'https://eu-assets.i.posthog.com/static/**' },
    '/_ph/**':        { proxy: 'https://eu.i.posthog.com/**' },
```

- [ ] **Step 3 : Documenter dans `.env.example`**

Lire d'abord :

```bash
cat /Users/mathieu/Documents/survivor/.env.example
```

Puis ajouter à la fin du fichier (en gardant ce qui existe déjà) :

```
# PostHog Cloud EU — clé publique du projet (commence par phc_)
NUXT_PUBLIC_POSTHOG_KEY=
```

- [ ] **Step 4 : Lancer le dev server pour valider que la config compile**

```bash
cd /Users/mathieu/Documents/survivor && timeout 25 npm run dev 2>&1 | head -40
```

Expected : pas d'erreur TS/Nitro, message `Vite client warmed up` ou équivalent. Si `EADDRINUSE` (port déjà pris), c'est OK — la config a quand même été parsée par Nuxt avant.

- [ ] **Step 5 : Commit**

```bash
git add nuxt.config.ts .env.example
git commit -m "feat(posthog): wire runtimeConfig and reverse proxy"
```

---

## Task 3: Créer le plugin PostHog

**Files:**
- Create: `app/plugins/posthog.client.ts`

- [ ] **Step 1 : Écrire le plugin**

Créer `app/plugins/posthog.client.ts` avec exactement ce contenu :

```ts
// app/plugins/posthog.client.ts
// Initialise posthog-js en mode anonyme (cookieless).
// Voir docs/superpowers/specs/2026-04-30-posthog-integration-design.md §3.

import posthog from 'posthog-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const key = config.public.posthogKey as string

  if (!key) {
    // Pas de clé en local sans .env → on ne charge rien plutôt que de crasher.
    if (import.meta.dev) console.warn('[posthog] NUXT_PUBLIC_POSTHOG_KEY missing, analytics disabled')
    return { provide: { posthog: null as null | typeof posthog } }
  }

  posthog.init(key, {
    api_host: '/_ph',
    ui_host: 'https://eu.posthog.com',
    persistence: 'memory',
    disable_persistence: true,
    disable_session_recording: true,
    enable_recording_console_log: false,
    capture_pageview: false,           // on le fait manuellement via le router
    capture_pageleave: true,
    autocapture: true,
    capture_performance: true,
    respect_dnt: true,
    loaded: (ph) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage?.getItem('ph_optout') === '1') {
          ph.opt_out_capturing()
        }
      } catch { /* localStorage may be blocked, ignore */ }
    },
  })

  // Pageview manuel sur chaque navigation, après que le DOM soit settled.
  const router = nuxtApp.$router as { afterEach: (cb: (to: { fullPath: string }) => void) => void }
  router.afterEach((to) => {
    posthog.capture('$pageview', { $current_url: window.location.origin + to.fullPath })
  })

  return {
    provide: {
      posthog,
    },
  }
})
```

- [ ] **Step 2 : Vérifier que TS ne râle pas**

```bash
cd /Users/mathieu/Documents/survivor && npx nuxt prepare && npx tsc --noEmit -p tsconfig.json 2>&1 | head -30
```

Expected : 0 erreur. (Si erreur sur `useRuntimeConfig` → c'est un faux positif Nuxt auto-import au premier run, relancer `npx nuxt prepare`.)

- [ ] **Step 3 : Smoke test dans le navigateur**

```bash
cd /Users/mathieu/Documents/survivor && npm run dev
```

Puis ouvrir `http://localhost:3000` dans Chrome avec DevTools → Network tab → filtre `/_ph/`.

**Vérifier visuellement** :
- ✅ Une requête `POST /_ph/e/?...` part au chargement de la page (c'est le `$pageview`)
- ✅ Status 200
- ✅ Aucun cookie `ph_*` dans Application → Cookies (mode memory respecté)
- ✅ Cliquer sur "Scanner" depuis la home → un nouveau `$pageview` part

Si tout passe : kill le dev server (Ctrl-C).

- [ ] **Step 4 : Vérifier dans PostHog**

Aller sur `https://eu.posthog.com/project/<id>/activity/explore`. Filtrer sur `event = $pageview`. Tu dois voir tes 2 events des 30 dernières secondes.

- [ ] **Step 5 : Commit**

```bash
git add app/plugins/posthog.client.ts
git commit -m "feat(posthog): client plugin with anonymous mode and manual pageview"
```

---

## Task 4: Composable `usePosthogEvent`

**Files:**
- Create: `app/composables/usePosthogEvent.ts`

**Pourquoi:** Centraliser le firing des events évite de répéter `useNuxtApp().$posthog?.capture(...)` partout, gère le cas SSR/plugin absent, et donne un point unique pour ajouter du logging dev.

- [ ] **Step 1 : Écrire le composable**

Créer `app/composables/usePosthogEvent.ts` avec exactement :

```ts
// app/composables/usePosthogEvent.ts
// Wrapper centralisé pour capturer un event PostHog.
// No-op silencieux si on est en SSR ou si le plugin n'a pas pu charger (clé manquante, DNT…).

export function usePosthogEvent() {
  const { $posthog } = useNuxtApp()

  function capture(eventName: string, props: Record<string, unknown> = {}) {
    if (!import.meta.client) return
    if (!$posthog) return
    try {
      $posthog.capture(eventName, props)
      if (import.meta.dev) console.log('[ph]', eventName, props)
    } catch (err) {
      if (import.meta.dev) console.warn('[ph] capture failed', err)
    }
  }

  return { capture }
}
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
cd /Users/mathieu/Documents/survivor && npx nuxt prepare && npx tsc --noEmit 2>&1 | grep -i "usePosthogEvent\|posthog" | head
```

Expected : pas d'erreur sur ce fichier.

- [ ] **Step 3 : Commit**

```bash
git add app/composables/usePosthogEvent.ts
git commit -m "feat(posthog): add usePosthogEvent composable"
```

---

## Task 5: Events Scanner (6 events)

**Files:**
- Modify: `app/pages/scanner.vue`

**Référence spec:** §4.2 de `2026-04-30-posthog-integration-design.md`

- [ ] **Step 1 : Importer le composable et exposer un helper**

Dans `app/pages/scanner.vue`, juste après `import { findJobBySlug, searchJobs, type Job } from '~/data/jobs'` (autour de la ligne 3), **ajouter** :

```ts
const { capture } = usePosthogEvent()

function jobProps(job: Job, source: 'suggestion' | 'url_param') {
  return {
    job_slug: job.slug,
    job_label: job.label,
    job_status: job.status,
    job_risk: job.risk,
    job_horizon: job.horizon,
    source,
  }
}
```

(Le composable est auto-importé par Nuxt, pas besoin de `import`.)

- [ ] **Step 2 : `scanner_job_selected` via suggestion**

Dans la fonction `selectJob(job: Job)` (ligne ~74), **avant** `startScan(job)`, ajouter :

```ts
  capture('scanner_job_selected', jobProps(job, 'suggestion'))
```

Résultat attendu, la fonction devient :

```ts
function selectJob(job: Job) {
  query.value       = job.label
  suggestions.value = []
  selectedJob.value = job
  capture('scanner_job_selected', jobProps(job, 'suggestion'))
  startScan(job)
}
```

- [ ] **Step 3 : `scanner_job_selected` via URL param**

Dans le `onMounted()` (ligne ~82), **après** `setDynamicMeta(job)` à l'intérieur du `if (job)`, ajouter :

```ts
      capture('scanner_job_selected', jobProps(job, 'url_param'))
      capture('scanner_scan_completed', jobProps(job, 'url_param'))
```

(L'arrivée par URL court-circuite la phase de scan, donc on émet immédiatement les deux events.)

- [ ] **Step 4 : `scanner_scan_completed` après animation**

Dans `startScan(job)`, à l'intérieur du `setTimeout` final qui passe à `phase.value = 'result'` (ligne ~174), **après** `setDynamicMeta(job)`, ajouter :

```ts
            capture('scanner_scan_completed', jobProps(job, 'suggestion'))
```

- [ ] **Step 5 : `scanner_cta_clicked`**

Le CTA actuel est un `<GlitchButton :label="ctaButton" to="/#newsletter" />` (ligne ~385). On a besoin d'un click handler. **Wrapper** le bouton dans un `<span @click="onCtaClick">` ou ajouter `@click` directement si `GlitchButton` propage l'event.

D'abord vérifier :

```bash
grep -n "@click\|emit\|defineEmits" /Users/mathieu/Documents/survivor/app/components/GlitchButton.vue
```

Si `GlitchButton` ne propage pas `click`, on wrappe. Modifier la ligne 385 pour devenir :

```vue
            <GlitchButton :label="ctaButton" to="/#newsletter" @click="onCtaClick" />
```

Et **ajouter** la fonction dans le `<script setup>` (juste après `function copyLink()`, autour de la ligne 241) :

```ts
function onCtaClick() {
  if (!selectedJob.value) return
  capture('scanner_cta_clicked', {
    job_slug:   selectedJob.value.slug,
    job_status: selectedJob.value.status,
    cta_label:  ctaButton.value,
  })
}
```

**Si `GlitchButton` ne propage pas le clic** (vérifier au step précédent), wrapper plutôt :

```vue
            <span @click="onCtaClick">
              <GlitchButton :label="ctaButton" to="/#newsletter" />
            </span>
```

- [ ] **Step 6 : `scanner_reset`**

Dans la fonction `reset()` (ligne ~244), **au tout début** :

```ts
function reset() {
  if (selectedJob.value) {
    capture('scanner_reset', { previous_job_slug: selectedJob.value.slug })
  }
  scanTimers.forEach(id => clearTimeout(id))
  // ... reste inchangé
```

- [ ] **Step 7 : `scanner_search_no_results`**

Modifier le `watch(query, ...)` (ligne ~70) pour ajouter un debounce et le firing. Remplacer :

```ts
watch(query, (val) => {
  suggestions.value = searchJobs(val)
})
```

par :

```ts
let noResultsTimer: ReturnType<typeof setTimeout> | null = null
watch(query, (val) => {
  suggestions.value = searchJobs(val)
  if (noResultsTimer) clearTimeout(noResultsTimer)
  if (val.length >= 3 && suggestions.value.length === 0) {
    noResultsTimer = setTimeout(() => {
      capture('scanner_search_no_results', { query: val.trim() })
    }, 600)
  }
})
```

Et **ajouter** au `onBeforeUnmount` (ligne ~97) :

```ts
  if (noResultsTimer) clearTimeout(noResultsTimer)
```

- [ ] **Step 8 : `scanner_result_shared`**

Dans la fonction `copyLink()` (ligne ~236), **au tout début** :

```ts
function copyLink() {
  if (selectedJob.value) {
    capture('scanner_result_shared', {
      job_slug:   selectedJob.value.slug,
      job_status: selectedJob.value.status,
      risk:       selectedJob.value.risk,
    })
  }
  navigator.clipboard.writeText(window.location.href).catch(() => {})
  // ... reste inchangé
```

- [ ] **Step 9 : Vérification manuelle (parcours complet)**

```bash
cd /Users/mathieu/Documents/survivor && npm run dev
```

Dans le navigateur, ouvrir DevTools → Console (laisser actif pour voir les `[ph]` logs du composable).

Tester :
1. Aller sur `/scanner`, taper "comp" → cliquer sur "Comptable" dans la liste → console doit afficher `[ph] scanner_job_selected {... source: 'suggestion'}` puis `[ph] scanner_scan_completed`
2. Cliquer le CTA "Rejoindre / S'inscrire" → `[ph] scanner_cta_clicked`
3. Cliquer "Partager mon résultat" → `[ph] scanner_result_shared`
4. Cliquer "Nouveau scan →" → `[ph] scanner_reset {previous_job_slug: 'comptable'}`
5. Taper "xyzqwerty" (pas de résultat), attendre 1s → `[ph] scanner_search_no_results {query: 'xyzqwerty'}`
6. Recharger directement avec `?job=teleconseiller` → `[ph] scanner_job_selected {... source: 'url_param'}` + `scanner_scan_completed`

Tous doivent apparaître dans le PostHog Activity feed dans les 30 secondes.

- [ ] **Step 10 : Commit**

```bash
git add app/pages/scanner.vue
git commit -m "feat(posthog): instrument scanner with 6 custom events"
```

---

## Task 6: Events Newsletter (4 events)

**Files:**
- Modify: `app/components/NewsletterForm.vue`

**Référence spec:** §4.3

- [ ] **Step 1 : Ajouter le composable + helper `source_page`**

Dans `<script setup>` de `NewsletterForm.vue` (juste après `const props = defineProps<{ formUrl?: string }>()` ligne ~74), **ajouter** :

```ts
const { capture } = usePosthogEvent()
const route = useRoute()
const sourcePage = computed(() => route.path)
const focusedOnce = ref(false)

function onEmailFocus() {
  if (focusedOnce.value) return
  focusedOnce.value = true
  capture('newsletter_form_focused', { source_page: sourcePage.value })
}
```

- [ ] **Step 2 : Brancher `newsletter_form_focused` sur le champ email**

Dans le template (ligne ~29), modifier le 2e `<input>` (email) pour ajouter `@focus="onEmailFocus"` :

```vue
              <input
                v-model="email"
                type="email"
                placeholder="votre@email.com"
                class="email-input"
                aria-label="Adresse email"
                :disabled="status === 'loading'"
                required
                @focus="onEmailFocus"
              />
```

- [ ] **Step 3 : Brancher `submitted` / `succeeded` / `failed`**

Remplacer **la fonction `submit()` complète** (ligne ~88) par :

```ts
async function submit() {
  if (!canSubmit.value) return
  status.value = 'loading'
  errorMsg.value = ''

  capture('newsletter_signup_submitted', { source_page: sourcePage.value })

  try {
    await $fetch('/api/subscribe', {
      method: 'POST',
      body: { prenom: prenom.value.trim(), email: email.value, consent: consent.value },
    })
    status.value = 'success'
    capture('newsletter_signup_succeeded', { source_page: sourcePage.value })
  } catch (err: any) {
    status.value = 'error'
    errorMsg.value = err?.data?.message ?? 'Erreur technique, réessayez.'
    const reason: 'validation' | 'server' | 'network' =
      err?.statusCode && err.statusCode >= 400 && err.statusCode < 500 ? 'validation'
      : err?.statusCode && err.statusCode >= 500 ? 'server'
      : 'network'
    capture('newsletter_signup_failed', {
      source_page: sourcePage.value,
      reason,
      error_message: err?.data?.message ?? err?.message ?? 'unknown',
    })
  }
}
```

- [ ] **Step 4 : Vérification manuelle**

`npm run dev`. Ouvrir la page d'accueil avec DevTools console.

1. Cliquer dans le champ email → `[ph] newsletter_form_focused {source_page: '/'}`
2. Cliquer encore → **rien** (re-focus, ok)
3. Submit avec données invalides (cocher la case + email valide) → `[ph] newsletter_signup_submitted` puis selon Brevo : `_succeeded` ou `_failed`
4. Tester aussi sur `/frequence` → le `source_page` doit valoir `/frequence`

- [ ] **Step 5 : Commit**

```bash
git add app/components/NewsletterForm.vue
git commit -m "feat(posthog): instrument newsletter form with 4 events"
```

---

## Task 7: Events Articles (read_progress + clics liens)

**Files:**
- Modify: `app/pages/rapports/[...slug].vue`

**Référence spec:** §4.4

**Implémentation:** Le corps de l'article est rendu par `<ContentRenderer>` (HTML brut, pas de Vue handlers). On ajoute :
1. Un scroll listener qui calcule la profondeur lue de la balise `<article>` et émet aux paliers 25/50/75/100%
2. Un click listener délégué sur le wrapper `<article>` qui inspecte `event.target.closest('a')`

**Structure existante du template (vérifiée):**
- `<article class="article-wrapper" v-if="article">` enveloppe header + body + footer
- `<ScannerBorder class="article-body">` enveloppe `<ContentRenderer :value="article" class="prose" />`
- Breadcrumbs et NewsletterForm sont **hors** de cette zone — important pour scoper le click handler

**Approche:**
- `ref="articleRef"` sur `<article class="article-wrapper">` → mesure le scroll de l'article entier (header + body + footer = "lecture complète jusqu'au CTA newsletter en bas")
- Nouveau wrapper `<div ref="articleBodyRef" @click="onArticleClick">` autour de `<ContentRenderer>` → click handler **scopé au seul corps de l'article** (évite faux positifs sur breadcrumbs et form newsletter)

- [ ] **Step 2 : Ajouter la logique read_progress + link tracking dans le `<script setup>`**

À la fin du bloc `<script setup>` (avant la fermeture `</script>`), **ajouter** :

```ts
const { capture } = usePosthogEvent()
const articleRef = ref<HTMLElement | null>(null)
const articleBodyRef = ref<HTMLElement | null>(null)

const PROGRESS_THRESHOLDS = [25, 50, 75, 100] as const
const reachedThresholds = new Set<number>()

function onScroll() {
  const el = articleRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const totalHeight = el.scrollHeight - window.innerHeight
  if (totalHeight <= 0) return
  const scrolled = Math.max(0, -rect.top)
  const percent = Math.min(100, Math.round((scrolled / totalHeight) * 100))

  for (const t of PROGRESS_THRESHOLDS) {
    if (percent >= t && !reachedThresholds.has(t)) {
      reachedThresholds.add(t)
      capture('report_read_progress', {
        slug,
        category: article.value?.category ?? null,
        depth: t,
      })
    }
  }
}

function onArticleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const anchor = target?.closest('a') as HTMLAnchorElement | null
  if (!anchor || !anchor.href) return

  const url = new URL(anchor.href, window.location.origin)
  const isInternal = url.origin === window.location.origin

  if (isInternal) {
    capture('article_internal_link_clicked', {
      from_slug: slug,
      to_url:    url.pathname + url.search + url.hash,
      link_text: (anchor.textContent ?? '').trim().slice(0, 120),
    })
  } else {
    capture('article_source_clicked', {
      from_slug:       slug,
      external_domain: url.hostname,
    })
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  // Premier check au cas où l'article tient déjà dans la viewport
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
```

- [ ] **Step 3 : Brancher les deux refs dans le template**

Modifier le template :

1. Sur `<article class="article-wrapper" v-if="article">`, ajouter `ref="articleRef"` :

```vue
    <article ref="articleRef" class="article-wrapper" v-if="article">
```

2. Wrapper `<ContentRenderer>` dans un `<div>` avec ref + click handler. Remplacer :

```vue
      <ScannerBorder class="article-body">
        <ContentRenderer :value="article" class="prose" />
      </ScannerBorder>
```

par :

```vue
      <ScannerBorder class="article-body">
        <div ref="articleBodyRef" @click="onArticleClick">
          <ContentRenderer :value="article" class="prose" />
        </div>
      </ScannerBorder>
```

Pas de styling à ajouter — le `<div>` est `display: block` par défaut et n'altère pas le rendu.

- [ ] **Step 4 : Vérification manuelle**

`npm run dev`. Ouvrir un article sur `/rapports/<slug>` avec DevTools console.

1. Scroller lentement → console émet `[ph] report_read_progress {depth: 25}`, puis 50, 75, 100 — **chacun une seule fois**
2. Re-scroller en arrière puis re-avant → **rien de neuf** (Set bloque les doublons, c'est voulu)
3. Cliquer sur un lien interne dans le **corps de l'article** (ex : vers `/scanner` ou un autre rapport) → `[ph] article_internal_link_clicked {from_slug, to_url, link_text}`
4. Cliquer sur un lien externe dans les sources → `[ph] article_source_clicked {from_slug, external_domain}`
5. Cliquer sur un lien dans les **breadcrumbs** ou dans le **NewsletterForm** en bas → **rien** ne doit partir (scope respecté)

- [ ] **Step 5 : Commit**

```bash
git add "app/pages/rapports/[...slug].vue"
git commit -m "feat(posthog): instrument article reading progress and link clicks"
```

---

## Task 8: Event `report_card_clicked` (liste)

**Files:**
- Modify: `app/components/ArticleCard.vue`
- Modify: `app/pages/rapports/index.vue`

**Référence spec:** §4.5

**Approche:** `ArticleCard` est utilisé sur la home **et** sur `/rapports`. On veut tracker uniquement le contexte "liste rapports". On émet un event Vue `card-click` depuis `ArticleCard`, le parent décide quoi en faire.

- [ ] **Step 1 : Ajouter l'emit dans `ArticleCard.vue`**

Modifier `app/components/ArticleCard.vue`. Dans le `<script setup>`, après `const props = defineProps...`, **ajouter** :

```ts
const emit = defineEmits<{ 'card-click': [slug: string] }>()

const articleSlug = computed(() => props.article.path?.split('/').pop() ?? '')

function onClick() {
  emit('card-click', articleSlug.value)
}
```

Dans le template, ajouter `@click="onClick"` sur le `<NuxtLink>` :

```vue
<NuxtLink :to="`/rapports/${articleSlug}`" class="article-card-link" @click="onClick">
```

(Remplacer `article.path?.split('/').pop() ?? ''` par `articleSlug` pour DRY.)

- [ ] **Step 2 : Brancher le tracking dans la page liste**

Dans `app/pages/rapports/index.vue`, dans le `<script setup>` après le bloc `categories = [...]`, **ajouter** :

```ts
const { capture } = usePosthogEvent()

function onCardClick(slug: string, position: number) {
  const found = filteredArticles.value.find(a => a.path?.endsWith(slug))
  capture('report_card_clicked', {
    slug,
    category: found?.category ?? null,
    position,
  })
}
```

Dans le template, modifier le `<ArticleCard>` (ligne ~89) pour passer la position et le handler :

```vue
      <ArticleCard
        v-for="(article, index) in filteredArticles"
        :key="article.path"
        :article="article"
        @card-click="onCardClick($event, index + 1)"
      />
```

- [ ] **Step 3 : Vérification manuelle**

`npm run dev` → `/rapports`. Console ouverte.

1. Cliquer sur la 2e carte → `[ph] report_card_clicked {slug, category, position: 2}`
2. Filtrer par catégorie, cliquer sur la 1ère carte filtrée → `position: 1`, `category: <celle filtrée>`

**Important :** Vérifier aussi qu'on n'a **pas** d'event qui part depuis la home (la home utilise `ArticleCard` mais ne branche pas `@card-click`).

- [ ] **Step 4 : Commit**

```bash
git add app/components/ArticleCard.vue app/pages/rapports/index.vue
git commit -m "feat(posthog): track report card clicks with position and category"
```

---

## Task 9: Event `home_cta_clicked`

**Files:**
- Modify: `app/pages/index.vue`

**Référence spec:** §4.6

**CTAs concernés (relevés ligne 108, 112, 147 de index.vue):**
1. Hero "Rejoindre la Fréquence" (`<GlitchButton to="#newsletter">`) → `cta: 'newsletter'`
2. Hero "TESTER MON MÉTIER" (`<NuxtLink to="/scanner">`) → `cta: 'scanner'`
3. Scanner-teaser "Lancer le scan (gratuit)" (`<GlitchButton to="/scanner">`) → `cta: 'scanner'` (même cta, même valeur — distinguer via `$current_url` ou `data-attr`)
4. Le lien "LIRE LES RAPPORTS" (ligne 170) → `cta: 'rapports'`

- [ ] **Step 1 : Ajouter le composable + helper**

Dans le `<script setup>` de `app/pages/index.vue`, **ajouter** :

```ts
const { capture } = usePosthogEvent()

function onHomeCta(cta: 'scanner' | 'rapports' | 'newsletter') {
  capture('home_cta_clicked', { cta })
}
```

- [ ] **Step 2 : Brancher les 4 emplacements**

Modifier les balises concernées :

```vue
<!-- ligne ~108 -->
<GlitchButton label="Rejoindre la Fréquence" to="#newsletter" @click="onHomeCta('newsletter')" />

<!-- ligne ~112 -->
<NuxtLink to="/scanner" class="hero-link font-mono" @click="onHomeCta('scanner')">TESTER MON MÉTIER →</NuxtLink>

<!-- ligne ~147 -->
<GlitchButton label="Lancer le scan (gratuit)" to="/scanner" @click="onHomeCta('scanner')" />

<!-- ligne ~170 -->
<NuxtLink to="/rapports" class="font-mono" style="font-size: 0.75rem; letter-spacing: 0.1em;" @click="onHomeCta('rapports')">LIRE LES RAPPORTS ANTI-OBSOLESCENCE →</NuxtLink>
```

**Note:** Si `GlitchButton` ne propage pas `@click`, wrapper avec un `<span>` comme dans Task 5 step 5.

- [ ] **Step 3 : Vérification manuelle**

`npm run dev` → `/` (homepage). Console ouverte.

1. Clic sur "Rejoindre la Fréquence" → `[ph] home_cta_clicked {cta: 'newsletter'}`
2. Retour, clic sur "TESTER MON MÉTIER" → `cta: 'scanner'`
3. Retour, scroll, clic sur "Lancer le scan" → `cta: 'scanner'`
4. Retour, clic sur "LIRE LES RAPPORTS" → `cta: 'rapports'`

- [ ] **Step 4 : Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(posthog): track 3 home CTAs (scanner / rapports / newsletter)"
```

---

## Task 10: Convention `data-attr` sur nav et CTAs

**Files:**
- Modify: `app/components/AppHeader.vue`
- Modify: `app/components/AppFooter.vue`
- Modify: `app/pages/index.vue`

**Pourquoi:** Pour filtrer proprement les events `$autocapture` dans PostHog (sans dépendre du texte des boutons qui peut changer).

- [ ] **Step 1 : Header — ajouter data-attr aux liens de nav**

Lire d'abord :

```bash
grep -n "NuxtLink\|<a " /Users/mathieu/Documents/survivor/app/components/AppHeader.vue
```

Pour chaque lien de nav, ajouter `data-attr="header-nav-<destination>"`. Convention :
- Lien vers `/` : `data-attr="header-nav-home"`
- Lien vers `/scanner` : `data-attr="header-nav-scanner"`
- Lien vers `/rapports` : `data-attr="header-nav-rapports"`
- Lien vers `/frequence` : `data-attr="header-nav-frequence"`
- Lien vers `/identite` : `data-attr="header-nav-identite"`

Exemple :

```vue
<NuxtLink to="/scanner" data-attr="header-nav-scanner">Scanner</NuxtLink>
```

- [ ] **Step 2 : Footer — ajouter data-attr aux liens sociaux + nav**

```bash
grep -n "href\|NuxtLink\|<a " /Users/mathieu/Documents/survivor/app/components/AppFooter.vue
```

Convention :
- LinkedIn : `data-attr="footer-social-linkedin"`
- Instagram : `data-attr="footer-social-instagram"`
- YouTube : `data-attr="footer-social-youtube"`
- RSS : `data-attr="footer-social-rss"`
- Liens internes nav : `data-attr="footer-nav-<destination>"`

- [ ] **Step 3 : Home — data-attr sur les 4 CTAs (en complément du Task 9)**

Dans `app/pages/index.vue`, sur les 4 mêmes balises modifiées au Task 9, **ajouter** :

```vue
<GlitchButton label="Rejoindre la Fréquence" to="#newsletter" @click="onHomeCta('newsletter')" data-attr="hero-cta-newsletter" />
<NuxtLink to="/scanner" class="hero-link font-mono" @click="onHomeCta('scanner')" data-attr="hero-cta-scanner">TESTER MON MÉTIER →</NuxtLink>
<GlitchButton label="Lancer le scan (gratuit)" to="/scanner" @click="onHomeCta('scanner')" data-attr="teaser-cta-scanner" />
<NuxtLink to="/rapports" class="font-mono" style="..." @click="onHomeCta('rapports')" data-attr="home-link-rapports">LIRE LES RAPPORTS ANTI-OBSOLESCENCE →</NuxtLink>
```

**Note:** Si `GlitchButton` est un Vue component qui ne forwarde pas les attributs custom au DOM root, vérifier en inspectant le DOM rendu — sinon wrapper.

- [ ] **Step 4 : Vérification manuelle**

`npm run dev`. Inspecter le DOM des éléments modifiés (DevTools → Elements → vérifier la présence de `data-attr` sur le `<a>` ou `<button>` rendu).

Cliquer sur 1-2 liens et regarder les events `$autocapture` qui partent : leurs `properties` doivent contenir `attr__data-attr: "header-nav-scanner"` (ou équivalent).

- [ ] **Step 5 : Commit**

```bash
git add app/components/AppHeader.vue app/components/AppFooter.vue app/pages/index.vue
git commit -m "feat(posthog): add data-attr convention for stable autocapture filtering"
```

---

## Task 11: Mise à jour politique de confidentialité

**Files:**
- Modify: `app/pages/confidentialite.vue`

**Référence spec:** §5

- [ ] **Step 1 : Lire le fichier complet**

```bash
cat /Users/mathieu/Documents/survivor/app/pages/confidentialite.vue
```

- [ ] **Step 2 : Insérer la nouvelle section**

Ajouter une nouvelle `<section class="policy-section">` **juste après** la section "Sous-traitant" et **avant** "Durée de conservation" :

```vue
    <section class="policy-section">
      <h2>Mesure d'audience anonyme</h2>
      <p>Pour comprendre comment le site est utilisé et l'améliorer, nous utilisons <strong>PostHog</strong> (hébergé dans l'Union européenne, à Francfort) en mode strictement anonyme :</p>
      <ul>
        <li>Aucun cookie n'est déposé sur votre appareil</li>
        <li>Aucun identifiant persistant n'est créé</li>
        <li>Les données collectées (pages visitées, clics, métiers scannés, performances techniques) sont agrégées et ne permettent pas de vous identifier</li>
        <li>Conformément à l'exemption CNIL pour la mesure d'audience, ces données sont conservées 13 mois maximum</li>
      </ul>
      <p>Vous pouvez vous opposer à cette mesure en activant le mode <em>Do Not Track</em> de votre navigateur — nous le respectons automatiquement.</p>
      <p><a href="https://posthog.com/privacy" target="_blank" rel="noopener">Politique de confidentialité PostHog ↗</a></p>
    </section>
```

- [ ] **Step 3 : Mettre à jour la section "Données collectées"**

Modifier le `<p>Aucune autre donnée n'est collectée.</p>` pour devenir :

```vue
      <p>Au-delà de la newsletter, nous collectons des données d'audience anonymes (voir ci-dessous : <em>Mesure d'audience anonyme</em>).</p>
```

- [ ] **Step 4 : Vérification visuelle**

`npm run dev` → `/confidentialite`. Vérifier que :
- La section "Mesure d'audience anonyme" apparaît au bon endroit
- Le styling est cohérent avec les autres sections (utilise déjà `.policy-section`)
- Le lien externe vers PostHog ouvre dans un nouvel onglet

- [ ] **Step 5 : Commit**

```bash
git add app/pages/confidentialite.vue
git commit -m "docs(privacy): add anonymous analytics section for PostHog"
```

---

## Task 12: Variable d'environnement Vercel + déploiement

**Files:** aucun (action ops)

- [ ] **Step 1 : Ajouter la variable côté Vercel**

Dans le dashboard Vercel du projet `survivor` :
- Settings → Environment Variables
- Add :
  - **Name** : `NUXT_PUBLIC_POSTHOG_KEY`
  - **Value** : `phc_xxxxxxxxxxxxx` (la même clé que `.env`)
  - **Environments** : cocher Production, Preview, Development
- Save

- [ ] **Step 2 : Déclencher un re-deploy**

Soit via Vercel UI (Deployments → Redeploy), soit en pushant n'importe quel commit (les commits du plan auront déjà été poussés au fil de l'eau si CI/CD branchée — sinon `git push origin main`).

- [ ] **Step 3 : Vérification production**

Ouvrir `https://survivant-ia.ch` en navigation privée (pour ne pas avoir le `ph_optout` posé localement) → DevTools Network → filtre `/_ph/`.

- ✅ Une requête `POST /_ph/e/?...` part au load → status 200
- ✅ Aucun cookie `ph_*` (Application → Cookies)
- ✅ Tester un parcours scanner complet → events visibles dans PostHog Activity feed (filtré sur "production" si tu sépares les envs)

- [ ] **Step 4 : Poser son optout sur ses propres navigateurs**

Sur chaque navigateur que Mathieu utilise pour visiter le site, ouvrir la console DevTools et exécuter :

```js
localStorage.setItem('ph_optout', '1')
```

Recharger la page → vérifier qu'**aucune** requête `/_ph/e/` ne part désormais depuis ce navigateur.

---

## Task 13: Création du dashboard hebdo dans PostHog (manuel)

**Files:** aucun (config UI PostHog)

**Référence spec:** §6

- [ ] **Step 1 : Créer le dashboard**

Dans `https://eu.posthog.com/project/<id>/dashboard` → **+ New dashboard** → nom : `Pilotage Survivant — Hebdo`.

- [ ] **Step 2 : Tuile 1 — Inscriptions newsletter / semaine**

+ Add insight → **Trends** :
- Series : `newsletter_signup_succeeded` · count
- Date range : Last 12 weeks · weekly granularity
- Save → Add to dashboard

- [ ] **Step 3 : Tuile 2 — Conversion par page d'origine**

+ Add insight → **Trends** :
- Series : `newsletter_signup_succeeded`
- Breakdown by : event property `source_page`
- Date range : Last 30 days
- Save

- [ ] **Step 4 : Tuile 3 — Top 10 jobs scannés**

+ Add insight → **Trends** → table view :
- Series : `scanner_job_selected` · total count
- Breakdown by : event property `job_slug`
- Limit : top 10
- Date range : Last 30 days
- Save

- [ ] **Step 5 : Tuile 4 — Top 5 articles lus à 100%**

+ Add insight → **Trends** :
- Series : `report_read_progress` filtered where `depth = 100`
- Breakdown by : event property `slug`
- Limit : top 5
- Date range : Last 30 days
- Save

- [ ] **Step 6 : Tuile 5 — Mix d'acquisition**

+ Add insight → **Trends** → pie chart :
- Series : `$pageview` · unique users (DAU-like proxy)
- Breakdown by : event property `utm_source` (avec fallback `$referring_domain`)
- Date range : Last 30 days
- Save

- [ ] **Step 7 : Tuile 6 — Recherches scanner sans résultat**

+ Add insight → **Trends** → table :
- Series : `scanner_search_no_results`
- Breakdown by : event property `query`
- Date range : Last 30 days
- Save

- [ ] **Step 8 : Tuile 7 — Santé technique**

+ Add insight → **Trends** multi-séries :
- Série A : `$web_vitals` filter `name = LCP`, p75
- Série B : `$exception` count
- Date range : Last 30 days
- Save

- [ ] **Step 9 : Réorganiser le dashboard**

Drag & drop les tuiles dans l'ordre listé dans le spec §6. Sauvegarder le layout.

---

## Task 14: Self-review final & merge

- [ ] **Step 1 : Vérifier tous les events depuis le PostHog event explorer**

Dans `https://eu.posthog.com/project/<id>/data-management/events`, vérifier la présence des **15 événements custom** au moins une fois sur les 7 derniers jours :

```
scanner_job_selected, scanner_scan_completed, scanner_cta_clicked,
scanner_reset, scanner_search_no_results, scanner_result_shared,
newsletter_form_focused, newsletter_signup_submitted,
newsletter_signup_succeeded, newsletter_signup_failed,
report_read_progress, article_internal_link_clicked,
article_source_clicked, report_card_clicked, home_cta_clicked
```

- [ ] **Step 2 : Vérifier les critères de succès du spec §9**

Pour chaque ligne du spec §9 (Critères de succès), cocher mentalement OK/KO. Tous doivent être OK.

- [ ] **Step 3 : Vérifier qu'il n'y a aucun cookie PostHog en prod**

Navigation privée sur `https://survivant-ia.ch` → DevTools → Application → Cookies → **aucun** `ph_*` ou `posthog`. Si présent, problème de config (`disable_persistence` non respecté).

- [ ] **Step 4 : Push final si pas déjà fait**

```bash
cd /Users/mathieu/Documents/survivor && git status
```

Si commits pas encore poussés :

```bash
git push origin main
```

---

## Notes globales

**Si une étape "Modify" ne match pas exactement le code (ligne déplacée, refactor entretemps)**, l'engineer doit :
1. Trouver l'élément équivalent par contexte
2. Appliquer la même intention (ajouter le `capture()` au bon endroit logique)
3. Vérifier le résultat avec la même verification manuelle

**Le compositeur fonctionne hors-ligne / sans clé** : `usePosthogEvent()` no-op si `$posthog` est null. Donc tout le tracking du plan peut être développé sans clé valide — mais la verif PostHog UI exige la clé.

**`GlitchButton` propagation:** Si le check à Task 5 step 5 montre que `GlitchButton` ne forwarde pas `@click` ni les attributs custom, prévoir un wrapper `<span>` partout où on l'utilise pour le tracking. Tasks 5 step 5, 9 step 2, 10 step 3 sont concernés.

