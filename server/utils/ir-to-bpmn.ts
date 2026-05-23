// server/utils/ir-to-bpmn.ts
// IR → BPMN 2.0 XML via bpmn-moddle (structure) + bpmn-auto-layout (diagramme).
// Pure, déterministe, testable offline.

import BpmnModdle from 'bpmn-moddle'
import { layoutProcess } from 'bpmn-auto-layout'
import type { BpmnIR, BpmnNode, BpmnLane } from './bpmn-ir-schema'

function safeBpmnId(rawId: string): string {
  return rawId.replace(/[^a-zA-Z0-9_]/g, '_')
}

function bpmnId(prefix: string, rawId: string): string {
  return `${prefix}_${safeBpmnId(rawId)}`
}

function nodeBpmnId(n: BpmnNode): string {
  switch (n.type) {
    case 'start':             return bpmnId('StartEvent', n.id)
    case 'end':               return bpmnId('EndEvent', n.id)
    case 'task':              return bpmnId('Task', n.id)
    case 'gateway':           return bpmnId('Gateway', n.id)
    case 'event_intermediate': return bpmnId('IntermediateEvent', n.id)
    case 'subprocess':        return bpmnId('SubProcess', n.id)
  }
}

function taskElementType(n: BpmnNode & { type: 'task' }): string {
  switch (n.task_type) {
    case 'user':    return 'bpmn:UserTask'
    case 'service': return 'bpmn:ServiceTask'
    case 'manual':  return 'bpmn:ManualTask'
    case 'send':    return 'bpmn:SendTask'
    case 'receive': return 'bpmn:ReceiveTask'
    default:        return 'bpmn:Task'
  }
}

function gatewayElementType(n: BpmnNode & { type: 'gateway' }): string {
  switch (n.gateway_type) {
    case 'exclusive': return 'bpmn:ExclusiveGateway'
    case 'parallel':  return 'bpmn:ParallelGateway'
    case 'inclusive': return 'bpmn:InclusiveGateway'
  }
}

type ModdleElement = Record<string, unknown> & { $type: string; id?: string }

interface BpmnBounds {
  x: number
  y: number
  width: number
  height: number
}

interface BpmnShape extends ModdleElement {
  bpmnElement: ModdleElement
  bounds: BpmnBounds
}

interface BpmnSequenceFlow extends ModdleElement {
  sourceRef: ModdleElement
  targetRef: ModdleElement
}

/**
 * bpmn-auto-layout generates BPMNShape positions but no BPMNEdge entries.
 * This helper re-parses the laid-out XML, then adds a BPMNEdge for every
 * bpmn:SequenceFlow using bottom-center → top-center waypoints.
 */
async function addSequenceFlowEdges(xml: string): Promise<string> {
  const moddle = new BpmnModdle()
  const { rootElement: definitions } = await moddle.fromXML(xml) as { rootElement: ModdleElement }

  const rootElements = definitions.rootElements as ModdleElement[]
  const process = rootElements.find(el => el.$type === 'bpmn:Process') as ModdleElement | undefined
  if (!process) return xml

  const diagrams = definitions.diagrams as ModdleElement[]
  if (!diagrams?.length) return xml
  const plane = (diagrams[0] as ModdleElement).plane as ModdleElement
  if (!plane) return xml

  const planeElements = plane.planeElement as ModdleElement[]

  // Build lookup: bpmnElement id → BPMNShape
  const shapesByElementId = new Map<string, BpmnShape>()
  for (const el of planeElements) {
    if (el.$type === 'bpmndi:BPMNShape') {
      const shape = el as BpmnShape
      const refId = (shape.bpmnElement as ModdleElement)?.id ?? (shape.get('bpmnElement') as ModdleElement)?.id
      if (refId) shapesByElementId.set(refId, shape)
    }
  }

  // For each SequenceFlow, add a BPMNEdge
  const flowElements = process.flowElements as ModdleElement[]
  for (const el of flowElements) {
    if (el.$type !== 'bpmn:SequenceFlow') continue
    const flow = el as BpmnSequenceFlow

    const sourceRef = (flow.sourceRef ?? flow.get?.('sourceRef')) as ModdleElement
    const targetRef = (flow.targetRef ?? flow.get?.('targetRef')) as ModdleElement
    const sourceId = sourceRef?.id
    const targetId = targetRef?.id
    if (!sourceId || !targetId) continue

    const sourceShape = shapesByElementId.get(sourceId)
    const targetShape = shapesByElementId.get(targetId)
    if (!sourceShape || !targetShape) continue

    const sb = sourceShape.bounds
    const tb = targetShape.bounds

    // bottom-center of source → top-center of target
    const wp1 = moddle.create('dc:Point', { x: sb.x + sb.width / 2, y: sb.y + sb.height })
    const wp2 = moddle.create('dc:Point', { x: tb.x + tb.width / 2, y: tb.y })

    const flowId = flow.id ?? (flow.get?.('id') as string)
    const edge = moddle.create('bpmndi:BPMNEdge', {
      id: `Edge_${flowId}`,
      bpmnElement: flow,
      waypoint: [wp1, wp2],
    }) as ModdleElement

    planeElements.push(edge)
  }

  const { xml: resultXml } = await moddle.toXML(definitions, { format: true })
  return resultXml
}

