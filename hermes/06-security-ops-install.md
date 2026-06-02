# 06 — Sécurité, ops, déploiement, calendrier d'install

## 6.1 — Modèle de sécurité (non-négociable)

### Secrets (env Coolify, jamais clair, jamais en repo)
- `INFOMANIAK_AI_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_OWNER_USER_ID` (whitelist exclusive Mathieu)
- `GIT_DEPLOY_KEY` (SSH privée, deploy key read-write sur repo `survivor`)
- `POSTHOG_API_KEY` (read-only, project 169545)
- `BREVO_API_KEY` (read-only, juste stats subscribers)
- `GOOGLE_ALERTS_FEED_URL` (URL signée du feed RSS Google Alerts)
- `HERMES_WEB_UI_PASSWORD` (Basic Auth)

### Surface d'attaque réduite
- Container : pas de root, pas de privileges, pas de docker-in-docker
- Web UI : Basic Auth + IP allowlist (IP fixe / plage VPN)
- Telegram : whitelist user_id stricte, autres user → polite refus + log
- Git : deploy key scopée `survivor` uniquement
- Browser-use : pas d'accès sessions LinkedIn/banques — strict sites publics RSS
- Rate limit : 20 invocations / heure, 50 / jour côté bot Telegram

### Isolation des secrets dans les prompts
- Hermes ne logge JAMAIS le contenu des prompts au-delà des 100 derniers chars (anti-fuite)
- Web UI : option "redact mode" pour screenshots

## 6.2 — Backup & disaster recovery

### Ce qui est précieux
- `~/.hermes/memory/` (mémoire persistante, sessions, skills custom)
- `~/.hermes/runtime/` (state conversation actuelle, recoverable)
- Repo Git — déjà sauvegardé sur GitHub ✓

### Backup automatisé
- Cron VPS : tar + chiffrement (`age` ou `gpg`) de `~/.hermes/memory/` quotidien
- Upload Infomaniak kDrive (gratuit, déjà avec ton compte) via `rclone`
- Rétention : 7 daily + 4 weekly
- Test restore mensuel automatique (Hermes le fait, ping "✓ restore test pass")

### Disaster recovery (Hermes meurt)
- Repo Git = source de vérité du wiki + drafts → recover total possible
- Mémoire Hermes = perdable sans drama (cohérent règle "wiki éphémère")
- RTO objectif : **2h**

## 6.3 — Update strategy

### Hermes lui-même
- Coolify peut auto-pull image GHCR `nousresearch/hermes-agent`
- **On freeze sur version pinnée** (pas `latest`)
- Update manuel après lecture release notes
- Cycle suggéré : check 1×/mois

### Catalogue modèles Infomaniak
- Hermes lance check mensuel `curl /models`
- Ping Telegram si nouveau modèle pertinent ("Mistral-Small-5 sorti, veux-tu tester ?")
- Pas d'update auto du routing — décision Mathieu

## 6.4 — Monitoring opérationnel

3 lignes de vie :

1. **Hermes Web UI natif** (`hermes.survivant-ia.ch`) : dashboard tokens/coût, sessions, cron status
2. **Skill `daily-budget-check`** (21h) : Telegram alerte si seuil dépassé
3. **Skill `lint-wiki`** (vendredi 17h) : audit hallucinations + santé wiki + exit criteria

Optionnel phase 2 : Uptime Kuma → ping `/health` toutes 5 min.

## 6.5 — Pre-install checklist (≈45 min)

### Côté Mathieu
- [ ] Créer A-record DNS `hermes.survivant-ia.ch` → `83.228.212.229`
- [ ] Sur VPS : ajouter 4 GB swap (cf. snippet ci-dessous)
- [ ] Sur GitHub : générer deploy key SSH, ajouter au repo `survivor` en read-write
- [ ] Sur Telegram : `@BotFather` → `/newbot` → noter token
- [ ] Sur Telegram : 1 msg au bot fraîchement créé → récupérer ton `user_id` via `@userinfobot`
- [ ] Sur Infomaniak : vérifier AI token valide v2 (`/2/ai/106389/openai/v1/models`)
- [ ] Sur PostHog : générer Personal API Key read-only scope project 169545
- [ ] Sur Google Alerts : créer 3 alertes ("Survivant-IA", "survivant-ia.ch", "Mathieu Rerat IA") → exporter en feeds RSS
- [ ] Décider mot de passe Web UI Hermes

