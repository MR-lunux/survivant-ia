<!-- app/pages/frequence.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Rejoindre la Fréquence — Survivant de l\'IA',
  description: '1 rapport de survie par semaine. Les outils concrets pour ne pas se faire remplacer par l\'IA.',
})
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <div class="freq-header">
      <span class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.15em; color: var(--color-muted);">// LA FRÉQUENCE</span>
      <h1>Rejoindre la Fréquence</h1>
      <p class="freq-intro">
        Chaque semaine, un rapport de survie dans votre boîte mail. Concret, actionnable, sans jargon.
        Ce que les algorithmes ne peuvent pas vous apprendre.
      </p>
    </div>

    <div class="freq-content">
      <div class="freq-form">
        <NewsletterForm />
      </div>

      <div class="freq-benefits">
        <ScannerBorder class="benefits-inner">
          <p class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.1em; color: var(--color-muted); margin-bottom: 1.5rem;">// CE QUE VOUS RECEVEZ</p>
          <ul class="benefits-list">
            <li>
              <span class="benefit-icon">▸</span>
              <div>
                <strong>1 outil concret par semaine</strong>
                <p>Pas de théorie. Une technique que vous pouvez appliquer le lendemain.</p>
              </div>
            </li>
            <li>
              <span class="benefit-icon">▸</span>
              <div>
                <strong>Soft skills que l'IA ne remplacera pas</strong>
                <p>Communication, gestion de l'ambiguïté, intelligence émotionnelle.</p>
              </div>
            </li>
            <li>
              <span class="benefit-icon">▸</span>
              <div>
                <strong>Comprendre l'IA sans en avoir peur</strong>
                <p>Ce qu'elle fait vraiment, ses limites, et comment vous positionner.</p>
              </div>
            </li>
          </ul>
        </ScannerBorder>
      </div>
    </div>
  </div>
</template>

<style scoped>
.freq-header { margin-bottom: 3rem; }
.freq-header h1 { margin: 0.5rem 0 1rem; }
.freq-intro { font-size: 1.05rem; color: var(--color-muted); max-width: 55ch; line-height: 1.7; margin: 0; }
.freq-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}
@media (max-width: 768px) {
  .freq-content { grid-template-columns: 1fr; }
}
.benefits-inner { padding: 2rem; background: var(--color-surface); }
.benefits-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.benefits-list li { display: flex; gap: 1rem; }
.benefit-icon { color: var(--color-accent); font-family: var(--font-mono); flex-shrink: 0; margin-top: 0.1rem; }
.benefits-list strong { display: block; color: var(--color-text); margin-bottom: 0.25rem; }
.benefits-list p { font-size: 0.85rem; color: var(--color-muted); margin: 0; }
</style>
