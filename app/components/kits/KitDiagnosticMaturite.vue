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

const LEVELS = [
  { min: 0,  code: 'Palier 0', name: 'Angle mort',       tone: 'var(--color-danger)',
    body: 'Les fondations ne sont pas là. Lancer un projet IA maintenant, c\'est gaspiller du budget pour suivre la mode. Construis d\'abord la base — un objectif clair, des données propres, des processus documentés.' },
  { min: 26, code: 'Palier 1', name: 'Velléités',         tone: 'var(--color-mutation)',
    body: 'De l\'envie, peu de socle. C\'est le profil qui rejoint les organisations qui abandonnent leur projet IA en cours de route. Comble les écarts ci-dessous avant de te lancer pour de bon.' },
  { min: 46, code: 'Palier 2', name: 'Prêt à piloter',   tone: '#E8C13D',
    body: 'Assez solide pour un pilote ciblé et mesurable — pas pour un déploiement large. Choisis un seul cas d\'usage, prouve la valeur, puis avance.' },
  { min: 66, code: 'Palier 3', name: 'Prêt à déployer',  tone: '#6FA86B',
    body: 'Les fondations sont en place. Tu peux passer à l\'échelle, méthodiquement, en gardant un œil sur les 1 ou 2 points encore faibles.' },
  { min: 86, code: 'Palier 4', name: 'Mature',            tone: 'var(--color-accent)',
    body: 'L\'IA est intégrée à ta façon de travailler. L\'enjeu n\'est plus de démarrer mais d\'optimiser, de gouverner et de diffuser.' },
] as const

const ADVICE: Record<string, string> = {
  Objectif:    'Pars d\'un seul cas d\'usage douloureux et chiffrable. Pas dix. Un, défini avant de toucher au moindre outil.',
  Données:     'Fais l\'état des lieux de tes données avant tout pilote : où elles sont, qui y accède, leur fiabilité. C\'est l\'obstacle n°1 documenté.',
  Processus:   'Documente le processus que tu veux augmenter. L\'IA amplifie un processus clair et casse sur un processus implicite.',
  Culture:     'Travaille l\'adhésion avant l\'outil. Un pilote imposé à une équipe méfiante échoue, quelle que soit la qualité du modèle.',
  Gouvernance: 'Pose une grille de conformité (nLPD/RGPD, sécurité) avant de tester un outil. En contexte réglementé, ce n\'est pas négociable.',
  Direction:   'Sécurise un sponsor à la direction, relié à un objectif explicite. Sans ça, le projet meurt à la première friction.',
}

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

