<!-- app/components/HomeSkillsTriad.vue -->
<script setup lang="ts">
const skills = [
  {
    n: '01',
    label: 'PENSÉE CRITIQUE',
    title: 'Formuler le bon problème',
    body: "L'IA répond mieux que la plupart des humains. Mais elle ne comprend pas. Celui qui sait poser le problème — pas juste demander une solution — garde toujours le contrôle.",
  },
  {
    n: '02',
    label: 'RELATION HUMAINE',
    title: "Lire ce qu'un humain ne dit pas",
    body: "Désamorcer un conflit, motiver une équipe, comprendre ce qu'un client veut vraiment derrière ses mots. Aucun modèle de langage ne fait ça. La confiance se construit humain à humain.",
  },
  {
    n: '03',
    label: 'JUGEMENT CONTEXTUEL',
    title: 'Décider en zone grise',
    body: "L'IA optimise. Elle ne raisonne pas en éthique, en contexte politique, en arbitrages d'équipe. Quand le contexte est ambigu, c'est l'humain qui tranche — et c'est lui qu'on paie.",
  },
]
</script>

<template>
  <section class="skills-section" data-reveal>
    <div class="skills-header">
      <span class="skills-kicker font-mono">// 3 COMPÉTENCES IA-PROOF</span>
      <h2 class="section-h2">Les compétences à développer face à l'IA</h2>
      <p class="skills-intro">
        Ce que les modèles de langage ne savent pas faire — et ne sauront pas faire de sitôt.
        Trois axes pour devenir <strong>indispensable</strong>, pas remplaçable.
      </p>
    </div>

    <div class="skills-grid">
      <ScannerBorder
        v-for="(s, i) in skills"
        :key="s.n"
        class="skill-card"
        data-reveal
        :data-reveal-delay="i * 120"
      >
        <span class="skill-n font-mono">{{ s.n }}</span>
        <span class="skill-label font-mono">{{ s.label }}</span>
        <h3 class="skill-title">{{ s.title }}</h3>
        <p class="skill-body">{{ s.body }}</p>
      </ScannerBorder>
    </div>
  </section>
</template>

<style scoped>
.skills-section { padding: 5rem 0; }

.skills-header { margin-bottom: 2.5rem; max-width: 60ch; }
.skills-kicker {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  color: var(--color-accent);
  margin-bottom: 0.75rem;
}
.skills-intro {
  margin: 0;
  font-size: 1rem;
  color: var(--color-muted);
  line-height: 1.7;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  padding: 1.75rem 1.5rem 2rem;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.skill-n {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--color-accent);
}
.skill-label {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: var(--color-muted);
}
.skill-title {
  font-size: 1.1rem;
  margin: 0.25rem 0 0;
  line-height: 1.3;
  color: var(--color-text);
}
.skill-body {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-muted);
}

@media (max-width: 480px) {
  .skill-card { padding: 1.5rem 1.25rem; }
}
</style>
