# Migration `/scanner` → `/metiers` + formulaire métier non listé — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supprimer la landing `/scanner`, promouvoir `/metiers` comme entrée unique sur la home (carte 02), et ajouter un formulaire "métier non listé" en bas de `/metiers` qui inscrit en waitlist Brevo dédiée + opt-in newsletter.

**Architecture:** Frontend Nuxt 3 + Vue 3 SFC, backend Nitro server routes. Le formulaire client (`MetiersRequestForm.vue`) appelle un nouvel endpoint Nitro (`server/api/metiers/request.post.ts`) qui clone le pattern Brevo de `server/api/chantier/interest.post.ts` avec un appel double : waitlist `metier_waitlist` (toujours) + newsletter `La Fréquence` (conditionnel sur la checkbox). Le 301 sur `/scanner` est géré via `routeRules` Nuxt.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup lang="ts">`), Nitro (server routes), Brevo Contacts API v3, PostHog (events client), TypeScript strict.

**Référence-spec :** `docs/superpowers/specs/2026-05-10-scanner-to-metiers-design.md`

---

## Prérequis manuels (hors agent)

Avant que le plan ne soit exécuté, **Mathieu doit** :
1. Créer une liste Brevo nommée `metier_waitlist` dans l'admin Brevo (https://app.brevo.com/contact/list-listing).
2. Récupérer son ID numérique (visible dans l'URL `/list/{id}` ou via l'API Brevo).
3. Ajouter dans son `.env` local : `NUXT_BREVO_METIER_WAITLIST_LIST_ID=<id>`
4. Ajouter la même variable d'env dans la prod (Vercel/Netlify/où c'est hébergé).

Ces étapes ne bloquent pas le code — l'endpoint renverra 500 tant que la variable manque, mais le code s'écrit indépendamment.

---

## Conventions à respecter (alignement avec le code existant)

Le code existant `chantier.vue` + `chantier/interest.post.ts` est **la référence directe**. Quelques points où la spec a été affinée pour s'aligner :
- État du formulaire : `'idle' | 'loading' | 'success' | 'error'` (pas `'submitting'`) — pour matcher `chantier.vue`
- `metiers_request_failed.reason` : `'rate_limit' | 'validation' | 'server' | 'network'` (pas `'server_error'`) — pour matcher `chantier_intent_failed`
- Honeypot : input `name="website"`, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`, classe CSS qui le sort du flux (`.ch-honeypot` chez chantier)
- Composable PostHog : `const { capture } = usePosthogEvent()`

---

## Tâches

### Task 1 : Wiring config (env + runtimeConfig)

**Files:**
- Modify: `nuxt.config.ts:13-17` (bloc `runtimeConfig`)
- Modify: `.env.example`

- [ ] **Step 1 : Lire le bloc `runtimeConfig` actuel**

```bash
sed -n '12,20p' nuxt.config.ts
```

Sortie attendue :
```
  runtimeConfig: {
    brevoApiKey: '',
    brevoListId: '',
    brevoChantierListId: '',
    public: {
      posthogKey: '',
    },
  },
```

- [ ] **Step 2 : Ajouter `brevoMetierWaitlistListId`**

Édition de `nuxt.config.ts`, remplacer :
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
par :
```ts
  runtimeConfig: {
    brevoApiKey: '',
    brevoListId: '',
    brevoChantierListId: '',
    brevoMetierWaitlistListId: '',
    public: {
      posthogKey: '',
    },
  },
```

- [ ] **Step 3 : Ajouter la variable dans `.env.example`**

Lire la fin du fichier :
```bash
cat .env.example
```

Ajouter une ligne après `NUXT_BREVO_CHANTIER_LIST_ID=...` :
```
NUXT_BREVO_METIER_WAITLIST_LIST_ID=your-brevo-metier-waitlist-list-id-here
```

- [ ] **Step 4 : Vérifier que le dev server démarre toujours**

```bash
npm run dev &
sleep 10
curl -sI http://localhost:3000/ | head -1
kill %1 2>/dev/null
```

Sortie attendue : `HTTP/1.1 200 OK`

- [ ] **Step 5 : Commit**

```bash
git add nuxt.config.ts .env.example
git commit -m "chore(config): add brevoMetierWaitlistListId runtime config

Préparation pour l'endpoint /api/metiers/request : nouvelle liste Brevo
dédiée à la waitlist des métiers non encore couverts par le scanner."
```

---

### Task 2 : Endpoint serveur `/api/metiers/request`

**Files:**
- Create: `server/api/metiers/request.post.ts`
- Reference: `server/api/chantier/interest.post.ts` (pattern à cloner)

- [ ] **Step 1 : Créer le fichier endpoint**

Crée `server/api/metiers/request.post.ts` avec ce contenu exact :

