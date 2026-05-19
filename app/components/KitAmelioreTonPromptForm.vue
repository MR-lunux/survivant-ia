<!-- app/components/KitAmelioreTonPromptForm.vue -->
<script setup lang="ts">
import { checkPromptClientModeration } from '~/utils/prompt-moderation'

const props = defineProps<{
  state: 'idle' | 'loading' | 'success' | 'error'
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'submit', value: string): void
  (e: 'client-validation-error', reason: string): void
  (e: 'client-moderation-error'): void
}>()

const MAX_LENGTH = 4000
const MIN_WORDS = 5

const localError = ref<string | null>(null)

const wordCount = computed(() => {
  const trimmed = props.modelValue.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(w => w.length > 0).length
})

const charCount = computed(() => props.modelValue.length)

const canSubmit = computed(() => {
  return props.state !== 'loading' && wordCount.value >= MIN_WORDS && charCount.value <= MAX_LENGTH
})

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  if (localError.value) localError.value = null
}

function onSubmit() {
  const trimmed = props.modelValue.trim()
  if (trimmed.length === 0) {
    localError.value = 'Décris au moins ce que tu veux que l\'IA fasse.'
    emit('client-validation-error', 'empty')
    return
  }
  if (wordCount.value < MIN_WORDS) {
    localError.value = `Décris ta demande avec au moins ${MIN_WORDS} mots.`
    emit('client-validation-error', 'too_short')
    return
  }
  if (charCount.value > MAX_LENGTH) {
    localError.value = `Ton prompt est très long. Garde-le sous ${MAX_LENGTH} caractères.`
    emit('client-validation-error', 'too_long')
    return
  }
  const mod = checkPromptClientModeration(trimmed)
  if (!mod.ok) {
    localError.value = 'Ce prompt ne passe pas. Survivant-IA refuse les contenus injurieux, sexuels explicites, ou qui dénigrent une personne. Reformule en restant pro.'
    emit('client-moderation-error')
    return
  }
  emit('submit', trimmed)
}
</script>

<template>
  <form class="kfm" @submit.prevent="onSubmit">
    <label class="kfm-label" for="kfm-input">TON PROMPT</label>
    <textarea
      id="kfm-input"
      class="kfm-textarea"
      :value="modelValue"
      @input="onInput"
      placeholder="Colle ici ton prompt brut. Exemple : « Fais-moi un mail de relance pour un client qui répond pas »"
      :disabled="state === 'loading'"
      rows="6"
      :maxlength="MAX_LENGTH + 200"
    />
    <div class="kfm-meta">
      <span class="kfm-count" :data-warn="charCount > MAX_LENGTH">
        {{ charCount }} / {{ MAX_LENGTH }} caractères · {{ wordCount }} mot{{ wordCount > 1 ? 's' : '' }}
      </span>
      <button
        type="submit"
        class="kfm-submit"
        :disabled="!canSubmit"
      >
        {{ state === 'loading' ? 'L\'IA réfléchit…' : 'Améliore mon prompt' }}
        <span v-if="state !== 'loading'" class="kfm-arrow" aria-hidden="true">→</span>
      </button>
    </div>
    <p v-if="localError" class="kfm-error" role="alert">{{ localError }}</p>
  </form>
</template>

<style scoped>
.kfm {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 2rem 0;
}

.kfm-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.kfm-textarea {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.55;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-rule);
  padding: 1rem 1.25rem;
  resize: vertical;
  min-height: 8rem;
  transition: border-color 0.2s ease;
}
.kfm-textarea:focus { outline: none; border-color: var(--color-accent); }
.kfm-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

.kfm-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.kfm-count {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-muted);
}
.kfm-count[data-warn="true"] { color: var(--color-warn, #ffb84d); }

.kfm-submit {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  padding: 0.85rem 1.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s ease, color 0.2s ease;
}
.kfm-submit:hover:not(:disabled) {
  background: var(--color-accent);
  color: var(--color-bg);
}
.kfm-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.kfm-error {
  font-family: var(--font-sans);
  font-size: 0.92rem;
  color: #ff6b6b;
  margin: 0;
}

@media (max-width: 720px) {
  .kfm-submit {
    position: sticky;
    bottom: 1rem;
    width: 100%;
    justify-content: center;
  }
}
</style>
