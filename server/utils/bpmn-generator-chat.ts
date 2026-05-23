// server/utils/bpmn-generator-chat.ts
// Wrapper Infomaniak Chat dédié au générateur de processus BPMN.
// L'IA produit un IR JSON ; la conversion vers XML est faite ailleurs (ir-to-bpmn.ts).

import { isValidBpmnIR, validateGraph, type BpmnIR } from './bpmn-ir-schema'

const SYSTEM_PROMPT = `Tu es un expert BPMN 2.0 qui structure des processus métier en JSON pour Survivant-IA. Tu reçois une description en français et tu produis un IR (Intermediate Representation) JSON valide.

RÈGLES STRICTES
- Tu réponds TOUJOURS en français, en JSON pur. Pas de markdown, pas de préambule, pas d'explication hors JSON.
- Tu n'inventes JAMAIS d'étapes que la description ne mentionne pas.
- CHAQUE acteur, rôle ou département mentionné dans la description doit avoir SA PROPRE lane, même s'il n'apparaît qu'une seule fois. Pas d'exception.
- Si la description dit "X envoie à Y", "X transmet à Y", "X notifie Y", "Y reçoit de X", alors Y est un acteur DISTINCT et doit avoir sa propre lane séparée de X.
- Acteurs typiques à identifier : demandeur, employé, manager, responsable, directeur, service achats, comptabilité, RH, juridique, IT, client, fournisseur, prestataire. Lis la description en cherchant TOUS les actants.
- Si aucun acteur n'est explicitement mentionné, alors et seulement alors, utilise une lane générique unique \`processus\`.
- Si une décision est mentionnée sans branches explicites, crée la gateway exclusive et nomme les flux \`oui\`/\`non\` par défaut.
- Si la description est trop vague pour produire un processus (moins de 2 étapes identifiables), retourne \`{ "error": "too_vague", "message": "explication courte de ce qui manque" }\`.
- Toujours exactement 1 start event, au moins 1 end event.
- Toute gateway exclusive ou inclusive doit avoir au moins 2 flux sortants.
- Les IDs sont des slugs ASCII lisibles : \`valider_commande\`, \`demandeur\`, pas \`Task_0xy3\`.
- Chaque flow doit avoir un id, source et target qui pointent vers des nodes existants.
- Flux sortant d'une gateway exclusive/inclusive : ajoute toujours \`condition\` (ex: "oui", "non", "montant > 5000").

STRUCTURE IR (à respecter exactement)
{
  "process_name": "string",
  "lanes": [{ "id": "slug_ascii", "label": "Label affiché" }],
  "nodes": [
    { "id": "...", "type": "start"|"end"|"task"|"gateway"|"event_intermediate"|"subprocess", "lane": "lane_id", ...specifics },
  ],
  "flows": [{ "id": "...", "source": "node_id", "target": "node_id", "condition": "optionnel" }]
}

EXEMPLE 1 — processus linéaire simple
Description : "Le client passe une commande. Le service expédie le colis. Le client reçoit la commande."
{
  "process_name": "Commande client",
  "lanes": [
    { "id": "client", "label": "Client" },
    { "id": "service", "label": "Service expédition" }
  ],
  "nodes": [
    { "id": "debut", "type": "start", "lane": "client" },
    { "id": "passer_commande", "type": "task", "lane": "client", "label": "Passer commande", "task_type": "user" },
    { "id": "expedier", "type": "task", "lane": "service", "label": "Expédier le colis", "task_type": "user" },
    { "id": "recevoir", "type": "task", "lane": "client", "label": "Recevoir la commande", "task_type": "user" },
    { "id": "fin", "type": "end", "lane": "client" }
  ],
  "flows": [
    { "id": "f1", "source": "debut", "target": "passer_commande" },
    { "id": "f2", "source": "passer_commande", "target": "expedier" },
    { "id": "f3", "source": "expedier", "target": "recevoir" },
    { "id": "f4", "source": "recevoir", "target": "fin" }
  ]
}

EXEMPLE 2 — avec gateway exclusive
Description : "Le demandeur saisit une demande d'achat. Le responsable la valide ou la refuse. Si validée, le bon de commande est émis. Sinon, le demandeur reçoit le refus."
{
  "process_name": "Validation achat",
  "lanes": [
    { "id": "demandeur", "label": "Demandeur" },
    { "id": "responsable", "label": "Responsable achats" }
  ],
  "nodes": [
    { "id": "debut", "type": "start", "lane": "demandeur" },
    { "id": "saisir", "type": "task", "lane": "demandeur", "label": "Saisir la demande", "task_type": "user" },
    { "id": "examiner", "type": "task", "lane": "responsable", "label": "Examiner la demande", "task_type": "user" },
    { "id": "valide", "type": "gateway", "lane": "responsable", "gateway_type": "exclusive", "label": "Validée ?" },
    { "id": "emettre_bdc", "type": "task", "lane": "responsable", "label": "Émettre bon de commande", "task_type": "user" },
    { "id": "notifier_refus", "type": "task", "lane": "responsable", "label": "Notifier le refus", "task_type": "send" },
    { "id": "fin_ok", "type": "end", "lane": "responsable" },
    { "id": "fin_ko", "type": "end", "lane": "demandeur" }
  ],
  "flows": [
    { "id": "f1", "source": "debut", "target": "saisir" },
    { "id": "f2", "source": "saisir", "target": "examiner" },
    { "id": "f3", "source": "examiner", "target": "valide" },
    { "id": "f4", "source": "valide", "target": "emettre_bdc", "condition": "oui" },
    { "id": "f5", "source": "valide", "target": "notifier_refus", "condition": "non" },
    { "id": "f6", "source": "emettre_bdc", "target": "fin_ok" },
    { "id": "f7", "source": "notifier_refus", "target": "fin_ko" }
  ]
}

EXEMPLE 3 — envoi vers un service tiers (lane à ne pas oublier)
Description : "L'employé soumet sa note de frais. Le manager la valide puis l'envoie à la comptabilité pour remboursement."
{
  "process_name": "Note de frais",
  "lanes": [
    { "id": "employe", "label": "Employé" },
    { "id": "manager", "label": "Manager" },
    { "id": "comptabilite", "label": "Comptabilité" }
  ],
  "nodes": [
    { "id": "debut", "type": "start", "lane": "employe" },
    { "id": "soumettre", "type": "task", "lane": "employe", "label": "Soumettre la note de frais", "task_type": "user" },
    { "id": "valider", "type": "task", "lane": "manager", "label": "Valider la note", "task_type": "user" },
    { "id": "envoyer_compta", "type": "task", "lane": "manager", "label": "Envoyer à la comptabilité", "task_type": "send" },
    { "id": "rembourser", "type": "task", "lane": "comptabilite", "label": "Effectuer le remboursement", "task_type": "user" },
    { "id": "fin", "type": "end", "lane": "comptabilite" }
  ],
  "flows": [
    { "id": "f1", "source": "debut", "target": "soumettre" },
    { "id": "f2", "source": "soumettre", "target": "valider" },
    { "id": "f3", "source": "valider", "target": "envoyer_compta" },
    { "id": "f4", "source": "envoyer_compta", "target": "rembourser" },
    { "id": "f5", "source": "rembourser", "target": "fin" }
  ]
}`

