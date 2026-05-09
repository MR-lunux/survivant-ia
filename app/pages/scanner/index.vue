<!-- app/pages/scanner.vue -->
<script setup lang="ts">
import { findJobBySlug, searchJobs, type Job, type JobQuadrant } from '~/data/jobs'
import { getSourcesByIds, type Source } from '~/data/sources'
import { getLeviersByQuadrant } from '~/data/quadrant-leviers'
import SourcesModal from '~/components/SourcesModal.vue'

// ── SEO ──────────────────────────────────────────────────
useSeoMeta({
  title: 'Scanner IA : mon métier est-il menacé par l\'IA ? | Survivant-IA',
  description: 'Diagnostic IA gratuit en 10 secondes : sache où ton métier en est et comment piloter l\'IA pour en sortir gagnant. Données multiples (Tufts, McKinsey, WEF).',
  ogTitle: 'Scanner IA : mon métier est-il menacé par l\'IA ?',
  ogDescription: 'Diagnostic IA gratuit en 10 secondes pour les salariés non-tech. Comment piloter l\'IA dans ton métier au lieu de la subir. Données Tufts, McKinsey, WEF.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Mon métier est-il menacé par l\'IA ?',
  twitterDescription: 'Diagnostic IA gratuit en 10 secondes. Comment piloter l\'IA dans ton métier au lieu de la subir.',
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
          name: 'Scanner IA : diagnostic métier en 10 secondes',
          url: 'https://survivant-ia.ch/scanner',
          description: 'Diagnostic IA par métier en 10 secondes : sache où ton métier en est face à l\'IA et comment la piloter au lieu de la subir. Basé sur Tufts, McKinsey, WEF.',
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
                text: 'Le score est une estimation éditoriale informée par un ensemble de recherches : études académiques (Tufts University, PayScope), rapports de cabinets (McKinsey, Goldman Sachs), institutions internationales (WEF) et données de plateformes (LinkedIn). Il donne une tendance sectorielle - pas un algorithme mécanique. Les sources complètes sont accessibles depuis chaque résultat.',
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
                text: 'Le score, l\'horizon et le statut s\'affichent immédiatement et gratuitement, sans collecte de données. Le plan d\'action complet (trajectoire et 3 axes pratiques) est réservé aux abonnés de la newsletter La Fréquence - un email et un prénom suffisent, conformément à notre politique de confidentialité.',
              },
            },
            {
              '@type': 'Question',
              name: 'Combien de métiers sont couverts par le scanner IA ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '197 métiers sont analysés, répartis en 4 catégories : EN DANGER, EN MUTATION SÉVÈRE, PROTÉGÉ et EN CROISSANCE. Chaque analyse inclut un score de risque (0-100 %), un horizon d\'impact et une dynamique anticipée.',
              },
            },
            {
              '@type': 'Question',
              name: 'Les résultats du scanner IA sont-ils fiables ?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Les scores reflètent l\'état de recherches académiques. Ils donnent une tendance sectorielle, pas une prédiction individuelle garantie. Chaque résultat inclut ses sources pour que vous puissiez évaluer la solidité des données.',
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
  kicker: 'SCANNER · 10 SECONDES',
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
    'Identifie les tâches de ton poste qui nécessitent jugement et relation humaine - c\'est ton bouclier.',
    'Commence à piloter l\'IA plutôt que la subir : automatise ce qui te ralentit, garde le contrôle sur ce qui sort.',
    'Renforce ta valeur relationnelle dans ton équipe et ton secteur. L\'irremplaçabilité se construit dans les liens.',
  ],
  mutation: [
    'Cartographie ton rôle : distingue ce qui va disparaître de ce qui va évoluer - ce sont deux trajectoires différentes.',
    'Apprends à superviser l\'IA sur les tâches qui t\'échappent déjà - tu restes maître si tu maîtrises l\'outil.',
    'Développe la couche de jugement que l\'IA ne peut pas reproduire : contexte métier, éthique, décision en incertitude.',
  ],
  protege: [
    'Documente ce qui rend ton travail irremplaçable - c\'est ton capital le plus précieux, rends-le visible.',
    'Utilise l\'IA pour déléguer les tâches répétitives et concentre-toi sur ce qui crée de la valeur humaine.',
    'Reste en veille : ta position protégée aujourd\'hui peut basculer dans 5 ans. Anticipe plutôt que réagir.',
  ],
  croissance: [
    'Capitalise sur la demande actuelle - c\'est le moment de monter en compétence et en visibilité dans ton domaine.',
    'Utilise l\'IA comme multiplicateur de productivité : tu produis plus, pas moins bien.',
    'Anticipe la prochaine vague : les métiers en croissance aujourd\'hui ne sont pas immunisés pour toujours.',
  ],
}

