import { describe, it, expect } from 'vitest'
import { isValidBpmnIR, validateGraph, type BpmnIR } from './bpmn-ir-schema'

const minimalValidIR: BpmnIR = {
  process_name: 'Demo',
  lanes: [{ id: 'main', label: 'Main' }],
  nodes: [
    { id: 's1', type: 'start', lane: 'main' },
    { id: 't1', type: 'task', lane: 'main', label: 'Faire X' },
    { id: 'e1', type: 'end', lane: 'main' },
  ],
  flows: [
    { id: 'f1', source: 's1', target: 't1' },
    { id: 'f2', source: 't1', target: 'e1' },
  ],
}

describe('isValidBpmnIR', () => {
  it('accepts a minimal valid IR', () => {
    expect(isValidBpmnIR(minimalValidIR)).toBe(true)
  })
  it('rejects null/undefined', () => {
    expect(isValidBpmnIR(null)).toBe(false)
    expect(isValidBpmnIR(undefined)).toBe(false)
  })
  it('rejects empty lanes', () => {
    expect(isValidBpmnIR({ ...minimalValidIR, lanes: [] })).toBe(false)
  })
  it('rejects missing process_name', () => {
    const bad = { ...minimalValidIR } as Partial<BpmnIR>
    delete bad.process_name
    expect(isValidBpmnIR(bad)).toBe(false)
  })
  it('rejects gateway without gateway_type', () => {
    const bad: BpmnIR = {
      ...minimalValidIR,
      nodes: [
        ...minimalValidIR.nodes,
        // @ts-expect-error — testing runtime check
        { id: 'g1', type: 'gateway', lane: 'main' },
      ],
    }
    expect(isValidBpmnIR(bad)).toBe(false)
  })
  it('rejects task without label', () => {
    const bad: BpmnIR = {
      ...minimalValidIR,
      // @ts-expect-error — testing runtime check
      nodes: [{ id: 's1', type: 'start', lane: 'main' }, { id: 't1', type: 'task', lane: 'main' }],
    }
    expect(isValidBpmnIR(bad)).toBe(false)
  })
})

describe('validateGraph', () => {
  it('accepts a coherent minimal IR', () => {
    expect(validateGraph(minimalValidIR)).toEqual({ ok: true })
  })
  it('rejects a flow pointing to an unknown node', () => {
    const bad: BpmnIR = {
      ...minimalValidIR,
      flows: [...minimalValidIR.flows, { id: 'f3', source: 't1', target: 'ghost' }],
    }
    expect(validateGraph(bad)).toEqual({ ok: false, reason: 'flow_unknown_target', detail: 'ghost' })
  })
  it('rejects zero start events', () => {
    const bad: BpmnIR = {
      ...minimalValidIR,
      nodes: minimalValidIR.nodes.filter(n => n.type !== 'start'),
    }
    expect(validateGraph(bad).ok).toBe(false)
  })
  it('rejects multiple start events', () => {
    const bad: BpmnIR = {
      ...minimalValidIR,
      nodes: [...minimalValidIR.nodes, { id: 's2', type: 'start', lane: 'main' }],
    }
    expect(validateGraph(bad).ok).toBe(false)
  })
  it('rejects exclusive gateway with only one outgoing flow', () => {
    const bad: BpmnIR = {
      process_name: 'Demo',
      lanes: [{ id: 'main', label: 'Main' }],
      nodes: [
        { id: 's1', type: 'start', lane: 'main' },
        { id: 'g1', type: 'gateway', lane: 'main', gateway_type: 'exclusive' },
        { id: 'e1', type: 'end', lane: 'main' },
      ],
      flows: [
        { id: 'f1', source: 's1', target: 'g1' },
        { id: 'f2', source: 'g1', target: 'e1' },
      ],
    }
    expect(validateGraph(bad).ok).toBe(false)
  })
  it('rejects flow referencing a lane not in lanes[]', () => {
    const bad: BpmnIR = {
      ...minimalValidIR,
      nodes: [
        { id: 's1', type: 'start', lane: 'ghost_lane' },
        { id: 't1', type: 'task', lane: 'main', label: 'X' },
        { id: 'e1', type: 'end', lane: 'main' },
      ],
    }
    expect(validateGraph(bad).ok).toBe(false)
  })
})
