<!-- app/components/KitAmelioreTonPromptOutput.vue -->
<script setup lang="ts">
import KitAmelioreTonPromptField from './KitAmelioreTonPromptField.vue'

interface Structured {
  role: string
  task: string
  format: string
  context: string | null
  constraints: string | null
  examples: string | null
}

const props = defineProps<{
  state: 'idle' | 'loading' | 'success' | 'error'
  structured: Structured | null
  additions: string[]
  alreadySolid: boolean
}>()

const emit = defineEmits<{
  (e: 'copied', payload: { chars: number; had_optional_fields: boolean }): void
  (e: 'structure-expanded'): void
}>()

const FIELD_KEYS = ['role', 'task', 'format', 'context', 'constraints', 'examples'] as const

const FIELDS_META = {
  role: { label: 'RÔLE', peda: 'Donne à l\'IA un point de vue. Sans rôle, elle répond en général ; avec rôle, elle répond comme un spécialiste.', example: 'Tu es un expert RH suisse senior, habitué aux entretiens annuels en PME.' },
  task: { label: 'TÂCHE', peda: 'Dis ce qu\'il faut faire, précisément. « Fais une synthèse » ≠ « Liste les 3 points clés en 1 phrase chacun ».', example: 'Rédige un mail de relance professionnel pour un client qui n\'a pas répondu depuis 2 semaines.' },
  format: { label: 'FORMAT DE SORTIE', peda: 'Précise la forme : longueur, structure, ton, langue. « 1 paragraphe », « 5 bullets », « 150 mots max ».', example: 'Mail court (max 120 mots), ton cordial mais ferme, signature « Cordialement, [Prénom] ».' },
  context: { label: 'CONTEXTE', peda: 'Donne-lui la matière première : ce que tu as, ce qui s\'est passé, ce qu\'elle doit savoir avant de répondre.', example: 'Client = PME industrielle, contrat signé il y a 6 mois. Première relance restée sans réponse.' },
  constraints: { label: 'CONTRAINTES', peda: 'Liste ce qu\'elle ne doit PAS faire. Souvent plus puissant que dire ce qu\'elle doit faire.', example: 'N\'utilise pas de superlatifs marketing. Ne mentionne pas le prix. Ne propose pas d\'appel.' },
  examples: { label: 'EXEMPLES', peda: 'Montre-lui 1 ou 2 exemples concrets. C\'est souvent ce qui sépare une réponse moyenne d\'une bonne réponse.', example: 'Ton souhaité : « Bonjour, je reviens vers vous concernant… » ; à éviter : « J\'espère que vous allez bien ! »' },
} as const

function fieldValue(field: keyof Structured): string | null {
  if (!props.structured) return null
  return props.structured[field]
}

const structureExpanded = ref(false)
function toggleStructure() {
  const newState = !structureExpanded.value
  structureExpanded.value = newState
  if (newState) emit('structure-expanded')
}

const blockCopy = computed(() => {
  if (!props.structured) return ''
  const s = props.structured
  const parts: string[] = []
  parts.push(`RÔLE : ${s.role}`)
  if (s.context) parts.push(`CONTEXTE : ${s.context}`)
  parts.push(`TÂCHE : ${s.task}`)
  parts.push(`FORMAT DE SORTIE : ${s.format}`)
  if (s.constraints) parts.push(`CONTRAINTES : ${s.constraints}`)
  if (s.examples) parts.push(`EXEMPLES : ${s.examples}`)
  return parts.join('\n\n')
})

const copyState = ref<'idle' | 'copied'>('idle')

async function onCopy() {
  if (!blockCopy.value) return
  try {
    await navigator.clipboard.writeText(blockCopy.value)
    copyState.value = 'copied'
    setTimeout(() => { copyState.value = 'idle' }, 2000)
    const hadOptional = !!(props.structured?.context || props.structured?.constraints || props.structured?.examples)
    emit('copied', { chars: blockCopy.value.length, had_optional_fields: hadOptional })
  } catch (err) {
    console.warn('[ameliorer-prompt] clipboard failed:', err)
  }
}
</script>