const result = computed(() => {
  const byDim: Record<string, number[]> = {}
  AXES.forEach(d => { byDim[d] = [] })
  QUESTIONS.forEach((q, i) => byDim[q.dim].push(answers.value[i] ?? 0))

  const dims = AXES.map(d => {
    const avg = byDim[d].reduce((a, b) => a + b, 0) / byDim[d].length
    return { dim: d, ratio: avg / 3, pct: Math.round((avg / 3) * 100), avg }
  })
  const overall = Math.round(dims.reduce((a, d) => a + d.ratio, 0) / dims.length * 100)

  let level = LEVELS[0] as typeof LEVELS[number]
  LEVELS.forEach(l => { if (overall >= l.min) level = l })
  const levelIndex = LEVELS.indexOf(level as (typeof LEVELS)[number])

  const weak = [...dims].sort((a, b) => a.avg - b.avg).filter(d => d.avg < 1.5).slice(0, 3)

  return { dims, overall, level, levelIndex, weak }
})

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
    const r = result.value
    const timeToComplete = Date.now() - diagnosticStartTime.value

    capture('kit_diagnostic_completed', {
      id: props.kitId,
      overall_score: r.overall,
      level_code: r.level.code,
      level_name: r.level.name,
      score_objectif:    r.dims.find(d => d.dim === 'Objectif')?.pct ?? 0,
      score_donnees:     r.dims.find(d => d.dim === 'Données')?.pct ?? 0,
      score_processus:   r.dims.find(d => d.dim === 'Processus')?.pct ?? 0,
      score_culture:     r.dims.find(d => d.dim === 'Culture')?.pct ?? 0,
      score_gouvernance: r.dims.find(d => d.dim === 'Gouvernance')?.pct ?? 0,
      score_direction:   r.dims.find(d => d.dim === 'Direction')?.pct ?? 0,
      weak_dims: r.weak.map(d => d.dim),
      time_to_complete: timeToComplete,
    })

    decryptTimer.value = setTimeout(() => {
      stage.value = 'result'
      const r2 = result.value
      capture('kit_diagnostic_result_viewed', {
        id: props.kitId,
        overall_score: r2.overall,
        level_code: r2.level.code,
        level_name: r2.level.name,
        score_objectif:    r2.dims.find(d => d.dim === 'Objectif')?.pct ?? 0,
        score_donnees:     r2.dims.find(d => d.dim === 'Données')?.pct ?? 0,
        score_processus:   r2.dims.find(d => d.dim === 'Processus')?.pct ?? 0,
        score_culture:     r2.dims.find(d => d.dim === 'Culture')?.pct ?? 0,
        score_gouvernance: r2.dims.find(d => d.dim === 'Gouvernance')?.pct ?? 0,
        score_direction:   r2.dims.find(d => d.dim === 'Direction')?.pct ?? 0,
        weak_dims: r2.weak.map(d => d.dim),
      })
    }, 1200)
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
  const r = result.value
  capture('kit_diagnostic_restarted', {
    id: props.kitId,
    previous_score: r.overall,
    previous_level: r.level.code,
  })
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

        <!-- RESULT -->
        <div v-else-if="stage === 'result'" class="result">

          <!-- Palier -->
          <div class="result-panel">
            <div class="palier-code" :style="{ color: result.level.tone }">
              ● {{ result.level.code }} — {{ result.level.name }}
            </div>
            <h2 class="palier-name">{{ result.level.name }}.</h2>
            <p class="palier-body">{{ result.level.body }}</p>

            <!-- Ladder -->
            <div class="ladder" aria-label="Échelle de maturité">
              <div
                v-for="(l, i) in LEVELS"
                :key="i"
                class="rung"
              >
                <div
                  class="rung-bar"
                  :style="{
                    background: i <= result.levelIndex ? result.level.tone : 'var(--color-hairline)'
                  }"
                />
                <div
                  class="rung-lab"
                  :style="{ color: i === result.levelIndex ? 'var(--color-text)' : 'var(--color-muted)' }"
                >{{ l.name }}</div>
              </div>
            </div>

            <div class="score-line">
              Indice de maturité :
              <strong>{{ result.overall }}</strong>/100
            </div>
          </div>

          <!-- Section label -->
          <div class="section-label">PROFIL PAR DIMENSION</div>

          <!-- Radar placeholder — complété en Task 4 -->
          <div class="result-panel radar-panel">
            <p class="placeholder-label">// RADAR — Task 4</p>
          </div>

          <!-- Priorités -->
          <div v-if="result.weak.length > 0" class="result-panel">
            <div class="section-label" style="margin: 0 0 0.75rem;">TES PRIORITÉS — PAR ORDRE D'URGENCE</div>
            <div class="recos">
              <div
                v-for="(d, i) in result.weak"
                :key="d.dim"
                class="reco"
              >
                <span class="reco-n">{{ String(i + 1).padStart(2, '0') }}</span>
                <div>
                  <div class="reco-title">{{ d.dim }}</div>
                  <div class="reco-body">{{ ADVICE[d.dim] }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Restart -->
          <button type="button" class="restart-btn" data-attr="kit-diag-restart" @click="restart">
            ↻ REFAIRE LE DIAGNOSTIC
          </button>
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

/* Result */
.result { display: flex; flex-direction: column; gap: 1.5rem; }

.result-panel {
  position: relative;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 2rem;
}
.result-panel::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 60px; height: 3px;
  background: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent-glow);
}

.palier-code {
  font-family: var(--font-mono); font-size: 0.72rem;
  letter-spacing: 0.14em; text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.palier-name {
  font-family: var(--font-serif); font-style: italic; font-weight: 400;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  line-height: 1.1; color: var(--color-text);
  margin: 0.4rem 0 1rem;
}
.palier-body {
  color: var(--color-text-soft); font-size: 0.97rem; line-height: 1.65;
  max-width: 62ch;
}

.ladder {
  display: flex; gap: 0.4rem;
  margin: 1.5rem 0 0.5rem;
}
.rung { flex: 1; }
.rung-bar {
  height: 5px; border-radius: 5px;
  transition: background 0.3s;
}
.rung-lab {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.04em; text-transform: uppercase;
  margin-top: 0.5rem; line-height: 1.3;
}

.score-line {
  font-family: var(--font-mono); font-size: 0.8rem;
  color: var(--color-muted); margin-top: 1rem;
}
.score-line strong {
  color: var(--color-text); font-size: 1.3rem; margin: 0 0.15rem;
}

.section-label {
  font-family: var(--font-mono); font-size: 0.65rem;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-muted); margin: 0.5rem 0;
}

.radar-panel { min-height: 120px; display: grid; place-items: center; }
.placeholder-label {
  color: var(--color-muted); font-family: var(--font-mono); font-size: 0.75rem; text-align: center;
}

.recos { display: flex; flex-direction: column; }
.reco {
  display: flex; gap: 1rem;
  padding: 1.25rem 0;
  border-top: 1px solid var(--color-hairline);
}
.reco:first-child { border-top: none; padding-top: 0; }
.reco-n {
  font-family: var(--font-mono); font-size: 0.8rem;
  color: var(--color-accent); font-weight: 600;
  flex-shrink: 0; width: 1.8rem;
}
.reco-title { font-weight: 600; font-size: 0.97rem; color: var(--color-text); margin-bottom: 0.3rem; }
.reco-body { color: var(--color-muted); font-size: 0.9rem; line-height: 1.55; }

.restart-btn {
  align-self: center;
  background: none; border: 1px solid var(--color-hairline);
  cursor: pointer; font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--color-muted); padding: 0.75rem 1.5rem;
  transition: color 0.15s, border-color 0.15s;
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
  .rung-bar { transition: none; }
}
</style>