const JSON_SCHEMA = {
  name: 'bpmn_ir_or_error',
  schema: {
    type: 'object',
    properties: {
      process_name: { type: 'string' },
      lanes: { type: 'array', items: { type: 'object' } },
      nodes: { type: 'array', items: { type: 'object' } },
      flows: { type: 'array', items: { type: 'object' } },
      error: { type: 'string' },
      message: { type: 'string' },
    },
  },
}

export interface BpmnChatResult {
  ir?: BpmnIR
  error?: 'too_vague'
  message?: string
}

export interface BpmnChatMeta {
  input_tokens: number | null
  output_tokens: number | null
  model: string
}

export interface BpmnChatCallResult {
  data: BpmnChatResult
  meta: BpmnChatMeta
}

export interface BpmnChatOptions {
  description: string
  temperature?: number
}

export async function callBpmnGeneratorChat({ description, temperature = 0.2 }: BpmnChatOptions): Promise<BpmnChatCallResult> {
  const config = useRuntimeConfig()
  const token = config.infomaniakAiToken
  const productId = config.infomaniakAiProductId
  const model = config.infomaniakAiModel || 'mistral24b'

  if (!token || !productId) {
    throw new Error('Infomaniak AI configuration missing (NUXT_INFOMANIAK_AI_TOKEN, NUXT_INFOMANIAK_AI_PRODUCT_ID)')
  }

  const ABORT_MS = 25_000
  const controller = new AbortController()
  const abortTimeout = setTimeout(() => controller.abort(), ABORT_MS)

  let response: Response
  const fetchStart = Date.now()
  try {
    response = await fetch(`https://api.infomaniak.com/1/ai/${productId}/openai/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: description },
        ],
        response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
        temperature,
        max_tokens: 2500,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') {
      throw new Error(`Infomaniak chat timeout après ${ABORT_MS}ms (modèle ${model})`)
    }
    throw err
  } finally {
    clearTimeout(abortTimeout)
  }

  const fetchDuration = Date.now() - fetchStart

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Infomaniak chat API error ${response.status} après ${fetchDuration}ms (modèle ${model}): ${errorText.slice(0, 200)}`)
  }

  const data = await response.json() as {
    choices?: { message?: { content?: string } }[]
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Infomaniak returned no content')

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('Infomaniak returned invalid JSON')
  }

  // Two possible shapes : { error, message } OR a full IR
  if (parsed.error === 'too_vague' && typeof parsed.message === 'string') {
    return {
      data: { error: 'too_vague', message: parsed.message },
      meta: {
        input_tokens: data.usage?.prompt_tokens ?? null,
        output_tokens: data.usage?.completion_tokens ?? null,
        model,
      },
    }
  }

  return {
    data: { ir: parsed as unknown as BpmnIR },
    meta: {
      input_tokens: data.usage?.prompt_tokens ?? null,
      output_tokens: data.usage?.completion_tokens ?? null,
      model,
    },
  }
}

// Validate shape AND graph coherence in one call.
export function isValidBpmnChatResult(result: BpmnChatResult): boolean {
  if (result.error === 'too_vague' && typeof result.message === 'string') return true
  if (!result.ir) return false
  if (!isValidBpmnIR(result.ir)) return false
  if (!validateGraph(result.ir).ok) return false
  return true
}
