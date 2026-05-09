<!-- app/pages/scanner/[slug].vue -->
<script setup lang="ts">
import { findJobBySlug, type Job, type JobQuadrant } from '~/data/jobs'
import { findSecteurBySlug } from '~/data/secteurs'
import { getMetierContent } from '~/data/metier-content'
import { getLeviersByQuadrant } from '~/data/quadrant-leviers'

const route = useRoute()
const slug = route.params.slug as string

const job = findJobBySlug(slug)
if (!job) {
  throw createError({ statusCode: 404, statusMessage: `Métier "${slug}" introuvable`, fatal: true })
}

const secteur = findSecteurBySlug(job.secteur)
const dateModified = '2026-05-09'
const content = getMetierContent(job.slug, job.quadrant, dateModified)

// ── Constants visuels (cohérent avec scanner.vue) ──
const QUADRANT_VERDICT_ITALIC: Record<JobQuadrant, string> = {
  tiens:    'Tu tiens.',
  pilotes:  'Tu pilotes.',
  pivotes:  'Tu pivotes.',
  mutes:    'Tu mutes.',
}

const QUADRANT_LABELS: Record<JobQuadrant, string> = {
  tiens:    'TU TIENS',
  pilotes:  'TU PILOTES',
  pivotes:  'TU PIVOTES',
  mutes:    'TU MUTES',
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

// ── Leviers (per-job ou fallback per-quadrant) ──
const leviersToShow = computed<string[]>(() => {
  if (job.leviers.length > 0) return job.leviers
  return getLeviersByQuadrant(job.quadrant).leviers
})

const leviersIntro = computed<string>(() => {
  if (job.leviers.length > 0) {
    return `Trois actions concrètes pour piloter l'IA dans ton métier de ${job.label.toLowerCase()}.`
  }
  return getLeviersByQuadrant(job.quadrant).intro
})

function parseLevier(levier: string): { title: string, description: string } {
  const sepIndex = levier.indexOf(' — ')
  if (sepIndex === -1) return { title: levier, description: '' }
  return {
    title: levier.slice(0, sepIndex).trim(),
    description: levier.slice(sepIndex + 3).trim(),
  }
}

// ── Form newsletter (Section VI) ──
const { capture } = usePosthogEvent()

const prenomInput = ref('')
const emailInput = ref('')
const formationsInterest = ref(false)
const consentChecked = ref(false)
const submitting = ref(false)
const submitError = ref(false)
const submitMessage = ref('')

async function onSubscribe() {
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
        source: 'metier_static',
        job_slug: job.slug,
        job_status: job.status,
        job_quadrant: job.quadrant,
        job_risk: job.risk,
        job_potential: job.potential,
        formations_interest: formationsInterest.value,
      },
    })
    if (res.ok) {
      submitMessage.value = 'C\'est bon. Premier article dans 7 jours max.'
      prenomInput.value = ''
      emailInput.value = ''
      formationsInterest.value = false
      consentChecked.value = false
      capture('newsletter_subscribed_from_metier_page', {
        slug: job.slug,
        quadrant: job.quadrant,
        secteur: job.secteur,
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

// ── PostHog page view enrichi ──
onMounted(() => {
  capture('metier_page_viewed', {
    slug: job.slug,
    quadrant: job.quadrant,
    secteur: job.secteur,
    risk: job.risk,
    potential: job.potential,
    referrer: document.referrer,
  })
})

// ── SEO meta + JSON-LD Article + BreadcrumbList ──
const pageUrl = `https://survivant-ia.ch/scanner/${job.slug}`
const pageTitle = `${job.label} face à l'IA : ${QUADRANT_VERDICT_ITALIC[job.quadrant]} (${job.risk}/100) | Survivant-IA`
const pageDesc = `${job.dynamic.slice(0, 155)}...`

useSeoMeta({
  title: pageTitle,
  description: pageDesc,
  ogTitle: `${job.label} face à l'IA — ${QUADRANT_VERDICT_ITALIC[job.quadrant]}`,
  ogDescription: pageDesc,
  ogUrl: pageUrl,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: `${job.label} face à l'IA — ${QUADRANT_VERDICT_ITALIC[job.quadrant]}`,
  twitterDescription: pageDesc,
})

useHead({
  link: [
    { rel: 'canonical', href: pageUrl },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': `${pageUrl}#article`,
          headline: `${job.label} face à l'IA en 2026`,
          description: pageDesc,
          datePublished: '2026-05-09',
          dateModified: content.dateModified,
          inLanguage: 'fr-CH',
          url: pageUrl,
          author: { '@type': 'Person', '@id': 'https://survivant-ia.ch/identite#person' },
          publisher: { '@type': 'Organization', '@id': 'https://survivant-ia.ch/#organization' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${pageUrl}#page` },
          articleSection: secteur.label,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
            { '@type': 'ListItem', position: 2, name: 'Scanner', item: 'https://survivant-ia.ch/scanner' },
            { '@type': 'ListItem', position: 3, name: job.label },
          ],
        },
      ],
    }),
  }],
})

