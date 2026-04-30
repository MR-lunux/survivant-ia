<!-- app/pages/scanner.vue -->
<script setup lang="ts">
import { findJobBySlug, searchJobs, type Job } from '~/data/jobs'
import SourcesModal from '~/components/SourcesModal.vue'

// ── SEO static ──────────────────────────────────────────
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
                text: 'Le score est basé sur 3 sources académiques et institutionnelles : Tufts University (2026), McKinsey Global Institute et World Economic Forum. Il prend en compte la substituabilité des tâches, l\'horizon temporel d\'impact et les tendances d\'adoption des LLM par secteur.',
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

// ── Popular jobs (crawlable quick-links) ─────────────────
const POPULAR_JOBS = [
  { slug: 'comptable',          label: 'Comptable' },
  { slug: 'developpeur-logiciel', label: 'Développeur logiciel' },
  { slug: 'infirmier',          label: 'Infirmier' },
  { slug: 'commercial',         label: 'Commercial B2B' },
  { slug: 'chef-de-projet-it',  label: 'Chef de projet IT' },
  { slug: 'avocat',             label: 'Avocat' },
  { slug: 'medecin-generaliste', label: 'Médecin généraliste' },
  { slug: 'recruteur',          label: 'Recruteur' },
  { slug: 'journaliste-presse', label: 'Journaliste' },
  { slug: 'data-scientist',     label: 'Data Scientist' },
]

// ── PostHog tracking ─────────────────────────────────────
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

// ── State ────────────────────────────────────────────────
const route  = useRoute()
const router = useRouter()

const query       = ref('')
const suggestions = ref<Job[]>([])
const phase       = ref<'idle' | 'scanning' | 'result'>('idle')
const selectedJob = ref<Job | null>(null)
const termLines   = ref<{ text: string; done: boolean }[]>([])
const copied            = ref(false)
const sourcesModalOpen  = ref(false)
const jobInputRef = ref<HTMLInputElement | null>(null)
const displayRisk = ref(0)
let copyTimer:     ReturnType<typeof setTimeout>  | null = null
let riskAnimTimer: ReturnType<typeof setInterval> | null = null
const scanTimers: ReturnType<typeof setTimeout>[] = []

// ── Autocomplete ─────────────────────────────────────────
let noResultsTimer: ReturnType<typeof setTimeout> | null = null
watch(query, (val) => {
  suggestions.value = searchJobs(val)
  if (noResultsTimer) clearTimeout(noResultsTimer)
  // Tracking threshold is 3 (UX shows "no result" at 2) — avoids noise from short partial queries
  if (val.length >= 3 && suggestions.value.length === 0) {
    noResultsTimer = setTimeout(() => {
      capture('scanner_search_no_results', { query: val.trim() })
      noResultsTimer = null
    }, 600)
  }
})

function selectJob(job: Job) {
  query.value       = job.label
  suggestions.value = []
  selectedJob.value = job
  capture('scanner_job_selected', jobProps(job, 'suggestion'))
  startScan(job)
}

// ── URL param pre-load ───────────────────────────────────
onMounted(() => {
  const slug = route.query.job as string | undefined
  if (slug) {
    const job = findJobBySlug(slug)
    if (job) {
      query.value       = job.label
      selectedJob.value = job
      phase.value       = 'result'
      setDynamicMeta(job)
      capture('scanner_job_selected', jobProps(job, 'url_param'))
      capture('scanner_scan_completed', jobProps(job, 'url_param'))
    }
  } else {
    jobInputRef.value?.focus()
  }
})

onBeforeUnmount(() => {
  scanTimers.forEach(id => clearTimeout(id))
  if (copyTimer)      clearTimeout(copyTimer)
  if (riskAnimTimer)  clearInterval(riskAnimTimer)
  if (noResultsTimer) clearTimeout(noResultsTimer)
})

// ── Terminal animation ───────────────────────────────────
const SCAN_LINES = (jobLabel: string) => [
  `$ survival_check --job="${jobLabel}"`,
  'connecting to Tufts-2026 dataset ............. ok',
  'cross-referencing McKinsey agentic index ..... ok',
  'parsing job description ...................... ok',
  'simulating LLM capability curve (2026 → 2031) . ok',
]

const VERDICT: Record<Job['status'], string> = {
  danger:     'remplacement probable',
  mutation:   'mutation sévère imminente',
  protege:    'résistance confirmée',
  croissance: 'croissance structurelle',
}

