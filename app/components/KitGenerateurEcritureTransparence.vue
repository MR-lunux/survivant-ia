<!-- app/components/KitGenerateurEcritureTransparence.vue -->
<template>
  <div class="trust-strip" role="note">
    <span class="dot" aria-hidden="true"></span>
    <span class="text">
      <strong>Hébergé Infomaniak Genève</strong>
      <span class="sep" aria-hidden="true">·</span>
      Rien n'est stocké
      <span class="sep" aria-hidden="true">·</span>
      Pas d'entraînement sur tes données
    </span>
    <NuxtLink to="#kit-faq-heading" class="link">Détails</NuxtLink>
  </div>
</template>

<style scoped>
.trust-strip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  margin: 0 0 1.5rem;
  border: 1px solid rgba(108, 227, 181, 0.18);
  background: rgba(108, 227, 181, 0.04);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--color-muted);
  flex-wrap: wrap;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(108, 227, 181, 0.5);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; }
}
.text {
  flex: 1;
  min-width: 0;
  line-height: 1.5;
}
.text strong {
  color: var(--color-text);
  font-weight: 500;
}
.sep {
  margin: 0 0.5rem;
  color: var(--color-dim);
}
.link {
  margin-left: auto;
  color: var(--color-accent);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.68rem;
  white-space: nowrap;
}
.link:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .trust-strip { font-size: 0.66rem; }
  .sep { margin: 0 0.35rem; }
}

@media (prefers-reduced-motion: reduce) {
  .dot { animation: none; }
}
</style>
