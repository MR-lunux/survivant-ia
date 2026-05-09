<!-- app/components/MetierEditorialSection.vue -->
<script setup lang="ts">
import type { Job, JobQuadrant } from '~/data/jobs'

defineProps<{
  job: Job
  contexte: string         // HTML markdown autorisé
  trajectoire: string
  anticipation: string
}>()

const QUADRANT_HEADING: Record<JobQuadrant, string> = {
  tiens:    'Pourquoi ton métier tient',
  pilotes:  'Pourquoi tu es bien placé',
  pivotes:  'Pourquoi tu dois anticiper',
  mutes:    'Pourquoi ton métier mute',
}
</script>

<template>
  <section class="metier-editorial">
    <div class="section-kicker font-mono">
      <span class="num">— III.</span>
      <span class="label">{{ QUADRANT_HEADING[job.quadrant] }}</span>
    </div>

    <article class="editorial-content">
      <!-- Angle 1 — Contexte sectoriel -->
      <div class="editorial-angle" v-html="contexte" />

      <!-- Angle 2 — Trajectoire concrète -->
      <h3 class="editorial-subheading">Une trajectoire concrète</h3>
      <div class="editorial-angle" v-html="trajectoire" />

      <!-- Angle 3 — Anticipation 2026-2030 -->
      <h3 class="editorial-subheading">Ce qui vient pour ton métier</h3>
      <div class="editorial-angle" v-html="anticipation" />
    </article>
  </section>
</template>

<style scoped>
.metier-editorial { padding: 0 32px; }
.section-kicker {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
}
.section-kicker .num { color: var(--color-accent); }
.section-kicker .label {
  letter-spacing: 0.22em;
  color: var(--color-text);
  opacity: 0.7;
}

.editorial-content {
  max-width: 680px;
}
.editorial-angle {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-text);
  opacity: 0.92;
  margin-bottom: 28px;
}
.editorial-angle :deep(p) { margin: 0 0 1em 0; }
.editorial-angle :deep(p:last-child) { margin-bottom: 0; }
.editorial-angle :deep(strong) { color: var(--color-accent); font-weight: 600; }
.editorial-angle :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-color: rgba(108, 227, 181, 0.35);
  text-underline-offset: 3px;
}
.editorial-angle :deep(a:hover) {
  text-decoration-color: var(--color-accent);
}

.editorial-subheading {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 400;
  color: var(--color-text);
  margin: 36px 0 20px 0;
}
</style>
