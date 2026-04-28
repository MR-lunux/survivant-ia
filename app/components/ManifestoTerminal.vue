<!-- app/components/ManifestoTerminal.vue -->
<template>
  <div class="manifeste-wrapper">
    <ScannerBorder class="manifeste-inner">
      <div class="v2-header">
        <span ref="labelEl" class="v2-label font-mono">// MANIFESTE</span>
        <span class="v2-blink font-mono">● LIVE</span>
      </div>
      <div ref="linesEl" class="v2-lines" />
      <div ref="footerEl" class="v2-footer font-mono">— FIN DE TRANSMISSION —</div>
    </ScannerBorder>

    <NuxtLink
      to="/identite"
      class="pixel-m-wrap"
      :class="{ animate: animated, 'no-motion': immediate }"
      title="Identité du Survivant"
      aria-label="Profil de Mathieu"
    >
      <div class="pixel-grid">
        <span
          v-for="block in pixelBlocks"
          :key="`${block.r}-${block.c}`"
          class="pixel-block"
          :class="{ lit: block.lit }"
          :style="block.lit ? { animationDelay: `${block.delay}ms` } : {}"
        />
      </div>
      <span class="pixel-m-label font-mono">// PROFIL</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const labelEl  = ref<HTMLElement | null>(null)
const linesEl  = ref<HTMLElement | null>(null)
const footerEl = ref<HTMLElement | null>(null)
const animated = ref(false)
const immediate = ref(false)

const LINES = [
  "Vous voyez l'IA arriver dans votre job. Vous ne savez pas comment vous positionner. Vous n'êtes pas seul.",
  "Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est une carte de survie pratique, une fois par semaine.",
  "Préparez-vous avant que ça arrive.",
]

// 5×7 pixel M grid (1 = lit, 0 = empty)
const M_PIXELS = [
  [1, 0, 0, 0, 1],
  [1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
]

// Tetris fall order: outer columns first, inner last.
// Within each column, bottom row lands first (stacks upward).
const PIXEL_DELAYS: Record<string, number> = {
  '6-0': 300,  '5-0': 420,  '4-0': 540,  '3-0': 660,
  '2-0': 780,  '1-0': 900,  '0-0': 1020,
  '6-4': 500,  '5-4': 620,  '4-4': 740,  '3-4': 860,
  '2-4': 980,  '1-4': 1100, '0-4': 1220,
  '1-1': 1400,
  '1-3': 1600,
  '2-2': 1900,
}

const pixelBlocks = computed(() =>
  M_PIXELS.flatMap((row, r) =>
    row.map((cell, c) => ({
      r, c,
      lit: cell === 1,
      delay: PIXEL_DELAYS[`${r}-${c}`] ?? 0,
    }))
  )
)

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}/'

function scramble(el: HTMLElement, final: string, duration = 600) {
  const len = final.length; let start: number | null = null
  const step = (ts: number) => {
    if (!start) start = ts
    const progress = Math.min((ts - start) / duration, 1)
    const revealed = Math.floor(progress * len)
    let out = ''
    for (let i = 0; i < len; i++) {
      out += ([' ', '/', '.'].includes(final[i]) || i < revealed)
        ? final[i]
        : CHARS[Math.floor(Math.random() * CHARS.length)]
    }
    el.textContent = out
    if (progress < 1) requestAnimationFrame(step); else el.textContent = final
  }
  requestAnimationFrame(step)
}

function typeLines() {
  if (!linesEl.value || !footerEl.value) return
  while (linesEl.value.firstChild) linesEl.value.removeChild(linesEl.value.firstChild)
  footerEl.value.classList.remove('visible')
  let lineIdx = 0
  function nextLine() {
    if (lineIdx >= LINES.length) {
      setTimeout(() => { footerEl.value?.classList.add('visible') }, 300); return
    }
    const text = LINES[lineIdx], isLast = lineIdx === LINES.length - 1
    const row = document.createElement('p'); row.className = 'v2-line'
    const prefix = document.createElement('span'); prefix.className = 'v2-prompt font-mono'; prefix.textContent = '>'
    const textSpan = document.createElement('span')
    const cursor = document.createElement('span'); cursor.className = 'v2-cursor'
    row.appendChild(prefix); row.appendChild(textSpan); row.appendChild(cursor)
    linesEl.value!.appendChild(row)
    let i = 0
    const speed = isLast ? 15 : 9
    function type() {
      if (i < text.length) { textSpan.textContent += text[i++]; setTimeout(type, speed + Math.random() * 7) }
      else {
        cursor.remove()
        if (isLast) {
          textSpan.textContent = ''
          const strong = document.createElement('strong'); strong.className = 'text-accent'; strong.textContent = text
          const blk = document.createElement('span'); blk.className = 'v2-cursor'
          textSpan.appendChild(strong); textSpan.appendChild(blk)
        }
        lineIdx++; setTimeout(nextLine, isLast ? 0 : 180)
      }
    }
    type()
  }
  nextLine()
}

