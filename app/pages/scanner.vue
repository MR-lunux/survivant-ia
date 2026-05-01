<!-- app/pages/scanner.vue -->
<script setup lang="ts">
import { findJobBySlug, searchJobs, type Job } from '~/data/jobs'
import { getSourcesByIds, type Source } from '~/data/sources'
import SourcesModal from '~/components/SourcesModal.vue'

// ── SEO ──────────────────────────────────────────────────
useSeoMeta({
  title: 'Scanner IA — Tester si mon métier est menacé par l\'IA | Survivant-IA',
  description: 'Teste en 10 secondes le risque que l\'IA remplace ton métier. Score basé sur les rapports 2026 (Tufts, McKinsey, WEF). Gratuit, sans inscription.',
  ogTitle: 'Scanner IA — Mon métier est-il menacé par l\'IA ?',
  ogDescription: 'Score de risque automatisation en 10 secondes. Données 2026 (Tufts, McKinsey, WEF). Survivant-IA.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Mon métier est-il menacé par l\'IA ?',
  twitterDescription: 'Test gratuit en 10 secondes. Données 2026 (Tufts, McKinsey, WEF). Survivant-IA.',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': 'https://survivant-ia.ch/scanner#app',
          name: 'Scanner IA — Risque automatisation par métier',
          url: 'https://survivant-ia.ch/scanner',
          description: 'Teste en 10 secondes si ton métier est menacé par l\'IA. Score d\'obsolescence basé sur les rapports 2026 (Tufts, McKinsey, WEF).',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          inLanguage: 'fr-CH',
          isPartOf: { '@id': 'https://survivant-ia.ch/#website' },
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://survivant-ia.ch/scanner?job={job_slug}',
            },
            'query-input': 'required name=job_slug',
          },
        },
        {
          '@type': 'FAQPage',
          '@id': 'https://survivant-ia.ch/scanner#faq',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Comment est calculé le score de risque d\'automatisation IA ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Le score est une estimation éditoriale informée par un ensemble de recherches : études académiques (Tufts University, PayScope), rapports de cabinets (McKinsey, Goldman Sachs), institutions internationales (WEF) et données de plateformes (LinkedIn). Il donne une tendance sectorielle — pas un algorithme mécanique. Les sources complètes sont accessibles depuis chaque résultat.',
              },
            },
            {
              '@type': 'Question',
              name: 'Quels métiers sont les plus menacés par l\'IA en 2026 ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Les professions les plus exposées sont celles à forte composante répétitive : agents de saisie (90 %), télévendeurs (92 %), correcteurs (85 %), traducteurs (82 %). Ces métiers sont touchés sur un horizon de 2 ans selon les projections 2026.',
              },
            },
            {
              '@type': 'Question',
              name: 'Mes données personnelles sont-elles enregistrées ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Non. Le scanner ne collecte aucune donnée personnelle. Aucune inscription n\'est nécessaire. Seuls des événements anonymes d\'usage sont transmis pour améliorer l\'outil.',
              },
            },
            {
              '@type': 'Question',
              name: 'Combien de métiers sont couverts par le scanner IA ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '197 métiers sont analysés, répartis en 4 catégories : EN DANGER, EN MUTATION SÉVÈRE, PROTÉGÉ et EN CROISSANCE. Chaque analyse inclut un score de risque (0–100 %), un horizon d\'impact et une dynamique anticipée.',
              },
            },
            {
              '@type': 'Question',
              name: 'Les résultats du scanner IA sont-ils fiables ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Les scores reflètent l\'état des recherches académiques en 2026. Ils donnent une tendance sectorielle, pas une prédiction individuelle garantie. Chaque résultat inclut ses sources pour que vous puissiez évaluer la solidité des données.',
              },
            },
          ],
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
            { '@type': 'ListItem', position: 2, name: 'Scanner IA' },
          ],
        },
      ],
    }),
  }],
})

defineOgImage('Default', {
  title: 'Mon métier est-il menacé par l\'IA ?',
  kicker: '// SCANNER · 10 SECONDES',
})

// ── Popular jobs ─────────────────────────────────────────
const POPULAR_JOBS = [
  { slug: 'comptable',            label: 'Comptable' },
  { slug: 'developpeur-logiciel', label: 'Développeur logiciel' },
  { slug: 'infirmier',            label: 'Infirmier' },
  { slug: 'commercial',           label: 'Commercial B2B' },
  { slug: 'chef-de-projet-it',    label: 'Chef de projet IT' },
  { slug: 'avocat',               label: 'Avocat' },
  { slug: 'medecin-generaliste',  label: 'Médecin généraliste' },
  { slug: 'recruteur',            label: 'Recruteur' },
  { slug: 'journaliste-presse',   label: 'Journaliste' },
  { slug: 'data-scientist',       label: 'Data Scientist' },
]

// ── Static content ───────────────────────────────────────
const STATUS_LABELS: Record<Job['status'], string> = {
  danger:     'EN DANGER',
  mutation:   'EN MUTATION SÉVÈRE',
  protege:    'PROTÉGÉ',
  croissance: 'EN CROISSANCE',
}

