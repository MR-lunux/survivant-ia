# Section I — Cards Refresh + Carte Chantier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animer franchement la carte 03 de la home (outil qui sort de la boîte), ajouter une 4e carte teaser "Chantier" avec briques qui s'empilent, et créer la page `/chantier` avec un form de captation d'intérêt stocké séparément du newsletter.

**Architecture:**
- Frontend : 4 cartes en grid 2×2 dans `app/pages/index.vue` (suppression de `qcard-wide`), 2 nouvelles SVG icônes inline + leurs animations CSS scoped.
- Page `/chantier` : Vue page statique pré-rendue, form submit → POST `/api/chantier/interest`, confirmation inline.
- Backend : nouvel endpoint Nitro qui crée un contact Brevo dans une **liste séparée** (pas la liste newsletter), avec un attribut custom `CHANTIER_INTEREST_TEXT`. Rate limit + validation alignés sur `subscribe.post.ts` existant.

**Tech Stack:** Nuxt 4, Vue 3 (Composition API + script setup), Brevo API (REST), PostHog (event capture côté client), CSS scoped + variables `--color-*` du design system V2 (sage `#5BA37A`, warm dark, Playfair italic).

**No tests in this repo.** Vérification = `pnpm dev` + browser check + `curl` pour l'endpoint. Chaque tâche se termine par un commit après vérification visuelle.

**Reference spec:** `docs/superpowers/specs/2026-05-09-home-section-i-cards-icons-and-chantier-design.md` (commit `12fc712`).

---

## File Structure

| Fichier | Action | Responsabilité |
|---|---|---|
| `nuxt.config.ts` | modifier | Ajouter `brevoChantierListId` à `runtimeConfig`, `/chantier` dans `routeRules` (sitemap) et `prerender.routes`. |
| `.env.example` | modifier | Documenter `NUXT_BREVO_CHANTIER_LIST_ID`. |
| `server/api/chantier/interest.post.ts` | créer | Endpoint POST : valide email + interest, push contact Brevo dans liste Chantier dédiée, rate limit IP. |
| `app/pages/chantier.vue` | créer | Page complète : header + 2 paragraphes + form (email + textarea optionnel) + confirmation inline. |
| `app/pages/index.vue` | modifier | Carte 03 : nouvelle SVG + animation `tool-emerge` (suppression `latch-pulse`). Carte 04 : nouvelle NuxtLink + SVG briques + CSS animations. Suppression `qcard-wide` (markup + CSS). Extension du type de `onHomeCta`. |

---

## Pre-flight (manuel, hors plan automatisé)

L'utilisateur doit créer une **nouvelle liste Brevo** "Chantier" (ou nom équivalent) dans le dashboard Brevo, récupérer son ID numérique, et ajouter `NUXT_BREVO_CHANTIER_LIST_ID=<id>` dans le `.env` local + l'environnement de prod (Netlify/Vercel/whatever est utilisé).

L'utilisateur doit aussi (optionnel mais recommandé) créer dans Brevo l'attribut custom **`CHANTIER_INTEREST_TEXT`** de type texte avant le 1er submit, sinon Brevo le créera à la volée avec un type par défaut.

Cette étape est **bloquante** pour Task 1 step "smoke test endpoint" mais le code peut être écrit et committé sans ça (l'endpoint renverra 500 "Configuration serveur manquante" tant que la variable d'env n'est pas en place — c'est OK).

---

## Task 1: Backend — config + endpoint `/api/chantier/interest`

**Files:**
- Modify: `nuxt.config.ts:11-17` (runtimeConfig), `nuxt.config.ts:50-65` (routeRules), `nuxt.config.ts:108-114` (prerender)
- Modify: `.env.example`
- Create: `server/api/chantier/interest.post.ts`

- [ ] **Step 1: Ajouter la clé runtime config et la route**

Modifier `nuxt.config.ts` — bloc `runtimeConfig` (vers la ligne 11) :

```ts
  runtimeConfig: {
    brevoApiKey: '',
    brevoListId: '',
    brevoChantierListId: '',
    public: {
      posthogKey: '',
    },
  },
```

Ajouter dans `routeRules` (entre `/frequence` et `/identite`) :

```ts
    '/chantier': { sitemap: { priority: 0.4, changefreq: 'monthly' } },
```

