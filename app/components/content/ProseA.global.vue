<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  href?: string
  target?: string
}>()

// Détection des liens vers des fichiers statiques (PDF, archives, médias)
// qui doivent contourner Vue Router pour ne pas tomber sur le 404 SPA.
const isStaticAsset = computed(() => {
  const href = props.href ?? ''
  if (!href) return false
  if (href.startsWith('/downloads/')) return true
  return /\.(pdf|zip|csv|xlsx|docx|pptx|png|jpe?g|gif|svg|mp3|mp4|webm|wav|ogg)(\?.*)?$/i.test(href)
})

const isExternal = computed(() => {
  const href = props.href ?? ''
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
})
</script>

<template>
  <a v-if="isStaticAsset" :href="props.href" :target="props.target" download>
    <slot />
  </a>
  <NuxtLink v-else :href="props.href" :target="props.target" :external="isExternal">
    <slot />
  </NuxtLink>
</template>
