// server/utils/ameliorer-prompt-chat.ts
// Wrapper Infomaniak Chat dédié à l'améliorateur de prompt.
// System prompt + JSON schema spécifiques. Indépendant du wrapper
// générateur-comptable (qui a son propre system prompt).

const SYSTEM_PROMPT = `Tu es l'améliorateur de prompts de Survivant-IA. Tu reçois un prompt brut donné par un professionnel et tu le restructures selon une grille de 6 champs.

GRILLE (6 champs)
1. Rôle — point de vue que l'IA doit incarner (required)
2. Tâche — action précise à exécuter (required)
3. Format de sortie — longueur, structure, ton, langue (required)
4. Contexte — matière première, situation (optionnel, peut être null)
5. Contraintes — ce qu'il ne faut PAS faire (optionnel, peut être null)
6. Exemples — démonstrations few-shot (optionnel, peut être null)

COMPORTEMENT
- Tu réponds TOUJOURS en français, peu importe la langue du prompt brut.
- Tu produis UN objet JSON valide, rien d'autre. Pas de markdown, pas de préambule, pas d'explication hors JSON.
- Toute demande non-vide est restructurée. Tu infères un rôle plausible à partir du sujet, tu reformules la tâche, tu proposes un format raisonnable. Demande vague (« je veux X », « comment faire Y », « reformule ceci », « écris-moi un Z ») = demande valide, jamais refusée.
- Pour les champs optionnels (contexte, contraintes, exemples), mets null si l'utilisateur ne donne pas l'info.
- additions : 3 à 5 items max, du plus impactant au moins impactant. Ton direct, tutoiement, sans flatterie. Exemple : « Tu n'avais pas donné de rôle, j'ai mis 'expert RH suisse' parce que ton prompt parle d'entretiens. »
- Si le prompt initial couvre déjà 5+ champs : already_solid: true, tu resserres juste la formulation.

STRUCTURE JSON ATTENDUE (à respecter exactement)
{
  "structured": {
    "role": "string non-vide",
    "task": "string non-vide",
    "format": "string non-vide",
    "context": "string ou null",
    "constraints": "string ou null",
    "examples": "string ou null"
  },
  "additions": [
    { "field": "role|task|format|context|constraints|examples", "before": "string ou 'absent'", "after": "string", "explanation": "string" }
  ],
  "already_solid": false
}`

const JSON_SCHEMA = {
  name: 'ameliorer_prompt_or_error',
  schema: {
    type: 'object',
    properties: {
      structured: {
        type: 'object',
        properties: {
          role: { type: 'string' },
          task: { type: 'string' },
          format: { type: 'string' },
          context: { type: ['string', 'null'] },
          constraints: { type: ['string', 'null'] },
          examples: { type: ['string', 'null'] },
        },
        required: ['role', 'task', 'format', 'context', 'constraints', 'examples'],
      },
      additions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', enum: ['role', 'task', 'format', 'context', 'constraints', 'examples'] },
            before: { type: 'string' },
            after: { type: 'string' },
            explanation: { type: 'string' },
          },
          required: ['field', 'before', 'after', 'explanation'],
        },
      },
      already_solid: { type: 'boolean' },
      // shape d'erreur
      error: { type: 'string' },
      message: { type: 'string' },
    },
  },
}

export interface AmeliorerChatResult {
  // shape succès
  structured?: {
    role: string
    task: string
    format: string
    context: string | null
    constraints: string | null
    examples: string | null
  }
  additions?: Array<{
    field: 'role' | 'task' | 'format' | 'context' | 'constraints' | 'examples'
    before: string
    after: string
    explanation: string
  }>
  already_solid?: boolean
  // shape erreur (renvoyé par le modèle si garde-fou déclenché)
  error?: 'bad_input'
  message?: string
}

export interface AmeliorerChatMeta {
  input_tokens: number | null
  output_tokens: number | null
  model: string
}

export interface AmeliorerChatCallResult {
  data: AmeliorerChatResult
  meta: AmeliorerChatMeta
}

export interface AmeliorerChatOptions {
  promptBrut: string
  temperature?: number
}

export async function callAmeliorerChat({ promptBrut, temperature = 0.3 }: AmeliorerChatOptions): Promise<AmeliorerChatCallResult> {
  const config = useRuntimeConfig()
  const token = config.infomaniakAiToken
  const productId = config.infomaniakAiProductId
  const model = config.infomaniakAiModel || 'mistral24b'

  if (!token || !productId) {
    throw new Error('Infomaniak AI configuration missing (NUXT_INFOMANIAK_AI_TOKEN, NUXT_INFOMANIAK_AI_PRODUCT_ID)')
  }

  // Timeout explicite côté client. On laisse Infomaniak jusqu'à 25s pour
  // répondre — au-delà, on abort proprement et l'endpoint retourne ai_unreachable.
  // (Vercel function maxDuration par défaut = 10s Hobby, 60s Pro ; on reste
  // sous les deux pour être safe.)
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
          { role: 'user', content: promptBrut },
        ],
        response_format: { type: 'json_object' },
        temperature,
        max_tokens: 2000,
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

  let parsed: AmeliorerChatResult
  try {
    parsed = JSON.parse(content) as AmeliorerChatResult
  } catch {
    throw new Error('Infomaniak returned invalid JSON')
  }

  return {
    data: parsed,
    meta: {
      input_tokens: data.usage?.prompt_tokens ?? null,
      output_tokens: data.usage?.completion_tokens ?? null,
      model,
    },
  }
}

// Shape validation : la réponse doit être soit { error, message }, soit
// { structured: {role, task, format, ...}, additions: [...], already_solid }.
export function isValidShape(result: AmeliorerChatResult): boolean {
  if (result.error === 'bad_input' && typeof result.message === 'string') return true
  if (!result.structured) return false
  const s = result.structured
  if (typeof s.role !== 'string' || s.role.length === 0) return false
  if (typeof s.task !== 'string' || s.task.length === 0) return false
  if (typeof s.format !== 'string' || s.format.length === 0) return false
  // optionnels : string OU null
  if (s.context !== null && typeof s.context !== 'string') return false
  if (s.constraints !== null && typeof s.constraints !== 'string') return false
  if (s.examples !== null && typeof s.examples !== 'string') return false
  if (!Array.isArray(result.additions)) return false
  if (typeof result.already_solid !== 'boolean') return false
  return true
}