Ajouter `/chantier` dans `nitro.prerender.routes` (à la fin de la liste, avant `...scannerRoutes`) :

```ts
      routes: ['/', '/rss.xml', '/scanner', '/metiers', '/rapports', '/outils', '/outils/trc-01', '/frequence', '/identite', '/confidentialite', '/chantier', ...scannerRoutes],
```

- [ ] **Step 2: Ajouter la variable au `.env.example`**

Ajouter une ligne après `NUXT_BREVO_LIST_ID` :

```
NUXT_BREVO_API_KEY=your-brevo-api-key-here
NUXT_BREVO_LIST_ID=your-brevo-list-id-here
NUXT_BREVO_CHANTIER_LIST_ID=your-brevo-chantier-list-id-here

# PostHog Cloud EU — public project key (starts with phc_)
NUXT_PUBLIC_POSTHOG_KEY=
```

- [ ] **Step 3: Créer l'endpoint**

Créer `server/api/chantier/interest.post.ts` avec ce contenu exact :

```ts
// server/api/chantier/interest.post.ts
const _rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 heure

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = _rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    _rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

export default defineEventHandler(async (event) => {
  const { brevoApiKey, brevoChantierListId } = useRuntimeConfig()

  if (!brevoApiKey || !brevoChantierListId) {
    throw createError({ statusCode: 500, message: 'Configuration serveur manquante.' })
  }

  const body = await readBody(event)
  const { email, interest, website } = body ?? {}

  // Honeypot anti-bot : silencieux
  if (website) {
    return { ok: true }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, message: 'Trop de tentatives. Réessayez dans une heure.' })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Email invalide.' })
  }

  const safeInterest = typeof interest === 'string'
    ? stripHtml(interest.slice(0, 500))
    : ''

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      listIds: [Number(brevoChantierListId)],
      attributes: {
        SOURCE: 'chantier',
        ...(safeInterest ? { CHANTIER_INTEREST_TEXT: safeInterest } : {}),
      },
      updateEnabled: false,
    }),
  })

  if (res.status === 201) {
    return { ok: true }
  }

  const data = await res.json().catch(() => ({}))

  // Brevo renvoie 400 + code "duplicate_parameter" si le contact existe déjà
  if (res.status === 400 && data?.code === 'duplicate_parameter') {
    return { ok: true }
  }

  const message = data?.message ?? 'Erreur technique, réessayez.'
  throw createError({ statusCode: 500, message })
})
```

- [ ] **Step 4: Démarrer le dev server et faire un smoke test**

Si l'utilisateur a déjà ajouté `NUXT_BREVO_CHANTIER_LIST_ID` au `.env` local :

```bash
pnpm dev
```

Dans un autre terminal :

```bash
curl -i -X POST http://localhost:3000/api/chantier/interest \
  -H 'Content-Type: application/json' \
  -d '{"email":"test+chantier@example.com","interest":"un atelier live le samedi"}'
```

Attendu : `HTTP/1.1 200 OK` avec body `{"ok":true}`. Vérifier dans Brevo dashboard → liste Chantier que le contact apparaît avec `CHANTIER_INTEREST_TEXT` = "un atelier live le samedi".

Tester aussi un email invalide :

```bash
curl -i -X POST http://localhost:3000/api/chantier/interest \
  -H 'Content-Type: application/json' \
  -d '{"email":"pas-un-email"}'
```

Attendu : `HTTP/1.1 400` avec message "Email invalide.".

Si l'env var n'est pas encore en place : skip ce step, l'endpoint renverra 500 "Configuration serveur manquante" (comportement attendu — sera testé après pre-flight).

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts .env.example server/api/chantier/interest.post.ts
git commit -m "$(cat <<'EOF'
feat(chantier): endpoint /api/chantier/interest + Brevo list dédiée

Test de désir pour un format hands-on. Stocke email + texte libre dans une
liste Brevo séparée du newsletter (NUXT_BREVO_CHANTIER_LIST_ID) pour ne pas
polluer la conversion #1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Page `/chantier.vue`

**Files:**
- Create: `app/pages/chantier.vue`

- [ ] **Step 1: Créer la page complète**

Créer `app/pages/chantier.vue` avec ce contenu exact :