// ── Quadrant constants (v2) ──────────────────────────────
const QUADRANT_LABELS: Record<JobQuadrant, string> = {
  tiens:    'TU TIENS',
  pilotes:  'TU PILOTES',
  pivotes:  'TU PIVOTES',
  mutes:    'TU MUTES',
}

const QUADRANT_VERDICT_ITALIC: Record<JobQuadrant, string> = {
  tiens:    'Tu tiens.',
  pilotes:  'Tu pilotes.',
  pivotes:  'Tu pivotes.',
  mutes:    'Tu mutes.',
}

const QUADRANT_DEFINITIONS: Record<JobQuadrant, string> = {
  tiens:    'Métier solide, peu touché par l\'IA. Stabilité naturelle, peu de levier d\'amplification.',
  pilotes:  'Métier solide ET l\'IA t\'amplifie. Avantage concurrentiel rare, à capitaliser maintenant.',
  pivotes:  'Métier en contraction et l\'IA n\'amplifie pas ton rôle. Reconversion à anticiper.',
  mutes:    'Métier en contraction MAIS l\'IA t\'arme. Saute le pas avant les autres.',
}

const QUADRANT_COLOR_VAR: Record<JobQuadrant, string> = {
  tiens:    'var(--color-protege)',
  pilotes:  'var(--color-croissance)',
  pivotes:  'var(--color-danger)',
  mutes:    'var(--color-mutation)',
}

// Gate désactivé en sous-projet 4 SEO. Flip à true pour réactiver le gate.
const SCANNER_GATE_ENABLED = false

// ── Scanner unlock ───────────────────────────────────────
const { isUnlocked } = useScannerUnlock()
const reducedMotion = ref(false)
const classifiedVisible = ref(false)
const shimmering = ref(false)
const justUnlocked = ref(false)

function rm(ms: number): number {
  return reducedMotion.value ? 0 : ms
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
const phase = ref<'idle' | 'scanning' | 'gated' | 'unlocking' | 'unlocked'>('idle')
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
const trajText  = ref('')
const trajState = ref<DecryptState>('locked')
const actionTexts  = ref<string[]>(['', '', ''])
const actionStates = ref<DecryptState[]>(['locked', 'locked', 'locked'])
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

const displayRisk = ref(0)
let riskAnimTimer: ReturnType<typeof setInterval> | null = null

function animateRisk(target: number) {
  if (riskAnimTimer) { clearInterval(riskAnimTimer); riskAnimTimer = null }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayRisk.value = target
    return
  }
  displayRisk.value = 0
  const steps    = 40
  const interval = 800 / steps
  let current    = 0
  riskAnimTimer  = setInterval(() => {
    current += target / steps
    if (current >= target) {
      displayRisk.value = target
      clearInterval(riskAnimTimer!)
      riskAnimTimer = null
    } else {
      displayRisk.value = Math.round(current)
    }
  }, interval)
}

watch(() => phase.value, (newPhase) => {
  if (newPhase === 'unlocked' && selectedJob.value) {
    animateRisk(selectedJob.value.risk)
  }
})

const leviersToShow = computed<string[]>(() => {
  if (!selectedJob.value) return []
  if (selectedJob.value.leviers.length > 0) return selectedJob.value.leviers
  return getLeviersByQuadrant(selectedJob.value.quadrant).leviers
})

const leviersIntro = computed<string>(() => {
  if (!selectedJob.value) return ''
  if (selectedJob.value.leviers.length > 0) {
    return `Trois actions concrètes pour piloter l'IA dans ton métier de ${selectedJob.value.label.toLowerCase()}.`
  }
  return getLeviersByQuadrant(selectedJob.value.quadrant).intro
})

function parseLevier(levier: string): { title: string, description: string } {
  const sepIndex = levier.indexOf(' — ')
  if (sepIndex === -1) return { title: levier, description: '' }
  return {
    title: levier.slice(0, sepIndex).trim(),
    description: levier.slice(sepIndex + 3).trim(),
  }
}

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
function applyDynamicOgImage(job: Job) {
  defineOgImage('Scanner', {
    label: job.label,
    verdict: QUADRANT_VERDICT_ITALIC[job.quadrant],
    quadrant: job.quadrant,
    risk: job.risk,
    potential: job.potential,
  })
}

function setDynamicMeta(job: Job) {
  useHead({
    meta: [
      { property: 'og:title',       content: `Mon risque IA : ${job.risk}% - ${job.label} | Survival Check` },
      { property: 'og:description', content: `J'ai scanné mon métier sur survivant-ia.ch. Résultat : ${STATUS_LABELS[job.status]}. Et toi ?` },
    ],
  })
  applyDynamicOgImage(job)
}

