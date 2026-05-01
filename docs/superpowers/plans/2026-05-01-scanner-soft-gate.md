# Scanner Soft Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verrouiller TRAJECTOIRE + ACTIONS du scanner derrière une inscription email à La Fréquence, avec gate universel adapté par statut, scramble spectaculaire au déverrouillage, localStorage pour récompenser les visiteurs récurrents.

**Architecture:** Un composable `useScannerUnlock` isole la logique localStorage (SSR-safe). Un nouveau composant `ScannerGate.vue` rend l'encart verrouillé + le mini-form. La page `scanner.vue` orchestre une machine d'états à 5 valeurs (`idle | scanning | gated | unlocking | unlocked`) et étend l'animation de scan d'une phase "classifié" + d'une révélation post-déverrouillage. Backend `subscribe.post.ts` accepte source/job_slug/job_status + honeypot anti-bot.

**Tech Stack:** Nuxt 4 + Vue 3 (composition API + `<script setup>`), TypeScript, PostHog (`usePosthogEvent` composable existant), Brevo (via `/api/subscribe`), pas de framework de test → validation manuelle via `npm run dev`.

**Spec source :** `docs/superpowers/specs/2026-05-01-scanner-soft-gate-design.md`

**File map:**
- `app/composables/useScannerUnlock.ts` — **CRÉER** : flag localStorage SSR-safe
- `app/components/ScannerGate.vue` — **CRÉER** : encart verrouillé + mini-form + soumission
- `app/pages/scanner.vue` — **MODIFIER** : machine d'états, phase `gated`, scramble TRAJECTOIRE/ACTIONS, intégration ScannerGate
- `server/api/subscribe.post.ts` — **MODIFIER** : honeypot, whitelist source, attributes Brevo enrichis
- `app/pages/confidentialite.vue` — **MODIFIER** : ajouter paragraphe localStorage

---

## Task 1: Composable `useScannerUnlock`

**Files:**
- Create: `app/composables/useScannerUnlock.ts`

- [ ] **Step 1: Créer le fichier composable**

```ts
// app/composables/useScannerUnlock.ts
const STORAGE_KEY = 'hasUnlockedScanner'

export function useScannerUnlock() {
  const isUnlocked = ref(false)

  onMounted(() => {
    try {
      isUnlocked.value = localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      // Safari private mode / disabled storage : on reste à false, pas de plantage
      isUnlocked.value = false
    }
  })

  function markUnlocked() {
    isUnlocked.value = true
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Si localStorage indisponible, on garde l'état en mémoire pour la session
    }
  }

  return { isUnlocked, markUnlocked }
}
```

- [ ] **Step 2: Vérifier qu'aucune erreur TypeScript ne saute**

Run: `cd /Users/mathieu/Documents/survivor && npx nuxt prepare && npx vue-tsc --noEmit 2>&1 | head -30`
Expected: pas d'erreur sur `useScannerUnlock.ts`. Si erreur "Cannot find name 'ref'" ou similaire, c'est que les auto-imports Nuxt ne sont pas réglés — vérifier `nuxt.config.ts` (les composables sont auto-importés par défaut depuis `app/composables/`).

- [ ] **Step 3: Commit**

```bash
git add app/composables/useScannerUnlock.ts
git commit -m "$(cat <<'EOF'
feat(scanner): add useScannerUnlock composable

Stocke un flag localStorage hasUnlockedScanner pour mémoriser
qu'un visiteur a déjà fourni son email lors d'un précédent scan.
SSR-safe (ref(false) côté serveur, hydratation onMounted).
Tolérant aux modes navigation privée bloquant localStorage.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Backend `subscribe.post.ts` — honeypot + source + job attrs

**Files:**
- Modify: `server/api/subscribe.post.ts`

- [ ] **Step 1: Lire le fichier actuel pour repérer les zones à modifier**

Run: `cat server/api/subscribe.post.ts`
Repérer les blocs : extraction du body (ligne 29-30), validations (37-51), payload Brevo (53-69).

- [ ] **Step 2: Remplacer l'extraction du body et ajouter le honeypot**

Remplacer la ligne actuelle :
```ts
  const body = await readBody(event)
  const { prenom, email, consent } = body ?? {}
```

Par :
```ts
  const body = await readBody(event)
  const { prenom, email, consent, source, job_slug, job_status, website } = body ?? {}

  // Honeypot anti-bot : silencieux, pas d'appel Brevo, pas de rate-limit incrémenté
  if (website) {
    return { ok: true }
  }
```

- [ ] **Step 3: Ajouter la whitelist source juste avant l'appel à fetch Brevo**

Insérer entre la validation `consent` (ligne 49-51) et l'appel `fetch` (ligne 53) :
```ts
  const allowedSources = ['website', 'scanner_gate']
  const safeSource = typeof source === 'string' && allowedSources.includes(source)
    ? source
    : 'website'
```

- [ ] **Step 4: Enrichir les attributes Brevo**

Remplacer le bloc `attributes` actuel :
```ts
      attributes: {
        PRENOM: stripHtml(prenom.trim()),
        CONSENT: true,
        SOURCE: 'website',
      },
```

Par :
```ts
      attributes: {
        PRENOM: stripHtml(prenom.trim()),
        CONSENT: true,
        SOURCE: safeSource,
        ...(typeof job_slug === 'string' && job_slug
          ? { JOB_SLUG: stripHtml(job_slug.slice(0, 80)) }
          : {}),
        ...(typeof job_status === 'string' && job_status
          ? { JOB_STATUS: stripHtml(job_status.slice(0, 30)) }
          : {}),
      },
