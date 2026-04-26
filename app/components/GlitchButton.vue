<!-- app/components/GlitchButton.vue -->
<template>
  <NuxtLink
    v-if="props.to"
    :to="props.to"
    class="btn-glitch"
    :data-text="props.label"
    v-bind="$attrs"
  >{{ props.label }}</NuxtLink>
  <button
    v-else
    class="btn-glitch"
    :data-text="props.label"
    v-bind="$attrs"
  >{{ props.label }}</button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  label: string
  to?: string
}>()
</script>
