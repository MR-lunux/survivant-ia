<!-- app/components/KitGenerateurEcriture.vue -->
<script setup lang="ts">
import * as XLSX from 'xlsx'
import { validateInput } from '~/utils/input-validation'
import { PLAN_COMPTABLE_PME } from '~/utils/plan-comptable-pme'
import type { JournalRow } from './KitGenerateurEcritureRow.vue'
import type { AccountingProposition, AiErrorResponse } from '~/utils/output-types'

defineProps<{ kitId: string }>()

const { capture } = usePosthogEvent()

const EXAMPLES = [
  'Migros 47.80 frais représentation hier',
  'Facture Bexio 39 CHF SaaS pour le mois',
  'Leasing voiture 850 mensualité avril',
]
const STORAGE_KEY = 'survivant-generateur-ecriture-rows'
const FEEDBACK_DISMISSED_KEY = 'survivant-generateur-feedback-dismissed'

const text = ref('')
const inputError = ref<string | null>(null)
const isSubmitting = ref(false)
const isFirstParse = ref(true)
const lastInputMode = ref<'text' | 'voice'>('text')
const voiceStartedAt = ref(0)

const preview = ref<AccountingProposition | null>(null)
const previewLowConfidence = computed(() => preview.value !== null && preview.value.confidence < 0.7)
const originalProposition = ref<AccountingProposition | null>(null)

const rows = ref<JournalRow[]>([])

const showFeedback = ref(false)
const feedbackEmail = ref('')
const feedbackProchainOutil = ref('')
const feedbackSubmitted = ref(false)
const feedbackDismissed = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) rows.value = JSON.parse(raw) as JournalRow[]
    } catch { /* ignore */ }
    feedbackDismissed.value = !!document.cookie.split('; ').find(c => c.startsWith(`${FEEDBACK_DISMISSED_KEY}=`))
  }
})

watch(rows, (next) => {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  if (next.length >= 3 && !feedbackDismissed.value && !feedbackSubmitted.value) showFeedback.value = true
}, { deep: true })

watch(preview, (next) => {
  if (next && !originalProposition.value) originalProposition.value = JSON.parse(JSON.stringify(next))
  if (!next) originalProposition.value = null
}, { immediate: false })

const isInputValid = computed(() => {
  if (text.value.trim().length === 0) return false
  const result = validateInput(text.value)
  if (!result.valid) { inputError.value = friendlyError(result.reason ?? 'unknown'); return false }
  inputError.value = null
  return true
})

function friendlyError(reason: string): string {
  switch (reason) {
    case 'too_long': return 'Trop long — limite-toi à 200 caractères.'
    case 'url_present': return 'Pas d\'URLs dans une écriture comptable.'
    case 'profanity':
    case 'injection_attempt': return 'Ce texte ne ressemble pas à une écriture comptable. Reformule.'
    default: return ''
  }
}

function applyExample(example: string) {
  text.value = example
  lastInputMode.value = 'text'
  capture('generateur_ecriture_example_chip_clicked', { example_key: example.slice(0, 30) })
}

function onVoiceStarted() {
  voiceStartedAt.value = Date.now()
  lastInputMode.value = 'voice'
  capture('generateur_ecriture_voice_started')
}

function onVoiceTranscribed(transcribedText: string) {
  text.value = transcribedText
  capture('generateur_ecriture_voice_completed', {
    transcription_latency_ms: Date.now() - voiceStartedAt.value,
  })
}

function onVoiceFailed(reason: string) {
  capture('generateur_ecriture_voice_failed', { reason })
  if (reason === 'permission_denied') inputError.value = 'L\'accès au microphone a été refusé. Utilise la saisie texte.'
  else if (reason === 'timeout') inputError.value = 'La transcription prend trop longtemps. Réessaie ou tape l\'écriture.'
  else if (reason === 'empty_transcription' || reason === 'empty_audio') inputError.value = 'Aucune parole détectée. Parle plus fort ou plus près du micro.'
  else inputError.value = 'La transcription a échoué. Réessaie ou tape l\'écriture.'
}

