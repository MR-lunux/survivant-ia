# Modèles Infomaniak AI Tools — catalogue

> Snapshot : **2026-05-23**. À régénérer périodiquement (le catalogue évolue).

Survivant-IA utilise les AI Tools d'Infomaniak (data sovereignty CH) plutôt qu'OpenAI/Anthropic/Google. Ce document liste les modèles disponibles dans notre produit (`product_id=106389`) avec leurs caractéristiques, pour qu'on choisisse le bon par tâche.

## Comment régénérer cette liste

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "https://api.infomaniak.com/2/ai/106389/openai/v1/models" | jq .
```

Le token doit être un token valable (les tokens product-scoped utilisés par l'app fonctionnent — sinon utiliser un token Personal API depuis le manager Infomaniak). Le `product_id=106389` correspond à notre AI Tools produit Survivant-IA.

Doc Infomaniak : https://developer.infomaniak.com/docs/api/get/2/ai/%7Bproduct_id%7D/openai/v1/models

## ⚠️ Endpoint v1 vs v2 — slug catalogue différent

Piège majeur : il y a DEUX endpoints chat completions avec des catalogues de modèles différents.

| Endpoint | Slugs acceptés | Usage |
|---|---|---|
| `/1/ai/106389/openai/chat/completions` (legacy) | 6 slugs courts : `llama3`, `granite`, `mistral24b`, `mistral3`, `qwen3`, `gemma3n` | Pour les outils historiques. À déprécier. |
| `/2/ai/106389/openai/v1/chat/completions` (moderne) | Slugs HuggingFace complets du catalogue ci-dessous | **Utiliser pour tout nouvel outil.** |

Les nouveaux modèles puissants (Mistral Small 4, Qwen 3.5, Apertus 70B...) ne sont accessibles QUE via v2. Si tu vois une 422 "validation_failed: The selected model is invalid" sur v1, c'est probablement que tu utilises un slug v2 sur l'endpoint v1.

Outils Survivant-IA déjà sur v2 :
- BPMN generator (`server/utils/bpmn-generator-chat.ts`)

Outils encore sur v1 (legacy, à migrer si besoin de modèles modernes) :
- Améliorateur de prompt (`server/utils/ameliorer-prompt-chat.ts`)
- Générateur d'écriture comptable (`server/utils/generateur-comptable-chat.ts`)

## Catalogue 2026-05-23

### Modèles chat (chat completions / instruction-following)

| Slug | Architecture | Params actifs | Profil & usage recommandé |
|---|---|---|---|
| `Qwen/Qwen3.5-122B-A10B-FP8` | MoE FP8 | **10B actifs** / 122B total | **Sweet spot vitesse/capabilité.** Instruction-following structuré excellent (JSON, few-shot). Reco par défaut pour extraction structurée. |
| `mistralai/Mistral-Small-4-119B-2603` | Dense | 119B | Top capabilité brute, mais lent. Pour les tâches qui demandent vraiment du raisonnement. |
| `swiss-ai/Apertus-70B-Instruct-2509` | Dense | 70B | Modèle suisse. Vitesse moyenne. Pertinent si on veut "100% suisse de bout en bout" comme argument marketing. |
| `mistralai/Ministral-3-14B-Instruct-2512` | Dense | 14B | Successeur de Mistral 7B. ~40% plus rapide que mistral24b, qualité comparable pour les tâches simples. |
| `google/gemma-4-31B-it` | Dense | 31B | Gemma 4 (Google). Vitesse comparable à mistral24b. |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8` | MoE FP8 | **3B actifs** / 30B total | **Le plus rapide du catalogue.** Bon pour tâches simples/répétitives où la latence prime. Risque de rater des nuances. |
| `moonshotai/Kimi-K2.6` | Inconnu | Inconnu | Strong sur agentic / tool use. À tester si on fait du multi-step. |

### Modèles d'embeddings (similarité, RAG)

| Slug | Profil |
|---|---|
| `bge_multilingual_gemma2` | Embeddings multilingues (BGE / Gemma2). |
| `mini_lm_l12_v2` | Sentence Transformers, petit et rapide. |
| `Qwen/Qwen3-Embedding-8B` | Embeddings Qwen, dim haute, qualité forte. |

### Modèles audio / vision

Whisper et autres modèles spécifiques sont exposés sur d'autres endpoints (`/openai/v1/audio/transcriptions` etc.), pas dans `/models`.

## Benchmarks réels (2026-05-23)

