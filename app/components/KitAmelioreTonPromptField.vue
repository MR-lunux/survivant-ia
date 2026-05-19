<!-- app/components/KitAmelioreTonPromptField.vue -->
<script setup lang="ts">
// Champ pédagogique atomique : label + texte péda + valeur (idle / loading / success).
// Utilisé 6× par KitAmelioreTonPromptOutput.

defineProps<{
  label: string
  pedaText: string
  placeholderExample: string
  value: string | null
  state: 'idle' | 'loading' | 'success'
  fieldKey: 'role' | 'task' | 'format' | 'context' | 'constraints' | 'examples'
}>()
</script>

<template>
  <div class="kf" :data-state="state" :data-field="fieldKey">
    <span class="kf-label">{{ label }}</span>
    <p class="kf-peda">{{ pedaText }}</p>

    <div v-if="state === 'idle'" class="kf-placeholder">
      ex : <em>{{ placeholderExample }}</em>
    </div>

    <div v-else-if="state === 'loading'" class="kf-skeleton" aria-hidden="true">
      <span class="kf-skel-line" />
      <span class="kf-skel-line short" />
    </div>

    <div v-else-if="state === 'success' && value" class="kf-value">
      {{ value }}
    </div>
  </div>
</template>

<style scoped>
.kf {
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.kf[data-state="success"] {
  border-color: var(--color-accent);
  background: color-mix(in oklab, var(--color-surface) 92%, var(--color-accent));
}

.kf-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.kf-peda {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--color-muted);
  margin: 0;
}

.kf-placeholder {
  font-family: var(--font-sans);
  font-size: 0.88rem;
  color: var(--color-dim);
  line-height: 1.5;
}
.kf-placeholder em {
  font-style: italic;
  color: var(--color-muted);
}

.kf-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.kf-skel-line {
  height: 0.85rem;
  background: linear-gradient(90deg, #27272a 0%, #3f3f46 50%, #27272a 100%);
  background-size: 200% 100%;
  animation: kf-shimmer 1.2s ease-in-out infinite;
}
.kf-skel-line.short { width: 60%; }

@keyframes kf-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.kf-value {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  animation: kf-fadein 220ms ease-out both;
}

@keyframes kf-fadein {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .kf-skel-line { animation: none; }
  .kf-value { animation: none; }
}
</style>