// ── Scan ─────────────────────────────────────────────────
function resetDecryptState() {
  justUnlocked.value = false
  riskText.value    = 'XX'
  horizonText.value = 'XX'
  statusText.value  = 'EN MUTATION SÉVÈRE'
  riskState.value    = 'locked'
  horizonState.value = 'locked'
  statusState.value  = 'locked'
  trajText.value  = ''
  trajState.value = 'locked'
  actionTexts.value  = ['', '', '']
  actionStates.value = ['locked', 'locked', 'locked']
  progressPct.value  = 0
  jobSources.value   = []
  revealedSources.value = []
  classifiedVisible.value = false
  shimmering.value = false
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

  // ── BRANCHEMENT : si pas déverrouillé, on s'arrête au gate ──
  if (!isUnlocked.value) {
    // 4-classified. Phase classifiée
    progressPct.value = 70
    classifiedVisible.value = true
    await sleep(rm(500)); if (!ok()) return

    progressPct.value = 80
    shimmering.value = true
    await sleep(rm(500)); if (!ok()) return
    shimmering.value = false

    progressPct.value = 88
    phase.value = 'unlocked'
    capture('scanner_gate_shown', {
      ...jobProps(job, 'suggestion'),
      job_risk: job.risk, job_horizon: job.horizon,
    })
    // continue to full scan path below
  }

  // ── Path déverrouillé : continue le scan complet ──
  // 4. TRAJECTOIRE
  progressPct.value = 75
  await scrambleTo(trajText, trajState, job.dynamic, rm(700)); if (!ok()) return
  await sleep(rm(180)); if (!ok()) return

  // 5. ACTIONS - scramble en cascade
  progressPct.value = 88
  const actions = ACTIONS[job.status]
  for (let i = 0; i < 3; i++) {
    const textRef  = { get value() { return actionTexts.value[i] }, set value(v: string) { actionTexts.value = actionTexts.value.map((t, idx) => idx === i ? v : t) } }
    const stateRef = { get value() { return actionStates.value[i] }, set value(v: any) { actionStates.value = actionStates.value.map((s, idx) => idx === i ? v : s) as any } }
    await scrambleTo(textRef, stateRef, actions[i], rm(350)); if (!ok()) return
    await sleep(rm(80)); if (!ok()) return
  }
  await sleep(rm(180)); if (!ok()) return

  // 6. SOURCES + result
  progressPct.value = 95
  phase.value = 'unlocked'
  router.replace({ query: { job: job.slug } })
  setDynamicMeta(job)
  capture('scanner_scan_completed', jobProps(job, 'suggestion'))

  const sources = getSourcesByIds(job.sources)
  jobSources.value = sources
  revealedSources.value = new Array(sources.length).fill(false)

  for (let i = 0; i < sources.length; i++) {
    await sleep(rm(20)); if (!ok()) return
    revealedSources.value[i] = true
    await sleep(rm(160)); if (!ok()) return
  }
  progressPct.value = 100
}

async function unlockAndReveal(job: Job) {
  const scanId = ++currentScanId
  const ok = () => scanId === currentScanId

  phase.value = 'unlocking'
  classifiedVisible.value = false  // retire le pulse

  // Mobile UX : dismisse le clavier virtuel + scroll vers la TRAJECTOIRE
  // pour que l'utilisateur voie la révélation se dérouler
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  await nextTick()
  document.querySelector('.report .rep-block')?.scrollIntoView({
    behavior: reducedMotion.value ? 'auto' : 'smooth',
    block: 'start',
  })

  await sleep(rm(250)); if (!ok()) return

  // TRAJECTOIRE
  progressPct.value = 92
  await scrambleTo(trajText, trajState, job.dynamic, rm(700)); if (!ok()) return
  await sleep(rm(180)); if (!ok()) return

  // ACTIONS - cascade
  progressPct.value = 95
  const actions = ACTIONS[job.status]
  for (let i = 0; i < 3; i++) {
    const textRef  = { get value() { return actionTexts.value[i] }, set value(v: string) { actionTexts.value = actionTexts.value.map((t, idx) => idx === i ? v : t) } }
    const stateRef = { get value() { return actionStates.value[i] }, set value(v: any) { actionStates.value = actionStates.value.map((s, idx) => idx === i ? v : s) as any } }
    await scrambleTo(textRef, stateRef, actions[i], rm(350)); if (!ok()) return
    await sleep(rm(80)); if (!ok()) return
  }

  // SOURCES + result
  phase.value = 'unlocked'
  router.replace({ query: { job: job.slug } })
  setDynamicMeta(job)

  const sources = getSourcesByIds(job.sources)
  jobSources.value = sources
  revealedSources.value = new Array(sources.length).fill(false)
  for (let i = 0; i < sources.length; i++) {
    await sleep(rm(20)); if (!ok()) return
    revealedSources.value[i] = true
    await sleep(rm(160)); if (!ok()) return
  }
  progressPct.value = 100
}

