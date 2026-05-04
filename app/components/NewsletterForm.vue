<!-- app/components/NewsletterForm.vue -->
<template>
  <section id="newsletter" class="newsletter" aria-labelledby="newsletter-heading">
    <div class="container">
      <div class="newsletter-inner">
        <span class="newsletter-eyebrow" data-reveal>La Fréquence</span>
        <h2 id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
          Reste un <em>cran devant</em>.<br>
          <strong>Un nouvel article chaque semaine.</strong>
        </h2>
        <p class="newsletter-lead" data-reveal data-reveal-delay="2">
          Cinq minutes de lecture, sans hype, sans funnel, sans sponsor.
          Que des outils et signaux que j'utilise vraiment. Formations approfondies pour ceux qui veulent aller plus loin (bientôt).
        </p>

        <form
          v-if="status !== 'success'"
          class="newsletter-form"
          data-reveal
          data-reveal-delay="3"
          @submit.prevent="submit"
        >
          <div class="nl-field">
            <label class="nl-label" for="nl-prenom">Prénom</label>
            <input
              id="nl-prenom"
              v-model="prenom"
              type="text"
              placeholder="Ton prénom"
              class="nl-input"
              :disabled="status === 'loading'"
              required
            />
          </div>

          <div class="nl-field nl-field-action">
            <label class="nl-label" for="nl-email">Email</label>
            <div class="nl-row">
              <input
                id="nl-email"
                v-model="email"
                type="email"
                placeholder="ton@email.com"
                class="nl-input"
                :disabled="status === 'loading'"
                required
                @focus="onEmailFocus"
              />
              <button
                type="submit"
                class="nl-submit"
                :disabled="!canSubmit"
              >
                {{ status === 'loading' ? 'Envoi…' : 'Rejoindre' }}
                <span class="nl-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <label class="nl-consent">
            <input
              v-model="consent"
              type="checkbox"
              :disabled="status === 'loading'"
            />
            <span>
              J'accepte de recevoir la newsletter hebdomadaire et j'ai pris connaissance de la
              <NuxtLink to="/confidentialite" target="_blank">Politique de confidentialité</NuxtLink>.
            </span>
          </label>

          <p v-if="errorMsg" class="nl-error" role="alert">{{ errorMsg }}</p>
        </form>

        <p v-else class="nl-success" data-reveal>
          <em>Bienvenue dans la Fréquence.</em><br>
          La première lettre arrive mardi prochain.
        </p>

        <p v-if="status !== 'success'" class="newsletter-meta" data-reveal data-reveal-delay="4">
          Désabonnement en un clic · sans spam
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { capture } = usePosthogEvent()
const route = useRoute()
const sourcePage = computed(() => route.path)
const focusedOnce = ref(false)

function onEmailFocus() {
  if (focusedOnce.value) return
  focusedOnce.value = true
  capture('newsletter_form_focused', { source_page: sourcePage.value })
}

const prenom  = ref('')
const email   = ref('')
const consent = ref(false)
const status  = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMsg = ref('')

const canSubmit = computed(() =>
  prenom.value.trim().length > 0 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
  consent.value &&
  status.value !== 'loading'
)

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
</script>

<style scoped>
/* ── Section ──────────────────────────────────── */
.newsletter {
  padding: 4rem 0 5rem;
  position: relative;
  overflow: hidden;
}
.newsletter::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(91, 163, 122, 0.08), transparent 50%);
  pointer-events: none;
}

.newsletter-inner {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

/* ── Heading ──────────────────────────────────── */
.newsletter-eyebrow {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}
.newsletter-eyebrow::before {
  content: '';
  width: 28px; height: 1px;
  background: var(--color-accent);
}

.newsletter-h2 {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-weight: 400;
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  line-height: 1.05;
  letter-spacing: -0.015em;
  color: var(--color-text);
  margin: 0 0 1.25rem;
}
.newsletter-h2 em {
  font-style: italic;
  color: var(--color-accent);
}
.newsletter-h2 strong {
  font-weight: 800;
}

.newsletter-lead {
  font-family: var(--font-serif-body);
  font-size: 1.1rem;
  color: var(--color-muted);
  line-height: 1.6;
  max-width: 50ch;
  margin: 0 auto 2.5rem;
}

/* ── Form (hairline editorial) ────────────────── */
.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 520px;
  margin: 0 auto;
  text-align: left;
}

.nl-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-bottom: 1px solid var(--color-rule);
  padding-bottom: 0.4rem;
  transition: border-color 0.2s ease;
}
.nl-field:focus-within { border-bottom-color: var(--color-accent); }

.nl-label {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.nl-input {
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-serif-body);
  font-size: 1.05rem;
  color: var(--color-text);
  padding: 0.4rem 0;
  width: 100%;
}
.nl-input::placeholder {
  color: var(--color-dim);
  font-style: italic;
}
.nl-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nl-row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}
.nl-row .nl-input { flex: 1; }

.nl-submit {
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
  flex-shrink: 0;
}
.nl-submit:not(:disabled):hover { gap: 0.85rem; }
.nl-submit:disabled {
  color: var(--color-muted);
  cursor: not-allowed;
  opacity: 0.6;
}
.nl-arrow { transition: transform 0.25s ease; }

/* ── Consent ──────────────────────────────────── */
.nl-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--color-muted);
  cursor: pointer;
  line-height: 1.5;
}
.nl-consent input[type="checkbox"] {
  margin-top: 0.15rem;
  flex-shrink: 0;
  accent-color: var(--color-accent);
}
.nl-consent a { color: var(--color-accent); text-decoration: underline; }

/* ── States ───────────────────────────────────── */
.nl-error {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--color-danger);
  margin: 0;
}

.nl-success {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: 1.4rem;
  color: var(--color-text);
  line-height: 1.4;
  margin: 0;
}
.nl-success em {
  font-style: italic;
  color: var(--color-accent);
}

.newsletter-meta {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--color-muted);
  margin: 1rem 0 0;
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 540px) {
  .nl-row { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .nl-submit { justify-content: flex-start; padding-top: 0.6rem; }
  .newsletter-h2 { font-size: clamp(1.7rem, 7vw, 2.2rem); }
}

@media (prefers-reduced-motion: reduce) {
  .nl-submit, .nl-arrow, .nl-field { transition: none !important; }
}
</style>
