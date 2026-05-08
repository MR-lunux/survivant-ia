<!-- app/components/kits/KitQuizQuestion.vue -->
<script setup lang="ts">
type Choice = { key: string; text: string; points: number }
type Question = { id: number; label: string; prompt: string; choices: Choice[] }

const props = defineProps<{
  question: Question
  index: number   // 1-based
  total: number
}>()

const emit = defineEmits<{
  answered: [{ questionId: number; choice: Choice }]
}>()

function pick(choice: Choice) {
  emit('answered', { questionId: props.question.id, choice })
}
</script>

<template>
  <div class="quiz-question">
    <div class="q-label">QUESTION {{ index }} / {{ total }} — {{ question.label }}</div>
    <div class="q-prompt">« {{ question.prompt }} »</div>
    <div class="q-choices">
      <button
        v-for="choice in question.choices"
        :key="choice.key"
        type="button"
        class="q-choice"
        :data-attr="`kit-quiz-choice-${index}-${choice.key.toLowerCase()}`"
        @click="pick(choice)"
      >
        <span class="key">[ {{ choice.key }} ]</span>
        <span class="text">{{ choice.text }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-question {
  display: flex; flex-direction: column;
}
.q-label {
  font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 1rem;
}
.q-prompt {
  font-family: var(--font-serif); font-style: italic;
  font-size: 1.4rem; line-height: 1.4;
  color: var(--color-text);
  margin-bottom: 2rem;
}
.q-choices {
  display: flex; flex-direction: column; gap: 0.75rem;
}
.q-choice {
  display: flex; align-items: flex-start; gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-hairline);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  width: 100%;
  font-family: var(--font-sans);
}
.q-choice:hover { border-color: var(--color-accent); background: rgba(108, 227, 181, 0.04); }
.q-choice .key {
  font-family: var(--font-mono); font-size: 0.85rem;
  color: var(--color-accent); flex-shrink: 0;
}
.q-choice .text { color: var(--color-text-soft); font-size: 0.96rem; }
</style>
