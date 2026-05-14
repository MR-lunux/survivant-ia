<!-- app/components/OutilsMetierSection.vue -->
<script setup lang="ts">
import { outilsForMetier } from '~/data/outils-manifest'

const props = defineProps<{ metierSlug: string }>()

// Static manifest avoids runtime SQLite query (better-sqlite3 native
// binding fails on Vercel serverless). Synced manually with
// content/outils/*.md frontmatter — see app/data/outils-manifest.ts.
const outils = computed(() => outilsForMetier(props.metierSlug))
const visible = computed(() => outils.value.length > 0)
</script>

<template>
  <section v-if="visible" class="outils-metier">
    <div class="kicker">OUTILS POUR PILOTER L'IA DANS CE MÉTIER</div>
    <h2>Des <em>outils concrets</em> pour ce métier.</h2>
    <div class="cards">
      <NuxtLink
        v-for="tool in outils ?? []"
        :key="tool.code"
        :to="`${tool.path}?from=metier`"
        class="card"
      >
        <div class="card-status">{{ String(tool.kind).toUpperCase() }}</div>
        <div class="card-title">{{ tool.title }}</div>
        <div class="card-desc">{{ tool.subtitle }}</div>
        <div class="card-cta">Tester l'outil →</div>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.outils-metier { margin: 4rem 0 3rem; padding-top: 3rem; border-top: 1px solid var(--color-rule); }
.kicker { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-accent); margin-bottom: 1rem; }
h2 { font-family: var(--font-serif); font-style: italic; font-weight: 400; font-size: clamp(1.6rem, 4vw, 2.2rem); line-height: 1.2; margin: 0 0 1.75rem; color: var(--color-text); }
h2 em { color: var(--color-accent); font-style: italic; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
.card { display: block; border: 1px solid var(--color-rule); background: var(--color-surface); padding: 1.5rem; text-decoration: none; color: inherit; transition: border-color 0.2s; }
.card:hover { border-color: var(--color-accent); }
.card-status { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.16em; color: var(--color-accent); margin-bottom: 0.85rem; }
.card-title { font-family: var(--font-serif); font-style: italic; font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--color-text); }
.card-desc { font-size: 0.88rem; color: var(--color-text-soft); line-height: 1.55; margin-bottom: 1rem; }
.card-cta { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.12em; color: var(--color-accent); text-transform: uppercase; }
</style>
