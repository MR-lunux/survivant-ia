<!-- app/components/MetierSimilaires.vue -->
<script setup lang="ts">
import type { Job } from '~/data/jobs'
import { getSimilarJobs } from '~/utils/job-similars'
import MetierCard from './MetierCard.vue'

const props = defineProps<{
  job: Job
}>()

const { capture } = usePosthogEvent()

const similaires = computed(() => getSimilarJobs(props.job, 5))

function onSimilarClick(toSlug: string) {
  capture('metier_similar_clicked', {
    from_slug: props.job.slug,
    to_slug: toSlug,
    from_secteur: props.job.secteur,
  })
}
</script>

<template>
  <div class="metier-similaires">
    <h3 class="similaires-heading font-mono">Métiers similaires</h3>
    <div class="similaires-grid">
      <div
        v-for="similar in similaires"
        :key="similar.slug"
        @click="onSimilarClick(similar.slug)"
      >
        <MetierCard :job="similar" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.metier-similaires {}
.similaires-heading {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--color-accent);
  text-transform: uppercase;
  margin: 0 0 16px;
  font-weight: 400;
}
.similaires-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
</style>
