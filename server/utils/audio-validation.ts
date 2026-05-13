// Couche 2 du garde-fou : validation upload audio côté serveur.
// Magic number check (premiers octets du fichier) pour confirmer le type réel,
// indépendamment du Content-Type qui peut être spoofé.

const MAX_AUDIO_SIZE = 1.5 * 1024 * 1024 // 1.5 MB
const ALLOWED_MIME_PREFIXES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'video/mp4']

export interface AudioValidationResult {
  valid: boolean
  reason?: string
  detectedExtension?: string
}

function detectAudioType(buffer: Buffer): { type: string; extension: string } | null {
  if (buffer.length < 12) return null
  // WebM / Matroska : 1A 45 DF A3
  if (buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3) {
    return { type: 'audio/webm', extension: 'webm' }
  }
  // OGG : "OggS"
  if (buffer.slice(0, 4).toString('ascii') === 'OggS') {
    return { type: 'audio/ogg', extension: 'ogg' }
  }
  // WAV : "RIFF" ... "WAVE"
  if (buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WAVE') {
    return { type: 'audio/wav', extension: 'wav' }
  }
  // MP3 : ID3 tag ou frame sync 0xFF 0xFB / 0xFF 0xFA
  if (buffer.slice(0, 3).toString('ascii') === 'ID3') {
    return { type: 'audio/mpeg', extension: 'mp3' }
  }
  if (buffer[0] === 0xFF && (buffer[1] === 0xFB || buffer[1] === 0xFA || buffer[1] === 0xF3 || buffer[1] === 0xF2)) {
    return { type: 'audio/mpeg', extension: 'mp3' }
  }
  // MP4 / M4A : "ftyp" at byte 4
  if (buffer.slice(4, 8).toString('ascii') === 'ftyp') {
    return { type: 'audio/mp4', extension: 'm4a' }
  }
  return null
}

export function validateAudio(buffer: Buffer, declaredMimeType: string | undefined): AudioValidationResult {
  if (buffer.length === 0) return { valid: false, reason: 'empty' }
  if (buffer.length > MAX_AUDIO_SIZE) return { valid: false, reason: 'too_large' }

  if (declaredMimeType && !ALLOWED_MIME_PREFIXES.some(p => declaredMimeType.startsWith(p))) {
    return { valid: false, reason: 'bad_mime' }
  }

  const detected = detectAudioType(buffer)
  if (!detected) return { valid: false, reason: 'unknown_format' }

  return { valid: true, detectedExtension: detected.extension }
}
