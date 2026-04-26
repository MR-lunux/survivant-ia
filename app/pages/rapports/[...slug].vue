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
  title: () => `${article.value?.title} — Survivant de l'IA`,
  description: () => article.value?.description ?? '',
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.description ?? '',
  twitterCard: 'summary',
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

</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <NuxtLink to="/rapports" class="back-link font-mono">← RETOUR AUX RAPPORTS</NuxtLink>

    <article class="article-wrapper" v-if="article">
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
        <ContentRenderer :value="article" class="prose" />
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
.back-link {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  margin-bottom: 3rem;
  text-decoration: none;
  transition: color 0.15s;
}
.back-link:hover { color: var(--color-accent); }
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
</style>