const ACTIONS: Record<Job['status'], string[]> = {
  danger: [
    'Identifie les tâches de ton poste qui nécessitent jugement et relation humaine — c\'est ton bouclier.',
    'Commence à piloter l\'IA plutôt que la subir : automatise ce qui te ralentit, garde le contrôle sur ce qui sort.',
    'Renforce ta valeur relationnelle dans ton équipe et ton secteur. L\'irremplaçabilité se construit dans les liens.',
  ],
  mutation: [
    'Cartographie ton rôle : distingue ce qui va disparaître de ce qui va évoluer — ce sont deux trajectoires différentes.',
    'Apprends à superviser l\'IA sur les tâches qui t\'échappent déjà — tu restes maître si tu maîtrises l\'outil.',
    'Développe la couche de jugement que l\'IA ne peut pas reproduire : contexte métier, éthique, décision en incertitude.',
  ],
  protege: [
    'Documente ce qui rend ton travail irremplaçable — c\'est ton capital le plus précieux, rends-le visible.',
    'Utilise l\'IA pour déléguer les tâches répétitives et concentre-toi sur ce qui crée de la valeur humaine.',
    'Reste en veille : ta position protégée aujourd\'hui peut basculer dans 5 ans. Anticipe plutôt que réagir.',
  ],
  croissance: [
    'Capitalise sur la demande actuelle — c\'est le moment de monter en compétence et en visibilité dans ton domaine.',
    'Utilise l\'IA comme multiplicateur de productivité : tu produis plus, pas moins bien.',
    'Anticipe la prochaine vague : les métiers en croissance aujourd\'hui ne sont pas immunisés pour toujours.',
  ],
}

// ── PostHog ──────────────────────────────────────────────
const { capture } = usePosthogEvent()

function jobProps(job: Job, source: 'suggestion' | 'url_param') {
  return {
    job_slug:    job.slug,
    job_label:   job.label,
    job_status:  job.status,
    job_risk:    job.risk,
    job_horizon: job.horizon,
    source,
  }
}

// ── Scramble helpers ─────────────────────────────────────
const SCRAMBLE_CHARS = '█▓▒░·#@%&*+/?\\|^~-_=<>'
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
const randStr = (len: number) =>
  Array.from({ length: Math.max(2, len) }, () =>
    SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
  ).join('')

type DecryptState = 'locked' | 'scrambling' | 'decrypted'

function scrambleTo(
  textRef: { value: string },
  stateRef: { value: string },
  finalText: string,
  durationMs: number,
): Promise<void> {
  return new Promise(resolve => {
    stateRef.value = 'scrambling'
    const len = finalText.length
    const start = Date.now()
    const tick = () => {
      if (Date.now() - start < durationMs) {
        textRef.value = randStr(len)
        requestAnimationFrame(tick)
      } else {
        textRef.value = finalText
        stateRef.value = 'decrypted'
        resolve()
      }
    }
    requestAnimationFrame(tick)
  })
}

function countUpTo(
  textRef: { value: string },
  stateRef: { value: string },
  target: number,
  scrambleDuration: number,
  countDuration: number,
): Promise<void> {
  return new Promise(resolve => {
    stateRef.value = 'scrambling'
    const start = Date.now()
    const scrambleTick = () => {
      if (Date.now() - start < scrambleDuration) {
        textRef.value = randStr(2)
        requestAnimationFrame(scrambleTick)
      } else {
        stateRef.value = 'decrypted'
        textRef.value = '0'
        const steps = 30
        const interval = countDuration / steps
        let current = 0
        const t = setInterval(() => {
          current += target / steps
          if (current >= target) {
            textRef.value = String(target)
            clearInterval(t)
            resolve()
          } else {
            textRef.value = String(Math.round(current))
          }
        }, interval)
      }
    }
    requestAnimationFrame(scrambleTick)
  })
}

// ── State ────────────────────────────────────────────────
const route  = useRoute()
const router = useRouter()

const query       = ref('')
const suggestions = ref<Job[]>([])
const phase       = ref<'idle' | 'scanning' | 'result'>('idle')
const selectedJob = ref<Job | null>(null)
const copied      = ref(false)
const jobInputRef = ref<HTMLInputElement | null>(null)
const showInput   = ref(true)

// Decryption state
const riskText    = ref('XX')
const horizonText = ref('XX')
const statusText  = ref('EN MUTATION SÉVÈRE')
const riskState    = ref<DecryptState>('locked')
const horizonState = ref<DecryptState>('locked')
const statusState  = ref<DecryptState>('locked')
const trajVisible  = ref(false)
const actionsRevealed  = ref<boolean[]>([false, false, false])
const progressPct  = ref(0)
const jobSources   = ref<Source[]>([])
const revealedSources = ref<boolean[]>([])

const sourcesModalOpen = ref(false)

let copyTimer:     ReturnType<typeof setTimeout> | null = null
let noResultsTimer: ReturnType<typeof setTimeout> | null = null
let currentScanId = 0

// ── Computed ─────────────────────────────────────────────
const statusColorClass = computed(() => {
  if (statusState.value !== 'decrypted' || !selectedJob.value) return ''
  return `color-${selectedJob.value.status}`
})

const currentActions = computed<string[]>(() =>
  selectedJob.value ? ACTIONS[selectedJob.value.status] : ACTIONS.mutation
)

