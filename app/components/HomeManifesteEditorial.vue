<!-- app/components/HomeManifesteEditorial.vue -->
<template>
  <div class="manifeste-grid">
    <div class="manifeste-content" data-reveal>
      <p class="manifeste-quote">
        Tu vois l'IA arriver dans ton job. Tu ne sais pas comment te positionner. Tu n'es pas seul. Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est une carte de survie pratique, une fois par semaine. <span class="accent">Prépare-toi avant que ça arrive.</span>
      </p>
      <p class="manifeste-byline">
        — <strong>Mathieu, le Survivant de l'IA</strong> · Fondateur · survivant-ia.ch
      </p>
    </div>

    <NuxtLink to="/identite" class="profil-card" data-reveal data-reveal-delay="1" data-attr="manifeste-profil-link">
      <span class="profil-mono">M</span>
      <div>
        <p class="profil-name">Mathieu</p>
        <span class="profil-role">Le Survivant</span>
      </div>
      <span class="profil-link">Lire son histoire</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
/* Pull-quote magazine + profil card éditorial */

.manifeste-grid {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 4rem;
  align-items: start;
}

.manifeste-quote {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: clamp(1.5rem, 2.6vw, 2.05rem);
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: -0.005em;
  color: var(--color-text);
  margin: 0;
  max-width: 32ch;
}
.manifeste-quote::before {
  content: '«';
  font-size: 1.4em;
  color: var(--color-accent);
  display: inline-block;
  margin-right: 0.15em;
  line-height: 0;
  vertical-align: -0.15em;
  font-weight: 600;
}
.manifeste-quote::after {
  content: '»';
  font-size: 1.4em;
  color: var(--color-accent);
  display: inline-block;
  margin-left: 0.05em;
  line-height: 0;
  vertical-align: -0.15em;
  font-weight: 600;
}
.manifeste-quote .accent {
  color: var(--color-accent);
  font-style: italic;
}

.manifeste-byline {
  margin-top: 2rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-muted);
  letter-spacing: 0.05em;
}
.manifeste-byline strong {
  color: var(--color-text);
  font-weight: 700;
}

/* Profil card */
.profil-card {
  border: 1px solid var(--color-hairline-strong);
  background: var(--color-surface);
  padding: 1.75rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
  text-decoration: none;
  color: inherit;
}
.profil-card:hover {
  background: var(--color-surface-2);
  border-color: var(--color-accent);
  transform: translateY(-3px);
}
.profil-mono {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: 4rem;
  font-weight: 500;
  line-height: 1;
  color: var(--color-accent);
  font-style: italic;
}
.profil-name {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}
.profil-role {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--color-muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.profil-link {
  margin-top: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-accent);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
}
.profil-link::after {
  content: '→';
  transition: transform 0.2s ease;
}
.profil-card:hover .profil-link::after {
  transform: translateX(4px);
}

@media (max-width: 800px) {
  .manifeste-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .profil-card {
    max-width: 280px;
    margin: 0 auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .profil-card { transition: none; }
}
</style>