```

- [ ] **Step 5: Lancer le dev server et tester avec curl**

Terminal 1: `cd /Users/mathieu/Documents/survivor && npm run dev`

Terminal 2 (attendre que le serveur soit ready) :

Test 1 — soumission scanner_gate avec job (devrait créer un contact Brevo si la clé est configurée) :
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"prenom":"TestGate","email":"test+gate@example.com","consent":true,"source":"scanner_gate","job_slug":"comptable","job_status":"danger"}'
```
Expected: `{"ok":true}` (ou `Configuration serveur manquante` en dev sans clé Brevo — c'est OK, le contrôle de validation a fonctionné).

Test 2 — honeypot rempli (doit retourner ok silencieux SANS appel Brevo) :
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Bot","email":"bot@spam.com","consent":true,"website":"http://evil.com"}'
```
Expected: `{"ok":true}` immédiat. Vérifier dans Brevo dashboard que `bot@spam.com` n'apparaît pas.

Test 3 — source malicieuse (doit fallback à 'website') :
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Test","email":"test+source@example.com","consent":true,"source":"<script>alert(1)</script>"}'
```
Expected: `{"ok":true}`. Le contact Brevo aura `SOURCE: 'website'` (pas l'injection).

Test 4 — régression NewsletterForm (sans source) :
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"prenom":"TestNewsletter","email":"test+newsletter@example.com","consent":true}'
```
Expected: `{"ok":true}`. Le contact Brevo aura `SOURCE: 'website'` (fallback).

- [ ] **Step 6: Arrêter le dev server, commit**

```bash
git add server/api/subscribe.post.ts
git commit -m "$(cat <<'EOF'
feat(api): subscribe accepte source, job_slug, job_status, honeypot

- Honeypot anti-bot (champ website) : retour silencieux 200 sans
  appel Brevo si rempli.
- Whitelist source ('website' | 'scanner_gate'), fallback 'website'
  si valeur arbitraire.
- Attributes Brevo enrichis : SOURCE configurable, JOB_SLUG et
  JOB_STATUS optionnels (max 80/30 chars, strip-html).
- Rétrocompatible avec NewsletterForm (pas de source = 'website').

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Privacy & SEO copy updates

**Files:**
- Modify: `app/pages/scanner.vue` (useSeoMeta lignes 8-16, FAQ Q3 lignes 67-71, FAQ DOM lignes 711-717)
- Modify: `app/pages/confidentialite.vue` (ajouter paragraphe)

- [ ] **Step 1: Mettre à jour `useSeoMeta` dans scanner.vue**

Remplacer le bloc `useSeoMeta` (lignes 8-16) par :
```ts
useSeoMeta({
  title: 'Scanner IA — Tester si mon métier est menacé par l\'IA | Survivant-IA',
  description: 'Score gratuit en 10 secondes. Plan d\'action complet sur inscription à La Fréquence. Données 2026 (Tufts, McKinsey, WEF).',
  ogTitle: 'Scanner IA — Mon métier est-il menacé par l\'IA ?',
  ogDescription: 'Score gratuit en 10 secondes. Plan d\'action complet sur inscription. Données 2026 (Tufts, McKinsey, WEF). Survivant-IA.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Mon métier est-il menacé par l\'IA ?',
  twitterDescription: 'Score gratuit en 10 secondes. Plan d\'action sur inscription. Données 2026 (Tufts, McKinsey, WEF).',
})
```

- [ ] **Step 2: Mettre à jour la FAQ Q3 du JSON-LD dans scanner.vue**

Remplacer le bloc Q3 actuel (lignes 65-72) :
```ts
            {
              '@type': 'Question',
              name: 'Mes données personnelles sont-elles enregistrées ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Non. Le scanner ne collecte aucune donnée personnelle. Aucune inscription n\'est nécessaire. Seuls des événements anonymes d\'usage sont transmis pour améliorer l\'outil.',
              },
            },
```

Par :
```ts
            {
              '@type': 'Question',
              name: 'Mes données personnelles sont-elles enregistrées ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Le score, l\'horizon et le statut sont accessibles sans inscription. Le plan d\'action complet (trajectoire et 3 axes pratiques) est réservé aux abonnés de la newsletter La Fréquence — l\'inscription se fait avec votre email et votre prénom, conformément à notre politique de confidentialité.',
              },
            },
```

- [ ] **Step 3: Mettre à jour la FAQ Q3 dans le DOM (template) de scanner.vue**

Repérer la 3e `<details class="faq-item">` (lignes 711-717). Remplacer son contenu par :
```html
          <details class="faq-item">
            <summary class="faq-question">
              <span class="faq-q-text">Mes données personnelles sont-elles enregistrées ?</span>
              <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
            </summary>
            <p class="faq-answer">Le score, l'horizon et le statut sont accessibles sans inscription. Le plan d'action complet (trajectoire et 3 axes pratiques) est réservé aux abonnés de la newsletter La Fréquence — l'inscription se fait avec votre email et votre prénom, conformément à notre <NuxtLink to="/confidentialite">politique de confidentialité</NuxtLink>.</p>
          </details>
```

- [ ] **Step 4: Lire la page confidentialite.vue pour repérer où ajouter le paragraphe**

Run: `cat app/pages/confidentialite.vue | head -80`
Identifier une section logique (probablement vers les "données collectées" ou "stockage local"). Si une section existe déjà sur les cookies/stockage, ajouter le paragraphe à la fin de cette section. Sinon, ajouter une nouvelle sous-section.

- [ ] **Step 5: Ajouter le paragraphe localStorage dans confidentialite.vue**

Insérer dans la section pertinente le paragraphe suivant (adapter le balisage HTML/markdown selon la structure de la page) :

```html
<h3>Indicateur technique du scanner</h3>
<p>
  Lorsque vous déverrouillez le rapport complet du scanner via votre email,
  nous stockons un indicateur technique (<code>hasUnlockedScanner</code>) dans
  le <code>localStorage</code> de votre navigateur. Cet indicateur ne contient
  aucune donnée personnelle — il sert uniquement à éviter de vous redemander
  votre email lors de visites ultérieures depuis le même navigateur. Vous
  pouvez le supprimer à tout moment via les paramètres de votre navigateur
  (section "Données du site" ou "Stockage local").
</p>
```

- [ ] **Step 6: Vérifier dans le navigateur**

Terminal: `npm run dev`
Browser:
- `http://localhost:3000/scanner` — déplier la 3e question de la FAQ → vérifier la nouvelle réponse + le lien `politique de confidentialité` cliquable.
- `view-source:http://localhost:3000/scanner` → chercher `"plan d'action complet"` dans le JSON-LD ; doit apparaître à la fois dans la balise `<title>` (no), dans `<meta name="description">` et dans le bloc `<script type="application/ld+json">` (Q3).
- `http://localhost:3000/confidentialite` → vérifier le nouveau paragraphe sur l'indicateur technique.

- [ ] **Step 7: Commit**

```bash
git add app/pages/scanner.vue app/pages/confidentialite.vue
git commit -m "$(cat <<'EOF'
feat(scanner): MAJ privacy/SEO pour cohérence avec gate à venir

- useSeoMeta retire 'sans inscription' (mensonger une fois le gate
  shippé), formule 'score gratuit + plan d'action sur inscription'.
- FAQ Q3 (DOM + JSON-LD) reformule honnêtement le périmètre de la
  collecte d'email.
- /confidentialite documente le flag localStorage hasUnlockedScanner.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Composant `<ScannerGate>`

**Files:**
- Create: `app/components/ScannerGate.vue`

- [ ] **Step 1: Créer le fichier composant**

```vue
<!-- app/components/ScannerGate.vue -->
<script setup lang="ts">
import type { Job } from '~/data/jobs'

const props = defineProps<{ job: Job }>()
const emit = defineEmits<{ unlocked: [] }>()

const { capture } = usePosthogEvent()
const { markUnlocked } = useScannerUnlock()

// Copy par statut
const HEADLINES: Record<Job['status'], string> = {
  danger:     'Diagnostic confirmé : EN DANGER. Le plan d\'action reste classifié.',
  mutation:   'Diagnostic confirmé : EN MUTATION. Ta carte de navigation reste classifiée.',
  protege:    'Diagnostic confirmé : PROTÉGÉ. Le plan pour le rester est classifié.',
  croissance: 'Diagnostic confirmé : EN CROISSANCE. Le plan pour capitaliser est classifié.',
}

const SUBLINES: Record<Job['status'], string> = {
  danger:     'La Fréquence te montre comment mettre ces 3 axes en pratique — une technique concrète par semaine.',
  mutation:   'La Fréquence t\'accompagne dans cette mutation — une carte de survie par semaine, sans jargon.',
  protege:    'La Fréquence te permet de garder une longueur d\'avance — sans devenir expert en IA.',
  croissance: 'La Fréquence te donne les outils pour capitaliser sur ta position — avant que la fenêtre ne se referme.',
}

const headline = computed(() => HEADLINES[props.job.status])
const subline  = computed(() => SUBLINES[props.job.status])

// Form state
const prenom   = ref('')
const email    = ref('')
const consent  = ref(false)
const website  = ref('')  // honeypot
const status   = ref<'idle' | 'loading' | 'error'>('idle')
const errorMsg = ref('')
const focusedOnce = ref(false)
const prenomInputRef = ref<HTMLInputElement | null>(null)

const canSubmit = computed(() =>
  prenom.value.trim().length > 0 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
  consent.value &&
  status.value !== 'loading'
)

function jobBaseProps() {
  return { job_slug: props.job.slug, job_status: props.job.status }
}

function onEmailFocus() {
  if (focusedOnce.value) return
  focusedOnce.value = true
  capture('scanner_gate_email_focused', jobBaseProps())
}

function classifyError(err: any): 'validation' | 'server' | 'network' {
  if (err?.statusCode && err.statusCode >= 400 && err.statusCode < 500) return 'validation'
  if (err?.statusCode && err.statusCode >= 500) return 'server'
  return 'network'
}

async function submit() {
  if (!canSubmit.value) return
  if (website.value) return  // honeypot rempli côté client → silencieux

  status.value = 'loading'
  errorMsg.value = ''
  capture('scanner_gate_submitted', jobBaseProps())

  try {
    await $fetch('/api/subscribe', {
      method: 'POST',
      body: {
        prenom: prenom.value.trim(),
        email: email.value,
        consent: consent.value,
        source: 'scanner_gate',
        job_slug: props.job.slug,
        job_status: props.job.status,
      },
    })
    capture('scanner_gate_succeeded', jobBaseProps())
    markUnlocked()
    emit('unlocked')
  } catch (err: any) {
    status.value = 'error'
    errorMsg.value = err?.data?.message ?? 'Erreur technique, réessayez.'
    capture('scanner_gate_failed', { ...jobBaseProps(), reason: classifyError(err) })
  }
}

onMounted(() => {
  // Focus auto sur prénom à l'apparition du gate
  nextTick(() => prenomInputRef.value?.focus())
})
</script>

<template>
  <div class="scanner-gate" role="region" aria-label="Section classifiée du rapport">
    <div class="gate-badge font-mono" aria-hidden="true">
      <span class="badge-bracket">[</span>
      <span class="badge-text">CLASSIFIÉ</span>
      <span class="badge-sep">░░</span>
      <span class="badge-text">NIVEAU 2</span>
      <span class="badge-bracket">]</span>
      <span class="badge-lock">🔒</span>
    </div>

    <h3 class="gate-headline">{{ headline }}</h3>
    <p class="gate-subline">{{ subline }}</p>

    <form class="gate-form" @submit.prevent="submit" novalidate>
      <!-- Honeypot (invisible aux humains, attractif pour les bots) -->
      <input
        v-model="website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        class="gate-honeypot"
        aria-hidden="true"
      />

      <div class="gate-fields">
        <input
          ref="prenomInputRef"
          v-model="prenom"
          type="text"
          placeholder="Ton prénom"
          class="gate-input"
          aria-label="Prénom"
          maxlength="100"
          :disabled="status === 'loading'"
          required
        />
        <input
          v-model="email"
          type="email"
          placeholder="ton@email.com"
          class="gate-input"
          aria-label="Adresse email"
          :disabled="status === 'loading'"
          required
          @focus="onEmailFocus"
        />
      </div>

      <label class="gate-consent">
        <input
          v-model="consent"
          type="checkbox"
          :disabled="status === 'loading'"
        />
        <span>
          J'accepte de recevoir la newsletter hebdomadaire et j'ai pris connaissance de la
          <NuxtLink to="/confidentialite" target="_blank">politique de confidentialité</NuxtLink>.
        </span>
      </label>

      <p v-if="errorMsg" class="gate-error font-mono" role="alert">{{ errorMsg }}</p>

      <button
        type="submit"
        class="gate-submit"
        :data-text="status === 'loading' ? 'DÉVERROUILLAGE...' : 'DÉVERROUILLER LE PLAN D\'ACTION'"
        :disabled="!canSubmit"
      >
        {{ status === 'loading' ? 'DÉVERROUILLAGE...' : 'DÉVERROUILLER LE PLAN D\'ACTION' }}
      </button>

      <p class="gate-rassur font-mono">// 1 clic pour te désinscrire à tout moment</p>
    </form>
  </div>
</template>

<style scoped>
.scanner-gate {
  margin-top: 1.5rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid rgba(0, 255, 65, 0.4);
  background: rgba(0, 255, 65, 0.02);
  position: relative;
  animation: gate-fade-in 200ms ease-out;
}
@keyframes gate-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.gate-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #2C2C2C;
  border-top: 1px solid #383838;
  padding: 0.25rem 0.6rem;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--color-text);
  margin-bottom: 1.1rem;
}
.gate-badge .badge-bracket,
.gate-badge .badge-sep { color: var(--color-accent); }
.gate-badge .badge-lock { font-size: 0.85em; }

