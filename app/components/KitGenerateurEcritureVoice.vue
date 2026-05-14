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

const buttonLabel = computed(() => {
  switch (state.value) {
    case 'recording': return `Stop · ${String(elapsedSec.value).padStart(2, '0')}s`
    case 'uploading': return 'Envoi audio…'
    case 'transcribing': return 'Transcription en cours…'
    case 'denied': return 'Micro refusé'
    case 'unsupported': return 'Micro indisponible'
    default: return 'Dicter'
  }
})

const isDisabled = computed(() => state.value === 'denied' || state.value === 'unsupported' || state.value === 'uploading' || state.value === 'transcribing')
</script>

<template>
  <button
    type="button"
    class="voice-btn"
    :class="{ recording: state === 'recording', processing: state === 'uploading' || state === 'transcribing' }"
    :disabled="isDisabled"
    @click="toggle"
  >
    {{ buttonLabel }}
  </button>
</template>

<style scoped>
.voice-btn {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.7rem 1.1rem;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-hairline);
  cursor: pointer;
  white-space: nowrap;
  min-width: 140px;
}
.voice-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
.voice-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.voice-btn.recording {
  background: var(--color-danger, #c5614f);
  color: var(--color-bg);
  border-color: var(--color-danger, #c5614f);
  animation: pulse 1.5s ease-in-out infinite;
}
.voice-btn.processing { color: var(--color-accent); border-color: var(--color-accent); }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
</style>
