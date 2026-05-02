<!-- app/components/HomeSkillsTriad.vue -->
<script setup lang="ts">
const skills = [
  {
    n: '01', verb: 'formule',
    label: 'PENSÉE CRITIQUE',
    title: 'Formuler le bon problème',
    body: "L'IA répond mieux que la plupart des humains. Mais elle ne comprend pas. Celui qui sait poser le problème - pas juste demander une solution - garde toujours le contrôle.",
    delayIn: '0s', delayOut: '2.2s',
  },
  {
    n: '02', verb: 'ressent',
    label: 'RELATION HUMAINE',
    title: "Lire ce qu'un humain ne dit pas",
    body: "Désamorcer un conflit, motiver une équipe, comprendre ce qu'un client veut vraiment derrière ses mots. Aucun modèle de langage ne fait ça. La confiance se construit humain à humain.",
    delayIn: '0.5s', delayOut: '2.7s',
  },
  {
    n: '03', verb: 'tranche',
    label: 'JUGEMENT CONTEXTUEL',
    title: 'Décider en zone grise',
    body: "L'IA optimise. Elle ne raisonne pas en éthique, en contexte politique, en arbitrages d'équipe. Quand le contexte est ambigu, c'est l'humain qui tranche - et c'est lui qu'on paie.",
    delayIn: '1s', delayOut: '3.2s',
  },
  {
    n: '04', verb: 'porte',
    label: 'COMMUNICATION',
    title: "Tenir la parole quand ça compte",
    body: "Une IA rédige. Elle ne défend pas un budget devant un comité, ne porte pas une mauvaise nouvelle à une équipe, ne convainc pas un sceptique en face-à-face. Communiquer engage un corps, un timing, une responsabilité - c'est ça que personne ne délègue à un modèle.",
    delayIn: '1.5s', delayOut: '3.7s',
  },
]
</script>

<template>
  <section class="skills-section" data-reveal aria-labelledby="skills-heading">
    <div class="skills-header">
      <div class="skills-kicker"><KickerLabel>4 COMPÉTENCES IA-PROOF</KickerLabel></div>
      <h2 id="skills-heading" class="skills-h2">Les compétences à développer face à l'IA</h2>
      <p class="skills-intro">
        Ce que les modèles de langage ne savent pas faire - et ne sauront pas faire de sitôt.
        Quatre axes pour devenir <strong>indispensable</strong>, pas remplaçable.
      </p>
    </div>

    <div class="stage" aria-hidden="false">
      <div class="schema">

        <!-- INPUT -->
        <div class="io-node">
          <span class="corner-tag font-mono">// Input</span>
          <p class="io-title font-mono">Une situation réelle</p>
          <p class="io-body">Un client mécontent, une réorg, un brief flou, un arbitrage politique, un signal faible dans une équipe.</p>
        </div>

        <!-- Connector down -->
        <div class="connector-vert" aria-hidden="true" />

        <!-- Skills row -->
        <div class="skills-row">
          <span class="junction junction-tl" aria-hidden="true" />
          <span class="junction junction-tr" aria-hidden="true" />
          <span class="junction junction-bl" aria-hidden="true" />
          <span class="junction junction-br" aria-hidden="true" />

          <div class="skills-grid">
            <article
              v-for="s in skills"
              :key="s.n"
              class="skill"
            >
              <span class="skill-num font-mono" aria-hidden="true">{{ s.n }}</span>
              <span class="verb font-mono" aria-hidden="true">{{ s.verb }}</span>
              <span class="skill-label font-mono">{{ s.label }}</span>
              <h3 class="skill-title">{{ s.title }}</h3>
              <p class="skill-body">{{ s.body }}</p>
              <span class="signal-stub in"  :style="{ '--delay': s.delayIn }"  aria-hidden="true" />
              <span class="signal-stub out" :style="{ '--delay': s.delayOut }" aria-hidden="true" />
            </article>
          </div>
        </div>

        <!-- Connector up -->
        <div class="connector-vert up" aria-hidden="true" />

        <!-- OUTPUT -->
        <div class="io-node is-output">
          <span class="corner-tag font-mono">// Output</span>
          <p class="io-title font-mono">Une décision que l'IA ne peut pas prendre</p>
          <p class="io-body">Ce que personne ne va déléguer à un modèle. Ce qui fait que c'est <em>vous</em> qu'on paie - pas votre prompt.</p>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Section ──────────────────────────────────── */
