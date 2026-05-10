<!-- app/pages/metiers/index.vue -->
<script setup lang="ts">
import { JOBS } from '~/data/jobs'
import { getSecteursOrdered } from '~/data/secteurs'
import { searchJobsByLabel } from '~/utils/job-similars'

const { capture } = usePosthogEvent()

const searchQuery = ref('')

// Filtrage : si query, on cherche dans tous les jobs ; sinon on garde tous
const filteredJobs = computed(() => {
  if (searchQuery.value.trim().length === 0) return JOBS
  return searchJobsByLabel(searchQuery.value)
})

// Pour chaque secteur (ordonné), liste des jobs filtrés du secteur
const secteursWithJobs = computed(() => {
  return getSecteursOrdered().map(secteur => ({
    ...secteur,
    jobs: filteredJobs.value
      .filter(j => j.secteur === secteur.slug)
      .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
  })).filter(s => s.jobs.length > 0)
})

const totalCount = computed(() => filteredJobs.value.length)

// Capture search PostHog (debounced)
let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    if (val.trim().length >= 3) {
      capture('metiers_browse_search', {
        query: val.trim(),
        results_count: totalCount.value,
      })
    }
  }, 600)
})

function onMetierClick(secteur: string, slug: string) {
  capture('metiers_browse_secteur_clicked', { secteur, slug })
}

// SEO
useSeoMeta({
  title: 'Tous les métiers face à l\'IA : 196 diagnostics par secteur | Survivant-IA',
  description: 'Cherche ton métier ou explore les 196 diagnostics IA classés par secteur (cognitif, tech, santé, manuels, etc.) pour piloter l\'IA dans ton travail.',
  ogTitle: 'Tous les métiers face à l\'IA — Survivant-IA',
  ogDescription: '196 diagnostics IA par secteur. Cherche le tien.',
  ogUrl: 'https://survivant-ia.ch/metiers',
  ogType: 'website',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://survivant-ia.ch/metiers' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': 'https://survivant-ia.ch/metiers#page',
          name: 'Métiers couverts par Survivant-IA',
          description: 'Les 196 métiers analysés par le Scanner IA, classés par secteur.',
          url: 'https://survivant-ia.ch/metiers',
          inLanguage: 'fr-CH',
          isPartOf: { '@id': 'https://survivant-ia.ch/#website' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
            { '@type': 'ListItem', position: 2, name: 'Tous les métiers' },
          ],
        },
      ],
    }),
  }],
})

defineOgImage('Default', {
  title: 'Tous les métiers face à l\'IA',
  kicker: '196 DIAGNOSTICS · 7 SECTEURS',
})
</script>

<template>
  <div class="metiers-page">
    <header class="metiers-hero">
      <KickerLabel>Métiers couverts</KickerLabel>
      <h1 class="metiers-h1">
        Les <strong>{{ JOBS.length }} métiers</strong> que Survivant-IA analyse.
      </h1>
      <p class="metiers-subtitle">
        Cherche le tien ou explore par secteur.
      </p>
    </header>

    <div class="metiers-search">
      <input
        v-model="searchQuery"
        type="search"
        class="search-input font-mono"
        placeholder="Tape ton métier..."
        autocomplete="off"
      />
      <p v-if="searchQuery" class="search-results">{{ totalCount }} résultat(s)</p>
    </div>

    <div v-for="secteur in secteursWithJobs" :key="secteur.slug" class="secteur-section">
      <h2 class="secteur-heading">
        <span class="secteur-label">{{ secteur.label }}</span>
        <span class="secteur-count font-mono">{{ secteur.jobs.length }}</span>
      </h2>
      <div class="secteur-grid">
        <div
          v-for="job in secteur.jobs"
          :key="job.slug"
          @click="onMetierClick(secteur.slug, job.slug)"
        >
          <MetierCard :job="job" />
        </div>
      </div>
    </div>

    <p v-if="totalCount === 0" class="empty-state">
      Aucun métier trouvé pour «&nbsp;{{ searchQuery }}&nbsp;». Demande-le ci-dessous, je l'analyse.
    </p>

    <MetiersRequestForm :prefill="searchQuery" />
  </div>
</template>

<style scoped>
.metiers-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 32px;
  font-family: var(--font-sans);
}

.metiers-hero {
  text-align: center;
  margin-bottom: 48px;
}

.metiers-h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: clamp(36px, 6vw, 56px);
  line-height: 1.15;
  color: var(--color-text);
  margin: 24px 0 16px;
  letter-spacing: -0.02em;
  font-weight: 400;
}
.metiers-h1 strong {
  color: var(--color-accent);
  font-weight: 400;
  font-style: italic;
}

.metiers-subtitle {
  font-size: 17px;
  line-height: 1.5;
  color: var(--color-muted);
  max-width: 600px;
  margin: 0 auto;
}

.metiers-search {
  max-width: 560px;
  margin: 0 auto 64px;
  text-align: center;
}
.search-input {
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: 1px solid #2A2A2A;
  color: var(--color-text);
  font-size: 16px;
  letter-spacing: 0.05em;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: var(--color-accent); }
.search-results {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-top: 12px;
}

.secteur-section { margin-bottom: 56px; }
.secteur-heading {
  display: flex;
  align-items: baseline;
  gap: 16px;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 28px;
  font-weight: 400;
  color: var(--color-text);
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(108, 227, 181, 0.15);
}
.secteur-count {
  font-style: normal;
  font-size: 13px;
  letter-spacing: 0.15em;
  color: var(--color-accent);
  text-transform: uppercase;
}

.secteur-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.empty-state {
  text-align: center;
  font-size: 16px;
  color: var(--color-muted);
  padding: 48px 0;
}
</style>
