<!-- app/pages/index.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Se former à l\'IA, ne pas se faire remplacer | Survivant-IA',
  description: '1 rapport gratuit / semaine pour ne pas te faire remplacer par l\'IA. Compétences, astuces, cas concrets, sans jargon. Bonus : scanner par métier.',
  ogTitle: 'Se former à l\'IA pour ne pas se faire remplacer — Survivant-IA',
  ogDescription: '1 rapport par semaine pour ne pas te faire remplacer par l\'IA. Gratuit, sans jargon. Et un scanner d\'obsolescence par métier.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Se former à l\'IA pour ne pas se faire remplacer',
  twitterDescription: '1 rapport par semaine pour prendre le virage de l\'IA. Gratuit, sans jargon. Survivant-IA.',
})

defineOgImage('Default', {
  title: 'Comment ne pas se faire remplacer par l\'IA',
  kicker: '// ZONE ANTI-OBSOLESCENCE',
})

const { data: articles } = await useAsyncData('home-articles', () =>
  queryCollection('rapports')
    .order('date', 'DESC')
    .limit(3)
    .all()
)

const { capture } = usePosthogEvent()

function onHomeCta(cta: 'scanner' | 'rapports' | 'newsletter') {
  capture('home_cta_clicked', { cta })
}

const heroGrid = ref<HTMLElement | null>(null)

