<!-- app/components/KitGenerateurBpmn.vue -->
<script setup lang="ts">
import KitVoiceInput from './KitVoiceInput.vue'
import KitGenerateurBpmnPreview from './KitGenerateurBpmnPreview.vue'
import type { BpmnIR } from '~~/server/utils/bpmn-ir-schema'

defineProps<{ kitId: string }>()

const { capture, getDistinctId } = usePosthogEvent()

type State = 'idle' | 'loading' | 'success' | 'error'

interface ApiSuccessResponse {
  xml: string
  ir: BpmnIR
}
interface ApiErrorResponse {
  error: string
  message?: string
  reason?: string
  resetAt?: number
}

const state = ref<State>('idle')
const description = ref('')
const result = ref<ApiSuccessResponse | null>(null)

const elapsedMs = ref(0)
let elapsedInterval: ReturnType<typeof setInterval> | null = null

function startElapsedTimer() {
  elapsedMs.value = 0
  if (elapsedInterval) clearInterval(elapsedInterval)
  const start = Date.now()
  elapsedInterval = setInterval(() => {
    elapsedMs.value = Date.now() - start
  }, 200)
}

function stopElapsedTimer() {
  if (elapsedInterval) {
    clearInterval(elapsedInterval)
    elapsedInterval = null
  }
}

onBeforeUnmount(() => { stopElapsedTimer() })

const loadingPhase = computed(() => {
  const s = elapsedMs.value / 1000
  if (s < 3) return "Analyse de ta description…"
  if (s < 10) return "Structuration du processus…"
  if (s < 22) return "Génération du diagramme…"
  return "Presque… le modèle finalise."
})

const elapsedSec = computed(() => Math.floor(elapsedMs.value / 1000))
const errorMsg = ref<string | null>(null)
const voiceRecording = ref(false)

const MAX_CHARS = 4000
const charCount = computed(() => description.value.length)
const charClass = computed(() => charCount.value > 3500 ? 'count-warn' : '')

function onVoiceTranscribed(text: string) {
  description.value = description.value
    ? `${description.value.trim()} ${text}`.trim()
    : text
}
function onVoiceStateChange(s: 'idle' | 'recording' | 'uploading' | 'transcribing' | 'denied' | 'unsupported') {
  voiceRecording.value = s === 'recording' || s === 'uploading' || s === 'transcribing'
}

async function onSubmit() {
  if (state.value === 'loading') return
  if (description.value.trim().length === 0) return

  capture('bpmn_generator_submit_clicked', {
    kit_id: 'generateur-processus-bpmn',
    chars: description.value.length,
    words: description.value.split(/\s+/).filter(w => w.length > 0).length,
  })

  state.value = 'loading'
  startElapsedTimer()
  errorMsg.value = null

  try {
    const response = await $fetch<ApiSuccessResponse | ApiErrorResponse>(
      '/api/generateur-processus-bpmn/generate',
      {
        method: 'POST',
        body: {
          description: description.value,
          distinct_id: getDistinctId?.() ?? undefined,
        },
      },
    )

    if ('error' in response) {
      handleApiError(response)
      return
    }

    result.value = response
    stopElapsedTimer()
    state.value = 'success'
  } catch (err) {
    const httpErr = err as { data?: ApiErrorResponse }
    const body = httpErr.data
    if (body && 'error' in body) {
      handleApiError(body)
    } else {
      stopElapsedTimer()
      errorMsg.value = "La génération a échoué. Réessaie dans une minute."
      capture('bpmn_generator_api_error', { kit_id: 'generateur-processus-bpmn', error_type: 'network' })
      state.value = 'error'
    }
  }
}

