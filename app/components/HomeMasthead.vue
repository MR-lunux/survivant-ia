<!-- app/components/HomeMasthead.vue -->
<template>
  <div class="masthead">
    <div class="masthead-inner container">
      <span class="masthead-num">{{ num }}</span>
      <h2 class="masthead-title">{{ title }}</h2>
      <span class="masthead-meta">{{ meta }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  num: string    // 'II' | 'III' | 'IV' | 'V' | 'VI'
  title: string  // section heading (h2 — kept for SEO)
  meta: string   // tagline / context
}>()
</script>

<style scoped>
.masthead {
  padding: 1.85rem 0 1.1rem;
  border-top: 1px solid var(--color-rule);
  border-bottom: 1px solid var(--color-rule);
  margin: 3.5rem 0 2rem;
  background: linear-gradient(180deg, transparent, rgba(91, 163, 122, 0.025), transparent);
}

.masthead-inner {
  display: flex;
  gap: 3rem;
  align-items: baseline;
  flex-wrap: wrap;
}

.masthead-num {
  font-family: var(--font-serif);
  font-style: italic;
  font-variation-settings: "opsz" 144;
  font-size: 4rem;
  font-weight: 500;
  line-height: 1;
  color: var(--color-accent);
}

.masthead-title {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: 1.9rem;
  font-weight: 500;
  margin: 0;
  color: var(--color-text);
  letter-spacing: -0.01em;
  line-height: 1.15;
  flex: 1;
}

.masthead-meta {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .masthead-num { font-size: 3rem; }
  .masthead-title { font-size: 1.4rem; }
}
</style>