const ctaHook = computed(() => {
  if (!selectedJob.value) return ''
  switch (selectedJob.value.status) {
    case 'danger':     return 'La Fréquence te montre comment mettre ces 3 axes en pratique — une technique concrète par semaine.'
    case 'mutation':   return 'La Fréquence t\'accompagne dans cette mutation — une carte de survie par semaine, sans jargon.'
    case 'protege':    return 'La Fréquence te permet de garder une longueur d\'avance — sans devenir expert en IA.'
    case 'croissance': return 'La Fréquence te donne les outils pour capitaliser sur ta position — avant que la fenêtre ne se referme.'
  }
})

const ctaButton = computed(() =>
  selectedJob.value?.status === 'danger' ? 'Rejoindre La Fréquence' : "S'inscrire"
)

// ── Autocomplete ─────────────────────────────────────────
watch(query, (val) => {
  suggestions.value = searchJobs(val)
  if (noResultsTimer) clearTimeout(noResultsTimer)
  if (val.length >= 3 && suggestions.value.length === 0) {
    noResultsTimer = setTimeout(() => {
      capture('scanner_search_no_results', { query: val.trim() })
      noResultsTimer = null
    }, 600)
  }
})

function selectJob(job: Job) {
  suggestions.value = []
  selectedJob.value = job
  capture('scanner_job_selected', jobProps(job, 'suggestion'))
  startScan(job)
}

// ── Dynamic meta ─────────────────────────────────────────
function setDynamicMeta(job: Job) {
  useHead({
    meta: [
      { property: 'og:title',       content: `Mon risque IA : ${job.risk}% — ${job.label} | Survival Check` },
      { property: 'og:description', content: `J'ai scanné mon métier sur survivant-ia.ch. Résultat : ${STATUS_LABELS[job.status]}. Et toi ?` },
    ],
  })
}

// ── Scan ─────────────────────────────────────────────────
function resetDecryptState() {
  riskText.value    = 'XX'
  horizonText.value = 'XX'
  statusText.value  = 'EN MUTATION SÉVÈRE'
  riskState.value    = 'locked'
  horizonState.value = 'locked'
  statusState.value  = 'locked'
  trajVisible.value  = false
  actionsRevealed.value = [false, false, false]
  progressPct.value  = 0
  jobSources.value   = []
  revealedSources.value = []
}

async function startScan(job: Job) {
  const scanId = ++currentScanId
  const ok = () => scanId === currentScanId

  resetDecryptState()
  showInput.value = false
  phase.value = 'scanning'

  progressPct.value = 5
  await sleep(200); if (!ok()) return

  // 1. HORIZON
  progressPct.value = 20
  await scrambleTo(horizonText, horizonState, String(job.horizon), 500); if (!ok()) return
  await sleep(180); if (!ok()) return

  // 2. STATUT
  progressPct.value = 40
  await scrambleTo(statusText, statusState, STATUS_LABELS[job.status], 700); if (!ok()) return
  await sleep(220); if (!ok()) return

  // 3. RISQUE (scramble → count-up)
  progressPct.value = 60
  await countUpTo(riskText, riskState, job.risk, 500, 600); if (!ok()) return
  await sleep(280); if (!ok()) return

  // 4. TRAJECTOIRE
  progressPct.value = 75
  trajVisible.value = true
  await sleep(700); if (!ok()) return

  // 5. ACTIONS
  progressPct.value = 88
  for (let i = 0; i < 3; i++) {
    actionsRevealed.value[i] = true
    await sleep(220); if (!ok()) return
  }
  await sleep(180); if (!ok()) return

  // 6. SOURCES + result
  progressPct.value = 95
  phase.value = 'result'
  router.replace({ query: { job: job.slug } })
  setDynamicMeta(job)
  capture('scanner_scan_completed', jobProps(job, 'suggestion'))

  const sources = getSourcesByIds(job.sources)
  jobSources.value = sources
  revealedSources.value = new Array(sources.length).fill(false)

  for (let i = 0; i < sources.length; i++) {
    await sleep(20); if (!ok()) return
    revealedSources.value[i] = true
    await sleep(160); if (!ok()) return
  }
  progressPct.value = 100
}

function showResultImmediate(job: Job) {
  showInput.value    = false
  riskText.value     = String(job.risk)
  horizonText.value  = String(job.horizon)
  statusText.value   = STATUS_LABELS[job.status]
  riskState.value    = 'decrypted'
  horizonState.value = 'decrypted'
  statusState.value  = 'decrypted'
  trajVisible.value  = true
  actionsRevealed.value = [true, true, true]
  const sources = getSourcesByIds(job.sources)
  jobSources.value   = sources
  revealedSources.value = new Array(sources.length).fill(true)
}

// ── URL param pre-load ───────────────────────────────────
onMounted(() => {
  const slug = route.query.job as string | undefined
  if (slug) {
    const job = findJobBySlug(slug)
    if (job) {
      selectedJob.value = job
      phase.value = 'result'
      showResultImmediate(job)
      setDynamicMeta(job)
      capture('scanner_job_selected', jobProps(job, 'url_param'))
      capture('scanner_scan_completed', jobProps(job, 'url_param'))
    }
  } else {
    jobInputRef.value?.focus()
  }
})

onBeforeUnmount(() => {
  currentScanId++
  if (copyTimer)      clearTimeout(copyTimer)
  if (noResultsTimer) clearTimeout(noResultsTimer)
})

