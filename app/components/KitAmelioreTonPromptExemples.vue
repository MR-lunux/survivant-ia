<!-- app/components/KitAmelioreTonPromptExemples.vue -->
<script setup lang="ts">
import { AMELIORER_PROMPT_EXAMPLES, type AmeliorerPromptExample } from '~/data/ameliorer-prompt-examples'

const emit = defineEmits<{
  (e: 'example-clicked', example: AmeliorerPromptExample, position: number): void
}>()

function onClick(example: AmeliorerPromptExample, idx: number) {
  emit('example-clicked', example, idx + 1)
}
</script>

<template>
  <section class="kx" aria-labelledby="kx-heading">
    <header class="kx-head">
      <KickerLabel>VOIS CE QUE ÇA DONNE</KickerLabel>
      <h2 id="kx-heading" class="kx-title">3 exemples avant / après</h2>
    </header>

    <div class="kx-grid">
      <button
        v-for="(ex, idx) in AMELIORER_PROMPT_EXAMPLES"
        :key="ex.id"
        type="button"
        class="kx-card"
        @click="onClick(ex, idx)"
      >
        <span class="kx-category">{{ ex.category }}</span>
        <span class="kx-label">{{ ex.label }}</span>
        <span class="kx-hint">{{ ex.hint }}</span>
        <span class="kx-cta">Tester avec cet exemple →</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.kx { margin: 3rem 0; }

.kx-head { margin-bottom: 1.5rem; }
.kx-title {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.3rem, 3vw, 1.8rem);
  color: var(--color-text);
  margin: 0.6rem 0 0;
}

.kx-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.kx-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  text-align: left;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.25rem 1.25rem 1.5rem;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.kx-card:hover,
.kx-card:focus-visible {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  outline: none;
}

.kx-category {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--color-accent);
}

.kx-label {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.15rem;
  color: var(--color-text);
}

.kx-hint {
  font-family: var(--font-sans);
  font-size: 0.88rem;
  color: var(--color-muted);
  line-height: 1.5;
}

.kx-cta {
  margin-top: auto;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent);
}

@media (max-width: 720px) {
  .kx-grid {
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: 78%;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }
  .kx-card { scroll-snap-align: start; }
}
</style>
