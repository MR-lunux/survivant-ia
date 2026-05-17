<!-- app/components/CookieBanner.vue -->
<!-- Bandeau de consentement RGPD + modal personnalisation.
     Voir docs/superpowers/specs/2026-05-16-cookies-ga4-design.md §UX & DA. -->
<script setup lang="ts">
const { state, accept, refuse } = useConsent()

const showModal = ref(false)
const draftAnalytics = ref(false)

// Synchronise le toggle avec l'état courant à chaque ouverture (depuis le bandeau ou depuis le footer/page Cookies).
function openModal() {
  draftAnalytics.value = state.value.analytics === 'granted'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function acceptAll() {
  accept()
  showModal.value = false
}

function refuseAll() {
  refuse()
  showModal.value = false
}

function saveCustom() {
  if (draftAnalytics.value) accept()
  else refuse()
  showModal.value = false
}

const closeButtonRef = ref<HTMLButtonElement | null>(null)

watch(showModal, async (open) => {
  if (open) {
    await nextTick()
    closeButtonRef.value?.focus()
  }
})

onMounted(() => {
  window.addEventListener('open-cookie-settings', openModal)
})
onBeforeUnmount(() => {
  window.removeEventListener('open-cookie-settings', openModal)
})
</script>

<template>
  <div>
    <!-- Bandeau slide-up bas -->
    <Transition name="slide-up">
      <div
        v-if="state.needsChoice && !showModal"
        class="cookie-banner"
        role="dialog"
        aria-labelledby="cookie-banner-kicker"
        aria-describedby="cookie-banner-text"
      >
        <div class="cookie-banner-inner container">
          <div class="cookie-banner-content">
            <svg class="cookie-svg" viewBox="0 0 32 32" aria-hidden="true">
              <!-- Cercle externe avec une encoche bas-droite (cookie croqué). -->
              <path
                d="M16 3 A13 13 0 1 0 28 22 a5 5 0 0 1 -5 -5 a5 5 0 0 1 -5 -5 A6 6 0 0 1 16 3 z"
                fill="none"
                stroke="#6CE3B5"
                stroke-width="1.5"
              />
              <!-- Pépites asymétriques. -->
              <circle cx="11" cy="11" r="1.4" fill="#6CE3B5" fill-opacity="0.6" />
              <circle cx="20" cy="14" r="1.2" fill="#6CE3B5" fill-opacity="0.6" />
              <circle cx="13" cy="20" r="1.6" fill="#6CE3B5" fill-opacity="0.6" />
              <circle cx="19" cy="22" r="1.0" fill="#6CE3B5" fill-opacity="0.6" />
            </svg>
            <div class="cookie-banner-text">
              <KickerLabel id="cookie-banner-kicker">POLITIQUE COOKIES</KickerLabel>
              <p id="cookie-banner-text">
                Ce site utilise des cookies pour mesurer l'audience et améliorer l'expérience.
                <NuxtLink to="/cookies" class="cookie-link">Détails</NuxtLink>
              </p>
            </div>
          </div>
          <div class="cookie-banner-actions">
            <button
              type="button"
              class="cookie-btn cookie-btn-ghost"
              data-attr="cookie-refuse"
              @click="refuseAll"
            >
              Refuser
            </button>
            <button
              type="button"
              class="cookie-btn cookie-btn-outline"
              data-attr="cookie-customize"
              @click="openModal"
            >
              Personnaliser
            </button>
            <button
              type="button"
              class="cookie-btn cookie-btn-primary"
              data-attr="cookie-accept"
              @click="acceptAll"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal personnalisation -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="cookie-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
        tabindex="-1"
        @click.self="closeModal"
        @keydown.esc.stop="closeModal"
      >
        <div class="cookie-modal-card">
          <div class="cookie-modal-header">
            <KickerLabel>PRÉFÉRENCES COOKIES</KickerLabel>
            <h2 id="cookie-modal-title">Vos préférences cookies</h2>
            <button
              ref="closeButtonRef"
              type="button"
              class="cookie-modal-close"
              aria-label="Fermer"
              data-attr="cookie-modal-close"
              @click="closeModal"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </button>
          </div>

          <p class="cookie-modal-intro">
            Vous gardez le contrôle. Vos choix s'appliquent immédiatement et peuvent être modifiés à tout moment.
          </p>

          <div class="cookie-toggle-row cookie-toggle-disabled">
            <div class="cookie-toggle-meta">
              <h3>Cookies essentiels</h3>
              <p>
                Nécessaires au fonctionnement du site : mémorisation de vos choix cookies, indicateur scanner.
                Aucune donnée comportementale.
              </p>
            </div>
            <div class="cookie-toggle-side">
              <div class="cookie-toggle on" aria-hidden="true">
                <span class="cookie-toggle-knob" />
              </div>
              <span class="cookie-toggle-label">Toujours actifs</span>
            </div>
          </div>

          <div class="cookie-toggle-row">
            <div class="cookie-toggle-meta">
              <h3>Mesure d'audience et replays</h3>
              <p>
                Google Analytics 4 (mesure d'audience, attribution Google Ads) et PostHog
                (parcours, enregistrements de sessions, heatmaps). Données pseudonymisées.
                Hébergement : Europe pour PostHog, États-Unis pour Google (transferts encadrés
                par clauses contractuelles types).
              </p>
              <NuxtLink to="/cookies" class="cookie-link">Détail complet sur la page Cookies →</NuxtLink>
            </div>
            <div class="cookie-toggle-side">
              <button
                type="button"
                class="cookie-toggle"
                :class="{ on: draftAnalytics }"
                role="switch"
                :aria-checked="draftAnalytics"
                data-attr="cookie-toggle-analytics"
                @click="draftAnalytics = !draftAnalytics"
              >
                <span class="cookie-toggle-knob" />
              </button>
            </div>
          </div>

          <div class="cookie-modal-footer">
            <button
              type="button"
              class="cookie-btn cookie-btn-ghost"
              data-attr="cookie-modal-cancel"
              @click="closeModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="cookie-btn cookie-btn-primary"
              data-attr="cookie-modal-save"
              @click="saveCustom"
            >
              Enregistrer mes choix
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* === Bandeau === */
.cookie-banner {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 150;
  /* var(--color-surface) #14140F à 95% d'opacité (backdrop-blur exige le canal alpha). */
  background: rgba(20, 20, 15, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-accent);
  padding: 1.25rem 0;
}
.cookie-banner-inner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.cookie-banner-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.cookie-svg {
  width: 32px; height: 32px;
  flex-shrink: 0;
  transition: transform 400ms ease;
}
.cookie-banner:hover .cookie-svg { transform: rotate(4deg); }
.cookie-banner-text p {
  margin: 0.4rem 0 0;
  font-size: 0.85rem;
  color: var(--color-muted);
  line-height: 1.55;
  max-width: 60ch;
}
.cookie-link {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  margin-left: 0.25rem;
}
.cookie-banner-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: nowrap;
}

/* === Boutons === */
.cookie-btn {
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.6rem 1.25rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  background: transparent;
  border: 1px solid transparent;
}
.cookie-btn-ghost {
  border-color: var(--color-rule);
  color: var(--color-muted);
}
.cookie-btn-ghost:hover { color: var(--color-text); border-color: var(--color-muted); }
.cookie-btn-outline {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.cookie-btn-outline:hover { background: var(--color-accent-soft); }
.cookie-btn-primary {
  background: var(--color-accent);
  color: #0F0F0E;
  font-weight: 500;
  border-color: var(--color-accent);
}
.cookie-btn-primary:hover { filter: brightness(1.05); }

/* === Modal === */
.cookie-modal-overlay {
  position: fixed; inset: 0;
  z-index: 160;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.cookie-modal-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-rule);
  border-radius: 2px;
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
}
.cookie-modal-header { position: relative; margin-bottom: 1rem; }
.cookie-modal-header h2 {
  font-size: 1.25rem;
  margin: 0.5rem 0 0;
  color: var(--color-text);
}
.cookie-modal-close {
  position: absolute; top: 0; right: 0;
  background: transparent; border: none; cursor: pointer;
  color: var(--color-muted);
  padding: 0.4rem;
  transition: color 0.15s;
}
.cookie-modal-close:hover { color: var(--color-accent); }
.cookie-modal-intro {
  font-size: 0.85rem;
  color: var(--color-muted);
  line-height: 1.55;
  margin: 0 0 1.5rem;
}

/* === Toggle rows === */
.cookie-toggle-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-rule);
}
.cookie-toggle-meta h3 {
  font-size: 0.95rem;
  color: var(--color-text);
  margin: 0 0 0.4rem;
}
.cookie-toggle-meta p {
  font-size: 0.8rem;
  color: var(--color-muted);
  line-height: 1.55;
  margin: 0 0 0.4rem;
}
.cookie-toggle-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
}
.cookie-toggle-label {
  font-size: 0.7rem;
  color: var(--color-muted-soft);
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.cookie-toggle {
  position: relative;
  width: 36px; height: 20px;
  background: var(--color-rule);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 200ms;
  padding: 0;
}
.cookie-toggle.on { background: var(--color-accent); }
.cookie-toggle-knob {
  position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 200ms;
}
.cookie-toggle.on .cookie-toggle-knob { transform: translateX(16px); }
.cookie-toggle-disabled .cookie-toggle { opacity: 0.4; cursor: not-allowed; }

.cookie-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--color-rule);
  padding-top: 1.5rem;
}

/* === Transitions === */
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 350ms cubic-bezier(.2, .8, .2, 1);
}
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 250ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* === Mobile === */
@media (max-width: 768px) {
  .cookie-banner-inner {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  .cookie-banner-actions {
    flex-direction: column-reverse;
  }
  .cookie-btn {
    width: 100%;
  }
  .cookie-modal-card {
    padding: 1.5rem;
  }
  .cookie-toggle-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .cookie-toggle-side {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active, .slide-up-leave-active, .fade-enter-active, .fade-leave-active,
  .cookie-toggle, .cookie-toggle-knob, .cookie-svg {
    transition: none !important;
  }
  .cookie-banner:hover .cookie-svg { transform: none; }
}
</style>
