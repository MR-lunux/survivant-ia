<!-- app/components/HomeFaq.vue -->
<script setup lang="ts">
const faqs = [
  {
    q: "Comment ne pas se faire remplacer par l'IA dans son métier ?",
    a: "Trois leviers concrets : (1) maîtriser ce que l'IA fait mal — la précision du langage, le contexte humain, le jugement contextuel ; (2) utiliser l'IA comme outil au lieu de la subir, en automatisant ce qui te ralentit ; (3) renforcer les compétences relationnelles, la stratégie et le jugement éthique — c'est là que la valeur humaine devient irremplaçable.",
  },
  {
    q: "Quelles sont les compétences à développer face à l'IA ?",
    a: "Trois familles : la pensée critique (formuler le bon problème, reconnaître quand l'IA hallucine), la relation humaine (communiquer, désamorcer un conflit, lire une salle), et le jugement contextuel (prendre des décisions en environnement ambigu). Aucune n'est automatisable — toutes se travaillent.",
  },
  {
    q: "Faut-il se former à l'IA même si on n'est pas dans la tech ?",
    a: "Oui — mais pas comme tu l'imagines. Tu n'as pas besoin d'apprendre à coder. Tu dois apprendre à dialoguer avec l'IA : savoir quoi lui demander, comment formuler une contrainte, quand ne pas lui faire confiance. C'est de la maîtrise du langage et du raisonnement, pas de la tech.",
  },
  {
    q: "Comment survivre à l'IA au travail quand on n'a pas de compétences techniques ?",
    a: "En devenant indispensable sur ce que l'IA ne fait pas : décider en contexte ambigu, motiver une équipe, négocier, comprendre ce que veut vraiment un client. La technique se rattrape — la posture humaine non. Survivant-IA t'aide à structurer cette posture.",
  },
  {
    q: "C'est quoi « prendre le virage de l'IA » concrètement ?",
    a: "C'est passer du statut d'observateur (peur, attente) à celui d'opérateur (j'utilise l'IA, je l'oriente, je l'évalue). Concrètement : intégrer 1 outil IA dans ton flux de travail chaque mois, mesurer ce que tu gagnes, garder le contrôle sur ce qui sort. C'est progressif, pas une révolution.",
  },
  {
    q: "Mon métier va-t-il vraiment être remplacé par l'IA ?",
    a: "Probablement pas en entier — mais certaines tâches le seront. Lance le diagnostic Survivant-IA : il croise les données MIT, OCDE et WEF pour estimer ton score d'obsolescence en 10 secondes. Tu sauras quelles tâches sont à risque, et lesquelles deviennent au contraire plus précieuses.",
  },
  {
    q: "Combien de temps me reste-t-il avant que l'IA remplace mon métier ?",
    a: "Variable selon le métier : 2-3 ans pour les tâches répétitives et déjà numérisées (saisie, traduction basique, rédaction standard) ; 5-10 ans pour les tâches d'analyse et de coordination ; quasi jamais pour les tâches qui combinent jugement humain, relation et contexte. Le diagnostic te donne une estimation par métier.",
  },
  {
    q: "C'est quoi la Fréquence Survivant-IA ?",
    a: "Une newsletter hebdomadaire gratuite : 1 rapport de survie par semaine, 5 minutes de lecture, sans jargon. Concret, terrain, pas de théorie. Tu apprends à utiliser l'IA pour devenir indispensable plutôt que remplaçable.",
  },
]

const faqJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
})

useHead({
  script: [{ type: 'application/ld+json', innerHTML: faqJsonLd }],
})
</script>

<template>
  <section class="faq-section" data-reveal>
    <span class="faq-label font-mono">// QUESTIONS FRÉQUENTES</span>
    <h2 class="section-h2">Questions fréquentes sur le remplacement par l'IA</h2>

    <div class="faq-list">
      <details v-for="(item, i) in faqs" :key="i" class="faq-item">
        <summary class="faq-question">
          <span class="faq-q-text">{{ item.q }}</span>
          <span class="faq-q-icon font-mono" aria-hidden="true">+</span>
        </summary>
        <p class="faq-answer">{{ item.a }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.faq-section { padding: 5rem 0; }

.faq-label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  margin-bottom: 0.75rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid rgba(0, 255, 65, 0.12);
}

.faq-item {
  border-bottom: 1px solid rgba(0, 255, 65, 0.12);
  background: var(--color-surface);
  transition: background 0.2s;
}
.faq-item:hover { background: var(--color-surface-2); }
.faq-item[open] { background: var(--color-surface-2); }

.faq-question {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  user-select: none;
}
.faq-question::-webkit-details-marker { display: none; }
.faq-question:hover .faq-q-icon { color: var(--color-accent); }

.faq-q-text { flex: 1; line-height: 1.45; }

.faq-q-icon {
  flex-shrink: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-muted);
  transition: transform 0.2s ease, color 0.15s;
  width: 1.5em;
  text-align: center;
}
.faq-item[open] .faq-q-icon {
  transform: rotate(45deg);
  color: var(--color-accent);
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--color-muted);
  max-width: 75ch;
}

@media (max-width: 640px) {
  .faq-question { padding: 1rem 1.1rem; font-size: 0.95rem; }
  .faq-answer   { padding: 0 1.1rem 1.2rem; font-size: 0.9rem; }
}
</style>
