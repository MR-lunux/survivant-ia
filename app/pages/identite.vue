<!-- app/pages/identite.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Mathieu Rérat : Qui est derrière Survivant-IA',
  description: 'De PwC à Deputy Head of IT, en passant par Nestlé et la PropTech. Le parcours de Mathieu Rérat et l\'esprit anti-obsolescence derrière Survivant-IA.',
  ogTitle: 'Mathieu Rérat - Identité du Survivant-IA',
  ogDescription: 'Le parcours et l\'esprit derrière Survivant-IA. Concret, sans théorie.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Mathieu Rérat - Identité du Survivant-IA',
  twitterDescription: 'Le parcours derrière Survivant-IA - anti-obsolescence pour les pros.',
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
          description: 'Fondateur de Survivant-IA. Ex-PwC, Nestlé, Immopac. Aide les professionnels à se former à l\'IA pour ne pas se faire remplacer.',
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
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem; max-width: 780px;">
    <Breadcrumbs :items="[{ label: 'Identité' }]" />
    <KickerLabel>IDENTITÉ DU SURVIVANT</KickerLabel>
    <h1 style="margin: 0.5rem 0 3rem;">Qui suis-je ?</h1>

    <ScannerBorder class="identity-card">
      <div class="identity-content">
        <div class="identity-header">
          <div class="identity-avatar">M</div>
          <div>
            <h2 style="margin: 0 0 0.35rem; font-size: 1.25rem; line-height: 1.3;">
              Mathieu <span class="text-accent">le Survivant de l'IA</span>
            </h2>
            <span class="font-mono" style="font-size: 0.65rem; color: var(--color-muted); letter-spacing: 0.1em;">DEPUTY HEAD OF IT · SURVIVANT EN COURS</span>
          </div>
        </div>
      </div>
    </ScannerBorder>

    <div class="identity-text">
      <p>
        Mon parcours n'a rien d'un parcours tech pur : économie, master en systèmes d'information (HEC Lausanne),
        puis PwC en audit IT, Nestlé comme Business Analyst, immopac où je suis passé de consultant
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
        beaucoup - mais je ne construisais plus rien. L'IA faisait, je validais. Ce signal ne m'a
        pas rendu anti-IA. Il m'a rendu <strong class="text-accent">lucide</strong>.
      </p>

      <p>
        Ce site existe pour les professionnels qui voient l'IA arriver sans savoir comment se
        positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais
        aimé avoir et éviter les erreurs que j'ai faites.
      </p>

      <ScannerBorder class="mission-block">
        <p style="margin-bottom: 0.75rem;"><KickerLabel>MISSION</KickerLabel></p>
        <p style="margin: 0; font-size: 1rem;">
          Aider les gens à se préparer <em>avant</em> que l'IA ne prenne leur job - pas à pleurer <em>après</em>.
        </p>
      </ScannerBorder>

      <p>
        Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous,
        avec quelques cartes en main - et les cicatrices pour prouver que j'y suis déjà passé.
      </p>
    </div><!-- end .identity-text -->

    <!-- ── PARCOURS ─────────────────────────────────────── -->
    <div class="parcours-section">
      <p class="parcours-label"><KickerLabel>PARCOURS</KickerLabel></p>
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
          <p class="parcours-company">Immopac</p>
          <p class="parcours-role">Head of Office Romandie</p>
          <p class="parcours-detail font-mono">Consultant → Dev Xyrion → HO</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Solutions &amp; Funds</p>
          <p class="parcours-role">Deputy Head of IT</p>
          <p class="parcours-detail font-mono">En poste</p>
        </ScannerBorder>

      </div>
    </div>

    <!-- ── CTA ──────────────────────────────────────────── -->
    <div class="identite-cta">
      <p style="margin-bottom: 1rem;"><KickerLabel>PROCHAINE ÉTAPE</KickerLabel></p>
      <p class="identite-cta-text">
        Tu traverses la même zone&nbsp;?<br>
        <strong class="text-accent">Rejoins les premiers dans la Fréquence.</strong>
      </p>
      <GlitchButton label="Rejoindre la Fréquence" to="/#newsletter" />
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
  margin-bottom: 1.25rem;
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

/* ── CTA ──────────────────────────────────────────────── */
.identite-cta {
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(0, 255, 65, 0.12);
  text-align: center;
}
.identite-cta-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-muted);
  margin-bottom: 2rem;
}
</style>
