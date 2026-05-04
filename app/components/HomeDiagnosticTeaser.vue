<!-- app/components/HomeDiagnosticTeaser.vue -->
<script setup lang="ts">
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <section class="diag-section" data-reveal aria-labelledby="diag-heading">

    <div class="diag-header">
      <div class="diag-kicker"><KickerLabel>DIAGNOSTIC IA</KickerLabel></div>
      <h2 id="diag-heading" class="diag-h2">Maîtriser l'IA au travail commence par un diagnostic</h2>
      <p class="diag-lead">Scanne ton métier : diagnostic IA en 10 secondes.</p>
    </div>

    <article class="report" aria-label="Aperçu du rapport d'obsolescence (verrouillé)">

      <div class="rep-field">
        <span class="k font-mono">SUJET</span>
        <span class="arrow font-mono" aria-hidden="true">›</span>
        <span class="v"><span class="awaiting font-mono">en attente d'identification</span></span>
      </div>

      <div class="rep-field">
        <span class="k font-mono">RISQUE</span>
        <span class="arrow font-mono" aria-hidden="true">›</span>
        <span class="v font-mono"><span class="redact" aria-label="valeur masquée">XX</span> / 100</span>
      </div>

      <div class="rep-field">
        <span class="k font-mono">HORIZON</span>
        <span class="arrow font-mono" aria-hidden="true">›</span>
        <span class="v font-mono"><span class="redact" aria-label="valeur masquée">XX</span> ans <span class="hint">( 2 · 5 · 10 )</span></span>
      </div>

      <div class="rep-field">
        <span class="k font-mono">STATUT</span>
        <span class="arrow font-mono" aria-hidden="true">›</span>
        <span class="v font-mono"><span class="redact" aria-label="valeur masquée">EN MUTATION SÉVÈRE</span> <span class="hint">( 1 sur 4 )</span></span>
      </div>

      <div class="cta-zone">
        <NuxtLink
          to="/scanner"
          class="cta font-mono"
          data-attr="teaser-cta-scanner"
          @click="emit('click')"
        >
          <span class="cta-icon" aria-hidden="true">▶</span>
          <span>Lancer le diagnostic</span>
        </NuxtLink>
      </div>

    </article>
  </section>
</template>

<style scoped>
/* ── Section & header ─────────────────────────── */
.diag-section { padding: 0 0 3rem; }

.diag-header {
  max-width: 50ch;
  margin: 0 auto 2.5rem;
  text-align: center;
}
.diag-kicker {
  margin-bottom: 1rem;
}
.diag-h2 {
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  margin-bottom: 1rem;
}
.diag-lead {
  font-size: 1rem;
  color: var(--color-muted);
  line-height: 1.7;
  margin: 0;
}

/* ── Report card ──────────────────────────────── */
.report {
  max-width: 640px;
  margin: 0 auto;
  background: #0A0A0A;
  border: 1px solid rgba(0, 255, 65, 0.3);
  font-family: var(--font-mono);
  color: var(--color-text);
  padding: 2rem 2.25rem 1.75rem;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 80px rgba(0, 255, 65, 0.06),
    0 30px 80px rgba(0, 0, 0, 0.5);
}
/* Scanline texture */
.report::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 2px,
    rgba(0, 255, 65, 0.012) 2px,
    rgba(0, 255, 65, 0.012) 4px
  );
  pointer-events: none;
  z-index: 1;
}
.report > * { position: relative; z-index: 2; }

/* ── Field rows ───────────────────────────────── */
.rep-field {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  padding: 0.55rem 0;
  font-size: 0.92rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.06);
}
.rep-field:last-of-type { border-bottom: none; }

.k {
  color: var(--color-muted);
  min-width: 6.5rem;
  flex-shrink: 0;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}
.arrow { color: var(--color-accent); flex-shrink: 0; font-size: 1rem; }
.v { color: var(--color-text); display: inline-flex; align-items: baseline; gap: 0.35rem; flex-wrap: wrap; }
.hint { color: #555; font-size: 0.75rem; letter-spacing: 0.05em; }

/* ── Awaiting pulse ───────────────────────────── */
.awaiting {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem 0.65rem;
  border: 1px dashed rgba(0, 255, 65, 0.18);
  color: var(--color-accent);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.awaiting::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 6px var(--color-accent);
  flex-shrink: 0;
  animation: led-pulse 1.4s ease-in-out infinite;
}
@keyframes led-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* ── Redaction bars ───────────────────────────── */
.redact {
  display: inline-block;
  position: relative;
  background: #2C2C2C;
  color: transparent;
  user-select: none;
  height: 1.05em;
  line-height: 1.05;
  vertical-align: -0.15em;
  padding: 0 0.4em;
  border-top: 1px solid #383838;
  overflow: hidden;
}
.redact::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 40%,
    rgba(0, 255, 65, 0.18) 50%,
    transparent 60%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: redact-shimmer 9s ease-in-out infinite;
}
@keyframes redact-shimmer {
  0%, 88% { transform: translateX(-100%); opacity: 0; }
  90%      { opacity: 1; }
  99%      { transform: translateX(100%); opacity: 0; }
  100%     { transform: translateX(100%); opacity: 0; }
}
.rep-field:nth-of-type(2) .redact { animation-delay: 0s; }
.rep-field:nth-of-type(3) .redact { animation-delay: 3s; }
.rep-field:nth-of-type(4) .redact { animation-delay: 6s; }

/* ── CTA ──────────────────────────────────────── */
.cta-zone {
  margin-top: 1.5rem;
  padding-top: 1.35rem;
  border-top: 1px solid rgba(0, 255, 65, 0.18);
  text-align: center;
}
.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.05rem 1.85rem;
  background: var(--color-accent);
  color: #0A0A0A;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid var(--color-accent);
  position: relative;
  overflow: hidden;
  transition: background 0.25s ease, color 0.25s ease, letter-spacing 0.25s ease, box-shadow 0.25s ease;
}
.cta-icon { font-size: 0.9em; flex-shrink: 0; }
.cta::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.6s ease;
}
.cta:hover {
  background: transparent;
  color: var(--color-accent);
  letter-spacing: 0.24em;
  box-shadow: 0 0 28px rgba(0, 255, 65, 0.35);
}
.cta:hover::before { left: 110%; }

/* ── Responsive ───────────────────────────────── */
@media (max-width: 600px) {
  .report { padding: 1.5rem 1.25rem 1.25rem; }
  .rep-field {
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;
    padding: 0.5rem 0;
  }
  .k { min-width: 0; }
  .arrow { display: none; }
  .cta { padding: 0.95rem 1.3rem; gap: 0.6rem; font-size: 0.78rem; }
}

@media (prefers-reduced-motion: reduce) {
  .redact::after { animation: none; }
  .awaiting::before { animation: none; opacity: 1; }
}
</style>