.gate-headline {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--color-text);
  margin: 0 0 0.65rem;
  font-weight: 700;
}
.gate-subline {
  font-size: 0.9rem;
  color: var(--color-muted);
  line-height: 1.6;
  margin: 0 0 1.4rem;
  max-width: 56ch;
}

.gate-form { display: flex; flex-direction: column; gap: 1rem; }

.gate-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.gate-fields { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.gate-input {
  flex: 1;
  min-width: 180px;
  background: var(--color-surface-2);
  border: 1px solid rgba(0, 255, 65, 0.2);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  padding: 0.7rem 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.gate-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.12), inset 0 0 12px rgba(0, 255, 65, 0.04);
}
.gate-input::placeholder { color: #555; }
.gate-input:disabled { opacity: 0.5; }

.gate-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.75rem;
  color: var(--color-muted);
  line-height: 1.5;
  cursor: pointer;
}
.gate-consent input[type="checkbox"] {
  margin-top: 0.15rem;
  flex-shrink: 0;
  accent-color: var(--color-accent);
}
.gate-consent a { color: var(--color-accent); }

.gate-error {
  font-size: 0.75rem;
  color: var(--color-danger);
  margin: 0;
  letter-spacing: 0.05em;
}

.gate-submit {
  position: relative;
  background: var(--color-accent);
  color: #0A0A0A;
  border: none;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  font-weight: 700;
  padding: 0.85rem 1.5rem;
  cursor: pointer;
  text-transform: uppercase;
  transition: opacity 0.15s, transform 0.1s;
}
.gate-submit:hover:not(:disabled) { opacity: 0.9; }
.gate-submit:active:not(:disabled) { transform: translateY(1px); }
.gate-submit:disabled {
  background: var(--color-surface-2);
  color: var(--color-muted);
  cursor: not-allowed;
}

.gate-rassur {
  font-size: 0.7rem;
  color: #555;
  letter-spacing: 0.05em;
  margin: 0;
  text-align: center;
}

@media (max-width: 600px) {
  .scanner-gate { padding: 1.25rem 1rem; }
  .gate-fields { flex-direction: column; gap: 0.6rem; }
  .gate-input { min-width: 0; }
  .gate-headline { font-size: 0.95rem; }
}

@media (prefers-reduced-motion: reduce) {
  .scanner-gate { animation: none; }
}
</style>
```

- [ ] **Step 2: Test manuel isolé du composant**

Le composant nécessite un parent qui le monte avec un job en prop. On va le tester directement en l'intégrant *temporairement* à la fin de scanner.vue pour vérifier le rendu visuel et la soumission, puis on retirera l'intégration temporaire au début de Task 8.

Insérer **temporairement** à la fin du `<template>` de scanner.vue (juste avant `</template>` final, AVANT le `<SourcesModal>`) :

```html
      <!-- DEBUG TEMPORAIRE — sera retiré au Task 8 -->
      <div v-if="selectedJob" style="max-width: 780px; margin: 2rem auto;">
        <ScannerGate :job="selectedJob" @unlocked="() => alert('UNLOCKED EVENT FIRED')" />
      </div>
```

- [ ] **Step 3: Lancer le dev server et tester le gate dans le navigateur**

Run: `npm run dev`
Browser: `http://localhost:3000/scanner`

Tests visuels :
- Taper un métier (ex: "comptable") + sélectionner → après le scan, le gate apparaît en bas (en debug). Vérifier :
  - [ ] Badge `[ CLASSIFIÉ ░░ NIVEAU 2 🔒 ]` rendu correctement.
  - [ ] Headline EN DANGER : "Diagnostic confirmé : EN DANGER. Le plan d'action reste classifié."
  - [ ] Sub-line : "La Fréquence te montre comment mettre ces 3 axes en pratique..."
  - [ ] Focus initial sur l'input "Ton prénom" (pas sur l'input subject du haut).
  - [ ] Bouton "DÉVERROUILLER LE PLAN D'ACTION" disabled jusqu'à ce que prénom + email valide + checkbox cochés.

Tests par statut :
- [ ] Tester avec "infirmier" (mutation), "médecin-generaliste" (protege probable), "data-scientist" (croissance probable). Vérifier que les 4 headlines/sublines correspondent au statut.

Tests fonctionnels :
- [ ] Soumission OK : remplir champs valides → cliquer → vérifier dans la PostHog Live tab que les events `scanner_gate_email_focused`, `scanner_gate_submitted`, `scanner_gate_succeeded` sont envoyés. Une alert "UNLOCKED EVENT FIRED" s'affiche. localStorage `hasUnlockedScanner = "true"` (DevTools → Application).
- [ ] Honeypot : DevTools → Elements → trouver l'input `name="website"` → modifier sa valeur via `$0.value = 'spam'` → soumettre → ne rien faire (silencieux), pas d'event PostHog `scanner_gate_submitted`.
- [ ] Erreur API : couper le réseau (DevTools → Network → Offline) → soumettre → message d'erreur affiché, event `scanner_gate_failed` avec `reason: 'network'`.

- [ ] **Step 4: Retirer l'intégration de debug**

Retirer le bloc `<!-- DEBUG TEMPORAIRE -->` ajouté au Step 2 — on le réintégrera proprement au Task 8.

- [ ] **Step 5: Vider le localStorage avant de continuer**

DevTools Console : `localStorage.removeItem('hasUnlockedScanner')`. Sinon les tests des prochaines tasks seront faussés (plus de gate visible).

- [ ] **Step 6: Commit**

```bash
git add app/components/ScannerGate.vue
git commit -m "$(cat <<'EOF'
feat(scanner): create ScannerGate component

Encart verrouillé qui se monte sous les placeholders TRAJECTOIRE
et ACTIONS du rapport scanner. Mini-form (prénom, email, consent)
qui poste vers /api/subscribe avec source=scanner_gate.

- Copy headline + sub-line adaptés par job.status (4 variantes).
- Honeypot anti-bot (champ 'website' caché).
- PostHog : email_focused, submitted, succeeded, failed.
- Focus auto sur prénom à l'apparition.
- Émet 'unlocked' au parent après succès API.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Scramble pour TRAJECTOIRE dans scanner.vue

Cette task ajoute un effet scramble sur la trajectoire (aujourd'hui : simple fade). C'est un changement isolé qui améliore l'animation existante, indépendamment du gate. Bénéfique seul.

**Files:**
- Modify: `app/pages/scanner.vue`

- [ ] **Step 1: Ajouter les nouveaux refs d'état pour TRAJECTOIRE**

Dans `<script setup>`, après le bloc `// Decryption state` (lignes 248-259), ajouter `trajText` et `trajState` :

