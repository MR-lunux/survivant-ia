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

interface Addition {
  field: 'role' | 'task' | 'format' | 'context' | 'constraints' | 'examples'
  before: string
  after: string
  explanation: string
}

const props = defineProps<{
  state: 'idle' | 'loading' | 'success' | 'error'
  structured: Structured | null
  additions: Addition[]
  alreadySolid: boolean
}>()

const emit = defineEmits<{
  (e: 'copied', payload: { chars: number; had_optional_fields: boolean }): void
  (e: 'field-expanded', field: 'context' | 'constraints' | 'examples'): void
}>()

const FIELDS_META = {
  role: { label: 'RÔLE', peda: 'Donne à l\'IA un point de vue. Sans rôle, elle répond en général ; avec rôle, elle répond comme un spécialiste.', example: 'Tu es un expert RH suisse senior, habitué aux entretiens annuels en PME.' },
  task: { label: 'TÂCHE', peda: 'Dis ce qu\'il faut faire, précisément. « Fais une synthèse » ≠ « Liste les 3 points clés en 1 phrase chacun ».', example: 'Rédige un mail de relance professionnel pour un client qui n\'a pas répondu depuis 2 semaines.' },
  format: { label: 'FORMAT DE SORTIE', peda: 'Précise la forme : longueur, structure, ton, langue. « 1 paragraphe », « 5 bullets », « 150 mots max ».', example: 'Mail court (max 120 mots), ton cordial mais ferme, signature « Cordialement, [Prénom] ».' },
  context: { label: 'CONTEXTE', peda: 'Donne-lui la matière première : ce que tu as, ce qui s\'est passé, ce qu\'elle doit savoir avant de répondre.', example: 'Client = PME industrielle, contrat signé il y a 6 mois. Première relance restée sans réponse.' },
  constraints: { label: 'CONTRAINTES', peda: 'Liste ce qu\'elle ne doit PAS faire. Souvent plus puissant que dire ce qu\'elle doit faire.', example: 'N\'utilise pas de superlatifs marketing. Ne mentionne pas le prix. Ne propose pas d\'appel.' },
  examples: { label: 'EXEMPLES', peda: 'Montre-lui 1 ou 2 exemples concrets. C\'est souvent ce qui sépare une réponse moyenne d\'une bonne réponse.', example: 'Ton souhaité : « Bonjour, je reviens vers vous concernant… » ; à éviter : « J\'espère que vous allez bien ! »' },
}

// Manual expansion state (independent of auto-expand on success).
const manuallyExpanded = ref<Set<'context' | 'constraints' | 'examples'>>(new Set())

function isExpanded(field: 'context' | 'constraints' | 'examples'): boolean {
  if (manuallyExpanded.value.has(field)) return true
  if (props.state === 'success' && props.structured?.[field] != null) return true
  return false
}

function expand(field: 'context' | 'constraints' | 'examples') {
  if (!manuallyExpanded.value.has(field)) {
    manuallyExpanded.value.add(field)
    emit('field-expanded', field)
  }
}

function fieldValue(field: keyof Structured): string | null {
  if (props.state !== 'success' || !props.structured) return null
  return props.structured[field]
}

function fieldState(field: keyof Structured): 'idle' | 'loading' | 'success' {
  if (props.state === 'loading') return 'loading'
  if (props.state === 'success' && props.structured && props.structured[field] != null) return 'success'
  return 'idle'
}

// Bloc copiable assemblé côté client.
const blockCopy = computed(() => {
  if (!props.structured) return ''
  const s = props.structured
  const parts: string[] = []
  parts.push(s.role)
  if (s.context) parts.push(`\nCONTEXTE\n${s.context}`)
  parts.push(`\nTÂCHE\n${s.task}`)
  parts.push(`\nFORMAT DE SORTIE\n${s.format}`)
  if (s.constraints) parts.push(`\nCONTRAINTES\n${s.constraints}`)
  if (s.examples) parts.push(`\nEXEMPLES\n${s.examples}`)
  return parts.join('\n')
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
  <section class="ko" :data-state="state">
    <header class="ko-head">
      <span class="ko-divider">LE RÉSULTAT</span>
      <p v-if="alreadySolid && state === 'success'" class="ko-solid">
        Ton prompt était déjà solide. J'ai juste resserré la formulation.
      </p>
    </header>

    <!-- 3 required, toujours visibles -->
    <KitAmelioreTonPromptField
      field-key="role"
      :label="FIELDS_META.role.label"
      :peda-text="FIELDS_META.role.peda"
      :placeholder-example="FIELDS_META.role.example"
      :value="fieldValue('role')"
      :state="fieldState('role')"
    />
    <KitAmelioreTonPromptField
      field-key="task"
      :label="FIELDS_META.task.label"
      :peda-text="FIELDS_META.task.peda"
      :placeholder-example="FIELDS_META.task.example"
      :value="fieldValue('task')"
      :state="fieldState('task')"
    />
    <KitAmelioreTonPromptField
      field-key="format"
      :label="FIELDS_META.format.label"
      :peda-text="FIELDS_META.format.peda"
      :placeholder-example="FIELDS_META.format.example"
      :value="fieldValue('format')"
      :state="fieldState('format')"
    />

    <!-- 3 optionnels avec progressive disclosure -->
    <template v-for="field in (['context', 'constraints', 'examples'] as const)" :key="field">
      <KitAmelioreTonPromptField
        v-if="isExpanded(field)"
        :field-key="field"
        :label="FIELDS_META[field].label"
        :peda-text="FIELDS_META[field].peda"
        :placeholder-example="FIELDS_META[field].example"
        :value="fieldValue(field)"
        :state="fieldState(field)"
      />
      <button
        v-else
        type="button"
        class="ko-expand"
        @click="expand(field)"
      >
        + Ajouter {{ field === 'context' ? 'du contexte' : field === 'constraints' ? 'des contraintes' : 'des exemples' }}
      </button>
    </template>

    <!-- Bouton copier + encart additions (uniquement en success) -->
    <div v-if="state === 'success'" class="ko-actions">
      <button
        type="button"
        class="ko-copy"
        @click="onCopy"
      >
        {{ copyState === 'copied' ? 'Copié !' : 'Copier le prompt amélioré en bloc' }}
      </button>
    </div>

    <div v-if="state === 'success' && additions.length > 0 && !alreadySolid" class="ko-additions">
      <span class="ko-additions-label">CE QUE J'AI AJOUTÉ</span>
      <ul class="ko-add-list">
        <li v-for="(add, idx) in additions" :key="idx" class="ko-add-item">
          {{ add.explanation }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.ko { display: flex; flex-direction: column; gap: 1rem; margin: 2rem 0; }

.ko-head {
  margin: 1rem 0 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.ko-divider {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  color: var(--color-muted);
}
.ko-solid {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--color-accent);
  text-align: center;
  margin: 0;
}

.ko-expand {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px dashed var(--color-rule);
  background: transparent;
  color: var(--color-muted);
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.ko-expand:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.ko-actions {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
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

.ko-additions {
  border: 1px solid var(--color-accent);
  background: color-mix(in oklab, var(--color-surface) 88%, var(--color-accent));
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: ko-fadein 320ms ease-out 200ms both;
}

@keyframes ko-fadein {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.ko-additions-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.ko-add-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
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

@media (prefers-reduced-motion: reduce) {
  .ko-additions { animation: none; }
}
</style>
