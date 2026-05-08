<!-- app/components/kits/KitQuizResult.vue -->
<script setup lang="ts">
type Tier = { range: [number, number]; slug: string; color: string; label: string; status: string; body: string }
type NewsletterVariant = { kicker: string; h3: string; body: string }
type NewsletterVariants = { lucide: NewsletterVariant; dependance: NewsletterVariant; atrophie: NewsletterVariant }

const props = defineProps<{
  kitId: string
  score: number
  tier: Tier
  total: number
  newsletterVariants: NewsletterVariants
}>()

const emit = defineEmits<{
  restart: []
}>()

// Map color slug → CSS variable
const colorVar = computed(() => {
  const map: Record<string, string> = {
    accent: 'var(--color-accent)',
    mutation: 'var(--color-mutation)',
    danger: 'var(--color-danger)',
    protege: 'var(--color-protege)',
    croissance: 'var(--color-croissance)',
  }
  return map[props.tier.color] ?? 'var(--color-accent)'
})

const colorVarSoft = computed(() => {
  // Build an rgba shadow color from the same color slug
  const map: Record<string, string> = {
    accent: 'rgba(108, 227, 181, 0.5)',
    mutation: 'rgba(255, 166, 48, 0.5)',
    danger: 'rgba(255, 62, 62, 0.5)',
    protege: 'rgba(91, 192, 235, 0.5)',
    croissance: 'rgba(61, 220, 132, 0.5)',
  }
  return map[props.tier.color] ?? 'rgba(108, 227, 181, 0.5)'
})

const newsletterVariant = computed(() => {
  return props.newsletterVariants[props.tier.slug as keyof NewsletterVariants] ?? props.newsletterVariants.dependance
})
</script>

<template>
  <div
    class="kit-result"
    :style="{
      '--tier-color': colorVar,
      '--tier-color-glow': colorVarSoft,
    }"
  >
    <!-- Result card -->
    <div class="result-card">
      <div class="result-id">{{ kitId }}</div>
      <div class="result-meta">
        <span>TEST TERMINÉ</span> · <span class="timer">CALCUL: 1.2s</span>
      </div>

      <div class="score-block">
        <div class="score-num">{{ score }}<small>/{{ total }}</small></div>
        <div class="score-info">
          <div class="score-label">// STATUT</div>
          <div class="score-tier">{{ tier.label }}</div>
        </div>
      </div>

      <div class="status-line">
        <span class="led" aria-hidden="true"></span>
        <span class="status-label">NIVEAU :</span>
        <span class="status-value">{{ tier.status.toUpperCase() }}</span>
      </div>

      <p class="result-body">{{ tier.body }}</p>

      <div class="result-actions">
        <button
          type="button"
          class="action-secondary"
          data-attr="kit-quiz-restart"
          @click="emit('restart')"
        >↻ Recommencer le test</button>
      </div>
    </div>

    <!-- Newsletter CTA contextualized by tier -->
    <NewsletterForm
      context="kit-result"
      :kit-id="kitId"
      :tier="tier.slug"
      :kicker="newsletterVariant.kicker"
      :h3="newsletterVariant.h3"
      :body="newsletterVariant.body"
    />
  </div>
</template>

<style scoped>
.kit-result {
  display: flex; flex-direction: column; gap: 2.5rem;
}
.result-card {
  position: relative;
  border: 1px solid var(--tier-color);
  background: var(--color-surface);
  padding: 3rem 2.5rem;
  overflow: hidden;
}
.result-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--tier-color);
  box-shadow: 0 0 20px var(--tier-color-glow);
}
.result-id {
  position: absolute;
  top: 1.25rem; right: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--color-muted);
}
.result-meta {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 1rem;
}
.result-meta .timer { color: var(--tier-color); }

.score-block {
  display: flex; align-items: baseline; gap: 1.5rem;
  margin-bottom: 2rem; padding-bottom: 2rem;
  border-bottom: 1px dashed var(--tier-color-glow);
}
.score-num {
  font-family: var(--font-mono);
  font-size: 5rem; font-weight: 600;
  color: var(--tier-color);
  line-height: 1; letter-spacing: -0.02em;
  text-shadow: 0 0 30px var(--tier-color-glow);
}
.score-num small { font-size: 1.5rem; color: var(--color-muted); margin-left: 0.25rem; font-weight: 400; }
.score-info { flex: 1; padding-bottom: 0.5rem; }
.score-label {
  font-family: var(--font-mono);
  font-size: 0.7rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--color-muted);
  margin-bottom: 0.5rem;
}
.score-tier {
  font-family: var(--font-mono);
  font-size: 1.5rem; font-weight: 600;
  letter-spacing: 0.08em; color: var(--tier-color);
  text-transform: uppercase;
  text-shadow: 0 0 12px var(--tier-color-glow);
}

.status-line {
  font-family: var(--font-mono);
  font-size: 0.85rem; letter-spacing: 0.06em;
  margin-bottom: 1.5rem;
  display: flex; align-items: center; gap: 0.6rem;
}
.led {
  display: inline-block; width: 8px; height: 8px;
  background: var(--tier-color);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--tier-color);
  animation: led-pulse 1.5s infinite;
}
@keyframes led-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
.status-label { color: var(--color-muted); }
.status-value { color: var(--tier-color); font-weight: 600; }

.result-body {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.2rem; line-height: 1.65;
  color: var(--color-text);
  margin: 0 0 2rem;
  padding-left: 1.5rem;
  border-left: 2px solid var(--tier-color);
}

.result-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.action-secondary {
  background: transparent;
  border: 1px solid var(--color-hairline-strong);
  color: var(--color-muted);
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.action-secondary:hover { border-color: var(--color-accent); color: var(--color-accent); }

@media (prefers-reduced-motion: reduce) {
  .led { animation: none; }
}

@media (max-width: 640px) {
  .score-block { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .result-card { padding: 1.5rem; }
}
</style>
