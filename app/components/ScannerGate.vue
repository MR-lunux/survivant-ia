<!-- app/components/ScannerGate.vue -->
<script setup lang="ts">
import type { Job } from '~/data/jobs'

const props = defineProps<{ job: Job }>()
const emit = defineEmits<{ unlocked: [] }>()

const { capture } = usePosthogEvent()
const { markUnlocked } = useScannerUnlock()

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

    <h3 class="gate-headline">Accès restreint.</h3>
    <p class="gate-subline">
      Déverrouille la fin du rapport et rejoins La Fréquence pour garder une longueur d'avance sur l'IA.
      <span class="gate-rassur-inline">Gratuit, sans jargon.</span>
    </p>

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
        :disabled="!canSubmit"
      >
        {{ status === 'loading' ? 'DÉCHIFFREMENT...' : 'DÉCHIFFRER MON PLAN D\'ACTION' }}
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
.gate-rassur-inline {
  display: inline;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  margin-left: 0.25rem;
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
