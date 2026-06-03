# Profile orchestrateur `survivant-ia`

**Mis en place 2026-06-03** suite à l'incident "143k tokens" et la recherche sur les best practices Hermes.

## Principe

Le profile par défaut Hermes charge **183 SKILL.md** dans son index (~36k tokens d'overhead) + fixed overhead (~14k tokens) = **~50k tokens minimum** par appel agent.

Le profile `survivant-ia` est créé avec `--no-skills` et a SEULEMENT nos 6 skills custom symlinkées dedans. Quand une tâche multi-step nécessite l'agent Hermes natif (ex : `draft-from-idea` en Phase 6), on utilise ce profile pour limiter l'overhead.

## Architecture (sur VPS)

```
/opt/data/                          ← Profile DEFAULT (Mathieu chat libre)
├── config.yaml                     Infomaniak
├── .env
├── skills/                         183 skills built-in + nos 6 custom (via bind-mount)
│   ├── apple/...
│   ├── creative/...
│   ├── ... (180 autres)
│   └── survivant-ia/              ← bind-mount depuis /workspace/.hermes/skills/survivant-ia/
│       ├── ingest-article/
│       ├── query-wiki/
│       ├── draft-from-idea/
│       ├── lint-wiki/
│       ├── pull-brief/
│       └── daily-budget-check/

/opt/data/profiles/survivant-ia/    ← Profile ORCHESTRATEUR (cron Hermes-natif)
├── .no-bundled-skills              ← flag opt-out hermes update
├── config.yaml                     copie du default (Infomaniak)
├── .env                            copie
├── SOUL.md                         (à personnaliser plus tard)
└── skills/
    └── survivant-ia/               SEULEMENT nos 6 skills custom (symlinks)
        ├── ingest-article          → /workspace/.hermes/skills/survivant-ia/ingest-article
        ├── query-wiki              → idem
        ├── draft-from-idea         → idem
        ├── lint-wiki               → idem
        ├── pull-brief              → idem
        └── daily-budget-check      → idem
```

## Usage

### En CLI (debug, ingest manuel)

```bash
docker exec --user hermes --workdir /workspace hermes \
  hermes chat --profile survivant-ia -q "<prompt>"
```

### Pour les crons Hermes-natif (multi-step)

Si on a besoin du mode agent (pas script-only), passer `--profile survivant-ia` :

```bash
docker exec --user hermes --workdir /workspace hermes \
  hermes cron create '0 8 * * *' \
  --name "Survivant-IA orchestrated daily" \
  --skill survivant-ia/draft-from-idea \
  --profile survivant-ia \                    # ← clé : orchestrateur, pas default
  --workdir /workspace \
  --deliver telegram
```

## Limites connues

1. **Le profile clone le skills dir du default** lors de la création (héritage de l'install Hermes). `--no-skills` opt-out de `hermes update` mais ne supprime pas les skills déjà présentes. À vérifier si on doit manuellement supprimer les non-Survivant pour vraiment limiter l'overhead.

2. **Le bind-mount des skills custom est dans /workspace/.hermes/skills/** (default profile path). Pour le profile survivant-ia, on symlinke depuis `/opt/data/profiles/survivant-ia/skills/survivant-ia/` vers le même path /workspace. Si on déplace le repo, mettre à jour les symlinks.

3. **Pas de gateway Telegram dédié pour ce profile** (gateway: stopped). On utilise toujours le gateway du profile default pour Telegram. Le profile orchestrateur est pour le mode **chat / cron skill** uniquement.

## Mesure d'overhead (à faire en Phase 6)

Quand on lancera draft-from-idea via Telegram (Phase 6), mesurer :
- Tokens input (system prompt) avec profile default
- Tokens input avec profile survivant-ia
- Économie en %

Cible : **> 50% économie**.

## Référence

- [Hermes Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [Issue #2045 lazy skill loading](https://github.com/NousResearch/hermes-agent/issues/2045)
- Citation Nous Research : *"In real deployments, skills inherit isolation from profiles (separate config, secrets, memories, and skill trees), and profiles—not individual markdown files—should be treated as the unit of ownership."*