// ── Share ─────────────────────────────────────────────────
function copyLink() {
  if (selectedJob.value) {
    capture('scanner_result_shared', {
      job_slug:   selectedJob.value.slug,
      job_status: selectedJob.value.status,
      risk:       selectedJob.value.risk,
    })
  }
  navigator.clipboard.writeText(window.location.href).catch(() => {})
  copied.value = true
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copied.value = false }, 1500)
}

function onCtaClick() {
  if (!selectedJob.value) return
  capture('scanner_cta_clicked', {
    job_slug:   selectedJob.value.slug,
    job_status: selectedJob.value.status,
    cta_label:  ctaButton.value,
  })
}

// ── Reset ─────────────────────────────────────────────────
function reset() {
  currentScanId++
  if (noResultsTimer) { clearTimeout(noResultsTimer); noResultsTimer = null }
  if (selectedJob.value) {
    capture('scanner_reset', { previous_job_slug: selectedJob.value.slug })
  }
  resetDecryptState()
  showInput.value   = true
  query.value       = ''
  suggestions.value = []
  selectedJob.value = null
  phase.value       = 'idle'
  router.replace({ query: {} })
  nextTick(() => jobInputRef.value?.focus())
}
</script>

<template>
  <div class="scanner-page">
    <div class="scanner-bg" aria-hidden="true" />
    <div class="container">

      <Breadcrumbs :items="[{ label: 'Scanner IA' }]" />
      <h1 class="scanner-h1">Scanner d'obsolescence IA — Quel est le risque pour ton métier&nbsp;?</h1>

      <!-- ── Intro ─────────────────────────────────────── -->
      <div class="scanner-intro">
        <p class="intro-lead">Ton métier face à l'IA — résultat en 10 secondes.</p>
        <ol class="intro-steps font-mono">
          <li><span class="step-num">01</span> Tape ton métier dans le champ <span class="step-accent">SUJET</span></li>
          <li><span class="step-num">02</span> Clique sur la correspondance — le rapport se déclassifie</li>
          <li><span class="step-num">03</span> Lis ton score, ta trajectoire et ce que tu peux faire</li>
        </ol>
      </div>

      <!-- ── Report card ─────────────────────────────── -->
      <article class="report" :data-state="phase" aria-label="Rapport prédictif">

        <!-- Progress bar -->
        <div class="report-progress" :style="{ width: progressPct + '%' }" aria-hidden="true" />

        <!-- Meta bar -->
        <div class="rep-meta">
          <div class="group">
            <span><span class="k font-mono">RÉFÉRENCE</span><span class="v font-mono">SCAN-A7B3-CE45</span></span>
            <span><span class="k font-mono">DATASET</span><span class="v font-mono"><b>197 métiers</b></span></span>
          </div>
          <span class="live font-mono"><span class="led" aria-hidden="true" />online · ready</span>
        </div>

        <!-- SUJET -->
        <div class="rep-field rep-field--sujet">
          <span class="k font-mono">SUJET</span>
          <span class="arrow font-mono" aria-hidden="true">›</span>
          <span class="v">
            <div v-if="showInput" class="sujet-input-wrap">
              <span class="sujet-prompt-char font-mono" aria-hidden="true">$</span>
              <input
                ref="jobInputRef"
                v-model="query"
                class="sujet-input font-mono"
                type="text"
                placeholder="Tape ton métier..."
                autocomplete="off"
                spellcheck="false"
              />
              <ul v-if="suggestions.length" class="suggestions">
                <li
                  v-for="job in suggestions"
                  :key="job.slug"
                  @mousedown.prevent="selectJob(job)"
                >{{ job.label }}</li>
              </ul>
              <ul v-else-if="query.length >= 2" class="suggestions">
                <li class="no-result">// Aucun résultat — essaie un autre terme</li>
              </ul>
            </div>
            <span v-else class="sujet-name font-mono">{{ selectedJob?.label }}</span>
          </span>
        </div>

        <!-- RISQUE -->
        <div class="rep-field">
          <span class="k font-mono">RISQUE</span>
          <span class="arrow font-mono" aria-hidden="true">›</span>
          <span class="v">
            <span
              class="redact"
              :class="{
                'is-scrambling': riskState === 'scrambling',
                'is-decrypted':  riskState === 'decrypted',
              }"
              style="animation-delay: 0s"
            >{{ riskText }}</span>
            <span class="hint"> / 100</span>
          </span>
        </div>

        <!-- HORIZON -->
        <div class="rep-field">
          <span class="k font-mono">HORIZON</span>
          <span class="arrow font-mono" aria-hidden="true">›</span>
          <span class="v">
            <span
              class="redact"
              :class="{
                'is-scrambling': horizonState === 'scrambling',
                'is-decrypted':  horizonState === 'decrypted',
              }"
              style="animation-delay: 3s"
            >{{ horizonText }}</span>
            <span class="hint">ans <span class="dim">(2 · 5 · 10)</span></span>
          </span>
        </div>

        <!-- STATUT -->
        <div class="rep-field">
          <span class="k font-mono">STATUT</span>
          <span class="arrow font-mono" aria-hidden="true">›</span>
          <span class="v">
            <span
              class="redact"
              :class="[
                { 'is-scrambling': statusState === 'scrambling' },
                { 'is-decrypted':  statusState === 'decrypted'  },
                statusColorClass,
              ]"
              style="animation-delay: 6s"
            >{{ statusText }}</span>
            <span class="hint">(1 sur 4)</span>
          </span>
        </div>

        <!-- TRAJECTOIRE -->
        <div class="rep-block">
          <div class="label"><KickerLabel>TRAJECTOIRE</KickerLabel></div>
          <div class="traj-text" :class="{ 'is-decrypted': trajVisible }">
            <div v-if="!trajVisible" class="placeholder" aria-hidden="true">
              <span class="redact-line" />
              <span class="redact-line" />
              <span class="redact-line" />
            </div>
            <span v-else class="traj-revealed is-shown">{{ selectedJob?.dynamic }}</span>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="rep-block">
          <div class="label"><KickerLabel>CE QUE TU PEUX FAIRE <span class="ct">(3)</span></KickerLabel></div>
          <ol class="actions-list">
            <li
              v-for="(action, i) in currentActions"
              :key="i"
              class="action-item"
              :class="{
                'is-locked':    !actionsRevealed[i],
                'is-decrypted': actionsRevealed[i],
              }"
            >
              <span class="action-num font-mono">0{{ i + 1 }}</span>
              <span class="action-arrow font-mono" aria-hidden="true">▸</span>
              <span class="action-text">{{ action }}</span>
            </li>
          </ol>
        </div>

        <!-- SOURCES (visible only in result state, collapsed by default) -->
        <div class="rep-block sources-block">
          <details class="sources-details">
            <summary class="sources-summary font-mono">
              <KickerLabel>SOURCES CITÉES <span class="ct">({{ jobSources.length }})</span></KickerLabel>
              <span class="sources-toggle font-mono" aria-hidden="true">+</span>
            </summary>
            <ul class="sources-list">
              <li
                v-for="(src, i) in jobSources"
                :key="src.id"
                class="source-item"
                :class="{ 'is-revealed': revealedSources[i] }"
              >
                <div class="source-id font-mono">[{{ src.id }}]</div>
                <div class="source-content">
                  <div class="source-title">
                    <a :href="src.url" target="_blank" rel="noopener noreferrer">
                      {{ src.title }}<span class="source-arrow" aria-hidden="true"> ↗</span>
                    </a>
                  </div>
                  <div class="source-meta font-mono">{{ src.author }} · {{ src.year }}</div>
                  <div class="source-context">{{ src.context }}</div>
                </div>
              </li>
            </ul>
            <div class="sources-catalog-link">
              <button class="catalog-btn font-mono" type="button" @click="sourcesModalOpen = true">
                → Voir le catalogue complet (22 sources)
              </button>
            </div>
          </details>
        </div>

        <!-- Idle hint -->
        <div class="idle-hint font-mono" aria-hidden="true">
          ↑ tape ton métier dans le champ SUJET pour déclassifier le rapport
        </div>

        <!-- Result zone -->
        <div class="result-zone">
          <p class="result-hook font-mono">{{ ctaHook }}</p>
          <div class="result-actions">
            <GlitchButton :label="ctaButton" to="/#newsletter" @click="onCtaClick" />
            <button class="share-btn font-mono" @click="copyLink">
              {{ copied ? '[ Lien copié ! ]' : '[ Partager mon résultat ]' }}
            </button>
          </div>
          <div class="reset-zone">
            <button class="reset-btn font-mono" @click="reset">// nouveau scan ←</button>
          </div>
        </div>

      </article>

      <!-- ── Popular jobs ──────────────────────────────── -->
      <div class="popular-jobs">
        <p class="popular-label"><KickerLabel>MÉTIERS FRÉQUENTS</KickerLabel></p>
        <div class="popular-chips">
          <NuxtLink
            v-for="job in POPULAR_JOBS"
            :key="job.slug"
            :to="`/scanner?job=${job.slug}`"
            class="job-chip font-mono"
          >
            {{ job.label }}
          </NuxtLink>
        </div>
      </div>

      <!-- ── FAQ ───────────────────────────────────────── -->
      <section class="faq-section">
        <div class="faq-label"><KickerLabel>QUESTIONS FRÉQUENTES</KickerLabel></div>
        <div class="faq-list">
          <details class="faq-item">
            <summary class="faq-question">
              <span class="faq-q-text">Comment est calculé le score de risque d'automatisation ?</span>
              <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
            </summary>
            <p class="faq-answer">Le score est une estimation éditoriale informée par un ensemble de recherches : études académiques (Tufts University, PayScope), rapports de cabinets (McKinsey, Goldman Sachs), institutions internationales (WEF) et données de plateformes (LinkedIn). Il donne une tendance sectorielle — pas un algorithme mécanique. Les sources complètes sont accessibles depuis chaque résultat.</p>
          </details>
          <details class="faq-item">
            <summary class="faq-question">
              <span class="faq-q-text">Quels métiers sont les plus menacés par l'IA en 2026 ?</span>
              <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
            </summary>
            <p class="faq-answer">Les professions les plus exposées sont celles à forte composante répétitive : agents de saisie (90&nbsp;%), télévendeurs (92&nbsp;%), correcteurs (85&nbsp;%), traducteurs (82&nbsp;%). Ces métiers sont touchés sur un horizon de 2 ans selon les projections 2026.</p>
          </details>
          <details class="faq-item">
            <summary class="faq-question">
              <span class="faq-q-text">Mes données personnelles sont-elles enregistrées ?</span>
              <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
            </summary>
            <p class="faq-answer">Non. Le scanner ne collecte aucune donnée personnelle. Aucune inscription n'est nécessaire. Seuls des événements anonymes d'usage sont transmis pour améliorer l'outil.</p>
          </details>
          <details class="faq-item">
            <summary class="faq-question">
              <span class="faq-q-text">Combien de métiers sont couverts ?</span>
              <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
            </summary>
            <p class="faq-answer">197 métiers sont analysés, répartis en 4 catégories : EN DANGER, EN MUTATION SÉVÈRE, PROTÉGÉ et EN CROISSANCE. Chaque analyse inclut un score de risque (0–100&nbsp;%), un horizon d'impact et une dynamique anticipée.</p>
          </details>
          <details class="faq-item">
            <summary class="faq-question">
              <span class="faq-q-text">Les résultats sont-ils fiables ?</span>
              <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
            </summary>
            <p class="faq-answer">Les scores reflètent l'état des recherches académiques en 2026. Ils donnent une tendance sectorielle, pas une prédiction individuelle garantie. Chaque résultat inclut ses sources pour que vous puissiez évaluer la solidité des données.</p>
          </details>
        </div>
      </section>

    </div>
  </div>

  <SourcesModal
    :open="sourcesModalOpen"
    :job="selectedJob"
    @close="sourcesModalOpen = false"
  />
