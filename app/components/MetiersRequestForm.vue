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
