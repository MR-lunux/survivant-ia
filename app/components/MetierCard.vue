<!-- app/components/MetierCard.vue -->
<script setup lang="ts">
import type { Job, JobQuadrant } from '~/data/jobs'

defineProps<{
  job: Job
}>()

const QUADRANT_LABEL: Record<JobQuadrant, string> = {
  tiens:    'TU TIENS',
  pilotes:  'TU PILOTES',
  pivotes:  'TU PIVOTES',
  mutes:    'TU MUTES',
}

const QUADRANT_COLOR: Record<JobQuadrant, string> = {
  tiens:    'var(--color-protege)',
  pilotes:  'var(--color-croissance)',
  pivotes:  'var(--color-danger)',
  mutes:    'var(--color-mutation)',
}
</script>

<template>
  <NuxtLink
    :to="`/scanner/${job.slug}`"
    class="metier-card"
    :data-attr="`metier-card-${job.slug}`"
  >
    <h3 class="metier-card-label">{{ job.label }}</h3>
    <div class="metier-card-meta font-mono">
      <span
        class="metier-card-badge"
        :style="{ '--badge-color': QUADRANT_COLOR[job.quadrant] } as Record<string, string>"
      >
        {{ QUADRANT_LABEL[job.quadrant] }}
      </span>
      <span class="metier-card-risk">{{ job.risk }}%</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.metier-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #2A2A2A;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.15s, background 0.15s;
}
.metier-card:hover {
  border-color: var(--color-accent);
  background: rgba(108, 227, 181, 0.03);
}
.metier-card-label {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}
.metier-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  letter-spacing: 0.1em;
}
.metier-card-badge {
  color: var(--badge-color);
  font-weight: 700;
}
.metier-card-risk {
  color: var(--color-muted);
}
</style>
