<!-- app/components/KitGenerateurBpmnPreview.vue -->
<script setup lang="ts">
import type { BpmnIR } from '~~/server/utils/bpmn-ir-schema'

const props = defineProps<{
  xml: string
  ir: BpmnIR
}>()

const svgString = ref<string>('')
const renderError = ref<string | null>(null)
const isRendering = ref(false)
const showXml = ref(false)
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')

async function renderDiagram(xml: string) {
  if (!xml) return
  isRendering.value = true
  renderError.value = null
  try {
    const { default: Viewer } = await import('bpmn-js/lib/Viewer') as { default: new (opts: { container: HTMLElement }) => { importXML: (xml: string) => Promise<{ warnings: unknown[] }>; saveSVG: () => Promise<{ svg: string }>; destroy: () => void } }
    const offscreen = document.createElement('div')
    offscreen.style.position = 'absolute'
    offscreen.style.left = '-99999px'
    offscreen.style.width = '1200px'
    offscreen.style.height = '800px'
    document.body.appendChild(offscreen)
    const viewer = new Viewer({ container: offscreen })
    try {
      await viewer.importXML(xml)
      const { svg } = await viewer.saveSVG()
      svgString.value = svg
    } finally {
      viewer.destroy()
      offscreen.remove()
    }
  } catch (err) {
    renderError.value = err instanceof Error ? err.message : 'Erreur de rendu'
    console.error('[KitGenerateurBpmnPreview] render failed:', err)
  } finally {
    isRendering.value = false
  }
}

watch(() => props.xml, (xml) => { void renderDiagram(xml) }, { immediate: true })

const { capture } = usePosthogEvent()

async function copyXml() {
  try {
    await navigator.clipboard.writeText(props.xml)
    copyState.value = 'copied'
    capture('bpmn_generator_xml_copied', { kit_id: 'generateur-processus-bpmn' })
    setTimeout(() => { copyState.value = 'idle' }, 2000)
  } catch {
    copyState.value = 'failed'
    setTimeout(() => { copyState.value = 'idle' }, 2000)
  }
}

function downloadXml() {
  const blob = new Blob([props.xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const slug = props.ir.process_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'processus'
  a.download = `${slug}.bpmn`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  capture('bpmn_generator_xml_downloaded', { kit_id: 'generateur-processus-bpmn' })
}

async function openInBpmnIo() {
  try { await navigator.clipboard.writeText(props.xml) } catch { /* tolerate clipboard fail */ }
  window.open('https://demo.bpmn.io/new', '_blank', 'noopener')
  capture('bpmn_generator_bpmnio_opened', { kit_id: 'generateur-processus-bpmn' })
}

// Fallback text list for screen readers and mobile
const stepList = computed(() => {
  return props.ir.nodes
    .filter(n => n.type === 'task' || n.type === 'subprocess')
    .map(n => (n as { label: string }).label)
})
</script>

<template>
  <div class="bpmn-preview">
    <div class="bpmn-canvas" v-if="!renderError">
      <p v-if="isRendering" class="bpmn-status">Rendu du diagramme…</p>
      <div
        v-else-if="svgString"
        role="img"
        :aria-label="`Diagramme BPMN du processus ${ir.process_name}`"
        class="bpmn-svg-wrap"
        v-html="svgString"
      />
    </div>
    <p v-else class="bpmn-error">Impossible d'afficher le diagramme. Le XML reste téléchargeable.</p>

    <details class="bpmn-steps-fallback">
      <summary>Voir la liste des étapes</summary>
      <ol>
        <li v-for="(label, i) in stepList" :key="i">{{ label }}</li>
      </ol>
    </details>

    <div class="bpmn-actions">
      <button type="button" class="btn" @click="copyXml">
        {{ copyState === 'copied' ? 'Copié' : copyState === 'failed' ? 'Échec' : 'Copier le XML' }}
      </button>
      <button type="button" class="btn" @click="downloadXml">
        Télécharger .bpmn
      </button>
      <button type="button" class="btn btn-primary" @click="openInBpmnIo">
        Ouvrir dans bpmn.io
      </button>
    </div>

    <details class="bpmn-xml-raw" @toggle="(e) => showXml = (e.target as HTMLDetailsElement).open">
      <summary>Voir le XML brut</summary>
      <pre><code>{{ xml }}</code></pre>
    </details>
  </div>
</template>

<style scoped>
.bpmn-preview { margin-top: 2rem; }
.bpmn-canvas {
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  padding: 1rem;
  overflow-x: auto;
  min-height: 300px;
}
.bpmn-svg-wrap :deep(svg) { max-width: 100%; height: auto; }
.bpmn-status { color: var(--color-muted); font-family: var(--font-mono); font-size: 0.8rem; }
.bpmn-error { color: var(--color-accent); font-size: 0.9rem; }
.bpmn-actions {
  display: flex; flex-wrap: wrap; gap: 0.75rem;
  margin-top: 1.25rem;
}
.btn {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.6rem 1rem;
  border: 1px solid var(--color-rule);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.btn:hover { border-color: var(--color-accent); }
.btn-primary { border-color: var(--color-accent); color: var(--color-accent); }
.bpmn-steps-fallback {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--color-muted);
}
.bpmn-steps-fallback ol { margin: 0.5rem 0 0 1.25rem; }
.bpmn-xml-raw { margin-top: 1.5rem; }
.bpmn-xml-raw summary {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  color: var(--color-muted);
}
.bpmn-xml-raw pre {
  background: var(--color-surface);
  border: 1px solid var(--color-rule);
  padding: 1rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 400px;
}
</style>
