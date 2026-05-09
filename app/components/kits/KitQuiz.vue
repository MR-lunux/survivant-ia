<!-- app/components/kits/KitQuiz.vue -->
<script setup lang="ts">
type Choice = { key: string; text: string; points: number }
type Question = { id: number; label: string; prompt: string; choices: Choice[] }
type Tier = { range: [number, number]; slug: string; color: string; label: string; status: string; body: string }
type NewsletterVariant = { kicker: string; h3: string; body: string }
type QuizData = {
  questions: Question[]
  tiers: Tier[]
  newsletter: { lucide: NewsletterVariant; dependance: NewsletterVariant; atrophie: NewsletterVariant }
}

const props = defineProps<{
  kitId: string
  data: QuizData
}>()

const { capture } = usePosthogEvent()
const startedFired = ref(false)

type State = 'question' | 'decrypting' | 'result'

const state = ref<State>('question')
const currentIndex = ref(0)              // 0-based
const answers = ref<Map<number, Choice>>(new Map())
const total = computed(() => props.data.questions.length)
const currentQuestion = computed(() => props.data.questions[currentIndex.value])

const score = computed(() => {
  let s = 0
  for (const c of answers.value.values()) s += c.points
  return s
})

const tier = computed(() => {
  const s = score.value
  return props.data.tiers.find(t => s >= t.range[0] && s <= t.range[1]) ?? props.data.tiers[0]
})

function onAnswered(payload: { questionId: number; choice: Choice }) {
  // Fire kit_quiz_started on the very first answer
  if (!startedFired.value) {
    capture('kit_quiz_started', { id: props.kitId })
    startedFired.value = true
  }

  capture('kit_quiz_question_answered', {
    id: props.kitId,
    question: payload.questionId,
    choice: payload.choice.key,
    points: payload.choice.points,
  })

  answers.value.set(payload.questionId, payload.choice)

  if (currentIndex.value < total.value - 1) {
    currentIndex.value += 1
  } else {
    state.value = 'decrypting'
    capture('kit_quiz_completed', {
      id: props.kitId,
      score: score.value,
      tier: tier.value.slug,
    })
    // Decrypting animation duration = 1200ms (Task 13 will refine, here we just transition)
    setTimeout(() => { state.value = 'result' }, 1200)
  }
}

function goBack() {
  if (currentIndex.value > 0) currentIndex.value -= 1
}

function restart() {
  capture('kit_quiz_restarted', { id: props.kitId })
  answers.value.clear()
  currentIndex.value = 0
  startedFired.value = false
  state.value = 'question'
}

defineExpose({ restart })

function maybeFireAbandoned() {
  if (startedFired.value && state.value === 'question') {
    capture('kit_quiz_abandoned', {
      id: props.kitId,
      last_question: currentIndex.value + 1,
    })
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('beforeunload', maybeFireAbandoned)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('beforeunload', maybeFireAbandoned)
  }
  maybeFireAbandoned()
})
</script>

<template>
  <div class="kit-quiz" role="region" aria-label="Quiz interactif">
    <div class="quiz-frame">
      <Transition name="fade-slide" mode="out-in">
        <div :key="state + '-' + currentIndex">
          <KitQuizQuestion
            v-if="state === 'question' && currentQuestion"
            :question="currentQuestion"
            :index="currentIndex + 1"
            :total="total"
            @answered="onAnswered"
          />

          <div v-else-if="state === 'decrypting'" class="quiz-decrypting" aria-live="polite">
            <div class="decrypt-label">// CALCUL EN COURS</div>
            <div class="decrypt-bar"><span /></div>
          </div>

          <KitQuizResult
            v-else-if="state === 'result'"
            :kit-id="kitId"
            :score="score"
            :tier="tier"
            :total="total"
            :newsletter-variants="data.newsletter"
            @restart="restart"
          />
        </div>
      </Transition>
    </div>

    <div v-if="state === 'question'" class="quiz-controls">
      <button
        v-if="currentIndex > 0"
        type="button"
        class="back-btn"
        data-attr="kit-quiz-back"
        @click="goBack"
      >◀ Q PRÉCÉDENTE</button>
      <span v-else class="back-spacer"></span>

      <div class="progress" :aria-label="`Question ${currentIndex + 1} sur ${total}`">
        <span
          v-for="(_, i) in data.questions"
          :key="i"
          class="dot"
          :class="{ done: answers.has(data.questions[i].id) }"
        />
      </div>

      <span class="back-spacer"></span>
    </div>
  </div>
</template>

<style scoped>
.kit-quiz {
  margin: 3rem 0;
}
.quiz-frame {
  position: relative;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 2.5rem 2rem;
  min-height: 280px;
}
.quiz-frame::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 60px; height: 3px;
  background: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent-glow);
}

/* Decrypting */
.quiz-decrypting {
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  padding: 3rem 0;
}
.decrypt-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.decrypt-bar {
  width: 240px; height: 2px;
  background: var(--color-hairline);
  overflow: hidden;
  position: relative;
}
.decrypt-bar span {
  display: block; height: 100%; width: 0;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
  animation: decrypt-fill 1.2s ease-out forwards;
}
@keyframes decrypt-fill { to { width: 100%; } }

/* Controls */
.quiz-controls {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1.5rem;
}
.back-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0.5rem 0;
}
.back-btn:hover { color: var(--color-accent); }
.back-spacer { display: inline-block; min-width: 90px; }
.progress { display: flex; gap: 0.4rem; }
.progress .dot {
  width: 28px; height: 2px;
  background: var(--color-hairline);
  transition: background 0.2s;
}
.progress .dot.done {
  background: var(--color-accent);
  box-shadow: 0 0 4px var(--color-accent-glow);
}

/* Transition */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateX(12px); }
.fade-slide-leave-to   { opacity: 0; transform: translateX(-12px); }

@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active, .fade-slide-leave-active { transition: none; }
  .decrypt-bar span { animation: none; width: 100%; }
}
</style>
