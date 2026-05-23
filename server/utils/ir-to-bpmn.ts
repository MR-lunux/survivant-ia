// server/utils/ir-to-bpmn.ts
// IR → BPMN 2.0 XML via bpmn-moddle avec layout horizontal custom.
// Pure, déterministe, testable offline.

import BpmnModdle from 'bpmn-moddle'
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

// ── Layout constants ─────────────────────────────────────────────────────────

const COLUMN_WIDTH = 180
const NODE_GAP_Y = 30
const LANE_HEADER_WIDTH = 30
const LANE_PADDING_Y = 20
const LANE_MIN_HEIGHT = 120
const NODE_GAP_X = 20  // extra padding on right side of canvas

const SIZE: Record<string, { w: number; h: number }> = {
  start:              { w: 36,  h: 36  },
  end:                { w: 36,  h: 36  },
  task:               { w: 120, h: 80  },
  gateway:            { w: 50,  h: 50  },
  event_intermediate: { w: 36,  h: 36  },
  subprocess:         { w: 140, h: 90  },
}

interface Bounds { x: number; y: number; width: number; height: number }
interface Point { x: number; y: number }

// ── Topological depth via BFS ────────────────────────────────────────────────

function computeDepths(ir: BpmnIR): Map<string, number> {
  // Build adjacency: nodeId → outgoing target IDs
  const successors = new Map<string, string[]>()
  const predecessorCount = new Map<string, number>()
  for (const n of ir.nodes) {
    successors.set(n.id, [])
    predecessorCount.set(n.id, 0)
  }
  for (const f of ir.flows) {
    successors.get(f.source)?.push(f.target)
    predecessorCount.set(f.target, (predecessorCount.get(f.target) ?? 0) + 1)
  }

  const depths = new Map<string, number>()
  // BFS from all roots (nodes with no predecessors)
  const queue: string[] = []
  for (const n of ir.nodes) {
    if ((predecessorCount.get(n.id) ?? 0) === 0) {
      depths.set(n.id, 0)
      queue.push(n.id)
    }
  }

  // If no roots found (cycle?), assign 0 to all
  if (queue.length === 0) {
    for (const n of ir.nodes) depths.set(n.id, 0)
    return depths
  }

  let i = 0
  while (i < queue.length) {
    const current = queue[i++]!
    const currentDepth = depths.get(current) ?? 0
    for (const next of (successors.get(current) ?? [])) {
      const newDepth = currentDepth + 1
      if (!depths.has(next) || depths.get(next)! < newDepth) {
        depths.set(next, newDepth)
        queue.push(next)
      }
    }
  }

  // Fallback: any node not yet reached gets depth 0
  for (const n of ir.nodes) {
    if (!depths.has(n.id)) depths.set(n.id, 0)
  }

  return depths
}

// ── Custom horizontal layout ──────────────────────────────────────────────────

