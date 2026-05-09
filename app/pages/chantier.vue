<!-- app/pages/chantier.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Chantier — Survivant-IA',
  description: 'On réfléchit à un format pour passer de la lecture à la pratique. Dis-nous ce qui t\'intéresserait.',
  ogTitle: 'On ouvre un chantier — Survivant-IA',
  ogDescription: 'Un format pour passer de la lecture à la pratique. On y réfléchit. Dis-nous ce qui t\'intéresserait.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'On ouvre un chantier — Survivant-IA',
  twitterDescription: 'Un format pour passer de la lecture à la pratique. Dis-nous ce qui t\'intéresserait.',
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
    capture('chantier_intent_failed', {
      reason,
      error_message: err?.data?.message ?? err?.message ?? 'unknown',
    })
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
  position: relative;
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