</template>

<style scoped>
/* ── Page ─────────────────────────────────────────── */
.scanner-page {
  padding: 4rem 0 6rem;
  position: relative;
  overflow: hidden;
}
.scanner-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(circle, rgba(0, 255, 65, 0.05) 1px, transparent 1px);
  background-size: 32px 32px;
}
.scanner-page > .container { position: relative; z-index: 1; }
.scanner-h1 {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
}

/* ── Intro ────────────────────────────────────────── */
.scanner-intro {
  max-width: 780px;
  margin-bottom: 1.75rem;
}
.intro-lead {
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: 0.85rem;
  line-height: 1.6;
}
.intro-steps {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.intro-steps li {
  font-size: 0.78rem;
  color: var(--color-muted);
  letter-spacing: 0.05em;
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
}
.step-num {
  color: var(--color-accent);
  font-weight: 700;
  flex-shrink: 0;
}
.step-accent {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

/* ── Report card ──────────────────────────────────── */
.report {
  max-width: 780px;
  background: #0A0A0A;
  border: 1px solid rgba(0, 255, 65, 0.25);
  font-family: var(--font-mono);
  color: var(--color-text);
  padding: 2rem 2.25rem;
  position: relative;
  overflow: visible;
  box-shadow:
    0 0 80px rgba(0, 255, 65, 0.05),
    0 30px 80px rgba(0, 0, 0, 0.5);
}
.report::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 2px,
    rgba(0, 255, 65, 0.012) 2px,
    rgba(0, 255, 65, 0.012) 4px
  );
  pointer-events: none;
  z-index: 1;
}
.report > * { position: relative; z-index: 2; }

