<!-- app/pages/index.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Se former à l\'IA, ne pas se faire remplacer | Survivant-IA',
  description: '1 rapport gratuit / semaine pour ne pas te faire remplacer par l\'IA. Compétences, astuces, cas concrets, sans jargon. Bonus : scanner par métier.',
  ogTitle: 'Se former à l\'IA pour ne pas se faire remplacer - Survivant-IA',
  ogDescription: '1 rapport par semaine pour ne pas te faire remplacer par l\'IA. Gratuit, sans jargon. Et un scanner d\'obsolescence par métier.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Se former à l\'IA pour ne pas se faire remplacer',
  twitterDescription: '1 rapport par semaine pour prendre le virage de l\'IA. Gratuit, sans jargon. Survivant-IA.',
})

defineOgImage('Default', {
  title: 'Comment ne pas se faire remplacer par l\'IA',
  kicker: '// ZONE ANTI-OBSOLESCENCE',
})

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
        <span class="hero-eyebrow">Zone anti-obsolescence — 2026</span>

        <h1 class="hero-h1">Comment ne pas se faire remplacer par l'IA</h1>

        <p class="hero-tagline">
          L'IA arrive. <span class="accent">Ne soyez pas une variable supprimée.</span>
        </p>

        <p class="hero-subtitle">
          Tu sens que l'IA arrive sur ton métier. Tu as raison.
          Voici les compétences à développer pour <strong>prendre le virage</strong>, pas pour le subir.
          Soft skills, compréhension de l'IA, cas pratiques concrets, sans jargon.
        </p>

        <div class="swiss-cta">
          <span class="swiss-cta-eyebrow"><span class="num">— I.</span> Choisis ton entrée</span>
          <p class="swiss-cta-prompt">Tu te poses laquelle de ces deux questions&nbsp;?</p>

          <div class="qcards">
            <NuxtLink to="#newsletter" class="qcard" data-attr="hero-cta-newsletter" @click="onHomeCta('newsletter')">
              <span class="qcard-num">01 / Newsletter hebdomadaire</span>
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
              <h3 class="qcard-question">Veux-tu <strong>survivre</strong><br>avec l'IA&nbsp;?</h3>
              <p class="qcard-meta">La Fréquence — un signal hebdomadaire, 5 minutes, pour rester un cran devant.</p>
              <span class="qcard-arrow">Rejoindre la fréquence</span>
            </NuxtLink>

            <NuxtLink to="/scanner" class="qcard" data-attr="hero-cta-scanner" @click="onHomeCta('scanner')">
              <span class="qcard-num">02 / Diagnostic flash</span>
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
              <h3 class="qcard-question">Veux-tu connaître ton <strong>obsolescence</strong>&nbsp;?</h3>
              <p class="qcard-meta">Le Scanner — ton score d'obsolescence en 10 secondes. Sans email, sans inscription.</p>
              <span class="qcard-arrow">Tester mon métier</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

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

    <!-- ── 3 COMPÉTENCES IA-PROOF ──────────────── -->
    <section class="skills-triad-section">
      <div class="container">
        <HomeSkillsTriad />
      </div>
    </section>

    <SectionDivider />

    <!-- ── RAPPORTS BOOKSHELF ───────────────────── -->
    <section class="rapports-section">
      <div class="container">
        <RapportsBookshelf />
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
  padding: 5rem 0 3rem;
  overflow: hidden;
}
.hero-grid-bg {
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(rgba(91, 163, 122, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(91, 163, 122, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  will-change: transform;
}
.hero-inner { max-width: 800px; position: relative; z-index: 1; }

/* Eyebrow editorial - hairline + sage uppercase */
.hero-eyebrow {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  animation: heroFadeUp 0.5s 0.4s ease both;
}
.hero-eyebrow::before {
  content: '';
  width: 28px; height: 1px;
  background: var(--color-accent);
}

/* SEO H1 - semantic, keyword-rich, modest visual */
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

/* Tagline - Playfair italic visual climax */
.hero-tagline {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-weight: 400;
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  line-height: 1.04;
  letter-spacing: -0.018em;
  margin: 0 0 1.75rem;
  max-width: 18ch;
  color: var(--color-text);
  animation: heroFadeUp 0.6s 0.6s ease both;
}
.hero-tagline .accent {
  font-style: italic;
  color: var(--color-accent);
}

.hero-subtitle {
  font-family: var(--font-serif-body);
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--color-muted);
  max-width: 60ch;
  margin: 0 0 2.5rem;
  animation: heroFadeUp 0.6s 0.95s ease both;
}
.hero-subtitle strong {
  color: var(--color-text);
  font-weight: 600;
  font-style: italic;
}
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Swiss CTA wrapper (dark editorial) ────────────────── */
.swiss-cta {
  background: var(--color-surface);
  color: var(--color-text);
  padding: 2.5rem;
  position: relative;
  border: 1px solid var(--color-rule);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
  animation: heroFadeUp 0.6s 1.2s ease both;
}
.swiss-cta::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 60px; height: 4px;
  background: var(--color-accent);
}
.swiss-cta-eyebrow {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-text);
  text-transform: uppercase;
  display: block;
  margin-bottom: 0.75rem;
}
.swiss-cta-eyebrow .num { color: var(--color-accent); margin-right: 0.5rem; }
.swiss-cta-prompt {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.25rem, 2.4vw, 1.65rem);
  color: var(--color-text);
  margin: 0 0 2rem;
  max-width: 30ch;
  line-height: 1.2;
}

/* ── Question cards ───────────────────────────── */
.qcards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
.qcard {
  background: var(--color-bg);
  border: 1px solid var(--color-rule);
  padding: 2rem;
  text-decoration: none;
  color: var(--color-text);
  display: block;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}
.qcard:hover {
  border-color: var(--color-accent);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px var(--color-accent-soft);
}
.qcard-num {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  text-transform: uppercase;
  display: block;
  margin-bottom: 1.25rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--color-rule);
}
.qcard-icon {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  margin-bottom: 1.5rem;
}
.qcard-icon svg { overflow: visible; }
.qcard-question {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-style: italic;
  font-weight: 400;
  font-size: 1.5rem;
  line-height: 1.15;
  color: var(--color-text);
  margin: 0 0 0.6rem;
  letter-spacing: -0.01em;
}
.qcard-question strong {
  font-weight: 800;
  font-style: normal;
  color: var(--color-accent);
}
.qcard-meta {
  font-family: var(--font-sans);
  font-size: 0.92rem;
  color: var(--color-muted);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
.qcard-arrow {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: gap 0.25s ease;
}
.qcard-arrow::after {
  content: '→';
  transition: transform 0.25s ease;
}
.qcard:hover .qcard-arrow { gap: 0.7rem; }
.qcard:hover .qcard-arrow::after { transform: translateX(4px); }

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


/* responsive overrides for the hero */
@media (max-width: 720px) {
  .swiss-cta { padding: 1.75rem 1.25rem; }
  .qcards { grid-template-columns: 1fr; gap: 1rem; }
  .qcard { padding: 1.5rem 1.25rem; }
  .qcard-icon { height: 130px; }
}

/* prefers-reduced-motion overrides */
@media (prefers-reduced-motion: reduce) {
  .hero-eyebrow, .hero-h1, .hero-tagline, .hero-subtitle, .swiss-cta, .qcards {
    opacity: 1 !important; animation: none !important;
  }
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
