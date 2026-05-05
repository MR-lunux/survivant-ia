<!-- app/pages/identite.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Mathieu Rerat : Qui pilote Survivant-IA',
  description: 'De PwC à Deputy Head of IT, en passant par Nestlé et l\'immobilier. Le parcours de Mathieu Rerat et l\'esprit derrière Survivant-IA : aider les salariés à piloter l\'IA dans leur métier.',
  ogTitle: 'Mathieu Rerat : Identité du Survivant-IA',
  ogDescription: 'Le parcours et l\'esprit derrière Survivant-IA. Concret, sans théorie.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Mathieu Rerat : Identité du Survivant-IA',
  twitterDescription: 'Le parcours derrière Survivant-IA : piloter l\'IA dans son métier.',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': 'https://survivant-ia.ch/identite#mathieu',
          name: 'Mathieu Rerat',
          alternateName: 'Mathieu le Survivant de l\'IA',
          url: 'https://survivant-ia.ch/identite',
          jobTitle: 'Deputy Head of IT',
          description: 'Fondateur de Survivant-IA. Ex-PwC, Nestlé, Immopac. Aide les salariés à piloter l\'IA dans leur métier.',
          worksFor: { '@id': 'https://survivant-ia.ch/#organization' },
        },
        {
          '@type': 'AboutPage',
          '@id': 'https://survivant-ia.ch/identite#page',
          name: 'Identité du Survivant-IA',
          url: 'https://survivant-ia.ch/identite',
          inLanguage: 'fr-CH',
          isPartOf: { '@id': 'https://survivant-ia.ch/#website' },
          mainEntity: { '@id': 'https://survivant-ia.ch/identite#mathieu' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://survivant-ia.ch/' },
            { '@type': 'ListItem', position: 2, name: 'Identité' },
          ],
        },
      ],
    }),
  }],
})

defineOgImage('Default', {
  title: 'Mathieu Rerat',
  kicker: '// IDENTITÉ DU SURVIVANT',
})

// ── Parallax du grid background (cohérent avec hero home) ──
const gridBg = ref<HTMLElement | null>(null)

