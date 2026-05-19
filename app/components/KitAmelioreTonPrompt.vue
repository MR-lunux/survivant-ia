<!-- app/components/KitAmelioreTonPrompt.vue -->
<script setup lang="ts">
import KitAmelioreTonPromptExemples from './KitAmelioreTonPromptExemples.vue'
import KitAmelioreTonPromptForm from './KitAmelioreTonPromptForm.vue'
import KitAmelioreTonPromptOutput from './KitAmelioreTonPromptOutput.vue'
import type { AmeliorerPromptExample } from '~/data/ameliorer-prompt-examples'

defineProps<{ kitId: string }>()

const { capture, getDistinctId } = usePosthogEvent()

type State = 'idle' | 'loading' | 'success' | 'error'

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

interface ApiSuccessResponse {
  structured: Structured
  additions: Addition[]
  already_solid: boolean
}

interface ApiErrorResponse {
  error: string
  message?: string
  reason?: string
}

const state = ref<State>('idle')
const promptBrut = ref('')
const structured = ref<Structured | null>(null)
const additions = ref<Addition[]>([])
const alreadySolid = ref(false)
const errorMsg = ref<string | null>(null)

// Cas exemple : on affiche les 6 champs + additions en simulant un succès,
// sans appel API. Petite latence artificielle pour que l'animation joue.
function loadExample(example: AmeliorerPromptExample, position: number) {
  capture('ameliorer_prompt_example_clicked', {
    kit_id: 'ameliorer-son-prompt',
    example_id: example.id,
    example_position: position,
  })

  promptBrut.value = example.before
  state.value = 'loading'
  errorMsg.value = null

  setTimeout(() => {
    structured.value = example.after.structured
    additions.value = example.after.additions
    alreadySolid.value = example.after.already_solid
    state.value = 'success'
  }, 500)
}

async function onSubmit(value: string) {
  capture('ameliorer_prompt_submitted', {
    kit_id: 'ameliorer-son-prompt',
    chars: value.length,
    words: value.split(/\s+/).filter(w => w.length > 0).length,
  })

  state.value = 'loading'
  errorMsg.value = null

  try {
    const response = await $fetch<ApiSuccessResponse | ApiErrorResponse>('/api/ameliorer-prompt/improve', {
      method: 'POST',
      body: {
        prompt_brut: value,
        distinct_id: getDistinctId?.() ?? undefined,
      },
    })

    if ('error' in response) {
      handleApiError(response)
      return
    }

    structured.value = response.structured
    additions.value = response.additions
    alreadySolid.value = response.already_solid
    state.value = 'success'
  } catch (err) {
    const httpErr = err as { data?: ApiErrorResponse; statusCode?: number }
    const body = httpErr.data
    if (body && 'error' in body) {
      handleApiError(body)
    } else {
      errorMsg.value = "L'amélioration a échoué. Réessaie dans une minute."
      capture('ameliorer_prompt_api_error', { kit_id: 'ameliorer-son-prompt', error_type: 'network' })
      state.value = 'error'
    }
  }
}

function handleApiError(body: ApiErrorResponse) {
  if (body.error === 'bad_input') {
    errorMsg.value = body.message ?? "Ce prompt n'est pas accepté."
  } else if (body.error === 'rate_limit') {
    errorMsg.value = 'Tu as atteint la limite de 20 améliorations par jour. Reviens demain — ou inscris-toi à La Fréquence en bas de page.'
  } else if (body.error === 'invalid_input') {
    if (body.reason === 'too_short') errorMsg.value = "Décris ta demande avec au moins 5 mots."
    else if (body.reason === 'too_long') errorMsg.value = 'Ton prompt est très long. Garde-le sous 4000 caractères.'
    else if (body.reason === 'injection_attempt') errorMsg.value = "Ce prompt n'est pas accepté (tentative d'injection détectée)."
    else errorMsg.value = 'Ton prompt ne passe pas la validation.'
  } else if (body.error === 'bad_json') {
    errorMsg.value = "Désolé, l'amélioration a échoué côté IA. Réessaie."
  } else if (body.error === 'ai_unreachable') {
    errorMsg.value = "L'IA est temporairement injoignable. Réessaie dans une minute."
  } else {
    errorMsg.value = body.message ?? "Une erreur est survenue."
  }
  capture('ameliorer_prompt_api_error', { kit_id: 'ameliorer-son-prompt', error_type: body.error, reason: body.reason })
  state.value = 'error'
}

function onClientValidationError(reason: string) {
  capture('ameliorer_prompt_api_error', { kit_id: 'ameliorer-son-prompt', error_type: 'validation_client', reason })
}

function onClientModerationError() {
  capture('ameliorer_prompt_api_error', { kit_id: 'ameliorer-son-prompt', error_type: 'moderation_client' })
}

function onCopied(payload: { chars: number; had_optional_fields: boolean }) {
  capture('ameliorer_prompt_copied', {
    kit_id: 'ameliorer-son-prompt',
    chars: payload.chars,
    had_optional_fields: payload.had_optional_fields,
  })
}

function onFieldExpanded(field: 'context' | 'constraints' | 'examples') {
  capture('ameliorer_prompt_field_expanded', { kit_id: 'ameliorer-son-prompt', field })
}
</script>

<template>
  <section class="kap">
    <KitAmelioreTonPromptExemples @example-clicked="loadExample" />

    <KitAmelioreTonPromptForm
      v-model="promptBrut"
      :state="state"
      @submit="onSubmit"
      @client-validation-error="onClientValidationError"
      @client-moderation-error="onClientModerationError"
    />

    <p v-if="state === 'error' && errorMsg" class="kap-error" role="alert">
      {{ errorMsg }}
    </p>

    <KitAmelioreTonPromptOutput
      :state="state"
      :structured="structured"
      :additions="additions"
      :already-solid="alreadySolid"
      @copied="onCopied"
      @field-expanded="onFieldExpanded"
    />
  </section>
</template>

<style scoped>
.kap { display: flex; flex-direction: column; }
.kap-error {
  border: 1px solid #ff6b6b;
  background: rgba(255, 107, 107, 0.08);
  color: #ff8585;
  padding: 1rem 1.25rem;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  margin: 1rem 0;
}
</style>