```vue
<!-- app/pages/chantier.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Chantier — Survivant-IA',
  description: 'On réfléchit à un format pour passer de la lecture à la pratique. Dis-nous ce qui t\'intéresserait.',
  ogTitle: 'On ouvre un chantier — Survivant-IA',
  ogDescription: 'Un format pour passer de la lecture à la pratique. On y réfléchit. Dis-nous ce qui t\'intéresserait.',
  twitterCard: 'summary_large_image',
})

defineOgImage('Default', {
  title: 'On ouvre un chantier.',
  titleAccent: 'Dis-nous ce qui t\'intéresse.',
})

const { capture } = usePosthogEvent()

const email = ref('')
const interest = ref('')
const website = ref('') // honeypot
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMsg = ref('')

const canSubmit = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
  status.value !== 'loading'
)

async function submit() {
  if (!canSubmit.value) return
  status.value = 'loading'
  errorMsg.value = ''

  capture('chantier_intent_submitted', {
    has_interest_text: interest.value.trim().length > 0,
  })

  try {
    await $fetch('/api/chantier/interest', {
      method: 'POST',
      body: {
        email: email.value,
        interest: interest.value.trim(),
        website: website.value,
      },
    })
    status.value = 'success'
    capture('chantier_intent_succeeded', {
      has_interest_text: interest.value.trim().length > 0,
    })
  } catch (err: any) {
    status.value = 'error'
    errorMsg.value = err?.data?.message ?? 'Erreur technique, réessayez.'
    const reason: 'rate_limit' | 'validation' | 'server' | 'network' =
      err?.statusCode === 429 ? 'rate_limit'
      : err?.statusCode && err.statusCode >= 400 && err.statusCode < 500 ? 'validation'
      : err?.statusCode && err.statusCode >= 500 ? 'server'
      : 'network'
    capture('chantier_intent_failed', { reason })
  }
}
</script>

<template>
  <main class="chantier-page">
    <div class="container">
      <header class="ch-header">
        <h1 class="ch-h1"><em>On ouvre un chantier.</em></h1>
        <p class="ch-sub">
          Un format pour passer de la lecture à la pratique. On y réfléchit.
          Dis-nous ce qui t'intéresserait.
        </p>
      </header>

      <section class="ch-body">
        <div class="ch-block">
          <h2 class="ch-h2">Ce que ça pourrait être</h2>
          <p>
            Un atelier collectif live. Un challenge de deux semaines à plusieurs.
            Un coaching à quatre ou cinq. Un format async par email.
            On hésite — c'est <em>vraiment</em> en cours de réflexion.
          </p>
        </div>

        <div class="ch-block">
          <h2 class="ch-h2">Ce que ça ne sera pas</h2>
          <p>
            Ce ne sera pas une formation longue qui dure six mois.
            Ce ne sera pas du jargon ni du copier-coller depuis LinkedIn.
            Format et prix ne sont pas décidés.
            Ton avis nous aide à le construire honnêtement.
          </p>
        </div>
      </section>

      <section v-if="status !== 'success'" class="ch-form-section">
        <form class="ch-form" @submit.prevent="submit">
          <!-- Honeypot anti-bot -->
          <input
            v-model="website"
            type="text"
            name="website"
            class="ch-honeypot"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />

          <div class="ch-field">
            <label class="ch-label" for="ch-email">Email</label>
            <input
              id="ch-email"
              v-model="email"
              type="email"
              placeholder="ton@email.com"
              class="ch-input"
              :disabled="status === 'loading'"
              required
            />
          </div>

          <div class="ch-field">
            <label class="ch-label" for="ch-interest">
              Qu'est-ce qui t'intéresserait le plus ?
              <span class="ch-optional">(optionnel)</span>
            </label>
            <textarea
              id="ch-interest"
              v-model="interest"
              class="ch-input ch-textarea"
              :disabled="status === 'loading'"
              rows="3"
              maxlength="500"
              placeholder="Une phrase, un format, une idée…"
            />
          </div>

          <button
            type="submit"
            class="ch-submit"
            :disabled="!canSubmit"
          >
            {{ status === 'loading' ? 'Envoi…' : 'Je suis intéressé·e' }}
            <span class="ch-arrow" aria-hidden="true">→</span>
          </button>

          <p v-if="errorMsg" class="ch-error" role="alert">{{ errorMsg }}</p>
        </form>
      </section>

      <p v-else class="ch-success">
        <em>Merci.</em> On revient vers toi quand le chantier prend forme.
      </p>
    </div>
  </main>
</template>

<style scoped>
.chantier-page {
  padding: 5rem 0 6rem;
  min-height: 70vh;
}

/* ── Header ──────────────────────────────────── */
.ch-header {
  max-width: 640px;
  margin: 0 auto 4rem;
  text-align: center;
}
.ch-h1 {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-weight: 400;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.1;
  letter-spacing: -0.015em;
  margin: 0 0 1rem;
  color: var(--color-text);
}
.ch-h1 em {
  font-style: italic;
  color: var(--color-accent);
}
.ch-sub {
  font-family: var(--font-serif-body);
  font-size: 1.1rem;
  color: var(--color-muted);
  line-height: 1.5;
  margin: 0;
  max-width: 50ch;
  margin-left: auto;
  margin-right: auto;
}

/* ── Body blocks ─────────────────────────────── */
.ch-body {
  max-width: 640px;
  margin: 0 auto 4rem;
  display: grid;
  gap: 2.5rem;
}
.ch-h2 {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin: 0 0 0.75rem;
}
.ch-block p {
  font-family: var(--font-serif-body);
  font-size: 1.05rem;
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
}
.ch-block p em {
  font-style: italic;
  color: var(--color-accent);
}

/* ── Form ────────────────────────────────────── */
.ch-form-section {
  max-width: 520px;
  margin: 0 auto;
}
.ch-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.ch-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.ch-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-bottom: 1px solid var(--color-rule);
  padding-bottom: 0.4rem;
  transition: border-color 0.2s ease;
}
.ch-field:focus-within { border-bottom-color: var(--color-accent); }
.ch-label {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.ch-optional {
  text-transform: none;
  font-style: italic;
  letter-spacing: 0;
  color: var(--color-dim);
  margin-left: 0.4rem;
}
.ch-input {
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-serif-body);
  font-size: 1.05rem;
  color: var(--color-text);
  padding: 0.4rem 0;
  width: 100%;
  resize: none;
}
.ch-input::placeholder {
  color: var(--color-dim);
  font-style: italic;
}
.ch-textarea {
  resize: vertical;
  min-height: 4rem;
  line-height: 1.5;
}
.ch-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ch-submit {
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  text-transform: uppercase;
  cursor: pointer;
  padding: 0.4rem 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: gap 0.25s ease, opacity 0.2s ease;
  align-self: flex-start;
}
.ch-submit:not(:disabled):hover { gap: 0.85rem; }
.ch-submit:disabled {
  color: var(--color-muted);
  cursor: not-allowed;
  opacity: 0.6;
}
.ch-arrow { transition: transform 0.25s ease; }

.ch-error {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--color-danger);
  margin: 0;
}

/* ── Success ─────────────────────────────────── */
.ch-success {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: 1.4rem;
  line-height: 1.4;
  text-align: center;
  max-width: 540px;
  margin: 0 auto;
  color: var(--color-text);
}
.ch-success em {
  font-style: italic;
  color: var(--color-accent);
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 540px) {
  .chantier-page { padding: 3rem 0 4rem; }
  .ch-header { margin-bottom: 3rem; }
  .ch-body { margin-bottom: 3rem; gap: 2rem; }
}

@media (prefers-reduced-motion: reduce) {
  .ch-submit, .ch-arrow, .ch-field { transition: none !important; }
}
</style>
```