/* Progress bar */
.report-progress {
  position: absolute;
  bottom: 0; left: 0;
  height: 2px;
  background: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent);
  transition: width 0.3s ease-out;
  z-index: 5;
  opacity: 0;
}
.report[data-state="scanning"] .report-progress { opacity: 1; }
.report[data-state="result"]   .report-progress { opacity: 0; transition: opacity 0.4s ease 0.5s; }

/* ── Meta bar ─────────────────────────────────────── */
.rep-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.7rem;
  padding-bottom: 0.85rem;
  margin-bottom: 1.2rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
}
.rep-meta .group { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.rep-meta .k { color: #555; }
.rep-meta .v { color: var(--color-muted); margin-left: 0.4rem; }
.rep-meta .v b { color: var(--color-text); font-weight: 400; }
.live {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-accent);
}
.led {
  display: inline-block;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 6px var(--color-accent);
  animation: led-pulse 1.4s ease-in-out infinite;
}
@keyframes led-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}

/* ── Field rows ───────────────────────────────────── */
/* SUJET field needs higher z-index so its dropdown sits above the other fields
   (all .report > * share z-index:2; later DOM elements stack on top) */
.rep-field--sujet { z-index: 10; }

.rep-field {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  padding: 0.55rem 0;
  font-size: 0.92rem;
}
.rep-field .k {
  color: var(--color-muted);
  min-width: 6.5rem;
  flex-shrink: 0;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}