const STATUS_LABELS: Record<Job['status'], string> = {
  danger:     'EN DANGER',
  mutation:   'EN MUTATION SÉVÈRE',
  protege:    'PROTÉGÉ',
  croissance: 'EN CROISSANCE',
}

const STATUS_VERDICT_LINE: Record<Job['status'], string> = {
  danger:     'Ton métier est dans le viseur.',
  mutation:   'Ton métier ne disparaît pas. Il devient méconnaissable.',
  protege:    'L\'IA ne te remplace pas — elle a besoin de toi.',
  croissance: 'Tu es dans le bon wagon. Pour l\'instant.',
}

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
  if (newPhase === 'result' && selectedJob.value) animateRisk(selectedJob.value.risk)
})

function startScan(job: Job) {
  scanTimers.forEach(id => clearTimeout(id))
  scanTimers.length = 0

  phase.value     = 'scanning'
  termLines.value = []

  const lines = SCAN_LINES(job.label)
  lines.forEach((text, i) => {
    scanTimers.push(setTimeout(() => {
      termLines.value.push({ text, done: false })
      scanTimers.push(setTimeout(() => {
        termLines.value[i].done = true
        if (i === lines.length - 1) {
          scanTimers.push(setTimeout(() => {
            phase.value = 'result'
            router.replace({ query: { job: job.slug } })
            setDynamicMeta(job)
            capture('scanner_scan_completed', jobProps(job, 'suggestion'))
          }, 400))
        }
      }, 350))
    }, i * 420))
  })
}

// ── Dynamic og meta ──────────────────────────────────────
function setDynamicMeta(job: Job) {
  useHead({
    meta: [
      { property: 'og:title',       content: `Mon risque IA : ${job.risk}% — ${job.label} | Survival Check` },
      { property: 'og:description', content: `J'ai scanné mon métier sur survivant-ia.ch. Résultat : ${STATUS_LABELS[job.status]}. Et toi ?` },
    ],
  })
}

// ── Result computed ──────────────────────────────────────
const resultLine = computed(() => {
  if (!selectedJob.value) return ''
  return `✓ obsolescence risk: ${selectedJob.value.risk}% — ${VERDICT[selectedJob.value.status]}`
})

const statusColor = computed(() => {
  if (!selectedJob.value) return 'var(--color-muted)'
  switch (selectedJob.value.status) {
    case 'danger':     return 'var(--color-danger)'
    case 'mutation':   return 'var(--color-mutation)'
    case 'protege':    return 'var(--color-protege)'
    case 'croissance': return 'var(--color-croissance)'
  }
})

// When danger: value + gauge use white (card has red bg); otherwise use statusColor
const riskCardFg = computed(() =>
  selectedJob.value?.status === 'danger' ? '#ffffff' : statusColor.value
)

const statusLabel = computed(() => {
  if (!selectedJob.value) return ''
  return STATUS_LABELS[selectedJob.value.status]
})

const ctaHook = computed(() => {
  if (!selectedJob.value) return ''
  switch (selectedJob.value.status) {
    case 'danger':     return 'La newsletter qui te dit comment NE PAS te faire remplacer.'
    case 'mutation':   return 'Apprends à muter avant que ton métier ne le fasse sans toi.'
    case 'protege':    return 'Reste devant. La veille IA chaque semaine.'
    case 'croissance': return 'Capitalise sur ta position. Reçois La Fréquence.'
  }
})