function onGateUnlocked() {
  if (!selectedJob.value) return
  justUnlocked.value = true
  unlockAndReveal(selectedJob.value)
}

function showResultImmediate(job: Job) {
  showInput.value    = false
  riskText.value     = String(job.risk)
  horizonText.value  = String(job.horizon)
  statusText.value   = STATUS_LABELS[job.status]
  riskState.value    = 'decrypted'
  horizonState.value = 'decrypted'
  statusState.value  = 'decrypted'

  if (!isUnlocked.value) {
    // Path anciennement gated : tout afficher directement (gate désactivé en sous-projet 4 SEO)
    progressPct.value = 88
    capture('scanner_gate_shown', {
      ...jobProps(job, 'url_param'),
      job_risk: job.risk, job_horizon: job.horizon,
    })
    // fall through to full unlocked path below
  }

  // Path unlocked : tout en clair (comportement historique)
  trajText.value    = job.dynamic
  trajState.value   = 'decrypted'
  const actions = ACTIONS[job.status]
  actionTexts.value  = [actions[0], actions[1], actions[2]]
  actionStates.value = ['decrypted', 'decrypted', 'decrypted']
  const sources = getSourcesByIds(job.sources)
  jobSources.value   = sources
  revealedSources.value = new Array(sources.length).fill(true)
  phase.value = 'unlocked'
  progressPct.value = 100
}

// ── URL param pre-load ───────────────────────────────────
onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const slug = route.query.job as string | undefined
  if (slug) {
    const job = findJobBySlug(slug)
    if (job) {
      selectedJob.value = job
      // showResultImmediate() set lui-même phase à 'gated' ou 'unlocked'
      showResultImmediate(job)
      setDynamicMeta(job)
      capture('scanner_job_selected', jobProps(job, 'url_param'))
      // scan_completed est émis seulement si on a effectivement révélé tout
      if (phase.value === 'unlocked') {
        capture('scanner_scan_completed', jobProps(job, 'url_param'))
      }
    }
  } else {
    jobInputRef.value?.focus()
  }
})

onBeforeUnmount(() => {
  currentScanId++
  if (copyTimer)      clearTimeout(copyTimer)
  if (noResultsTimer) clearTimeout(noResultsTimer)
  if (riskAnimTimer)  clearInterval(riskAnimTimer)
})

// ── Newsletter inline form (Section VI) ─────────────────
const prenomInput       = ref('')
const emailInput        = ref('')
const formationsInterest = ref(false)
const consentChecked    = ref(false)
const submitting        = ref(false)
const submitError       = ref(false)
const submitMessage     = ref('')

async function onSubscribe() {
  if (!selectedJob.value) return
  if (!consentChecked.value) {
    submitError.value = true
    submitMessage.value = 'Consentement requis.'
    return
  }
  submitting.value = true
  submitError.value = false
  submitMessage.value = ''

  try {
    const res = await $fetch<{ ok: boolean }>('/api/subscribe', {
      method: 'POST',
      body: {
        prenom: prenomInput.value,
        email: emailInput.value,
        consent: true,
        source: 'scanner_inline',
        job_slug: selectedJob.value.slug,
        job_status: selectedJob.value.status,
        job_quadrant: selectedJob.value.quadrant,
        job_risk: selectedJob.value.risk,
        job_potential: selectedJob.value.potential,
        formations_interest: formationsInterest.value,
      },
    })
    if (res.ok) {
      submitMessage.value = 'C\'est bon. Premier article dans 7 jours max.'
      prenomInput.value = ''
      emailInput.value = ''
      formationsInterest.value = false
      consentChecked.value = false
      capture('newsletter_subscribed_from_scanner', {
        job_slug: selectedJob.value.slug,
        job_quadrant: selectedJob.value.quadrant,
        formations_interest: formationsInterest.value,
      })
    }
  } catch (e: any) {
    submitError.value = true
    submitMessage.value = e?.data?.message ?? 'Erreur technique, réessayez.'
  } finally {
    submitting.value = false
  }
}

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

