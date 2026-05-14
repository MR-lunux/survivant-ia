<!-- app/components/KitGenerateurEcritureVoice.vue -->
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'transcribed', text: string): void
  (e: 'started'): void
  (e: 'failed', reason: string): void
}>()

type VoiceState = 'idle' | 'recording' | 'uploading' | 'transcribing' | 'denied' | 'unsupported'

const state = ref<VoiceState>('idle')
const elapsedSec = ref(0)
let mediaRecorder: MediaRecorder | null = null
let chunks: Blob[] = []
let timerInterval: number | null = null
let recordingStartedAt = 0
let pollIntervalId: number | null = null
let pollTimeoutId: number | null = null

const MAX_RECORDING_MS = 30000
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 60000

onMounted(() => {
  if (typeof window !== 'undefined' && !window.MediaRecorder) {
    state.value = 'unsupported'
  }
})

onBeforeUnmount(() => { cleanup() })

function cleanup() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop() } catch { /* ignore */ }
  }
  mediaRecorder = null
  chunks = []
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  if (pollIntervalId) { clearInterval(pollIntervalId); pollIntervalId = null }
  if (pollTimeoutId) { clearTimeout(pollTimeoutId); pollTimeoutId = null }
  elapsedSec.value = 0
}

async function startRecording() {
  if (state.value !== 'idle') return
  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    state.value = 'denied'
    emit('failed', 'permission_denied')
    return
  }

  emit('started')

  let mime = 'audio/webm;codecs=opus'
  if (!MediaRecorder.isTypeSupported(mime)) {
    mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
  }

  try {
    mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
  } catch {
    state.value = 'unsupported'
    emit('failed', 'mediarecorder_init_failed')
    stream.getTracks().forEach(t => t.stop())
    return
  }

  chunks = []
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }
  mediaRecorder.onstop = () => {
    stream.getTracks().forEach(t => t.stop())
    void handleStop(mime || mediaRecorder?.mimeType || 'audio/webm')
  }

  recordingStartedAt = Date.now()
  state.value = 'recording'
  mediaRecorder.start()
  timerInterval = window.setInterval(() => {
    elapsedSec.value = Math.floor((Date.now() - recordingStartedAt) / 1000)
    if (elapsedSec.value * 1000 >= MAX_RECORDING_MS) stopRecording()
  }, 200)
}

function stopRecording() {
  if (state.value !== 'recording' || !mediaRecorder) return
  state.value = 'uploading'
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  try { mediaRecorder.stop() } catch { /* ignore */ }
}

async function handleStop(mimeType: string) {
  const blob = new Blob(chunks, { type: mimeType })
  if (blob.size === 0) {
    state.value = 'idle'
    emit('failed', 'empty_audio')
    return
  }

  const fd = new FormData()
  fd.append('audio', blob, `audio.${mimeType.includes('webm') ? 'webm' : 'mp4'}`)

  let uploadResponse: { batch_id?: string; error?: string }
  try {
    uploadResponse = await $fetch<{ batch_id?: string; error?: string }>(
      '/api/generateur-ecriture-comptable/transcribe',
      { method: 'POST', body: fd }
    )
  } catch {
    state.value = 'idle'
    emit('failed', 'upload_failed')
    return
  }

  if (!uploadResponse.batch_id) {
    state.value = 'idle'
    emit('failed', uploadResponse.error ?? 'no_batch_id')
    return
  }

  state.value = 'transcribing'
  pollForResult(uploadResponse.batch_id)
}

function pollForResult(batchId: string) {
  let elapsed = 0
  pollIntervalId = window.setInterval(async () => {
    elapsed += POLL_INTERVAL_MS
    if (elapsed > POLL_TIMEOUT_MS) {
      clearPollers()
      state.value = 'idle'
      emit('failed', 'timeout')
      return
    }
    try {
      const res = await $fetch<{ status: string; transcription?: string; error?: string }>(
        `/api/generateur-ecriture-comptable/transcribe-status?batch_id=${encodeURIComponent(batchId)}`
      )
      if (res.status === 'completed' && res.transcription) {
        clearPollers()
        state.value = 'idle'
        emit('transcribed', res.transcription)
      } else if (res.error) {
        clearPollers()
        state.value = 'idle'
        emit('failed', res.error)
      }
    } catch {
      clearPollers()
      state.value = 'idle'
      emit('failed', 'poll_error')
    }
  }, POLL_INTERVAL_MS)
}

