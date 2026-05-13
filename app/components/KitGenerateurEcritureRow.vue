<!-- app/components/KitGenerateurEcritureRow.vue -->
<script setup lang="ts">
import { PLAN_COMPTABLE_PME } from '~/server/utils/plan-comptable-pme'

export interface JournalRow {
  date: string
  piece: string
  libelle: string
  compteDebit: string
  compteCredit: string
  montantHT: number
  tauxTva: number
  montantTva: number
  montantTTC: number
}

const props = defineProps<{ row: JournalRow; index: number }>()
const emit = defineEmits<{ (e: 'remove', index: number): void }>()

const compteDebitLabel = computed(() => PLAN_COMPTABLE_PME[props.row.compteDebit as keyof typeof PLAN_COMPTABLE_PME] ?? '')
const compteCreditLabel = computed(() => PLAN_COMPTABLE_PME[props.row.compteCredit as keyof typeof PLAN_COMPTABLE_PME] ?? '')

function fmt(amount: number) { return amount.toFixed(2) }
</script>

<template>
  <tr class="row">
    <td class="cell">{{ row.date }}</td>
    <td class="cell">{{ row.piece }}</td>
    <td class="cell libelle">{{ row.libelle }}</td>
    <td class="cell compte">
      <span class="compte-code">{{ row.compteDebit }}</span>
      <span class="compte-label">{{ compteDebitLabel }}</span>
    </td>
    <td class="cell compte">
      <span class="compte-code">{{ row.compteCredit }}</span>
      <span class="compte-label">{{ compteCreditLabel }}</span>
    </td>
    <td class="cell num">{{ fmt(row.montantHT) }}</td>
    <td class="cell num">{{ row.tauxTva.toFixed(1) }}%</td>
    <td class="cell num">{{ fmt(row.montantTva) }}</td>
    <td class="cell num strong">{{ fmt(row.montantTTC) }}</td>
    <td class="cell action">
      <button type="button" class="remove" :aria-label="`Supprimer la ligne ${index + 1}`" @click="emit('remove', index)">×</button>
    </td>
  </tr>
</template>

<style scoped>
.row { border-bottom: 1px solid var(--color-hairline); }
.cell {
  padding: 0.7rem 0.5rem;
  font-size: 0.88rem;
  color: var(--color-text-soft);
  vertical-align: top;
}
.cell.num { font-family: var(--font-mono); text-align: right; }
.cell.num.strong { color: var(--color-text); font-weight: 600; }
.cell.libelle { color: var(--color-text); max-width: 220px; }
.cell.compte { font-family: var(--font-mono); font-size: 0.82rem; }
.compte-code { color: var(--color-accent); font-weight: 600; display: block; }
.compte-label { color: var(--color-muted); font-size: 0.75rem; display: block; }
.cell.action { padding-left: 0.25rem; text-align: right; }
.remove {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  background: transparent;
  border: 1px solid var(--color-hairline);
  color: var(--color-muted);
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  line-height: 1;
}
.remove:hover { border-color: var(--color-danger); color: var(--color-danger); }
</style>
