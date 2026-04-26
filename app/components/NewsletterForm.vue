<!-- app/components/NewsletterForm.vue -->
<template>
  <div class="newsletter-wrapper">
    <!-- V2 : oscilloscope canvas -->
    <canvas ref="canvasEl" class="osc-canvas" aria-hidden="true" />

    <div class="newsletter-form-wrapper scanline">
      <ScannerBorder class="newsletter-inner">
        <div class="nl-header">
          <span class="nl-status font-mono"><span class="nl-dot">●</span> FRÉQUENCE ACTIVE</span>
          <h3 class="nl-title">Rejoindre la Fréquence</h3>
          <p class="nl-subtitle">
            1 rapport de survie par semaine. Les outils concrets que les algorithmes ne peuvent pas te donner.
          </p>
        </div>

        <iframe
          v-if="props.formUrl"
          :src="props.formUrl"
          class="brevo-iframe"
          scrolling="no"
          title="Formulaire d'inscription newsletter"
        />

        <div v-else class="form-placeholder">
          <input
            type="email"
            placeholder="votre@email.com"
            class="email-input"
            aria-label="Adresse email"
            disabled
          />
          <button class="btn-glitch" data-text="REJOINDRE" disabled>
            REJOINDRE
          </button>
          <p class="setup-note font-mono">
            → Configurer Brevo : remplacer formUrl dans ce composant
          </p>
        </div>
      </ScannerBorder>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ formUrl?: string }>(), { formUrl: '' })

const canvasEl = ref<HTMLCanvasElement | null>(null)
let raf: number | null = null

const WAVES = [
  { amp: 0.08, freq: 0.012, speed: 0.6,  alpha: 0.18, width: 1.5 },
  { amp: 0.12, freq: 0.008, speed: 0.4,  alpha: 0.10, width: 1.0 },
  { amp: 0.05, freq: 0.022, speed: 0.9,  alpha: 0.08, width: 0.8 },
]

function resize() {
  if (!canvasEl.value) return
  canvasEl.value.width  = canvasEl.value.offsetWidth
  canvasEl.value.height = canvasEl.value.offsetHeight
}

function draw(t: number, ctx: CanvasRenderingContext2D) {
  const W = ctx.canvas.width, H = ctx.canvas.height
  ctx.clearRect(0, 0, W, H)

  WAVES.forEach(w => {
    ctx.beginPath()
    ctx.strokeStyle = `rgba(0,255,65,${w.alpha})`
    ctx.lineWidth   = w.width
    for (let x = 0; x <= W; x += 2) {
      const y = H / 2
        + Math.sin(x * w.freq + t * w.speed) * H * w.amp
        + Math.sin(x * w.freq * 2.3 + t * w.speed * 1.7) * H * w.amp * 0.4
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  })

  ctx.beginPath()
  ctx.strokeStyle = 'rgba(0,255,65,0.04)'
  ctx.lineWidth = 1
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2)
  ctx.stroke()
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!canvasEl.value) return

  const ctx = canvasEl.value.getContext('2d')
  if (!ctx) return

  resize()
  window.addEventListener('resize', resize, { passive: true })

  let t = 0
  const loop = () => {
    draw(t, ctx)
    t += 0.04
    raf = requestAnimationFrame(loop)
  }

  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) loop() }
    else if (raf) { cancelAnimationFrame(raf); raf = null }
  })
  obs.observe(canvasEl.value.closest('.newsletter-wrapper') ?? canvasEl.value)

  loop()
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.newsletter-wrapper {
  position: relative;
  overflow: hidden;
}

.osc-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
}

.newsletter-form-wrapper {
  position: relative; z-index: 1;
  padding: 2rem; background: transparent;
}
.newsletter-inner { padding: 2rem; background: var(--color-surface); }

.nl-dot { animation: nlBlink 1.2s step-end infinite; }
@keyframes nlBlink { 50% { opacity: 0; } }

.nl-status {
  font-size: 0.65rem; letter-spacing: 0.15em;
  color: var(--color-accent); display: block; margin-bottom: 1rem;
}
.nl-title {
  font-family: var(--font-mono);
  font-size: 1.4rem; color: var(--color-text); margin: 0 0 0.75rem;
}
.nl-subtitle { font-size: 0.9rem; color: var(--color-muted); margin: 0 0 1.5rem; }
.brevo-iframe { width: 100%; min-height: 200px; border: none; background: transparent; }
.form-placeholder { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.email-input {
  flex: 1; min-width: 200px;
  background: var(--color-surface-2);
  border: 1px solid rgba(0, 255, 65, 0.2);
  color: var(--color-text);
  font-family: var(--font-mono); font-size: 0.875rem;
  padding: 0.75rem 1rem; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  opacity: 0.5;
}
.email-input:not(:disabled):focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.12), inset 0 0 12px rgba(0, 255, 65, 0.04);
  opacity: 1;
}
.setup-note { width: 100%; font-size: 0.65rem; color: var(--color-danger); margin: 0.5rem 0 0; }
</style>