Trouver le bloc actuel :
```ts
// Decryption state
const riskText    = ref('XX')
const horizonText = ref('XX')
const statusText  = ref('EN MUTATION SÉVÈRE')
const riskState    = ref<DecryptState>('locked')
const horizonState = ref<DecryptState>('locked')
const statusState  = ref<DecryptState>('locked')
const trajVisible  = ref(false)
const actionsRevealed  = ref<boolean[]>([false, false, false])
const progressPct  = ref(0)
const jobSources   = ref<Source[]>([])
const revealedSources = ref<boolean[]>([])
```

Ajouter juste après `trajVisible` la ligne suivante (on garde `trajVisible` pour l'instant pour ne pas casser le template, on le supprimera au Step 4) :
```ts
const trajText  = ref('')
const trajState = ref<DecryptState>('locked')
```

- [ ] **Step 2: Mettre à jour `resetDecryptState()` pour les nouveaux refs**

Dans la fonction `resetDecryptState()` (lignes 321-333), ajouter au début (après les lignes existantes des autres `*Text`) :
```ts
  trajText.value  = ''
  trajState.value = 'locked'
```

- [ ] **Step 3: Remplacer l'étape 4 (TRAJECTOIRE) dans `startScan()`**

Trouver dans `startScan` (lignes 361-364) :
```ts
  // 4. TRAJECTOIRE
  progressPct.value = 75
  trajVisible.value = true
  await sleep(700); if (!ok()) return
```

Remplacer par :
```ts
  // 4. TRAJECTOIRE
  progressPct.value = 75
  trajVisible.value = true
  await scrambleTo(trajText, trajState, job.dynamic, 700); if (!ok()) return
  await sleep(180); if (!ok()) return
```

- [ ] **Step 4: Mettre à jour `showResultImmediate()` (URL ?job=)**

Trouver les lignes 393-406. Remplacer la fonction par :
```ts
function showResultImmediate(job: Job) {
  showInput.value    = false
  riskText.value     = String(job.risk)
  horizonText.value  = String(job.horizon)
  statusText.value   = STATUS_LABELS[job.status]
  riskState.value    = 'decrypted'
  horizonState.value = 'decrypted'
  statusState.value  = 'decrypted'
  trajVisible.value  = true
  trajText.value     = job.dynamic
  trajState.value    = 'decrypted'
  actionsRevealed.value = [true, true, true]
  const sources = getSourcesByIds(job.sources)
  jobSources.value   = sources
  revealedSources.value = new Array(sources.length).fill(true)
}
```

- [ ] **Step 5: Mettre à jour le template TRAJECTOIRE pour utiliser le scramble**

Trouver le bloc TRAJECTOIRE dans le template (lignes 590-601) :
```html
        <!-- TRAJECTOIRE -->
        <div class="rep-block">
          <div class="label"><KickerLabel>TRAJECTOIRE</KickerLabel></div>
          <div class="traj-text" :class="{ 'is-decrypted': trajVisible }">
            <div v-if="!trajVisible" class="placeholder" aria-hidden="true">
              <span class="redact-line" />
              <span class="redact-line" />
              <span class="redact-line" />
            </div>
            <span v-else class="traj-revealed is-shown">{{ selectedJob?.dynamic }}</span>
          </div>
        </div>
```

Remplacer par :
```html
        <!-- TRAJECTOIRE -->
        <div class="rep-block">
          <div class="label"><KickerLabel>TRAJECTOIRE</KickerLabel></div>
          <div class="traj-text" :class="{ 'is-decrypted': trajState === 'decrypted' }">
            <div v-if="trajState === 'locked'" class="placeholder" aria-hidden="true">
              <span class="redact-line" />
              <span class="redact-line" />
              <span class="redact-line" />
            </div>
            <span
              v-else
              class="traj-revealed is-shown"
              :class="{
                'is-scrambling': trajState === 'scrambling',
              }"
            >{{ trajText }}</span>
          </div>
        </div>
```

- [ ] **Step 6: Ajouter le styling pour `.traj-revealed.is-scrambling`**

Dans le `<style scoped>`, après le bloc `.traj-revealed { display: block; opacity: 0; transition: opacity 0.6s; }` (ligne 1074), ajouter :
```css
.traj-revealed.is-scrambling {
  color: var(--color-accent);
  opacity: 1;
  font-family: var(--font-mono);
}
```

- [ ] **Step 7: Test manuel**

Run: `npm run dev`
Browser: `localhost:3000/scanner`

- [ ] Scanner "comptable" → la TRAJECTOIRE est révélée avec un scramble vert pendant 700ms puis settle au texte normal (français, sans-serif).
- [ ] URL `?job=comptable` direct → trajectoire s'affiche en clair sans animation (showResultImmediate).
- [ ] Reset puis nouveau scan → comportement reproductible.
- [ ] Pas de régression sur RISQUE/HORIZON/STATUT (toujours leur scramble vert habituel).

- [ ] **Step 8: Commit**

```bash
git add app/pages/scanner.vue
git commit -m "$(cat <<'EOF'
feat(scanner): scramble effect sur TRAJECTOIRE

La trajectoire utilise désormais le même mécanisme scrambleTo()
que RISQUE/HORIZON/STATUT (texte vert qui scramble pendant 700ms
puis settle). Cohérent avec l'esthétique 'rapport déclassifié'
et prépare le terrain pour la révélation post-déverrouillage.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Scramble pour ACTIONS dans scanner.vue

**Files:**
- Modify: `app/pages/scanner.vue`

- [ ] **Step 1: Remplacer `actionsRevealed` par `actionTexts` + `actionStates`**

Dans `<script setup>`, trouver :
```ts
const actionsRevealed  = ref<boolean[]>([false, false, false])
```

Remplacer par :
```ts
const actionTexts  = ref<string[]>(['', '', ''])
const actionStates = ref<DecryptState[]>(['locked', 'locked', 'locked'])
```

- [ ] **Step 2: Mettre à jour `resetDecryptState()`**

Dans `resetDecryptState()` trouver :
```ts
  actionsRevealed.value = [false, false, false]
```

Remplacer par :
```ts
  actionTexts.value  = ['', '', '']
  actionStates.value = ['locked', 'locked', 'locked']
```

- [ ] **Step 3: Remplacer l'étape 5 (ACTIONS) dans `startScan()`**

Trouver dans `startScan()` (lignes 366-371) :
```ts
  // 5. ACTIONS
  progressPct.value = 88
  for (let i = 0; i < 3; i++) {
    actionsRevealed.value[i] = true
    await sleep(220); if (!ok()) return
  }
  await sleep(180); if (!ok()) return
```

Remplacer par :
```ts
  // 5. ACTIONS — scramble en cascade
  progressPct.value = 88
  const actions = ACTIONS[job.status]
  for (let i = 0; i < 3; i++) {
    // helper local pour scrambler un index spécifique du tableau
    const textRef   = { get value() { return actionTexts.value[i] }, set value(v: string) { actionTexts.value = actionTexts.value.map((t, idx) => idx === i ? v : t) } }
    const stateRef  = { get value() { return actionStates.value[i] }, set value(v: any) { actionStates.value = actionStates.value.map((s, idx) => idx === i ? v : s) as any } }
    await scrambleTo(textRef, stateRef, actions[i], 350); if (!ok()) return
    await sleep(80); if (!ok()) return
  }
  await sleep(180); if (!ok()) return
```

**Note importante** : `scrambleTo()` attend des `{ value: string }` refs simples. Comme on a un tableau, on construit un proxy `textRef`/`stateRef` qui lit/écrit dans le tableau. Cela fonctionne avec la signature actuelle de `scrambleTo` car la fonction n'utilise que `.value` get/set.

- [ ] **Step 4: Mettre à jour `showResultImmediate()`**

Trouver dans `showResultImmediate()` :
```ts
  actionsRevealed.value = [true, true, true]
```

Remplacer par :
```ts
  const actions = ACTIONS[job.status]
  actionTexts.value  = [actions[0], actions[1], actions[2]]
  actionStates.value = ['decrypted', 'decrypted', 'decrypted']
```

- [ ] **Step 5: Mettre à jour le template ACTIONS**

Trouver le bloc actions (lignes 603-621) :
```html
        <!-- ACTIONS -->
        <div class="rep-block">
          <div class="label"><KickerLabel>CE QUE TU PEUX FAIRE <span class="ct">(3)</span></KickerLabel></div>
          <ol class="actions-list">
            <li
              v-for="(action, i) in currentActions"
              :key="i"
              class="action-item"
              :class="{
                'is-locked':    !actionsRevealed[i],
                'is-decrypted': actionsRevealed[i],
              }"
            >
              <span class="action-num font-mono">0{{ i + 1 }}</span>
              <span class="action-arrow font-mono" aria-hidden="true">▸</span>
              <span class="action-text">{{ action }}</span>
            </li>
          </ol>
        </div>