// ── Reset ─────────────────────────────────────────────────
function reset() {
  currentScanId++
  if (noResultsTimer) { clearTimeout(noResultsTimer); noResultsTimer = null }
  if (selectedJob.value) {
    if (phase.value === 'gated') {
      capture('scanner_gate_dismissed', {
        job_slug:   selectedJob.value.slug,
        job_status: selectedJob.value.status,
      })
    }
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

function resetScan() {
  selectedJob.value = null
  query.value = ''
  phase.value = 'idle'
  router.replace({ query: {} })
  nextTick(() => jobInputRef.value?.focus())
}
</script>

<template>
  <div class="scanner-page">
    <div class="scanner-bg" aria-hidden="true" />
    <div class="container">

      <Breadcrumbs :items="[{ label: 'Scanner IA' }]" />
      <h1 class="scanner-h1">Scanner d'obsolescence IA - Quel est le risque pour ton métier&nbsp;?</h1>

      <!-- ── Intro ─────────────────────────────────────── -->
      <div class="scanner-intro">
        <p class="intro-lead">Ton métier face à l'IA - résultat en 10 secondes.</p>
        <ol class="intro-steps font-mono">
          <li><span class="step-num">01</span> Tape ton métier dans le champ <span class="step-accent">SUJET</span></li>
          <li><span class="step-num">02</span> Clique sur la correspondance - le rapport se déclassifie</li>
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
                <li class="no-result">Aucun résultat - essaie un autre terme</li>
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

        <!-- Classified pulse -->
        <div
          v-if="classifiedVisible"
          class="rep-classified font-mono"
          aria-live="polite"
        >
          CLASSIFIÉ - ACCÈS RESTREINT
        </div>

        <!-- TRAJECTOIRE -->
        <div class="rep-block" :class="{ 'is-shimmering': shimmering }">
          <div class="label"><KickerLabel>TRAJECTOIRE</KickerLabel></div>
          <div class="traj-text" :class="{ 'is-decrypted': trajState === 'decrypted' }">
            <div v-if="trajState === 'locked'" class="placeholder" aria-hidden="true">
              <span class="redact-line" />
              <span class="redact-line" />
              <span class="redact-line" />
            </div>
            <span
              v-else
              class="traj-revealed is-shown"
              :class="{
                'is-scrambling': trajState === 'scrambling',
              }"
            >{{ trajText }}</span>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="rep-block" :class="{ 'is-shimmering': shimmering }">
          <div class="label"><KickerLabel>CE QUE TU PEUX FAIRE <span class="ct">(3)</span></KickerLabel></div>
          <ol class="actions-list">
            <li
              v-for="(_, i) in actionStates"
              :key="i"
              class="action-item"
              :class="{
                'is-locked':     actionStates[i] === 'locked',
                'is-scrambling': actionStates[i] === 'scrambling',
                'is-decrypted':  actionStates[i] === 'decrypted',
              }"
            >
              <span class="action-num font-mono">0{{ i + 1 }}</span>
              <span class="action-arrow font-mono" aria-hidden="true">▸</span>
              <span class="action-text">{{ actionTexts[i] }}</span>
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

        <!-- Gate (locked state) -->
        <ScannerGate
          v-if="SCANNER_GATE_ENABLED && phase === 'gated' && selectedJob"
          :job="selectedJob"
          @unlocked="onGateUnlocked"
        />

        <!-- Access granted message (post-unlock confirmation) -->
        <div
          v-if="phase === 'unlocked' && justUnlocked"
          class="rep-access-granted font-mono"
          role="status"
        >
          <span class="ag-dot" aria-hidden="true">●</span>
          [ ACCÈS ACCORDÉ ] BIENVENUE DANS LA FRÉQUENCE
        </div>

      </article>

      <!-- ════ RESULT V2 — layout éditorial ════ -->
      <article
        v-if="phase === 'unlocked' && selectedJob"
        class="result-v2"
        aria-label="Résultat du diagnostic"
      >
        <!-- ════ HERO BLOCK ════ -->
        <div class="result-hero">
          <KickerLabel>Diagnostic IA · {{ selectedJob.label }}</KickerLabel>

          <h2 class="result-verdict">{{ QUADRANT_VERDICT_ITALIC[selectedJob.quadrant] }}</h2>

          <div class="result-scores font-mono">
            <span><strong :style="{ color: 'var(--color-mutation)' }">{{ displayRisk }}</strong><span class="score-suffix">/100</span> · risque</span>
            <span class="score-sep">•</span>
            <span><strong :style="{ color: 'var(--color-accent)' }">{{ selectedJob.potential }}</strong><span class="score-suffix">/100</span> · levier IA</span>
          </div>

          <p class="result-dynamic">{{ selectedJob.dynamic }}</p>
        </div>

        <div class="sage-rule" aria-hidden="true"></div>

        <!-- ════ SECTION I — POSITION ════ -->
        <section class="result-section">
          <div class="section-kicker font-mono">
            <span class="num">— I.</span>
            <span class="label">Position dans le cadran</span>
          </div>

          <div class="position-block">
            <!-- Matrix chip -->
            <div class="matrix-chip">
              <div class="matrix-grid">
                <div
                  v-for="q in (['tiens', 'pilotes', 'pivotes', 'mutes'] as JobQuadrant[])"
                  :key="q"
                  class="matrix-cell"
                  :class="{ 'matrix-cell--active': q === selectedJob.quadrant }"
                  :style="{ '--cell-color': QUADRANT_COLOR_VAR[q] } as any"
                >
                  {{ QUADRANT_LABELS[q].replace('TU ', '') }}
                </div>
              </div>
              <div class="matrix-axis-x font-mono">
                <span>← faible</span>
                <span>fort →</span>
              </div>
              <div class="matrix-axis-label font-mono">Levier IA</div>
            </div>

            <!-- Legend -->
            <ul class="legend-list">
              <li
                v-for="q in (['tiens', 'pilotes', 'pivotes', 'mutes'] as JobQuadrant[])"
                :key="q"
                class="legend-item"
                :class="{ 'legend-item--active': q === selectedJob.quadrant }"
                :style="{ '--legend-color': QUADRANT_COLOR_VAR[q] } as any"
              >
                <span class="legend-name font-mono">{{ QUADRANT_LABELS[q] }}</span>
                <span class="legend-def">{{ QUADRANT_DEFINITIONS[q] }}</span>
                <span v-if="q === selectedJob.quadrant" class="legend-marker font-mono">← toi</span>
              </li>
            </ul>
          </div>
        </section>

        <div class="sage-rule" aria-hidden="true"></div>

        <!-- ════ SECTION II — LEVIERS ════ -->
        <section class="result-section">
          <div class="section-kicker font-mono">
            <span class="num">— II.</span>
            <span class="label">Tes leviers cette semaine</span>
          </div>

          <p class="leviers-intro">{{ leviersIntro }}</p>

          <ol class="leviers-list">
            <li
              v-for="(levier, i) in leviersToShow"
              :key="i"
              class="levier-item"
            >
              <span class="levier-num font-mono">{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="levier-body">
                <h3 class="levier-title">{{ parseLevier(levier).title }}</h3>
                <p class="levier-desc">{{ parseLevier(levier).description }}</p>
              </div>
            </li>
          </ol>
        </section>

        <div class="sage-rule" aria-hidden="true"></div>

        <!-- ════ SECTION VI — LA SUITE (form newsletter) ════ -->
        <section class="result-section">
          <div class="section-kicker font-mono">
            <span class="num">— VI.</span>
            <span class="label">La suite</span>
          </div>

          <h2 class="suite-headline">Reste un cran devant.</h2>

          <p class="suite-lead">
            Un nouvel article chaque semaine pour piloter l'IA dans ton métier.
            Cinq minutes de lecture, sans hype, sans funnel. Concret, terrain.
          </p>

          <form class="suite-form" @submit.prevent="onSubscribe">
            <div class="suite-form-row">
              <input
                v-model="prenomInput"
                type="text"
                class="suite-input suite-input--prenom"
                placeholder="Prénom"
                required
                autocomplete="given-name"
              />
              <input
                v-model="emailInput"
                type="email"
                class="suite-input"
                placeholder="ton@email.pro"
                required
                autocomplete="email"
              />
              <button type="submit" class="suite-button font-mono" :disabled="submitting">
                {{ submitting ? '...' : 'Rejoindre →' }}
              </button>
            </div>

            <label class="suite-checkbox">
              <input v-model="formationsInterest" type="checkbox" />
              <span>Préviens-moi en avance des formations approfondies (bientôt). Accès en avant-première et tarif lancement.</span>
            </label>

            <label class="suite-checkbox">
              <input v-model="consentChecked" type="checkbox" required />
              <span>J'accepte de recevoir La Fréquence (newsletter hebdo, désinscription en 1 clic).</span>
            </label>

            <p v-if="submitMessage" class="suite-message" :class="{ 'is-error': submitError }">{{ submitMessage }}</p>
          </form>
        </section>

        <div class="sage-rule sage-rule--fade" aria-hidden="true"></div>

        <!-- ════ FOOTER ACTIONS ════ -->
        <div class="result-actions-v2 font-mono">
          <button type="button" class="action-link" @click="sourcesModalOpen = true">↗ Sources</button>
          <span class="action-sep">·</span>
          <button type="button" class="action-link" @click="copyLink">{{ copied ? '✓ Lien copié' : '⎘ Copier le lien' }}</button>
          <span class="action-sep">·</span>
          <button type="button" class="action-link" @click="resetScan">↻ Nouveau scan</button>
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
            <p class="faq-answer">Le score est une estimation éditoriale informée par un ensemble de recherches : études académiques (Tufts University, PayScope), rapports de cabinets (McKinsey, Goldman Sachs), institutions internationales (WEF) et données de plateformes (LinkedIn). Il donne une tendance sectorielle - pas un algorithme mécanique. Les sources complètes sont accessibles depuis chaque résultat.</p>
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
            <p class="faq-answer">Le score, l'horizon et le statut s'affichent immédiatement et gratuitement, sans collecte de données. Le plan d'action complet (trajectoire et 3 axes pratiques) est réservé aux abonnés de la newsletter La Fréquence - un email et un prénom suffisent, conformément à notre <NuxtLink to="/confidentialite">politique de confidentialité</NuxtLink>.</p>
          </details>
          <details class="faq-item">
            <summary class="faq-question">
              <span class="faq-q-text">Combien de métiers sont couverts ?</span>
              <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
            </summary>
            <p class="faq-answer">197 métiers sont analysés, répartis en 4 catégories : EN DANGER, EN MUTATION SÉVÈRE, PROTÉGÉ et EN CROISSANCE. Chaque analyse inclut un score de risque (0-100&nbsp;%), un horizon d'impact et une dynamique anticipée.</p>
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
.report[data-state="scanning"]  .report-progress { opacity: 1; }
.report[data-state="gated"]     .report-progress { opacity: 1; }
.report[data-state="unlocking"] .report-progress { opacity: 1; }
.report[data-state="unlocked"]  .report-progress { opacity: 0; transition: opacity 0.4s ease 0.5s; }

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
.traj-revealed.is-scrambling {
  color: var(--color-accent);
  opacity: 1;
  font-family: var(--font-mono);
}

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
.action-item.is-scrambling .action-text {
  color: var(--color-accent);
  font-family: var(--font-mono);
  background: transparent;
  border: none;
  padding: 0;
  height: auto;
  user-select: text;
}

/* Sources */
.sources-block { display: none; }
.report[data-state="unlocked"] .sources-block { display: block; }

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
.report[data-state="gated"]    .idle-hint,
.report[data-state="unlocking"] .idle-hint,
.report[data-state="unlocked"]  .idle-hint { display: none; }

/* (result-zone removed — replaced by result-v2 editorial layout) */

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

/* ── Classified pulse ─────────────────────────────────── */
.rep-classified {
  margin: 1.2rem 0 0.4rem;
  font-size: 0.78rem;
  letter-spacing: 0.15em;
  color: var(--color-danger);
  text-transform: uppercase;
  text-align: center;
  padding: 0.5rem 0.75rem;
  border: 1px dashed rgba(255, 0, 0, 0.25);
  background: rgba(255, 0, 0, 0.03);
  animation: classified-pulse 500ms ease-out;
}
@keyframes classified-pulse {
  0%   { opacity: 0; transform: scale(0.95); }
  50%  { opacity: 1; transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
}

/* ── Shimmer one-shot pour blocs verrouillés ──────────── */
.rep-block.is-shimmering .redact-line,
.rep-block.is-shimmering .action-item.is-locked .action-text {
  animation: shimmer-once 500ms ease-out;
  position: relative;
  overflow: hidden;
}
@keyframes shimmer-once {
  0%   { box-shadow: inset 0 0 0 0 rgba(0, 255, 65, 0); }
  50%  { box-shadow: inset 200px 0 30px -15px rgba(0, 255, 65, 0.2); }
  100% { box-shadow: inset 400px 0 30px -15px rgba(0, 255, 65, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .rep-classified { animation: none; }
  .rep-block.is-shimmering .redact-line,
  .rep-block.is-shimmering .action-item.is-locked .action-text { animation: none; }
}

.rep-access-granted {
  margin: 1.5rem 0 0;
  padding: 0.85rem 1rem;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  text-align: center;
  border-top: 1px solid rgba(0, 255, 65, 0.2);
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  background: rgba(0, 255, 65, 0.04);
}
.rep-access-granted .ag-dot {
  margin-right: 0.45rem;
  animation: led-pulse 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .rep-access-granted .ag-dot { animation: none; }
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

/* ════ Result V2 — éditorial layout ════ */
.result-v2 {
  max-width: 720px;
  margin: 64px auto 0;
  padding: 56px 0;
  font-family: var(--font-sans);
}

.result-hero {
  text-align: center;
  padding: 0 32px;
}

.result-verdict {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: clamp(48px, 10vw, 88px);
  line-height: 1;
  color: var(--color-text);
  margin: 32px 0 20px;
  letter-spacing: -0.02em;
  font-weight: 400;
}

.result-scores {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}
.result-scores strong { font-weight: 700; }
.result-scores .score-suffix { color: #555; }
.result-scores .score-sep { color: #2A2A2A; }

.result-dynamic {
  font-size: 17px;
  line-height: 1.65;
  color: var(--color-text);
  opacity: 0.85;
  max-width: 560px;
  margin: 0 auto;
}

.sage-rule {
  width: 80px;
  height: 1px;
  background: var(--color-accent);
  margin: 64px auto;
}
.sage-rule--fade {
  background: #2A2A2A;
  margin: 64px auto 32px;
}

.result-section {
  padding: 0 32px;
}

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

.position-block {
  display: flex;
  gap: 36px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.matrix-chip { width: 160px; flex-shrink: 0; }
.matrix-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  aspect-ratio: 1;
  background: transparent;
  border: 1px solid #2A2A2A;
  padding: 4px;
}
.matrix-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--cell-color);
  background: color-mix(in srgb, var(--cell-color) 12%, transparent);
}
.matrix-cell--active {
  background: var(--cell-color);
  color: var(--color-bg);
  font-weight: 700;
  font-size: 11px;
  box-shadow: inset 0 0 0 2px var(--color-accent), 0 0 14px rgba(108, 227, 181, 0.35);
}
.matrix-axis-x {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 9px;
  color: #555;
  letter-spacing: 0.05em;
}
.matrix-axis-label {
  text-align: center;
  margin-top: 4px;
  font-size: 9px;
  color: #555;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.legend-list {
  flex: 1;
  min-width: 280px;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.legend-item {
  display: flex;
  gap: 14px;
  align-items: baseline;
}
.legend-item--active {
  padding: 8px 12px;
  margin: -8px -12px;
  background: color-mix(in srgb, var(--legend-color) 10%, transparent);
  border-left: 2px solid var(--legend-color);
}
.legend-name {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--legend-color);
  font-weight: 700;
  flex-shrink: 0;
  min-width: 90px;
}
.legend-def {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-muted);
  flex: 1;
}
.legend-item--active .legend-def {
  color: var(--color-text);
  opacity: 0.95;
}
.legend-marker {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--color-accent);
  text-transform: uppercase;
}

.leviers-intro {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 32px;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0 0 36px;
  max-width: 560px;
  font-weight: 400;
}
.leviers-list { list-style: none; padding: 0; margin: 0; }
.levier-item {
  display: flex;
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid #1F1F1F;
}
.levier-item:last-child { border-bottom: 1px solid #1F1F1F; }
.levier-num {
  font-size: 13px;
  color: var(--color-accent);
  letter-spacing: 0.18em;
  flex-shrink: 0;
  min-width: 32px;
  padding-top: 2px;
}
.levier-body { flex: 1; min-width: 0; }
.levier-title {
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.35;
  margin: 0 0 8px;
}
.levier-desc {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--color-text);
  opacity: 0.75;
  line-height: 1.65;
  max-width: 580px;
  margin: 0;
}

.suite-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 32px;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0 0 16px;
  font-weight: 400;
}
.suite-lead {
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-text);
  opacity: 0.8;
  max-width: 560px;
  margin: 0 0 28px;
}
.suite-actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0 0 28px;
  max-width: 560px;
}
.suite-action {
  display: flex;
  gap: 16px;
  padding: 18px 20px;
  background: transparent;
  border: 1px solid #2A2A2A;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.15s, background 0.15s;
}
.suite-action:hover {
  border-color: var(--color-accent);
  background: rgba(108, 227, 181, 0.04);
}
.suite-action-icon {
  font-family: var(--font-mono);
  font-size: 22px;
  color: var(--color-accent);
  flex-shrink: 0;
  line-height: 1;
}
.suite-action-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.suite-action-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
}
.suite-action-meta {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.5;
}
.suite-coming {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.6;
  max-width: 560px;
  margin: 0;
}
.suite-coming strong { color: var(--color-text); font-weight: 600; }

