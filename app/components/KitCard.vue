<!-- app/components/KitCard.vue -->
<script setup lang="ts">
import { getOutilCta } from '~/data/outil-ctas'

type KitProp = {
  code: string
  kind: string
  title: string
  description: string
  specs: string[]
  path?: string
}

const props = defineProps<{
  kit?: KitProp
  /** Variant 'coming' = placeholder « PROCHAINEMENT » non cliquable */
  variant?: 'kit' | 'coming'
  /** Position in the grid (1-based), used for tracking */
  position?: number
}>()

const emit = defineEmits<{
  'card-click': [{ code: string; position: number }]
}>()

const isComing = computed(() => props.variant === 'coming')
const target = computed(() => {
  if (isComing.value) return undefined
  if (!props.kit?.path) return undefined
  return `${props.kit.path}?from=list`
})

function onClick() {
  if (isComing.value) return
  if (!props.kit) return
  emit('card-click', { code: props.kit.code, position: props.position ?? 0 })
}
</script>

<template>
  <NuxtLink
    v-if="!isComing && target"
    :to="target"
    class="kit-card"
    :data-attr="`kit-card-${kit?.code?.toLowerCase()}`"
    @click="onClick"
  >
    <div class="card-meta">
      <span class="card-id">{{ kit?.code }}</span>
      <span class="card-kind">{{ kit?.kind?.toUpperCase() }}</span>
    </div>
    <h3 class="card-title">{{ kit?.title }}</h3>
    <p class="card-desc">{{ kit?.description }}</p>
    <div class="card-specs">
      <span v-for="(s, i) in kit?.specs ?? []" :key="i">{{ s }}</span>
    </div>
    <div class="card-cta">▶ {{ getOutilCta(kit?.code ?? '', kit?.kind ?? '') }}</div>
  </NuxtLink>

  <div v-else class="kit-card coming" aria-hidden="true">
    <div class="card-meta">
      <span class="card-id">??-??</span>
      <span class="card-kind">PROCHAIN OUTIL</span>
    </div>
    <h3 class="card-title">PROCHAINEMENT</h3>
    <p class="card-desc">Le prochain instrument de la boîte arrive avec son article. Reste à la Fréquence pour le recevoir en premier.</p>
    <div class="card-specs">
      <span>EN PRÉPARATION</span>
    </div>
    <div class="card-cta">— —</div>
  </div>
</template>

<style scoped>
.kit-card {
  position: relative;
  display: flex; flex-direction: column;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.75rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}
.kit-card:hover {
  border-color: var(--color-accent);
  background: var(--color-surface-2);
  transform: translateY(-2px);
}
.kit-card::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 36px; height: 2px;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
  transition: width 0.25s ease;
}
.kit-card:hover::before { width: 60px; }

.card-meta {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}
.card-id { color: var(--color-accent); font-weight: 600; }
.card-kind {
  border: 1px solid var(--color-hairline-strong);
  padding: 0.2rem 0.55rem;
  color: var(--color-muted);
}

.card-title {
  font-family: var(--font-serif); font-style: italic;
  font-weight: 400;
  font-size: 1.45rem; line-height: 1.25;
  margin: 0 0 0.85rem;
  color: var(--color-text);
}
.card-desc {
  font-size: 0.92rem;
  color: var(--color-muted);
  margin: 0 0 1.5rem;
  flex: 1;
}

.card-specs {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted-soft);
  margin-bottom: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-hairline);
  display: flex; gap: 0.85rem; flex-wrap: wrap;
}
.card-specs span:not(:last-child)::after {
  content: '·'; margin-left: 0.85rem; color: var(--color-dim);
}

.card-cta {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
}

/* Coming variant */
.kit-card.coming {
  cursor: default;
  opacity: 0.7;
  border-style: dashed;
  background: transparent;
}
.kit-card.coming:hover { transform: none; border-color: var(--color-rule); background: transparent; }
.kit-card.coming::before { display: none; }
.kit-card.coming .card-id { color: var(--color-muted); }
.kit-card.coming .card-title {
  font-style: normal; font-family: var(--font-mono);
  font-size: 0.95rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--color-muted);
}
.kit-card.coming .card-cta { color: var(--color-muted-soft); }
</style>