function onScroll() {
  if (gridBg.value) {
    gridBg.value.style.transform = `translateY(${window.scrollY * 0.25}px)`
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

// ── Animation timeline du parcours ──
type CardKey = 'pwc' | 'nestle' | 'immopac' | 'sf'

const CARD_DATA: Record<CardKey, { range: string; start: number; width: number }> = {
  pwc:     { range: '2015 - 2016', start: 0,  width: 5 },
  nestle:  { range: '2016',        start: 6,  width: 5 },
  immopac: { range: '2016 - 2023', start: 11, width: 62 },
  sf:      { range: '2023 - 2026', start: 73, width: 27 },
}

const activeCard = ref<CardKey | null>(null)

const tooltipText = computed(() =>
  activeCard.value ? CARD_DATA[activeCard.value].range : ''
)

const segmentStyle = computed(() => {
  if (!activeCard.value) return { opacity: 0 }
  const d = CARD_DATA[activeCard.value]
  return {
    left: `${d.start}%`,
    width: `${d.width}%`,
    opacity: 1,
  }
})

const tooltipStyle = computed(() => {
  if (!activeCard.value) return { opacity: 0 }
  const d = CARD_DATA[activeCard.value]
  return {
    left: `${d.start + d.width / 2}%`,
    opacity: 1,
  }
})
</script>

<template>
  <div class="id-page-wrap">
    <div ref="gridBg" class="grid-bg" aria-hidden="true" />

    <div class="container id-container" style="max-width: 1100px;">
      <Breadcrumbs :items="[{ label: 'Identité' }]" />

      <!-- ── HEAD ────────────────────────────────── -->
      <header class="id-head">
        <KickerLabel>IDENTITÉ · PARCOURS 2015 → 2026</KickerLabel>
        <h1 class="id-name">Mathieu, le <em>Survivant de l'IA</em>.</h1>
        <p class="id-role">Deputy Head of IT · HEC Lausanne · 11 ans en IT &amp; transformation digitale</p>
      </header>

      <!-- ── BODY (2 colonnes drop cap) ─────────── -->
      <div class="id-cols">
        <p>Master en systèmes d'information à HEC Lausanne. PwC en audit IT, puis Nestlé comme Business Analyst. 7 ans chez Immopac à piloter la transformation digitale d'un secteur traditionnel, l'immobilier, en passant de consultant à Head of Office Romandie. Aujourd'hui Deputy Head of IT chez Solutions&nbsp;&amp;&nbsp;Funds.</p>

        <p>J'ai vu de l'intérieur ce qui marche et ce qui plante dans les rollouts d'outils, dans des organisations qui n'ont rien de tech.</p>

        <p>Quand l'IA s'est invitée dans mon quotidien, j'ai plongé. Claude, ChatGPT, automatisations, code... Je lis les articles, j'écoute les podcasts, je teste. Pendant un moment, j'ai cru que plus j'en utilisais, mieux je travaillais.</p>

        <p>Jusqu'au jour où j'ai réalisé que je n'avais plus la notion de l'effort. Je produisais vite, beaucoup, mais je ne construisais plus rien. L'IA faisait, je validais. Ce signal ne m'a pas rendu anti-IA. Il m'a rendu <span class="lucide">lucide</span>.</p>

        <p>Ce site existe pour les salariés qui voient l'IA arriver sans savoir comment se positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais aimé avoir et éviter les erreurs que j'ai faites.</p>

        <p>Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous, avec quelques cartes en main, et les cicatrices pour prouver que j'y suis déjà passé.</p>
      </div>

      <!-- ── PARCOURS ─────────────────────────── -->
      <p class="id-parcours-h">
        <span>PARCOURS</span>
        <span class="right">passe la souris sur une carte ↓</span>
      </p>

      <section class="parcours">
        <div class="parcours-timeline" aria-hidden="true">
          <div class="parcours-timeline-rail" />
          <span class="parcours-timeline-marker" style="left: 0%;" />
          <span class="parcours-timeline-year"   style="left: 0%;">2015</span>
          <span class="parcours-timeline-marker" style="left: 25%;" />
          <span class="parcours-timeline-year"   style="left: 25%;">2018</span>
          <span class="parcours-timeline-marker" style="left: 50%;" />
          <span class="parcours-timeline-year"   style="left: 50%;">2021</span>
          <span class="parcours-timeline-marker" style="left: 75%;" />
          <span class="parcours-timeline-year"   style="left: 75%;">2024</span>
          <span class="parcours-timeline-marker" style="left: 100%;" />
          <span class="parcours-timeline-year"   style="left: 100%;">2026</span>

          <div class="parcours-timeline-segment" :style="segmentStyle" />
          <div class="parcours-timeline-tooltip" :style="tooltipStyle">{{ tooltipText }}</div>
        </div>

        <div class="parcours-grid">

          <article
            class="pcard"
            @mouseenter="activeCard = 'pwc'"
            @mouseleave="activeCard = null"
          >
            <p class="pcard-period">SEPT. 2015 → FÉV. 2016</p>
            <h3 class="pcard-comp">PwC</h3>
            <p class="pcard-role"><b>Junior Auditor IT</b> · Risk Assurance</p>
            <p class="pcard-loc">Genève · 6 mois</p>
            <p class="pcard-desc">Audits ITGC, journal entries testing, identification de risques sur clients SOX. Premiers contacts avec la complexité SI grandes structures.</p>
          </article>

          <article
            class="pcard"
            @mouseenter="activeCard = 'nestle'"
            @mouseleave="activeCard = null"
          >
            <p class="pcard-period">AVR. 2016 → OCT. 2016</p>
            <h3 class="pcard-comp">Nestlé</h3>
            <p class="pcard-role"><b>Junior Business Analyst</b></p>
            <p class="pcard-loc">Suisse · 7 mois</p>
            <p class="pcard-desc">Tests fonctionnels, sens de l'organisation, premier vrai pont entre métier et tech. La traduction des besoins flous en specs actionnables.</p>
          </article>

          <article
            class="pcard"
            @mouseenter="activeCard = 'immopac'"
            @mouseleave="activeCard = null"
          >
            <p class="pcard-period">NOV. 2016 → SEPT. 2023</p>
            <h3 class="pcard-comp">Immopac</h3>
            <p class="pcard-role"><b>IT Consultant</b> → <b>Head of Office Romandie</b></p>
            <p class="pcard-loc">Lausanne · 6 ans 11 mois</p>
            <p class="pcard-desc">Apprentissage à Zürich (xyrion, langage propriétaire), puis ouverture du bureau Lausanne. Promu Head of Office Romandie en 2021. Discussion stratégique direction, mise en place de processus, recrutement.</p>
          </article>

          <article
            class="pcard"
            @mouseenter="activeCard = 'sf'"
            @mouseleave="activeCard = null"
          >
            <p class="pcard-period">SEPT. 2023 → AUJOURD'HUI</p>
            <h3 class="pcard-comp">Solutions &amp; Funds</h3>
            <p class="pcard-role"><b>Project Office / IT</b> → <b>Deputy Head of IT</b></p>
            <p class="pcard-loc">Morges · 2 ans 9 mois · hybride</p>
            <p class="pcard-desc">Pilotage projet IT, optimisation des processus, intégration de l'IA dans le quotidien. Promu Deputy Head of IT en avril 2025.</p>
          </article>

        </div>
      </section>

      <!-- ── MISSION ──────────────────────────── -->
      <div class="id-mission">
        <p>Aider les salariés à <em>piloter l'IA</em> dans leur métier <em>avant</em> de la subir.</p>
      </div>

      <!-- ── CTA ─────────────────────────────── -->
      <div class="id-cta">
        <GlitchButton label="Rejoindre la Fréquence" to="/#newsletter" />
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Wrap + grid background avec parallax ─────── */
.id-page-wrap {
  position: relative;
  overflow: hidden;
  padding: 4rem 0 6rem;
}
.grid-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(108, 227, 181, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(108, 227, 181, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center top, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center top, black 30%, transparent 75%);
  will-change: transform;
  pointer-events: none;
}
.id-container {
  position: relative;
  z-index: 1;
}

/* ── HEAD (style 02) ──────────────────────────── */
.id-head {
  border-bottom: 1px solid var(--color-rule);
  padding-bottom: 2.5rem;
  margin: 1rem 0 4rem;
}
.id-name {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(1.85rem, 3.5vw, 2.6rem);
  line-height: 1.1;
  letter-spacing: -0.018em;
  margin: 0.85rem 0 0.85rem;
  color: var(--color-text);
}
.id-name em {
  font-style: italic;
  color: var(--color-accent);
}
.id-role {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--color-muted);
  text-transform: uppercase;
  margin: 0;
}

/* ── BODY (style 01 — 2 colonnes drop cap) ────── */
.id-cols {
  column-count: 2;
  column-gap: 3rem;
  max-width: 920px;
  margin: 0 0 5rem;
  color: var(--color-text-soft);
  font-size: 1rem;
  line-height: 1.85;
}
.id-cols p {
  margin: 0 0 1.4rem;
  break-inside: avoid;
}
.id-cols p:first-of-type::first-letter {
  font-family: var(--font-serif);
  font-weight: 500;
  font-style: italic;
  color: var(--color-accent);
  font-size: 4.5rem;
  line-height: 0.85;
  float: left;
  padding-right: 0.65rem;
  padding-top: 0.35rem;
}
.id-cols .lucide {
  color: var(--color-accent);
  font-style: italic;
  font-weight: 500;
}
@media (max-width: 760px) {
  .id-cols { column-count: 1; }
}

/* ── PARCOURS — entête ───────────────────────── */
.id-parcours-h {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0 0 2rem;
  border-bottom: 1px solid var(--color-rule);
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.id-parcours-h .right {
  color: var(--color-muted-soft);
  letter-spacing: 0.14em;
  font-size: 0.65rem;
}

/* ── PARCOURS — timeline rail ────────────────── */
.parcours { margin: 0 0 5rem; }

.parcours-timeline {
  position: relative;
  height: 64px;
  margin-bottom: 1.5rem;
}
.parcours-timeline-rail {
  position: absolute;
  left: 0; right: 0;
  top: 50%;
  height: 1px;
  background: var(--color-rule);
}
.parcours-timeline-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: var(--color-bg);
  border: 1px solid var(--color-hairline-strong);
  border-radius: 50%;
  z-index: 1;
}
.parcours-timeline-year {
  position: absolute;
  transform: translateX(-50%);
  top: calc(50% + 12px);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  color: var(--color-muted-soft);
  white-space: nowrap;
}
.parcours-timeline-segment {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 3px;
  background: var(--color-accent);
  box-shadow: 0 0 10px var(--color-accent-glow);
  left: 50%;
  width: 0;
  opacity: 0;
  transition:
    left 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    width 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.25s ease;
  pointer-events: none;
  z-index: 2;
}
.parcours-timeline-tooltip {
  position: absolute;
  top: calc(50% - 24px);
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  color: var(--color-accent);
  background: var(--color-bg);
  padding: 0.15rem 0.55rem;
  border: 1px solid var(--color-accent-soft);
  white-space: nowrap;
  opacity: 0;
  transition:
    left 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.25s ease;
  pointer-events: none;
  z-index: 3;
}

/* ── PARCOURS — cards ────────────────────────── */
.parcours-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 800px) {
  .parcours-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .parcours-grid { grid-template-columns: 1fr; }
}
.pcard {
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.5rem 1.25rem 1.4rem;
  transition: border-color 0.3s ease, transform 0.3s ease, background 0.3s ease;
  position: relative;
  overflow: hidden;
}
.pcard:hover {
  border-color: var(--color-accent);
  background: var(--color-surface-2);
  transform: translateY(-3px);
}
.pcard::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.pcard:hover::before { transform: scaleX(1); }

