<!-- app/components/KitGenerateurEcritureTransparence.vue -->
<script setup lang="ts">
const expanded = ref(false)
</script>

<template>
  <section class="transparence">
    <div class="kicker">TRANSPARENCE · DONNÉES</div>

    <p class="point">
      Rien n'est sauvé côté Survivant-IA. Tes écritures vivent uniquement
      dans ton navigateur (<code>localStorage</code>). Tu peux tout effacer en un clic.
    </p>

    <p class="point">
      Le texte que tu colles, ou la voix que tu dictes, passe par
      <strong>Infomaniak AI Service</strong>, hébergé dans des datacenters
      Suisses. Tes prompts et données ne servent pas à entraîner les
      modèles tiers, et aucune donnée ne quitte la Suisse.
    </p>

    <p class="point">
      Aucune écriture, aucun email, aucun montant, aucun fichier audio
      n'est stocké sur le site ni ailleurs. PostHog enregistre uniquement
      des événements anonymes (nombre d'utilisations, pas le contenu).
    </p>

    <button
      type="button"
      class="toggle"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="toggle-icon">{{ expanded ? '▲' : '▼' }}</span>
      Comment ça marche techniquement
    </button>

    <div v-if="expanded" class="details">
      <p>
        Flow texte : ton navigateur → survivant-ia.ch (proxy léger) →
        Infomaniak Genève → réponse.
      </p>
      <p>
        Flow voix : ton navigateur → survivant-ia.ch → Infomaniak Whisper
        (batch async) → polling jusqu'à transcription → utilisée comme
        entrée du parsing comptable. Aucune persistance côté serveur.
      </p>
      <p class="links">
        <a href="https://www.infomaniak.com/fr/hebergement/ai-services" target="_blank" rel="noopener">Infomaniak AI Services →</a>
        <span aria-hidden="true">·</span>
        <a href="/rapports" target="_blank" rel="noopener">Article complet (à venir) →</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.transparence {
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1.5rem 1.75rem;
  margin: 2rem 0;
}
.kicker {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 1rem;
}
.point {
  font-size: 0.92rem;
  color: var(--color-text-soft);
  line-height: 1.6;
  margin: 0 0 0.85rem;
}
.point strong { color: var(--color-text); }
.point code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--color-bg);
  padding: 0.1em 0.3em;
  color: var(--color-accent);
}
.toggle {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
  background: transparent;
  border: none;
  padding: 0.4rem 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.toggle:hover { color: var(--color-accent); }
.toggle-icon { font-size: 0.6rem; color: var(--color-accent); }
.details {
  margin-top: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px dashed var(--color-hairline);
}
.details p {
  font-size: 0.88rem;
  color: var(--color-muted);
  line-height: 1.6;
  margin: 0 0 0.5rem;
}
.details .links {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.details .links a { color: var(--color-accent); text-decoration: none; }
.details .links a:hover { text-decoration: underline; }
</style>
