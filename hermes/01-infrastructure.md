# 01 — Infrastructure & déploiement

## VPS cible

- IP : `83.228.212.229`
- OS : Ubuntu 24.04 LTS
- CPU : 4 vCPU AMD EPYC-Genoa
- RAM : 11 GB (8.9 GB libres au scan)
- Disque : 19 GB total, 15 GB libres
- Swap : 0 → **à corriger : ajouter 4 GB swap avant install**
- Load avg : 0.2 (idle)

## Stack existant à respecter

- **Coolify v4.0.0-beta.459** (PaaS) → Hermes déployé comme service Coolify, pas systemd direct
- **Traefik v3.6** → reverse proxy + TLS auto pour `hermes.survivant-ia.ch`
- Postgres 15+17, Redis 7, ClamAV — utilisés par les autres apps, on ne touche pas
- Apps en place : Kairo + 2 autres apps (kept untouched)
- Firewall ufw : 22/80/443/3000 ouverts

## Topologie cible

```
hermes.survivant-ia.ch
        ↓ (TLS auto)
Traefik (existant, port 80/443)
        ↓
Container Docker Hermes (Coolify-managed)
        ├─ volume ~/.hermes/memory/   (mémoire persistante)
        ├─ volume ~/.hermes/runtime/  (state session)
        └─ volume /workspace/          (clone Git du repo survivor)
```

## Provider LLM

- Endpoint : `https://api.infomaniak.com/2/ai/106389/openai/v1` (v2 obligatoire pour les modèles récents)
- Hermes l'avale comme "Custom API" (OpenAI-compatible)

### Routing modèles (`hermes-models.yaml` versionné)

```yaml
tasks:
  agent_reasoning:    Qwen/Qwen3.5-122B-A10B-FP8        # MoE 10B actifs, reasoning
  creative_writing:   mistralai/Mistral-Small-4-119B-2603 # dense 119B, top qualité
  classification:     nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8 # 3B actifs, ultra cheap
  embeddings:         Qwen/Qwen3-Embedding-8B
  audit_cross_model:  mistralai/Mistral-Small-4-119B-2603 # différent du reasoning
```

Override par task via env vars `HERMES_MODEL_<TASK>` (convention identique aux outils Nuxt).

## Sous-domaine + DNS

- A-record `hermes.survivant-ia.ch` → `83.228.212.229`
- TLS Let's Encrypt auto via Traefik (Coolify gère)

## Pré-requis à corriger AVANT install

1. **Ajouter 4 GB swap** sur le VPS :
   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```
2. **Créer A-record DNS** chez registrar `survivant-ia.ch`
3. **Disque** : 15 GB libres, on consommera 3-5 GB. Si futur ajout vLLM local → passer VPS à 40 GB.
4. **Deploy key GitHub** : `ssh-keygen` sur le VPS, ajouter pub key au repo `survivor` en read-write

## Monitoring opérationnel

Trois lignes de vie :

1. **Hermes Web UI natif** (`hermes.survivant-ia.ch`) :
   - Summary cards 7/30/90j : total tokens (in/out), cache hit %, coût total CHF, sessions
   - Daily token chart + breakdown table par jour
   - Per-model breakdown (Mistral-Small-4 vs Qwen3.5 vs Nemotron — sessions/tokens/coût)
   - Recent 20 sessions auto-refresh 5s
   - Cron jobs status (last run / next run)

2. **Skill cron `daily-budget-check`** (21h chaque jour) :
   - Lit l'API Hermes, compare au seuil (default 1 CHF/jour)
   - Ping Telegram si dépassé
   - ~15 lignes de skill, premier test du pipeline cron+Telegram

3. **Skill cron `lint-wiki`** (vendredi 17h) :
   - Santé wiki + audit hallucinations + check exit criteria
   - Détail dans `03-karpathy-pipeline.md`

Phase 2 optionnelle : Uptime Kuma → ping `/health` toutes 5 min (open-source, ~100 MB RAM).

## Estimations

- Coût LLM mensuel : 6-20 CHF (selon volume Push)
- Coût Pull seul : ~0.45 CHF/mois
- Seuil alerte budget : 30 CHF
- Exit criteria coût : 50 CHF
- Disque consommé estimé : 3-5 GB (Hermes + Chromium + caches)
