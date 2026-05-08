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

      <div class="kit-body prose">
        <ContentRenderer :value="kit" />
      </div>
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
</style>