function computeLayout(ir: BpmnIR): {
  nodeBounds: Map<string, Bounds>
  laneBounds: Map<string, Bounds>
  edgeWaypoints: Map<string, Point[]>
} {
  const depths = computeDepths(ir)
  const maxDepth = Math.max(0, ...Array.from(depths.values()))

  // Determine global canvas width (all lanes share the same width)
  const maxNodeW = Math.max(...Object.values(SIZE).map(s => s.w))
  const canvasWidth = LANE_HEADER_WIDTH + (maxDepth + 1) * COLUMN_WIDTH + maxNodeW / 2 + NODE_GAP_X

  const nodeBounds = new Map<string, Bounds>()
  const laneBounds = new Map<string, Bounds>()

  let currentY = 0

  for (const lane of ir.lanes) {
    const nodesInLane = ir.nodes.filter(n => n.lane === lane.id)

    // Group by depth
    const byDepth = new Map<number, string[]>()
    for (const n of nodesInLane) {
      const d = depths.get(n.id) ?? 0
      if (!byDepth.has(d)) byDepth.set(d, [])
      byDepth.get(d)!.push(n.id)
    }

    // Compute max node height in this lane
    const maxNodeH = nodesInLane.length > 0
      ? Math.max(...nodesInLane.map(n => SIZE[n.type]?.h ?? SIZE.task.h))
      : SIZE.task.h

    // Compute lane height: max column occupancy
    let maxColumnHeight = 0
    for (const [, nodeIds] of byDepth) {
      const colHeight = LANE_PADDING_Y
        + nodeIds.length * (maxNodeH + NODE_GAP_Y)
        - NODE_GAP_Y  // remove trailing gap
        + LANE_PADDING_Y
      if (colHeight > maxColumnHeight) maxColumnHeight = colHeight
    }
    const laneHeight = Math.max(LANE_MIN_HEIGHT, maxColumnHeight)

    laneBounds.set(lane.id, {
      x: 0,
      y: currentY,
      width: canvasWidth,
      height: laneHeight,
    })

    // Place nodes within this lane
    for (const [depth, nodeIds] of byDepth) {
      // Center the column of nodes vertically in the lane
      const totalColH = nodeIds.length * maxNodeH + (nodeIds.length - 1) * NODE_GAP_Y
      const colStartY = currentY + (laneHeight - totalColH) / 2

      nodeIds.forEach((nodeId, i) => {
        const node = ir.nodes.find(n => n.id === nodeId)!
        const { w, h } = SIZE[node.type] ?? SIZE.task
        // Center node horizontally in its column
        const colLeft = LANE_HEADER_WIDTH + depth * COLUMN_WIDTH
        const x = colLeft + (COLUMN_WIDTH - w) / 2
        const y = colStartY + i * (maxNodeH + NODE_GAP_Y) + (maxNodeH - h) / 2
        nodeBounds.set(nodeId, { x, y, width: w, height: h })
      })
    }

    currentY += laneHeight
  }

  // Compute edges
  const edgeWaypoints = new Map<string, Point[]>()
  for (const flow of ir.flows) {
    const src = nodeBounds.get(flow.source)
    const tgt = nodeBounds.get(flow.target)
    if (!src || !tgt) continue

    const srcRight = src.x + src.width
    const srcCenterY = src.y + src.height / 2
    const tgtLeft = tgt.x
    const tgtCenterY = tgt.y + tgt.height / 2

    let waypoints: Point[]
    if (Math.abs(srcCenterY - tgtCenterY) < 1) {
      // Straight horizontal
      waypoints = [
        { x: srcRight, y: srcCenterY },
        { x: tgtLeft, y: tgtCenterY },
      ]
    } else {
      // Orthogonal L-shape: right → down/up → right
      const midX = srcRight + (tgtLeft - srcRight) / 2
      waypoints = [
        { x: srcRight, y: srcCenterY },
        { x: midX, y: srcCenterY },
        { x: midX, y: tgtCenterY },
        { x: tgtLeft, y: tgtCenterY },
      ]
    }
    edgeWaypoints.set(flow.id, waypoints)
  }

  return { nodeBounds, laneBounds, edgeWaypoints }
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
  const flowMddleById = new Map<string, ModdleElement>()
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
    flowMddleById.set(f.id, flow)
  }

  // ── Build lanes ─────────────────────────────────────────────────────────────
  const laneMddleById = new Map<string, ModdleElement>()
  const lanes = ir.lanes.map((lane: BpmnLane) => {
    const laneNodeRefs = ir.nodes
      .filter(n => n.lane === lane.id)
      .map(n => nodeMddleById.get(n.id))
      .filter((v): v is ModdleElement => Boolean(v))
    const laneEl = moddle.create('bpmn:Lane', {
      id: bpmnId('Lane', lane.id),
      name: lane.label,
      flowNodeRef: laneNodeRefs,
    })
    laneMddleById.set(lane.id, laneEl as ModdleElement)
    return laneEl
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

  // ── Custom horizontal layout ─────────────────────────────────────────────────
  const { nodeBounds, laneBounds, edgeWaypoints } = computeLayout(ir)

  // ── Build BPMNDiagram ────────────────────────────────────────────────────────
  const planeElements: ModdleElement[] = []

  // Lane shapes
  for (const lane of ir.lanes) {
    const bounds = laneBounds.get(lane.id)!
    const laneEl = laneMddleById.get(lane.id)!
    const shape = moddle.create('bpmndi:BPMNShape', {
      id: `Lane_${safeBpmnId(lane.id)}_di`,
      bpmnElement: laneEl,
      bounds: moddle.create('dc:Bounds', bounds),
    }) as ModdleElement
    // isHorizontal must be set explicitly for lane shapes
    shape.isHorizontal = true
    planeElements.push(shape)
  }

  // Node shapes
  for (const n of ir.nodes) {
    const bounds = nodeBounds.get(n.id)
    if (!bounds) continue
    const nodeEl = nodeMddleById.get(n.id)!
    const shape = moddle.create('bpmndi:BPMNShape', {
      id: `${nodeBpmnId(n)}_di`,
      bpmnElement: nodeEl,
      bounds: moddle.create('dc:Bounds', bounds),
    }) as ModdleElement
    if (n.type === 'gateway') shape.isMarkerVisible = true
    planeElements.push(shape)
  }

  // Edges
  for (const f of ir.flows) {
    const waypoints = edgeWaypoints.get(f.id)
    if (!waypoints) continue
    const flowEl = flowMddleById.get(f.id)!
    const edge = moddle.create('bpmndi:BPMNEdge', {
      id: `Edge_${bpmnId('Flow', f.id)}`,
      bpmnElement: flowEl,
      waypoint: waypoints.map(w => moddle.create('dc:Point', w)),
    }) as ModdleElement
    planeElements.push(edge)
  }

  const plane = moddle.create('bpmndi:BPMNPlane', {
    id: 'BPMNPlane_1',
    bpmnElement: process,
    planeElement: planeElements,
  })

  const diagram = moddle.create('bpmndi:BPMNDiagram', {
    id: 'BPMNDiagram_1',
    plane,
  })

  definitions.diagrams = [diagram]

  const { xml } = await moddle.toXML(definitions, { format: true })
  return xml
}