```

Remplacer par :
```html
        <!-- ACTIONS -->
        <div class="rep-block">
          <div class="label"><KickerLabel>CE QUE TU PEUX FAIRE <span class="ct">(3)</span></KickerLabel></div>
          <ol class="actions-list">
            <li
              v-for="(_, i) in actionStates"
              :key="i"
              class="action-item"
              :class="{
                'is-locked':     actionStates[i] === 'locked',
                'is-scrambling': actionStates[i] === 'scrambling',
                'is-decrypted':  actionStates[i] === 'decrypted',
              }"
            >
              <span class="action-num font-mono">0{{ i + 1 }}</span>
              <span class="action-arrow font-mono" aria-hidden="true">▸</span>
              <span class="action-text">{{ actionTexts[i] }}</span>
            </li>
          </ol>
        </div>
```

- [ ] **Step 6: Ajouter le styling pour `.action-item.is-scrambling`**

Dans le `<style scoped>`, après le bloc `.action-item.is-locked .action-text` (lignes 1095-1106), ajouter :
```css
.action-item.is-scrambling .action-text {
  color: var(--color-accent);
  font-family: var(--font-mono);
  background: transparent;
  border: none;
  padding: 0;
  height: auto;
  user-select: text;
}
```

- [ ] **Step 7: Test manuel**

Run: `npm run dev`
Browser: `localhost:3000/scanner`

- [ ] Vider localStorage : `localStorage.removeItem('hasUnlockedScanner')` dans la console (au cas où le Task 4 a laissé le flag).
- [ ] Scanner "comptable" → les 3 actions apparaissent une à une, chaque action passe par scramble vert (~350ms) puis settle au texte final.
- [ ] URL `?job=comptable` → 3 actions en clair direct.
- [ ] Reset → les 3 actions repartent à locked (barres redactées noires).

- [ ] **Step 8: Commit**

```bash
git add app/pages/scanner.vue
git commit -m "$(cat <<'EOF'
feat(scanner): scramble effect sur les 3 ACTIONS

Les 3 actions du rapport sont désormais révélées via scrambleTo()
en cascade (350ms chacune), au lieu d'un simple toggle d'opacité.
Cohérent avec l'esthétique 'rapport déclassifié' et prépare la
révélation spectaculaire post-déverrouillage du gate.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Phase `gated` + animation classifiée

**Files:**
- Modify: `app/pages/scanner.vue`

- [ ] **Step 1: Étendre le type `phase`**

Trouver :
```ts
const phase       = ref<'idle' | 'scanning' | 'result'>('idle')
```

Remplacer par :
```ts
const phase = ref<'idle' | 'scanning' | 'gated' | 'unlocking' | 'unlocked'>('idle')
```

**Note** : on remplace `'result'` par `'unlocked'` partout. Le HTML actuel utilise `[data-state="result"]` dans le CSS (lignes 847-848, 1110, 1224, 1234). On va mettre à jour ces sélecteurs.

- [ ] **Step 2: Importer le composable et ajouter les refs nécessaires**

Dans `<script setup>`, juste après les imports, ajouter :
```ts
const { isUnlocked, markUnlocked: _markUnlockedFromComposable } = useScannerUnlock()
const reducedMotion = ref(false)
const classifiedVisible = ref(false)
const shimmering = ref(false)
```

(On exporte `markUnlocked` depuis le composable mais on ne l'utilise pas directement ici — `<ScannerGate>` l'utilise. On le préfixe `_` pour indiquer qu'on ne l'appelle pas localement.)

Helper reduced-motion :
```ts
function rm(ms: number): number {
  return reducedMotion.value ? 0 : ms
}
```

Dans le bloc `onMounted` actuel (ligne 409), ajouter en première ligne :
```ts
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

- [ ] **Step 3: Étendre `resetDecryptState()`**

Ajouter dans `resetDecryptState()` :
```ts
  classifiedVisible.value = false
  shimmering.value = false
```

- [ ] **Step 4: Modifier `startScan()` pour gérer le gating**

Trouver dans `startScan()` la partie après l'étape 3 (RISQUE) qui passe à TRAJECTOIRE. Actuellement (lignes 361 et suivantes) :

```ts
  // 4. TRAJECTOIRE
  progressPct.value = 75
  trajVisible.value = true
  await scrambleTo(trajText, trajState, job.dynamic, 700); if (!ok()) return
  await sleep(180); if (!ok()) return

  // 5. ACTIONS — scramble en cascade
  ...
```

Remplacer toute la suite (à partir de "// 4. TRAJECTOIRE") par :
```ts
  // ── BRANCHEMENT : si pas déverrouillé, on s'arrête au gate ──
  if (!isUnlocked.value) {
    // 4-classified. Phase classifiée
    progressPct.value = 70
    classifiedVisible.value = true
    await sleep(rm(500)); if (!ok()) return

    progressPct.value = 80
    shimmering.value = true
    await sleep(rm(500)); if (!ok()) return
    shimmering.value = false

    progressPct.value = 88
    phase.value = 'gated'
    capture('scanner_gate_shown', {
      ...jobProps(job, 'suggestion'),
      job_risk: job.risk, job_horizon: job.horizon,
    })
    return
  }

  // ── Path déverrouillé : continue le scan complet ──
  // 4. TRAJECTOIRE
  progressPct.value = 75
  trajVisible.value = true
  await scrambleTo(trajText, trajState, job.dynamic, rm(700)); if (!ok()) return
  await sleep(rm(180)); if (!ok()) return

  // 5. ACTIONS — scramble en cascade
  progressPct.value = 88
  const actions = ACTIONS[job.status]
  for (let i = 0; i < 3; i++) {
    const textRef  = { get value() { return actionTexts.value[i] }, set value(v: string) { actionTexts.value = actionTexts.value.map((t, idx) => idx === i ? v : t) } }
    const stateRef = { get value() { return actionStates.value[i] }, set value(v: any) { actionStates.value = actionStates.value.map((s, idx) => idx === i ? v : s) as any } }
    await scrambleTo(textRef, stateRef, actions[i], rm(350)); if (!ok()) return
    await sleep(rm(80)); if (!ok()) return
  }
  await sleep(rm(180)); if (!ok()) return

  // 6. SOURCES + result
  progressPct.value = 95
  phase.value = 'unlocked'
  router.replace({ query: { job: job.slug } })
  setDynamicMeta(job)
  capture('scanner_scan_completed', jobProps(job, 'suggestion'))

  const sources = getSourcesByIds(job.sources)
  jobSources.value = sources
  revealedSources.value = new Array(sources.length).fill(false)

  for (let i = 0; i < sources.length; i++) {
    await sleep(rm(20)); if (!ok()) return
    revealedSources.value[i] = true
    await sleep(rm(160)); if (!ok()) return
  }
  progressPct.value = 100
```

**Important** : la partie `phase.value = 'result'` historique devient `phase.value = 'unlocked'`. La partie `progressPct = 5` initiale + scrambles HORIZON/STATUT/RISQUE en haut de la fonction reste inchangée (on ne les inclut pas dans le diff).

- [ ] **Step 5: Mettre à jour les sélecteurs CSS `[data-state="result"]` → `[data-state="unlocked"]`**

Run pour repérer toutes les occurrences :
```bash
grep -n 'data-state="result"' app/pages/scanner.vue
```

Pour chaque occurrence, remplacer `data-state="result"` par `data-state="unlocked"`. Concrètement, lignes attendues (ajustables selon les modifs précédentes) :

```css
.report[data-state="scanning"] .report-progress { opacity: 1; }
.report[data-state="result"]   .report-progress { opacity: 0; transition: opacity 0.4s ease 0.5s; }
```
→
```css
.report[data-state="scanning"] .report-progress { opacity: 1; }
.report[data-state="gated"]    .report-progress { opacity: 1; }
.report[data-state="unlocked"] .report-progress { opacity: 0; transition: opacity 0.4s ease 0.5s; }
```

```css
.sources-block { display: none; }
.report[data-state="result"] .sources-block { display: block; }
```
→
```css
.sources-block { display: none; }
.report[data-state="unlocked"] .sources-block { display: block; }
```

```css
.report[data-state="scanning"] .idle-hint,
.report[data-state="result"]   .idle-hint { display: none; }
```
→
```css
.report[data-state="scanning"] .idle-hint,
.report[data-state="gated"]    .idle-hint,
.report[data-state="unlocking"] .idle-hint,
.report[data-state="unlocked"]  .idle-hint { display: none; }
```

```css
.report[data-state="result"] .result-zone { display: block; }
```
→
```css
.report[data-state="unlocked"] .result-zone { display: block; }
```

- [ ] **Step 6: Ajouter le sous-titre "// CLASSIFIÉ" dans le template**

Dans le template, trouver le bloc TRAJECTOIRE et insérer JUSTE AVANT lui le bloc suivant :
```html
        <!-- Classified pulse -->
        <div
          v-if="classifiedVisible"
          class="rep-classified font-mono"
          aria-live="polite"
        >
          // CLASSIFIÉ — ACCÈS RESTREINT
        </div>