.skills-section { padding: 5rem 0; }

.skills-header { margin-bottom: 2.5rem; max-width: 60ch; }
.skills-kicker {
  margin-bottom: 0.75rem;
}
.skills-h2 {
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  line-height: 1.25;
  margin: 0 0 1rem;
}
.skills-intro {
  margin: 0;
  font-size: 1rem;
  color: var(--color-muted);
  line-height: 1.7;
}
.skills-intro strong { color: var(--color-text); font-weight: 600; }

/* ── Stage (grid background) ──────────────────── */
.stage {
  position: relative;
  padding: 2rem 0 4rem;
}
.stage::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 90%);
}
.stage > * { position: relative; }

/* ── Schema local vars ────────────────────────── */
.schema {
  --gap: 1.5rem;
  --connector: 3rem;
  --line: rgba(0, 255, 65, 0.35);
  --line-soft: rgba(0, 255, 65, 0.18);
}

/* ── I/O nodes ────────────────────────────────── */
.io-node {
  max-width: 480px;
  margin: 0 auto;
  border: 1px solid var(--line);
  background: rgba(0, 255, 65, 0.03);
  padding: 1.25rem 1.5rem;
  text-align: center;
  position: relative;
}
.io-node.is-output {
  border-color: var(--color-accent);
  background: rgba(0, 255, 65, 0.06);
  box-shadow: 0 0 24px rgba(0, 255, 65, 0.08);
}
.io-node.is-output .io-title { color: var(--color-accent); }

.corner-tag {
  position: absolute;
  top: -0.55rem; left: 1.25rem;
  background: var(--color-bg);
  padding: 0 0.5rem;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: var(--color-accent);
  text-transform: uppercase;
}
.io-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.02em;
  margin: 0 0 0.35rem;
}
.io-body {
  font-size: 0.85rem;
  color: var(--color-muted);
  line-height: 1.5;
  margin: 0;
}

/* ── Vertical connectors ──────────────────────── */
.connector-vert {
  position: relative;
  height: var(--connector);
  margin: 0 auto;
  width: 1px;
}
.connector-vert::before {
  content: '';
  position: absolute;
  left: 50%; top: 0; bottom: 0;
  width: 1px;
  background: var(--line);
  transform: translateX(-50%);
}
.connector-vert::after {
  content: '';
  position: absolute;
  left: 50%; top: -10%;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent);
  transform: translateX(-50%);
  animation: signal-down 4s ease-in-out infinite;
}
.connector-vert.up::after {
  animation: signal-up 4s ease-in-out infinite;
  animation-delay: 2s;
}
@keyframes signal-down {
  0%   { top: -10%; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 110%; opacity: 0; }
}
@keyframes signal-up {
  0%   { top: 110%; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: -10%; opacity: 0; }
}

/* ── Skills row & bus lines ───────────────────── */
.skills-row {
  position: relative;
  padding: var(--connector) 0;
}
.skills-row::before,
.skills-row::after {
  content: '';
  position: absolute;
  left: calc((100% - 3 * var(--gap)) / 8);
  right: calc((100% - 3 * var(--gap)) / 8);
  height: 1px;
  background: var(--line);
}
.skills-row::before { top: 0; }
.skills-row::after  { bottom: 0; }

/* Junction + marks */
.junction {
  position: absolute;
  width: 7px; height: 7px;
  pointer-events: none;
}
.junction::before,
.junction::after {
  content: '';
  position: absolute;
  background: var(--color-accent);
}
.junction::before { left: 0; right: 0; top: 50%; height: 1px; transform: translateY(-50%); }
.junction::after  { top: 0; bottom: 0; left: 50%; width: 1px; transform: translateX(-50%); }