defineOgImage('Metier', {
  label: job.label,
  verdict: QUADRANT_VERDICT_ITALIC[job.quadrant],
  quadrant: job.quadrant,
  risk: job.risk,
  potential: job.potential,
  secteurLabel: secteur.shortLabel,
})
</script>

<template>
  <article class="metier-page">
    <AuthorByline :date-modified="content.dateModified" />

    <header class="result-hero">
      <KickerLabel>Diagnostic IA · {{ job.label }}</KickerLabel>
      <h1 class="result-verdict">{{ QUADRANT_VERDICT_ITALIC[job.quadrant] }}</h1>
      <div class="result-scores font-mono">
        <span><strong :style="{ color: 'var(--color-mutation)' }">{{ job.risk }}</strong><span class="score-suffix">/100</span> · risque</span>
        <span class="score-sep">•</span>
        <span><strong :style="{ color: 'var(--color-accent)' }">{{ job.potential }}</strong><span class="score-suffix">/100</span> · levier IA</span>
      </div>
      <p class="result-dynamic">{{ job.dynamic }}</p>
    </header>

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- Section I — Position dans le cadran -->
    <section class="result-section">
      <div class="section-kicker font-mono">
        <span class="num">— I.</span>
        <span class="label">Position dans le cadran</span>
      </div>
      <div class="position-block">
        <div class="matrix-chip">
          <div class="matrix-grid">
            <div
              v-for="q in (['tiens', 'pilotes', 'pivotes', 'mutes'] as JobQuadrant[])"
              :key="q"
              class="matrix-cell"
              :class="{ 'matrix-cell--active': q === job.quadrant }"
              :style="{ '--cell-color': QUADRANT_COLOR_VAR[q] } as Record<string, string>"
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
        <ul class="legend-list">
          <li
            v-for="q in (['tiens', 'pilotes', 'pivotes', 'mutes'] as JobQuadrant[])"
            :key="q"
            class="legend-item"
            :class="{ 'legend-item--active': q === job.quadrant }"
            :style="{ '--legend-color': QUADRANT_COLOR_VAR[q] } as Record<string, string>"
          >
            <span class="legend-name font-mono">{{ QUADRANT_LABELS[q] }}</span>
            <span class="legend-def">{{ QUADRANT_DEFINITIONS[q] }}</span>
            <span v-if="q === job.quadrant" class="legend-marker font-mono">← toi</span>
          </li>
        </ul>
      </div>
    </section>

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- Section II — Leviers -->
    <section class="result-section">
      <div class="section-kicker font-mono">
        <span class="num">— II.</span>
        <span class="label">Tes leviers cette semaine</span>
      </div>
      <p class="leviers-intro">{{ leviersIntro }}</p>
      <ol class="leviers-list">
        <li v-for="(levier, i) in leviersToShow" :key="i" class="levier-item">
          <span class="levier-num font-mono">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="levier-body">
            <h3 class="levier-title">{{ parseLevier(levier).title }}</h3>
            <p class="levier-desc">{{ parseLevier(levier).description }}</p>
          </div>
        </li>
      </ol>
    </section>

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- Section III — 3 angles éditoriaux -->
    <MetierEditorialSection
      :job="job"
      :contexte="content.contexte"
      :trajectoire="content.trajectoire"
      :anticipation="content.anticipation"
    />

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- Section IV — FAQ -->
    <MetierFAQ :job="job" :faq="content.faq" />

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- Section V — Pour aller plus loin -->
    <section class="result-section">
      <div class="section-kicker font-mono">
        <span class="num">— V.</span>
        <span class="label">Pour aller plus loin</span>
      </div>
      <MetierArticles :job="job" />
      <MetierSimilaires :job="job" />
    </section>

    <div class="sage-rule" aria-hidden="true"></div>

    <!-- Section VI — La suite (form newsletter) -->
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
          <input v-model="prenomInput" type="text" class="suite-input suite-input--prenom" placeholder="Prénom" required autocomplete="given-name" />
          <input v-model="emailInput" type="email" class="suite-input" placeholder="ton@email.pro" required autocomplete="email" />
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

    <div class="footer-actions font-mono">
      <NuxtLink to="/scanner" class="action-link">↻ Tester un autre métier</NuxtLink>
      <span class="action-sep">·</span>
      <NuxtLink to="/scanner" class="action-link">📋 Voir tous les métiers</NuxtLink>
    </div>
  </article>
</template>

<style scoped>
.metier-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 0 56px;
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

.result-section { padding: 0 32px; }
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

/* Matrix + legend */
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

/* Leviers */
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

/* Suite (form newsletter) */
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

/* Footer actions */
.footer-actions {
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
  color: var(--color-muted);
  text-decoration: none;
  cursor: pointer;
}
.action-link:hover { color: var(--color-text); }
.action-sep { color: #2A2A2A; }

@media (max-width: 640px) {
  .position-block { flex-direction: column; }
  .matrix-chip { width: 100%; max-width: 200px; margin: 0 auto; }
  .legend-list { width: 100%; }
}
</style>