```

Et étendre les classes `.redact-line` et `.action-item.is-locked` pour supporter le shimmer one-shot. Modifier le bloc TRAJECTOIRE pour ajouter la classe `is-shimmering` conditionnelle :
```html
        <!-- TRAJECTOIRE -->
        <div class="rep-block" :class="{ 'is-shimmering': shimmering }">
          ...inchangé...
        </div>
```

Et le bloc ACTIONS :
```html
        <!-- ACTIONS -->
        <div class="rep-block" :class="{ 'is-shimmering': shimmering }">
          ...inchangé...
        </div>
```

- [ ] **Step 7: Ajouter le CSS pour `.rep-classified` et `.is-shimmering`**

Dans `<style scoped>`, ajouter à la fin (avant `@media (max-width: 600px)`) :

```css
/* ── Classified pulse ─────────────────────────────────── */
.rep-classified {
  margin: 1.2rem 0 0.4rem;
  font-size: 0.78rem;
  letter-spacing: 0.15em;
  color: var(--color-danger);
  text-transform: uppercase;
  text-align: center;
  padding: 0.5rem 0.75rem;
  border: 1px dashed rgba(255, 0, 0, 0.25);
  background: rgba(255, 0, 0, 0.03);
  animation: classified-pulse 500ms ease-out;
}
@keyframes classified-pulse {
  0%   { opacity: 0; transform: scale(0.95); }
  50%  { opacity: 1; transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
}

/* ── Shimmer one-shot pour blocs verrouillés ──────────── */
.rep-block.is-shimmering .redact-line,
.rep-block.is-shimmering .action-item.is-locked .action-text {
  animation: shimmer-once 500ms ease-out;
  position: relative;
  overflow: hidden;
}
@keyframes shimmer-once {
  0%   { box-shadow: inset 0 0 0 0 rgba(0, 255, 65, 0); }
  50%  { box-shadow: inset 200px 0 30px -15px rgba(0, 255, 65, 0.2); }
  100% { box-shadow: inset 400px 0 30px -15px rgba(0, 255, 65, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .rep-classified { animation: none; }
  .rep-block.is-shimmering .redact-line,
  .rep-block.is-shimmering .action-item.is-locked .action-text { animation: none; }
}
```

- [ ] **Step 8: Test manuel**

Run: `npm run dev`
Browser: `localhost:3000/scanner` — vérifier `localStorage.removeItem('hasUnlockedScanner')` au préalable.

- [ ] Scanner "comptable" → animation HORIZON/STATUT/RISQUE → puis "// CLASSIFIÉ — ACCÈS RESTREINT" pulse en rouge → shimmer vert sur les placeholders TRAJ/ACTIONS → barre de progression figée à 88%.
- [ ] À ce stade, `phase === 'gated'` (vérifier dans Vue DevTools). Le gate n'est pas encore monté — on l'intègre au Task 8.
- [ ] PostHog Live tab : `scanner_gate_shown` envoyé.
- [ ] Reduced motion (DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`) → pas de pulse, pas de shimmer, transitions instantanées.
- [ ] Régression : sources visibles ? NON (c'est normal, sources ne s'affichent qu'en `unlocked`). Result-zone visible ? NON (idem).

- [ ] **Step 9: Commit**

```bash
git add app/pages/scanner.vue
git commit -m "$(cat <<'EOF'
feat(scanner): add gated phase + classified scan animation

- Étend la machine d'états : 'result' → 'unlocked', ajoute 'gated'
  et 'unlocking'.
- Si !isUnlocked.value, le scan halt après RISQUE/HORIZON/STATUT,
  affiche un pulse '// CLASSIFIÉ — ACCÈS RESTREINT', shimmer
  one-shot sur les placeholders TRAJ/ACTIONS, barre progress
  figée à 88%.
- Helper rm(ms) pour respect prefers-reduced-motion.
- Émet scanner_gate_shown PostHog à l'entrée en 'gated'.
- ScannerGate sera intégré au prochain commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Intégration `<ScannerGate>` + `unlockAndReveal`

**Files:**
- Modify: `app/pages/scanner.vue`

- [ ] **Step 1: Ajouter `unlockAndReveal()`**

Dans `<script setup>`, juste après la fonction `startScan()`, ajouter :

```ts
async function unlockAndReveal(job: Job) {
  const scanId = ++currentScanId
  const ok = () => scanId === currentScanId

  phase.value = 'unlocking'
  classifiedVisible.value = false  // retire le pulse
  await sleep(rm(250)); if (!ok()) return

  // TRAJECTOIRE
  progressPct.value = 92
  trajVisible.value = true
  await scrambleTo(trajText, trajState, job.dynamic, rm(700)); if (!ok()) return
  await sleep(rm(180)); if (!ok()) return

  // ACTIONS — cascade
  progressPct.value = 95
  const actions = ACTIONS[job.status]
  for (let i = 0; i < 3; i++) {
    const textRef  = { get value() { return actionTexts.value[i] }, set value(v: string) { actionTexts.value = actionTexts.value.map((t, idx) => idx === i ? v : t) } }
    const stateRef = { get value() { return actionStates.value[i] }, set value(v: any) { actionStates.value = actionStates.value.map((s, idx) => idx === i ? v : s) as any } }
    await scrambleTo(textRef, stateRef, actions[i], rm(350)); if (!ok()) return
    await sleep(rm(80)); if (!ok()) return
  }

  // SOURCES + result
  phase.value = 'unlocked'
  router.replace({ query: { job: job.slug } })
  setDynamicMeta(job)

  const sources = getSourcesByIds(job.sources)
  jobSources.value = sources
  revealedSources.value = new Array(sources.length).fill(false)
  for (let i = 0; i < sources.length; i++) {
    await sleep(rm(20)); if (!ok()) return
    revealedSources.value[i] = true
    await sleep(rm(160)); if (!ok()) return
  }
  progressPct.value = 100
}
```

- [ ] **Step 2: Ajouter le handler `onGateUnlocked()`**

Juste après `unlockAndReveal()`, ajouter :
```ts
function onGateUnlocked() {
  if (!selectedJob.value) return
  unlockAndReveal(selectedJob.value)
}
```

- [ ] **Step 3: Ajouter le tracking `scanner_gate_dismissed` dans `reset()`**

Trouver la fonction `reset()` actuelle et la modifier — repérer le bloc :
```ts
  if (selectedJob.value) {
    capture('scanner_reset', { previous_job_slug: selectedJob.value.slug })
  }
```

Remplacer par :
```ts
  if (selectedJob.value) {
    if (phase.value === 'gated') {
      capture('scanner_gate_dismissed', {
        job_slug:   selectedJob.value.slug,
        job_status: selectedJob.value.status,
      })
    }
    capture('scanner_reset', { previous_job_slug: selectedJob.value.slug })
  }
```

- [ ] **Step 4: Intégrer `<ScannerGate>` dans le template**

Trouver le bloc `<!-- Idle hint -->` et le bloc `<!-- Result zone -->` (autour des lignes 657-674). Insérer ENTRE les deux (juste avant `<!-- Result zone -->`) :

```html
        <!-- Gate (locked state) -->
        <ScannerGate
          v-if="phase === 'gated' && selectedJob"
          :job="selectedJob"
          @unlocked="onGateUnlocked"
        />

        <!-- Access granted message (post-unlock confirmation) -->
        <div
          v-if="phase === 'unlocked' && justUnlocked"
          class="rep-access-granted font-mono"
          role="status"
        >
          <span class="ag-dot" aria-hidden="true">●</span>
          [ ACCÈS ACCORDÉ ] BIENVENUE DANS LA FRÉQUENCE
        </div>
```

- [ ] **Step 5: Ajouter le ref `justUnlocked`**

Dans `<script setup>`, ajouter avec les autres refs d'état :
```ts
const justUnlocked = ref(false)
```

Mettre `justUnlocked = true` dans `onGateUnlocked()` :
```ts
function onGateUnlocked() {
  if (!selectedJob.value) return
  justUnlocked.value = true
  unlockAndReveal(selectedJob.value)
}
```

Réinitialiser dans `reset()` (ajouter au tout début de `resetDecryptState()`) :
```ts
  justUnlocked.value = false
```

- [ ] **Step 6: Cacher le CTA newsletter quand `justUnlocked`**

Trouver dans le template :
```html
        <!-- Result zone -->
        <div class="result-zone">
          <p class="result-hook font-mono">{{ ctaHook }}</p>
          <div class="result-actions">
            <GlitchButton :label="ctaButton" to="/#newsletter" @click="onCtaClick" />
            <button class="share-btn font-mono" @click="copyLink">
              {{ copied ? '[ Lien copié ! ]' : '[ Partager mon résultat ]' }}
            </button>
          </div>
          ...
        </div>
```

Remplacer par :
```html
        <!-- Result zone -->
        <div class="result-zone">
          <p v-if="!justUnlocked" class="result-hook font-mono">{{ ctaHook }}</p>
          <div class="result-actions">
            <GlitchButton
              v-if="!justUnlocked"
              :label="ctaButton"
              to="/#newsletter"
              @click="onCtaClick"
            />
            <button class="share-btn font-mono" @click="copyLink">
              {{ copied ? '[ Lien copié ! ]' : '[ Partager mon résultat ]' }}
            </button>
          </div>
          <div class="reset-zone">
            <button class="reset-btn font-mono" @click="reset">// nouveau scan ←</button>
          </div>
        </div>
```

- [ ] **Step 7: Ajouter le CSS pour `.rep-access-granted`**

Dans `<style scoped>`, ajouter avant `@media (max-width: 600px)` :
```css
.rep-access-granted {
  margin: 1.5rem 0 0;
  padding: 0.85rem 1rem;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  text-align: center;
  border-top: 1px solid rgba(0, 255, 65, 0.2);
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  background: rgba(0, 255, 65, 0.04);
}
.rep-access-granted .ag-dot {
  margin-right: 0.45rem;
  animation: led-pulse 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .rep-access-granted .ag-dot { animation: none; }
}
```

- [ ] **Step 8: Test manuel — parcours nominal complet**

Run: `npm run dev`
Browser: `localhost:3000/scanner` — `localStorage.removeItem('hasUnlockedScanner')` avant.

- [ ] **Scan "comptable"** → metrics révélés → "// CLASSIFIÉ" → shimmer → `<ScannerGate>` apparaît avec headline EN DANGER. Focus auto sur prénom.
- [ ] Remplir prénom + email valide + cocher consent → cliquer "DÉVERROUILLER" → gate disparaît → progress 92% → TRAJECTOIRE scramble → 95% → 3 ACTIONS scramble en cascade → 100% → sources cascade → `[ ACCÈS ACCORDÉ ]` apparaît → CTA "Rejoindre La Fréquence" est CACHÉ (volontaire), share + reset visibles.
- [ ] localStorage `hasUnlockedScanner = "true"`.
- [ ] Cliquer "// nouveau scan ←" → reset, retour à idle, gate dismissed event NON envoyé (car phase était 'unlocked' au moment du reset, pas 'gated').
- [ ] **Scan "infirmier"** → pas de gate (déjà unlocked) → scan complet jusqu'à 100%, scrambles trajectoire/actions visibles → result-zone montre "Rejoindre La Fréquence" (pas la confirmation, car `justUnlocked = false`).
- [ ] PostHog Live : vérifier la séquence d'events dans l'ordre.

- [ ] **Step 9: Test manuel — gate dismissed**

- [ ] `localStorage.removeItem('hasUnlockedScanner')` puis recharger.
- [ ] Scanner "comptable" → laisser le gate visible → cliquer "// nouveau scan ←" → vérifier que `scanner_gate_dismissed` est envoyé dans PostHog.

- [ ] **Step 10: Commit**

```bash
git add app/pages/scanner.vue
git commit -m "$(cat <<'EOF'
feat(scanner): integrate ScannerGate + unlockAndReveal

- <ScannerGate> monté quand phase === 'gated', écoute @unlocked.
- onGateUnlocked() lance unlockAndReveal() : scramble TRAJECTOIRE
  puis 3 ACTIONS en cascade puis sources, progress 88→100%.
- justUnlocked: ref pour distinguer la session courante (cache le
  CTA newsletter au profit du message [ ACCÈS ACCORDÉ ]).
- reset() émet scanner_gate_dismissed si phase === 'gated' au
  moment du reset (signal d'abandon du gate).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: URL `?job=` handling pour le path gated

**Files:**
- Modify: `app/pages/scanner.vue`

- [ ] **Step 1: Splitter `showResultImmediate()` en 2 chemins**

Trouver la fonction actuelle :
```ts
function showResultImmediate(job: Job) {
  showInput.value    = false
  riskText.value     = String(job.risk)
  horizonText.value  = String(job.horizon)
  statusText.value   = STATUS_LABELS[job.status]
  riskState.value    = 'decrypted'
  horizonState.value = 'decrypted'
  statusState.value  = 'decrypted'
  trajVisible.value  = true
  trajText.value     = job.dynamic
  trajState.value    = 'decrypted'
  const actions = ACTIONS[job.status]
  actionTexts.value  = [actions[0], actions[1], actions[2]]
  actionStates.value = ['decrypted', 'decrypted', 'decrypted']
  const sources = getSourcesByIds(job.sources)
  jobSources.value   = sources
  revealedSources.value = new Array(sources.length).fill(true)
}
```

Remplacer par :
```ts
function showResultImmediate(job: Job) {
  showInput.value    = false
  riskText.value     = String(job.risk)
  horizonText.value  = String(job.horizon)
  statusText.value   = STATUS_LABELS[job.status]
  riskState.value    = 'decrypted'
  horizonState.value = 'decrypted'
  statusState.value  = 'decrypted'

  if (!isUnlocked.value) {
    // Path gated : metrics en clair, TRAJ/ACTIONS restent locked, gate visible
    progressPct.value = 88
    phase.value = 'gated'
    capture('scanner_gate_shown', {
      ...jobProps(job, 'url_param'),
      job_risk: job.risk, job_horizon: job.horizon,
    })
    return
  }

  // Path unlocked : tout en clair (comportement historique)
  trajVisible.value = true
  trajText.value    = job.dynamic
  trajState.value   = 'decrypted'
  const actions = ACTIONS[job.status]
  actionTexts.value  = [actions[0], actions[1], actions[2]]
  actionStates.value = ['decrypted', 'decrypted', 'decrypted']
  const sources = getSourcesByIds(job.sources)
  jobSources.value   = sources
  revealedSources.value = new Array(sources.length).fill(true)
  phase.value = 'unlocked'
  progressPct.value = 100
}
```

- [ ] **Step 2: Ajuster `onMounted` pour basculer entre les deux paths**

Trouver le `onMounted` actuel :
```ts
onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const slug = route.query.job as string | undefined
  if (slug) {
    const job = findJobBySlug(slug)
    if (job) {
      selectedJob.value = job
      phase.value = 'result'   // ← obsolète, remplacer
      showResultImmediate(job)
      setDynamicMeta(job)
      capture('scanner_job_selected', jobProps(job, 'url_param'))
      capture('scanner_scan_completed', jobProps(job, 'url_param'))
    }
  } else {
    jobInputRef.value?.focus()
  }
})
```

Remplacer par :
```ts
onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const slug = route.query.job as string | undefined
  if (slug) {
    const job = findJobBySlug(slug)
    if (job) {
      selectedJob.value = job
      // showResultImmediate() set lui-même phase à 'gated' ou 'unlocked'
      showResultImmediate(job)
      setDynamicMeta(job)
      capture('scanner_job_selected', jobProps(job, 'url_param'))
      // scan_completed est émis seulement si on a effectivement révélé tout
      if (phase.value === 'unlocked') {
        capture('scanner_scan_completed', jobProps(job, 'url_param'))
      }
    }
  } else {
    jobInputRef.value?.focus()
  }
})
```

- [ ] **Step 3: Test manuel**

Run: `npm run dev`

Test path gated via URL :
- [ ] `localStorage.removeItem('hasUnlockedScanner')`.
- [ ] Visiter directement `localhost:3000/scanner?job=comptable` → metrics RISQUE/HORIZON/STATUT en clair direct (pas d'animation), TRAJECTOIRE et ACTIONS en placeholders redactés, progress à 88%, `<ScannerGate>` visible.
- [ ] PostHog : `scanner_job_selected` (url_param) + `scanner_gate_shown` (url_param) émis. PAS de `scanner_scan_completed`.
- [ ] Soumettre l'email → unlockAndReveal s'enclenche normalement.

Test path unlocked via URL :
- [ ] localStorage `hasUnlockedScanner = "true"`.
- [ ] `localhost:3000/scanner?job=infirmier` → tout en clair direct, sources visibles, result-zone classique avec CTA newsletter (pas de `[ ACCÈS ACCORDÉ ]` car `justUnlocked === false`).
- [ ] PostHog : `scanner_scan_completed` émis (path unlocked).

- [ ] **Step 4: Commit**

```bash
git add app/pages/scanner.vue
git commit -m "$(cat <<'EOF'
feat(scanner): URL ?job= respecte le gate

showResultImmediate() bascule entre 2 paths selon isUnlocked :
- Si !unlocked : metrics en clair direct, TRAJ/ACTIONS restent
  redactés, gate visible, scanner_gate_shown émis.
- Si unlocked : comportement historique (tout révélé).

scanner_scan_completed n'est émis que si la révélation est totale,
pour préserver la pureté du funnel PostHog.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Validation manuelle finale

**Files:** aucune modification — uniquement validation.

- [ ] **Step 1: Vider le state et lancer le dev server**

```bash
# Console DevTools sur localhost:3000/scanner
localStorage.clear()
```
Run: `npm run dev`

- [ ] **Step 2: Exécuter la checklist complète du spec**

Référence : section 9 du fichier `docs/superpowers/specs/2026-05-01-scanner-soft-gate-design.md`. Cocher chaque item au fur et à mesure :

**Parcours nominaux**
- [ ] Scan "EN DANGER" (comptable) : progress 88%, "// CLASSIFIÉ" pulse, gate apparaît, focus prénom.
- [ ] Soumission OK : gate disparaît, TRAJECTOIRE scramble, ACTIONS cascade, sources cascade, `[ ACCÈS ACCORDÉ ]`.
- [ ] localStorage `hasUnlockedScanner = "true"`.
- [ ] 2e scan immédiat : pas de gate, scan complet, result-zone "Rejoindre La Fréquence".

**Copy par statut**
- [ ] EN DANGER, EN MUTATION, PROTÉGÉ, EN CROISSANCE — vérifier headlines + sublines (cf. spec section 5).

**Cas limites**
- [ ] URL `?job=comptable` first visit : gate visible sans scan animé.
- [ ] URL `?job=comptable` returning visitor : tout en clair direct.
- [ ] Reset depuis gate : `scanner_gate_dismissed` envoyé.
- [ ] Email invalide : bouton disabled, pas d'appel API.
- [ ] Erreur API simulée (DevTools Network → Offline) : message d'erreur, retry possible.
- [ ] Email déjà inscrit (Brevo retourne duplicate) : scramble se déclenche normalement (succès silencieux).
- [ ] Honeypot rempli (DevTools → Elements → modifier `name="website"` à "spam" → soumettre) : pas de contact Brevo créé, pas d'event PostHog `scanner_gate_submitted`.

**Accessibilité**
- [ ] `prefers-reduced-motion` (DevTools → Rendering) : pas de scramble, settle direct.
- [ ] Tab order : suggestions → subject input → gate (prénom → email → consent → submit), honeypot skippé.
- [ ] Lecteur d'écran (VoiceOver `Cmd+F5` sur Mac) : badge `[ CLASSIFIÉ ]` annoncé via `aria-label="Section classifiée du rapport"`. `[ ACCÈS ACCORDÉ ]` annoncé via `role="status"`.

**PostHog (Live tab)**
- [ ] `scanner_gate_shown` envoyé une fois par entrée en `gated`.
- [ ] `scanner_gate_email_focused` envoyé seulement au premier focus.
- [ ] `scanner_gate_submitted` envoyé à chaque submit.
- [ ] `scanner_gate_succeeded` envoyé seulement sur 200.
- [ ] `scanner_gate_failed` envoyé avec `reason` correct (network/server/validation).
- [ ] `scanner_gate_dismissed` envoyé seulement si reset depuis `gated`.

**SEO / privacy**
- [ ] `view-source:localhost:3000/scanner` : meta description ne contient plus "sans inscription".
- [ ] `view-source:localhost:3000/scanner` : JSON-LD FAQPage Q3 reformulée.
- [ ] DOM `localhost:3000/scanner` : 3e question FAQ reformulée + lien `politique de confidentialité` cliquable.
- [ ] `localhost:3000/confidentialite` : nouveau paragraphe sur `hasUnlockedScanner` présent.

**Backend**
- [ ] Soumission scanner_gate → vérifier dans Brevo dashboard qu'un contact est créé avec `attributes.SOURCE = 'scanner_gate'`, `JOB_SLUG`, `JOB_STATUS`.
- [ ] Soumission depuis NewsletterForm sur `/frequence` → vérifier qu'un contact est créé avec `attributes.SOURCE = 'website'` (régression check).

- [ ] **Step 3: TypeScript + build check**

Run :
```bash
cd /Users/mathieu/Documents/survivor && npx nuxt prepare && npx vue-tsc --noEmit 2>&1 | tail -30
```
Expected : 0 erreur.

Run :
```bash
npm run build 2>&1 | tail -20
```
Expected : build OK.

- [ ] **Step 4: Commit final si tout passe**

S'il y a eu des micro-ajustements pendant la validation (typos copy, ajustements CSS) :
```bash
git add -A
git status
git commit -m "$(cat <<'EOF'
chore(scanner): fixes mineurs après validation manuelle

[décrire les ajustements précis ici]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

S'il n'y a aucun ajustement, sauter ce commit.

---

## Notes pour l'engineer qui exécute

1. **Pas de framework de test** — chaque task se valide dans le navigateur via `npm run dev`. Si tu en as l'occasion plus tard, ajoute vitest pour `useScannerUnlock` et la validation server-side de `subscribe.post.ts`.

2. **Vider localStorage entre tests** — beaucoup de tasks dépendent de `hasUnlockedScanner` étant absent. Garder l'habitude d'ouvrir DevTools → Console → `localStorage.removeItem('hasUnlockedScanner')` avant chaque cycle de test.

3. **PostHog en dev** — vérifier que la configuration PostHog du projet capte bien les events depuis `localhost`. Si non, ouvrir `app/composables/usePosthogEvent.ts` et confirmer que les events ne sont pas filtrés par environnement.

4. **Brevo API key en dev** — l'API renvoie 500 "Configuration serveur manquante" si `BREVO_API_KEY`/`BREVO_LIST_ID` ne sont pas set. Pour tester le path "submit OK" en dev sans toucher la prod, soit set les vars dans `.env`, soit mocker le fetch côté `subscribe.post.ts` pendant la session de test (à NE PAS commit).

5. **L'option `'result'` du type `phase` disparaît** — Task 7. Si tu vois encore `data-state="result"` dans le DOM rendu, c'est que la migration CSS du Step 5 de Task 7 est incomplète. Re-grep.

6. **Ordre des commits** — chaque task doit produire un commit autonome qui laisse le projet dans un état sain. Si une task échoue à mi-chemin, ne pas commit ; revert et re-tenter.

---

## Self-review

**Spec coverage** :
- ✅ Section 1 (architecture) → Tasks 1, 4, 7, 8
- ✅ Section 2 (state machine) → Task 7
- ✅ Section 3 (privacy) → Task 3
- ✅ Section 4 (animation choreography) → Tasks 5, 6, 7, 8
- ✅ Section 5 (gate UI + copy) → Task 4
- ✅ Section 6 (PostHog tracking) → Tasks 4, 7, 8
- ✅ Section 7 (backend) → Task 2
- ✅ Section 8 (cas limites) → Tasks 7, 8, 9
- ✅ Section 9 (validation manuelle) → Task 10

**Placeholder scan** : aucun TBD/TODO non résolu. Les blocs CSS et code sont complets et copy-paste-able.

**Type consistency** :
- `useScannerUnlock()` retourne `{ isUnlocked, markUnlocked }` — utilisé conformément dans ScannerGate (markUnlocked) et scanner.vue (isUnlocked).
- `phase: 'idle' | 'scanning' | 'gated' | 'unlocking' | 'unlocked'` — Task 7 supprime `'result'`, Tasks 8/9 utilisent les nouvelles valeurs.
- `ACTIONS[job.status]` reste un `string[]` à 3 éléments — utilisé identiquement dans startScan, unlockAndReveal, showResultImmediate.
- `scrambleTo(textRef, stateRef, finalText, duration)` — la signature actuelle accepte des `{ value: string }`, donc le proxy `get value()/set value(v)` est compatible (vérifié contre lignes 176-198 du scanner.vue actuel).

Plan complet.