const ctaButton = computed(() => {
  if (!selectedJob.value) return 'Rejoindre La Fréquence'
  return selectedJob.value.status === 'danger' ? 'Rejoindre La Fréquence' : "S'inscrire"
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
  if (noResultsTimer) { clearTimeout(noResultsTimer); noResultsTimer = null }
  if (selectedJob.value) {
    capture('scanner_reset', { previous_job_slug: selectedJob.value.slug })
  }
  scanTimers.forEach(id => clearTimeout(id))
  scanTimers.length = 0
  if (riskAnimTimer) { clearInterval(riskAnimTimer); riskAnimTimer = null }
  displayRisk.value = 0
  query.value       = ''
  suggestions.value = []
  selectedJob.value = null
  termLines.value   = []
  phase.value       = 'idle'
  router.replace({ query: {} })
}
</script>

<template>
  <div class="scanner-page">
    <div class="scanner-bg" aria-hidden="true" />
    <div class="container">

      <Breadcrumbs :items="[{ label: 'Scanner IA' }]" />

      <!-- ── Header terminal ──────────────────────── -->
      <div class="terminal-header font-mono">
        <span class="term-dots" aria-hidden="true">
          <span class="dot dot-r" />
          <span class="dot dot-y" />
          <span class="dot dot-g" />
        </span>
        <span class="term-title">SURVIVANT-IA · ./SURVIVAL_CHECK.SH</span>
        <span class="term-version">V0.7.3</span>
      </div>

      <!-- ── Main terminal body ───────────────────── -->
      <div class="terminal-body">
        <span class="section-label font-mono">// SCANNER D'OBSOLESCENCE</span>
        <h1 class="scanner-h1">Scanner d'obsolescence IA — Quel est le risque pour ton métier&nbsp;?</h1>

        <!-- Input autocomplete -->
        <div v-if="phase === 'idle'" class="input-zone">
          <p class="input-prompt font-mono">Quel est votre métier ?</p>
          <div class="autocomplete-wrapper">
            <div class="input-row font-mono">
              <span class="prompt-char text-accent">$&nbsp;</span>
              <input
                ref="jobInputRef"
                v-model="query"
                class="job-input font-mono"
                type="text"
                placeholder="Ex : Comptable, Développeur, Infirmier..."
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <ul v-if="suggestions.length" class="suggestions-list">
              <li
                v-for="job in suggestions"
                :key="job.slug"
                class="suggestion-item font-mono"
                @click="selectJob(job)"
              >
                {{ job.label }}
              </li>
            </ul>
            <p v-if="query.length >= 2 && suggestions.length === 0" class="no-result font-mono">
              // Aucun résultat — essaie un autre terme
            </p>
          </div>
        </div>

        <!-- Terminal scanning animation -->
        <div v-if="phase === 'scanning' || phase === 'result'" class="terminal-output">
          <div
            v-for="(line, i) in termLines"
            :key="i"
            class="term-line font-mono"
            :class="{ 'line-prompt': i === 0 }"
          >
            <span v-if="i === 0" class="text-accent">{{ line.text }}</span>
            <span v-else>
              {{ line.text }}
              <span v-if="!line.done" class="cursor" aria-hidden="true" />
            </span>
          </div>
          <div v-if="phase === 'result'" class="term-line result-line font-mono">
            {{ resultLine }}
          </div>
        </div>

      </div><!-- end terminal-body -->

      <!-- ── Results ──────────────────────────────── -->
      <div v-if="phase === 'result' && selectedJob" class="results-section">

        <!-- 3 stat cards -->
        <div class="stats-grid">
          <ScannerBorder
            class="stat-card"
            :class="{ 'stat-card--danger': selectedJob?.status === 'danger' }"
          >
            <p class="stat-label font-mono">RISQUE</p>
            <p class="stat-value font-mono" :style="{ color: riskCardFg }">
              {{ displayRisk }}<span class="stat-unit">%</span>
            </p>
            <div class="gauge-track" aria-hidden="true">
              <div class="gauge-fill" :style="{ width: displayRisk + '%', background: riskCardFg }" />
            </div>
          </ScannerBorder>
          <ScannerBorder class="stat-card">
            <p class="stat-label font-mono">HORIZON</p>
            <p class="stat-value font-mono text-accent">
              {{ selectedJob.horizon }}<span class="stat-unit"> ans</span>
            </p>
          </ScannerBorder>
          <ScannerBorder class="stat-card">
            <p class="stat-label font-mono">STATUT</p>
            <p class="stat-value stat-status font-mono" :style="{ color: statusColor }">
              {{ statusLabel }}
            </p>
          </ScannerBorder>
        </div>

        <!-- Message + CTA -->
        <div class="message-block">
          <span class="message-bar" :style="{ background: statusColor }" aria-hidden="true" />
          <p class="message-text">{{ STATUS_VERDICT_LINE[selectedJob.status] }}</p>
        </div>

        <!-- Dynamique block -->
        <div class="dynamic-block font-mono">
          <div class="dynamic-label">// DYNAMIQUE ANTICIPÉE</div>
          <p class="dynamic-text">{{ selectedJob.dynamic }}</p>
        </div>

        <!-- Sources trigger -->
        <button type="button" class="sources-trigger font-mono" @click="sourcesModalOpen = true">
          → Voir les sources de cette analyse
        </button>

        <div class="cta-zone">
          <div class="cta-inner">
            <p class="cta-hook font-mono">{{ ctaHook }}</p>
            <GlitchButton :label="ctaButton" to="/#newsletter" @click="onCtaClick" />
          </div>
          <button class="share-btn font-mono" @click="copyLink">
            {{ copied ? '[ Lien copié ! ]' : '[ Partager mon résultat ]' }}
          </button>
        </div>

        <!-- Source -->
        <p class="source-note font-mono">
          // <button class="reset-btn font-mono" @click="reset">Nouveau scan →</button>
        </p>

      </div><!-- end results-section -->

      <!-- ── MÉTIERS FRÉQUENTS ──────────────────────── -->
      <div class="popular-jobs">
        <p class="popular-label font-mono">// MÉTIERS FRÉQUENTS</p>
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

      <!-- ── FAQ ───────────────────────────────────── -->
      <section class="faq-section" aria-label="Questions fréquentes">
        <p class="faq-header font-mono">// QUESTIONS FRÉQUENTES</p>
        <dl class="faq-list">
          <div class="faq-item">
            <dt class="faq-q">Comment est calculé le score de risque d'automatisation ?</dt>
            <dd class="faq-a">Le score est basé sur 3 sources académiques et institutionnelles : Tufts University (2026), McKinsey Global Institute et World Economic Forum. Il prend en compte la substituabilité des tâches, l'horizon temporel d'impact et les tendances d'adoption des LLM par secteur.</dd>
          </div>
          <div class="faq-item">
            <dt class="faq-q">Quels métiers sont les plus menacés par l'IA en 2026 ?</dt>
            <dd class="faq-a">Les professions les plus exposées sont celles à forte composante répétitive : agents de saisie (90&nbsp;%), télévendeurs (92&nbsp;%), correcteurs (85&nbsp;%), traducteurs (82&nbsp;%). Ces métiers sont touchés sur un horizon de 2 ans selon les projections 2026.</dd>
          </div>
          <div class="faq-item">
            <dt class="faq-q">Mes données personnelles sont-elles enregistrées ?</dt>
            <dd class="faq-a">Non. Le scanner ne collecte aucune donnée personnelle. Aucune inscription n'est nécessaire. Seuls des événements anonymes d'usage sont transmis pour améliorer l'outil.</dd>
          </div>
          <div class="faq-item">
            <dt class="faq-q">Combien de métiers sont couverts ?</dt>
            <dd class="faq-a">197 métiers sont analysés, répartis en 4 catégories : EN DANGER, EN MUTATION SÉVÈRE, PROTÉGÉ et EN CROISSANCE. Chaque analyse inclut un score de risque (0–100&nbsp;%), un horizon d'impact et une dynamique anticipée.</dd>
          </div>
          <div class="faq-item">
            <dt class="faq-q">Les résultats sont-ils fiables ?</dt>
            <dd class="faq-a">Les scores reflètent l'état des recherches académiques en 2026. Ils donnent une tendance sectorielle, pas une prédiction individuelle garantie. Chaque résultat inclut ses sources pour que vous puissiez évaluer la solidité des données.</dd>
          </div>
        </dl>
      </section>

    </div><!-- end container -->
  </div>

  <SourcesModal
    :open="sourcesModalOpen"
    :job="selectedJob"
    @close="sourcesModalOpen = false"
  />
</template>

<style scoped>
.scanner-page {
  padding: 4rem 0 6rem;
  position: relative;
  overflow: hidden;
}

/* ── Background scan effect ──────────────────────── */
.scanner-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(circle, rgba(0, 255, 65, 0.07) 1px, transparent 1px);
  background-size: 32px 32px;
}
.scanner-bg::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  top: -4px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 255, 65, 0.45) 20%,
    rgba(0, 255, 65, 0.9) 50%,
    rgba(0, 255, 65, 0.45) 80%,
    transparent 100%
  );
  box-shadow: 0 0 14px 4px rgba(0, 255, 65, 0.25);
  animation: scan-sweep 5s linear infinite;
}
@keyframes scan-sweep {
  0%   { top: -4px; opacity: 0; }
  5%   { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.scanner-page > .container {
  position: relative;
  z-index: 1;
}

/* ── H1 — visible pour SEO, discret dans l'UI ─────── */
.scanner-h1 {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.section-label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-bottom: 1.5rem;
}

/* ── Terminal header ─────────────────────────────── */
.terminal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid rgba(0, 255, 65, 0.12);
  padding: 0.6rem 1rem;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  margin-bottom: 0;
  max-width: 780px;
}
.term-dots    { display: flex; gap: 0.35rem; }
.dot          { width: 10px; height: 10px; border-radius: 50%; }
.dot-r        { background: #FF5F57; }
.dot-y        { background: #FEBC2E; }
.dot-g        { background: #28C840; }
.term-title   { flex: 1; text-align: center; }
.term-version { color: var(--color-muted); }

/* ── Terminal body ───────────────────────────────── */
.terminal-body {
  background: var(--color-surface);
  border: 1px solid rgba(0, 255, 65, 0.12);
  border-top: none;
  padding: 2rem;
  max-width: 780px;
  margin-bottom: 2.5rem;
}

/* ── Input zone ──────────────────────────────────── */
.input-prompt {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1.25rem;
}
.autocomplete-wrapper { position: relative; }
.input-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.prompt-char { font-size: 1rem; flex-shrink: 0; }
.job-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-accent);
  font-size: 1rem;
  caret-color: var(--color-accent);
}
.job-input::placeholder { color: var(--color-muted); }

.suggestions-list {
  list-style: none;
  margin: 0.5rem 0 0 0;
  padding: 0;
  border: 1px solid rgba(0, 255, 65, 0.2);
  background: var(--color-surface-2);
}
.suggestion-item {
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.1s;
}
.suggestion-item:hover {
  background: rgba(0, 255, 65, 0.08);
  color: var(--color-accent);
}

.no-result {
  font-size: 0.7rem;
  color: var(--color-muted);
  margin-top: 0.75rem;
  letter-spacing: 0.1em;
}

/* ── Terminal output lines ───────────────────────── */
.terminal-output { margin-top: 0.5rem; }
.term-line {
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  line-height: 1.8;
}
.result-line { color: var(--color-accent); font-weight: 700; margin-top: 0.25rem; }
.cursor {
  display: inline-block;
  width: 8px; height: 1em;
  background: var(--color-accent);
  vertical-align: middle;
  margin-left: 2px;
  animation: blink 0.7s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Results ─────────────────────────────────────── */
.results-section { max-width: 780px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card { padding: 1.5rem 1.25rem; background: var(--color-surface); }
.stat-card--danger { background: var(--color-danger); }
.stat-card--danger .stat-label { color: rgba(255, 255, 255, 0.7); }
.stat-card--danger .gauge-track { background: rgba(255, 255, 255, 0.25); }
.stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  margin: 0 0 0.5rem;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}
.stat-unit  { font-size: 1rem; }
.stat-status { font-size: 1.1rem; line-height: 1.3; }

.message-block {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface);
}
.message-bar { width: 3px; flex-shrink: 0; align-self: stretch; border-radius: 2px; }
.message-text { margin: 0; font-size: 1rem; line-height: 1.7; color: var(--color-text); }

.dynamic-block {
  margin: 1.5rem 0;
  padding: 1rem 1.25rem;
  background: var(--color-surface-2);
  border-left: 3px solid v-bind(statusColor);
}
.dynamic-label {
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-bottom: 0.5rem;
}
.dynamic-text {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--color-text);
  margin: 0;
}

.sources-trigger {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.5rem 0;
  margin: 0.5rem 0 1.5rem;
  text-align: left;
}
.sources-trigger:hover { color: var(--color-text); }

.cta-zone {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.cta-inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.cta-hook {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--color-muted);
  margin: 0;
}
.share-btn {
  background: transparent;
  border: 1px solid rgba(0, 255, 65, 0.25);
  color: var(--color-muted);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.share-btn:hover {
  color: var(--color-accent);
  border-color: rgba(0, 255, 65, 0.5);
}

.source-note {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  margin-bottom: 2rem;
}
.reset-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  padding: 0;
}
.reset-btn:hover { opacity: 0.75; }

/* ── Gauge ───────────────────────────────────────── */
.gauge-track {
  margin-top: 0.75rem;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}
.gauge-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.02s linear;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr; }
  .terminal-body { padding: 1.25rem; }
  .stat-value { font-size: 1.6rem; }
}

@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; opacity: 1; }
  .gauge-fill { transition: none; }
  .scanner-bg::after { animation: none; }
}

/* ── Popular jobs ─────────────────────────────── */
.popular-jobs {
  max-width: 780px;
  margin-top: 3rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(0, 255, 65, 0.1);
}
.popular-label {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
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

/* ── FAQ ──────────────────────────────────────── */
.faq-section {
  max-width: 780px;
  margin-top: 3rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(0, 255, 65, 0.1);
}
.faq-header {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-bottom: 1.5rem;
}
.faq-list { display: flex; flex-direction: column; gap: 1.25rem; }
.faq-item {
  padding: 1.25rem;
  background: var(--color-surface);
  border-left: 2px solid rgba(0, 255, 65, 0.3);
}
.faq-q {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-text);
  margin: 0 0 0.6rem;
  letter-spacing: 0.02em;
}
.faq-a {
  font-size: 0.9rem;
  color: var(--color-muted);
  line-height: 1.7;
  margin: 0;
}
</style>