- [ ] **Step 2: Vérifier la page dans le navigateur**

Si pas déjà lancé :

```bash
pnpm dev
```

Ouvrir `http://localhost:3000/chantier`. Vérifier :
- Le titre "On ouvre un chantier." s'affiche en Playfair italic sage.
- Les 2 blocs "Ce que ça pourrait être" / "Ce que ça ne sera pas" s'affichent.
- Le form a 2 champs (email requis, textarea optionnel) + bouton "Je suis intéressé·e".
- Le bouton est désactivé tant que l'email n'est pas valide.
- Submit avec un email valide → message de succès "Merci. On revient vers toi…" remplace le form.
- Si l'env var Brevo n'est pas en place, le submit affiche "Configuration serveur manquante." dans `.ch-error` — c'est attendu.
- Mobile : ouvrir DevTools en 375px width — pas de débordement, padding adapté.

- [ ] **Step 3: Commit**

```bash
git add app/pages/chantier.vue
git commit -m "$(cat <<'EOF'
feat(chantier): page /chantier — header + 2 paragraphes + form intent

Page sobre dans la DA V2 (Playfair italic sage sur warm dark). Form email
+ texte libre optionnel POST /api/chantier/interest, confirmation inline.
Capture 3 events PostHog (submitted/succeeded/failed).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Home — Carte 03 nouvelle icône (outil qui sort de la boîte)

**Files:**
- Modify: `app/pages/index.vue` — SVG carte 03 (~lignes 99-103), CSS `.ic-toolbox` (~lignes 426-450)

- [ ] **Step 1: Remplacer la SVG de la carte 03**

Dans `app/pages/index.vue`, repérer la `<svg viewBox="0 0 56 56" class="ic-toolbox" aria-hidden="true">` actuelle de la carte 03 (autour de la ligne 99) et la remplacer par :

```html
<svg viewBox="0 0 56 56" class="ic-toolbox" aria-hidden="true">
  <rect class="box" x="10" y="20" width="36" height="24" rx="2"/>
  <path class="handle" d="M 20 20 L 20 14 Q 20 10 24 10 L 32 10 Q 36 10 36 14 L 36 20"/>
  <line class="latch" x1="28" y1="26" x2="28" y2="38"/>
  <g class="tool">
    <path class="tool-head" d="M 38 14 L 38 10 L 46 10 L 46 14 L 44 14 L 44 12 L 40 12 L 40 14 Z"/>
    <line class="tool-stem" x1="42" y1="14" x2="42" y2="22"/>
  </g>
