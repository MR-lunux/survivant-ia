<!-- app/components/SectionDivider.vue -->
<template>
  <div ref="el" class="section-divider" aria-hidden="true" />
</template>

<script setup lang="ts">
const el = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!el.value) return
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { el.value!.classList.add('revealed'); obs.disconnect() }
  }, { threshold: 0.5 })
  obs.observe(el.value)
})
</script>

<style scoped>
.section-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0,255,65,0.15) 30%, rgba(0,255,65,0.15) 70%, transparent);
  transform: scaleX(0);
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.section-divider.revealed { transform: scaleX(1); }
</style>
