<!-- app/components/AuthorByline.vue -->
<script setup lang="ts">
const props = defineProps<{
  dateModified?: string  // ISO date string
}>()

const formattedDate = computed(() => {
  if (!props.dateModified) return ''
  return new Date(props.dateModified).toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <div class="author-byline font-mono">
    <span class="author-prefix">Par</span>
    <NuxtLink to="/identite" class="author-name">Mathieu Rerat</NuxtLink>
    <span class="author-sep">·</span>
    <span class="author-role">Deputy Head of IT</span>
    <span v-if="formattedDate" class="author-sep">·</span>
    <span v-if="formattedDate" class="author-date">Mis à jour le {{ formattedDate }}</span>
  </div>
</template>

<style scoped>
.author-byline {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  text-transform: uppercase;
  padding: 16px 0;
}
.author-name {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s;
}
.author-name:hover { color: var(--color-accent); }
.author-sep { color: #2A2A2A; }
.author-role,
.author-date,
.author-prefix { color: var(--color-muted); }
</style>
