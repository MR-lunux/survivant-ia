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

        <NewsletterForm />
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
