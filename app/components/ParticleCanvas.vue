<!-- app/components/ParticleCanvas.vue -->
<template>
  <canvas ref="canvasEl" class="particle-canvas" aria-hidden="true" />
</template>

<script setup lang="ts">
const canvasEl = ref<HTMLCanvasElement | null>(null)

// ── Tunables (à ajuster sur le rendu réel) ────────
const ACCENT             = '0,255,65'
const COUNT_DESKTOP      = 45
const COUNT_MOBILE       = 25
const MOBILE_BREAK       = 768
const MAX_DIST_DESKTOP   = 130
const MAX_DIST_MOBILE    = 90
const SPEED_MIN          = 0.12
const SPEED_MAX          = 0.45
const RADIUS_MIN         = 1.2
const RADIUS_MAX         = 2.8
const ALPHA_MIN          = 0.12
const ALPHA_MAX          = 0.5
const PULSE_SPEED        = 0.012
const GLOW_FACTOR        = 3
const LINK_OPACITY       = 0.12
const VIGNETTE_ALPHA     = 0.85

interface Particle { x: number; y: number; vx: number; vy: number; r: number; alpha: number; phase: number }

let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0, dpr = 1
let particles: Particle[] = []
let raf: number | null = null
let count   = COUNT_DESKTOP
let maxDist = MAX_DIST_DESKTOP

const rand = (a: number, b: number) => Math.random() * (b - a) + a
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAK

function applyMobileTuning() {
  count   = isMobile() ? COUNT_MOBILE : COUNT_DESKTOP
  maxDist = isMobile() ? MAX_DIST_MOBILE : MAX_DIST_DESKTOP
}

function createParticle(): Particle {
  const angle = rand(0, Math.PI * 2)
  const speed = rand(SPEED_MIN, SPEED_MAX)
  return {
    x: rand(0, W), y: rand(0, H),
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    r: rand(RADIUS_MIN, RADIUS_MAX),
    alpha: rand(ALPHA_MIN, ALPHA_MAX),
    phase: rand(0, Math.PI * 2),
  }
}

function resize() {
  if (!canvasEl.value) return
  const c = canvasEl.value
  dpr = window.devicePixelRatio || 1
  W = window.innerWidth
  H = window.innerHeight
  c.width        = W * dpr
  c.height       = H * dpr
  c.style.width  = W + 'px'
  c.style.height = H + 'px'
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  for (const p of particles) {
    if (p.x > W) p.x = W
    if (p.y > H) p.y = H
  }
}

function loop() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.52)
  grd.addColorStop(0,   'rgba(0,0,0,0)')
  grd.addColorStop(0.6, 'rgba(0,0,0,0)')
  grd.addColorStop(1,   `rgba(13,13,13,${VIGNETTE_ALPHA})`)

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy; p.phase += PULSE_SPEED
    if (p.x < -10) p.x = W + 10
    if (p.x > W + 10) p.x = -10
    if (p.y < -10) p.y = H + 10
    if (p.y > H + 10) p.y = -10
    const a = p.alpha * (0.7 + 0.3 * Math.sin(p.phase))
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j]
      const dx = p.x - q.x, dy = p.y - q.y
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d < maxDist) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${ACCENT},${(1 - d / maxDist) * LINK_OPACITY})`
        ctx.lineWidth = 0.6
        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke()
      }
    }
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle   = `rgba(${ACCENT},${a})`
    ctx.shadowColor = `rgba(${ACCENT},${a * 0.8})`
    ctx.shadowBlur  = p.r * GLOW_FACTOR
    ctx.fill()
    ctx.shadowBlur = 0
  }
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)
  raf = requestAnimationFrame(loop)
}

const handleResize = () => {
  applyMobileTuning()
  resize()
  if (particles.length !== count) {
    particles = Array.from({ length: count }, createParticle)
  }
}

const handleVisibility = () => {
  if (document.visibilityState === 'hidden') {
    if (raf) { cancelAnimationFrame(raf); raf = null }
  } else if (!raf && ctx) {
    loop()
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!canvasEl.value) return
  ctx = canvasEl.value.getContext('2d')
  applyMobileTuning()
  resize()
  particles = Array.from({ length: count }, createParticle)
  loop()
  window.addEventListener('resize', handleResize, { passive: true })
  document.addEventListener('visibilitychange', handleVisibility)
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
