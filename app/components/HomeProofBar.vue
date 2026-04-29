<!-- app/components/HomeProofBar.vue -->
<template>
  <section class="proof-section" data-reveal>
    <ScannerBorder class="proof-card">
      <div class="proof-grid">
        <!-- Identity block -->
        <div class="proof-identity">
          <div class="proof-avatar" aria-hidden="true">M</div>
          <div class="proof-id-text">
            <p class="proof-name">
              Mathieu Rerat
              <span class="proof-role font-mono">DEPUTY HEAD OF IT</span>
            </p>
            <p class="proof-bio">
              15 ans à voir des métiers évoluer — PwC, Nestlé, Immopac, Solutions&nbsp;&amp;&nbsp;Funds.
              Survivant-IA, c'est la méthode que j'aurais aimé avoir.
            </p>
          </div>
        </div>

        <!-- Career chips -->
        <div class="proof-chips">
          <span class="proof-chip font-mono">PwC</span>
          <span class="proof-chip font-mono">Nestlé</span>
          <span class="proof-chip font-mono">Immopac</span>
          <span class="proof-chip font-mono">Solutions &amp; Funds</span>
        </div>
      </div>

      <NuxtLink to="/identite" class="proof-link font-mono">
        VOIR LE PARCOURS COMPLET →
      </NuxtLink>
    </ScannerBorder>
  </section>
</template>

<style scoped>
.proof-section { padding: 0 0 4rem; }

.proof-card {
  padding: 2rem 2rem 1.5rem;
  background: var(--color-surface);
}

.proof-grid {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.proof-identity {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex: 1;
  min-width: 280px;
}

.proof-avatar {
  width: 56px;
  height: 56px;
  border: 2px solid var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
}

.proof-id-text { flex: 1; min-width: 0; }

.proof-name {
  margin: 0 0 0.4rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.proof-role {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  font-weight: 400;
}
.proof-bio {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-muted);
  max-width: 60ch;
}

.proof-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.proof-chip {
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  border: 1px solid rgba(0, 255, 65, 0.15);
  padding: 0.3rem 0.6rem;
  background: var(--color-surface-2);
}

.proof-link {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: var(--color-muted);
  text-decoration: none;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 255, 65, 0.08);
  width: 100%;
  transition: color 0.15s;
}
.proof-link:hover { color: var(--color-accent); }

@media (max-width: 640px) {
  .proof-card { padding: 1.5rem 1.25rem 1.25rem; }
  .proof-identity { gap: 1rem; }
  .proof-avatar { width: 44px; height: 44px; font-size: 1.2rem; }
}
</style>