async function onSubmitParse() {
  if (!isInputValid.value) return
  isSubmitting.value = true
  preview.value = null
  inputError.value = null
  const start = performance.now()
  try {
    const response = await $fetch<AccountingProposition | AiErrorResponse | { error: string; reason?: string; resetAt?: number }>(
      '/api/generateur-ecriture-comptable/parse',
      { method: 'POST', body: { text: text.value, currentDate: new Date().toISOString().slice(0, 10) } }
    )
    const latency = Math.round(performance.now() - start)

    if ('error' in response) {
      const payload = response as { error: string; reason?: string }
      handleParseError(response.error, payload)
      capture('generateur_ecriture_parse_error', {
        error_type: response.error,
        validation_reason: payload.reason,
        input_length: text.value.length,
        input_mode: lastInputMode.value,
        parse_latency_ms: latency,
      })
      return
    }
    preview.value = response

    if (isFirstParse.value) {
      capture('generateur_ecriture_first_parse', { parse_latency_ms: latency, input_mode: lastInputMode.value })
      isFirstParse.value = false
    }
    capture('generateur_ecriture_parse_success', {
      rows_in_session: rows.value.length,
      parse_latency_ms: latency,
      input_mode: lastInputMode.value,
    })
  } catch {
    handleParseError('network', { error: 'network' })
    capture('generateur_ecriture_parse_error', { error_type: 'network' })
  } finally {
    isSubmitting.value = false
  }
}

function handleParseError(code: string, payload: { error: string; reason?: string }) {
  if (code === 'rate_limit') {
    inputError.value = 'Tu as atteint 10 essais aujourd\'hui. La version sans limite arrive avec La Fréquence.'
    capture('generateur_ecriture_rate_limit_hit')
  } else if (code === 'invalid_input') inputError.value = friendlyError(payload.reason ?? '')
  else if (code === 'validation_failed' || code === 'ai_unreachable') inputError.value = 'L\'IA n\'a pas pu structurer cette écriture. Reformule avec plus de contexte.'
  else if (code === 'hors_scope' || code === 'contenu_inapproprie') inputError.value = 'Reformule avec une description d\'écriture comptable.'
  else if (code === 'manque_info') inputError.value = 'Manque une info critique (montant ou libellé). Complète et réessaie.'
  else inputError.value = 'Service indisponible. Réessaie dans quelques instants.'
}

function nextPieceNumber(): string {
  return String(rows.value.length + 1).padStart(3, '0')
}

function compteLibelle(code: string): string {
  const trimmed = (code ?? '').trim()
  return (PLAN_COMPTABLE_PME as Record<string, string>)[trimmed] ?? ''
}

const planComptableEntries = Object.entries(PLAN_COMPTABLE_PME) as [string, string][]
const showPlanComptable = ref(false)
function togglePlanComptable() {
  showPlanComptable.value = !showPlanComptable.value
  if (showPlanComptable.value) capture('generateur_ecriture_plan_comptable_opened')
}
function pickCompte(code: string, target: 'debit' | 'credit') {
  if (!preview.value) return
  if (target === 'debit') preview.value.compteDebit = code
  else preview.value.compteCredit = code
  capture('generateur_ecriture_compte_picked_from_plan', { code, target })
}

const round2 = (n: number) => Math.round(n * 100) / 100

function recomputeFromHt() {
  if (!preview.value) return
  const ht = preview.value.montantHT
  const taux = preview.value.tauxTva
  if (!Number.isFinite(ht) || !Number.isFinite(taux) || taux < 0) return
  const tva = round2(ht * taux / 100)
  preview.value.montantTva = tva
  preview.value.montantTTC = round2(ht + tva)
}

function recomputeFromTtc() {
  if (!preview.value) return
  const ttc = preview.value.montantTTC
  const taux = preview.value.tauxTva
  if (!Number.isFinite(ttc) || !Number.isFinite(taux) || taux < 0) return
  const ht = round2(ttc / (1 + taux / 100))
  preview.value.montantHT = ht
  preview.value.montantTva = round2(ttc - ht)
}

