<!-- app/pages/confidentialite.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Politique de confidentialité — Survivant de l\'IA',
  description: 'Comment vos données sont collectées et utilisées par Survivant de l\'IA.',
})
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem; max-width: 65ch;">
    <span class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.15em; color: var(--color-muted);">// POLITIQUE DE CONFIDENTIALITÉ</span>
    <h1 style="margin: 0.5rem 0 2.5rem;">Politique de confidentialité</h1>

    <section class="policy-section">
      <h2>Responsable du traitement</h2>
      <p>Mathieu Rérat, <a href="https://survivant-ia.ch">survivant-ia.ch</a><br>
      Contact : <a href="mailto:mathieu@survivant-ia.ch">mathieu@survivant-ia.ch</a></p>
    </section>

    <section class="policy-section">
      <h2>Données collectées</h2>
      <p>Lors de l'inscription à la newsletter, nous collectons :</p>
      <ul>
        <li>Votre adresse email</li>
        <li>Votre prénom</li>
      </ul>
      <p>Aucune autre donnée n'est collectée.</p>
    </section>

    <section class="policy-section">
      <h2>Finalité</h2>
      <p>Ces données sont utilisées uniquement pour l'envoi de la newsletter hebdomadaire <em>Survivant de l'IA</em>. Elles ne sont ni vendues, ni partagées, ni utilisées à d'autres fins.</p>
    </section>

    <section class="policy-section">
      <h2>Sous-traitant</h2>
      <p>Les données sont traitées par <strong>Brevo</strong> (Sendinblue SAS), hébergé dans l'Union européenne, dans le respect du RGPD. <a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener">Politique de confidentialité Brevo ↗</a></p>
    </section>

    <section class="policy-section">
      <h2>Durée de conservation</h2>
      <p>Vos données sont conservées jusqu'à votre désabonnement. Chaque email contient un lien de désabonnement en un clic.</p>
    </section>

    <section class="policy-section">
      <h2>Vos droits</h2>
      <p>Conformément au RGPD et à la loi suisse sur la protection des données (LPD), vous disposez des droits suivants :</p>
      <ul>
        <li>Droit d'accès à vos données</li>
        <li>Droit de rectification</li>
        <li>Droit à l'effacement</li>
        <li>Droit d'opposition au traitement</li>
      </ul>
      <p>Pour exercer ces droits, contactez : <a href="mailto:mathieu@survivant-ia.ch">mathieu@survivant-ia.ch</a></p>
    </section>

    <section class="policy-section">
      <h2>Désabonnement</h2>
      <p>Chaque email contient un lien de désabonnement. Vous pouvez également envoyer une demande à <a href="mailto:mathieu@survivant-ia.ch">mathieu@survivant-ia.ch</a>.</p>
    </section>

    <p class="font-mono" style="font-size: 0.65rem; color: var(--color-muted); margin-top: 3rem;">
      Dernière mise à jour : avril 2026
    </p>
  </div>
</template>

<style scoped>
.policy-section { margin-bottom: 2.5rem; }
.policy-section h2 { font-size: 1rem; margin: 0 0 0.75rem; color: var(--color-accent); }
.policy-section p, .policy-section li { font-size: 0.9rem; color: var(--color-muted); line-height: 1.7; }
.policy-section ul { padding-left: 1.5rem; margin: 0.5rem 0; }
.policy-section li { margin-bottom: 0.25rem; }
</style>
