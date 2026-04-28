<!-- app/pages/index.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Mathieu le Survivant de l\'IA — Préparez-vous avant que ça arrive',
  description: 'Soft skills, comprendre l\'IA, cas pratiques. 1 rapport de survie par semaine pour ne pas se faire remplacer.',
  ogTitle: 'Mathieu le Survivant de l\'IA',
  ogDescription: 'Soft skills, comprendre l\'IA, cas pratiques. 1 rapport de survie par semaine.',
  twitterCard: 'summary_large_image',
})

const { data: articles } = await useAsyncData('home-articles', () =>
  queryCollection('rapports')
    .order('date', 'DESC')
    .limit(3)
    .all()
)

const heroGrid   = ref<HTMLElement | null>(null)
const statusText = ref<HTMLElement | null>(null)

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}/'

function scramble(el: HTMLElement, final: string, duration = 700) {
  const len = final.length
  let start: number | null = null
  const step = (ts: number) => {
    if (!start) start = ts
    const p = Math.min((ts - start) / duration, 1)
    const revealed = Math.floor(p * len)
    let out = ''
    for (let i = 0; i < len; i++) {
      out += ([' ', '.', '\''].includes(final[i]) || i < revealed)
        ? final[i]
        : CHARS[Math.floor(Math.random() * CHARS.length)]
    }
    el.textContent = out
    if (p < 1) requestAnimationFrame(step)
    else el.textContent = final
  }
  requestAnimationFrame(step)
}

