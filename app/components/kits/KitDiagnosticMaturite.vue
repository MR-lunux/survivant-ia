<!-- app/components/kits/KitDiagnosticMaturite.vue -->
<script setup lang="ts">
type Stage = 'quiz' | 'decrypting' | 'result'

const AXES = ['Objectif', 'Données', 'Processus', 'Culture', 'Gouvernance', 'Direction'] as const

const QUESTIONS = [
  { dim: 'Objectif', eyebrow: 'OBJECTIF · CAS D\'USAGE',
    text: 'As-tu identifié un problème métier précis que l\'IA viendrait résoudre ?',
    options: ['Non, une intuition générale', 'Un thème, pas un problème précis', 'Oui, un problème clair', 'Oui, avec un gain chiffré attendu'] },
  { dim: 'Objectif', eyebrow: 'OBJECTIF · MESURE',
    text: 'Sais-tu comment tu mesureras le succès du projet ?',
    options: ['Pas du tout', 'Vaguement', 'Quelques indicateurs', 'Indicateurs et seuil de réussite définis'] },

  { dim: 'Données', eyebrow: 'DONNÉES · ACCÈS',
    text: 'Tes données utiles sont-elles accessibles et au bon endroit ?',
    options: ['Éparpillées, difficiles d\'accès', 'Dispersées mais récupérables', 'Globalement centralisées', 'Centralisées et accessibles'] },
  { dim: 'Données', eyebrow: 'DONNÉES · QUALITÉ',
    text: 'Quelle confiance as-tu dans leur qualité (à jour, fiables, propres) ?',
    options: ['Faible', 'Moyenne', 'Bonne sur l\'essentiel', 'Élevée et vérifiée'] },

  { dim: 'Processus', eyebrow: 'PROCESSUS · DOCUMENTATION',
    text: 'Le processus que tu veux augmenter est-il documenté ?',
    options: ['Non, surtout dans les têtes', 'Partiellement', 'Pour l\'essentiel', 'Documenté et tenu à jour'] },
  { dim: 'Processus', eyebrow: 'PROCESSUS · STABILITÉ',
    text: 'Ce processus est-il stable, ou change-t-il sans arrêt ?',
    options: ['Très instable', 'Plutôt mouvant', 'Plutôt stable', 'Stable et maîtrisé'] },

  { dim: 'Culture', eyebrow: 'CULTURE · ADHÉSION',
    text: 'Comment tes équipes accueillent-elles l\'IA ?',
    options: ['Méfiance ou rejet', 'Curiosité prudente', 'Ouvertes', 'Déjà en train d\'expérimenter'] },
  { dim: 'Culture', eyebrow: 'CULTURE · COMPÉTENCES',
    text: 'As-tu des personnes capables de cadrer et porter un projet IA en interne ?',
    options: ['Personne', 'De la volonté, pas les compétences', 'Une ou deux personnes', 'Une équipe ou un référent identifié'] },

  { dim: 'Gouvernance', eyebrow: 'GOUVERNANCE · CADRE',
    text: 'As-tu un cadre pour évaluer un outil IA (données, sécurité, conformité nLPD/RGPD) ?',
    options: ['Aucun', 'On improvise au cas par cas', 'Une grille informelle', 'Un cadre formalisé'] },
  { dim: 'Gouvernance', eyebrow: 'GOUVERNANCE · DONNÉES',
    text: 'Sais-tu où vont les données quand tu utilises un outil IA ?',
    options: ['Aucune idée', 'Vaguement', 'Pour les outils principaux', 'Oui, tracé et validé'] },

  { dim: 'Direction', eyebrow: 'DIRECTION · SPONSOR',
    text: 'La direction soutient-elle activement le sujet ?',
    options: ['Pas vraiment', 'Curieuse mais passive', 'Soutien affiché', 'Sponsor engagé, avec budget'] },
  { dim: 'Direction', eyebrow: 'DIRECTION · ALIGNEMENT',
    text: 'Le projet est-il relié à un objectif d\'entreprise explicite ?',
    options: ['Non', 'Lien vague', 'Lien clair', 'Inscrit dans les priorités'] },
] as const

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const

