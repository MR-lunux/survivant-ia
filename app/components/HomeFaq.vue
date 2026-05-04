<!-- app/components/HomeFaq.vue -->
<script setup lang="ts">
const faqs = [
  {
    q: "Comment ne pas se faire remplacer par l'IA dans son métier ?",
    a: "Trois leviers concrets : (1) maîtriser ce que l'IA fait mal, la précision du langage, le contexte humain, le jugement ; (2) utiliser l'IA comme un copilote pour automatiser ce qui te ralentit ; (3) renforcer ton relationnel, ta stratégie et ton jugement éthique, c'est là que ta valeur devient irremplaçable. Bref : tu ne luttes pas contre l'IA, tu apprends à t'en servir mieux que les autres.",
  },
  {
    q: "Quelles sont les compétences à développer face à l'IA ?",
    a: "Trois familles : la pensée critique (formuler le bon problème, reconnaître quand l'IA hallucine), la relation humaine (communiquer, désamorcer un conflit, lire une salle), et le jugement contextuel (prendre des décisions en environnement ambigu). Aucune n'est automatisable - toutes se travaillent.",
  },
  {
    q: "Faut-il se former à l'IA même si on n'est pas dans la tech ?",
    a: "Oui - mais pas comme tu l'imagines. Tu n'as pas besoin d'apprendre à coder. Tu dois apprendre à dialoguer avec l'IA : savoir quoi lui demander, comment formuler une contrainte, quand ne pas lui faire confiance. C'est de la maîtrise du langage et du raisonnement, pas de la tech.",
  },
  {
    q: "Comment survivre à l'IA au travail quand on n'a pas de compétences techniques ?",
    a: "En devenant indispensable sur ce que l'IA ne fait pas : décider en contexte ambigu, motiver une équipe, négocier, comprendre ce que veut vraiment un client. La technique se rattrape, la posture humaine non. Survivant-IA t'aide à structurer cette posture, à intégrer l'IA dans ton workflow, et à devenir le salarié qui sait.",
  },
  {
    q: "C'est quoi « prendre le virage de l'IA » concrètement ?",
    a: "C'est passer du statut d'observateur (peur, attente) à celui d'opérateur (j'utilise l'IA, je l'oriente, je l'évalue). Concrètement : intégrer 1 outil IA dans ton flux de travail chaque mois, mesurer ce que tu gagnes, garder le contrôle sur ce qui sort. C'est progressif, pas une révolution.",
  },
  {
    q: "Mon métier va-t-il vraiment être remplacé par l'IA ?",
    a: "Probablement pas en entier. Mais certaines tâches le seront, et certaines deviendront au contraire beaucoup plus précieuses (celles où tu pilotes l'IA au lieu de la subir). Lance le diagnostic Survivant-IA : il croise les rapports 2026 (Tufts, McKinsey, WEF) pour estimer l'impact de l'IA sur ton métier en 10 secondes.",
  },
  {
    q: "Combien de temps me reste-t-il avant que l'IA remplace mon métier ?",
    a: "Variable selon le métier : 2-3 ans pour les tâches répétitives et déjà numérisées (saisie, traduction basique, rédaction standard) ; 5-10 ans pour les tâches d'analyse et de coordination ; quasi jamais pour les tâches qui combinent jugement humain, relation et contexte. Le diagnostic te donne une estimation par métier. Plus tu prends le virage tôt, plus tu deviens celui qui pilote l'IA dans ton équipe, au lieu de la subir.",
  },
  {
    q: "C'est quoi la Fréquence Survivant-IA ?",
    a: "Une newsletter hebdomadaire gratuite : un nouvel article par semaine, 5 minutes de lecture, sans jargon. Concret, terrain, pas de théorie. Et bientôt : des formations approfondies pour ceux qui veulent aller plus loin.",
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
  <section class="faq" aria-labelledby="faq-heading">
    <h2 id="faq-heading" class="faq-h2" data-reveal>
      Questions fréquentes sur <em>l'IA au travail</em>.
    </h2>

    <div class="faq-list" data-reveal data-reveal-delay="1">
      <details v-for="(item, i) in faqs" :key="i" class="faq-item">
        <summary class="faq-q">
          <span class="q-text">{{ item.q }}</span>
          <span class="q-mark" aria-hidden="true">+</span>
        </summary>
        <p class="faq-a">{{ item.a }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
/* ── Section ──────────────────────────────────── */
.faq {
  padding: 2rem 0 3rem;
}

/* ── Heading ──────────────────────────────────── */
.faq-h2 {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-weight: 400;
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.015em;
  margin: 0 0 1.75rem;
  color: var(--color-text);
  max-width: 22ch;
}
.faq-h2 em {
  font-style: italic;
  color: var(--color-accent);
}

/* ── Liste ────────────────────────────────────── */
.faq-list {
  border-top: 1px solid var(--color-rule);
}
.faq-item {
  border-bottom: 1px solid var(--color-rule);
}

.faq-q {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.5rem 0;
  transition: padding-left 0.3s ease;
}
.faq-q::-webkit-details-marker { display: none; }

.q-text {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-style: italic;
  font-weight: 400;
  font-size: 1.2rem;
  color: var(--color-text);
  line-height: 1.3;
  transition: color 0.2s ease;
}
.q-mark {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.3rem;
  color: var(--color-accent);
  flex-shrink: 0;
  transition: transform 0.3s ease;
  line-height: 1;
}
.faq-item[open] .q-mark { transform: rotate(45deg); }
.faq-item:hover .faq-q { padding-left: 0.5rem; }
.faq-item:hover .q-text { color: var(--color-accent); }

.faq-a {
  font-family: var(--font-serif-body);
  font-size: 1rem;
  color: var(--color-muted);
  line-height: 1.7;
  padding: 0 0 1.5rem;
  margin: 0;
  max-width: 65ch;
  animation: faq-fade 0.4s ease-out;
}
@keyframes faq-fade {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 640px) {
  .faq-q       { padding: 1.1rem 0; gap: 1rem; }
  .q-text      { font-size: 1.05rem; }
  .faq-a       { font-size: 0.95rem; }
}

@media (prefers-reduced-motion: reduce) {
  .faq-q, .faq-item, .q-mark { transition: none !important; }
  .faq-a { animation: none !important; }
}
</style>