.result-actions-v2 {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #555;
  padding: 0 32px;
}
.action-link {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  padding: 0;
}
.action-link:hover { color: var(--color-text); }
.action-sep { color: #2A2A2A; }

@media (max-width: 640px) {
  .result-v2 { padding: 40px 0; margin-top: 32px; }
  .result-hero { padding: 0 16px; }
  .result-section { padding: 0 16px; }
  .result-actions-v2 { padding: 0 16px; }
  .position-block { flex-direction: column; }
  .matrix-chip { width: 100%; max-width: 200px; margin: 0 auto; }
  .legend-list { width: 100%; min-width: 0; }
}

/* ── Section VI newsletter form ───────────────────────── */
.suite-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
}
.suite-form-row { display: flex; gap: 8px; flex-wrap: wrap; }
.suite-input {
  flex: 1;
  min-width: 180px;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #2A2A2A;
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s;
}
.suite-input:focus { border-color: var(--color-accent); }
.suite-input--prenom { max-width: 140px; }
.suite-button {
  padding: 14px 22px;
  background: var(--color-accent);
  border: none;
  color: var(--color-bg);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}
.suite-button:disabled { opacity: 0.5; cursor: wait; }
.suite-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.55;
}
.suite-checkbox input { margin-top: 3px; flex-shrink: 0; accent-color: var(--color-accent); }
.suite-message { font-size: 13px; margin: 0; color: var(--color-accent); }
.suite-message.is-error { color: var(--color-danger); }
</style>