<template>
  <section v-if="state !== 'idle'" class="ko" :data-state="state">
    <!-- Loading -->
    <div v-if="state === 'loading'" class="ko-loading" role="status" aria-live="polite">
      <span class="ko-loading-dot" aria-hidden="true" />
      <span class="ko-loading-text">L'IA structure ton prompt…</span>
    </div>

    <!-- Success -->
    <template v-if="state === 'success' && structured">
      <div class="ko-block-wrap">
        <span class="ko-label">LE PROMPT AMÉLIORÉ</span>
        <p v-if="alreadySolid" class="ko-solid">
          Ton prompt était déjà solide. J'ai juste resserré la formulation.
        </p>
        <pre class="ko-block">{{ blockCopy }}</pre>
        <div class="ko-block-actions">
          <button type="button" class="ko-copy" @click="onCopy">
            {{ copyState === 'copied' ? 'Copié !' : 'Copier le prompt amélioré' }}
          </button>
        </div>
      </div>

      <!-- Warning : vérifier données sensibles avant utilisation ailleurs -->
      <aside class="ko-warning" role="note">
        <span class="ko-warning-label">AVANT DE LE COLLER AILLEURS</span>
        <p class="ko-warning-text">
          Vérifie qu'il ne contient pas de données sensibles (noms de clients, infos confidentielles, secrets pros). Ici on respecte RGPD/LPD : Infomaniak Suisse, aucun stockage, aucun entraînement sur tes prompts. Mais l'IA où tu colleras ce prompt (ChatGPT, Claude, Gemini, etc.) n'offre pas forcément les mêmes garanties.
        </p>
      </aside>

      <!-- Collapsible : comment c'est structuré -->
      <div class="ko-collapsible">
        <button
          type="button"
          class="ko-collapsible-toggle"
          :aria-expanded="structureExpanded"
          @click="toggleStructure"
        >
          <span class="ko-chevron" :data-open="structureExpanded" aria-hidden="true">›</span>
          {{ structureExpanded ? 'Masquer' : 'Voir' }} comment ce prompt a été structuré
        </button>
        <div v-if="structureExpanded" class="ko-collapsible-content">
          <template v-for="field in FIELD_KEYS" :key="field">
            <KitAmelioreTonPromptField
              v-if="fieldValue(field) != null"
              :field-key="field"
              :label="FIELDS_META[field].label"
              :peda-text="FIELDS_META[field].peda"
              :placeholder-example="FIELDS_META[field].example"
              :value="fieldValue(field)"
              state="success"
            />
          </template>
        </div>
      </div>

      <!-- Ce que l'IA a ajouté -->
      <div v-if="additions.length > 0 && !alreadySolid" class="ko-additions">
        <span class="ko-additions-label">CE QUE L'IA A AJOUTÉ</span>
        <ul class="ko-add-list">
          <li v-for="(add, idx) in additions" :key="idx" class="ko-add-item">
            {{ add }}
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<style scoped>
.ko {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

/* Loading state */
.ko-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
  padding: 1.25rem 0;
}
.ko-loading-dot {
  width: 0.6rem;
  height: 0.6rem;
  background: var(--color-accent);
  border-radius: 50%;
  animation: ko-pulse 1.2s ease-in-out infinite;
}
@keyframes ko-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.15); }
}

/* Block view */
.ko-block-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  animation: ko-fadein 280ms ease-out both;
}

.ko-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.ko-solid {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--color-accent);
  margin: 0;
}

.ko-block {
  font-family: var(--font-sans);
  font-size: 0.96rem;
  line-height: 1.65;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  padding: 1.5rem 1.75rem;
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  max-height: 60vh;
  overflow-y: auto;
}

.ko-block-actions {
  display: flex;
  justify-content: flex-end;
}

.ko-copy {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-bg);
  padding: 0.95rem 1.75rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.ko-copy:hover { opacity: 0.85; }

/* Warning RGPD/LPD */
.ko-warning {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-left: 2px solid var(--color-warn, #ffb84d);
  background: color-mix(in oklab, var(--color-surface) 92%, var(--color-warn, #ffb84d));
  padding: 1.25rem 1.5rem;
}
.ko-warning-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-warn, #ffb84d);
}
.ko-warning-text {
  font-family: var(--font-sans);
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--color-text-soft);
  margin: 0;
}

/* Collapsible */
.ko-collapsible {
  border-top: 1px solid var(--color-rule);
  padding-top: 1.5rem;
}
.ko-collapsible-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
  padding: 0.5rem 0;
  transition: color 0.2s ease;
}
.ko-collapsible-toggle:hover { color: var(--color-accent); }

.ko-chevron {
  display: inline-block;
  font-size: 1rem;
  transition: transform 0.2s ease;
}
.ko-chevron[data-open="true"] {
  transform: rotate(90deg);
}

.ko-collapsible-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  animation: ko-fadein 220ms ease-out both;
}

/* Additions */
.ko-additions {
  border: 1px solid var(--color-accent);
  background: color-mix(in oklab, var(--color-surface) 88%, var(--color-accent));
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: ko-fadein 320ms ease-out 100ms both;
}

.ko-additions-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.ko-add-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.ko-add-item {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text);
  padding-left: 1rem;
  position: relative;
}
.ko-add-item::before {
  content: '·';
  position: absolute;
  left: 0;
  color: var(--color-accent);
  font-weight: 700;
}

@keyframes ko-fadein {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ko-block-wrap,
  .ko-additions,
  .ko-collapsible-content { animation: none; }
  .ko-loading-dot { animation: none; }
}

/* Mobile */
@media (max-width: 720px) {
  .ko-block-actions {
    justify-content: stretch;
  }
  .ko-copy {
    width: 100%;
  }
}
</style>
