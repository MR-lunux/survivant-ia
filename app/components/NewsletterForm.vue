<!-- app/components/NewsletterForm.vue -->
<template>
  <div class="newsletter-form-wrapper scanline">
    <ScannerBorder class="newsletter-inner">
      <div class="nl-header">
        <span class="nl-status font-mono"><span class="nl-dot">●</span> FRÉQUENCE ACTIVE</span>
        <h3 class="nl-title">Rejoindre la Fréquence</h3>
        <p class="nl-subtitle">
          1 rapport de survie par semaine. Les outils concrets que les algorithmes ne peuvent pas te donner.
        </p>
      </div>

      <iframe
        v-if="props.formUrl"
        :src="props.formUrl"
        class="brevo-iframe"
        scrolling="no"
        title="Formulaire d'inscription newsletter"
      />

      <div v-else class="form-placeholder">
        <input
          type="email"
          placeholder="votre@email.com"
          class="email-input"
          aria-label="Adresse email"
          disabled
        />
        <button class="btn-glitch" data-text="REJOINDRE" disabled>
          REJOINDRE
        </button>
        <p class="setup-note font-mono">
          → Configurer Brevo : remplacer formUrl dans ce composant
        </p>
      </div>
    </ScannerBorder>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ formUrl?: string }>(), { formUrl: '' })
</script>

<style scoped>
.newsletter-form-wrapper { padding: 2rem; background: var(--color-surface); }
.newsletter-inner { padding: 2rem; }

.nl-dot { animation: nlBlink 1.2s step-end infinite; }
@keyframes nlBlink { 50% { opacity: 0; } }

.nl-status {
  font-size: 0.65rem; letter-spacing: 0.15em;
  color: var(--color-accent); display: block; margin-bottom: 1rem;
}
.nl-title {
  font-family: var(--font-mono);
  font-size: 1.4rem; color: var(--color-text); margin: 0 0 0.75rem;
}
.nl-subtitle { font-size: 0.9rem; color: var(--color-muted); margin: 0 0 1.5rem; }
.brevo-iframe { width: 100%; min-height: 200px; border: none; background: transparent; }
.form-placeholder { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.email-input {
  flex: 1; min-width: 200px;
  background: var(--color-surface-2);
  border: 1px solid rgba(0, 255, 65, 0.2);
  color: var(--color-text);
  font-family: var(--font-mono); font-size: 0.875rem;
  padding: 0.75rem 1rem; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  opacity: 0.5;
}
.email-input:not(:disabled):focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(0,255,65,0.12), inset 0 0 12px rgba(0,255,65,0.04);
  opacity: 1;
}
.setup-note { width: 100%; font-size: 0.65rem; color: var(--color-danger); margin: 0.5rem 0 0; }
</style>