### Snippet swap VPS
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h  # vérifier
```

### Côté Hermes (automatisé à l'install)
- Création dossiers manquants (`wiki/`, `docs/newsletter/{drafts,published}/`, `.hermes/`, etc.)
- Init `.hermes/SKILL.md`, `prompts/`, `skills/`
- Ingest des 3 articles piliers (≤5 atomic notes chacun)
- Init `docs/voice-fingerprint.md`
- (À confirmer) backfill `post.md` du carousel BPMN 2026-05-30
- (À confirmer) mise à jour mémoire `reference_linkedin_corpus.md` (15 posts → 2 réels)

## 6.6 — Calendrier d'install (bootstrap PASSIF, 3 semaines)

Étalé volontairement pour éviter pattern "enthousiaste 3 semaines puis dérive".

### Semaine 1 — Install + Push manuel uniquement
| Jour | Action |
|---|---|
| J1 | Pre-install checklist (Mathieu) |
| J2 | Déploiement Coolify Hermes + Traefik + DNS + Web UI auth |
| J3 | Config skills (SKILL.md, prompts, 3 skills core) |
| J4 | Bootstrap wiki (ingest 3 articles) |
| J5-J7 | **Mode observation** — Push Telegram uniquement, valide 2-3 drafts pour calibrer voix |

### Semaine 2 — Activation Pull (sans publier)
| Jour | Action |
|---|---|
| J8 | Active 9 sources Pull + skill `pull-brief` + skill `lint-wiki` |
| J9-J14 | Brief 6h30 chaque matin, tri 👍/📁/🗑️. **Aucun draft poussé pour publication**. Observation : ignore_rate, fit voix réel, redite_risk |

### Semaine 3 — Pipeline complet & premier vrai cycle
| Jour | Action |
|---|---|
| J15 | Premier vrai post LinkedIn drafted par Hermes → publié par Mathieu (cycle end-to-end) |
| J16-J21 | Tu vis avec le système. Premier `lint-wiki` vendredi avec audit hallucinations. |
| J22 | **Review formelle t+21j** : usage_stats, ignore_rate, exit criteria, décision continuer/ajuster/abandonner |

### Reviews ultérieures
- **J+60** : ajout potentiel `ingest-tool`, activation potentielle newsletter
- **J+180** : décision long-terme

## 6.7 — Estimations finales

| Item | Estimation |
|---|---|
| Install (Mathieu) | ~3-4h sur J1-J2, ~30 min/jour J3-J7 |
| Vie quotidienne | 5-15 min/jour (brief + validation drafts) |
| Hebdo | 10 min vendredi (lint + audit) |
| Coût LLM mensuel | 6-20 CHF |
| Seuil alerte | 30 CHF/mois |
| Exit criteria coût | 50 CHF/mois |
| RTO disaster | 2h |

## 6.8 — Risques + mitigations (rappel synthétique)

1. **Hallucination contamination** → cross-model audit hebdo + spot-check 3 random/sem
2. **AI brain fry** → 3 skills core, ajout progressif
3. **Pull burnout** → cap 3, dimanche off, skip-day, lint watch
4. **Drift voix** → charte verrouillée, voice-fingerprint, validation V1
5. **LinkedIn 2026 Authenticity Score** → voice-check humanizer, pas d'auto-publish
6. **Coût dérive** → daily-budget-check, hard cap 50 CHF, routing modèles par task
7. **Disque 19 GB serré** → monitoring `~/.hermes/`, alerte > 12 GB
