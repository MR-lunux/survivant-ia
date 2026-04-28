<!-- app/components/ManifestoTerminal.vue -->
<template>
  <ScannerBorder class="manifeste-inner">
    <div class="v2-header">
      <span ref="labelEl" class="v2-label font-mono">// MANIFESTE</span>
      <div class="v2-header-right">
        <span class="v2-blink font-mono">● LIVE</span>
        <NuxtLink to="/identite" class="v2-monogram" title="Identité du Survivant">M</NuxtLink>
      </div>
    </div>
    <div ref="linesEl" class="v2-lines" />
    <div ref="footerEl" class="v2-footer font-mono">— FIN DE TRANSMISSION —</div>
  </ScannerBorder>
</template>

<script setup lang="ts">
const labelEl  = ref<HTMLElement | null>(null)
const linesEl  = ref<HTMLElement | null>(null)
const footerEl = ref<HTMLElement | null>(null)

const LINES = [
  "Vous voyez l'IA arriver dans votre job. Vous ne savez pas comment vous positionner. Vous n'êtes pas seul.",
  "Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est une carte de survie pratique, une fois par semaine.",
  "Préparez-vous avant que ça arrive.",
]
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
  // clear stale content from a previous mount cycle
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
      if (i < text.length) { textSpan.textContent += text[i++]; setTimeout(type, speed + Math.random()*7) }
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
}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { showReduced(); return }

  // nextTick garantit que les refs Vue et les composants enfants (ScannerBorder)
  // sont tous dans le DOM avant de lancer l'observer
  await nextTick()

  const target = linesEl.value?.closest('.scanner-border-wrapper') ?? linesEl.value
  if (!target) return

  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    obs.disconnect()
    if (labelEl.value) scramble(labelEl.value, '// MANIFESTE')
    setTimeout(typeLines, 200)
  }, { threshold: 0.15 })
  obs.observe(target)
})
</script>

<style scoped>
.manifeste-inner { padding: 2.5rem; background: var(--color-surface); max-width: 700px; }
.v2-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem; padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0,255,65,0.1);
}
.v2-label { font-size: 0.7rem; letter-spacing: 0.1em; color: var(--color-muted); }
.v2-blink { font-size: 0.6rem; color: var(--color-accent); animation: vblink 1.5s infinite; }
.v2-header-right { display: flex; align-items: center; gap: 0.75rem; }
.v2-monogram {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px;
  border: 1px solid rgba(0, 255, 65, 0.4);
  background: var(--color-bg);
  font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700;
  color: var(--color-accent);
  text-decoration: none;
  image-rendering: pixelated;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.v2-monogram:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 8px rgba(0, 255, 65, 0.35);
}
@keyframes vblink { 0%,100%{opacity:1} 50%{opacity:0.2} }
.v2-lines { min-height: 8rem; }
:deep(.v2-line) {
  font-size: 0.95rem; color: var(--color-muted);
  line-height: 1.8; margin-bottom: 0.75rem;
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
</style>