function detectEditedFields(current: AccountingProposition): string[] {
  if (!originalProposition.value) return []
  const fields: string[] = []
  const orig = originalProposition.value
  if (orig.date !== current.date) fields.push('date')
  if (orig.libelle !== current.libelle) fields.push('libelle')
  if (orig.compteDebit !== current.compteDebit) fields.push('compteDebit')
  if (orig.compteCredit !== current.compteCredit) fields.push('compteCredit')
  if (orig.montantHT !== current.montantHT) fields.push('montantHT')
  if (orig.tauxTva !== current.tauxTva) fields.push('tauxTva')
  if (orig.montantTva !== current.montantTva) fields.push('montantTva')
  if (orig.montantTTC !== current.montantTTC) fields.push('montantTTC')
  return fields
}

const actionZoneRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function addPreviewToJournal() {
  if (!preview.value) return
  const editedFields = detectEditedFields(preview.value)
  if (editedFields.length > 0) capture('generateur_ecriture_row_edited_before_add', { fields_edited: editedFields })
  rows.value.push({
    date: preview.value.date,
    piece: nextPieceNumber(),
    libelle: preview.value.libelle,
    compteDebit: preview.value.compteDebit,
    compteCredit: preview.value.compteCredit,
    montantHT: preview.value.montantHT,
    tauxTva: preview.value.tauxTva,
    montantTva: preview.value.montantTva,
    montantTTC: preview.value.montantTTC,
  })
  capture('generateur_ecriture_row_added')
  preview.value = null
  text.value = ''
  nextTick(() => {
    actionZoneRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    textareaRef.value?.focus({ preventScroll: true })
  })
}

function rejectPreview() { preview.value = null }
function removeRow(index: number) { rows.value.splice(index, 1) }

function resetJournal() {
  if (rows.value.length === 0) return
  if (typeof window !== 'undefined' && window.confirm('Tout effacer du journal ? Cette action est définitive.')) {
    rows.value = []
    localStorage.removeItem(STORAGE_KEY)
  }
}

