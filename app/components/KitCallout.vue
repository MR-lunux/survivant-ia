<!-- app/components/KitCallout.vue -->
<script setup lang="ts">
type KitInfo = {
  code: string
  kind: string
  title: string
  specs: string[]
  path?: string
  calloutPitch?: string
  description?: string
}

const props = defineProps<{
  kit: KitInfo
  fromArticleSlug: string
}>()

const { capture } = usePosthogEvent()

const target = computed(() => `${props.kit.path ?? `/outils/${props.kit.code.toLowerCase()}`}?from=article`)
const pitch = computed(() => props.kit.calloutPitch || props.kit.description || '')

function onClick() {
  capture('kit_cta_clicked_from_article', {
    from_article_slug: props.fromArticleSlug,
    to_kit_id: props.kit.code,
  })
}
</script>

<template>
  <NuxtLink
    :to="target"
    class="kit-callout"
    :data-attr="`kit-callout-${kit.code.toLowerCase()}`"
    @click="onClick"
  >
    <div class="callout-kicker">
      <span class="glyph" aria-hidden="true"></span>
      DU LIRE AU FAIRE
    </div>

    <div class="callout-id-row">
      <span class="callout-id">{{ kit.code }}</span>
      <span class="sep">·</span>
      <span class="callout-kind">{{ kit.kind.toUpperCase() }} INTERACTIF</span>
    </div>

    <h3 class="callout-title">{{ kit.title }}</h3>

    <p class="callout-pitch">{{ pitch }}</p>

    <div class="callout-specs">
      <span v-for="(s, i) in kit.specs" :key="i">{{ s }}</span>
    </div>

    <div class="callout-cta-row">
      <span class="callout-button">▶ MESURER MA RÉSILIENCE</span>
      <span class="callout-side-note">Reste sur le site · Aucune collecte</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.kit-callout {
  display: block;
  position: relative;
  border: 1px solid var(--color-accent-soft);
  background: linear-gradient(135deg, rgba(108, 227, 181, 0.04) 0%, transparent 60%), var(--color-surface);
  padding: 2.5rem 2rem;
  margin: 3rem 0;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease;
  overflow: hidden;
}
.kit-callout::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 80px; height: 3px;
  background: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent-glow);
  transition: width 0.25s ease;
}
.kit-callout:hover { border-color: var(--color-accent); }
.kit-callout:hover::before { width: 140px; }

.callout-kicker {
  display: inline-flex; align-items: center; gap: 0.6em;
  font-family: var(--font-mono);
  font-size: 0.7rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--color-accent);
  margin-bottom: 1.5rem;
}
.callout-kicker .glyph {
  display: inline-block; width: 0.65em; height: 0.65em;
  background: var(--color-accent);
  box-shadow: 0 0 6px rgba(108, 227, 181, 0.55);
  animation: glyph-spin 8s linear infinite;
}
@keyframes glyph-spin { to { transform: rotate(360deg); } }

.callout-id-row {
  display: flex; gap: 0.85rem; align-items: center;
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--color-muted);
  margin-bottom: 0.85rem;
}
.callout-id { color: var(--color-accent); font-weight: 600; }
.sep { color: var(--color-dim); }

.callout-title {
  font-family: var(--font-serif); font-style: italic;
  font-weight: 400;
  font-size: 1.7rem; line-height: 1.25;
  color: var(--color-text);
  margin: 0 0 1rem;
}

.callout-pitch {
  color: var(--color-text-soft);
  font-size: 1rem; line-height: 1.65;
  margin: 0 0 1.5rem;
}

.callout-specs {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-muted-soft);
  margin-bottom: 1.5rem;
  display: flex; gap: 0.85rem; flex-wrap: wrap;
}
.callout-specs span:not(:last-child)::after {
  content: '·'; margin-left: 0.85rem; color: var(--color-dim);
}

.callout-cta-row {
  display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;
}
.callout-button {
  display: inline-block;
  background: var(--color-accent);
  color: var(--color-bg);
  padding: 0.95rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
}
.callout-side-note {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-muted-soft);
}

@media (prefers-reduced-motion: reduce) {
  .callout-kicker .glyph { animation: none; }
  .kit-callout, .kit-callout::before { transition: none; }
}
</style>