function onScroll() {
  if (heroGrid.value) {
    heroGrid.value.style.transform = `translateY(${window.scrollY * 0.25}px)`
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  window.addEventListener('scroll', onScroll, { passive: true })
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

      <div class="container hero-inner">
        <div class="hero-kicker"><KickerLabel>ZONE ANTI-OBSOLESCENCE</KickerLabel></div>

        <h1 class="hero-h1">Comment ne pas se faire remplacer par l'IA</h1>

        <p class="hero-tagline">
          <span class="title-line">
            <span class="title-line-inner">L'IA ARRIVE.</span>
          </span>
          <span class="title-line">
            <span class="title-line-inner">
              <span class="text-accent accent-glitch">NE SOYEZ PAS<br>UNE VARIABLE SUPPRIMÉE.</span>
              <span class="typing-cursor" aria-hidden="true" />
            </span>
          </span>
        </p>

        <p class="hero-subtitle">
          Tu sens que l'IA arrive sur ton métier. Tu as raison.
          Voici les compétences à développer pour <strong>prendre le virage</strong> — pas pour le subir.
          Soft skills, compréhension de l'IA, cas pratiques concrets, sans jargon.
        </p>

        <p class="hero-prompt">Tu te poses laquelle ?</p>

        <div class="qcards">
          <NuxtLink to="#newsletter" class="qcard" data-attr="hero-cta-newsletter" @click="onHomeCta('newsletter')">
            <KickerLabel class="qcard-num">01 · ÉMISSION</KickerLabel>
            <div class="qcard-icon">
              <svg viewBox="0 0 170 150" class="ic-soundwave" aria-hidden="true">
                <rect class="bar" style="--delay: 0s;     --dur: 2.4s" x="10"  y="20" width="10" height="110"/>
                <rect class="bar" style="--delay: 0.4s;   --dur: 3.0s" x="28"  y="20" width="10" height="110"/>
                <rect class="bar" style="--delay: 0.15s;  --dur: 2.0s" x="46"  y="20" width="10" height="110"/>
                <rect class="bar" style="--delay: 0.6s;   --dur: 2.6s" x="64"  y="20" width="10" height="110"/>
                <rect class="bar" style="--delay: 0.25s;  --dur: 1.8s" x="82"  y="20" width="10" height="110"/>
                <rect class="bar" style="--delay: 0.5s;   --dur: 2.8s" x="100" y="20" width="10" height="110"/>
                <rect class="bar" style="--delay: 0.7s;   --dur: 2.4s" x="118" y="20" width="10" height="110"/>
                <rect class="bar" style="--delay: 0.3s;   --dur: 3.2s" x="136" y="20" width="10" height="110"/>
                <rect class="bar" style="--delay: 0.55s;  --dur: 2.2s" x="154" y="20" width="10" height="110"/>
              </svg>
            </div>
            <h3 class="qcard-question">Veux-tu <span class="em">survivre</span><br>avec l'IA ?</h3>
            <div class="qcard-foot">
              <span class="qcard-cta">▸ La Fréquence</span>
              <span class="qcard-meta font-mono">1 rapport gratuit / semaine · 5 min</span>
            </div>
          </NuxtLink>

          <NuxtLink to="/scanner" class="qcard" data-attr="hero-cta-scanner" @click="onHomeCta('scanner')">
            <KickerLabel class="qcard-num">02 · ÉCOULEMENT</KickerLabel>
            <div class="qcard-icon">
              <svg viewBox="0 0 130 150" class="ic-hourglass" aria-hidden="true">
                <g class="hourglass-body">
                  <line class="frame" x1="22" y1="14" x2="108" y2="14"/>
                  <line class="frame" x1="22" y1="136" x2="108" y2="136"/>
                  <path class="frame" d="M 28 14 L 28 22 L 60 70 L 60 80 L 28 128 L 28 136"/>
                  <path class="frame" d="M 102 14 L 102 22 L 70 70 L 70 80 L 102 128 L 102 136"/>
                  <path class="sand-top" d="M 30 22 L 100 22 L 65 70 Z"/>
                  <path class="sand-bot" d="M 65 80 L 100 128 L 30 128 Z"/>
                </g>
                <g class="grains-overlay">
                  <circle class="grain grain-1" cx="65" cy="75" r="1.5"/>
                  <circle class="grain grain-2" cx="65" cy="75" r="1.5"/>
                  <circle class="grain grain-3" cx="65" cy="75" r="1.5"/>
                </g>
              </svg>
            </div>
            <h3 class="qcard-question">Veux-tu connaître<br>ton <span class="em">obsolescence</span> ?</h3>
            <div class="qcard-foot">
              <span class="qcard-cta">▸ Le Scanner</span>
              <span class="qcard-meta font-mono">Test gratuit · ton score en 10 secondes</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <SectionDivider />

    <!-- ── E-E-A-T PROOF BAR ──────────────────── -->
    <div class="container">
      <HomeProofBar />
    </div>

    <SectionDivider />

    <!-- ── MANIFESTE ──────────────────────────── -->
    <section class="manifeste">
      <div class="container">
        <h2 class="section-h2">Se former à l'IA, sans devenir développeur</h2>
        <ManifestoTerminal />
      </div>
    </section>

    <SectionDivider />

    <!-- ── SCANNER TEASER ─────────────────────────── -->
    <div class="container">
      <HomeDiagnosticTeaser @click="onHomeCta('scanner')" />
    </div>

    <SectionDivider />
    <StatsStrip />
    <SectionDivider />

    <!-- ── 3 COMPÉTENCES IA-PROOF ──────────────── -->
    <section class="skills-triad-section">
      <div class="container">
        <HomeSkillsTriad />
      </div>
    </section>

    <SectionDivider />

    <!-- ── DERNIERS RAPPORTS ──────────────────── -->
    <section class="rapports-section">
      <div class="container">
        <div class="section-header" data-reveal>
          <h2>Rapports de Survie — la veille hebdo pour prendre le virage de l'IA</h2>
          <NuxtLink to="/rapports" class="font-mono" style="font-size: 0.75rem; letter-spacing: 0.1em;" data-attr="home-link-rapports" @click="onHomeCta('rapports')">LIRE LES RAPPORTS ANTI-OBSOLESCENCE →</NuxtLink>
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

    <!-- ── FAQ ─────────────────────────────────── -->
    <div class="container">
      <HomeFaq />
    </div>

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


/* kicker — small mono label above H1 */
.hero-kicker {
  display: block;
  margin-bottom: 0.85rem;
  animation: heroFadeUp 0.5s 0.4s ease both;
}

/* SEO H1 — semantic, keyword-rich, modest visual */
.hero-h1 {
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1.4;
  color: var(--color-muted);
  margin: 0 0 1.25rem;
  font-family: var(--font-sans);
  text-transform: none;
  animation: heroFadeUp 0.5s 0.45s ease both;
}

/* tagline (former h1) — visual climax, line-by-line clip reveal */
.hero-tagline {
  font-size: clamp(2.2rem, 6vw, 4rem);
  line-height: 1.1;
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 1.5rem;
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
  animation: heroFadeUp 0.6s 1.1s ease both;
}
@keyframes heroFadeUp {
  from { transform: translateY(16px); }
  to   { transform: translateY(0); }
}

/* ── Hero question cards ───────────────────────────── */
.hero-prompt {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0 0 2rem;
  animation: heroFadeUp 0.5s 1.3s ease both;
}
.hero-prompt::before, .hero-prompt::after {
  content: '—'; color: #555; margin: 0 0.85rem;
}

.qcards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  animation: heroFadeUp 0.5s 1.5s ease both;
}
.qcard {
  background: var(--color-surface);
  border: 1px solid rgba(0, 255, 65, 0.25);
  padding: 2rem 1.75rem 1.75rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
}
.qcard::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 30%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.06), transparent);
  pointer-events: none;
  transition: left 0.9s ease;
}
.qcard:hover {
  border-color: var(--color-accent);
  background: rgba(0, 255, 65, 0.025);
  transform: translateY(-4px);
}
.qcard:hover::after { left: 130%; }

.qcard-num { align-self: flex-start; }

.qcard-icon {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  margin: 0.5rem 0;
}
.qcard-icon svg {
  overflow: visible;
  filter: drop-shadow(0 0 12px rgba(0, 255, 65, 0.3));
  transition: filter 0.3s ease;
}
.qcard:hover .qcard-icon svg {
  filter: drop-shadow(0 0 24px rgba(0, 255, 65, 0.6));
}

