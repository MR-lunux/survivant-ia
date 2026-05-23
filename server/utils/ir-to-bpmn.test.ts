import { describe, it, expect } from 'vitest'
import BpmnModdle from 'bpmn-moddle'
import { irToBpmnXml } from './ir-to-bpmn'
import type { BpmnIR } from './bpmn-ir-schema'

async function parseXml(xml: string) {
  const moddle = new BpmnModdle()
  return await moddle.fromXML(xml)
}

const simpleLinearIR: BpmnIR = {
  process_name: 'Processus simple',
  lanes: [{ id: 'main', label: 'Demandeur' }],
  nodes: [
    { id: 's1', type: 'start', lane: 'main', label: 'Début' },
    { id: 't1', type: 'task', lane: 'main', label: 'Préparer la demande' },
    { id: 'e1', type: 'end', lane: 'main', label: 'Fin' },
  ],
  flows: [
    { id: 'f1', source: 's1', target: 't1' },
    { id: 'f2', source: 't1', target: 'e1' },
  ],
}

const xorIR: BpmnIR = {
  process_name: 'Validation achat',
  lanes: [{ id: 'demand', label: 'Demandeur' }, { id: 'resp', label: 'Responsable' }],
  nodes: [
    { id: 's1', type: 'start', lane: 'demand' },
    { id: 't1', type: 'task', lane: 'demand', label: 'Saisir demande', task_type: 'user' },
    { id: 't2', type: 'task', lane: 'resp', label: 'Examiner', task_type: 'user' },
    { id: 'g1', type: 'gateway', lane: 'resp', gateway_type: 'exclusive', label: 'Validé ?' },
    { id: 't3', type: 'task', lane: 'resp', label: 'Émettre bon de commande' },
    { id: 't4', type: 'task', lane: 'demand', label: 'Recevoir refus' },
    { id: 'e1', type: 'end', lane: 'resp' },
    { id: 'e2', type: 'end', lane: 'demand' },
  ],
  flows: [
    { id: 'f1', source: 's1', target: 't1' },
    { id: 'f2', source: 't1', target: 't2' },
    { id: 'f3', source: 't2', target: 'g1' },
    { id: 'f4', source: 'g1', target: 't3', condition: 'oui' },
    { id: 'f5', source: 'g1', target: 't4', condition: 'non' },
    { id: 'f6', source: 't3', target: 'e1' },
    { id: 'f7', source: 't4', target: 'e2' },
  ],
}

describe('irToBpmnXml', () => {
  it('produces XML that bpmn-moddle can re-parse for a simple linear process', async () => {
    const xml = await irToBpmnXml(simpleLinearIR)
    expect(xml).toContain('<?xml')
    expect(xml).toContain('bpmn:definitions')
    const { warnings } = await parseXml(xml)
    expect(warnings).toHaveLength(0)
  })

  it('produces XML containing a BPMNDiagram section', async () => {
    const xml = await irToBpmnXml(simpleLinearIR)
    expect(xml).toContain('BPMNDiagram')
    expect(xml).toContain('BPMNShape')
  })

  it('preserves task labels', async () => {
    const xml = await irToBpmnXml(simpleLinearIR)
    expect(xml).toContain('Préparer la demande')
  })

  it('encodes XOR gateway with two branches and condition labels', async () => {
    const xml = await irToBpmnXml(xorIR)
    expect(xml).toContain('exclusiveGateway')
    expect(xml).toContain('oui')
    expect(xml).toContain('non')
    const { warnings } = await parseXml(xml)
    expect(warnings).toHaveLength(0)
  })

  it('encodes lanes correctly', async () => {
    const xml = await irToBpmnXml(xorIR)
    expect(xml).toContain('Demandeur')
    expect(xml).toContain('Responsable')
    expect(xml).toContain('laneSet')
  })

  it('encodes task_type as userTask / serviceTask etc.', async () => {
    const xml = await irToBpmnXml(xorIR)
    expect(xml).toContain('userTask')
  })

  it('generates BPMNEdge entries for every sequence flow', async () => {
    const xml = await irToBpmnXml(simpleLinearIR)
    // simpleLinearIR has 2 flows (f1 and f2)
    const edgeCount = (xml.match(/<bpmndi:BPMNEdge/g) ?? []).length
    expect(edgeCount).toBe(2)
  })

  it('BPMNEdge has two waypoints connecting source and target shapes', async () => {
    const xml = await irToBpmnXml(simpleLinearIR)
    expect(xml).toMatch(/<bpmndi:BPMNEdge[^>]*bpmnElement="Flow_f1"[^>]*>[\s\S]*?<di:waypoint[^/]+\/>[\s\S]*?<di:waypoint[^/]+\/>[\s\S]*?<\/bpmndi:BPMNEdge>/)
  })

  it('encodes end events with terminate event definition', async () => {
    const ir: BpmnIR = {
      process_name: 'p',
      lanes: [{ id: 'main', label: 'M' }],
      nodes: [
        { id: 's1', type: 'start', lane: 'main' },
        { id: 'e1', type: 'end', lane: 'main', event_type: 'terminate' },
      ],
      flows: [{ id: 'f1', source: 's1', target: 'e1' }],
    }
    const xml = await irToBpmnXml(ir)
    expect(xml).toContain('terminateEventDefinition')
  })
})
