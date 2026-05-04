<!-- app.vue -->
<script setup lang="ts">
const route = useRoute()

const canonicalUrl = computed(() => {
  const base = 'https://survivant-ia.ch'
  const path = route.path === '/' ? '' : route.path.replace(/\/$/, '')
  return `${base}${path}`
})

const orgWebsiteJsonLd = computed(() => JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://survivant-ia.ch/#organization',
      name: 'Survivant-IA',
      url: 'https://survivant-ia.ch',
      logo: 'https://survivant-ia.ch/icon-512.png',
      description: 'Le repère des salariés qui veulent piloter l\'IA dans leur métier. Articles hebdomadaires, diagnostic IA par métier, et formations approfondies (bientôt) pour en sortir gagnants.',
      founder: {
        '@type': 'Person',
        '@id': 'https://survivant-ia.ch/identite#mathieu',
        name: 'Mathieu Rerat',
        alternateName: 'Mathieu le Survivant de l\'IA',
        url: 'https://survivant-ia.ch/identite',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://survivant-ia.ch/#website',
      name: 'Survivant-IA',
      url: 'https://survivant-ia.ch',
      description: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter. Un nouvel article chaque semaine pour les salariés non-tech, un diagnostic IA par métier.',
      inLanguage: 'fr-CH',
      publisher: { '@id': 'https://survivant-ia.ch/#organization' },
    },
  ],
}))

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  meta: [{ property: 'og:url', content: canonicalUrl }],
  script: [{
    type: 'application/ld+json',
    innerHTML: orgWebsiteJsonLd,
    tagPriority: 'high',
  }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