.pcard-period {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  color: var(--color-accent);
  text-transform: uppercase;
  margin: 0 0 0.85rem;
}
.pcard-comp {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: 1.45rem;
  line-height: 1.15;
  color: var(--color-text);
  margin: 0 0 0.35rem;
}
.pcard-role {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin: 0 0 1rem;
  line-height: 1.45;
}
.pcard-role b {
  color: var(--color-text-soft);
  font-weight: 500;
}
.pcard-loc {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  color: var(--color-muted-soft);
  text-transform: uppercase;
  margin: 0 0 1rem;
  border-top: 1px dashed var(--color-rule);
  padding-top: 0.85rem;
}
.pcard-desc {
  font-size: 0.82rem;
  line-height: 1.65;
  color: var(--color-text-soft);
  margin: 0;
}

/* ── MISSION — encart bordure menthe ────────── */
.id-mission {
  border: 1px solid var(--color-accent);
  padding: 2.5rem 2.5rem 2.25rem;
  max-width: 700px;
  margin: 0 auto 4rem;
  text-align: center;
  position: relative;
}
.id-mission::before {
  content: 'MISSION';
  position: absolute;
  top: -0.6rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg);
  padding: 0 0.85rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  color: var(--color-accent);
}
.id-mission p {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 1.5rem;
  line-height: 1.4;
  margin: 0;
  color: var(--color-text);
  max-width: 32ch;
  margin-left: auto;
  margin-right: auto;
}
.id-mission em { color: var(--color-accent); }

/* ── CTA ──────────────────────────────────── */
.id-cta { text-align: center; }

/* ── prefers-reduced-motion ────────────────── */
@media (prefers-reduced-motion: reduce) {
  .grid-bg { transform: none !important; }
  .parcours-timeline-segment,
  .parcours-timeline-tooltip,
  .pcard,
  .pcard::before {
    transition: none !important;
  }
}
</style>
