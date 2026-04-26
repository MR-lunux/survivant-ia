<!-- app/components/ScannerBorder.vue -->
<template>
  <div class="scanner-border-wrapper" :class="props.class">
    <span class="corner corner-tl" />
    <span class="corner corner-tr" />
    <span class="corner corner-bl" />
    <span class="corner corner-br" />
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>

<style scoped>
.scanner-border-wrapper {
  position: relative;
}
.corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: var(--color-accent);
  border-style: solid;
  opacity: 0.6;
}
.corner-tl { top: 0; left: 0;     border-width: 2px 0 0 2px; }
.corner-tr { top: 0; right: 0;    border-width: 2px 2px 0 0; }
.corner-bl { bottom: 0; left: 0;  border-width: 0 0 2px 2px; }
.corner-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }
</style>