function clearPollers() {
  if (pollIntervalId) { clearInterval(pollIntervalId); pollIntervalId = null }
  if (pollTimeoutId) { clearTimeout(pollTimeoutId); pollTimeoutId = null }
}

function toggle() {
  if (state.value === 'recording') stopRecording()
  else if (state.value === 'idle') void startRecording()
}

const ariaLabel = computed(() => {
  switch (state.value) {
    case 'recording': return `Arrêter la dictée (${elapsedSec.value}s)`
    case 'uploading': return 'Envoi audio en cours'
    case 'transcribing': return 'Transcription en cours'
    case 'denied': return 'Micro refusé par le navigateur'
    case 'unsupported': return 'Micro indisponible sur ce navigateur'
    default: return 'Dicter une écriture'
  }
})

const statusText = computed(() => {
  switch (state.value) {
    case 'recording': return `${String(elapsedSec.value).padStart(2, '0')}s · stop`
    case 'uploading': return 'Envoi…'
    case 'transcribing': return 'Transcription…'
    case 'denied': return 'Micro refusé'
    case 'unsupported': return 'Indisponible'
    default: return 'Dicter'
  }
})

const isDisabled = computed(() => state.value === 'denied' || state.value === 'unsupported' || state.value === 'uploading' || state.value === 'transcribing')
</script>

<template>
  <button
    type="button"
    class="voice-btn"
    :class="[`state-${state}`]"
    :disabled="isDisabled"
    :aria-label="ariaLabel"
    @click="toggle"
  >
    <span class="icon-wrap" aria-hidden="true">
      <svg viewBox="0 0 56 56" class="ic-mic">
        <circle class="ring ring-1" cx="28" cy="28" r="13" />
        <circle class="ring ring-2" cx="28" cy="28" r="13" />
        <g class="mic">
          <rect x="24" y="14" width="8" height="18" rx="4" />
          <path d="M18 28 a10 10 0 0 0 20 0" />
          <line x1="28" y1="38" x2="28" y2="44" />
          <line x1="22" y1="44" x2="34" y2="44" />
        </g>
        <rect class="stop" x="20" y="20" width="16" height="16" rx="1" />
      </svg>
    </span>
    <span class="label">{{ statusText }}</span>
  </button>
</template>

<style scoped>
.voice-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.6rem;
  min-width: 88px;
  min-height: 88px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-hairline);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.voice-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
.voice-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.icon-wrap {
  width: 44px;
  height: 44px;
  display: block;
}
.ic-mic { width: 100%; height: 100%; overflow: visible; }
.ic-mic .mic rect,
.ic-mic .mic path,
.ic-mic .mic line {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.ic-mic .mic rect { fill: currentColor; opacity: 0.18; stroke-width: 1.8; }
.ic-mic .ring {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
  transform-origin: 28px 28px;
  opacity: 0;
}
.ic-mic .stop {
  fill: currentColor;
  opacity: 0;
  transform-origin: 28px 28px;
  transform: scale(0.6);
  transition: opacity 0.2s, transform 0.2s;
}

/* RECORDING — red, mic fades, stop square appears */
.state-recording {
  background: var(--color-danger, #c5614f);
  color: var(--color-bg);
  border-color: var(--color-danger, #c5614f);
  animation: pulse 1.4s ease-in-out infinite;
}
.state-recording .ic-mic .mic { opacity: 0.25; }
.state-recording .ic-mic .stop { opacity: 1; transform: scale(1); }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.78; } }

/* UPLOADING / TRANSCRIBING — accent color + slow ring spin */
.state-uploading, .state-transcribing {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.state-uploading .ic-mic .ring-1,
.state-transcribing .ic-mic .ring-1 {
  opacity: 0.6;
  animation: spin 1.4s linear infinite;
  stroke-dasharray: 30 50;
}
@keyframes spin {
  from { transform: rotate(0deg) scale(1); }
  to   { transform: rotate(360deg) scale(1); }
}

.label {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .ic-mic .ring { animation: none !important; opacity: 0; }
  .state-recording { animation: none !important; }
}
</style>
