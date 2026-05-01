<!-- app/components/SourcesModal.vue -->
<script setup lang="ts">
import { computed, watch, nextTick, onBeforeUnmount, ref } from 'vue'
import type { Job } from '~/data/jobs'
import {
  getSourcesByIds,
  getSourcesByCategory,
} from '~/data/sources'

const props = defineProps<{
  open: boolean
  job: Job | null
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const dialogRef = ref<HTMLDivElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
const previousActive = ref<HTMLElement | null>(null)

const contextualSources = computed(() => {
  if (!props.job || props.job.sources.length === 0) return []
  return getSourcesByIds(props.job.sources)
})

const groupedCatalog = computed(() => getSourcesByCategory())

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(() => props.open, async (isOpen) => {
  if (typeof window === 'undefined') return
  if (isOpen) {
    previousActive.value = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    closeBtnRef.value?.focus()
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
    previousActive.value?.focus?.()
    previousActive.value = null
  }
})

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) emit('close')
}

// Defensive: if the parent unmounts while the modal is open, restore body scroll
// and remove the global keydown listener so they don't leak across route changes.
onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        ref="dialogRef"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sources-modal-title"
        @click="onBackdropClick"
      >
        <div class="modal-panel font-mono" @click.stop>
          <header class="modal-header">
            <span id="sources-modal-title" class="modal-title"><KickerLabel>SOURCES</KickerLabel></span>
            <button
              ref="closeBtnRef"
              type="button"
              class="modal-close"
              aria-label="Fermer"
              @click="emit('close')"
            >✕</button>
          </header>

          <div class="modal-body">
            <!-- Contextual: only if job has explicit sources -->
            <section v-if="contextualSources.length > 0" class="sources-section">
              <h3 class="sources-section-title">▸ Sources de ton résultat</h3>
              <ul class="sources-list">
                <li v-for="src in contextualSources" :key="src.id" class="source-item source-item--highlight">
                  <a :href="src.url" target="_blank" rel="noopener noreferrer" class="source-link">
                    <div class="source-id">[{{ src.id }}]</div>
                    <div class="source-content">
                      <div class="source-title">{{ src.title }} <span class="source-arrow">↗</span></div>
                      <div class="source-meta">{{ src.author }} · {{ src.year }}</div>
                      <div class="source-context">{{ src.context }}</div>
                    </div>
                  </a>
                </li>
              </ul>
            </section>

            <section class="sources-section">
              <h3 class="sources-section-title">▸ Toutes les sources de l'analyse</h3>
              <p v-if="contextualSources.length === 0" class="sources-intro">
                Cette analyse repose sur les sources suivantes.
              </p>

              <div v-for="group in groupedCatalog" :key="group.category" class="sources-group">
                <h4 class="sources-group-title">── {{ group.label }} ──</h4>
                <ul class="sources-list">
                  <li v-for="src in group.sources" :key="src.id" class="source-item">
                    <a :href="src.url" target="_blank" rel="noopener noreferrer" class="source-link">
                      <div class="source-id">[{{ src.id }}]</div>
                      <div class="source-content">
                        <div class="source-title">{{ src.title }} <span class="source-arrow">↗</span></div>
                        <div class="source-meta">{{ src.author }} · {{ src.year }}</div>
                        <div class="source-context">{{ src.context }}</div>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 4rem 1rem 2rem;
  overflow-y: auto;
}
.modal-panel {
  background: var(--color-surface);
  border: 1px solid rgba(0, 255, 65, 0.18);
  width: 100%;
  max-width: 720px;
  max-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.12);
  position: sticky;
  top: 0;
  background: var(--color-surface);
  z-index: 1;
}
.modal-title {
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  color: var(--color-text);
}
.modal-close {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
.modal-close:hover { color: var(--color-text); }

.modal-body {
  overflow-y: auto;
  padding: 1.25rem;
}
.sources-section { margin-bottom: 2rem; }
.sources-section:last-child { margin-bottom: 0; }
.sources-section-title {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  margin: 0 0 1rem;
  text-transform: uppercase;
}
.sources-intro {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-bottom: 1rem;
}
.sources-group { margin-bottom: 1.5rem; }
.sources-group-title {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  margin: 0 0 0.75rem;
}
.sources-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}
.source-item {
  background: var(--color-surface-2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.source-item--highlight {
  border-color: rgba(0, 255, 65, 0.3);
}
.source-link {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
}
.source-link:hover { background: rgba(0, 255, 65, 0.04); }
.source-id {
  font-size: 0.75rem;
  color: var(--color-accent);
  flex-shrink: 0;
  min-width: 2.5rem;
}
.source-content { flex: 1; min-width: 0; }
.source-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;
  margin-bottom: 0.25rem;
}
.source-arrow {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-left: 0.25rem;
}
.source-meta {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 0.4rem;
}
.source-context {
  font-size: 0.78rem;
  color: rgba(224, 224, 224, 0.75);
  line-height: 1.45;
}

/* Mobile bottom-sheet */
@media (max-width: 640px) {
  .modal-backdrop { padding: 0; align-items: flex-end; }
  .modal-panel {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 0;
  }
}

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
