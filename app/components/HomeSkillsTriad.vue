<!-- app/components/HomeSkillsTriad.vue -->
<script setup lang="ts">
const skills = [
  {
    n: '01',
    label: 'Pensée critique',
    verb: 'Formuler',
    rest: 'le bon problème',
    body: "L'IA répond mieux que la plupart des humains. Mais elle ne comprend pas. Celui qui sait poser le problème - pas juste demander une solution - garde toujours le contrôle.",
  },
  {
    n: '02',
    label: 'Relation humaine',
    verb: 'Lire',
    rest: "ce qu'un humain ne dit pas",
    body: "Désamorcer un conflit, motiver une équipe, comprendre ce qu'un client veut vraiment derrière ses mots. Aucun modèle de langage ne fait ça. La confiance se construit humain à humain.",
  },
  {
    n: '03',
    label: 'Jugement contextuel',
    verb: 'Décider',
    rest: 'en zone grise',
    body: "L'IA optimise. Elle ne raisonne pas en éthique, en contexte politique, en arbitrages d'équipe. Quand le contexte est ambigu, c'est l'humain qui tranche - et c'est lui qu'on paie.",
  },
  {
    n: '04',
    label: 'Communication',
    verb: 'Tenir',
    rest: 'la parole quand ça compte',
    body: "Une IA rédige. Elle ne défend pas un budget devant un comité, ne porte pas une mauvaise nouvelle à une équipe, ne convainc pas un sceptique en face-à-face. Communiquer engage un corps, un timing, une responsabilité - c'est ça que personne ne délègue à un modèle.",
  },
]
</script>

<template>
  <section class="skills" aria-labelledby="skills-heading">
    <div class="skills-head" data-reveal>
      <span class="skills-eyebrow">Quatre compétences IA-proof</span>
      <h2 id="skills-heading" class="skills-h2">
        Devenir <span class="accent">indispensable</span>, pas remplaçable.
      </h2>
      <p class="skills-intro">
        Quatre axes de travail concrets. Ce que les modèles de langage ne savent pas faire - et ne sauront pas faire de sitôt. Ce que <strong>personne ne va déléguer à un modèle</strong>.
      </p>
    </div>

    <div class="skills-list">
      <article
        v-for="(s, i) in skills"
        :key="s.n"
        class="skill-item"
        data-reveal
        :data-reveal-delay="i"
      >
        <span class="skill-num">{{ s.n }}</span>
        <span class="skill-label">{{ s.label }}</span>
        <div class="skill-content">
          <h3 class="skill-title"><em>{{ s.verb }}</em> {{ s.rest }}</h3>
          <p class="skill-body">{{ s.body }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* ── Section ──────────────────────────────────── */
.skills {
  padding: 2rem 0 3rem;
}

/* ── Head ─────────────────────────────────────── */
.skills-head {
  max-width: 64ch;
  margin: 0 auto 2.5rem;
}
.skills-eyebrow {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}
.skills-eyebrow::before {
  content: '';
  width: 28px; height: 1px;
  background: var(--color-accent);
}
.skills-h2 {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 1rem 0 1.25rem;
  color: var(--color-text);
  max-width: 18ch;
}
.skills-h2 .accent {
  color: var(--color-accent);
  font-style: italic;
  font-weight: 400;
}
.skills-intro {
  font-family: var(--font-serif-body);
  font-size: 1.1rem;
  color: var(--color-muted);
  line-height: 1.65;
  max-width: 56ch;
  margin: 0;
}
.skills-intro strong {
  color: var(--color-text);
  font-weight: 500;
}

/* ── Liste éditoriale ─────────────────────────── */
.skills-list {
  border-top: 1px solid var(--color-rule);
}
.skill-item {
  display: grid;
  grid-template-columns: 80px 200px 1fr;
  gap: 2.5rem;
  padding: 2.25rem 0;
  border-bottom: 1px solid var(--color-rule);
  align-items: baseline;
  transition: padding 0.3s ease, background 0.3s ease;
  position: relative;
}
.skill-item::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  width: 0; height: 1px;
  background: var(--color-accent);
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.skill-item:hover {
  padding-left: 1rem;
}
.skill-item:hover::before {
  width: 0.65rem;
}

.skill-num {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: 2.6rem;
  font-weight: 400;
  font-style: italic;
  color: var(--color-accent);
  line-height: 1;
}
.skill-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  line-height: 1.4;
}
.skill-content { max-width: 56ch; }
.skill-title {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: 1.55rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.2;
  margin: 0 0 0.85rem;
  letter-spacing: -0.005em;
}
.skill-title em {
  font-style: italic;
  color: var(--color-accent);
  font-weight: 400;
}
.skill-body {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 1rem;
  line-height: 1.65;
  font-family: var(--font-serif-body);
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 800px) {
  .skill-item {
    grid-template-columns: 60px 1fr;
    gap: 0.75rem 1.5rem;
  }
  .skill-label {
    grid-column: 2;
  }
  .skill-content {
    grid-column: 1 / -1;
    margin-top: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skill-item, .skill-item::before { transition: none !important; }
}
</style>