</svg>
```

- [ ] **Step 2: Remplacer les styles `.ic-toolbox`**

Dans le `<style>` de `index.vue`, repérer le bloc `/* ── Toolbox icon (carte 03) — boîte à outils simple ────── */` (autour de la ligne 426) et remplacer **tout le bloc jusqu'à la fin de `@keyframes latch-pulse`** par :

```css
/* ── Toolbox icon (carte 03) — outil qui émerge ────── */
.ic-toolbox { width: 100%; height: 100%; }
.ic-toolbox .box,
.ic-toolbox .handle,
.ic-toolbox .latch,
.ic-toolbox .tool-stem {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ic-toolbox .tool-head {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linejoin: round;
}
.ic-toolbox .tool {
  animation: tool-emerge 3s ease-in-out infinite;
}
@keyframes tool-emerge {
  0%   { transform: translateY(0); }
  25%  { transform: translateY(-8px); }
  60%  { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .ic-toolbox .tool { animation: none; }
}
```

Cela supprime l'ancienne animation `latch-pulse` (et le drop-shadow associé) — le verrou redevient statique.

- [ ] **Step 3: Vérifier dans le navigateur**

Recharger `http://localhost:3000/`. Vérifier sur la carte 03 (Boîte à Outils) :
- La boîte + handle + verrou sont statiques.
- Une silhouette de tête de clé apparaît à droite du handle, avec un manche qui descend dans la boîte.
- L'outil monte/redescend en boucle (~3s par cycle).
- En activant `prefers-reduced-motion: reduce` (DevTools > Rendering > Emulate CSS media feature) : l'outil reste fixe, plus d'animation.

- [ ] **Step 4: Commit**

```bash
git add app/pages/index.vue
git commit -m "$(cat <<'EOF'
polish(home): carte 03 — outil qui sort de la boîte (remplace latch-pulse)

L'animation latch-pulse (opacity + glow) ne suffisait pas à donner un vrai
mouvement à la carte 03 face au ripple/sablier des cartes 01/02. La tête
de clé émerge maintenant par le haut de la boîte (translateY -8px, cycle
3s), le verrou redevient statique.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Home — Ajouter la carte 04 Chantier + suppression `qcard-wide`

**Files:**
- Modify: `app/pages/index.vue` — markup carte 03 (retrait `qcard qcard-wide` → `qcard`), nouveau bloc carte 04, fonction `onHomeCta` (extension type), CSS (suppression `.qcard-wide`, ajout `.qcard-num em`, ajout `.ic-bricks` + animations)

- [ ] **Step 1: Étendre le type de `onHomeCta`**

Dans `<script setup>` de `app/pages/index.vue` (ligne ~20), modifier la signature :

Remplacer :
```ts
function onHomeCta(cta: 'scanner' | 'rapports' | 'newsletter' | 'outils') {
  capture('home_cta_clicked', { cta })
}
```

Par :
```ts
function onHomeCta(cta: 'scanner' | 'rapports' | 'newsletter' | 'outils' | 'chantier') {
  capture('home_cta_clicked', { cta })
}
```

- [ ] **Step 2: Retirer `qcard-wide` du markup de la carte 03**

Repérer (ligne ~96) :
```html
<NuxtLink to="/outils" class="qcard qcard-wide" data-attr="hero-cta-outils" @click="onHomeCta('outils')">
```

Remplacer par :
```html
<NuxtLink to="/outils" class="qcard" data-attr="hero-cta-outils" @click="onHomeCta('outils')">
```

- [ ] **Step 3: Ajouter la carte 04 après la carte 03**

Après le `</NuxtLink>` de fermeture de la carte 03 (et avant la fermeture du `</div>` de `.qcards`), insérer ce nouveau bloc :

```html
            <NuxtLink to="/chantier" class="qcard" data-attr="hero-cta-chantier" @click="onHomeCta('chantier')">
              <span class="qcard-num">04 / <em>en cours de réflexion</em></span>
              <div class="qcard-icon">
                <svg viewBox="0 0 56 56" class="ic-bricks" aria-hidden="true">
                  <rect class="brick brick-3" x="14" y="14" width="28" height="8" rx="1"/>
                  <rect class="brick brick-2" x="14" y="24" width="28" height="8" rx="1"/>
                  <rect class="brick brick-1" x="14" y="34" width="28" height="8" rx="1"/>
                </svg>
              </div>
              <h3 class="qcard-question">Veux-tu <strong>mettre les mains dans le cambouis</strong>&nbsp;?</h3>
              <p class="qcard-meta">On pense à un format pour passer de la lecture à la pratique. Dis-moi ce qui t'intéresserait.</p>
              <span class="qcard-arrow">Donner mon avis</span>
            </NuxtLink>
```

- [ ] **Step 4: Supprimer la règle CSS `.qcard-wide`**

Dans le `<style>`, repérer (ligne ~294-295) et supprimer ces deux lignes :

```css
/* 3rd card spans both columns (signals "secondaire mais visible") */
.qcard-wide { grid-column: 1 / -1; }
```

- [ ] **Step 5: Ajouter les styles `.qcard-num em` (italic Playfair sage)**

Toujours dans le `<style>`, juste après la règle `.qcard-num { … }` (vers la ligne 321, avant `.qcard-icon`), ajouter :

```css
.qcard-num em {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 0.95rem;
  letter-spacing: 0;
  text-transform: none;
  color: var(--color-accent);
}
```

- [ ] **Step 6: Ajouter les styles + animation `.ic-bricks`**

À la fin du `<style scoped>`, **après** le bloc `.ic-toolbox` modifié au Task 3 et **avant** `/* ── Sections ──── */` (vers la ligne 451), ajouter :

```css
/* ── Bricks icon (carte 04) — empilement staggered ────── */
.ic-bricks { width: 100%; height: 100%; }
.ic-bricks .brick {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linejoin: round;
  transform-box: fill-box;
}
.ic-bricks .brick-1 { animation: brick-stack-1 4s ease-in-out infinite; }
.ic-bricks .brick-2 { animation: brick-stack-2 4s ease-in-out infinite; }
.ic-bricks .brick-3 { animation: brick-stack-3 4s ease-in-out infinite; }

@keyframes brick-stack-1 {
  0%, 100% { opacity: 0; transform: translateY(6px); }
  10%, 95% { opacity: 1; transform: translateY(0); }
}
@keyframes brick-stack-2 {
  0%, 30%, 100% { opacity: 0; transform: translateY(6px); }
  40%, 95%      { opacity: 1; transform: translateY(0); }
}
@keyframes brick-stack-3 {
  0%, 55%, 100% { opacity: 0; transform: translateY(6px); }
  65%, 95%      { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ic-bricks .brick {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 7: Vérifier la home dans le navigateur**

Recharger `http://localhost:3000/`. Vérifier :
- 4 cartes en grille 2×2 sous "I. Choisis ton entrée". Plus de carte wide en pleine largeur.
- Carte 04 : kicker "04 / *en cours de réflexion*" — la portion italique apparaît en Playfair italic sage (différente de la 1ère partie en Inter caps).
- Carte 04 : 3 briques apparaissent du bas vers le haut en cycle (~4s), puis disparaissent et recommencent.
- Carte 04 : question "Veux-tu mettre les mains dans le cambouis ?" lisible, "mettre les mains dans le cambouis" en strong/sage.
- Cliquer carte 04 → navigation vers `/chantier` ; en DevTools Network ou console PostHog, vérifier l'event `home_cta_clicked` avec `cta: 'chantier'`.
- Mobile (375px) : les 4 cartes restent en 2×2 ou se compriment proprement (fonction du grid existant).
- `prefers-reduced-motion: reduce` activé : les briques restent toutes visibles, l'outil de la carte 03 reste statique.

- [ ] **Step 8: Smoke test du flow complet**

1. Cliquer carte 04 sur la home → arrive sur `/chantier`.
2. Soumettre le form avec email valide → confirmation "Merci…" inline.
3. (Si Brevo configuré) vérifier que le contact apparaît dans la liste Chantier Brevo avec `CHANTIER_INTEREST_TEXT` rempli.
4. Vérifier en console PostHog (DevTools) les events `chantier_intent_submitted` puis `chantier_intent_succeeded` avec `has_interest_text: true/false` selon si le textarea était rempli.
5. Retour à la home : vérifier qu'aucune autre section n'est cassée (Manifeste, Diagnostic Teaser, Skills, Rapports, FAQ).

- [ ] **Step 9: Commit**

```bash
git add app/pages/index.vue
git commit -m "$(cat <<'EOF'
feat(home): carte 04 Chantier + grid 2×2 égal

Ajoute une 4e carte teaser "en cours de réflexion" avec briques qui
s'empilent en stagger, kicker italic Playfair sage, lien vers /chantier.
Suppression de qcard-wide sur la carte 03 — toutes les cartes égales en
grid 2×2. Extension de onHomeCta pour le tracking PostHog du nouveau CTA.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Open Questions résolues à l'impl

1. **Outil sur carte 03** : tête de **clé** (open-jaw silhouette) — distinct du marteau implicite de "cambouis" pour la carte 04.
2. **Provider email `/chantier`** : Brevo, **liste séparée** via `NUXT_BREVO_CHANTIER_LIST_ID`. Évite de polluer la liste newsletter.
3. **Validation form** : email regex côté client (même regex que `subscribe.post.ts`), serveur revalide.
4. **Analytics** : 3 events PostHog — `chantier_intent_submitted`, `chantier_intent_succeeded`, `chantier_intent_failed`. Property `has_interest_text` (bool) pour mesurer la qualité du signal sans capter le contenu.

## Self-review checklist

- ✅ **Spec coverage** :
  - Layout 2×2 → Task 4 step 4 (suppression `.qcard-wide`)
  - Carte 04 copy + icône → Task 4 step 3 + 5 + 6
  - Carte 03 icône → Task 3
  - Page /chantier → Task 2
  - Endpoint séparé → Task 1
  - Storage hors newsletter → Task 1 step 3 (`brevoChantierListId` distinct)
  - SEO meta + indexable → Task 2 step 1 (`useSeoMeta`) + Task 1 step 1 (`routeRules` + `prerender`)
  - Pas de mot "formation" dans la copy user-facing → vérifié dans Task 2 et 4 (le mot apparaît uniquement dans `chantier.vue` "Ce ne sera pas une formation longue" — c'est une **négation explicite**, conforme au spec)
- ✅ **Pas de placeholder** : tous les snippets sont prêts à coller.
- ✅ **Type consistency** : `onHomeCta` étendu avec `'chantier'` cohérent entre Task 4 step 1 et step 3.
- ✅ **Code complet** dans chaque step (CSS, SVG, TS).

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-09-home-section-i-cards-icons-and-chantier.md`.** Two execution options :

1. **Subagent-Driven (recommandé)** — Je dispatche un subagent fresh par tâche, review entre les tâches, itération rapide.
2. **Inline Execution** — J'exécute les tâches dans cette session avec checkpoints pour revue.

**Quelle approche tu préfères ?**
