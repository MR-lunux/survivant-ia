<!-- app/components/MetierFAQ.vue -->
<script setup lang="ts">
import type { Job } from '~/data/jobs'

const props = defineProps<{
  job: Job
  faq: Array<{ question: string, answer: string }>
}>()
</script>

<template>
  <FaqAccordion
    :faqs="props.faq"
    kicker-num="- IV."
    kicker-label="Questions fréquentes"
    event-name="metier_faq_opened"
    :event-props="{ slug: props.job.slug }"
  />
</template>
