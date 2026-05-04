<!-- app/components/HomeMastheadTrajectoire.vue -->
<template>
  <section class="trajectoire" aria-label="Trajectoire éditoriale">
    <div class="container">
      <p class="trajectoire-line">
        <span class="trajectoire-segment">Un nouvel article chaque semaine</span>
        <span class="trajectoire-sep" aria-hidden="true">·</span>
        <span class="trajectoire-segment">Formations approfondies pour aller plus loin <span class="trajectoire-soon">(bientôt)</span></span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.trajectoire {
  border-top: 1px solid var(--color-rule);
  border-bottom: 1px solid var(--color-rule);
  padding: 1.6rem 0;
  background: var(--color-bg);
}

.trajectoire-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.6rem 1.1rem;
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text);
  text-align: center;
}

.trajectoire-segment {
  white-space: nowrap;
}

.trajectoire-sep {
  color: var(--color-accent);
  font-weight: 400;
}

.trajectoire-soon {
  color: var(--color-muted);
  font-weight: 500;
  letter-spacing: 0.1em;
}

@media (max-width: 600px) {
  .trajectoire { padding: 1.25rem 0; }
  .trajectoire-line {
    font-size: 0.68rem;
    gap: 0.4rem 0.8rem;
  }
  .trajectoire-segment { white-space: normal; }
  .trajectoire-sep { display: none; }
}
</style>
