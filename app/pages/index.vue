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
</script>

<template>
  <div>
    <!-- ── HERO ───────────────────────────────── -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-status">
          <span class="status-dot" />
          <span class="font-mono">TRANSMISSION EN COURS</span>
        </div>

        <h1 class="hero-title">
          L'IA ARRIVE.<br>
          <span class="text-accent">NE SOYEZ PAS<br>UNE VARIABLE SUPPRIMÉE.</span>
        </h1>

        <p class="hero-subtitle">
          Développez les compétences que les algorithmes ne pourront jamais copier.
          Soft skills, compréhension de l'IA, cas pratiques concrets — sans jargon.
        </p>

        <div class="hero-cta">
          <GlitchButton label="Rejoindre la Fréquence" to="/frequence" />
          <NuxtLink to="/rapports" class="hero-link font-mono">
            LIRE LES RAPPORTS →
          </NuxtLink>
        </div>
      </div>

      <div class="hero-grid-bg" aria-hidden="true" />
    </section>

    <!-- ── MANIFESTE ──────────────────────────── -->
    <section class="manifeste">
      <div class="container">
        <ScannerBorder class="manifeste-inner">
          <p class="font-mono" style="color: var(--color-muted); font-size: 0.7rem; letter-spacing: 0.1em; margin-bottom: 1rem;">// MANIFESTE</p>
          <p>Je suis chef de projet IT. Je vois l'IA arriver. Je refuse de regarder sans agir.</p>
          <p>Ce site n'est pas là pour vous faire peur — c'est là pour vous armer. Les outils sont plus simples que vous ne le croyez. La menace est réelle mais gérable.</p>
          <p style="margin: 0;"><strong class="text-accent">Préparons-nous avant que ça arrive.</strong></p>
        </ScannerBorder>
      </div>
    </section>

    <!-- ── DERNIERS RAPPORTS ───────────────────── -->
    <section class="rapports-section">
      <div class="container">
        <div class="section-header">
          <h2>Rapports de Survie</h2>
          <NuxtLink to="/rapports" class="font-mono" style="font-size: 0.75rem; letter-spacing: 0.1em;">TOUS LES RAPPORTS →</NuxtLink>
        </div>

        <div class="articles-grid">
          <ArticleCard
            v-for="article in articles"
            :key="article.path"
            :article="article"
          />
        </div>
      </div>
    </section>

    <!-- ── NEWSLETTER ─────────────────────────── -->
    <section class="newsletter-section">
      <div class="container">
        <NewsletterForm />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  position: relative;
  padding: 6rem 0 5rem;
  overflow: hidden;
}
.hero-grid-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(0, 255, 65, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}
.hero-inner { max-width: 800px; }
.hero-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-bottom: 2rem;
}
.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
.hero-title {
  font-size: clamp(2.2rem, 6vw, 4rem);
  line-height: 1.1;
  margin: 0 0 1.5rem;
}
.hero-subtitle {
  font-size: 1.1rem;
  color: var(--color-muted);
  max-width: 55ch;
  margin: 0 0 2.5rem;
  line-height: 1.7;
}
.hero-cta {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.hero-link {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  transition: color 0.15s;
}
.hero-link:hover { color: var(--color-accent); }

/* Manifeste */
.manifeste { padding: 4rem 0; }
.manifeste-inner {
  padding: 2rem;
  background: var(--color-surface);
  max-width: 700px;
}
.manifeste-inner p {
  color: var(--color-muted);
  line-height: 1.8;
  margin-bottom: 0.75rem;
}

/* Articles */
.rapports-section { padding: 4rem 0; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2rem;
}
.section-header h2 { margin: 0; }
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Newsletter */
.newsletter-section { padding: 4rem 0; }
</style>
