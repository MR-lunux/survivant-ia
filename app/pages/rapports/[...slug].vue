<!-- app/pages/rapports/[...slug].vue -->
<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.join('/')
  : route.params.slug

const { data: article } = await useAsyncData(`article-${slug}`, () =>
  queryCollection('rapports')
    .path(`/rapports/${slug}`)
    .first()
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Rapport introuvable' })
}

useSeoMeta({
  title: () => `${article.value?.title} | Survivant-IA`,
  description: () => article.value?.description ?? '',
  ogTitle: () => article.value?.title ?? '',
  ogDescription: () => article.value?.description ?? '',
  ogType: 'article',
  articleAuthor: ['Mathieu Rerat'],
  articlePublishedTime: () => article.value?.date ? new Date(article.value.date).toISOString() : undefined,
  articleSection: () => article.value?.category ?? undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => article.value?.title ?? '',
  twitterDescription: () => article.value?.description ?? '',
})

const articleJsonLd = computed(() => JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `https://survivant-ia.ch/rapports/${slug}#article`,
      headline: article.value?.title ?? '',
      description: article.value?.description ?? '',
      datePublished: article.value?.date ? new Date(article.value.date).toISOString() : undefined,
      dateModified: article.value?.date ? new Date(article.value.date).toISOString() : undefined,
      author: {
        '@type': 'Person',
        '@id': 'https://survivant-ia.ch/identite#mathieu',
        name: 'Mathieu Rerat',
        url: 'https://survivant-ia.ch/identite',
      },
      publisher: { '@id': 'https://survivant-ia.ch/#organization' },
      mainEntityOfPage: `https://survivant-ia.ch/rapports/${slug}`,
      inLanguage: 'fr-CH',
      articleSection: article.value?.category ?? undefined,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
        { '@type': 'ListItem', position: 2, name: 'Rapports de Survie', item: 'https://survivant-ia.ch/rapports' },
        { '@type': 'ListItem', position: 3, name: article.value?.title ?? '' },
      ],
    },
  ],
}))

useHead({
  script: [{ type: 'application/ld+json', innerHTML: articleJsonLd }],
})

defineOgImage('Default', {
  title: article.value?.title ?? '',
  kicker: '// RAPPORT DE SURVIE',
})

const formattedDate = computed(() => {
  if (!article.value?.date) return ''
  return new Date(article.value.date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
})

const categoryLabel = computed(() =>
  categoryLabels[article.value?.category ?? ''] ?? article.value?.category ?? ''
)

const { capture } = usePosthogEvent()
const articleRef = ref<HTMLElement | null>(null)

const PROGRESS_THRESHOLDS = [25, 50, 75, 100] as const
const reachedThresholds = new Set<number>()

function onScroll() {
  const el = articleRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const totalHeight = el.scrollHeight - window.innerHeight
  if (totalHeight <= 0) return
  const scrolled = Math.max(0, -rect.top)
  const percent = Math.min(100, Math.round((scrolled / totalHeight) * 100))

  for (const t of PROGRESS_THRESHOLDS) {
    if (percent >= t && !reachedThresholds.has(t)) {
      reachedThresholds.add(t)
      capture('report_read_progress', {
        slug,
        category: article.value?.category ?? null,
        depth: t,
      })
    }
  }
}

function onArticleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const anchor = target?.closest('a') as HTMLAnchorElement | null
  if (!anchor || !anchor.href) return

  const url = new URL(anchor.href, window.location.origin)
  const isInternal = url.origin === window.location.origin

  if (isInternal) {
    capture('article_internal_link_clicked', {
      from_slug: slug,
      to_url:    url.pathname + url.search + url.hash,
      link_text: (anchor.textContent ?? '').trim().slice(0, 120),
    })
  } else {
    capture('article_source_clicked', {
      from_slug:       slug,
      external_domain: url.hostname,
    })
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  // First check in case article already fits in viewport
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <Breadcrumbs
      :items="[
        { label: 'Rapports', to: '/rapports' },
        { label: article?.title ?? '' },
      ]"
    />

    <article ref="articleRef" class="article-wrapper" v-if="article">
      <header class="article-header">
        <div class="article-meta">
          <span class="article-category font-mono">
            {{ categoryLabel }}
          </span>
          <span class="article-date font-mono">{{ formattedDate }}</span>
        </div>
        <h1 class="article-title">{{ article.title }}</h1>
        <p class="article-description">{{ article.description }}</p>
      </header>

      <ScannerBorder class="article-body">
        <div @click="onArticleClick">
          <ContentRenderer :value="article" class="prose" />
        </div>
      </ScannerBorder>

      <div class="article-footer">
        <div class="article-cta">
          <p class="font-mono" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 1.5rem;">
            // SI CE RAPPORT VOUS A ÉTÉ UTILE, REJOIGNEZ LA FRÉQUENCE
          </p>
          <NewsletterForm />
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.article-wrapper { max-width: 780px; }
.article-header { margin-bottom: 3rem; }
.article-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}
.article-category {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  border: 1px solid rgba(0, 255, 65, 0.3);
  padding: 0.25rem 0.6rem;
}
.article-date {
  font-size: 0.7rem;
  color: var(--color-muted);
}
.article-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  margin: 0 0 1rem;
  line-height: 1.15;
}
.article-description {
  font-size: 1.05rem;
  color: var(--color-muted);
  line-height: 1.7;
  margin: 0;
}
.article-body { padding: 2.5rem; background: var(--color-surface); margin-bottom: 4rem; }
.article-footer { border-top: 1px solid rgba(0, 255, 65, 0.1); padding-top: 3rem; }
@media (max-width: 640px) {
  .article-body { padding: 1.25rem; }
  .article-meta { flex-wrap: wrap; gap: 0.5rem; }
}
</style>