.rep-field .arrow { color: var(--color-accent); flex-shrink: 0; font-size: 1rem; }
.rep-field .v {
  color: var(--color-text);
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}
.hint { color: var(--color-muted); font-size: 0.8rem; letter-spacing: 0.05em; }
.dim  { color: #555; }

/* ── SUJET input ──────────────────────────────────── */
.sujet-input-wrap {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}
.sujet-prompt-char { color: var(--color-accent); font-size: 1rem; flex-shrink: 0; }
.sujet-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-accent);
  font-size: 0.95rem;
  caret-color: var(--color-accent);
  padding: 0.15rem 0;
  border-bottom: 1px dashed rgba(0, 255, 65, 0.18);
  min-width: 200px;
  transition: border-color 0.2s;
}
.sujet-input:focus { border-bottom-color: var(--color-accent); }
.sujet-input::placeholder { color: #555; letter-spacing: 0.04em; }
.sujet-name {
  color: var(--color-accent);
  font-weight: 700;
  font-size: 0.95rem;
}
.sujet-name::before { content: '$ '; }

.suggestions {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 1.4rem;
  right: 0;
  list-style: none;
  margin: 0; padding: 0;
  background: #1A1A1A;
  border: 1px solid rgba(0, 255, 65, 0.25);
  z-index: 30;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}
.suggestions li {
  padding: 0.6rem 0.95rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  border-bottom: 1px solid rgba(0, 255, 65, 0.05);
  letter-spacing: 0.02em;
}
.suggestions li:last-child { border-bottom: none; }
.suggestions li:hover { background: rgba(0, 255, 65, 0.08); color: var(--color-accent); }
.suggestions li.no-result {
  color: var(--color-muted);
  cursor: default;
  font-size: 0.75rem;
}
.suggestions li.no-result:hover { background: transparent; color: var(--color-muted); }

/* ── Redact bars ──────────────────────────────────── */
.redact {
  display: inline-block;
  position: relative;
  background: #2C2C2C;
  color: transparent;
  user-select: none;
  height: 1.05em;
  line-height: 1.05;
  vertical-align: -0.15em;
  padding: 0 0.4em;
  border-top: 1px solid #383838;
  overflow: hidden;
  transition: background 0.4s ease, color 0.3s ease, padding 0.3s ease, border 0.3s ease, height 0.3s ease;
}
.redact::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 40%,
    rgba(0, 255, 65, 0.18) 50%,
    transparent 60%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: redact-shimmer 9s ease-in-out infinite;
}
@keyframes redact-shimmer {
  0%, 88%  { transform: translateX(-100%); opacity: 0; }
  90%      { opacity: 1; }
  99%      { transform: translateX(100%); opacity: 0; }
  100%     { transform: translateX(100%); opacity: 0; }
}

.redact.is-scrambling {
  background: rgba(0, 255, 65, 0.05);
  border-top-color: var(--color-accent);
  color: var(--color-accent);
}
.redact.is-scrambling::after { animation: none; opacity: 0; }

.redact.is-decrypted {
  background: transparent;
  border-top: none;
  color: var(--color-text);
  padding: 0;
  height: auto;
  vertical-align: baseline;
  overflow: visible;
}
.redact.is-decrypted::after { display: none; }
.redact.is-decrypted.color-mutation   { color: var(--color-mutation);   font-weight: 700; }
.redact.is-decrypted.color-danger     { color: var(--color-danger);     font-weight: 700; }
.redact.is-decrypted.color-protege    { color: var(--color-protege);    font-weight: 700; }
.redact.is-decrypted.color-croissance { color: var(--color-croissance); font-weight: 700; }

/* ── Content blocks ───────────────────────────────── */
.rep-block {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
}
.label {
  margin-bottom: 0.65rem;
}
.ct { color: #555; margin-left: 0.35rem; font-weight: 400; }

/* Trajectoire */
.traj-text {
  padding-left: 0.85rem;
  border-left: 2px solid #333;
  font-family: var(--font-sans);
  font-size: 0.88rem;
  line-height: 1.7;
  transition: border-color 0.3s;
  min-height: 4.2em;
  color: var(--color-text);
}
.traj-text.is-decrypted { border-color: var(--color-accent); }
.placeholder { display: flex; flex-direction: column; gap: 0.4rem; }
.redact-line {
  display: block;
  background: #2C2C2C;
  height: 0.85em;
  border-top: 1px solid #383838;
}
.redact-line:nth-child(1) { width: 92%; }
.redact-line:nth-child(2) { width: 78%; }
.redact-line:nth-child(3) { width: 88%; }
.traj-revealed { display: block; opacity: 0; transition: opacity 0.6s; }
.traj-revealed.is-shown { opacity: 1; }

/* Actions */
.actions-list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.action-item {
  display: flex;
  gap: 0.7rem;
  align-items: baseline;
  font-size: 0.88rem;
  line-height: 1.55;
}
.action-num { color: var(--color-accent); font-weight: 700; flex-shrink: 0; width: 1.6rem; }
.action-arrow { color: var(--color-muted); flex-shrink: 0; }
.action-text { color: var(--color-text); flex: 1; }
.action-item.is-locked .action-text {
  display: inline-block;
  background: #2C2C2C;
  color: transparent;
  border-top: 1px solid #383838;
  padding: 0 0.4em;
  user-select: none;
  height: 1.05em;
  line-height: 1.05;
  vertical-align: -0.1em;
  min-width: 70%;
}

/* Sources */
.sources-block { display: none; }
.report[data-state="result"] .sources-block { display: block; }

.sources-details { list-style: none; }
.sources-summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.72rem;
  color: var(--color-muted);
  letter-spacing: 0.1em;
  padding: 0.35rem 0;
  user-select: none;
  margin-bottom: 0;
}
.sources-summary::-webkit-details-marker { display: none; }
.sources-summary:hover { color: var(--color-text); }
.sources-toggle {
  font-size: 1.1rem;
  line-height: 1;
  color: var(--color-muted);
  transition: transform 0.2s ease, color 0.15s;
  flex-shrink: 0;
}
.sources-details[open] .sources-summary { color: var(--color-text); margin-bottom: 0.65rem; }
.sources-details[open] .sources-toggle  { transform: rotate(45deg); color: var(--color-accent); }

