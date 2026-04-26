<!-- app/components/StatsStrip.vue -->
<template>
  <section class="stats-strip">
    <div class="container">
      <div class="stats-grid">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          ref="statEls"
          class="stat-item"
          data-reveal
          :data-reveal-delay="i * 120"
        >
          <span class="stat-number font-mono">{{ stat.displayed }}{{ stat.suffix }}</span>
          <span class="stat-label font-mono">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const statEls = ref<HTMLElement[]>([])

const stats = reactive([
  { target: 1,   suffix: '',  label: 'rapport / semaine',   displayed: 0 },
  { target: 100, suffix: '%', label: 'sans jargon',          displayed: 0 },
  { target: 0,   suffix: '+', label: 'survivants inscrits',  displayed: 0 },
])

function animateCounter(stat: typeof stats[0]) {
  if (stat.target === 0) return
  const duration = 1200, t0 = performance.now()
  const step = (ts: number) => {
    const p = Math.min((ts - t0) / duration, 1)
    stat.displayed = Math.floor((1 - Math.pow(1-p, 3)) * stat.target)
    if (p < 1) requestAnimationFrame(step); else stat.displayed = stat.target
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      const idx = statEls.value.indexOf(e.target as HTMLElement)
      if (idx !== -1) animateCounter(stats[idx])
      obs.unobserve(e.target)
    })
  }, { threshold: 0.2 })
  statEls.value.forEach(el => obs.observe(el))
})
</script>

<style scoped>
.stats-strip {
  padding: 3rem 0;
  border-top: 1px solid rgba(0,255,65,0.08);
  border-bottom: 1px solid rgba(0,255,65,0.08);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem; text-align: center;
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.stat-number {
  font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 700;
  color: var(--color-accent); line-height: 1;
}
.stat-label { font-size: 0.65rem; letter-spacing: 0.12em; color: var(--color-muted); text-transform: uppercase; }
@media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; gap: 1.5rem; } }
</style>