function showReduced() {
  if (!linesEl.value || !footerEl.value) return
  LINES.forEach((text, i) => {
    const p = document.createElement('p'); p.className = 'v2-line'
    if (i === LINES.length - 1) {
      const strong = document.createElement('strong'); strong.className = 'text-accent'; strong.textContent = text; p.appendChild(strong)
    } else { p.textContent = text }
    linesEl.value!.appendChild(p)
  })
  footerEl.value.classList.add('visible')
  animated.value = true
  immediate.value = true
}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { showReduced(); return }

  await nextTick()

  const target = linesEl.value?.closest('.scanner-border-wrapper') ?? linesEl.value
  if (!target) return

  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    obs.disconnect()
    if (labelEl.value) scramble(labelEl.value, '// MANIFESTE')
    animated.value = true
    setTimeout(typeLines, 200)
  }, { threshold: 0.15 })
  obs.observe(target)
})
</script>

<style scoped>
/* ── Wrapper ────────────────────────────────────────────── */
.manifeste-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 2.5rem;
}

/* ── Terminal ───────────────────────────────────────────── */
.manifeste-inner { padding: 2.5rem; background: var(--color-surface); max-width: 700px; }
.v2-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem; padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0,255,65,0.1);
}
.v2-label { font-size: 0.7rem; letter-spacing: 0.1em; color: var(--color-muted); }
.v2-blink { font-size: 0.6rem; color: var(--color-accent); animation: vblink 1.5s infinite; }
@keyframes vblink { 0%,100%{opacity:1} 50%{opacity:0.2} }
.v2-lines { min-height: 8rem; }
:deep(.v2-line) {
  font-size: 0.95rem; color: var(--color-muted);
  line-height: 1.8;
  display: flex; gap: 0.5rem; margin: 0 0 0.75rem;
}
:deep(.v2-line:last-child) { margin-bottom: 0; }
:deep(.v2-prompt) { font-size: 0.65rem; color: var(--color-accent); opacity: 0.7; margin-top: 0.15rem; flex-shrink: 0; }
:deep(.v2-cursor) {
  display: inline-block; width: 8px; height: 1.05em;
  background: var(--color-accent); vertical-align: middle;
  animation: vcursor 0.8s step-end infinite; margin-left: 2px;
}
@keyframes vcursor { 50%{opacity:0} }
.v2-footer {
  margin-top: 1.25rem; padding-top: 0.75rem;
  border-top: 1px solid rgba(0,255,65,0.1);
  font-size: 0.65rem; letter-spacing: 0.1em; color: rgba(0,255,65,0.5);
  opacity: 0; transition: opacity 0.5s ease;
}
.v2-footer.visible { opacity: 1; }

/* ── Pixel M ────────────────────────────────────────────── */
.pixel-m-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 2.5rem;
  text-decoration: none;
  cursor: pointer;
}

.pixel-grid {
  display: grid;
  grid-template-columns: repeat(5, 11px);
  grid-template-rows: repeat(7, 11px);
  gap: 3px;
}

.pixel-block {
  width: 11px;
  height: 11px;
  background: transparent;
}

.pixel-block.lit {
  background: var(--color-accent);
  opacity: 0;
}

@keyframes tetrisFall {
  from { transform: translateY(-90px); opacity: 0; }
  80%  { transform: translateY(3px);   opacity: 1; }
  to   { transform: translateY(0);     opacity: 1; }
}

.pixel-m-wrap.animate .pixel-block.lit {
  animation: tetrisFall 230ms ease-in forwards;
}

.pixel-m-wrap.no-motion .pixel-block.lit {
  opacity: 1;
  animation: none;
}

.pixel-m-wrap:hover .pixel-block.lit {
  filter: drop-shadow(0 0 4px var(--color-accent));
}

.pixel-m-label {
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  color: var(--color-muted);
  opacity: 0;
  transition: opacity 0.6s;
}

.pixel-m-wrap.animate .pixel-m-label {
  opacity: 1;
  transition-delay: 2200ms;
}

.pixel-m-wrap.no-motion .pixel-m-label {
  opacity: 1;
  transition-delay: 0ms;
}

.pixel-m-wrap:hover .pixel-m-label {
  color: var(--color-accent);
}

@media (max-width: 900px) {
  .manifeste-wrapper { flex-direction: column; }
  .pixel-m-wrap { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .pixel-block.lit { animation: none !important; opacity: 1 !important; }
  .pixel-m-label { opacity: 1 !important; transition-delay: 0ms !important; }
}
</style>
