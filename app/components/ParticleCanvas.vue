<!-- app/components/ParticleCanvas.vue -->
<template>
  <canvas ref="canvasEl" class="particle-canvas" aria-hidden="true" />
</template>

<script setup lang="ts">
const canvasEl = ref<HTMLCanvasElement | null>(null)

const ACCENT      = '0,255,65'
const COUNT       = 55
const MAX_DIST    = 130
const SPEED_MIN   = 0.12
const SPEED_MAX   = 0.45
const RADIUS_MIN  = 1.2
const RADIUS_MAX  = 2.8
const PULSE_SPEED = 0.012

interface Particle { x:number;y:number;vx:number;vy:number;r:number;alpha:number;phase:number }

let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0
let particles: Particle[] = []
let raf: number | null = null

const rand = (a: number, b: number) => Math.random() * (b - a) + a

function createParticle(): Particle {
  const angle = rand(0, Math.PI * 2), speed = rand(SPEED_MIN, SPEED_MAX)
  return { x: rand(0, W), y: rand(0, H), vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, r: rand(RADIUS_MIN, RADIUS_MAX), alpha: rand(0.2, 0.7), phase: rand(0, Math.PI*2) }
}

function resize() {
  if (!canvasEl.value?.parentElement) return
  W = canvasEl.value.width  = canvasEl.value.parentElement.offsetWidth
  H = canvasEl.value.height = canvasEl.value.parentElement.offsetHeight
}

function loop() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.52)
  grd.addColorStop(0, 'rgba(0,0,0,0)')
  grd.addColorStop(0.6, 'rgba(0,0,0,0)')
  grd.addColorStop(1, 'rgba(13,13,13,1)')

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy; p.phase += PULSE_SPEED
    if (p.x < -10) p.x = W+10; if (p.x > W+10) p.x = -10
    if (p.y < -10) p.y = H+10; if (p.y > H+10) p.y = -10
    const a = p.alpha * (0.7 + 0.3*Math.sin(p.phase))
    for (let j = i+1; j < particles.length; j++) {
      const q = particles[j], dx = p.x-q.x, dy = p.y-q.y, d = Math.sqrt(dx*dx+dy*dy)
      if (d < MAX_DIST) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${ACCENT},${(1-d/MAX_DIST)*0.18})`
        ctx.lineWidth = 0.6
        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke()
      }
    }
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
    ctx.fillStyle = `rgba(${ACCENT},${a})`
    ctx.shadowColor = `rgba(${ACCENT},${a*0.8})`
    ctx.shadowBlur = p.r * 4
    ctx.fill(); ctx.shadowBlur = 0
  }
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H)
  raf = requestAnimationFrame(loop)
}

const handleResize = () => { resize(); particles = Array.from({ length: COUNT }, createParticle) }

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!canvasEl.value) return
  ctx = canvasEl.value.getContext('2d')
  resize()
  particles = Array.from({ length: COUNT }, createParticle)
  loop()
  window.addEventListener('resize', handleResize, { passive: true })
  const section = canvasEl.value.closest('section')
  if (section) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) loop() }
      else if (raf) { cancelAnimationFrame(raf); raf = null }
    }).observe(section)
  }
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.particle-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
}
</style>
