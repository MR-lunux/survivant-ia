<!-- app/components/MetierArticles.vue -->
<script setup lang="ts">
import type { Job } from '~/data/jobs'

const props = defineProps<{
  job: Job
}>()

const { capture } = usePosthogEvent()

// Query Nuxt Content : articles dont le frontmatter `secteurs` contient le secteur du job.
// secteurs est stocké comme JSON array string en SQLite → LIKE pour chercher la valeur dans l'array.
const { data: articles } = await useAsyncData(
  `metier-articles-${props.job.slug}`,
  () => queryCollection('rapports')
    .where('secteurs', 'LIKE', `%${props.job.secteur}%`)
    .order('date', 'DESC')
    .limit(3)
    .all(),
)

function onArticleClick(articlePath: string) {
  capture('metier_article_clicked', {
    from_slug: props.job.slug,
    article_slug: articlePath,
  })
}
</script>

<template>
  <div v-if="articles && articles.length > 0" class="metier-articles">
    <h3 class="articles-heading font-mono">Articles thématiques</h3>
    <ul class="articles-list">
      <li v-for="article in articles" :key="article.path" class="article-item">
        <NuxtLink
          :to="article.path"
          class="article-link"
          @click="onArticleClick(article.path)"
        >
          <span class="article-title">{{ article.title }}</span>
          <span v-if="article.description" class="article-desc">{{ article.description }}</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.metier-articles { margin-bottom: 32px; }
.articles-heading {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--color-accent);
  text-transform: uppercase;
  margin: 0 0 16px;
  font-weight: 400;
}
.articles-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.article-link {
  display: block;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #2A2A2A;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.15s, background 0.15s;
}
.article-link:hover {
  border-color: var(--color-accent);
  background: rgba(108, 227, 181, 0.03);
}
.article-title {
  display: block;
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 18px;
  line-height: 1.3;
  margin-bottom: 4px;
  color: var(--color-text);
}
.article-desc {
  display: block;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.5;
}
</style>
