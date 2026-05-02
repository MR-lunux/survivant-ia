<!-- app/pages/rapports/index.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Rapports de Survie - Compétences à développer face à l\'IA | Survivant-IA',
  description: 'Tous les rapports anti-obsolescence : soft skills, comprendre l\'IA, cas pratiques. La veille hebdo pour prendre le virage de l\'IA, pas pour le subir.',
  ogTitle: 'Rapports de Survie - Survivant-IA',
  ogDescription: 'Soft skills, compréhension de l\'IA, cas pratiques. Anti-obsolescence pour les pros.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Rapports de Survie - Survivant-IA',
  twitterDescription: 'La veille hebdo pour prendre le virage de l\'IA, pas pour le subir.',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': 'https://survivant-ia.ch/rapports#page',
          name: 'Rapports de Survie',
          description: 'Tous les rapports anti-obsolescence : soft skills, comprendre l\'IA, cas pratiques.',
          inLanguage: 'fr-CH',
          isPartOf: { '@id': 'https://survivant-ia.ch/#website' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
            { '@type': 'ListItem', position: 2, name: 'Rapports de Survie' },
          ],
        },
      ],
    }),
  }],
})

defineOgImage('Default', {
  title: 'Rapports de Survie',
  kicker: '// COMPÉTENCES ANTI-OBSOLESCENCE',
})

const activeCategory = ref<string | null>(null)

const { data: articles } = await useAsyncData('all-articles', () =>
  queryCollection('rapports')
    .order('date', 'DESC')
    .all()
)

const filteredArticles = computed(() => {
  if (!activeCategory.value) return articles.value ?? []
  return (articles.value ?? []).filter(a => a.category === activeCategory.value)
})

const categories = [
  { key: null,            label: 'TOUS' },
  { key: 'soft-skills',   label: 'SOFT SKILLS' },
  { key: 'comprendre-ia', label: "COMPRENDRE L'IA" },
  { key: 'cas-pratiques', label: 'CAS PRATIQUES' },
]

const { capture } = usePosthogEvent()

function onCardClick(slug: string, position: number) {
  const found = filteredArticles.value.find(a => a.path?.endsWith(slug))
  capture('report_card_clicked', {
    slug,
    category: found?.category ?? null,
    position,
  })
}
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <Breadcrumbs :items="[{ label: 'Rapports de Survie' }]" />
    <div class="page-header">
      <KickerLabel>RAPPORTS DE SURVIE</KickerLabel>
      <h1>Tous les Rapports</h1>
      <p style="color: var(--color-muted); max-width: 55ch;">
        Soft skills, compréhension de l'IA, cas pratiques concrets. Des outils pour survivre, pas de la théorie.
      </p>
    </div>

    <div class="filters">
      <button
        v-for="cat in categories"
        :key="cat.key ?? 'all'"
        class="filter-btn font-mono"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <div class="articles-grid">
      <ArticleCard
        v-for="(article, index) in filteredArticles"
        :key="article.path"
        :article="article"
        @card-click="onCardClick($event, index + 1)"
      />
    </div>

    <p v-if="filteredArticles.length === 0" class="font-mono" style="color: var(--color-muted); text-align: center; padding: 4rem 0;">
      AUCUN RAPPORT DANS CETTE ZONE POUR L'INSTANT.
    </p>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 3rem; }
.page-header h1 { margin: 0.5rem 0 1rem; }
.filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}
.filter-btn {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  padding: 0.4rem 0.9rem;
  background: transparent;
  border: 1px solid rgba(0, 255, 65, 0.2);
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover,
.filter-btn.active {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>
