<!-- app/pages/outils/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

const { data: kit } = await useAsyncData(`kit-${slug}`, () =>
  queryCollection('outils')
    .path(`/outils/${slug}`)
    .first()
)

if (!kit.value) {
  throw createError({ statusCode: 404, statusMessage: 'Kit introuvable' })
}

const { data: parentArticle } = await useAsyncData(`parent-of-${slug}`, async () => {
  if (!kit.value?.parentArticleSlug) return null
  return await queryCollection('rapports')
    .path(`/rapports/${kit.value.parentArticleSlug}`)
    .first()
})

useSeoMeta({
  title: () => kit.value ? `${kit.value.title} (${kit.value.code}) | Survivant-IA` : 'Kit | Survivant-IA',
  description: () => kit.value?.description ?? '',
  ogTitle: () => kit.value ? `${kit.value.title} (${kit.value.code})` : '',
  ogDescription: () => kit.value?.description ?? '',
  twitterCard: 'summary_large_image',
  twitterTitle: () => kit.value?.title ?? '',
  twitterDescription: () => kit.value?.description ?? '',
})

const kitJsonLd = computed(() => {
  if (!kit.value) return ''
  const baseUrl = `https://survivant-ia.ch/outils/${slug}`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebApplication',
      '@id': `${baseUrl}#app`,
      name: `${kit.value.title} (${kit.value.code})`,
      url: baseUrl,
      description: kit.value.description,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'fr-CH',
      isPartOf: { '@id': 'https://survivant-ia.ch/#website' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
        { '@type': 'ListItem', position: 2, name: 'Boîte à Outils', item: 'https://survivant-ia.ch/outils' },
        { '@type': 'ListItem', position: 3, name: kit.value.code },
      ],
    },
  ]

  // Quiz schema (only for kind: quiz)
  if (kit.value.kind === 'quiz' && kit.value.data?.questions) {
    graph.push({
      '@type': 'Quiz',
      '@id': `${baseUrl}#quiz`,
      name: kit.value.title,
      about: kit.value.subtitle,
      educationalLevel: 'Beginner',
      learningResourceType: 'Self-assessment',
      hasPart: kit.value.data.questions.map((q: { id: number; prompt: string; choices: { text: string }[] }) => ({
        '@type': 'Question',
        name: q.prompt,
        suggestedAnswer: q.choices.map((c) => ({ '@type': 'Answer', text: c.text })),
      })),
    })
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
})

useHead({
  script: [{ type: 'application/ld+json', innerHTML: kitJsonLd }],
})

defineOgImage('Default', {
  title: () => kit.value?.title ?? '',
  kicker: () => `// ${kit.value?.kicker ?? ''}`,
})

const { capture } = usePosthogEvent()
const router = useRouter()

onMounted(() => {
  if (!kit.value) return

  const fromQuery = route.query.from
  let from: 'direct' | 'article' | 'list' = 'direct'
  if (fromQuery === 'article' || fromQuery === 'list') from = fromQuery

  capture('kit_viewed', {
    id: kit.value.code,
    kind: kit.value.kind,
    from,
  })

  // Clean the query param from the URL silently (no navigation, no scroll)
  if (fromQuery) {
    router.replace({ path: route.path, query: {} })
  }
})
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <Breadcrumbs
      :items="[
        { label: 'Boîte à Outils', to: '/outils' },
        { label: kit?.code ?? '' },
      ]"
    />

    <article class="kit-page" v-if="kit">
      <header class="kit-header">
        <KickerLabel>{{ kit.kicker }}</KickerLabel>
        <h1 class="kit-title">{{ kit.title }}</h1>
        <div class="kit-specs">
          <template v-for="(s, i) in kit.specs ?? []" :key="i">
            <span class="spec">{{ s }}</span>
            <span v-if="i < (kit.specs.length - 1)" class="dot" aria-hidden="true">·</span>
          </template>
        </div>
      </header>

      <NuxtLink
        v-if="parentArticle"
        :to="parentArticle.path"
        class="parent-card"
      >
        <div class="parent-info">
          <div class="parent-label">▶ À LIRE D'ABORD</div>
          <div class="parent-title">{{ parentArticle.title }}</div>
        </div>
        <div class="parent-arrow" aria-hidden="true">→</div>
      </NuxtLink>

      <div class="kit-body prose">
        <MDC v-if="kit.intro" :value="kit.intro" tag="div" />

        <KitQuiz
          v-if="kit.kind === 'quiz' && kit.data"
          :kit-id="kit.code"
          :data="kit.data"
        />

        <MDC v-if="kit.outro" :value="kit.outro" tag="div" />
      </div>

      <footer class="kit-footer">
        <NuxtLink
          v-if="parentArticle"
          :to="parentArticle.path"
          class="return-card"
        >
          <KickerLabel class="return-label">POUR EN SAVOIR PLUS</KickerLabel>
          <div class="return-title">{{ parentArticle.title }}</div>
          <p class="return-teaser">{{ parentArticle.description }}</p>
          <span class="return-link">▶ LIRE L'ARTICLE COMPLET</span>
        </NuxtLink>

        <NewsletterForm context="kit-detail" :kit-id="kit?.code ?? ''" />
      </footer>
    </article>
  </div>
</template>

<style scoped>
.kit-page { max-width: 780px; margin: 0 auto; }
.kit-header { margin-bottom: 3rem; }
.kit-title {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.15;
  color: var(--color-text);
  margin: 1.25rem 0 1.5rem;
}
.kit-specs {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
  display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
}
.kit-specs .dot { color: var(--color-dim); }
.kit-body { font-size: 1.02rem; line-height: 1.75; color: var(--color-text-soft); }

.parent-card {
  display: flex; justify-content: space-between; align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.25rem 1.5rem;
  margin-bottom: 3rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease;
}
.parent-card:hover { border-color: var(--color-accent); }
.parent-info { flex: 1; }
.parent-label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 0.4rem;
}
.parent-title { font-size: 0.95rem; color: var(--color-text-soft); }
.parent-arrow { color: var(--color-accent); font-family: var(--font-mono); font-size: 1.1rem; }

.kit-footer {
  margin-top: 5rem;
  border-top: 1px solid var(--color-rule);
  padding-top: 3rem;
}
.return-card {
  display: block;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.5rem 2rem;
  margin-bottom: 3rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease;
}
.return-card:hover { border-color: var(--color-accent); }
.return-label {
  margin-bottom: 0.75rem;
}
.return-title {
  font-family: var(--font-serif); font-style: italic;
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}
.return-teaser { font-size: 0.92rem; color: var(--color-muted); margin: 0 0 0.75rem; }
.return-link {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  color: var(--color-accent);
}
</style>