```ts
// server/api/metiers/request.post.ts
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

async function brevoUpsertContact(opts: {
  email: string
  apiKey: string
  listId: number
  attributes: Record<string, string>
}): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': opts.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: opts.email,
      listIds: [opts.listId],
      attributes: opts.attributes,
      updateEnabled: true,
    }),
  })

  if (res.status === 201) return { ok: true, status: 201, data: null }

  const data = await res.json().catch(() => ({}))

  // Brevo renvoie 400 + code "duplicate_parameter" si le contact existe déjà
  // sur la liste — on le traite comme un succès silencieux.
  if (res.status === 400 && data?.code === 'duplicate_parameter') {
    return { ok: true, status: 400, data }
  }

  return { ok: false, status: res.status, data }
}

export default defineEventHandler(async (event) => {
  const { brevoApiKey, brevoListId, brevoMetierWaitlistListId } = useRuntimeConfig()

  if (!brevoApiKey || !brevoMetierWaitlistListId) {
    throw createError({ statusCode: 500, message: 'Configuration serveur manquante.' })
  }

  const body = await readBody(event)
  const { email, metier, subscribeNewsletter, website } = body ?? {}

  // Honeypot anti-bot : silencieux, pas d'appel Brevo, pas de rate-limit incrémenté
  if (website) {
    return { ok: true }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, message: 'Trop de demandes depuis ton réseau. Réessaie dans une heure.' })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Email invalide.' })
  }

  const safeMetier = typeof metier === 'string'
    ? stripHtml(metier.slice(0, 200))
    : ''

  if (!safeMetier) {
    throw createError({ statusCode: 400, message: 'Le nom du métier est requis.' })
  }

  // Appel #1 : waitlist (toujours)
  const waitlistRes = await brevoUpsertContact({
    email,
    apiKey: brevoApiKey,
    listId: Number(brevoMetierWaitlistListId),
    attributes: {
      SOURCE: 'metier_request',
      REQUESTED_JOB: safeMetier,
    },
  })

  if (!waitlistRes.ok) {
    const message = waitlistRes.data?.message ?? 'Erreur technique, réessaie.'
    throw createError({ statusCode: 500, message })
  }

  // Appel #2 : newsletter (conditionnel)
  if (subscribeNewsletter === true && brevoListId) {
    const newsletterRes = await brevoUpsertContact({
      email,
      apiKey: brevoApiKey,
      listId: Number(brevoListId),
      attributes: { SOURCE: 'metier_request' },
    })
    if (!newsletterRes.ok) {
      // La waitlist (#1) a réussi — on ne fait pas échouer le flow utilisateur
      // sur l'opt-in newsletter. On log et on continue.
      console.error('[metiers/request] newsletter opt-in failed', {
        status: newsletterRes.status,
        data: newsletterRes.data,
      })
    }
  }

  return { ok: true }
})
```

- [ ] **Step 2 : Vérifier que le serveur démarre et que la route est routée**

```bash
npm run dev &
sleep 10
curl -s -X POST http://localhost:3000/api/metiers/request \
  -H "Content-Type: application/json" \
  -d '{}' | head -c 200
echo
```