.junction-tl { top: 0;    left: calc((100% - 3 * var(--gap)) / 8);  transform: translate(-50%, -50%); }
.junction-tr { top: 0;    right: calc((100% - 3 * var(--gap)) / 8); transform: translate(50%, -50%); }
.junction-bl { bottom: 0; left: calc((100% - 3 * var(--gap)) / 8);  transform: translate(-50%, 50%); }
.junction-br { bottom: 0; right: calc((100% - 3 * var(--gap)) / 8); transform: translate(50%, 50%); }

/* ── Skills grid ──────────────────────────────── */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap);
  position: relative;
}

/* ── Skill card ───────────────────────────────── */
.skill {
  position: relative;
  padding: 1.75rem 1.25rem 1.5rem;
  border: 1px solid var(--line);
  background: rgba(0, 255, 65, 0.025);
  transition: background 0.25s ease, border-color 0.25s ease;
}
.skill:hover {
  background: rgba(0, 255, 65, 0.05);
  border-color: var(--color-accent);
}
/* Vertical stubs to bus */
.skill::before,
.skill::after {
  content: '';
  position: absolute;
  left: 50%;
  width: 1px;
  background: var(--line);
  transform: translateX(-50%);
}
.skill::before { top: calc(-1 * var(--connector)); height: var(--connector); }
.skill::after  { bottom: calc(-1 * var(--connector)); height: var(--connector); }

.skill-num {
  position: absolute;
  top: -0.55rem; left: 1rem;
  background: var(--color-bg);
  padding: 0 0.5rem;
  font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--color-accent);
}
.verb {
  position: absolute;
  top: calc(-1 * var(--connector) / 2);
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-bg);
  padding: 0.18rem 0.5rem;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  color: var(--color-muted);
  text-transform: uppercase;
  border: 1px solid var(--line-soft);
  white-space: nowrap;
}
.skill-label {
  display: block;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: var(--color-muted);
  margin-bottom: 0.65rem;
}
.skill-title {
  font-family: var(--font-sans);
  font-size: 1.05rem; font-weight: 600;
  color: var(--color-text);
  line-height: 1.3; margin-bottom: 0.65rem;
}
.skill-body {
  font-size: 0.88rem;
  color: var(--color-muted);
  line-height: 1.65;
  margin: 0;
}

/* ── Signal dots ──────────────────────────────── */
.signal-stub {
  position: absolute;
  left: 50%;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent);
  transform: translateX(-50%);
  pointer-events: none;
}
.signal-stub.in {
  top: calc(-1 * var(--connector));
  animation: stub-down 4s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
.signal-stub.out {
  bottom: calc(-1 * var(--connector));
  animation: stub-up 4s ease-in-out infinite;
  animation-delay: var(--delay, 2.2s);
}
@keyframes stub-down {
  0%   { transform: translate(-50%, 0); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translate(-50%, var(--connector)); opacity: 0; }
}
@keyframes stub-up {
  0%   { transform: translate(-50%, 0); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translate(-50%, calc(-1 * var(--connector))); opacity: 0; }
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 900px) {
  .schema { --connector: 2rem; }
  .skills-grid { grid-template-columns: 1fr; gap: var(--connector); }
  .skills-row::before,
  .skills-row::after { display: none; }
  .junction { display: none; }
  .skill::before,
  .skill::after { display: block; height: var(--connector); }
  .skill:first-child::before { display: none; }
  .skill:last-child::after  { display: none; }
  .verb { display: none; }
  .signal-stub { display: none; }
}

@media (max-width: 480px) {
  .skill { padding: 1.5rem 1.25rem; }
  .io-node { padding: 1rem 1.25rem; }
}

@media (prefers-reduced-motion: reduce) {
  .connector-vert::after,
  .signal-stub { display: none; }
}
</style>