.qcard-question {
  font-family: var(--font-mono);
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.25;
  text-align: center;
  margin: 0.25rem 0 0.5rem;
}
.qcard-question .em { color: var(--color-accent); }

.qcard-foot {
  margin-top: auto;
  padding-top: 1.25rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
}
.qcard-cta {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-size: 0.85rem; font-weight: 700;
  letter-spacing: 0.18em; color: var(--color-accent);
  text-transform: uppercase;
  transition: letter-spacing 0.3s ease;
}
.qcard:hover .qcard-cta { letter-spacing: 0.22em; }
.qcard-meta {
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  color: var(--color-muted);
}

/* ── Sound wave icon (carte 01) ────────────────────── */
.ic-soundwave { width: 170px; height: 150px; }
.ic-soundwave .bar {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: eq-bounce var(--dur, 2.4s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
@keyframes eq-bounce {
  0%, 100% { transform: scaleY(0.25); }
  50%      { transform: scaleY(1); }
}

/* ── Hourglass icon (carte 02) ─────────────────────── */
.ic-hourglass { width: 130px; height: 150px; }
.hourglass-body {
  transform-box: view-box;
  transform-origin: 65px 75px;
  animation: hourglass-flip 10s ease-in-out infinite;
}
@keyframes hourglass-flip {
  0%, 40%   { transform: rotate(0deg); }
  50%, 90%  { transform: rotate(180deg); }
  100%      { transform: rotate(360deg); }
}
.ic-hourglass .frame {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ic-hourglass .sand-top {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: center top;
  animation: sand-top-cycle 10s ease-in-out infinite;
}
@keyframes sand-top-cycle {
  0%   { transform: scaleY(1); }
  40%  { transform: scaleY(0); }
  50%  { transform: scaleY(0); }
  90%  { transform: scaleY(1); }
  100% { transform: scaleY(1); }
}
.ic-hourglass .sand-bot {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: sand-bot-cycle 10s ease-in-out infinite;
}
@keyframes sand-bot-cycle {
  0%   { transform: scaleY(0); }
  40%  { transform: scaleY(1); }
  50%  { transform: scaleY(1); }
  90%  { transform: scaleY(0); }
  100% { transform: scaleY(0); }
}
.grains-overlay { animation: grains-cycle 10s linear infinite; }
@keyframes grains-cycle {
  0%, 38%   { opacity: 1; }
  41%, 49%  { opacity: 0; }
  52%, 88%  { opacity: 1; }
  91%, 100% { opacity: 0; }
}
.ic-hourglass .grain {
  fill: currentColor;
  filter: drop-shadow(0 0 2px currentColor);
  animation: grain-fall 1.1s linear infinite;
}
.ic-hourglass .grain-1 { animation-delay: 0s; }
.ic-hourglass .grain-2 { animation-delay: 0.36s; }
.ic-hourglass .grain-3 { animation-delay: 0.72s; }
@keyframes grain-fall {
  0%   { transform: translate(0, -10px); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translate(0, 10px); opacity: 0; }
}

/* ── Sections ──────────────────────────────────────────── */
.manifeste        { padding: 5rem 0; }
.rapports-section { padding: 5rem 0; }
.newsletter-section { padding: 5rem 0; }

/* H2 used for keyword-bearing section headings */
.section-h2 {
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  line-height: 1.25;
  margin: 0 0 1.75rem;
  max-width: 38ch;
}

.section-header {
  display: flex; justify-content: space-between;
  align-items: baseline; margin-bottom: 2.5rem;
  gap: 1.5rem; flex-wrap: wrap;
}
.section-header h2 { margin: 0; max-width: 38ch; }
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

/* responsive overrides for the hero cards */
@media (max-width: 720px) {
  .qcards { grid-template-columns: 1fr; gap: 1.5rem; }
  .qcard { padding: 1.5rem 1.25rem 1.25rem; }
  .qcard-icon { height: 160px; }
}

/* prefers-reduced-motion overrides */
@media (prefers-reduced-motion: reduce) {
  .hero-subtitle, .hero-prompt, .qcards, .hero-kicker, .hero-h1 {
    opacity: 1 !important; animation: none !important;
  }
  .title-line-inner { transform: none !important; animation: none !important; }
  .typing-cursor    { opacity: 1 !important; animation: none !important; }
  .accent-glitch    { animation: none !important; }
  .ic-soundwave .bar,
  .hourglass-body,
  .ic-hourglass .sand-top,
  .ic-hourglass .sand-bot,
  .grains-overlay,
  .ic-hourglass .grain { animation: none !important; }
  .ic-soundwave .bar { transform: scaleY(0.7); transform-origin: center bottom; transform-box: fill-box; }
  .grains-overlay { opacity: 0; }
}

</style>
