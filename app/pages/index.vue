<!-- app/pages/index.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter | Survivant-IA',
  description: 'Le repère des salariés qui veulent maîtriser l\'IA pour en sortir gagnants. Un nouvel article chaque semaine, sans jargon. Bonus : diagnostic IA par métier.',
  ogTitle: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter',
  ogDescription: 'Un nouvel article chaque semaine pour piloter l\'IA dans ton métier. Gratuit, sans jargon. Et un diagnostic IA par métier.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter',
  twitterDescription: 'Un nouvel article chaque semaine pour piloter l\'IA dans ton métier. Gratuit, sans jargon. Survivant-IA.',
})

defineOgImage('Default', {
  title: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter',
  kicker: '// ZONE DE PILOTAGE',
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
        <h1 class="hero-h1">Survivre à l'IA au travail, c'est apprendre à la piloter</h1>

        <p class="hero-tagline">
          Le repère des salariés qui veulent maîtriser l'IA <span class="accent">pour en sortir gagnants.</span>
        </p>

        <p class="hero-subtitle">
          Tu sens que l'IA arrive sur ton métier. Tu as raison, et c'est ta meilleure opportunité depuis dix ans.
          Voici <strong>les leviers</strong> pour devenir le salarié qui maîtrise l'IA mieux que les autres dans son équipe.
          Sans jargon, sans coder, sans formation de six mois.
        </p>

        <div class="swiss-cta">
          <span class="swiss-cta-eyebrow"><span class="num">- I.</span> Choisis ton entrée</span>
          <p class="swiss-cta-prompt">Par où veux-tu commencer&nbsp;?</p>

          <div class="qcards">
            <NuxtLink to="#newsletter" class="qcard" data-attr="hero-cta-newsletter" @click="onHomeCta('newsletter')">
              <span class="qcard-num">01 / Newsletter hebdomadaire</span>
              <div class="qcard-icon">
                <svg viewBox="0 0 56 56" class="ic-soundwave" aria-hidden="true">
                  <circle class="ring ring-1" cx="28" cy="28" r="4"/>
                  <circle class="ring ring-2" cx="28" cy="28" r="4"/>
                  <circle class="ring ring-3" cx="28" cy="28" r="4"/>
                  <circle class="core" cx="28" cy="28" r="3"/>
                </svg>
              </div>
              <h3 class="qcard-question">Veux-tu prendre <strong>une longueur d'avance</strong>&nbsp;?</h3>
              <p class="qcard-meta">La Fréquence : un nouvel article chaque semaine, 5 minutes de lecture, dans ta boîte.</p>
              <span class="qcard-arrow">Rejoindre la Fréquence (gratuit)</span>
            </NuxtLink>

            <NuxtLink to="/scanner" class="qcard" data-attr="hero-cta-scanner" @click="onHomeCta('scanner')">
              <span class="qcard-num">02 / Diagnostic flash</span>
              <div class="qcard-icon">
                <svg viewBox="0 0 56 56" class="ic-hourglass" aria-hidden="true">
                  <path class="frame" d="M 14 8 L 42 8 M 14 48 L 42 48 M 16 8 L 16 14 L 28 26 M 40 8 L 40 14 L 28 26 M 28 30 L 16 42 L 16 48 M 28 30 L 40 42 L 40 48"/>
                  <path class="sand-top" d="M 17 10 L 39 10 L 28 26 Z"/>
                  <path class="sand-bot" d="M 28 30 L 39 46 L 17 46 Z"/>
                </svg>
              </div>
              <h3 class="qcard-question">Veux-tu cartographier <strong>l'IA dans ton métier</strong>&nbsp;?</h3>
              <p class="qcard-meta">Le Scanner : diagnostic IA en 10 secondes. Gratuit.</p>
              <span class="qcard-arrow">Tester mon métier</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── BANDEAU DE TRAJECTOIRE ──────────────── -->
    <HomeMastheadTrajectoire />

    <!-- ── MASTHEAD II — MANIFESTE ─────────────── -->
    <HomeMasthead num="II" title="Manifeste" meta="Pour qui écrit la Fréquence" />

    <!-- ── MANIFESTE ──────────────────────────── -->
    <section id="manifeste" class="manifeste">
      <div class="container">
        <HomeManifesteEditorial />
      </div>
    </section>

    <SectionDivider />

    <!-- ── SCANNER TEASER ─────────────────────────── -->
    <div class="container">
      <HomeDiagnosticTeaser @click="onHomeCta('scanner')" />
    </div>

    <!-- ── MASTHEAD III — COMPÉTENCES ───────────── -->
    <HomeMasthead num="III" title="Compétences IA-proof" meta="Ce que les modèles ne savent pas faire" />

    <!-- ── 4 COMPÉTENCES IA-PROOF ──────────────── -->
    <section class="skills-list-section">
      <div class="container">
        <HomeSkillsList />
      </div>
    </section>

    <!-- ── MASTHEAD IV — RAPPORTS ───────────────── -->
    <HomeMasthead num="IV" :title="'Rapports de Survie'" meta="MAJ hebdomadaire" />

    <!-- ── RAPPORTS BOOKSHELF ───────────────────── -->
    <section id="rapports" class="rapports-section">
      <div class="container">
        <RapportsBookshelf />
      </div>
    </section>

    <!-- ── MASTHEAD V — FAQ ───────────────────── -->
    <HomeMasthead num="V" title="Questions fréquentes" meta="Les réponses avant que tu ne demandes" />

    <!-- ── FAQ ─────────────────────────────────── -->
    <div class="container">
      <HomeFaq />
    </div>

    <!-- ── NEWSLETTER ─────────────────────────── -->
    <NewsletterForm />
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
    linear-gradient(rgba(108, 227, 181, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(108, 227, 181, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  will-change: transform;
}
.hero-inner { position: relative; z-index: 1; }

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

/* Tagline - LCP element : visible immédiatement, slide sans opacité */
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
  animation: heroSlideUp 0.7s 0.3s ease both;
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
@keyframes heroSlideUp {
  from { transform: translateY(20px); }
  to   { transform: translateY(0); }
}

/* ── Swiss CTA wrapper (dark editorial) ────────────────── */
.swiss-cta {
  background: var(--color-surface);
  color: var(--color-text);
  padding: 3rem;
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
  width: 56px;
  height: 56px;
  color: var(--color-accent);
  margin-bottom: 1.5rem;
}
.qcard-icon svg { width: 100%; height: 100%; overflow: visible; }
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

/* ── Sound wave icon (carte 01) — ripple simple ────── */
.ic-soundwave { width: 100%; height: 100%; }
.ic-soundwave .ring {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
  transform-origin: 28px 28px;
  animation: ripple 3.5s ease-out infinite;
}
.ic-soundwave .ring-1 { animation-delay: 0s; }
.ic-soundwave .ring-2 { animation-delay: 1.2s; }
.ic-soundwave .ring-3 { animation-delay: 2.4s; }
@keyframes ripple {
  0%   { transform: scale(1);   opacity: 1; }
  100% { transform: scale(6.5); opacity: 0; }
}
.ic-soundwave .core { fill: currentColor; }

/* ── Hourglass icon (carte 02) — sablier simple ────── */
.ic-hourglass { width: 100%; height: 100%; }
.ic-hourglass .frame {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ic-hourglass .sand-top {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: center top;
  animation: sand-deplete 5s linear infinite;
}
@keyframes sand-deplete {
  0%, 5%  { transform: scaleY(1);    opacity: 1; }
  85%     { transform: scaleY(0.02); opacity: 1; }
  90%     { transform: scaleY(0);    opacity: 0; }
  96%     { transform: scaleY(1);    opacity: 0; }
  100%    { transform: scaleY(1);    opacity: 1; }
}
.ic-hourglass .sand-bot {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: sand-fill 5s linear infinite;
}
@keyframes sand-fill {
  0%, 5%  { transform: scaleY(0); opacity: 1; }
  85%     { transform: scaleY(1); opacity: 1; }
  90%     { transform: scaleY(1); opacity: 0; }
  96%     { transform: scaleY(0); opacity: 0; }
  100%    { transform: scaleY(0); opacity: 1; }
}

/* ── Sections ──────────────────────────────────────────── */
.manifeste        { padding: 2rem 0 3rem; }
.rapports-section { padding: 1rem 0 3rem; }

/* H2 used for keyword-bearing section headings */
.section-h2 {
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  line-height: 1.25;
  margin: 0 0 1.75rem;
  max-width: 38ch;
}


/* responsive overrides for the hero */
@media (max-width: 720px) {
  .swiss-cta { padding: 2rem 1.5rem; }
  .qcards { grid-template-columns: 1fr; gap: 1rem; }
  .qcard { padding: 1.5rem 1.25rem; }
}

/* prefers-reduced-motion overrides */
@media (prefers-reduced-motion: reduce) {
  .hero-h1, .hero-tagline, .hero-subtitle, .swiss-cta, .qcards {
    opacity: 1 !important; animation: none !important;
  }
  .ic-soundwave .ring,
  .ic-hourglass .sand-top,
  .ic-hourglass .sand-bot { animation: none !important; }
}

</style>
