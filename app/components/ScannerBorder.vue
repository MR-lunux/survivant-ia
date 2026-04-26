<!-- app/components/ScannerBorder.vue -->
<template>
  <div ref="wrapperEl" class="scanner-border-wrapper" :class="props.class">
    <span class="corner corner-tl" />
    <span class="corner corner-tr" />
    <span class="corner corner-bl" />
    <span class="corner corner-br" />
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ class?: string }>()
const wrapperEl = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!wrapperEl.value) return
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { wrapperEl.value!.classList.add('corners-revealed'); obs.disconnect() }
  }, { threshold: 0.1 })
  obs.observe(wrapperEl.value)
})
</script>

<style scoped>
.scanner-border-wrapper { position: relative; }
.corner {
  position: absolute;
  width: 0; height: 0;
  border-color: var(--color-accent);
  border-style: solid;
  opacity: 0;
  transition: width 0.4s ease, height 0.4s ease, opacity 0.2s ease;
}
.corners-revealed .corner { width: 14px; height: 14px; opacity: 0.6; }
.corner-tl { top:0; left:0;     border-width:2px 0 0 2px; transition-delay:0s,   0s,   0s;    }
.corner-tr { top:0; right:0;    border-width:2px 2px 0 0; transition-delay:0.1s, 0.1s, 0.1s; }
.corner-bl { bottom:0; left:0;  border-width:0 0 2px 2px; transition-delay:0.2s, 0.2s, 0.2s; }
.corner-br { bottom:0; right:0; border-width:0 2px 2px 0; transition-delay:0.3s, 0.3s, 0.3s; }
</style>