const props = defineProps<{ kitId: string }>()

const { capture } = usePosthogEvent()

const stage = ref<Stage>('quiz')
const idx = ref(0)
const answers = ref<Record<number, number>>({})
const startedFired = ref(false)
const questionStartTime = ref(Date.now())
const diagnosticStartTime = ref(0)
const decryptTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const total = QUESTIONS.length
const currentQuestion = computed(() => QUESTIONS[idx.value])

function answer(val: number) {
  const now = Date.now()
  const timeOnQuestion = now - questionStartTime.value
  const q = QUESTIONS[idx.value]

  if (!startedFired.value) {
    capture('kit_diagnostic_started', { id: props.kitId })
    startedFired.value = true
    diagnosticStartTime.value = now
  }

  capture('kit_diagnostic_question_answered', {
    id: props.kitId,
    dimension: q.dim,
    question_index: idx.value + 1,
    answer_value: val,
    answer_text: q.options[val],
    time_on_question: timeOnQuestion,
  })

  answers.value = { ...answers.value, [idx.value]: val }

  if (idx.value + 1 < total) {
    idx.value += 1
    questionStartTime.value = Date.now()
  } else {
    stage.value = 'decrypting'
    decryptTimer.value = setTimeout(() => { stage.value = 'result' }, 1200)
  }
}

function goBack() {
  if (idx.value > 0) {
    capture('kit_diagnostic_back_clicked', { id: props.kitId, from_question_index: idx.value + 1 })
    idx.value -= 1
    questionStartTime.value = Date.now()
  }
}

function restart() {
  answers.value = {}
  idx.value = 0
  startedFired.value = false
  stage.value = 'quiz'
  questionStartTime.value = Date.now()
}

function maybeFireAbandoned() {
  if (startedFired.value && stage.value === 'quiz') {
    capture('kit_diagnostic_abandoned', {
      id: props.kitId,
      last_question_index: idx.value + 1,
      answers_given: Object.keys(answers.value).length,
    })
  }
}

onMounted(() => {
  questionStartTime.value = Date.now()
  if (import.meta.client) window.addEventListener('beforeunload', maybeFireAbandoned)
})

onBeforeUnmount(() => {
  if (decryptTimer.value) clearTimeout(decryptTimer.value)
  if (import.meta.client) window.removeEventListener('beforeunload', maybeFireAbandoned)
  maybeFireAbandoned()
})
</script>

<template>
  <div class="diag" role="region" aria-label="Diagnostic de maturité IA">
    <Transition name="fade-slide" mode="out-in">
      <div :key="stage + '-' + idx">

        <!-- QUIZ -->
        <div v-if="stage === 'quiz'" class="quiz-frame">
          <div class="prog-row">
            <span class="step-label">{{ String(idx + 1).padStart(2, '0') }} / {{ total }}</span>
            <div class="prog-bar" role="progressbar" aria-valuemin="0" :aria-valuenow="idx" :aria-valuemax="total">
              <span :style="{ width: `${(idx / total) * 100}%` }" />
            </div>
          </div>

          <div class="eyebrow">{{ currentQuestion.eyebrow }}</div>
          <div class="question">{{ currentQuestion.text }}</div>

          <div class="options">
            <button
              v-for="(opt, i) in currentQuestion.options"
              :key="i"
              type="button"
              class="opt"
              :data-attr="`kit-diag-option-${idx + 1}-${OPTION_KEYS[i]}`"
              @click="answer(i)"
            >
              <span class="opt-key">[ {{ OPTION_KEYS[i] }} ]</span>
              <span class="opt-text">{{ opt }}</span>
            </button>
          </div>

          <button
            v-if="idx > 0"
            type="button"
            class="back-btn"
            data-attr="kit-diag-back"
            @click="goBack"
          >
            ← Q PRÉCÉDENTE
          </button>
        </div>

        <!-- DECRYPTING -->
        <div v-else-if="stage === 'decrypting'" class="decrypting" aria-live="polite">
          <div class="decrypt-label">// ANALYSE EN COURS</div>
          <div class="decrypt-bar"><span /></div>
        </div>

        <!-- RESULT (placeholder — complété en Task 3) -->
        <div v-else-if="stage === 'result'" class="result-placeholder">
          <p style="color: var(--color-muted); font-family: var(--font-mono); font-size: 0.8rem;">
            // RÉSULTATS — Task 3
          </p>
          <button type="button" class="restart-btn" @click="restart">↻ REFAIRE</button>
        </div>

      </div>
    </Transition>
  </div>
