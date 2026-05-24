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
const bpmnIoState = ref<'idle' | 'opened'>('idle')

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

function onBpmnIoClick() {
  // bpmn.io n'a PAS de feature "paste XML" : on doit télécharger le .bpmn
  // ET ouvrir bpmn.io, puis l'utilisateur fait Cmd+O pour charger le fichier.
  // On déclenche le download en parallèle de la nav du <a target="_blank">.
  downloadXml()
  bpmnIoState.value = 'opened'
  setTimeout(() => { bpmnIoState.value = 'idle' }, 10000)

  capture('bpmn_generator_bpmnio_opened', {
    kit_id: 'generateur-processus-bpmn',
  })
  // Pas de preventDefault : le <a href> navigue normalement après ce handler.
}

const xmlTextareaRef = ref<HTMLTextAreaElement | null>(null)

function onXmlTextareaFocus() {
  // Auto-select all text when the user clicks/tabs into the textarea
  xmlTextareaRef.value?.select()
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
      <a
        href="https://demo.bpmn.io/new"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-primary"
        @click="onBpmnIoClick"
      >
        Éditer dans bpmn.io ↗
      </a>
    </div>
    <p v-if="bpmnIoState === 'opened'" class="bpmn-io-hint">
      Le fichier .bpmn vient d'être téléchargé. Dans l'onglet bpmn.io qui s'ouvre, fais Cmd+O (ou Ctrl+O sur Windows) et sélectionne le fichier téléchargé. bpmn.io n'accepte pas le copier-coller de XML, seulement les fichiers .bpmn.
    </p>

    <details class="bpmn-xml-raw" @toggle="(e) => showXml = (e.target as HTMLDetailsElement).open">
      <summary>Voir / copier le XML brut</summary>
      <p class="bpmn-xml-hint">Pour partager le XML ailleurs ou l'inspecter. Si le bouton « Copier le XML » échoue, clique dans le champ, fais Cmd+A / Ctrl+A puis Cmd+C / Ctrl+C. Note : ce XML ne se colle pas dans bpmn.io, qui ne supporte que l'import via Cmd+O sur un fichier .bpmn.</p>
      <textarea
        class="bpmn-xml-textarea"
        readonly
        :value="xml"
        rows="14"
        @focus="onXmlTextareaFocus"
        ref="xmlTextareaRef"
      ></textarea>
    </details>
  </div>
</template>

<style scoped>
.bpmn-preview { margin-top: 2rem; }
.bpmn-canvas {
  border: 1px solid var(--color-rule);
  background: #ffffff;
  padding: 1.5rem;
  overflow-x: auto;
  min-height: 300px;
}
.bpmn-svg-wrap :deep(svg) {
  max-width: 100%;
  height: auto;
  background: #ffffff;
}
/* Force white fill on lane shapes (default bpmn-js renders them grey-ish) */
.bpmn-svg-wrap :deep(g[data-element-id^="Lane_"] .djs-visual > rect),
.bpmn-svg-wrap :deep(g[data-element-id^="Lane_"] .djs-visual > polygon) {
  fill: #ffffff !important;
}
/* Lane label text in dark color for readability */
.bpmn-svg-wrap :deep(g[data-element-id^="Lane_"] .djs-visual > text) {
  fill: #1a1a1a !important;
}
/* Ensure all shape texts are dark (in case theme inheritance bleeds in) */
.bpmn-svg-wrap :deep(.djs-visual > text) {
  fill: #1a1a1a;
}
/* Strokes for shapes — ensure visibility on white */
.bpmn-svg-wrap :deep(.djs-visual > rect),
.bpmn-svg-wrap :deep(.djs-visual > circle),
.bpmn-svg-wrap :deep(.djs-visual > polygon) {
  stroke: #2a2a2a;
}
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
.bpmn-io-hint {
  margin-top: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-muted);
  line-height: 1.5;
}
.bpmn-io-hint.warn { color: var(--color-accent); }
.bpmn-xml-raw { margin-top: 1.5rem; }
.bpmn-xml-raw summary {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  color: var(--color-muted);
}
.bpmn-xml-hint {
  margin: 0.75rem 0;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-muted);
  line-height: 1.5;
}
.bpmn-xml-textarea {
  width: 100%;
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  line-height: 1.4;
  padding: 0.75rem;
  resize: vertical;
  white-space: pre;
}
.bpmn-xml-textarea:focus {
  outline: 1px solid var(--color-accent);
  border-color: var(--color-accent);
}
</style>
