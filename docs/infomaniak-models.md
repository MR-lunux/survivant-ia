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

## Conventions de choix par outil Survivant-IA

| Outil | Tâche | Modèle reco | Justification |
|---|---|---|---|
| Améliorateur de prompt | Restructure prompt en JSON 6 champs (sortie courte) | `mistral24b` (legacy) OU `Ministral-3-14B` | Sortie petite, latence importante (UX synchrone). Pas besoin de plus gros. |
| Générateur d'écriture comptable | Extrait 1 écriture en JSON (sortie minuscule) | `mistral24b` (legacy) OU `Ministral-3-14B` | Même logique. |
| Générateur BPMN | Extrait IR JSON de 5-15 nodes + lanes + flows (sortie longue) | `Qwen/Qwen3.5-122B-A10B-FP8` | MoE rapide pour output long structuré, capable sur few-shot complexe. |
| (Futur) Synthèse / résumé long | Sortie longue, raisonnement | `Mistral-Small-4-119B` | Si on accepte la latence pour la qualité. |

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