</template>

<style scoped>
.diag { margin: 3rem 0; }

.quiz-frame {
  position: relative;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 2.5rem 2rem;
  min-height: 320px;
}
.quiz-frame::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 60px; height: 3px;
  background: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent-glow);
}

.prog-row {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 2rem;
}
.step-label {
  font-family: var(--font-mono); font-size: 0.7rem;
  letter-spacing: 0.14em; color: var(--color-muted);
  white-space: nowrap;
}
.prog-bar {
  flex: 1; height: 2px;
  background: var(--color-hairline); overflow: hidden;
}
.prog-bar span {
  display: block; height: 100%;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
  transition: width 0.35s ease;
}

.eyebrow {
  font-family: var(--font-mono); font-size: 0.65rem;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-accent); margin-bottom: 1rem;
}
.question {
  font-family: var(--font-serif); font-style: italic;
  font-size: 1.35rem; line-height: 1.4;
  color: var(--color-text); margin-bottom: 2rem;
}

.options {
  display: flex; flex-direction: column; gap: 0.75rem;
}
.opt {
  display: flex; align-items: flex-start; gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-hairline);
  background: transparent;
  text-align: left; cursor: pointer; width: 100%;
  font-family: var(--font-sans);
  transition: border-color 0.15s, background 0.15s;
}
.opt:hover { border-color: var(--color-accent); background: rgba(108, 227, 181, 0.04); }
.opt:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
.opt-key {
  font-family: var(--font-mono); font-size: 0.8rem;
  color: var(--color-accent); flex-shrink: 0;
}
.opt-text { color: var(--color-text-soft); font-size: 0.96rem; }

.back-btn {
  display: inline-block; margin-top: 1.75rem;
  background: none; border: none; cursor: pointer;
  font-family: var(--font-mono); font-size: 0.65rem;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--color-muted);
}
.back-btn:hover { color: var(--color-accent); }

/* Decrypting */
.decrypting {
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  padding: 5rem 0;
  border: 1px solid var(--color-rule); background: var(--color-surface);
}
.decrypt-label {
  font-family: var(--font-mono); font-size: 0.72rem;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--color-accent);
}
.decrypt-bar {
  width: 240px; height: 2px;
  background: var(--color-hairline); overflow: hidden;
}
.decrypt-bar span {
  display: block; height: 100%; width: 0;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
  animation: decrypt-fill 1.2s ease-out forwards;
}
@keyframes decrypt-fill { to { width: 100%; } }

/* Placeholder */
.result-placeholder {
  padding: 3rem 2rem; border: 1px solid var(--color-rule);
  display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
}
.restart-btn {
  background: none; border: 1px solid var(--color-hairline);
  cursor: pointer; font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--color-muted); padding: 0.6rem 1rem;
}
.restart-btn:hover { color: var(--color-accent); border-color: var(--color-accent); }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateX(12px); }
.fade-slide-leave-to   { opacity: 0; transform: translateX(-12px); }

@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active, .fade-slide-leave-active { transition: none; }
  .decrypt-bar span { animation: none; width: 100%; }
  .prog-bar span { transition: none; }
}
</style>
