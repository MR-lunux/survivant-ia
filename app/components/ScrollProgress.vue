<!-- app/components/ScrollProgress.vue -->
<template>
  <div class="scroll-progress" :style="{ width: pct + '%' }" aria-hidden="true" />
</template>

<script setup lang="ts">
const pct = ref(0)
function update() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  pct.value = max > 0 ? (window.scrollY / max) * 100 : 0
}
onMounted(() => window.addEventListener('scroll', update, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', update))
</script>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0; left: 0; z-index: 200;
  height: 2px;
  background: linear-gradient(to right, var(--color-accent), rgba(0, 255, 65, 0.3));
  box-shadow: 0 0 8px rgba(0, 255, 65, 0.4);
  transition: width 0.06s linear;
  pointer-events: none;
}
</style>