Sortie attendue : un JSON contenant `"statusCode":500` et `"Configuration serveur manquante"` **OU** `"statusCode":400` et `"Email invalide"` selon l'ordre d'évaluation. Si `NUXT_BREVO_METIER_WAITLIST_LIST_ID` est encore vide dans le `.env` local, ça doit être 500. (C'est le test "endpoint atteint" — le 4xx/5xx est attendu sans config.)

- [ ] **Step 3 : Vérifier le honeypot (silencieux)**

Avec `NUXT_BREVO_METIER_WAITLIST_LIST_ID` configuré dans `.env` local :

```bash
curl -s -X POST http://localhost:3000/api/metiers/request \
  -H "Content-Type: application/json" \
  -d '{"email":"x@y.com","metier":"boucher","website":"http://spam.example"}'
echo
```

Sortie attendue : `{"ok":true}` (silencieux, pas d'appel Brevo réel)

- [ ] **Step 4 : Vérifier validation email vide**

```bash
curl -s -X POST http://localhost:3000/api/metiers/request \
  -H "Content-Type: application/json" \
  -d '{"metier":"boucher"}' | head -c 200
echo
```

Sortie attendue : JSON avec `"statusCode":400` et `"Email invalide"`.

- [ ] **Step 5 : Vérifier validation métier vide**

```bash
curl -s -X POST http://localhost:3000/api/metiers/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","metier":""}' | head -c 200
echo
```

Sortie attendue : JSON avec `"statusCode":400` et `"Le nom du métier est requis"`.

- [ ] **Step 6 : Test bout-en-bout avec une vraie liste de test (optionnel mais recommandé)**

Si Mathieu a une adresse de test (genre `dev+metier@survivant-ia.ch`) :
```bash
curl -s -X POST http://localhost:3000/api/metiers/request \
  -H "Content-Type: application/json" \
  -d '{"email":"dev+metier@survivant-ia.ch","metier":"boucher","subscribeNewsletter":false}'
echo
```
Sortie attendue : `{"ok":true}`. Vérifier dans Brevo admin que le contact apparaît dans `metier_waitlist` avec `REQUESTED_JOB="boucher"`.

`kill %1 2>/dev/null` pour arrêter le dev server.

- [ ] **Step 7 : Commit**

```bash
git add server/api/metiers/request.post.ts
git commit -m "feat(api): add /api/metiers/request endpoint

Endpoint Brevo qui inscrit l'utilisateur en waitlist 'metier_waitlist'
(toujours) + opt-in conditionnel sur la newsletter principale. Pattern
cloné de chantier/interest avec helper brevoUpsertContact extrait pour
le double appel. Honeypot, rate-limit 3/h/IP, validation email + métier."
```

---

### Task 3 : Composant `MetiersRequestForm.vue`

**Files:**
- Create: `app/components/MetiersRequestForm.vue`
- Reference: `app/pages/chantier.vue:1-160` (pattern formulaire + state machine)

- [ ] **Step 1 : Créer le fichier**

Crée `app/components/MetiersRequestForm.vue` avec ce contenu exact :

```vue
<!-- app/components/MetiersRequestForm.vue -->
<script setup lang="ts">
const props = defineProps<{
  prefill?: string
}>()

const { capture } = usePosthogEvent()

const metier = ref(props.prefill ?? '')
const email = ref('')
const subscribeNewsletter = ref(true)
const website = ref('') // honeypot
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMsg = ref('')
const submittedMetier = ref('')
const submittedNewsletter = ref(false)
const focusEventSent = ref(false)

watch(() => props.prefill, (val) => {
  // Sync prefill vers le champ tant que l'utilisateur n'a pas encore tapé.
  // (Idle = pas encore submitted ; on évite d'écraser une saisie en cours
  // en ne prefillant que si le champ est vide ou égal à l'ancien prefill.)
  if (status.value !== 'idle') return
  if (metier.value === '' || metier.value === (props.prefill ?? '')) {
    metier.value = val ?? ''
  }
})

function onFieldFocus() {
  if (focusEventSent.value) return
  focusEventSent.value = true
  capture('metiers_request_form_focused', {})
}

const canSubmit = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
  metier.value.trim().length > 0 &&
  status.value !== 'loading',
)

async function submit() {
  if (!canSubmit.value) return
  status.value = 'loading'
  errorMsg.value = ''

  const trimmedMetier = metier.value.trim()
  const prefilledFromSearch = !!(props.prefill && props.prefill.trim() !== '' && trimmedMetier === props.prefill.trim())

  capture('metiers_request_submitted', {
    metier: trimmedMetier,
    subscribed_newsletter: subscribeNewsletter.value,
    prefilled_from_search: prefilledFromSearch,
  })

  try {
    await $fetch('/api/metiers/request', {
      method: 'POST',
      body: {
        email: email.value,
        metier: trimmedMetier,
        subscribeNewsletter: subscribeNewsletter.value,
        website: website.value,
      },
    })
    submittedMetier.value = trimmedMetier
    submittedNewsletter.value = subscribeNewsletter.value
    status.value = 'success'
    capture('metiers_request_succeeded', {
      metier: trimmedMetier,
      subscribed_newsletter: subscribeNewsletter.value,
    })
  } catch (err: any) {
    status.value = 'error'
    errorMsg.value = err?.data?.message ?? 'Erreur technique, réessaie dans une minute.'
    const reason: 'rate_limit' | 'validation' | 'server' | 'network' =
      err?.statusCode === 429 ? 'rate_limit'
      : err?.statusCode && err.statusCode >= 400 && err.statusCode < 500 ? 'validation'
      : err?.statusCode && err.statusCode >= 500 ? 'server'
      : 'network'
    capture('metiers_request_failed', {
      metier: trimmedMetier,
      reason,
    })
  }
}
</script>

<template>
  <section class="mr-form-section" aria-labelledby="mr-heading">
    <div v-if="status !== 'success'" class="mr-form-wrap">
      <h2 id="mr-heading" class="mr-h2">Ton métier n'est pas dans la liste&nbsp;?</h2>
      <p class="mr-lead">
        Demande-le. Je l'ajoute, et tu es prévenu·e quand son diagnostic est en ligne.
      </p>

      <form class="mr-form" @submit.prevent="submit">
        <!-- Honeypot anti-bot -->
        <input
          v-model="website"
          type="text"
          name="website"
          class="mr-honeypot"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        >

        <div class="mr-field">
          <label class="mr-label" for="mr-metier">Quel métier&nbsp;?</label>
          <input
            id="mr-metier"
            v-model="metier"
            type="text"
            class="mr-input"
            placeholder="Ex. boucher, coach scolaire, paysagiste…"
            maxlength="200"
            :disabled="status === 'loading'"
            required
            @focus="onFieldFocus"
          >
        </div>

        <div class="mr-field">
          <label class="mr-label" for="mr-email">Ton email</label>
          <input
            id="mr-email"
            v-model="email"
            type="email"
            class="mr-input"
            placeholder="ton@email.com"
            :disabled="status === 'loading'"
            required
            @focus="onFieldFocus"
          >
        </div>

        <label class="mr-checkbox">
          <input
            v-model="subscribeNewsletter"
            type="checkbox"
            :disabled="status === 'loading'"
            @focus="onFieldFocus"
          >
          <span>Je veux aussi recevoir <em>La Fréquence</em> (1 email/semaine, désinscription en 1 clic).</span>
        </label>

        <button
          type="submit"
          class="mr-submit"
          :disabled="!canSubmit"
        >
          {{ status === 'loading' ? 'Envoi…' : 'Demander l\'analyse' }}
          <span class="mr-arrow" aria-hidden="true">→</span>
        </button>

        <p v-if="errorMsg" class="mr-error" role="alert">{{ errorMsg }}</p>
      </form>
    </div>

    <div v-else class="mr-success" role="status" aria-live="polite">
      <p class="mr-success-line">
        Reçu. Ton métier <em>«&nbsp;{{ submittedMetier }}&nbsp;»</em> est dans la file.
      </p>
      <p class="mr-success-line">
        Je te préviens dès qu'il est en ligne.
      </p>
      <p v-if="submittedNewsletter" class="mr-success-line mr-success-line--secondary">
        Et bienvenue dans <em>La Fréquence</em>.
      </p>
    </div>
  </section>
</template>

<style scoped>
.mr-form-section {
  max-width: 540px;
  margin: 56px auto 0;
  padding: 32px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.mr-h2 {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 12px;
  letter-spacing: -0.01em;
}

.mr-lead {
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.75;
  margin: 0 0 24px;
}

.mr-form { display: flex; flex-direction: column; gap: 16px; }

.mr-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.mr-field { display: flex; flex-direction: column; gap: 6px; }

.mr-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.mr-input {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: inherit;
  transition: border-color 0.15s ease;
}
.mr-input:focus {
  outline: none;
  border-color: #5BA37A;
}
.mr-input:disabled { opacity: 0.5; }

.mr-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.85rem;
  line-height: 1.4;
  opacity: 0.85;
  cursor: pointer;
}
.mr-checkbox input { margin-top: 3px; cursor: pointer; }
.mr-checkbox em { color: #5BA37A; font-style: italic; }

.mr-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 12px 20px;
  background: #5BA37A;
  color: #0a0a0a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.15s ease;
}
.mr-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.mr-submit:not(:disabled):hover { opacity: 0.85; }

.mr-error {
  font-size: 0.85rem;
  color: #f87171;
  margin: 0;
}

.mr-success {
  text-align: left;
  padding: 24px 0;
}
.mr-success-line {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1.15rem;
  margin: 0 0 8px;
}
.mr-success-line em { font-style: normal; color: #5BA37A; }
.mr-success-line--secondary {
  font-size: 0.95rem;
  opacity: 0.75;
  margin-top: 16px;
}
</style>
```

- [ ] **Step 2 : Vérifier que le composant compile (sans usage dans une page pour l'instant — auto-import Nuxt)**

```bash
npm run dev &
sleep 10
curl -sI http://localhost:3000/ | head -1
kill %1 2>/dev/null
```

Sortie attendue : `HTTP/1.1 200 OK` (Nuxt aurait planté si le SFC avait une erreur de syntaxe — auto-import scanne `app/components/`).

- [ ] **Step 3 : Commit**

```bash
git add app/components/MetiersRequestForm.vue
git commit -m "feat(metiers): add MetiersRequestForm component

Formulaire 'métier non listé' avec prefill depuis recherche, opt-in
newsletter coché par défaut, état succès/erreur, honeypot, et tracking
PostHog (focus, submit, succeeded, failed). Pas encore branché — sera
intégré dans /metiers à la task suivante."
```

---

### Task 4 : Intégration dans `/metiers` + reformulation de l'empty-state

**Files:**
- Modify: `app/pages/metiers/index.vue:130-141` (empty-state + ancien metiers-cta)

- [ ] **Step 1 : Lire le bloc à remplacer**

```bash
sed -n '128,142p' app/pages/metiers/index.vue
```

Sortie attendue (le bloc actuel) :
```
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
```

- [ ] **Step 2 : Remplacer le bloc**

Édite `app/pages/metiers/index.vue`, remplace exactement :
```vue
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
```
par :
```vue
    <p v-if="totalCount === 0" class="empty-state">
      Aucun métier trouvé pour «&nbsp;{{ searchQuery }}&nbsp;». Demande-le ci-dessous, je l'analyse.
    </p>

    <MetiersRequestForm :prefill="searchQuery" />
```

- [ ] **Step 3 : Supprimer les styles CSS inutilisés `.metiers-cta`, `.cta-text`, `.cta-link`**

```bash
grep -n "metiers-cta\|cta-text\|cta-link" app/pages/metiers/index.vue
```

Repère les lignes des règles CSS scoped pour ces classes (probablement dans le bloc `<style scoped>`) et **supprime-les**. Si `.empty-state` a un `margin-bottom` qui dépendait du contexte, le laisser tel quel (il fonctionne toujours avec le formulaire en dessous).

- [ ] **Step 4 : Vérifier visuellement**

```bash
npm run dev &
sleep 10
```

- Ouvrir `http://localhost:3000/metiers` dans le navigateur
- Scroller en bas → voir le formulaire "Ton métier n'est pas dans la liste ?"
- Taper "metierbidonquinexisteras" dans la barre de recherche → voir l'empty-state reformulé + formulaire prefillé avec "metierbidonquinexisteras"
- Effacer la recherche → empty-state disparaît, formulaire revient à vide (via le `watch` sur `prefill`)
- Soumettre avec un email valide + checkbox cochée (mode test, à NE PAS faire en prod) → état succès attendu

```bash
kill %1 2>/dev/null
```

- [ ] **Step 5 : Commit**

```bash
git add app/pages/metiers/index.vue
git commit -m "feat(metiers): wire MetiersRequestForm into /metiers page

Le formulaire remplace l'ancien metiers-cta qui pointait vers /scanner,
et l'empty-state est reformulé pour pointer vers le formulaire (prefill
automatique depuis la recherche)."
```

---

### Task 5 : Nouvelle icône SVG "loupe sur grille" pour la carte 02

**Files:**
- Modify: `app/pages/index.vue:84-90` (bloc `<div class="qcard-icon">` de la carte 02)

Cette task est isolée de la modification de copy (Task 6) pour qu'on commit l'icône seule et qu'on puisse la reverter facilement si elle ne plaît pas.

- [ ] **Step 1 : Lire le SVG actuel (sablier)**

```bash
sed -n '83,90p' app/pages/index.vue
```

Sortie attendue (les classes : `ic-hourglass`, `frame`, `sand-top`, `sand-bot`).

- [ ] **Step 2 : Remplacer le SVG sablier par une loupe sur grille**

Édite `app/pages/index.vue`, remplace exactement :
```vue
              <div class="qcard-icon">
                <svg viewBox="0 0 56 56" class="ic-hourglass" aria-hidden="true">
                  <path class="frame" d="M 14 8 L 42 8 M 14 48 L 42 48 M 16 8 L 16 14 L 28 26 M 40 8 L 40 14 L 28 26 M 28 30 L 16 42 L 16 48 M 28 30 L 40 42 L 40 48"/>
                  <path class="sand-top" d="M 17 10 L 39 10 L 28 26 Z"/>
                  <path class="sand-bot" d="M 28 30 L 39 46 L 17 46 Z"/>
                </svg>
              </div>
```
par :
```vue
              <div class="qcard-icon">
                <svg viewBox="0 0 56 56" class="ic-magnifier-grid" aria-hidden="true">
                  <line class="grid" x1="8" y1="18" x2="34" y2="18"/>
                  <line class="grid" x1="8" y1="28" x2="34" y2="28"/>
                  <line class="grid" x1="8" y1="38" x2="34" y2="38"/>
                  <line class="grid" x1="14" y1="12" x2="14" y2="44"/>
                  <line class="grid" x1="24" y1="12" x2="24" y2="44"/>
                  <circle class="lens" cx="36" cy="36" r="10"/>
                  <line class="handle" x1="43.5" y1="43.5" x2="50" y2="50"/>
                </svg>
              </div>
```

- [ ] **Step 3 : Ajouter le style CSS pour `.ic-magnifier-grid`**

Les styles d'icônes vivent en CSS scoped dans `app/pages/index.vue` lui-même, blocs commentés `/* ── <Nom> icon (carte 0X) — … ────── */` autour des lignes 395-490. Repère le bloc `.ic-hourglass` (ligne ~415-449) — c'est celui qu'on remplace conceptuellement.

**Stratégie** : on **remplace** les styles `.ic-hourglass` (ainsi que les keyframes `sand-deplete` et `sand-fill` qui ne servent plus à rien d'autre) par les styles `.ic-magnifier-grid`. Convention visuelle alignée sur les voisins : `stroke-width: 1.8`, `stroke-linecap: round`, `stroke-linejoin: round`, animation subtile pour rester dans la grammaire des cartes 01/03/04.

Édite `app/pages/index.vue`, remplace exactement le bloc :

```css
/* ── Hourglass icon (carte 02) — sablier simple ────── */
.ic-hourglass { width: 100%; height: 100%; }
.ic-hourglass .frame {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ic-hourglass .sand-top {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: center top;
  animation: sand-deplete 5s linear infinite;
}
@keyframes sand-deplete {
  0%, 5%  { transform: scaleY(1);    opacity: 1; }
  85%     { transform: scaleY(0.02); opacity: 1; }
  90%     { transform: scaleY(0);    opacity: 0; }
  96%     { transform: scaleY(1);    opacity: 0; }
  100%    { transform: scaleY(1);    opacity: 1; }
}
.ic-hourglass .sand-bot {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: sand-fill 5s linear infinite;
}
@keyframes sand-fill {
  0%, 5%  { transform: scaleY(0); opacity: 1; }
  85%     { transform: scaleY(1); opacity: 1; }
  90%     { transform: scaleY(1); opacity: 0; }
  96%     { transform: scaleY(0); opacity: 0; }
  100%    { transform: scaleY(0); opacity: 1; }
}
```

par :

```css
/* ── Magnifier-on-grid icon (carte 02) — recherche dans la liste ────── */
.ic-magnifier-grid { width: 100%; height: 100%; }
.ic-magnifier-grid .grid {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  opacity: 0.35;
}
.ic-magnifier-grid .lens,
.ic-magnifier-grid .handle {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ic-magnifier-grid .lens {
  transform-box: fill-box;
  transform-origin: center;
  animation: lens-scan 4s ease-in-out infinite;
}
.ic-magnifier-grid .handle {
  transform-box: fill-box;
  transform-origin: top left;
  animation: handle-scan 4s ease-in-out infinite;
}
@keyframes lens-scan {
  0%, 100% { transform: translate(0, 0); }
  50%      { transform: translate(-10px, -10px); }
}
@keyframes handle-scan {
  0%, 100% { transform: translate(0, 0); }
  50%      { transform: translate(-10px, -10px); }
}
```

L'animation fait dériver doucement la loupe (lentille + manche ensemble) sur la grille — discret, ~4s loop, cohérent avec les rythmes des autres icônes (3-5s). `prefers-reduced-motion` est globalement géré ailleurs dans le code (cf. le `onMounted` du hero) ; si tu veux être strict, ajoute :
```css
@media (prefers-reduced-motion: reduce) {
  .ic-magnifier-grid .lens,
  .ic-magnifier-grid .handle { animation: none; }
}
```
(optionnel, pas bloquant).

- [ ] **Step 4 : Vérifier visuellement**

```bash
npm run dev &
sleep 10
```

Ouvrir `http://localhost:3000/` → la carte 02 doit montrer une loupe sur grille (pas un sablier). Stroke 2px, lentille à droite, grille à gauche.

```bash
kill %1 2>/dev/null
```

- [ ] **Step 5 : Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(home): swap card 02 icon to magnifier-grid

Le sablier (diagnostic flash 10s) ne sert plus la promesse 'parcourir 196
métiers'. Loupe sur grille — l'utilisateur cherche, il ne mesure plus le
temps. Stroke 2px, viewBox 56×56, cohérent avec le set existant."
```

---

### Task 6 : Carte 02 — copy + lien + handler + reformulation `metiers-link-bar`

**Files:**
- Modify: `app/pages/index.vue:20` (type union `onHomeCta`)
- Modify: `app/pages/index.vue:82-94` (carte 02 lien, copy, data-attr)
- Modify: `app/pages/index.vue:138-140` (metiers-link-bar copy)

- [ ] **Step 1 : Lire la carte 02 actuelle**

```bash
sed -n '82,94p' app/pages/index.vue
```

- [ ] **Step 2 : Remplacer le bloc complet de la carte 02**

Édite `app/pages/index.vue`, remplace exactement :
```vue
            <NuxtLink to="/scanner" class="qcard" data-attr="hero-cta-scanner" @click="onHomeCta('scanner')">
              <span class="qcard-num">02 / Diagnostic flash</span>
              <div class="qcard-icon">
                <svg viewBox="0 0 56 56" class="ic-magnifier-grid" aria-hidden="true">
                  <line class="grid" x1="8" y1="18" x2="34" y2="18"/>
                  <line class="grid" x1="8" y1="28" x2="34" y2="28"/>
                  <line class="grid" x1="8" y1="38" x2="34" y2="38"/>
                  <line class="grid" x1="14" y1="12" x2="14" y2="44"/>
                  <line class="grid" x1="24" y1="12" x2="24" y2="44"/>
                  <circle class="lens" cx="36" cy="36" r="10"/>
                  <line class="handle" x1="43.5" y1="43.5" x2="50" y2="50"/>
                </svg>
              </div>
              <h3 class="qcard-question">Veux-tu cartographier <strong>l'IA dans ton métier</strong>&nbsp;?</h3>
              <p class="qcard-meta">Le Scanner : diagnostic IA en 10 secondes. Gratuit.</p>
              <span class="qcard-arrow">Tester mon métier</span>
            </NuxtLink>
```
par :
```vue
            <NuxtLink to="/metiers" class="qcard" data-attr="hero-cta-metiers" @click="onHomeCta('metiers')">
              <span class="qcard-num">02 / Diagnostic par métier</span>
              <div class="qcard-icon">
                <svg viewBox="0 0 56 56" class="ic-magnifier-grid" aria-hidden="true">
                  <line class="grid" x1="8" y1="18" x2="34" y2="18"/>
                  <line class="grid" x1="8" y1="28" x2="34" y2="28"/>
                  <line class="grid" x1="8" y1="38" x2="34" y2="38"/>
                  <line class="grid" x1="14" y1="12" x2="14" y2="44"/>
                  <line class="grid" x1="24" y1="12" x2="24" y2="44"/>
                  <circle class="lens" cx="36" cy="36" r="10"/>
                  <line class="handle" x1="43.5" y1="43.5" x2="50" y2="50"/>
                </svg>
              </div>
              <h3 class="qcard-question">Veux-tu voir <strong>où ton métier en est face à l'IA</strong>&nbsp;?</h3>
              <p class="qcard-meta">196 métiers analysés. Cherche le tien dans la liste.</p>
              <span class="qcard-arrow">Trouver mon métier</span>
            </NuxtLink>
```

- [ ] **Step 3 : Mettre à jour le type de `onHomeCta`**

Édite `app/pages/index.vue:20`, remplace exactement :
```ts
function onHomeCta(cta: 'scanner' | 'rapports' | 'newsletter' | 'outils' | 'chantier') {
```
par :
```ts
function onHomeCta(cta: 'metiers' | 'rapports' | 'newsletter' | 'outils' | 'chantier') {
```

- [ ] **Step 4 : Reformuler la `metiers-link-bar`**

Édite `app/pages/index.vue` (autour de la ligne 138), remplace exactement :
```vue
        <NuxtLink to="/metiers" class="metiers-link">
          Parcourir les métiers couverts par le Scanner (196) →
        </NuxtLink>
```
par :
```vue
        <NuxtLink to="/metiers" class="metiers-link">
          Parcourir les 196 métiers analysés →
        </NuxtLink>
```

- [ ] **Step 5 : Vérifier qu'il n'y a plus aucun callsite avec `'scanner'`**

```bash
grep -n "onHomeCta('scanner')" app/pages/index.vue
```

Sortie attendue : (vide). Si non vide, corrige les callsites résiduels en remplaçant par `'metiers'` ou en les supprimant si dans un bloc qui doit disparaître (ex: le `HomeDiagnosticTeaser` utilise `@click="onHomeCta('scanner')"` mais sera retiré en Task 7 — c'est OK qu'il reste là pour ce commit).

**Note** : Si `HomeDiagnosticTeaser` est encore dans `index.vue` à ce moment, le code TS plantera parce que `'scanner'` n'est plus dans l'union. C'est attendu. **Avance directement à la Task 7 sans tester le build entre les deux**, ou bien skippe la modif du type ici et reviens-y en Task 7 après suppression du teaser.

→ **Décision** : on **garde** la modif du type ici (cohérente avec la sémantique de cette task) et on supprime `HomeDiagnosticTeaser` immédiatement à la Task 7 (les deux commits sont rapprochés). En attendant le commit Task 7, le build sera cassé sur cette ligne — c'est temporaire et acceptable.

- [ ] **Step 6 : Commit (build TS partiellement cassé jusqu'à la Task 7 — assumé)**

```bash
git add app/pages/index.vue
git commit -m "feat(home): card 02 → /metiers, reword metiers-link-bar

Carte 02 repointée vers /metiers (au lieu de /scanner) avec nouvelle copy
('Veux-tu voir où ton métier en est face à l'IA ?'), nouveau data-attr,
et nouveau handler onHomeCta('metiers'). L'union TS exclut désormais
'scanner' — HomeDiagnosticTeaser sera retiré dans le commit suivant."
```

---

### Task 7 : Suppression de `HomeDiagnosticTeaser`

**Files:**
- Modify: `app/pages/index.vue:158` (suppression de `<HomeDiagnosticTeaser />` + import implicite via auto-import — pas de import statement à supprimer)
- Delete: `app/components/HomeDiagnosticTeaser.vue`

- [ ] **Step 1 : Repérer l'usage de `HomeDiagnosticTeaser` dans la home**

```bash
grep -n "HomeDiagnosticTeaser" app/pages/index.vue
```

Sortie attendue (env. ligne 158) :
```
<HomeDiagnosticTeaser @click="onHomeCta('scanner')" />
```

- [ ] **Step 2 : Supprimer la balise + son commentaire de section**

Édite `app/pages/index.vue`, repère le bloc :
```vue
    <SectionDivider />

    <!-- ── SCANNER TEASER ─────────────────────────── -->
    <div class="container">
      <HomeDiagnosticTeaser @click="onHomeCta('scanner')" />
    </div>

    <!-- ── MASTHEAD III — COMPÉTENCES ───────────── -->
```

Remplace par (suppression du bloc teaser, conservation de `SectionDivider` et `MASTHEAD III`) :
```vue
    <SectionDivider />

    <!-- ── MASTHEAD III — COMPÉTENCES ───────────── -->
```

- [ ] **Step 3 : Vérifier qu'aucune autre référence ne traîne**

```bash
grep -rn "HomeDiagnosticTeaser" app/ 2>/dev/null
```

Sortie attendue : seulement le fichier composant lui-même `app/components/HomeDiagnosticTeaser.vue` (qu'on va supprimer ci-dessous).

- [ ] **Step 4 : Supprimer le fichier composant**

```bash
rm app/components/HomeDiagnosticTeaser.vue
```

- [ ] **Step 5 : Vérifier qu'aucune référence à `'scanner'` dans `onHomeCta` ne traîne**

```bash
grep -n "onHomeCta('scanner')\|onHomeCta(\"scanner\")" app/ -r 2>/dev/null
```

Sortie attendue : (vide).

- [ ] **Step 6 : Vérifier que le build passe**

```bash
npm run dev &
sleep 12
curl -sI http://localhost:3000/ | head -1
kill %1 2>/dev/null
```

Sortie attendue : `HTTP/1.1 200 OK`. Si le serveur a une erreur TS, vérifier qu'il n'y a plus de callsite `'scanner'` dans le code TS.

- [ ] **Step 7 : Commit**

```bash
git add app/pages/index.vue
git rm app/components/HomeDiagnosticTeaser.vue
git commit -m "refactor(home): remove HomeDiagnosticTeaser

Le teaser pointait vers /scanner, qui disparaît au profit de /metiers.
La carte 02 et la metiers-link-bar suffisent maintenant à pousser le
diagnostic — pas besoin de redondance."
```

---

### Task 8 : 301 redirect `/scanner` + suppression de la landing + sitemap

**Files:**
- Modify: `nuxt.config.ts` (bloc `routeRules` : ajouter 301, retirer entrée sitemap pour `/scanner`)
- Delete: `app/pages/scanner/index.vue`

- [ ] **Step 1 : Lire le bloc `routeRules` actuel**

```bash
sed -n '40,58p' nuxt.config.ts
```

Sortie attendue : visualiser les lignes existantes pour `/scanner` et `/scanner/**` dans le sitemap.

- [ ] **Step 2 : Modifier `routeRules`**

Édite `nuxt.config.ts`. Repère la ligne :
```ts
    '/scanner': { sitemap: { priority: 0.9, changefreq: 'monthly' } },
```
et **remplace** par :
```ts
    '/scanner': { redirect: { to: '/metiers', statusCode: 301 } },
```

**Conserve** la ligne suivante telle quelle (les rapports par métier doivent rester indexés au sitemap) :
```ts
    '/scanner/**': { sitemap: { priority: 0.8, changefreq: 'monthly' } },
```

- [ ] **Step 3 : Supprimer `app/pages/scanner/index.vue`**

```bash
rm app/pages/scanner/index.vue
```

- [ ] **Step 4 : Vérifier la 301**

```bash
npm run dev &
sleep 12
curl -sI http://localhost:3000/scanner | head -2
```

Sortie attendue :
```
HTTP/1.1 301 Moved Permanently
location: /metiers
```

(L'ordre des headers et la casse peut varier ; vérifier surtout `301` et `location: /metiers`.)

- [ ] **Step 5 : Vérifier qu'un rapport par métier répond toujours en 200**

Récupérer un slug existant :
```bash
curl -sI http://localhost:3000/scanner/boucher | head -1
```

(Ou tout autre slug listé dans `app/data/jobs.ts`.) Sortie attendue : `HTTP/1.1 200 OK`.

```bash
kill %1 2>/dev/null
```

- [ ] **Step 6 : Commit**

```bash
git add nuxt.config.ts
git rm app/pages/scanner/index.vue
git commit -m "feat(routing): 301 /scanner → /metiers, drop scanner landing

La landing /scanner (avec recherche + FAQ) n'a plus de raison d'être —
/metiers la remplace mieux. Les rapports /scanner/[slug] restent intacts
et indexés au sitemap (actif SEO long-tail). 301 sur /scanner pour
préserver le jus SEO de l'ancienne URL."
```

---

### Task 9 : Smoke test final + build production

- [ ] **Step 1 : Build production complet**

```bash
npm run build 2>&1 | tail -30
```

Sortie attendue : pas d'erreur TS, pas d'erreur de prerender. Le build doit prerender tous les `/scanner/[slug]` (visibles dans le tail).

- [ ] **Step 2 : Vérifier le sitemap généré**

```bash
npm run dev &
sleep 12
curl -s http://localhost:3000/sitemap.xml | grep -E "<loc>.*(scanner|metiers).*</loc>" | head -10
```

Sortie attendue : présence de `https://survivant-ia.ch/metiers`, présence de `https://survivant-ia.ch/scanner/<slug>` pour les rapports, **absence** de `https://survivant-ia.ch/scanner` (l'ancienne landing).

- [ ] **Step 3 : Smoke test E2E manuel**

Ouvrir le navigateur sur `http://localhost:3000/` et vérifier :

1. **Home** : 4 cartes hero. Carte 02 = "Diagnostic par métier" avec icône loupe-sur-grille, copy "Veux-tu voir où ton métier en est face à l'IA ?".
2. **Clic sur carte 02** → atterrit sur `/metiers`.
3. **Plus bas sur home** : la `metiers-link-bar` dit "Parcourir les 196 métiers analysés →".
4. **Plus aucune trace** de "Diagnostic flash" ni du `HomeDiagnosticTeaser` (pas de bloc "Maîtriser l'IA au travail commence par un diagnostic").
5. **`/metiers`** : recherche "tueur de monstres" (ou n'importe quoi qui matche zéro) → empty-state reformulé + formulaire prefillé avec la query.
6. **Soumettre** le formulaire avec un email de test → état succès affiché ("Reçu. Ton métier «&nbsp;…&nbsp;» est dans la file. Je te préviens dès qu'il est en ligne. Et bienvenue dans La Fréquence.").
7. **Décocher** la checkbox newsletter et resoumettre depuis un autre onglet (rate-limit 3/h sur l'IP — attention à ne pas se faire bloquer pendant le test) → état succès **sans** la ligne "Et bienvenue dans La Fréquence".
8. **Cliquer sur une carte de métier** dans `/metiers` → atterrit sur `/scanner/<slug>` (200 OK, le rapport s'affiche normalement).
9. **Visiter directement `/scanner`** dans une nouvelle fenêtre → redirigé en 301 vers `/metiers`.

```bash
kill %1 2>/dev/null
```

- [ ] **Step 4 : Vérifier dans Brevo admin (manuel)**

Si Mathieu a fait des soumissions de test, ouvrir Brevo admin :
- Liste `metier_waitlist` → contact présent avec attribut `REQUESTED_JOB="…"` et `SOURCE="metier_request"`.
- Liste newsletter principale → contact présent (si checkbox cochée) avec `SOURCE="metier_request"`.

- [ ] **Step 5 : Vérifier dans PostHog (manuel)**

Ouvrir le dashboard PostHog → onglet Events. Vérifier :
- `metiers_request_form_focused` : 1 occurrence par session de test
- `metiers_request_submitted` : avec props `metier`, `subscribed_newsletter`, `prefilled_from_search`
- `metiers_request_succeeded` : suit chaque submitted réussi
- (Pas de `metiers_request_failed` sauf si erreur volontaire)

- [ ] **Step 6 : Commit final (si non-code à mettre — sinon skip)**

Pas de commit attendu ici sauf si des ajustements résiduels (CSS, copy) ont été nécessaires pendant le smoke test. Si oui :

```bash
git add <fichiers ajustés>
git commit -m "chore: smoke test polish — <description précise>"
```

---

## Résumé de la séquence de commits attendus

1. `chore(config): add brevoMetierWaitlistListId runtime config`
2. `feat(api): add /api/metiers/request endpoint`
3. `feat(metiers): add MetiersRequestForm component`
4. `feat(metiers): wire MetiersRequestForm into /metiers page`
5. `feat(home): swap card 02 icon to magnifier-grid`
6. `feat(home): card 02 → /metiers, reword metiers-link-bar`
7. `refactor(home): remove HomeDiagnosticTeaser`
8. `feat(routing): 301 /scanner → /metiers, drop scanner landing`
9. (optionnel) `chore: smoke test polish — …`

Soit 8 commits obligatoires + 1 optionnel. Chaque commit laisse l'app **fonctionnelle** sauf le commit 6 qui est temporairement cassé en TS jusqu'au commit 7 (dépendance assumée et documentée dans la Task 6).
