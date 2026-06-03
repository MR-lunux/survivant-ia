# Checklist avant de créer une nouvelle skill ou un cron Survivant-IA

**Source : leçon apprise 2026-06-03** — première itération créait des crons en mode `--skill xxx` qui chargeaient **143k tokens** par run (overhead Hermes ~14k fixed + 183 skills descriptions ~36k + body + context). Coût projeté : **5-20 CHF/mois** pour 3 crons. Inacceptable.

Après refonte via mode `--no-agent --script` (cf. [doc officielle](https://hermes-agent.nousresearch.com/docs/guides/cron-script-only)), **coût mensuel des 3 crons passé à ~0.10 CHF/mois** (95% d'économie).

---

## Avant de toucher quoi que ce soit, réponds OUI à ces 6 questions :

### 1. Combien de runs/mois estimés ?
- Quotidien = 30 runs
- Hebdomadaire = 4 runs
- Push à la demande = ~30/mois
- Cap dur : si > 100 runs/mois → mode `--no-agent` obligatoire.

### 2. Cette skill peut-elle être 100% Python (pas de LLM) ?
- Si oui → mode `--no-agent --script foo.py`, **coût = 0 token LLM**.
- Exemple : daily-budget-check (parse `hermes insights`, formatte, send).

### 3. Combien d'appels LLM par run ?
**Cible : 0 ou 1.** Si tu réponds 2+, justifie. 5+ → refactor obligatoire.
- 0 LLM : pur Python.
- 1 LLM : Python collecte + ranke, 1 call ciblé. Mode `--no-agent --script` + `requests.post()` direct à l'API Infomaniak.
- 3 LLM (audit lint-wiki) : tolérable seulement si tâche hebdo.
- N LLM : agent Hermes natif via profile `survivant-ia` (orchestrateur).

### 4. Quel modèle ?
- **Mistral-Small-4-119B** (default) : qualité, sub-seconde. Coût modeste.
- **Apertus-70B-Instruct** : cross-model audit (anti-hallucination), Swiss souverain bonus.
- **Nemotron-Nano-3B-A3B-FP8** : ultra cheap, classification/tagging.
- **Qwen3.5-122B-A10B-FP8** : reasoning intensif. **PLUS CHER** (reasoning tokens) → éviter sauf nécessaire absolu.

### 5. Coût estimé par run, par mois ?
Calcul :
- Input tokens × 0.0005 CHF/1k (Mistral, estimation)
- Output tokens × 0.0015 CHF/1k
- Cap mois mensuel cible : **< 5 CHF** pour tous les crons + skills réunis.
- Exit criteria SKILL.md racine : **> 50 CHF/mois** → Hermes s'arrête.

### 6. Ai-je testé EN MODE SCRIPT avant de créer le cron ?
**Toujours** :
1. Écrire `.hermes/scripts/foo.py`
2. Tester en local : `python3 .hermes/scripts/foo.py`
3. Tester via container : `docker exec --user hermes hermes /opt/hermes/.venv/bin/python3 /opt/data/scripts/foo.py`
4. SEULEMENT après ces 3 étapes → créer le cron.

---

## Arbre de décision

```
                  ┌─────────────────────┐
                  │ Nouvelle skill/cron │
                  └──────────┬──────────┘
                             │
              ┌──────────────┴──────────────┐
              │ Tâche déterministe ?        │
              └──────────────┬──────────────┘
                             │
            ┌────────────────┴────────────────┐
           OUI                                NON
            │                                  │
            ▼                                  ▼
   ┌────────────────────┐    ┌─────────────────────────────┐
   │ --no-agent         │    │ 1 seul call LLM contrôlable ? │
   │ --script foo.py    │    └─────────────┬───────────────┘
   │ 0 tokens LLM       │                  │
   └────────────────────┘     ┌────────────┴────────────┐
                             OUI                       NON
                              │                         │
                              ▼                         ▼
                ┌─────────────────────────┐  ┌─────────────────────┐
                │ Python script +         │  │ hermes chat         │
                │ requests.post() direct  │  │ --profile           │
                │ --no-agent --script     │  │ survivant-ia        │
                │ ~0.001-0.02 CHF/run     │  │ (orchestrateur)     │
                └─────────────────────────┘  │ ~0.02-0.05 CHF/run  │
                                             └─────────────────────┘
```

---

## Anti-patterns INTERDITS (cf. hard rule #9 SKILL.md racine)

❌ `hermes cron create '0 21 * * *' --skill survivant-ia/foo --deliver telegram`
   → charge ~50k tokens overhead à chaque run, 50 CHF/mois après quelques semaines.

❌ Créer une skill avec un SKILL.md > 5k caractères "au cas où il faudrait du contexte".
   → Hermes charge tout dans le system prompt.

❌ Cron qui invoque l'agent sans préciser `--profile survivant-ia`.
   → Charge les 183 skills built-in.

❌ "Je vais tester direct via cron, c'est plus rapide qu'un test local."
   → Tu paies les tokens d'un test qui aurait pu être gratuit.

---

## Patterns AUTORISÉS

✅ Cron `--no-agent --script foo.py --deliver telegram` (le mode "officiel" Nous Research)

✅ Skill courte (<3k chars) avec format minimal `## When to Use / ## Procedure / ## Pitfalls / ## Verification`

✅ Une seule skill par dossier `.hermes/skills/survivant-ia/<name>/SKILL.md`

✅ Test : `docker exec --user hermes hermes /opt/hermes/.venv/bin/python3 /opt/data/scripts/foo.py` avant cron

✅ Profile `survivant-ia` (cf. `/opt/data/profiles/survivant-ia/`) pour skills qui DOIVENT utiliser l'agent Hermes natif

---

## Références

- [Hermes Tips & Best Practices](https://hermes-agent.nousresearch.com/docs/guides/tips)
- [Script-Only Cron Jobs (No LLM)](https://hermes-agent.nousresearch.com/docs/guides/cron-script-only) ⭐ **lecture obligatoire**
- [Issue GitHub #4379 — 73% token overhead analysis](https://github.com/NousResearch/hermes-agent/issues/4379)
- [Issue GitHub #2045 — Lazy skill loading feature request](https://github.com/NousResearch/hermes-agent/issues/2045)
- [Cut Hermes Token Bill in Half — LumaDock](https://lumadock.com/tutorials/cut-hermes-token-costs)
