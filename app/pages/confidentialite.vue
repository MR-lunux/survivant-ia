<!-- app/pages/confidentialite.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Politique de confidentialité - Survivant-IA',
  description: 'Comment vos données sont collectées et utilisées par Survivant-IA. RGPD + LPD suisse.',
  robots: 'noindex, follow',
})

defineOgImage(false)
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem; max-width: 65ch;">
    <KickerLabel>POLITIQUE DE CONFIDENTIALITÉ</KickerLabel>
    <h1 style="margin: 0.5rem 0 2.5rem;">Politique de confidentialité</h1>

    <section class="policy-section">
      <h2>Responsable du traitement</h2>
      <p>Mathieu Rérat, <a href="https://survivant-ia.ch">survivant-ia.ch</a><br>
      Contact : <a href="mailto:mathieu@survivant-ia.ch">mathieu@survivant-ia.ch</a></p>
    </section>

    <section class="policy-section">
      <h2>Données collectées</h2>
      <p>Selon votre interaction avec le site, nous collectons :</p>
      <ul>
        <li><strong>Inscription newsletter :</strong> adresse email, prénom</li>
        <li><strong>Mesure d'audience (sous consentement) :</strong> pages visitées, durée de visite, source de trafic, interactions, parcours de navigation, enregistrements de session, adresse IP anonymisée (Google Analytics 4)</li>
        <li><strong>Stockage technique local :</strong> indicateur de consentement cookies, indicateur scanner (voir <em>Stockage local</em> plus bas)</li>
      </ul>
      <p>Les outils de mesure d'audience (Google Analytics 4, PostHog) <strong>ne traitent jamais</strong> votre email ni votre prénom : ces données ne sont envoyées qu'à Brevo, qui gère la newsletter.</p>
    </section>

    <section class="policy-section">
      <h2>Finalité</h2>
      <p>Ces données sont utilisées uniquement pour l'envoi de la newsletter hebdomadaire <em>Survivant de l'IA</em>. Elles ne sont ni vendues, ni partagées, ni utilisées à d'autres fins.</p>
    </section>

    <section class="policy-section">
      <h2>Sous-traitants</h2>
      <p>Vos données sont traitées par les sous-traitants suivants, selon leur finalité :</p>
      <ul>
        <li><strong>Brevo (Sendinblue SAS)</strong> — newsletter, hébergement UE. <a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener">Politique ↗</a></li>
        <li><strong>PostHog Inc.</strong> — mesure d'audience et heatmaps, hébergement UE (Francfort). <a href="https://posthog.com/privacy" target="_blank" rel="noopener">Politique ↗</a></li>
        <li><strong>Google LLC</strong> — Google Analytics 4, hébergement États-Unis avec clauses contractuelles types. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Politique ↗</a></li>
      </ul>
      <p>Détail technique des cookies sur la <NuxtLink to="/cookies">page Cookies</NuxtLink>.</p>
    </section>

    <section class="policy-section">
      <h2>Mesure d'audience</h2>
      <p>Pour comprendre comment le site est utilisé et l'améliorer, nous utilisons deux outils sous votre consentement explicite (bannière à la première visite, modifiable via « Gérer mes cookies » dans le footer ou la <NuxtLink to="/cookies">page Cookies</NuxtLink>) :</p>
      <ul>
        <li><strong>PostHog</strong> (hébergé dans l'Union européenne, à Francfort) : mesure de trafic, analyse de parcours, heatmaps, enregistrements de sessions. Conservation 1 an. <em>Do Not Track</em> respecté automatiquement. <a href="https://posthog.com/privacy" target="_blank" rel="noopener">Politique PostHog ↗</a></li>
        <li><strong>Google Analytics 4</strong> (Google LLC, États-Unis) : mesure d'audience, attribution des sources, préparation d'éventuelles campagnes Google Ads. Transfert hors UE encadré par les clauses contractuelles types (SCC) approuvées par la Commission européenne. IP anonymisée. Conservation 14 mois. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Politique Google ↗</a></li>
      </ul>
      <p><strong>Si vous refusez</strong> : Google Analytics 4 fonctionne en mode anonymisé sans cookie (Google Consent Mode v2, signaux agrégés pour modélisation) ; PostHog repasse en mode anonyme sans cookie ni enregistrement de session.</p>
      <p>Le détail de chaque cookie (nom, durée, finalité) est disponible sur la <NuxtLink to="/cookies">page Cookies</NuxtLink>.</p>
    </section>

    <section class="policy-section">
      <h2>Stockage local (localStorage)</h2>

      <h3>Indicateur consentement cookies</h3>
      <p>
        Lorsque vous validez vos préférences cookies, nous stockons votre choix dans le
        <code>localStorage</code> sous la clé <code>cookie-consent</code>
        (<code>{ analytics, timestamp, version }</code>). Cette donnée ne quitte
        jamais votre navigateur. Elle est renouvelée tous les 13 mois, conformément
        à la recommandation CNIL.
      </p>

      <h3>Indicateur technique du scanner</h3>
      <p>
        Lorsque vous déverrouillez le rapport complet du scanner via votre email,
        nous stockons un indicateur technique (<code>hasUnlockedScanner</code>) dans
        le <code>localStorage</code> de votre navigateur. Cet indicateur ne contient
        aucune donnée personnelle - il sert uniquement à éviter de vous redemander
        votre email lors de visites ultérieures depuis le même navigateur. Vous
        pouvez le supprimer à tout moment via les paramètres de votre navigateur
        (section "Données du site" ou "Stockage local").
      </p>
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
      Dernière mise à jour : mai 2026
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