export async function irToBpmnXml(ir: BpmnIR): Promise<string> {
  const moddle = new BpmnModdle()

  const flowElements: ModdleElement[] = []
  const nodeMddleById = new Map<string, ModdleElement>()

  // ── Build nodes ─────────────────────────────────────────────────────────────
  for (const n of ir.nodes) {
    const id = nodeBpmnId(n)
    let el: ModdleElement

    if (n.type === 'start') {
      el = moddle.create('bpmn:StartEvent', { id, name: n.label ?? '' }) as ModdleElement
      if (n.event_type === 'timer') {
        el.eventDefinitions = [moddle.create('bpmn:TimerEventDefinition', {})]
      } else if (n.event_type === 'message') {
        el.eventDefinitions = [moddle.create('bpmn:MessageEventDefinition', {})]
      }
    } else if (n.type === 'end') {
      el = moddle.create('bpmn:EndEvent', { id, name: n.label ?? '' }) as ModdleElement
      if (n.event_type === 'terminate') {
        el.eventDefinitions = [moddle.create('bpmn:TerminateEventDefinition', {})]
      } else if (n.event_type === 'error') {
        el.eventDefinitions = [moddle.create('bpmn:ErrorEventDefinition', {})]
      } else if (n.event_type === 'message') {
        el.eventDefinitions = [moddle.create('bpmn:MessageEventDefinition', {})]
      }
    } else if (n.type === 'task') {
      el = moddle.create(taskElementType(n), { id, name: n.label }) as ModdleElement
    } else if (n.type === 'gateway') {
      el = moddle.create(gatewayElementType(n), { id, name: n.label ?? '' }) as ModdleElement
    } else if (n.type === 'event_intermediate') {
      el = moddle.create('bpmn:IntermediateCatchEvent', { id, name: n.label ?? '' }) as ModdleElement
      const evDef =
        n.event_type === 'timer' ? moddle.create('bpmn:TimerEventDefinition', {}) :
        n.event_type === 'error' ? moddle.create('bpmn:ErrorEventDefinition', {}) :
                                   moddle.create('bpmn:MessageEventDefinition', {})
      el.eventDefinitions = [evDef]
    } else {
      // subprocess
      el = moddle.create('bpmn:SubProcess', { id, name: n.label }) as ModdleElement
    }

    flowElements.push(el)
    nodeMddleById.set(n.id, el)
  }

  // ── Build sequence flows ─────────────────────────────────────────────────────
  for (const f of ir.flows) {
    const sourceEl = nodeMddleById.get(f.source)
    const targetEl = nodeMddleById.get(f.target)
    if (!sourceEl || !targetEl) {
      throw new Error(`Flow ${f.id} references unknown node (${f.source} → ${f.target})`)
    }
    const flow = moddle.create('bpmn:SequenceFlow', {
      id: bpmnId('Flow', f.id),
      name: f.condition ?? '',
      sourceRef: sourceEl,
      targetRef: targetEl,
    }) as ModdleElement
    flowElements.push(flow)
  }

  // ── Build lanes ─────────────────────────────────────────────────────────────
  const lanes = ir.lanes.map((lane: BpmnLane) => {
    const laneNodeRefs = ir.nodes
      .filter(n => n.lane === lane.id)
      .map(n => nodeMddleById.get(n.id))
      .filter((v): v is ModdleElement => Boolean(v))
    return moddle.create('bpmn:Lane', {
      id: bpmnId('Lane', lane.id),
      name: lane.label,
      flowNodeRef: laneNodeRefs,
    })
  })
  const laneSet = moddle.create('bpmn:LaneSet', { id: 'LaneSet_1', lanes })

  // ── Build process ────────────────────────────────────────────────────────────
  const processId = bpmnId('Process', ir.process_name.toLowerCase().replace(/\s+/g, '_')) || 'Process_1'
  const process = moddle.create('bpmn:Process', {
    id: processId,
    name: ir.process_name,
    isExecutable: false,
    laneSets: [laneSet],
    flowElements,
  })

  // ── Build definitions ────────────────────────────────────────────────────────
  const definitions = moddle.create('bpmn:Definitions', {
    targetNamespace: 'http://survivant-ia.ch/bpmn',
    rootElements: [process],
  })

  // ── Serialize → auto-layout → inject edges → return ────────────────────────
  const { xml: rawXml } = await moddle.toXML(definitions, { format: true })
  const laidOutXml = await layoutProcess(rawXml)
  return await addSequenceFlowEdges(laidOutXml)
}