function onScroll() {
  if (heroGrid.value) {
    heroGrid.value.style.transform = `translateY(${window.scrollY * 0.25}px)`
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  window.addEventListener('scroll', onScroll, { passive: true })

  setTimeout(() => {
    if (statusText.value) scramble(statusText.value, 'TRANSMISSION EN COURS')
  }, 250)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div>
    <!-- ── HERO ───────────────────────────────── -->
    <section class="hero">
      <div ref="heroGrid" class="hero-grid-bg" aria-hidden="true" />
      <ClientOnly><ParticleCanvas /></ClientOnly>

      <div class="container hero-inner">
        <div class="hero-status">
          <span class="status-dot" aria-hidden="true" />
          <span ref="statusText" class="font-mono">TRANSMISSION EN COURS</span>
        </div>

        <h1 class="hero-title">
          <span class="title-line">
            <span class="title-line-inner">L'IA ARRIVE.</span>
          </span>
          <span class="title-line">
            <span class="title-line-inner">
              <span class="text-accent accent-glitch">NE SOYEZ PAS<br>UNE VARIABLE SUPPRIMÉE.</span>
              <span class="typing-cursor" aria-hidden="true" />
            </span>
          </span>
        </h1>

        <p class="hero-subtitle">
          Développez les compétences que les algorithmes ne pourront jamais copier.
          Soft skills, compréhension de l'IA, cas pratiques concrets — sans jargon.
        </p>

        <div class="hero-cta">
          <GlitchButton label="Rejoindre la Fréquence" to="#newsletter" />
        </div>
      </div>
    </section>

    <SectionDivider />

    <!-- ── MANIFESTE ──────────────────────────── -->
    <section class="manifeste">
      <div class="container">
        <ManifestoTerminal />
      </div>
    </section>

    <SectionDivider />

    <!-- ── SCANNER TEASER ─────────────────────────── -->
    <section class="scanner-teaser-section">
      <div class="container">
        <ScannerBorder class="scanner-teaser">
          <span class="font-mono scanner-teaser-label">// DIAGNOSTIC IA</span>
          <p class="scanner-teaser-text">
            Scanne ton métier — découvre ton score d'obsolescence en 10 secondes.
          </p>
          <GlitchButton label="Lancer le scan" to="/scanner" />
        </ScannerBorder>
      </div>
    </section>

    <SectionDivider />
    <StatsStrip />
    <SectionDivider />

    <!-- ── DERNIERS RAPPORTS ──────────────────── -->
    <section class="rapports-section">
      <div class="container">
        <div class="section-header" data-reveal>
          <h2>Rapports de Survie</h2>
          <NuxtLink to="/rapports" class="font-mono" style="font-size: 0.75rem; letter-spacing: 0.1em;">TOUS LES RAPPORTS →</NuxtLink>
        </div>

        <div class="articles-grid">
          <ArticleCard
            v-for="(article, i) in articles"
            :key="article.path"
            :article="article"
            data-reveal
            :data-reveal-delay="i * 120"
          />
        </div>
        <p
          v-if="articles && articles.length < 3"
          class="font-mono rapports-coming"
        >
          // D'AUTRES RAPPORTS EN COURS DE CHIFFREMENT...
        </p>
      </div>
    </section>

    <SectionDivider />

    <!-- ── NEWSLETTER ─────────────────────────── -->
    <section id="newsletter" class="newsletter-section">
      <NewsletterForm data-reveal />
    </section>
  </div>
</template>

<style scoped>
/* ── Hero ─────────────────────────────────────────────── */
.hero {
  position: relative;
  padding: 7rem 0 6rem;
  overflow: hidden;
}
.hero-grid-bg {
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(rgba(0, 255, 65, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  will-change: transform;
}
.hero-inner { max-width: 800px; position: relative; z-index: 1; }

/* status row — fade up on load */
.hero-status {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.65rem; letter-spacing: 0.15em;
  color: var(--color-muted); margin-bottom: 2rem;
  opacity: 0;
  animation: heroFadeUp 0.5s 0.3s ease both;
}
.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--color-accent);
  animation: pulse 2s infinite;
  flex-shrink: 0;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }

/* title — line-by-line clip reveal */
.hero-title {
  font-size: clamp(2.2rem, 6vw, 4rem);
  line-height: 1.1; margin: 0 0 1.5rem;
}
.title-line { display: block; overflow: hidden; }
.title-line-inner {
  display: block;
  transform: translateY(110%);
  animation: lineReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.title-line:nth-child(1) .title-line-inner { animation-delay: 0.5s; }
.title-line:nth-child(2) .title-line-inner { animation-delay: 0.75s; }
@keyframes lineReveal { to { transform: translateY(0); } }

/* accent glitch loop */
.accent-glitch {
  display: inline;
  animation: accentGlitch 7s 1.8s infinite;
}
@keyframes accentGlitch {
  0%,95%,100% { text-shadow: none; transform: none; color: var(--color-accent); }
  95.5% {
    text-shadow: 2px 0 var(--color-danger), -2px 0 #00bfff;
    transform: translateX(2px); color: #fff;
  }
  96% {
    text-shadow: -2px 0 var(--color-danger), 2px 0 #00bfff;
    transform: translateX(-2px);
  }
  96.5% { text-shadow: none; transform: none; color: var(--color-accent); }
}

/* typing cursor */
.typing-cursor {
  display: inline-block;
  width: 3px; height: 0.85em;
  background: var(--color-accent);
  vertical-align: bottom; margin-left: 4px;
  opacity: 0;
  animation: cursorBlink 1s step-end 1.8s infinite;
}
@keyframes cursorBlink { 0%{opacity:1} 50%{opacity:0} 100%{opacity:1} }

.hero-subtitle {
  font-size: 1.1rem; color: var(--color-muted);
  max-width: 55ch; margin: 0 0 2.5rem; line-height: 1.7;
  opacity: 0;
  animation: heroFadeUp 0.6s 1.1s ease both;
}
.hero-cta {
  display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;
  opacity: 0;
  animation: heroFadeUp 0.5s 1.3s ease both;
}
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-link {
  font-size: 0.75rem; letter-spacing: 0.1em;
  color: var(--color-muted); transition: color 0.15s;
}
.hero-link:hover { color: var(--color-accent); }

/* ── Sections ──────────────────────────────────────────── */
.manifeste        { padding: 5rem 0; }
.rapports-section { padding: 5rem 0; }
.newsletter-section { padding: 5rem 0; }

.section-header {
  display: flex; justify-content: space-between;
  align-items: baseline; margin-bottom: 2.5rem;
}
.section-header h2 { margin: 0; }
.section-header a { color: var(--color-muted); transition: color 0.15s; }
.section-header a:hover { color: var(--color-accent); }

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.rapports-coming {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-top: 1.5rem;
  opacity: 0.6;
}

/* prefers-reduced-motion overrides */
@media (prefers-reduced-motion: reduce) {
  .hero-status, .hero-subtitle, .hero-cta {
    opacity: 1 !important; animation: none !important;
  }
  .title-line-inner { transform: none !important; animation: none !important; }
  .typing-cursor    { opacity: 1 !important; animation: none !important; }
  .accent-glitch    { animation: none !important; }
}

/* ── Scanner teaser ──────────────────────────────── */
.scanner-teaser-section { padding: 0; }
.scanner-teaser {
  padding: 2rem;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.scanner-teaser-label {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  flex-shrink: 0;
}
.scanner-teaser-text {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-muted);
  min-width: 200px;
}
</style>