Mini-prompt "JSON {name, steps[]}" pour 3 étapes simples, `max_tokens: 500`, via endpoint v2 :

| Modèle | Latence | Reasoning ? | Qualité JSON | Notes |
|---|---|---|---|---|
| `mistralai/Mistral-Small-4-119B-2603` | **0.97s** 🏆 | Non | Clean, schéma respecté | Wrappe en ```json``` (stripper côté wrapper). |
| `Qwen/Qwen3.5-122B-A10B-FP8` | 2.85s | **Oui** (~330 tokens brûlés en raisonnement) | Clean dans `content`, schéma respecté | Reasoning gourmand en tokens (++ max_tokens nécessaire pour BPMN). |
| `mistralai/Ministral-3-14B-Instruct-2512` | 2.89s | Non | **Inutilisable** : markdown sale, schéma ignoré, hallucine, mixe langues, truncation 500 tokens | Trop petit pour few-shot complexe. |

## Conventions de choix par outil Survivant-IA

| Outil | Tâche | Modèle reco | Justification |
|---|---|---|---|
| Améliorateur de prompt | Restructure prompt en JSON 6 champs (sortie courte) | `mistral24b` (legacy v1) | Sortie petite, latence acceptable. Migrer vers v2 + Mistral Small 4 si on veut accélérer. |
| Générateur d'écriture comptable | Extrait 1 écriture en JSON (sortie minuscule) | `mistral24b` (legacy v1) | Idem. |
| Générateur BPMN | Extrait IR JSON de 5-15 nodes + lanes + flows (sortie longue) | **`mistralai/Mistral-Small-4-119B-2603`** | Benchmark le plus rapide (0.97s mini-prompt vs 2.85s Qwen3.5), pas de reasoning à gérer, schéma respecté, capacité de raisonnement structuré 119B. |
| (Futur) Tâches agentiques / tool use | Multi-step planning | `Qwen/Qwen3.5-122B-A10B-FP8` ou `moonshotai/Kimi-K2.6` | Reasoning utile si on demande explicit pour la qualité. |
| (Futur) Cherche IA suisse de bout en bout | Argument marketing | `swiss-ai/Apertus-70B-Instruct-2509` | 100% suisse (modèle + infra). |

## Configuration env vars

L'app utilise une fallback chain :

```
NUXT_INFOMANIAK_AI_MODEL_<OUTIL>  # override par outil (ex. _BPMN)
  ↓ fallback
NUXT_INFOMANIAK_AI_MODEL          # défaut global
  ↓ fallback
'mistral24b'                      # legacy hardcoded
```

Outils déjà câblés avec un override :
- BPMN : `NUXT_INFOMANIAK_AI_MODEL_BPMN` (cf. `server/utils/bpmn-generator-chat.ts`)

À chaque nouvel outil qui demande un modèle différent du défaut, ajouter :
1. Une env var dédiée `NUXT_INFOMANIAK_AI_MODEL_<NAME>` dans `nuxt.config.ts` (runtimeConfig)
2. Une lookup avec fallback dans le wrapper chat de l'outil
3. Mettre à jour cette doc avec la ligne dans le tableau "Conventions"

## Bonnes pratiques d'orientation

- **Sortie courte (<300 tokens)** : prendre un modèle dense petit (14B) ou MoE petit (Nemotron Nano).
- **Sortie longue (>500 tokens)** : prendre un MoE qui parallélise (Qwen 3.5, voire Mistral Small 4 si capabilité critique).
- **Tool use / agentic** : tester Kimi K2.6.
- **Multi-tour conversationnel** : favoriser un modèle avec gros context (vérifier les specs sur le manager Infomaniak).
- **Embeddings sémantique pour RAG** : `Qwen/Qwen3-Embedding-8B` (qualité) ou `bge_multilingual_gemma2` (rapide).

## Notes

- Le slug `mistral24b` utilisé historiquement dans `NUXT_INFOMANIAK_AI_MODEL` n'apparaît plus dans le catalogue v2 mais reste accepté par l'endpoint chat completions v1 — Infomaniak le map probablement en interne vers un modèle équivalent. À long terme, migrer vers un slug explicite (`mistralai/Ministral-3-14B-Instruct-2512` ou autre).
- Les modèles avec date `created: null` sont des nouveautés sans timestamp officiel (ajoutés récemment au catalogue).
- Les modèles FP8 (Qwen3.5, Nemotron) sont quantifiés 8 bits — vitesse + qualité légèrement dégradée vs FP16. Suffisant pour 95% des usages.
