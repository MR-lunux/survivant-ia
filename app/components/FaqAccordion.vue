<!-- app/components/FaqAccordion.vue -->
<script setup lang="ts">
interface FaqItem {
  question: string
  answer: string
}

const props = defineProps<{
  faqs: FaqItem[]
  kickerNum?: string
  kickerLabel?: string
  eventName?: string
  eventProps?: Record<string, unknown>
}>()

const { capture } = usePosthogEvent()

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: props.faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }),
  }],
}))

function onAccordionToggle(event: Event, index: number, question: string) {
  const target = event.target as HTMLDetailsElement
  if (target.open && props.eventName) {
    capture(props.eventName, {
      ...(props.eventProps ?? {}),
      question_index: index,
      question_text: question,
    })
  }
}
</script>

<template>
  <section class="faq-accordion">
    <div v-if="kickerLabel" class="section-kicker font-mono">
      <span v-if="kickerNum" class="num">{{ kickerNum }}</span>
      <span class="label">{{ kickerLabel }}</span>
    </div>

    <div class="faq-list">
      <details
        v-for="(item, i) in faqs"
        :key="i"
        class="faq-item"
        @toggle="onAccordionToggle($event, i, item.question)"
      >
        <summary class="faq-question">
          <span class="faq-q-text">{{ item.question }}</span>
          <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
        </summary>
        <p class="faq-answer">{{ item.answer }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.faq-accordion { padding: 0; }
.section-kicker {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}
.section-kicker .num { color: var(--color-accent); }
.section-kicker .label {
  letter-spacing: 0.22em;
  color: var(--color-text);
  opacity: 0.7;
}

.faq-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(108, 227, 181, 0.12);
}
.faq-item {
  border-bottom: 1px solid rgba(108, 227, 181, 0.12);
  transition: background 0.2s;
}
.faq-item:hover { background: var(--color-surface-2); }
.faq-item[open] { background: var(--color-surface-2); }
.faq-question {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  user-select: none;
}
.faq-question::-webkit-details-marker { display: none; }
.faq-q-text { flex: 1; line-height: 1.45; }
.faq-q-icon {
  flex-shrink: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-muted);
  transition: transform 0.2s ease, color 0.15s;
  width: 1.5em;
  text-align: center;
}
.faq-item[open] .faq-q-icon {
  transform: rotate(45deg);
  color: var(--color-accent);
}
.faq-answer {
  padding: 0 1.5rem 1.5rem;
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-muted);
  max-width: 75ch;
}
</style>
