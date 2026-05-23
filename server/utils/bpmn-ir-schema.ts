// server/utils/bpmn-ir-schema.ts
// IR (Intermediate Representation) qu'on demande à l'IA de produire.
// Schéma simple, pas de coordonnées : bpmn-auto-layout s'en charge.

export type LaneId = string
export type NodeId = string

export interface BpmnLane {
  id: LaneId
  label: string
}

export type BpmnNode =
  | { id: NodeId; type: 'start';              lane: LaneId; label?: string; event_type?: 'none' | 'timer' | 'message' }
  | { id: NodeId; type: 'end';                lane: LaneId; label?: string; event_type?: 'none' | 'terminate' | 'error' | 'message' }
  | { id: NodeId; type: 'task';               lane: LaneId; label: string;  task_type?: 'user' | 'service' | 'manual' | 'send' | 'receive' }
  | { id: NodeId; type: 'gateway';            lane: LaneId; label?: string; gateway_type: 'exclusive' | 'parallel' | 'inclusive' }
  | { id: NodeId; type: 'event_intermediate'; lane: LaneId; label?: string; event_type: 'timer' | 'message' | 'error' }
  | { id: NodeId; type: 'subprocess';         lane: LaneId; label: string }

export interface BpmnFlow {
  id: string
  source: NodeId
  target: NodeId
  condition?: string
}

export interface BpmnIR {
  process_name: string
  lanes: BpmnLane[]
  nodes: BpmnNode[]
  flows: BpmnFlow[]
}

// ─── Shape guard ─────────────────────────────────────────────────────

function isString(v: unknown): v is string {
  return typeof v === 'string'
}
function nonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0
}
function isLane(v: unknown): v is BpmnLane {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return nonEmptyString(r.id) && nonEmptyString(r.label)
}

const NODE_TYPES = ['start', 'end', 'task', 'gateway', 'event_intermediate', 'subprocess'] as const
const GATEWAY_TYPES = ['exclusive', 'parallel', 'inclusive']
const INTERMEDIATE_EVENT_TYPES = ['timer', 'message', 'error']
const START_EVENT_TYPES = ['none', 'timer', 'message']
const END_EVENT_TYPES = ['none', 'terminate', 'error', 'message']
const TASK_TYPES = ['user', 'service', 'manual', 'send', 'receive']

function isNode(v: unknown): v is BpmnNode {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  if (!nonEmptyString(r.id) || !nonEmptyString(r.lane)) return false
  if (!isString(r.type) || !NODE_TYPES.includes(r.type as typeof NODE_TYPES[number])) return false
  switch (r.type) {
    case 'task':
    case 'subprocess':
      return nonEmptyString(r.label) && (r.type === 'subprocess' || r.task_type === undefined || TASK_TYPES.includes(r.task_type as string))
    case 'gateway':
      return nonEmptyString(r.gateway_type) && GATEWAY_TYPES.includes(r.gateway_type as string)
    case 'event_intermediate':
      return nonEmptyString(r.event_type) && INTERMEDIATE_EVENT_TYPES.includes(r.event_type as string)
    case 'start':
      return r.event_type === undefined || START_EVENT_TYPES.includes(r.event_type as string)
    case 'end':
      return r.event_type === undefined || END_EVENT_TYPES.includes(r.event_type as string)
  }
  return false
}

function isFlow(v: unknown): v is BpmnFlow {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return nonEmptyString(r.id) && nonEmptyString(r.source) && nonEmptyString(r.target)
    && (r.condition === undefined || isString(r.condition))
}

export function isValidBpmnIR(v: unknown): v is BpmnIR {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  if (!nonEmptyString(r.process_name)) return false
  if (!Array.isArray(r.lanes) || r.lanes.length === 0 || !r.lanes.every(isLane)) return false
  if (!Array.isArray(r.nodes) || r.nodes.length === 0 || !r.nodes.every(isNode)) return false
  if (!Array.isArray(r.flows) || !r.flows.every(isFlow)) return false
  return true
}

// ─── Graph validation (semantic) ─────────────────────────────────────

export interface GraphValidationResult {
  ok: boolean
  reason?:
    | 'no_start'
    | 'multiple_start'
    | 'no_end'
    | 'flow_unknown_source'
    | 'flow_unknown_target'
    | 'lane_unknown'
    | 'gateway_branching_invalid'
    | 'duplicate_node_id'
    | 'duplicate_flow_id'
  detail?: string
}

export function validateGraph(ir: BpmnIR): GraphValidationResult {
  // Duplicate IDs
  const nodeIds = new Set<string>()
  for (const n of ir.nodes) {
    if (nodeIds.has(n.id)) return { ok: false, reason: 'duplicate_node_id', detail: n.id }
    nodeIds.add(n.id)
  }
  const flowIds = new Set<string>()
  for (const f of ir.flows) {
    if (flowIds.has(f.id)) return { ok: false, reason: 'duplicate_flow_id', detail: f.id }
    flowIds.add(f.id)
  }

  // Lanes coherence
  const laneIds = new Set(ir.lanes.map(l => l.id))
  for (const n of ir.nodes) {
    if (!laneIds.has(n.lane)) return { ok: false, reason: 'lane_unknown', detail: `${n.id} → ${n.lane}` }
  }

  // Start / end counts
  const starts = ir.nodes.filter(n => n.type === 'start')
  const ends = ir.nodes.filter(n => n.type === 'end')
  if (starts.length === 0) return { ok: false, reason: 'no_start' }
  if (starts.length > 1) return { ok: false, reason: 'multiple_start' }
  if (ends.length === 0) return { ok: false, reason: 'no_end' }

  // Flow source/target reachability
  for (const f of ir.flows) {
    if (!nodeIds.has(f.source)) return { ok: false, reason: 'flow_unknown_source', detail: f.source }
    if (!nodeIds.has(f.target)) return { ok: false, reason: 'flow_unknown_target', detail: f.target }
  }

  // Exclusive / inclusive gateways must branch (≥ 2 outgoing flows)
  const outgoingByNode = new Map<string, number>()
  for (const f of ir.flows) {
    outgoingByNode.set(f.source, (outgoingByNode.get(f.source) ?? 0) + 1)
  }
  for (const n of ir.nodes) {
    if (n.type === 'gateway' && (n.gateway_type === 'exclusive' || n.gateway_type === 'inclusive')) {
      const out = outgoingByNode.get(n.id) ?? 0
      if (out < 2) return { ok: false, reason: 'gateway_branching_invalid', detail: n.id }
    }
  }

  return { ok: true }
}
