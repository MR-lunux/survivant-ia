<!-- app/pages/cookies.vue -->
<!-- Détail RGPD/LPD des cookies et traceurs.
     Voir docs/superpowers/specs/2026-05-16-cookies-ga4-design.md §UX & DA. -->
<script setup lang="ts">
useSeoMeta({
  title: 'Cookies et traceurs - Survivant-IA',
  description: 'Détail des cookies et traceurs utilisés sur survivant-ia.ch, conformément au RGPD et à la LPD suisse.',
  robots: 'noindex, follow',
})

defineOgImage(false)

function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cookie-settings'))
  }
}
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem; max-width: 65ch;">
    <KickerLabel>POLITIQUE COOKIES</KickerLabel>
    <h1 class="cookies-h1">Cookies et <em>traceurs</em></h1>

    <section class="policy-section">
      <h2>Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie est un petit fichier déposé sur votre appareil par un site internet pour mémoriser
        des informations entre vos visites. Certains sont indispensables au fonctionnement du site,
        d'autres permettent de mesurer l'audience ou de personnaliser l'expérience.
      </p>
    </section>

    <section class="policy-section">
      <h2>Cookies essentiels</h2>
      <p>Toujours actifs. Aucune donnée comportementale n'est collectée.</p>

      <div class="cookie-detail">
        <h3>cookie-consent</h3>
        <ul>
          <li><strong>Type :</strong> localStorage</li>
          <li><strong>Finalité :</strong> Mémoriser votre choix de consentement aux cookies analytiques</li>
          <li><strong>Durée :</strong> 13 mois (renouvellement automatique conforme CNIL), ou jusqu'à effacement manuel</li>
          <li><strong>Éditeur :</strong> Survivant-IA</li>
        </ul>
      </div>

      <div class="cookie-detail">
        <h3>hasUnlockedScanner</h3>
        <ul>
          <li><strong>Type :</strong> localStorage</li>
          <li><strong>Finalité :</strong> Mémoriser que vous avez déverrouillé le rapport complet du scanner (éviter de redemander votre email)</li>
          <li><strong>Durée :</strong> Permanent, jusqu'à effacement manuel</li>
          <li><strong>Éditeur :</strong> Survivant-IA</li>
        </ul>
      </div>
    </section>

    <section class="policy-section">
      <h2>Mesure d'audience (consentement requis)</h2>
      <p>
        Ces cookies ne sont déposés que si vous acceptez via la bannière. Si vous refusez, les outils
        ci-dessous fonctionnent en mode anonymisé sans cookie.
      </p>

      <div class="cookie-detail">
        <h3>Google Analytics 4</h3>
        <ul>
          <li><strong>Noms :</strong> <code>_ga</code>, <code>_ga_KTGGEP09JY</code></li>
          <li><strong>Finalité :</strong> Mesure d'audience, attribution des sources de trafic, préparation d'éventuelles campagnes Google Ads</li>
          <li><strong>Durée :</strong> 13 mois (renouvellement de consentement)</li>
          <li><strong>Éditeur :</strong> Google LLC (États-Unis)</li>
          <li><strong>Transfert hors UE :</strong> Oui, États-Unis, encadré par les clauses contractuelles types (SCC) approuvées par la Commission européenne</li>
          <li><strong>Anonymisation :</strong> IP anonymisée (paramètre <code>anonymize_ip</code> actif)</li>
          <li><strong>Do Not Track :</strong> Non respecté nativement par Google. Votre choix dans la bannière prime.</li>
          <li><strong>Si vous refusez :</strong> Google Consent Mode v2 envoie des signaux agrégés sans cookie pour la modélisation d'attribution. Aucune identification individuelle.</li>
          <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Politique de confidentialité Google ↗</a></li>
        </ul>
      </div>

      <div class="cookie-detail">
        <h3>PostHog</h3>
        <ul>
          <li><strong>Noms :</strong> cookies <code>ph_*</code> (préfixe variable)</li>
          <li><strong>Finalité :</strong> Mesure d'audience, analyse de parcours, heatmaps, enregistrements de sessions</li>
          <li><strong>Durée :</strong> 1 an</li>
          <li><strong>Éditeur :</strong> PostHog Inc.</li>
          <li><strong>Hébergement :</strong> Union européenne (Francfort)</li>
          <li><strong>Do Not Track :</strong> Respecté automatiquement (PostHog ne capture rien si DNT est actif)</li>
          <li><strong>Si vous refusez :</strong> PostHog repasse en mode anonyme sans cookie ni enregistrement de session (mesure d'audience agrégée uniquement)</li>
          <li><a href="https://posthog.com/privacy" target="_blank" rel="noopener">Politique de confidentialité PostHog ↗</a></li>
        </ul>
      </div>
    </section>

    <section class="policy-section">
      <h2>Cookies marketing</h2>
      <p><em>Aucun cookie marketing n'est actuellement utilisé sur ce site.</em></p>
      <p style="font-size: 0.85rem;">
        Si nous activons des services publicitaires à l'avenir (par exemple Google Ads conversion tracking),
        cette section sera mise à jour et un nouveau consentement vous sera demandé.
      </p>
    </section>

    <section class="policy-section">
      <h2>Gérer mes préférences</h2>
      <p>Vous pouvez modifier votre choix à tout moment.</p>
      <button
        type="button"
        class="cookies-manage-btn"
        data-attr="cookies-page-manage"
        @click="openCookieSettings"
      >
        Gérer mes cookies
      </button>
    </section>

    <section class="policy-section">
      <h2>Vos droits (RGPD + LPD suisse)</h2>
      <ul>
        <li>Droit d'accès à vos données</li>
        <li>Droit de rectification</li>
        <li>Droit à l'effacement</li>
        <li>Droit à la limitation du traitement</li>
        <li>Droit d'opposition</li>
        <li>Droit à la portabilité</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez :
        <a href="mailto:mathieu@survivant-ia.ch">mathieu@survivant-ia.ch</a>.
      </p>
    </section>

    <section class="policy-section">
      <h2>Limite technique</h2>
      <p>
        Si vous révoquez votre consentement après avoir accepté, les cookies déjà déposés ne sont
        pas automatiquement effacés (limitation technique). Vous pouvez les supprimer manuellement
        via les paramètres de votre navigateur (section « Données du site »).
      </p>
    </section>

    <p class="font-mono" style="font-size: 0.65rem; color: var(--color-muted); margin-top: 3rem;">
      Dernière mise à jour : mai 2026
    </p>
  </div>
</template>

<style scoped>
.cookies-h1 { margin: 0.5rem 0 2.5rem; }
.cookies-h1 em {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: var(--color-accent);
  font-weight: 500;
}
.policy-section { margin-bottom: 2.5rem; }
.policy-section h2 {
  font-size: 1rem;
  margin: 0 0 0.75rem;
  color: var(--color-accent);
}
.policy-section h3 {
  font-size: 0.95rem;
  margin: 1rem 0 0.4rem;
  color: var(--color-text);
}
.policy-section p, .policy-section li {
  font-size: 0.9rem;
  color: var(--color-muted);
  line-height: 1.7;
}
.policy-section ul { padding-left: 1.5rem; margin: 0.5rem 0; }
.policy-section li { margin-bottom: 0.25rem; }
.policy-section code {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  background: var(--color-surface-2);
  padding: 0.1rem 0.3rem;
  border-radius: 2px;
}
.cookie-detail {
  margin: 1.5rem 0;
  padding-left: 1rem;
  border-left: 2px solid var(--color-rule);
}
.cookies-manage-btn {
  background: var(--color-accent);
  color: #0F0F0E;
  font-weight: 500;
  border: 1px solid var(--color-accent);
  border-radius: 2px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: filter 0.15s;
  margin-top: 0.5rem;
}
.cookies-manage-btn:hover { filter: brightness(1.05); }
</style>
