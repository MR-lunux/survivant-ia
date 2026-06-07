<script setup lang="ts">
import { computed, useSlots, type VNode } from 'vue'

const slots = useSlots()

function extractText(nodes: unknown[] | undefined): string {
  if (!nodes) return ''
  return nodes
    .map((n) => {
      if (typeof n === 'string') return n
      const node = n as VNode
      if (typeof node.children === 'string') return node.children
      if (Array.isArray(node.children)) return extractText(node.children as unknown[])
      return ''
    })
    .join('')
}

const verdictClass = computed(() => {
  const raw = extractText(slots.default?.() as unknown[])
    .trim()
    .toLowerCase()
    .normalize('NFC')

  if (!raw) return ''

  // Rouge : danger, non-conformité, exposition
  if (
    raw === 'non'
    || raw === 'non conforme'
    || raw.startsWith('risqué')
    || raw.startsWith('exposé')
    || raw === 'élevé'
    || raw === 'us'
    || raw.startsWith('us (ue option)')
  ) return 'verdict-red'

  // Vert : conforme, protégé, souveraineté
  if (
    raw === 'oui'
    || /^conforme(\b|$)/.test(raw)
    || raw.startsWith('protégé')
    || raw.startsWith('maximal')
    || raw === 'nul'
    || raw === 'ch'
    || raw.startsWith('chiffrement')
    || raw === 'total'
    || raw.startsWith('oui (')
  ) return 'verdict-green'

  // Orange : sous conditions, moyen, bon-empilé
  if (
    raw === 'moyen'
    || raw.startsWith('bon')
    || raw.startsWith('sans objet')
    || raw.includes('sous condition')
    || raw.startsWith('ch requis')
  ) return 'verdict-orange'

  return ''
})
</script>

<template>
  <td :class="verdictClass">
    <slot />
  </td>
</template>