function handleApiError(body: ApiErrorResponse) {
  stopElapsedTimer()
  switch (body.error) {
    case 'rate_limit':
      errorMsg.value = 'Tu as atteint la limite de 20 générations par jour. Reviens demain, ou inscris-toi à La Fréquence en bas de page.'; break
    case 'invalid_input':
      if (body.reason === 'too_short') errorMsg.value = 'Décris ton processus en au moins 20 caractères (un acteur, une action, un résultat).'
      else if (body.reason === 'too_long') errorMsg.value = 'Ta description est trop longue. Garde-la sous 4000 caractères.'
      else if (body.reason === 'injection_attempt') errorMsg.value = "Cette description n'est pas acceptée (tentative d'injection détectée)."
      else errorMsg.value = 'Ta description ne passe pas la validation.'
      break
    case 'bad_input':
      errorMsg.value = body.message ?? "Ce contenu n'est pas accepté. Reformule en restant pro."; break
    case 'too_vague':
      errorMsg.value = body.message ?? 'Ta description est trop vague. Décris au moins 2 étapes et qui les exécute.'; break
    case 'ir_invalid':
    case 'bad_json':
      errorMsg.value = "L'IA a eu un trou. Réessaie dans un instant."; break
    case 'ai_unreachable':
      errorMsg.value = "Le service IA est temporairement indisponible. Réessaie dans une minute."; break
    case 'conversion_failed':
      errorMsg.value = 'Impossible de générer le diagramme depuis cette description. Reformule différemment.'; break
    default:
      errorMsg.value = body.message ?? 'Une erreur est survenue.'
  }
  capture('bpmn_generator_api_error', { kit_id: 'generateur-processus-bpmn', error_type: body.error, reason: body.reason })
  state.value = 'error'
}

function onReset() {
  result.value = null
  state.value = 'idle'
  errorMsg.value = null
}
</script>

<template>
  <div class="bpmn-tool">
    <div v-if="state !== 'success'" class="bpmn-form">
      <label class="form-label" for="bpmn-desc">Décris ton processus métier</label>
      <textarea
        id="bpmn-desc"
        v-model="description"
        :maxlength="MAX_CHARS"
        :disabled="state === 'loading'"
        rows="8"
        placeholder="Exemple : le demandeur saisit une demande d'achat. Le responsable la valide ou la refuse. Si validée, le bon de commande est émis. Sinon, le demandeur reçoit le refus."
      ></textarea>
      <div class="form-meta">
        <KitVoiceInput
          upload-endpoint="/api/generateur-processus-bpmn/transcribe"
          status-endpoint="/api/generateur-processus-bpmn/transcribe-status"
          @transcribed="onVoiceTranscribed"
          @failed="(reason) => errorMsg = `Dictée échouée (${reason})`"
        />
        <span class="char-count" :class="charClass">{{ charCount }} / {{ MAX_CHARS }}</span>
      </div>

      <button
        class="btn-submit"
        type="button"
        :disabled="state === 'loading' || description.trim().length === 0 || voiceRecording"
        @click="onSubmit"
      >
        <template v-if="state === 'loading'">
            {{ loadingPhase }} <span class="elapsed-badge">{{ elapsedSec }}s</span>
          </template>
          <template v-else>
            Générer le diagramme
          </template>
      </button>

      <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
    </div>

    <div v-if="state === 'success' && result" class="bpmn-success">
      <KitGenerateurBpmnPreview :xml="result.xml" :ir="result.ir" />
      <button class="btn-secondary" type="button" @click="onReset">
        Générer un autre processus
      </button>
    </div>
  </div>
</template>

<style scoped>
.bpmn-tool { margin: 2rem 0; }
.form-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 0.5rem;
}
textarea {
  width: 100%;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  padding: 1rem;
  resize: vertical;
}
textarea:focus { outline: 1px solid var(--color-accent); border-color: var(--color-accent); }
.form-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  gap: 1rem;
}
.char-count {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-muted);
}
.char-count.count-warn { color: var(--color-accent); }
.btn-submit {
  margin-top: 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.85rem 1.5rem;
  background: var(--color-accent);
  color: var(--color-bg);
  border: 1px solid var(--color-accent);
  cursor: pointer;
}
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.elapsed-badge {
  display: inline-block;
  margin-left: 0.6rem;
  padding: 0.1rem 0.5rem;
  border: 1px solid currentColor;
  border-radius: 999px;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  opacity: 0.9;
}
.btn-secondary {
  margin-top: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.6rem 1rem;
  background: transparent;
  border: 1px solid var(--color-rule);
  color: var(--color-text);
  cursor: pointer;
}
.form-error {
  margin-top: 1rem;
  color: var(--color-accent);
  font-size: 0.9rem;
}
</style>