.sources-catalog-link {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
  text-align: right;
}
.catalog-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.catalog-btn:hover { color: var(--color-accent); }
.sources-list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.source-item {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  padding: 0.45rem 0.7rem;
  border-left: 1px solid #333;
  transition: border-left-color 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  opacity: 0;
  transform: translateX(-6px);
}
.source-item.is-revealed {
  opacity: 1;
  transform: translateX(0);
  border-left-color: rgba(0, 255, 65, 0.18);
}
.source-item:hover { border-left-color: var(--color-accent); background: rgba(0,255,65,0.02); }
.source-id {
  color: var(--color-accent);
  font-size: 0.75rem;
  flex-shrink: 0;
  width: 1.85rem;
  padding-top: 0.1em;
}
.source-content { flex: 1; }
.source-title {
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.2rem;
}
.source-title a { color: inherit; text-decoration: none; transition: color 0.2s; }
.source-title a:hover { color: var(--color-accent); }
.source-arrow { color: var(--color-muted); margin-left: 0.3rem; font-size: 0.85em; }
.source-meta {
  font-size: 0.72rem;
  color: var(--color-muted);
  margin-bottom: 0.3rem;
  letter-spacing: 0.04em;
}
.source-context {
  font-family: var(--font-sans);
  font-size: 0.82rem;
  color: #555;
  line-height: 1.5;
}

/* ── Idle hint ────────────────────────────────────── */
.idle-hint {
  display: block;
  margin-top: 1.5rem;
  padding-top: 1.1rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
  font-size: 0.7rem;
  color: #555;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
}
.report[data-state="scanning"] .idle-hint,
.report[data-state="result"]   .idle-hint { display: none; }

/* ── Result zone ──────────────────────────────────── */
.result-zone {
  display: none;
  margin-top: 1.75rem;
  padding-top: 1.35rem;
  border-top: 1px solid rgba(0, 255, 65, 0.18);
  text-align: center;
}
.report[data-state="result"] .result-zone { display: block; }
.result-hook {
  font-size: 0.8rem;
  color: var(--color-muted);
  letter-spacing: 0.02em;
  margin: 0 auto 1rem;
  line-height: 1.6;
  max-width: 50ch;
}
.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
}
.share-btn {
  background: transparent;
  border: 1px solid rgba(0, 255, 65, 0.25);
  color: var(--color-muted);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  text-transform: uppercase;
}
.share-btn:hover { color: var(--color-accent); border-color: rgba(0, 255, 65, 0.5); }
.reset-zone { margin-top: 1.25rem; }
.reset-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: color 0.2s;
}
.reset-btn:hover { color: var(--color-accent); }

/* ── Popular jobs ─────────────────────────────────── */
.popular-jobs {
  max-width: 780px;
  margin-top: 3rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(0, 255, 65, 0.1);
}
.popular-label {
  margin-bottom: 1rem;
}
.popular-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.job-chip {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border: 1px solid rgba(0, 255, 65, 0.2);
  color: var(--color-muted);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-decoration: none;
  transition: color 0.15s, border-color 0.15s;
}
.job-chip:hover { color: var(--color-accent); border-color: rgba(0, 255, 65, 0.5); }

/* ── FAQ ──────────────────────────────────────────── */
.faq-section {
  max-width: 780px;
  margin-top: 3rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(0, 255, 65, 0.1);
}
.faq-label {
  display: block;
  margin-bottom: 0.75rem;
}
.faq-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(0, 255, 65, 0.12);
}
.faq-item {
  border-bottom: 1px solid rgba(0, 255, 65, 0.12);
  background: var(--color-surface);
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
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  user-select: none;
}
.faq-question::-webkit-details-marker { display: none; }
.faq-question:hover .faq-q-icon { color: var(--color-accent); }
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
.faq-item[open] .faq-q-icon { transform: rotate(45deg); color: var(--color-accent); }
.faq-answer {
  padding: 0 1.5rem 1.5rem;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--color-muted);
  max-width: 75ch;
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 600px) {
  .report { padding: 1.5rem 1.25rem; }
  .rep-field {
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;
    padding: 0.5rem 0;
  }
  .rep-field .k { min-width: 0; }
  .rep-field .arrow { display: none; }
  .rep-meta { font-size: 0.65rem; }
  .sujet-input { min-width: 140px; }
  .suggestions { left: 0; }
  .source-item { flex-direction: column; gap: 0.3rem; }
  .source-id { width: auto; }
  .faq-question { padding: 1rem 1.1rem; font-size: 0.95rem; }
  .faq-answer   { padding: 0 1.1rem 1.2rem; font-size: 0.9rem; }
}

@media (prefers-reduced-motion: reduce) {
  .redact::after      { animation: none; }
  .led                { animation: none; opacity: 1; }
  .traj-revealed      { transition: none; opacity: 1; }
  .source-item        { transition: none; opacity: 1; transform: none; }
}
</style>
