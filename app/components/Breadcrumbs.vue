<!-- app/components/Breadcrumbs.vue -->
<script setup lang="ts">
defineProps<{
  items: { label: string; to?: string }[]
}>()
</script>

<template>
  <nav class="breadcrumbs font-mono" aria-label="Fil d'Ariane">
    <NuxtLink to="/" class="breadcrumb-link">ACCUEIL</NuxtLink>
    <template v-for="(item, i) in items" :key="i">
      <span class="breadcrumb-sep" aria-hidden="true">/</span>
      <NuxtLink v-if="item.to" :to="item.to" class="breadcrumb-link">{{ item.label.toUpperCase() }}</NuxtLink>
      <span v-else class="breadcrumb-current" aria-current="page">{{ item.label.toUpperCase() }}</span>
    </template>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: var(--color-muted);
  margin-bottom: 2rem;
}
.breadcrumb-link {
  color: var(--color-muted);
  text-decoration: none;
  transition: color 0.15s;
}
.breadcrumb-link:hover { color: var(--color-accent); }
.breadcrumb-sep { color: rgba(0, 255, 65, 0.3); }
.breadcrumb-current {
  color: var(--color-accent);
  max-width: 30ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
