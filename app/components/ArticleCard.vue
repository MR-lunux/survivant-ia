<!-- app/components/ArticleCard.vue -->
<template>
  <NuxtLink :to="`/rapports/${articleSlug}`" class="article-card-link" @click="onClick">
    <ScannerBorder class="article-card">
      <div class="card-meta">
        <span class="card-category" :class="`cat-${article.category}`">
          {{ categoryLabel }}
        </span>
        <span class="card-date font-mono">{{ formattedDate }}</span>
      </div>
      <h3 class="card-title">{{ article.title }}</h3>
      <p class="card-description">{{ article.description }}</p>
      <span class="card-read font-mono">LIRE LE RAPPORT →</span>
    </ScannerBorder>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  article: {
    path?: string
    title: string
    description: string
    date: string
    category: string
  }
}>()

const emit = defineEmits<{ 'card-click': [slug: string] }>()

const articleSlug = computed(() => props.article.path?.split('/').pop() ?? '')

function onClick() {
  emit('card-click', articleSlug.value)
}

const categoryLabel = computed(() => categoryLabels[props.article.category] ?? props.article.category)

const formattedDate = computed(() => {
  const d = new Date(props.article.date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
})
</script>

<style scoped>
.article-card-link { text-decoration: none; display: block; }

.article-card {
  padding: 1.75rem;
  background: var(--color-surface);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background 0.2s;
}

/* scan sweep on hover */
.article-card::after {
  content: '';
  position: absolute;
  top: -60%; left: 0;
  width: 100%; height: 60%;
  background: linear-gradient(to bottom, transparent, rgba(0,255,65,0.04) 50%, transparent);
  pointer-events: none;
  transition: none;
}
.article-card:hover { background: var(--color-surface-2); }
.article-card:hover::after { animation: cardScan 0.8s linear; }
@keyframes cardScan {
  from { top: -60%; }
  to   { top: 100%;  }
}

/* corner glow on hover via deep */
.article-card:hover :deep(.corner) {
  width: 16px !important; height: 16px !important; opacity: 1 !important;
  box-shadow: 0 0 6px rgba(0,255,65,0.5);
}

.card-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.card-category {
  font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.12em;
  padding: 0.25rem 0.6rem; border: 1px solid;
}
.cat-soft-skills    { color: var(--color-accent); border-color: rgba(0,255,65,0.3); }
.cat-comprendre-ia  { color: #64B5F6;             border-color: rgba(100,181,246,0.3); }
.cat-cas-pratiques  { color: #FFD54F;             border-color: rgba(255,213,79,0.3); }
.card-date { font-size: 0.7rem; color: var(--color-muted); }
.card-title {
  font-family: var(--font-mono);
  font-size: 1.1rem; color: var(--color-text);
  margin: 0 0 0.75rem; line-height: 1.3;
}
.card-description { font-size: 0.9rem; color: var(--color-muted); margin: 0 0 1.25rem; line-height: 1.6; }
.card-read { font-size: 0.7rem; letter-spacing: 0.1em; color: var(--color-accent); }
</style>
