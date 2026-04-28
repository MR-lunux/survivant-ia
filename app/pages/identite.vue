<!-- app/pages/identite.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Identité du Survivant — Mathieu le Survivant de l\'IA',
  description: 'Chef de projet IT, papa, et guide pour survivre à l\'IA. Pourquoi ce site existe.',
})
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem; max-width: 780px;">
    <span class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.15em; color: var(--color-muted);">// IDENTITÉ DU SURVIVANT</span>
    <h1 style="margin: 0.5rem 0 3rem;">Qui suis-je ?</h1>

    <ScannerBorder class="identity-card">
      <div class="identity-content">
        <div class="identity-header">
          <div class="identity-avatar">M</div>
          <div>
            <h2 style="margin: 0 0 0.25rem; font-size: 1.2rem;">Mathieu</h2>
            <span class="font-mono" style="font-size: 0.7rem; color: var(--color-accent); letter-spacing: 0.1em;">DEPUTY HEAD OF IT — SURVIVANT EN COURS</span>
          </div>
        </div>
      </div>
    </ScannerBorder>

    <div class="identity-text">
      <p>
        Mon parcours n'a rien d'un parcours tech pur : économie, master en systèmes d'information,
        puis PwC en audit IT, Nestlé comme Business Analyst, Imopac où je suis passé de consultant
        à Head of Office Romandie, et aujourd'hui Deputy Head of IT chez Solutions&nbsp;&amp;&nbsp;Funds.
        Des environnements différents, un fil rouge : être l'interface entre les gens, les process,
        et les outils.
      </p>

      <p>
        Quand l'IA s'est invitée dans mon quotidien, j'ai plongé. Claude, ChatGPT, automatisations,
        code... Je lis les articles, j'écoute les podcasts, je teste. Pendant un moment, j'ai cru
        que plus j'en utilisais, mieux je travaillais.
      </p>

      <p>
        Jusqu'au jour où j'ai réalisé que je n'avais plus la notion de l'effort. Je produisais vite,
        beaucoup — mais je ne construisais plus rien. L'IA faisait, je validais. Ce signal ne m'a
        pas rendu anti-IA. Il m'a rendu <strong class="text-accent">lucide</strong>.
      </p>

      <p>
        Ce site existe pour les professionnels qui voient l'IA arriver sans savoir comment se
        positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais
        aimé avoir — et éviter les erreurs que j'ai faites.
      </p>

      <ScannerBorder class="mission-block">
        <p class="font-mono" style="font-size: 0.7rem; color: var(--color-muted); margin-bottom: 0.75rem; letter-spacing: 0.1em;">// MISSION</p>
        <p style="margin: 0; font-size: 1rem;">
          Aider les gens à se préparer <em>avant</em> que l'IA ne prenne leur job — pas à pleurer <em>après</em>.
        </p>
      </ScannerBorder>

      <p>
        Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous,
        avec quelques cartes en main — et les cicatrices pour prouver que j'y suis déjà passé.
      </p>
    </div><!-- end .identity-text -->

    <!-- ── PARCOURS ─────────────────────────────────────── -->
    <div class="parcours-section">
      <p class="font-mono parcours-label">// PARCOURS</p>
      <div class="parcours-grid">

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">PwC</p>
          <p class="parcours-role">Audit IT</p>
          <p class="parcours-detail font-mono">Stage</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Nestlé</p>
          <p class="parcours-role">Business Analyst</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Imopac</p>
          <p class="parcours-role">Head of Office Romandie</p>
          <p class="parcours-detail font-mono">Consultant → Dev Xyrion → HO</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Solutions & Funds</p>
          <p class="parcours-role">Deputy Head of IT</p>
          <p class="parcours-detail font-mono">En poste</p>
        </ScannerBorder>

      </div>
    </div>
  </div><!-- end .container -->
</template>

<style scoped>
.identity-card { padding: 2rem; background: var(--color-surface); margin-bottom: 3rem; }
.identity-header { display: flex; align-items: center; gap: 1.5rem; }
.identity-avatar {
  width: 56px; height: 56px;
  border: 2px solid var(--color-accent);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
}
.identity-text p {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-muted);
  margin-bottom: 1.5rem;
}
.mission-block {
  padding: 1.5rem;
  background: var(--color-surface);
  margin: 2rem 0;
}
@media (max-width: 640px) {
  .identity-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .identity-card { padding: 1.25rem; }
}

/* ── Parcours ─────────────────────────────────────────── */
.parcours-section { margin-top: 3rem; }
.parcours-label {
  font-size: 0.65rem; letter-spacing: 0.15em;
  color: var(--color-muted); margin-bottom: 1.25rem;
}
.parcours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}
.parcours-card {
  padding: 1.25rem 1rem;
  background: var(--color-surface);
}
.parcours-company {
  font-family: var(--font-mono);
  font-size: 0.8rem; font-weight: 700;
  color: var(--color-accent);
  margin: 0 0 0.35rem;
  letter-spacing: 0.05em;
}
.parcours-role {
  font-size: 0.85rem;
  color: var(--color-text);
  margin: 0 0 0.35rem;
  line-height: 1.4;
}
.parcours-detail {
  font-size: 0.65rem;
  color: var(--color-muted);
  margin: 0;
  letter-spacing: 0.08em;
}
</style>