function downloadExcel() {
  if (rows.value.length === 0) return
  const headerRow = ['Date', 'Pièce', 'Libellé', 'Compte débit', 'Compte crédit', 'Montant HT', 'Taux TVA', 'Montant TVA', 'Montant TTC']
  const dataRows = rows.value.map(r => [
    new Date(r.date), r.piece, r.libelle, r.compteDebit, r.compteCredit,
    r.montantHT, r.tauxTva / 100, r.montantTva, r.montantTTC,
  ])
  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  ws['!cols'] = [
    { wch: 12 }, { wch: 8 }, { wch: 40 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
  ]
  ws['!freeze'] = { xSplit: 1, ySplit: 1 }
  for (let i = 1; i <= rows.value.length; i++) {
    const dateCell = XLSX.utils.encode_cell({ r: i, c: 0 })
    if (ws[dateCell]) ws[dateCell].z = 'yyyy-mm-dd'
    for (const c of [5, 7, 8]) {
      const cell = XLSX.utils.encode_cell({ r: i, c })
      if (ws[cell]) ws[cell].z = '#,##0.00'
    }
    const tvaCell = XLSX.utils.encode_cell({ r: i, c: 6 })
    if (ws[tvaCell]) ws[tvaCell].z = '0.0%'
  }
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Journal')
  wb.Props = {
    Author: 'Survivant-IA · survivant-ia.ch',
    Title: `Journal d'écritures générées · ${new Date().toISOString().slice(0, 10)}`,
  }
  const filename = `journal-generateur-ecriture-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
  capture('generateur_ecriture_excel_downloaded', { rows_count: rows.value.length })
  if (!feedbackDismissed.value && !feedbackSubmitted.value) showFeedback.value = true
}

async function submitFeedback() {
  if (!feedbackEmail.value && !feedbackProchainOutil.value) return
  try {
    await $fetch('/api/generateur-ecriture-comptable/feedback', {
      method: 'POST',
      body: { email: feedbackEmail.value || undefined, prochainOutil: feedbackProchainOutil.value || undefined },
    })
    feedbackSubmitted.value = true
    capture('generateur_ecriture_feedback_submitted', {
      has_email: !!feedbackEmail.value,
      has_prochainOutil: !!feedbackProchainOutil.value,
    })
    if (feedbackEmail.value) capture('newsletter_subscribed_from_generateur_ecriture')
    setTimeout(() => { showFeedback.value = false }, 2500)
  } catch { /* silent fail */ }
}

function dismissFeedback() {
  showFeedback.value = false
  feedbackDismissed.value = true
  if (typeof document !== 'undefined') {
    const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toUTCString()
    document.cookie = `${FEEDBACK_DISMISSED_KEY}=1; expires=${expires}; path=/; SameSite=Lax`
  }
}
</script>

<template>
  <div class="generateur-ecriture">
    <KitGenerateurEcritureTransparence />

    <section ref="actionZoneRef" class="action-zone">
      <div class="input-row">
        <KitGenerateurEcritureVoice
          @started="onVoiceStarted"
          @transcribed="onVoiceTranscribed"
          @failed="onVoiceFailed"
        />
        <textarea
          ref="textareaRef"
          v-model="text"
          class="textarea"
          rows="3"
          maxlength="200"
          placeholder="Exemple : Migros 47.80 frais représentation client X hier"
          :disabled="isSubmitting"
        />
      </div>

      <div class="chips-row">
        <span class="chips-label">Essaie un exemple :</span>
        <button v-for="ex in EXAMPLES" :key="ex" type="button" class="chip" :disabled="isSubmitting" @click="applyExample(ex)">
          {{ ex }}
        </button>
      </div>

      <div v-if="inputError" class="error-inline">{{ inputError }}</div>

      <button type="button" class="submit-btn" :disabled="!isInputValid || isSubmitting" @click="onSubmitParse">
        {{ isSubmitting ? 'L\'IA structure…' : 'Proposer l\'écriture →' }}
      </button>
    </section>

    <section v-if="preview" class="preview-card">
      <div class="kicker">PROPOSITION D'ÉCRITURE</div>
      <div class="grid">
        <label class="field"><span class="field-label">Date</span><input v-model="preview.date" type="text" class="input" /></label>
        <label class="field"><span class="field-label">Pièce</span><input :value="nextPieceNumber()" type="text" class="input" disabled /></label>
        <label class="field full"><span class="field-label">Libellé</span><input v-model="preview.libelle" type="text" class="input" maxlength="120" /></label>
        <label class="field">
          <span class="field-label">Compte débit</span>
          <input v-model="preview.compteDebit" type="text" class="input" list="plan-comptable-list" />
          <span class="field-hint" :class="{ unknown: !compteLibelle(preview.compteDebit) }">
            {{ compteLibelle(preview.compteDebit) || 'Code non reconnu' }}
          </span>
        </label>
        <label class="field">
          <span class="field-label">Compte crédit</span>
          <input v-model="preview.compteCredit" type="text" class="input" list="plan-comptable-list" />
          <span class="field-hint" :class="{ unknown: !compteLibelle(preview.compteCredit) }">
            {{ compteLibelle(preview.compteCredit) || 'Code non reconnu' }}
          </span>
        </label>
        <datalist id="plan-comptable-list">
          <option v-for="[code, libelle] in planComptableEntries" :key="code" :value="code">{{ libelle }}</option>
        </datalist>
        <label class="field"><span class="field-label">Montant HT</span><input v-model.number="preview.montantHT" @change="recomputeFromHt" type="number" step="0.01" class="input" /></label>
        <label class="field"><span class="field-label">Taux TVA</span><input v-model.number="preview.tauxTva" @change="recomputeFromHt" type="number" step="0.1" class="input" /></label>
        <label class="field"><span class="field-label">Montant TVA</span><input v-model.number="preview.montantTva" type="number" step="0.01" class="input" /></label>
        <label class="field"><span class="field-label">Montant TTC</span><input v-model.number="preview.montantTTC" @change="recomputeFromTtc" type="number" step="0.01" class="input" /></label>
      </div>
      <div v-if="previewLowConfidence" class="warning">Niveau de confiance modéré — vérifie attentivement.</div>
      <div v-if="preview.note" class="note">Note : {{ preview.note }}</div>
      <button type="button" class="plan-toggle" :aria-expanded="showPlanComptable" @click="togglePlanComptable">
        <span class="plan-toggle-icon" aria-hidden="true">{{ showPlanComptable ? '▲' : '▼' }}</span>
        Plan comptable suisse PME ({{ planComptableEntries.length }} comptes disponibles)
      </button>
      <div v-if="showPlanComptable" class="plan-grid" role="region" aria-label="Plan comptable">
        <button
          v-for="[code, libelle] in planComptableEntries"
          :key="code"
          type="button"
          class="plan-row"
        >
          <span class="plan-code">{{ code }}</span>
          <span class="plan-libelle">{{ libelle }}</span>
          <span class="plan-actions">
            <span class="plan-pick" @click.stop="pickCompte(code, 'debit')">Débit</span>
            <span class="plan-pick" @click.stop="pickCompte(code, 'credit')">Crédit</span>
          </span>
        </button>
      </div>

      <div class="actions">
        <button type="button" class="btn-secondary" @click="rejectPreview">Refaire</button>
        <button type="button" class="btn-primary" @click="addPreviewToJournal">Ajouter au journal →</button>
      </div>
      <div class="hairline-footer">
        Proposition générée par Infomaniak AI Service · Mistral hébergé à Genève · Aucune donnée retenue.
      </div>
    </section>

    <section v-if="rows.length > 0" class="journal">
      <div class="journal-header">
        <div class="kicker">JOURNAL ({{ rows.length }} ligne{{ rows.length > 1 ? 's' : '' }})</div>
        <div class="journal-actions">
          <button type="button" class="btn-primary" @click="downloadExcel">Télécharger Excel</button>
          <button type="button" class="btn-secondary" @click="resetJournal">Nouveau journal</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Date</th><th>Pièce</th><th>Libellé</th><th>Compte débit</th><th>Compte crédit</th><th>HT</th><th>Taux</th><th>TVA</th><th>TTC</th><th></th></tr></thead>
          <tbody>
            <KitGenerateurEcritureRow v-for="(row, i) in rows" :key="`${row.date}-${row.piece}-${i}`" :row="row" :index="i" @remove="removeRow" />
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="showFeedback && !feedbackSubmitted" class="feedback-banner">
      <button type="button" class="dismiss" aria-label="Fermer" @click="dismissFeedback">×</button>
      <div class="kicker">TU AS AIMÉ ? DIS-LE MOI.</div>
      <div class="feedback-form">
        <input v-model="feedbackEmail" type="email" placeholder="Ton email — optionnel" class="input" />
        <input v-model="feedbackProchainOutil" type="text" placeholder="Quel prochain outil tu aimerais voir ? — optionnel" class="input" maxlength="500" />
        <button type="button" class="btn-primary" @click="submitFeedback">Envoyer</button>
      </div>
    </div>
    <div v-if="feedbackSubmitted" class="feedback-thanks">Merci, je note.</div>
  </div>
</template>

<style scoped>
.generateur-ecriture { max-width: 760px; margin: 0 auto; }
.action-zone { border: 1px solid var(--color-rule); background: var(--color-surface); padding: 1.75rem; margin: 2rem 0; }
.input-row { display: flex; gap: 0.75rem; align-items: flex-start; }
.textarea {
  flex: 1;
  font-family: var(--font-sans);
  font-size: 1rem;
  padding: 0.85rem 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-hairline);
  resize: vertical;
}
.textarea:focus { outline: none; border-color: var(--color-accent); }
.chips-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin: 1rem 0; }
.chips-label { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-muted); margin-right: 0.5rem; }
.chip { font-family: var(--font-sans); font-size: 0.85rem; padding: 0.35rem 0.75rem; border: 1px solid var(--color-hairline); background: transparent; color: var(--color-text-soft); cursor: pointer; }
.chip:hover { border-color: var(--color-accent); color: var(--color-accent); }
.chip:disabled { opacity: 0.5; cursor: not-allowed; }
.error-inline { font-size: 0.88rem; color: var(--color-danger); margin: 0.5rem 0; }
.submit-btn { font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.8rem 1.5rem; background: var(--color-accent); color: var(--color-bg); border: none; cursor: pointer; margin-top: 0.5rem; }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.preview-card { border: 1px solid var(--color-rule); background: var(--color-surface); padding: 1.75rem; margin: 2rem 0; }
.kicker { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-accent); margin-bottom: 1rem; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem; margin-bottom: 1rem; }
.field { display: block; }
.field.full { grid-column: 1 / -1; }
.field-label { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-muted); margin-bottom: 0.25rem; display: block; }
.input { width: 100%; font-family: var(--font-sans); font-size: 0.92rem; padding: 0.55rem 0.7rem; background: var(--color-bg); color: var(--color-text); border: 1px solid var(--color-hairline); }
.input:focus { outline: none; border-color: var(--color-accent); }
.field-hint {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  color: var(--color-accent);
  margin-top: 0.3rem;
  min-height: 1em;
}
.field-hint.unknown { color: var(--color-danger, #c5614f); opacity: 0.85; }

.plan-toggle {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: transparent;
  border: none;
  padding: 0.6rem 0;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
  cursor: pointer;
  margin-top: 0.5rem;
}
.plan-toggle:hover { color: var(--color-accent); }
.plan-toggle-icon { color: var(--color-accent); font-size: 0.6rem; }
.plan-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid var(--color-rule);
  margin: 0.5rem 0 1rem;
  animation: plan-fade 0.25s ease-out;
}
@keyframes plan-fade {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.plan-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-hairline);
  text-align: left;
  cursor: default;
  width: 100%;
}
.plan-row:nth-last-child(-n+2) { border-bottom: none; }
.plan-code {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-accent);
  font-weight: 500;
}
.plan-libelle {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--color-text-soft);
}
.plan-actions { display: flex; gap: 0.35rem; }
.plan-pick {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-hairline);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.plan-pick:hover { color: var(--color-accent); border-color: var(--color-accent); }
.warning, .note { font-size: 0.85rem; padding: 0.6rem 0.85rem; border-left: 2px solid; margin: 0.75rem 0; }
.warning { border-color: var(--color-warn, #d49b54); color: var(--color-warn, #d49b54); background: rgba(212, 155, 84, 0.05); }
.note { border-color: var(--color-muted); color: var(--color-text-soft); }
.actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.btn-primary { font-family: var(--font-mono); font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.65rem 1.25rem; background: var(--color-accent); color: var(--color-bg); border: none; cursor: pointer; }
.btn-secondary { font-family: var(--font-mono); font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.65rem 1.25rem; background: transparent; color: var(--color-text-soft); border: 1px solid var(--color-hairline); cursor: pointer; }
.btn-secondary:hover { border-color: var(--color-accent); color: var(--color-accent); }
.hairline-footer { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-muted); border-top: 1px solid var(--color-hairline); padding-top: 0.75rem; margin-top: 1.25rem; text-align: center; }
.journal { margin: 2.5rem 0; }
.journal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
.journal-actions { display: flex; gap: 0.5rem; }
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table thead th { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-muted); text-align: left; padding: 0.5rem; border-bottom: 1px solid var(--color-rule); }
.feedback-banner { position: fixed; bottom: 1rem; right: 1rem; max-width: 420px; background: var(--color-surface); border: 1px solid var(--color-accent); padding: 1.25rem 1.5rem; box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 10; }
.feedback-banner .dismiss { position: absolute; top: 0.5rem; right: 0.5rem; background: transparent; border: none; color: var(--color-muted); font-size: 1.2rem; cursor: pointer; line-height: 1; }
.feedback-form { display: flex; flex-direction: column; gap: 0.5rem; }
.feedback-thanks { position: fixed; bottom: 1rem; right: 1rem; background: var(--color-accent); color: var(--color-bg); padding: 0.75rem 1.25rem; font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; }
@media (max-width: 640px) {
  .action-zone { padding: 1.25rem; }
  .grid { grid-template-columns: 1fr; }
  .feedback-banner { left: 1rem; right: 1rem; max-width: none; }
  .input-row { flex-direction: column; align-items: stretch; }
  .input-row :deep(.voice-btn) { align-self: center; }
  .textarea { min-height: 120px; font-size: 16px; }
  .plan-grid { grid-template-columns: 1fr; }
  .plan-row:nth-last-child(-n+2) { border-bottom: 1px solid var(--color-hairline); }
  .plan-row:last-child { border-bottom: none; }
}
</style>
