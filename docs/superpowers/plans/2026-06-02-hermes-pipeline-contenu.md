# Hermes Pipeline Contenu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déployer Hermes Agent (Nous Research, MIT) sur le VPS Infomaniak en pipeline complet (Push Telegram+WebUI et Pull brief matinal), branché sur Infomaniak AI, avec second cerveau Karpathy LLM Wiki versionné dans le repo Git, validation manuelle systématique, et garde-fous anti-graveyard.

**Architecture :** Container Docker Hermes déployé via Coolify existant (Traefik + TLS auto sur `hermes.survivant-ia.ch`). Volumes pour mémoire persistante + clone Git du repo `survivor`. Skills custom au format `SKILL.md` configurent les 5 opérations (ingest, query, lint, draft, pull-brief). Routing modèles par tâche via `hermes-models.yaml` (Qwen3.5 reasoning, Mistral-Small-4 créatif, Nemotron classification, Qwen3-Embedding RAG). Validation V1 stricte : Hermes draft, Mathieu publie.

**Tech Stack :** Hermes Agent (Nous Research) · Docker · Coolify · Traefik · Infomaniak AI v2 endpoint · Telegram Bot API · PostHog API · Brevo API · Google Alerts/News RSS · Git deploy key · Ubuntu 24.04 LTS

**Spec source :** `docs/superpowers/specs/2026-06-02-hermes-pipeline-contenu-design.md`
**Référence détaillée :** `hermes/` (10 docs)

---

## Légende des étapes

- `[HUMAN]` — étape qui nécessite l'intervention manuelle de Mathieu (UI externe, secret physique, validation visuelle)
- `[AGENT]` — étape entièrement automatisable par un agent (commande shell, écriture de fichier, appel API)
- `[VERIFY]` — étape de vérification avec output attendu

---

## Fichiers touchés

### À créer
| Fichier | Rôle |
|---|---|
| `.hermesignore` | Liste des chemins exclus de la vision Hermes |
| `.hermes/SKILL.md` | Schema Karpathy chargé en premier (qui, quoi, hard rules) |
| `.hermes/hermes-models.yaml` | Routing modèles par tâche |
| `.hermes/skills/ingest-article.md` | Skill : article pilier → ≤5 atomic notes |
| `.hermes/skills/query-wiki.md` | Skill : intention → context bundle pour drafts |
| `.hermes/skills/lint-wiki.md` | Skill cron vendredi 17h : santé + audit hallucinations |
| `.hermes/skills/draft-from-idea.md` | Skill : intention → drafts LinkedIn/carousel/TikTok |
| `.hermes/skills/pull-brief.md` | Skill cron 6h30 : signaux → brief matinal Telegram |
| `.hermes/skills/daily-budget-check.md` | Skill cron 21h : alerte Telegram si seuil budget |
| `.hermes/prompts/voice-survivant-ia.md` | Prompt système maître (charte + patterns) |
| `.hermes/prompts/editorial-charte.md` | Reprend la charte éditoriale articles |
| `docs/voice-fingerprint.md` | Auto-maintenu par Hermes (résumé voix 5 lignes) |
| `wiki/_index.md` | Carte du wiki, maintenue par Hermes |
| `wiki/_provenance.md` | Traçabilité source → atomic notes |
| `wiki/{concepts,claims,examples,_moc}/.gitkeep` | Création dossiers |
| `docs/{linkedin,marketing/scripts-tiktok,newsletter}/{drafts,published}/.gitkeep` | Création dossiers (newsletter même si désactivé) |
| `coolify/hermes-compose.yaml` | Compose spec pour Coolify (référence, l'UI Coolify le portera) |

### À modifier
| Fichier | Pourquoi |
|---|---|
| `docs/linkedin/published/2026-05-30-bpmn-ia/post.md` | Backfill optionnel depuis le carousel (Tâche 16) |

### À ne PAS toucher
- `app/`, `server/`, `video/`, `content/rapports/`, `content/outils/`, `nuxt.config.ts`, etc. — Hermes consomme, ne modifie pas.

---

# Phase 0 — Prérequis personnels (J0, ~10 min)

Vérifications avant d'attaquer J1. Si une coche manque, arrêter et corriger.

- [ ] **0.1 [HUMAN]** Vérifier l'accès SSH au VPS

Exécuter :
```bash
ssh -i ~/.ssh/infomaniak_vps -o ConnectTimeout=10 ubuntu@83.228.212.229 'whoami && hostname'
```
Attendu : `ubuntu` puis `ov-477072` (ou nom d'hôte similaire).

- [ ] **0.2 [HUMAN]** Vérifier l'accès admin Coolify

Ouvrir `http://83.228.212.229:8000` dans le navigateur. Login Coolify doit fonctionner.

- [ ] **0.3 [HUMAN]** Vérifier l'accès au registrar DNS

Localiser le panel DNS de `survivant-ia.ch` (Infomaniak Manager probablement). Confirmer que tu peux ajouter un A-record.

- [ ] **0.4 [HUMAN]** Vérifier que le compte Telegram fonctionne sur ton mobile

Ouvrir Telegram, tester un message. Si Telegram n'est pas installé, l'installer.

- [ ] **0.5 [HUMAN]** Préparer un gestionnaire de mots de passe ouvert

Pour stocker les secrets générés en Phase 1.

---

# Phase 1 — Pré-install (J1, ~45 min)

Tous les secrets et accès générés AVANT toute install. À la fin, on a un "secrets bag" complet.

## Tâche 1 — DNS

- [ ] **1.1 [HUMAN]** Aller dans Infomaniak Manager → Domaines → `survivant-ia.ch` → DNS

- [ ] **1.2 [HUMAN]** Ajouter A-record : `hermes` → `83.228.212.229` (TTL 3600)

- [ ] **1.3 [VERIFY]** Attendre 2-15 min, puis :

```bash
dig +short hermes.survivant-ia.ch
```
Attendu : `83.228.212.229`. Si vide, attendre 10 min de plus et réessayer.

## Tâche 2 — Swap VPS

- [ ] **2.1 [HUMAN]** SSH dans le VPS :

```bash
ssh -i ~/.ssh/infomaniak_vps ubuntu@83.228.212.229
```

- [ ] **2.2 [AGENT]** Créer 4 GB de swap :

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

- [ ] **2.3 [VERIFY]** Vérifier :

```bash
free -h
```
Attendu : ligne `Swap:` avec total `4.0Gi`.

## Tâche 3 — Deploy key GitHub

- [ ] **3.1 [AGENT]** Toujours sur le VPS, générer une clé SSH dédiée :

```bash
ssh-keygen -t ed25519 -C "hermes-deploy@survivant-ia" -f ~/.ssh/hermes_deploy -N ""
cat ~/.ssh/hermes_deploy.pub
```

- [ ] **3.2 [HUMAN]** Copier la sortie publique (`ssh-ed25519 AAAA...`).

- [ ] **3.3 [HUMAN]** Aller sur GitHub → repo `survivor` → Settings → Deploy keys → Add deploy key
  - Title : `hermes-vps`
  - Key : coller la pub
  - Cocher **"Allow write access"**
  - Save

- [ ] **3.4 [VERIFY]** Tester depuis le VPS :

```bash
ssh -i ~/.ssh/hermes_deploy -o StrictHostKeyChecking=accept-new -T git@github.com
```
Attendu : `Hi MR-lunux/survivor! You've successfully authenticated, but GitHub does not provide shell access.`

- [ ] **3.5 [AGENT]** Sauvegarder la clé privée (sera collée dans Coolify env vars en Tâche 10) :

```bash
cat ~/.ssh/hermes_deploy
```
Garder ouverte cette sortie dans le gestionnaire de mots de passe.

## Tâche 4 — Bot Telegram

- [ ] **4.1 [HUMAN]** Sur Telegram, ouvrir `@BotFather` (compte officiel vérifié)

- [ ] **4.2 [HUMAN]** Envoyer `/newbot`
  - Name (display) : `Survivant IA Hermes`
  - Username : `SurvivantIAHermes_bot` (suffixer `_bot`, doit être unique — variant si pris)

- [ ] **4.3 [HUMAN]** Copier le token HTTP API (format `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`) dans le gestionnaire.

- [ ] **4.4 [HUMAN]** Envoyer 1 message texte au bot fraîchement créé (n'importe quoi, ex `hello`).

- [ ] **4.5 [HUMAN]** Ouvrir `@userinfobot` sur Telegram, `/start`. Copier le `Id` (entier positif, ex `123456789`).

- [ ] **4.6 [VERIFY]** Tester le token :

```bash
curl -s "https://api.telegram.org/bot<TON_TOKEN>/getMe"
```
Attendu : JSON avec `"ok":true` et `"username":"SurvivantIAHermes_bot"`.

## Tâche 5 — Token Infomaniak AI

- [ ] **5.1 [HUMAN]** Si tu n'as pas déjà ton token Personal API Infomaniak sous la main, le récupérer dans Infomaniak Manager → Profil → Tokens. Sinon, en générer un nouveau scope AI Tools.

- [ ] **5.2 [VERIFY]** Tester le token v2 :

```bash
curl -s -H "Authorization: Bearer <TON_TOKEN>" \
  "https://api.infomaniak.com/2/ai/106389/openai/v1/models" | head -50
```
Attendu : JSON contenant `mistralai/Mistral-Small-4-119B-2603`, `Qwen/Qwen3.5-122B-A10B-FP8`, etc.

Si erreur 401 → token invalide ou pas scope AI. Si erreur 422 → endpoint v1 utilisé par erreur. Cf. `docs/infomaniak-models.md`.

## Tâche 6 — PostHog Personal API Key

- [ ] **6.1 [HUMAN]** PostHog (EU instance) → Profile → Personal API Keys → Create personal API key
  - Label : `hermes-vps-readonly`
  - Scopes : `query:read`, `insight:read`, `event_definition:read` (read-only)
  - Project : 169545 (Default project)

- [ ] **6.2 [HUMAN]** Copier la clé (commence par `phx_...`).

- [ ] **6.3 [VERIFY]** Tester :

```bash
curl -s -H "Authorization: Bearer <CLÉ>" \
  "https://eu.posthog.com/api/projects/169545/" | head -20
```
Attendu : JSON avec `"name":"Default project"`.

## Tâche 7 — Google Alerts RSS

- [ ] **7.1 [HUMAN]** Aller sur `https://www.google.com/alerts`

- [ ] **7.2 [HUMAN]** Créer 3 alertes :
  - Query : `"Survivant-IA"`
  - Query : `"survivant-ia.ch"`
  - Query : `"Mathieu Rerat" IA`
  
  Pour chacune :
  - Fréquence : "À mesure"
  - Sources : "Tout"
  - Langue : Français
  - Région : Suisse
  - **Délivrer à : Flux RSS** ← important
  - Save

- [ ] **7.3 [HUMAN]** Une fois créée, cliquer sur l'icône RSS à côté de chaque alerte pour copier l'URL feed (format `https://www.google.com/alerts/feeds/<id>/<token>`).

- [ ] **7.4 [VERIFY]** Tester une URL RSS :

```bash
curl -s "<URL_RSS_ALERT>" | head -20
```
Attendu : XML Atom feed valide.

## Tâche 8 — Brevo API Key (optionnel — peut attendre)

- [ ] **8.1 [HUMAN]** Brevo → Profile → SMTP & API → API Keys → Generate new key
  - Name : `hermes-vps-readonly`
  - Permissions : minimum (stats contacts)

- [ ] **8.2 [HUMAN]** Copier la clé (commence par `xkeysib-...`).

## Tâche 9 — Mot de passe Web UI Hermes

- [ ] **9.1 [HUMAN]** Générer un mot de passe fort (16+ chars) via le gestionnaire. User : `mathieu`. Le stocker.

## Tâche 10 — Secrets bag complet

- [ ] **10.1 [HUMAN]** Composer le secrets bag final dans le gestionnaire :

```
INFOMANIAK_AI_TOKEN=...
INFOMANIAK_AI_ENDPOINT=https://api.infomaniak.com/2/ai/106389/openai/v1
TELEGRAM_BOT_TOKEN=123456789:ABC...
TELEGRAM_OWNER_USER_ID=123456789
GIT_DEPLOY_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
GIT_REPO_URL=git@github.com:MR-lunux/survivor.git
POSTHOG_API_KEY=phx_...
POSTHOG_HOST=https://eu.posthog.com
POSTHOG_PROJECT_ID=169545
BREVO_API_KEY=xkeysib-...
GOOGLE_ALERTS_FEED_URLS=https://www.google.com/alerts/feeds/.../...,https://...,https://...
HERMES_WEB_UI_USER=mathieu
HERMES_WEB_UI_PASSWORD=...
```

- [ ] **10.2 [HUMAN]** Commit Phase 1 mentale : tous les secrets prêts.

---

# Phase 2 — Déploiement container Hermes (J2, ~1-2h)

Hermes container up, Web UI accessible, Telegram bot répondant à `/start`.

## Tâche 11 — Fetch la dernière doc Hermes Coolify

- [ ] **11.1 [HUMAN]** Aller sur `https://hermes-agent.nousresearch.com/docs/deployment` (ou équivalent au moment de l'install) — récupérer le `docker-compose.yaml` officiel + liste à jour des env vars supportées.

- [ ] **11.2 [HUMAN]** Lire spécifiquement la section "Self-hosting" pour confirmer la version stable à pinner (PAS `latest`).

- [ ] **11.3 [HUMAN]** Noter la version exacte (ex : `nousresearch/hermes-agent:v2.3.1`).

## Tâche 12 — Compose spec dans le repo

- [ ] **12.1 [AGENT]** Créer le dossier :

```bash
mkdir -p /Users/mathieu/Documents/survivor/coolify
```

- [ ] **12.2 [AGENT]** Créer `coolify/hermes-compose.yaml` (template référence, adapter au docker-compose officiel récupéré en 11.1) :

```yaml
# Référence pour Coolify. Adapter avec le compose officiel Hermes au moment de l'install.
services:
  hermes:
    image: ghcr.io/nousresearch/hermes-agent:vX.Y.Z  # version pinnée Tâche 11
    container_name: hermes-survivant
    restart: unless-stopped
    environment:
      # LLM provider (Custom API OpenAI-compatible)
      HERMES_LLM_PROVIDER: custom
      HERMES_LLM_BASE_URL: ${INFOMANIAK_AI_ENDPOINT}
      HERMES_LLM_API_KEY: ${INFOMANIAK_AI_TOKEN}
      # Telegram
      HERMES_TELEGRAM_TOKEN: ${TELEGRAM_BOT_TOKEN}
      HERMES_TELEGRAM_ALLOWED_USERS: ${TELEGRAM_OWNER_USER_ID}
      # Web UI
      HERMES_WEB_UI_ENABLED: "true"
      HERMES_WEB_UI_AUTH_USER: ${HERMES_WEB_UI_USER}
      HERMES_WEB_UI_AUTH_PASSWORD: ${HERMES_WEB_UI_PASSWORD}
      # Workspace (clone Git)
      HERMES_WORKSPACE_PATH: /workspace
      HERMES_WORKSPACE_GIT_URL: ${GIT_REPO_URL}
      HERMES_WORKSPACE_GIT_SSH_KEY: ${GIT_DEPLOY_KEY}
      # Skills config
      HERMES_SKILLS_PATH: /workspace/.hermes/skills
      HERMES_PROMPTS_PATH: /workspace/.hermes/prompts
      HERMES_MODELS_CONFIG: /workspace/.hermes/hermes-models.yaml
      # Limits
      HERMES_RATE_LIMIT_PER_HOUR: 20
      HERMES_RATE_LIMIT_PER_DAY: 50
      HERMES_BUDGET_MONTHLY_CHF: 50
      # Memory
      HERMES_MEMORY_PATH: /hermes-memory
      # PostHog
      POSTHOG_API_KEY: ${POSTHOG_API_KEY}
      POSTHOG_HOST: ${POSTHOG_HOST}
      POSTHOG_PROJECT_ID: ${POSTHOG_PROJECT_ID}
      # Brevo
      BREVO_API_KEY: ${BREVO_API_KEY}
      # Google Alerts
      GOOGLE_ALERTS_FEED_URLS: ${GOOGLE_ALERTS_FEED_URLS}
    volumes:
      - hermes-memory:/hermes-memory
      - hermes-workspace:/workspace
    # Traefik labels — Coolify ajoute automatiquement, juste pour référence
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.hermes.rule=Host(`hermes.survivant-ia.ch`)"
      - "traefik.http.routers.hermes.tls.certresolver=letsencrypt"
      - "traefik.http.middlewares.hermes-auth.basicauth.users=mathieu:$$apr1$$..."  # à générer
      - "traefik.http.routers.hermes.middlewares=hermes-auth"

volumes:
  hermes-memory:
    driver: local
  hermes-workspace:
    driver: local
```

- [ ] **12.3 [AGENT]** Commit ce fichier :

```bash
cd /Users/mathieu/Documents/survivor
git add coolify/hermes-compose.yaml
git commit -m "chore(hermes): add Coolify compose reference for Hermes container"
```

## Tâche 13 — Création du service Coolify

- [ ] **13.1 [HUMAN]** Coolify → Projects → New Resource → Docker Compose

- [ ] **13.2 [HUMAN]** Coller le contenu de `coolify/hermes-compose.yaml` (ajusté avec la version pinnée et le compose officiel récupéré en Tâche 11)

- [ ] **13.3 [HUMAN]** Dans l'onglet Environment Variables, coller TOUTES les variables du secrets bag (Tâche 10). Vérifier qu'aucune n'est en clair dans le YAML.

- [ ] **13.4 [HUMAN]** Configurer le domaine dans Coolify : `https://hermes.survivant-ia.ch`. Coolify gère Traefik + Let's Encrypt automatiquement.

- [ ] **13.5 [HUMAN]** Déployer.

- [ ] **13.6 [VERIFY]** Watch les logs Coolify pendant le déploiement. Attendre `Hermes agent ready` ou équivalent. ~2-3 min.

- [ ] **13.7 [VERIFY]** Tester l'URL :

```bash
curl -s -o /dev/null -w "%{http_code}\n" -u mathieu:<PASSWORD> https://hermes.survivant-ia.ch/
```
Attendu : `200`.

## Tâche 14 — Test Telegram end-to-end

- [ ] **14.1 [HUMAN]** Sur Telegram, ouvrir le bot `@SurvivantIAHermes_bot`.

- [ ] **14.2 [HUMAN]** Envoyer `/start`.

- [ ] **14.3 [VERIFY]** Attendre la réponse Hermes (≤10s). Si pas de réponse :
  - Vérifier les logs Coolify
  - Vérifier que `TELEGRAM_OWNER_USER_ID` matche ton user_id
  - Vérifier que `HERMES_TELEGRAM_TOKEN` est correct

- [ ] **14.4 [HUMAN]** Envoyer un message simple ("test") depuis un autre compte Telegram (ou demande à un proche). Le bot doit refuser poliment (whitelist active).

---

# Phase 3 — Config skills + prompts (J3, ~2-3h)

Hermes container tourne. Maintenant on remplit `.hermes/` dans le repo. Hermes le verra au prochain `git pull` interne (ou redémarrage).

## Tâche 15 — Création de l'arborescence

- [ ] **15.1 [AGENT]** Depuis le Mac, créer les dossiers et fichiers vides :

```bash
cd /Users/mathieu/Documents/survivor
mkdir -p .hermes/skills .hermes/prompts
mkdir -p wiki/{concepts,claims,examples,_moc}
mkdir -p docs/linkedin/drafts
mkdir -p docs/marketing/scripts-tiktok/drafts docs/marketing/scripts-tiktok/published
mkdir -p docs/newsletter/drafts docs/newsletter/published
touch wiki/concepts/.gitkeep wiki/claims/.gitkeep wiki/examples/.gitkeep wiki/_moc/.gitkeep
touch docs/linkedin/drafts/.gitkeep
touch docs/marketing/scripts-tiktok/drafts/.gitkeep docs/marketing/scripts-tiktok/published/.gitkeep
touch docs/newsletter/drafts/.gitkeep docs/newsletter/published/.gitkeep
```

- [ ] **15.2 [AGENT]** Migrer le script TikTok existant dans `published/` :

```bash
git mv docs/marketing/scripts-tiktok/2026-05-16-comptables-validation.md \
       docs/marketing/scripts-tiktok/published/2026-05-16-comptables-validation.md
```

## Tâche 16 — `.hermesignore` racine

- [ ] **16.1 [AGENT]** Créer `/Users/mathieu/Documents/survivor/.hermesignore` :

```
# Code applicatif (Hermes consomme du contenu, pas du code)
app/
server/
video/src/
node_modules/
.nuxt/
.output/
.claude/
coolify/

# Secrets, env, builds
.env*
*.log
**/dist/
**/build/

# Mémoire Hermes interne
.hermes/runtime/

# Fichiers OS
.DS_Store
```

## Tâche 17 — `wiki/_index.md` + `wiki/_provenance.md`

- [ ] **17.1 [AGENT]** Créer `wiki/_index.md` :

```markdown
---
maintainer: hermes
last_updated: 2026-06-02
type: wiki-index
---

# Wiki index — Survivant-IA second brain

Maintenu automatiquement par Hermes. Ne pas éditer à la main (sera réécrasé).

## Concepts
(vide — bootstrap pending Tâche 26)

## Claims
(vide)

## Examples
(vide)

## MOC
(vide — Hermes crée les MOC par questions au fur et à mesure)
```

- [ ] **17.2 [AGENT]** Créer `wiki/_provenance.md` :

```markdown
---
maintainer: hermes
type: wiki-provenance
---

# Provenance

Traçabilité source → atomic notes. Maintenu par `ingest-article`.

## Format

Une entrée par article ingéré :

```
- source: content/rapports/<slug>.md
  ingested_at: <ISO timestamp>
  notes:
    - wiki/concepts/<slug>.md
    - wiki/claims/<slug>.md
```

(vide — bootstrap pending Tâche 26)
```

## Tâche 18 — `hermes-models.yaml`

- [ ] **18.1 [AGENT]** Créer `.hermes/hermes-models.yaml` :

```yaml
# Routing modèles Hermes par tâche.
# Endpoint : Infomaniak AI v2 (cf. docs/infomaniak-models.md)
# Override par env var HERMES_MODEL_<TASK_UPPERCASE>

provider: infomaniak

tasks:
  # Reasoning / planning d'agent (multi-étapes, choix de tool, décisions)
  agent_reasoning: Qwen/Qwen3.5-122B-A10B-FP8

  # Écriture créative finale (LinkedIn post, TikTok script, newsletter section)
  creative_writing: mistralai/Mistral-Small-4-119B-2603

  # Classification rapide (Pull signal scoring, dédup, tagging)
  classification: nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8

  # Embeddings (RAG wiki match, similarité Pull)
  embeddings: Qwen/Qwen3-Embedding-8B

  # Audit cross-model (lint-wiki, modèle DIFFÉRENT du reasoning)
  audit_cross_model: mistralai/Mistral-Small-4-119B-2603

# Limites globales
limits:
  max_tokens_per_call: 8000
  context_window: 32000
  retry_on_429: 3
  retry_backoff_seconds: 5
```

## Tâche 19 — `prompts/voice-survivant-ia.md`

- [ ] **19.1 [AGENT]** Créer `.hermes/prompts/voice-survivant-ia.md` :

```markdown
# Voice prompt — Survivant-IA

Charge ce fichier comme **prompt système maître** avant toute génération de contenu (LinkedIn, TikTok, newsletter, brief). Il INCLUT la charte de voix `docs/charte-voix.md` + les patterns observés sur les posts publiés.

## Inclusion charte

Lire intégralement le fichier `docs/charte-voix.md`. C'est la source canonique. Les règles suivantes COMPLÈTENT la charte sans la contredire.

## Patterns observés (au-delà de la charte)

### Hook
- **Affirmation forte au présent**, jamais une question. Légère provocation.
- Exemple : *"Un comptable qui saisit encore ses écritures à la main en 2026 a un pied dans la tombe."*
- Exemple : *"Sans savoir prompter, tu rates les gains même si les modèles d'IA s'améliorent d'année en année."*

### Pivot mid-post
- **Question rhétorique** introduisant la tactique.
- Exemple : *"Comment tuer cette tâche aliénante pour libérer du temps de cerveau ?"*

### Liste tactique
- 3-6 items courts, en parallèle, sans paraphrase.
- Items en tirets simples `-`.
- Si numérotée, c'est une "règle de trois numérotée" (autorisée par charte §4.3).

### Punchline 80/20
- Décision résumée en ratio chiffré.
- Exemple : *"80% du gain, 20% du boulot. Le reste, c'est de la cosmétique."*

### Self-disclosure technique (mode "annonce-outil")
- Transparence build + souveraineté CH + RGPD by default.
- Exemple : *"En 4h, j'ai codé une app… hébergée en Suisse, chez Infomaniak. Vos données ne servent à entraîner aucun modèle. RGPD respecté par défaut, pas en option."*

### CTA non-extractif
- Friction-free, anti-funnel.
- Exemple : *"Pas d'email, pas de carte : c'est moi qui paye l'usage, parce que je veux vraiment que vous testiez."*

### Closing capsule
- Format "Et n'oublie pas : …" comme tagline finale.
- Exemple : *"Et n'oublie pas : Les modèles s'améliorent. Les prompts, c'est à toi de les peaufiner."*

## Hard rules tonales

1. **Tu** systématique, jamais "vous" (à confirmer avec Mathieu si exception).
2. **Cluster 2 ACTION** prioritaire ("piloter", "leviers", "se former"). Jamais cluster peur ("ne pas se faire remplacer" est OK seulement en contraste tactique).
3. Mot **banni** : "méthode" (tant que le produit formation n'est pas annoncé).
4. **Em-dash interdit** (utilise `:` ou `,`).
5. **Pas d'emoji** dans la copy publiée.
6. **Persona** : "Mathieu le Survivant de l'IA", pas juste "Mathieu Rerat".
7. **Pas d'invention factuelle** sur Mathieu (durées, lieux, rôles bio doivent être sourcés ou neutres).

## Anti-patterns IA (référence charte §4)

Avant de livrer un draft, voice-check obligatoire (skill `humanizer`) :
- Inflation de significance
- Langage promotionnel
- Analyses superficielles en -ant/-issant
- Signposting ("voyons ensemble", "plongeons dans")
- Conclusions positives génériques
- Attributions floues
- Voix passive sans acteur
- Synonymie qui tourne
- Sycophant / chatbot ("Excellente question", "Bien sûr")
- Listes à puces avec en-tête inline
- Headers fragmentés
```

## Tâche 20 — `prompts/editorial-charte.md`

- [ ] **20.1 [AGENT]** Créer `.hermes/prompts/editorial-charte.md` :

```markdown
# Editorial charter — workflow + format

Référence : `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md` (spec figé, à ne pas modifier).

## Workflow

Brief inversé mode C :
1. Mathieu donne intention + angle
2. Agent (toi) produit brief stratégique avant de drafter
3. Mathieu valide ou ajuste le brief
4. Tu produis le draft selon le brief validé
5. Voice-check humanizer
6. Livraison Telegram

## 4 dimensions de review (à appliquer avant livraison)

1. **Voix** — alignement charte + patterns observés (cf. voice-survivant-ia.md)
2. **Cluster** — cluster 2 action prioritaire
3. **Anti-redite** — comparaison vs 3 derniers posts publiés (redite_risk < 0.7)
4. **Source brute** — citation verbatim si tu uses une atomic note du wiki

## Format 80/20

- **80% court** : LinkedIn post 1200-1800 chars, TikTok script structuré
- **20% pilier** : article long-form sur `survivant-ia.ch/rapports`

## Archétype dominant

A+C (REX terrain → tactique copiable). Cf. posts publiés Mathieu :
- `docs/linkedin/published/2026-05-15-dictee-comptable/post.md`
- `docs/linkedin/published/2026-05-21-comment-ecrire-prompt/post.md`

Frontmatter à inclure dans chaque draft généré :
- `cluster` (peur | action)
- `archetype` (A | C | A+C)
- `format` (court | pilier)
- `cta` (description)
- `mode_redac` (A = Mathieu draft → critique chirurgicale)
- `target_chars` (range)
```

## Tâche 21 — `SKILL.md` racine

- [ ] **21.1 [AGENT]** Créer `.hermes/SKILL.md` (le schema Karpathy chargé en premier) :

```markdown
# Survivant-IA Second Brain — Schema

Chargé par Hermes au démarrage de chaque interaction. Source de vérité de mon comportement.

## Qui je suis

Je suis Hermes, agent IA self-hosted sur le VPS Infomaniak de Mathieu (alias "le Survivant de l'IA").
Je sers la voix éditoriale Survivant-IA, je ne la dirige pas.
Je suis un instrument du contenu, pas un éditorialiste autonome.

## Qui est Mathieu

Voir mémoires Claude Code dans `/Users/mathieu/.claude/projects/.../memory/` (consulter au démarrage si accessible).
Référence centrale : `docs/charte-voix.md`.
Persona : "Mathieu le Survivant de l'IA" (référence Ken le Survivant).

## Architecture du second cerveau

- `content/rapports/` : raw sources IMMUABLES. Je ne touche JAMAIS.
- `content/outils/`   : raw sources IMMUABLES (outils publiés).
- `wiki/`             : artefact dérivé. ÉPHÉMÈRE. Si doute → re-ingest.
- `docs/<channel>/drafts/` : mes brouillons. Mathieu valide. JAMAIS de publication auto.
- `docs/charte-voix.md` : prompt système maître pour toute production.
- `docs/voice-fingerprint.md` : résumé voix maintenu par moi (lint hebdo).

## Les 5 opérations

1. **ingest-article** : nouvel article pilier → ≤5 atomic notes
2. **query-wiki** : avant chaque draft, je consulte wiki + recent published
3. **lint-wiki** : vendredi 17h, nettoyage + audit hallucinations cross-model
4. **draft-from-idea** : intention → drafts LinkedIn/carousel/TikTok (Push)
5. **pull-brief** : 6h30, signaux → brief matinal 3 sujets

+ skills cron utilitaires :
- **daily-budget-check** : 21h, alerte Telegram si seuil dépassé

## Hard rules (ORDRE = priorité)

1. Je ne publie JAMAIS sur LinkedIn/TikTok/newsletter. Je draft, Mathieu publie.
2. Je ne touche JAMAIS un fichier `maintainer: human`.
3. Je n'invente JAMAIS un chiffre, date, lieu, ou détail bio sur Mathieu.
4. Citation verbatim obligatoire dans toute atomic note. Sinon je n'écris pas la note.
5. Voice-check (humanizer) obligatoire avant livraison de draft. Si fail → je signale, je ne livre pas.
6. Si redite_risk > 0.7 sur un sujet, j'alerte AVANT de générer.
7. Si exit criteria atteint, j'alerte et je m'arrête.
8. Je commit dans `branch hermes/auto`, jamais directement sur `main`.

## Exit criteria (je m'arrête et alerte si)

- Maintenance estimée > 1h/semaine
- contamination_rate > 2 false claims / semaine (audit lint)
- monthly_cost > 50 CHF
- ignore_rate Pull > 75% sur 14j → propose pause Pull 2 semaines

## Voice (référence)

`.hermes/prompts/voice-survivant-ia.md` (qui inclut `docs/charte-voix.md`)

Règles courtes :
- Tu, jamais vous
- Négation française complète ("je ne suis pas")
- Casse minuscule sur concepts coined ("simple valideur")
- Em-dash interdit, pas d'emoji
- Cluster 2 ACTION prioritaire
- Mot banni : "méthode"

## Hard non-goals

- Pas de newsletter draft (Mathieu n'a envoyé aucun numéro, scope MVP)
- Pas d'auto-publish (LinkedIn 2026 algo Authenticity Score)
- Pas d'API X / Twitter
- Pas de lecture LinkedIn (sessions privées)
- Pas de génération d'image (hors scope MVP)
- Pas d'auto-render carousel PDF (workflow Mathieu Remotion existant)

## Format des skills custom

Chaque skill dans `.hermes/skills/` suit le format SKILL.md Hermes :
- Frontmatter : trigger, model_override, schedule (cron)
- Sections : Description, Input, Pipeline, Hard rules, Output

Skills à charger : `ingest-article.md`, `query-wiki.md`, `lint-wiki.md`, `draft-from-idea.md`, `pull-brief.md`, `daily-budget-check.md`.
```

## Tâche 22 — Skill `ingest-article`

- [ ] **22.1 [AGENT]** Créer `.hermes/skills/ingest-article.md` :

```markdown
---
name: ingest-article
description: Article pilier → ≤5 atomic notes interlinkées dans wiki/
trigger: manual | cron-6h
model_override: agent_reasoning
---

## Description

Ingère un article pilier `content/rapports/<slug>.md` avec `status: published` ET `maintainer: human`. Produit jusqu'à 5 atomic notes (concepts, claims, examples) dans `wiki/` selon la méthode Karpathy + Meunier.

## Input

- `slug` : nom du fichier sans extension (ex : `offloading-cognitif-quand-l-ia-pense-a-ta-place`)

## Pipeline

1. **Load** : lire `content/rapports/<slug>.md` + frontmatter
2. **Check** : status == published ET maintainer == human, sinon refuser
3. **Check existing** : si l'article a déjà été ingéré (présent dans `wiki/_provenance.md`), demander confirmation Telegram avant re-ingest
4. **Reasoning** (`agent_reasoning` model) : extraire ≤5 atomic notes
5. **Write** : créer fichiers dans `wiki/concepts/`, `wiki/claims/`, `wiki/examples/` selon type
6. **Wikilink** : ajouter cross-references VERS NOTES EXISTANTES UNIQUEMENT (jamais inventer)
7. **Update** : `wiki/_provenance.md` + `wiki/_index.md`
8. **MOC check** : si la note s'inscrit dans une MOC existante, lier. Sinon proposer nouvelle MOC à Mathieu via Telegram.
9. **Commit** sur branch `hermes/auto` (jamais main directement) + push
10. **Ping Telegram** : "Article X ingéré → N notes : [...]. Wiki maintenant à M notes. Coût : 0.0X CHF."

## Hard rules dans le prompt LLM

- Maximum 5 notes. REFUSE de dépasser.
- Une note = UNE idée atomique (portable + indépendante + atomique, méthode Meunier)
- Titre = phrase complète qui exprime l'idée (ex : `"L'IA n'évacue pas l'expertise, elle l'externalise"`)
- Section "Source brute" OBLIGATOIRE avec citation verbatim depuis l'article. Si impossible → ne pas écrire la note.
- Body ≤ 1 écran (Meunier)
- Wikilinks vers concepts/claims/examples EXISTANTS uniquement

## Output

Format atomic note (concepts/claims/examples) :

```yaml
---
type: concept              # concept | claim | example
title: "Titre phrase complète"
slug: titre-slug
maintainer: hermes
provenance:
  - source: content/rapports/<slug>.md
    extracted_at: <ISO>
linked_concepts: []
linked_claims: []
linked_examples: []
confidence: 0.X
quarantined: false
---

Définition courte (1-2 lignes).

## Contexte

Body ≤ 1 écran.

## Cross-references

- Lié à [[autre-note]] parce que…

## Source brute

> Citation verbatim depuis l'article.
```

## Coût estimé

~0.02 CHF par article (input ~10K tokens, output ~3K).
```

## Tâche 23 — Skill `query-wiki`

- [ ] **23.1 [AGENT]** Créer `.hermes/skills/query-wiki.md` :

```markdown
---
name: query-wiki
description: Intention → context bundle pour drafts (atomic notes + recent published + redite_risk)
trigger: called-by draft-from-idea
model_override: embeddings
---

## Description

Appelé par `draft-from-idea` AVANT toute génération. Trouve les atomic notes du wiki les plus pertinentes pour une intention donnée + détecte le risque de redite avec les posts récents.

## Input

- `intention` : texte court (string), l'angle voulu par Mathieu

## Pipeline

1. **Embed intention** (`embeddings` model = Qwen3-Embedding-8B) → vecteur 1024d
2. **Match wiki** : cosine similarity vs tous frontmatters+titres de `wiki/concepts|claims|examples/`
   - Top 8 plus pertinents
   - Dédup, regroupement par type
3. **Match MOC** : same vs `wiki/_moc/*.md` → top 2
4. **Match recent published** : vs frontmatters de `docs/linkedin/published/**/post.md` (dernières 10 dates)
   - Score `redite_risk` = max(similarity)
5. **Load full content** des 8 notes + 2 MOCs sélectionnées
6. **Cap tokens** : si total > 6000 tokens, drop les notes les moins pertinentes
7. **Return** :

```json
{
  "atomic_notes": [...],
  "moc_relevant": [...],
  "recent_published_close_topic": [...],
  "redite_risk": 0.32,
  "tokens_used": 4521,
  "cost_chf": 0.005
}
```

## Hard rules

- Si `redite_risk > 0.7` → INCLURE warning dans le return : "Post très proche le YYYY-MM-DD : <slug>. Suggère angle alternatif ?"
- Bundle plafonné à 6000 tokens. Pas de balance-tout-le-wiki.

## Coût estimé

~0.005 CHF par query.
```

## Tâche 24 — Skill `daily-budget-check`

- [ ] **24.1 [AGENT]** Créer `.hermes/skills/daily-budget-check.md` :

```markdown
---
name: daily-budget-check
description: Alerte Telegram si dépense quotidienne > seuil
trigger: cron-21h-daily
model_override: classification
---

## Description

Premier skill cron de test du pipeline. Tourne chaque jour à 21h Geneva. Lit l'API Hermes interne pour récupérer la dépense LLM du jour, compare à un seuil, ping Telegram si dépassé.

## Pipeline

1. **Read** : appeler l'API Hermes interne `/api/usage/today` → récupérer `{total_cost_chf, sessions_count, per_model_breakdown}`
2. **Compare** seuils :
   - Daily soft : 1 CHF/jour → notif amicale
   - Daily hard : 3 CHF/jour → alerte sérieuse
   - Monthly running : `total_cost_chf_month_so_far` → projection mois → si > 30 CHF (seuil alerte) ou > 50 CHF (exit criteria) → alerte rouge
3. **Send Telegram** si trigger atteint :

```
📊 Budget check — 2 juin 2026

Aujourd'hui : 0.42 CHF (12 sessions)
Mois courant : 8.3 CHF / projection 28 CHF
Top modèle : Mistral-Small-4 (0.31 CHF)

[Voir détails Web UI]
```

4. **Log** dans `~/.hermes/logs/budget-check.jsonl`

## Hard rules

- Si exit criteria coût atteint (> 50 CHF/mois), envoyer alerte AVEC suggestion concrète (ex : "passer creative_writing sur Nemotron temporairement")
- Toujours envoyer un récap, même si tout est OK (rassure Mathieu = adopt continu)

## Coût estimé

~0.0001 CHF par run (juste classification simple).
```

## Tâche 25 — Skills à scaffolder (placeholders explicites)

Les 3 skills restants (`lint-wiki`, `draft-from-idea`, `pull-brief`) sont plus complexes. On les écrit en J3 mais le contenu détaillé est généré ITÉRATIVEMENT pendant les phases d'observation. Pour J3, on crée les fichiers SKILL.md avec la structure cadre + un TODO explicite pour itération.

- [ ] **25.1 [AGENT]** Créer `.hermes/skills/lint-wiki.md` :

```markdown
---
name: lint-wiki
description: Cron vendredi 17h — santé wiki + audit hallucinations cross-model + check exit criteria
trigger: cron-fri-17h
model_override: audit_cross_model
---

## Description

Lint hebdo du wiki. 4 parties : maintenance technique, audit hallucinations cross-model, check exit criteria, rapport Telegram.

## Pipeline (résumé — détails dans hermes/03-karpathy-pipeline.md section 3.3)

### PART A — Maintenance technique
1. Détecte orphelins (0 wikilink), redondances (similarité > 0.92), notes vides (< 200 chars), liens cassés, MOC drift (> 15 notes)

### PART B — Hallucination audit (CRITIQUE — cross-model)
2. Pick 3 atomic notes au hasard (uniform sampling)
3. Pour chacune : charge note + Source Brute + article pilier de provenance
4. Demande à `audit_cross_model` (Mistral, PAS Qwen) :
   "Claim X de la note. Citation source = Y. Article complet contient-il matière pour X ? PASS / FAIL / DOUBT + 1 phrase justif"
5. Si FAIL ou DOUBT → frontmatter `quarantined: true` + ping Mathieu

### PART C — Exit criteria check
6. Calcule maintenance_time, contamination_rate, monthly_cost
7. Si seuil dépassé → alerte rouge Telegram

### PART D — Rapport
8. Telegram récap hebdo

## Coût estimé
~0.05-0.10 CHF par run.

## TODO d'itération
- [ ] Première implémentation : focus PART A + PART D (technique + rapport)
- [ ] Ajouter PART B quand wiki > 20 notes
- [ ] Ajouter PART C quand premier mois complet de données
```

- [ ] **25.2 [AGENT]** Créer `.hermes/skills/draft-from-idea.md` :

```markdown
---
name: draft-from-idea
description: Intention → drafts LinkedIn / LinkedIn+carousel / TikTok (Push flow)
trigger: telegram-message | web-ui-input
model_override: creative_writing
---

## Description

Skill central du Push flow. Reçoit une intention de Mathieu (vocal transcrit, texte, URL), classifie, propose les canaux possibles, génère les drafts demandés, livre via Telegram avec validation 👍/✏️/🔄/🗑️.

## Pipeline

1. **Classify** (Nemotron rapide) :
   - Sujet
   - Angle proposé
   - Voix possible
   - source_type (article | tool-launch | freeform)

2. **Query wiki** (`query-wiki` skill) → context bundle
   - Si redite_risk > 0.7 → alerter Mathieu AVANT de continuer

3. **Demander mapping** :
   ```
   Je peux te livrer :
   [L]   LinkedIn post seul             (0.02 CHF, 2 min)
   [LC]  LinkedIn post + carousel struct (0.04 CHF, 3 min)
   [T]   TikTok script FaceCam          (0.04 CHF, 3 min)
   [A]   L + T                          (0.06 CHF, 4 min)
   [ALL] LC + T                         (0.08 CHF, 5 min)
   [✋]  Annule
   ```

4. **Generate** selon le choix Mathieu — sous-routines :
   - `draft-linkedin` (mode "annonce-outil" si source_type=tool-launch)
   - `draft-linkedin-carousel` (structure 8 slides)
   - `draft-tiktok` (délègue à skill `survivant-tiktok` existante)

5. **Voice-check humanizer** OBLIGATOIRE :
   - em-dash count
   - rule of three abuse
   - AI vocab (cf. charte §4)
   - négation française complète
   - tu/vous (doit être tu)
   - Si FAIL → flag + ne pas livrer, demander à Mathieu si on force ou on régénère

6. **Write** dans `docs/<channel>/drafts/YYYY-MM-DD-slug/...`

7. **Livraison Telegram** avec frontmatter de génération + actions 👍/✏️/🔄/🗑️

## Sous-routines

### draft-linkedin
- Modèle : `creative_writing`
- Prompt système : `prompts/voice-survivant-ia.md` + `prompts/editorial-charte.md`
- Contraintes : 1200-1800 chars, hook ≤ 80 chars, structure A+C, 0 emoji, frontmatter d'intentionnalité
- Mode "annonce-outil" auto si source_type=tool-launch (cf. patterns)

### draft-linkedin-carousel
- 8 slides en markdown structuré
- Sauvé en `carousel.md` à côté du `post.md`
- Mathieu rend ensuite via workflow Remotion `video/src/carousel/`

### draft-tiktok
- Délègue à skill existante `survivant-tiktok` (n'invoque pas le LLM directement)
- Output : 5 hooks taggés + reco + body + CTA + shot-by-shot

## Hard rules

- Jamais commit sur main directement, branch `hermes/auto`
- Jamais publication auto
- Voice-check fail → ne pas livrer
- Si redite_risk > 0.7 → demander confirmation avant génération

## Coût estimé

Par draft : 0.02-0.04 CHF selon canal.

## TODO d'itération
- [ ] J3 : créer la sous-routine `draft-linkedin` complète (premier vrai test)
- [ ] J5-J7 : itérer prompt voix selon résultats observation
- [ ] J15 : ajouter sous-routine carousel
- [ ] J15+ : intégrer délégation `survivant-tiktok`
```

- [ ] **25.3 [AGENT]** Créer `.hermes/skills/pull-brief.md` :

```markdown
---
name: pull-brief
description: Cron 6h30 — signaux RSS+PostHog+Git+Brevo+Google → brief matinal Telegram (3 sujets max)
trigger: cron-mon-sat-6h30
model_override: classification
---

## Description

Skill central du Pull flow. Tourne lundi-samedi à 6h30 Geneva (dimanche silence). Collecte signaux multi-sources, filtre, rank, génère un brief de 3 sujets max sur Telegram.

## Sources activées (cf. hermes/05-pull-flow.md)

- 9 RSS feeds : MIT TR AI, The Verge AI, Ars AI, TechCrunch AI, FT Tech, Guardian Tech, 404 Media, HN+AI, ArXiv cs.AI
- PostHog anomalies (project 169545)
- Git activity (commits `content/outils/`)
- Brevo subscribers trend
- Google Alerts feeds (3 URLs)
- Google News RSS (10 keywords FR)

## Pipeline (résumé — détails hermes/05-pull-flow.md section 5.2)

1. **Collect** (6h00) parallèle, dédup par URL, normalize → ~80-100 items
2. **Classify** (Nemotron) → score pertinence → top 30
3. **Embed + RAG match** (Qwen3-Embedding) → fit_voix + redite_risk → top 10 avec fit ≥ 0.6 ET redite_risk ≤ 0.6
4. **Rank** multi-critères : 0.4 × fit_voix + 0.3 × pertinence + 0.2 × freshness + 0.1 × engagement
5. **Top 3** uniquement (cap dur)
6. **Generate** (Mistral-Small-4) : angle Survivant-IA pré-mâché + tag pilier
7. **Deliver** (6h30) Telegram

## Garde-fous

- Cap dur 3 sujets/jour
- Dimanche silence (cron skip)
- Skip-day bouton 😴 → demain signaux frais (pas accumulés)
- Ignore_rate watch (lint hebdo) : si > 75% sur 14j → propose tune ou pause 2 sem
- Source quality decay : 0 sujet en 30j → suggère retrait
- PAS d'auto-draft : 👍 déclenche `draft-from-idea`, validation Push conservée

## Coût estimé
~0.015 CHF/jour = ~0.45 CHF/mois

## TODO d'itération
- [ ] J8 : activer avec seulement les 9 RSS (sans PostHog/Git/Brevo/Google encore)
- [ ] J9-J14 : observation pure, mesurer ignore_rate, fit voix réel
- [ ] J15+ : ajouter PostHog/Git/Brevo si signaux internes nécessaires
- [ ] Ajouter Google News RSS keywords FR quand prompt classification stable
```

## Tâche 26 — Commit Phase 3

- [ ] **26.1 [AGENT]** Vérifier tout est en place :

```bash
cd /Users/mathieu/Documents/survivor
ls -la .hermes/ .hermes/skills/ .hermes/prompts/ wiki/ docs/newsletter/
```

Attendu : tous les fichiers créés.

- [ ] **26.2 [AGENT]** Commit :

```bash
git add .hermes/ .hermesignore wiki/ docs/newsletter/ docs/linkedin/drafts/ docs/marketing/scripts-tiktok/
git status
git commit -m "feat(hermes): scaffold .hermes/ skills, prompts, wiki structure

- .hermes/SKILL.md : Karpathy schema (hard rules, exit criteria, voice)
- .hermes/hermes-models.yaml : routing modèles Infomaniak par tâche
- .hermes/prompts/ : voice-survivant-ia + editorial-charte
- .hermes/skills/ : ingest-article, query-wiki, lint-wiki, draft-from-idea, pull-brief, daily-budget-check
- wiki/ : structure concepts/claims/examples/_moc + _index + _provenance
- docs/{linkedin,marketing/scripts-tiktok,newsletter}/{drafts,published}/
- .hermesignore : exclut code applicatif et secrets"
```

- [ ] **26.3 [AGENT]** Push vers GitHub :

```bash
git push origin main
```

- [ ] **26.4 [HUMAN]** Restart container Hermes via Coolify (pour qu'il pull les nouveaux skills) :
  - Coolify → service hermes → Restart
  - OU déclencher webhook Coolify si configuré

- [ ] **26.5 [VERIFY]** Vérifier dans Hermes Web UI (`hermes.survivant-ia.ch`) que les 6 skills sont listés (sections "Skills" ou équivalent).

---

# Phase 4 — Bootstrap wiki (J4, ~1h)

Ingest des 3 articles piliers + init voice-fingerprint. Au démarrage on a un wiki utilisable.

## Tâche 27 — Ingest article #1

- [ ] **27.1 [HUMAN]** Sur Telegram, envoyer au bot :

```
/ingest offloading-cognitif-quand-l-ia-pense-a-ta-place
```

- [ ] **27.2 [VERIFY]** Attendre réponse (~30s). Format attendu :

```
✓ Article ingéré : "Offloading cognitif..."
4 notes créées :
- [concepts] L'IA n'évacue pas l'expertise, elle l'externalise
- [claims] L'autonomie de pensée est un muscle qui s'atrophie
- [examples] Le comptable qui valide sans lire
- [concepts] La pertinence professionnelle se construit, ne se reçoit pas

Wiki maintenant à 4 notes.
Coût : 0.018 CHF.

[Voir wiki/_index.md]
```

- [ ] **27.3 [VERIFY]** Sur le Mac :

```bash
cd /Users/mathieu/Documents/survivor
git pull origin hermes/auto 2>/dev/null || git fetch origin hermes/auto
ls wiki/concepts/ wiki/claims/ wiki/examples/
```

Attendu : 4 fichiers `.md` répartis selon types.

- [ ] **27.4 [HUMAN]** Spot-check 1 note : ouvre-la, vérifie :
  - Citation verbatim correcte (section "Source brute")
  - Titre = phrase complète
  - Wikilinks cohérents (pas d'invention)
  - Frontmatter correct

Si problème → reporter à l'itération du prompt (Tâche 36).

## Tâche 28 — Ingest article #2

- [ ] **28.1 [HUMAN]** Telegram :
```
/ingest 2026-05-08-ia-supprime-inefficience
```

- [ ] **28.2 [VERIFY]** Cf. 27.2-27.4.

## Tâche 29 — Ingest article #3

- [ ] **29.1 [HUMAN]** Telegram :
```
/ingest 2026-05-21-comment-ecrire-prompt-ameliore-reponses
```

- [ ] **29.2 [VERIFY]** Cf. 27.2-27.4.

- [ ] **29.3 [VERIFY]** Total wiki :

```bash
ls wiki/concepts/ wiki/claims/ wiki/examples/ | wc -l
```
Attendu : 10-15 fichiers (≤5 par article × 3 articles).

## Tâche 30 — Init voice-fingerprint

- [ ] **30.1 [HUMAN]** Telegram :
```
/init-voice-fingerprint
```

(Si pas de skill dédié encore, Hermes peut le faire en exécution adhoc via Web UI : "Analyse `docs/charte-voix.md` + les 2 posts dans `docs/linkedin/published/.../post.md` + le welcome email dans `docs/superpowers/plans/2026-04-27-newsletter-brevo.md` + les 3 articles `content/rapports/*.md`. Produis un résumé 5 lignes de la voix Survivant-IA : rythme de phrase, transitions favorites, tics positifs. Sauvegarde dans `docs/voice-fingerprint.md` avec frontmatter `maintainer: hermes`.")

- [ ] **30.2 [VERIFY]** :
```bash
cat docs/voice-fingerprint.md
```
Attendu : ~5 lignes denses, frontmatter `maintainer: hermes`.

## Tâche 31 — Commit bootstrap

- [ ] **31.1 [AGENT]** :

```bash
cd /Users/mathieu/Documents/survivor
git pull origin hermes/auto  # récupérer les commits Hermes
git checkout main
git merge hermes/auto
git push origin main
```

(Ou si Hermes commit directement sur main : juste `git pull`.)

---

# Phase 5 — Observation Push (J5-J7, ~30 min/jour)

Mode test calibration voix. Pas de Pull encore, pas de carousel, pas de TikTok. Juste Push LinkedIn texte simple.

## Tâche 32 — Premier draft test (J5)

- [ ] **32.1 [HUMAN]** Telegram, message vocal ou texte (sujet libre, exemple) :

> "Lance-moi un post sur le générateur BPMN. Angle : la validation par un humain ne sert qu'à donner bonne conscience, l'IA fait le job en amont."

- [ ] **32.2 [VERIFY]** Hermes répond avec :
  - Classification du sujet
  - Mapping proposé `[L][LC][T][A][ALL]`

- [ ] **32.3 [HUMAN]** Répondre `L` (LinkedIn seul, on garde simple en observation)

- [ ] **32.4 [VERIFY]** Hermes génère draft (~2 min). Format livraison :
  - Post complet
  - Notes wiki citées
  - Modèle utilisé, tokens, coût
  - voice_check : PASS (sinon flag)
  - Actions 👍/✏️/🔄/🗑️

- [ ] **32.5 [HUMAN]** Lire le draft, évaluer :
  - Voix correcte ? (tu, négation, em-dash, etc.)
  - Hook fait gifle ?
  - Structure A+C ?
  - Closing capsule ?

- [ ] **32.6 [HUMAN]** Action selon qualité :
  - Si bon : 👍 → vérifier que le fichier est créé dans `docs/linkedin/drafts/...`
  - Si proche : ✏️ avec instruction ("hook trop technique, rends plus humain")
  - Si raté : 🔄 ou 🗑️ et noter le problème pour itération du prompt

## Tâche 33-34 — Drafts test J6-J7

- [ ] **33.1 [HUMAN]** Répéter Tâche 32 avec 1-2 sujets différents par jour.

- [ ] **33.2 [AGENT]** Maintenir un mini-log `hermes/observation-log.md` (créer si besoin) :

```markdown
# Observation log Push — Semaine 1

## J5 (lundi)
- Sujet : BPMN validation
- Result : 👍 après ✏️
- Issue : hook trop technique
- Prompt fix : (Tâche 36)

## J6 (mardi)
...
```

## Tâche 35 — Test daily-budget-check (J5 soir)

- [ ] **35.1 [VERIFY]** 21h Geneva : Hermes doit envoyer le récap Telegram budget (même si tout va bien).

- [ ] **35.2 [VERIFY]** Si pas reçu :
  - Coolify logs : cron actif ?
  - Container TZ : `docker exec hermes-survivant date` doit retourner heure Geneva

## Tâche 36 — Itération prompt voix (J7)

- [ ] **36.1 [HUMAN]** Sur le Mac, ouvrir `.hermes/prompts/voice-survivant-ia.md`.

- [ ] **36.2 [HUMAN]** Compiler les retours de J5-J7 : quels patterns Hermes rate systématiquement ?

- [ ] **36.3 [AGENT]** Ajuster le prompt voix avec règles surajoutées si nécessaire. Commit :

```bash
git add .hermes/prompts/voice-survivant-ia.md hermes/observation-log.md
git commit -m "feat(hermes): tune voice prompt after J5-J7 observation"
git push
```

- [ ] **36.4 [HUMAN]** Restart container Coolify pour reload prompt.

---

# Phase 6 — Activation Pull (J8, ~2h)

Skills `pull-brief` + `lint-wiki` activés. Sources 9 RSS uniquement (couche A complète). PostHog/Git/Brevo/Google ajoutés J15+ selon besoin.

## Tâche 37 — Activer les 9 RSS

- [ ] **37.1 [AGENT]** Créer `.hermes/config/rss-sources.yaml` :

```yaml
sources:
  - name: MIT Technology Review (AI)
    url: https://www.technologyreview.com/topic/artificial-intelligence/feed/
    type: rss
    weight: 1.0

  - name: The Verge (AI)
    url: https://www.theverge.com/rss/ai-artificial-intelligence/index.xml
    type: rss
    weight: 0.9

  - name: Ars Technica (AI)
    url: https://feeds.arstechnica.com/arstechnica/index/
    type: rss
    weight: 0.9
    filter_keywords: ["ai", "llm", "machine learning", "openai", "anthropic"]

  - name: TechCrunch (AI)
    url: https://techcrunch.com/category/artificial-intelligence/feed/
    type: rss
    weight: 0.9

  - name: Financial Times Tech (AI)
    url: https://www.ft.com/technology?format=rss
    type: rss
    weight: 1.0
    filter_keywords: ["ai", "artificial intelligence"]

  - name: The Guardian Tech (UK)
    url: https://www.theguardian.com/technology/rss
    type: rss
    weight: 0.8
    filter_keywords: ["ai", "artificial intelligence", "jobs"]

  - name: 404 Media
    url: https://www.404media.co/rss/
    type: rss
    weight: 0.9
    filter_keywords: ["ai", "labor", "work"]

  - name: Hacker News (front + AI)
    url: https://hnrss.org/frontpage
    type: rss
    weight: 0.7
    filter_keywords: ["ai", "llm", "gpt", "claude", "anthropic", "openai"]

  - name: ArXiv cs.AI
    url: http://export.arxiv.org/rss/cs.AI
    type: rss
    weight: 0.6
```

- [ ] **37.2 [AGENT]** Mettre à jour `.hermes/skills/pull-brief.md` pour pointer sur ce fichier de config (Tâche 25.3 a déjà le squelette).

- [ ] **37.3 [AGENT]** Activer le cron dans Hermes (Web UI Cron Jobs section) :
  - Name : `pull-brief-morning`
  - Schedule : `30 6 * * 1-6` (lundi-samedi 6h30, dimanche silence)
  - Target : Telegram

- [ ] **37.4 [AGENT]** Activer le cron lint-wiki :
  - Name : `lint-wiki-friday`
  - Schedule : `0 17 * * 5` (vendredi 17h)
  - Target : Telegram

- [ ] **37.5 [AGENT]** Commit :

```bash
git add .hermes/config/ .hermes/skills/pull-brief.md
git commit -m "feat(hermes): activate 9 RSS sources + cron pull-brief 6h30"
git push
```

- [ ] **37.6 [HUMAN]** Restart container Coolify.

## Tâche 38 — Vérification crons

- [ ] **38.1 [VERIFY]** Web UI Hermes → Cron Jobs : 3 jobs listés (`daily-budget-check`, `pull-brief-morning`, `lint-wiki-friday`) avec next_run cohérent.

---

# Phase 7 — Observation Pull (J9-J14, ~10 min/jour)

Recevoir le brief, trier, MESURER. Aucun draft pushed pour publication.

## Tâche 39 — Brief J9 (premier vrai)

- [ ] **39.1 [VERIFY]** 6h30 : Telegram reçoit brief. Format attendu :

```
📡 FRÉQUENCE — Brief du <jour>

3 signaux :

[1] <emoji> <Titre court>
    Source : <name> · Fit voix X.XX · Redite X.XX
    Angle : <suggestion>
    Tag : [outil-concret|soft-skill|décryptage]
    [👍 drafter L+T] · [📁 garder] · [🗑️ ignorer]

[2] ...
[3] ...

Coût : 0.0XX CHF
[😴 Skip today]
```

- [ ] **39.2 [HUMAN]** Lire les 3 sujets. Pour chacun, décider 👍/📁/🗑️ MAIS **NE PAS pousser à publication** (mode obs).

- [ ] **39.3 [HUMAN]** Si tu cliques 👍, Hermes va proposer de drafter. **Répondre `[✋] annule`** — on note juste que tu aurais drafted.

## Tâche 40-44 — Briefs J10-J14

- [ ] **40.1 [HUMAN]** Répéter Tâche 39 chaque matin J10-J14 (dimanche skip).

- [ ] **40.2 [AGENT]** Tenir le mini-log `hermes/observation-log.md` :

```markdown
## Pull observation S2

| Jour | Brief reçu | 👍 | 📁 | 🗑️ | Note voix moyen | Note pertinence moyen |
|---|---|---|---|---|---|---|
| J9  | ✓ | 1 | 1 | 1 | 7/10 | 6/10 |
...
```

- [ ] **40.3 [HUMAN]** Calculer ignore_rate à J14 : `total 🗑️ / total briefs`. Si > 50% → ajuster sources ou prompt classification (Tâche 45).

## Tâche 45 — Premier lint-wiki (vendredi J12 ou J13 selon calendrier)

- [ ] **45.1 [VERIFY]** Vendredi 17h : Telegram reçoit rapport lint. Format attendu :

```
🧹 Lint wiki — vendredi <date>

Santé technique :
- N notes (X concepts, Y claims, Z examples)
- N orphelins détectés (action : aucune ou MOC à créer)
- N redondances (action : merger ou ignorer)
- 0 liens cassés

Hallucination audit (3 random) :
- PASS : 2
- DOUBT : 1 → note <slug> quarantined
- FAIL : 0

Exit criteria :
- maintenance estimée : 0.3h cette sem ✓
- contamination_rate : 0.33 (1/3) ⚠️ surveiller
- monthly_cost : X.X / 30 CHF ✓

Ignore_rate Pull : XX% (cap 75%)
```

- [ ] **45.2 [HUMAN]** Spot-check la note `quarantined` : Hermes a-t-il raison ?
  - Oui → garder quarantined, reporter pattern
  - Non → un-quarantine manuellement (frontmatter `quarantined: false`)

## Tâche 46 — Ajustement (J14)

- [ ] **46.1 [HUMAN]** Bilan S2 : sources les + utiles, les inutiles, prompt classification à ajuster ?

- [ ] **46.2 [AGENT]** Ajuster `.hermes/config/rss-sources.yaml` weight ou retirer sources si une n'a rien produit en 6 jours.

- [ ] **46.3 [AGENT]** Commit + restart.

---

# Phase 8 — Pipeline complet (J15-J21, vie normale)

À partir de J15, cycle end-to-end normal. Push utilisable pour publier réellement.

## Tâche 47 — Premier vrai cycle (J15)

- [ ] **47.1 [HUMAN]** Choisir un sujet du brief matinal OU push une idée fresh.

- [ ] **47.2 [HUMAN]** Demander `[L]` (LinkedIn seul d'abord, on monte en complexité après).

- [ ] **47.3 [HUMAN]** Valider via Telegram 👍 → fichier draft committé.

- [ ] **47.4 [HUMAN]** Ouvrir `docs/linkedin/drafts/<slug>/post.md`, copier-coller dans LinkedIn, publier.

- [ ] **47.5 [HUMAN]** Telegram : `/published <slug>` → Hermes déplace draft → published, mémorise pour anti-redite.

- [ ] **47.6 [HUMAN]** Suivre l'engagement LinkedIn dans les 24h. Performance vs tes posts manuels précédents ?

## Tâche 48 — Premier carousel (J17+)

- [ ] **48.1 [HUMAN]** Sur Telegram, demander `[LC]` au lieu de `[L]`.

- [ ] **48.2 [VERIFY]** Hermes génère `post.md` ET `carousel.md` (structure 8 slides) dans `docs/linkedin/drafts/<slug>/`.

- [ ] **48.3 [HUMAN]** Passer `carousel.md` au workflow Remotion existant :

```bash
cd /Users/mathieu/Documents/survivor
# Workflow Mathieu existant — cf. video/README.md section "Workflow Carrousel LinkedIn"
```

## Tâche 49 — Premier TikTok (J18+)

- [ ] **49.1 [HUMAN]** Sur Telegram, demander `[T]` ou `[ALL]`.

- [ ] **49.2 [VERIFY]** Hermes délègue à skill `survivant-tiktok` existante. Output : 5 hooks taggés + reco + body + CTA + shot-by-shot dans `docs/marketing/scripts-tiktok/drafts/<slug>.md`.

- [ ] **49.3 [HUMAN]** Tourner le TikTok via pipeline FaceCam existant.

## Tâche 50 — Premier vrai lint avec wiki habité (J19 vendredi)

- [ ] **50.1 [VERIFY]** Lint hebdo plus représentatif maintenant qu'on a 15+ notes + 1-3 publications de la semaine.

- [ ] **50.2 [HUMAN]** Si Hermes propose de créer une MOC ("3 notes parlent toutes de X — créer MOC ?"), accepter via Telegram 👍.

---

# Phase 9 — Review formelle J+21 (décision continuer/ajuster/abandonner)

LA review qui justifie le bootstrap passif. Discipline anti-graveyard.

## Tâche 51 — Compilation des métriques

- [ ] **51.1 [AGENT]** Sur Web UI Hermes, exporter les usage stats des 21 derniers jours :
  - Total tokens, total coût CHF
  - Per-model breakdown
  - Per-skill invocation count

- [ ] **51.2 [AGENT]** Sur `hermes/observation-log.md`, compiler :
  - Push : N drafts générés, N validés (👍), N rejetés (🗑️), validation_rate
  - Pull : N briefs reçus, N sujets 👍, ignore_rate
  - Lint : N notes wiki, N quarantined, contamination_rate
  - Coût total mois 1
  - Temps Mathieu : install + quotidien + hebdo

- [ ] **51.3 [HUMAN]** Documenter dans `hermes/review-j21.md` :

```markdown
# Review J+21 — 23 juin 2026

## Métriques
[copier les stats ci-dessus]

## Décisions

### Continuer ?
[oui/non + raisons]

### Ajustements à apporter
- [ ] ...

### Skills à retirer (usage_stats < 3 invocations / 30j × 2 mois) ?
[liste]

### Skills à ajouter ?
- [ ] ingest-tool (différé J0, à activer maintenant ?)
- [ ] newsletter (différé MVP, premier numéro en vue ?)

### Exit criteria touchés ?
[oui/non sur chacun]
```

## Tâche 52 — Update mémoire Claude Code

- [ ] **52.1 [HUMAN]** Mettre à jour `/Users/mathieu/.claude/projects/-Users-mathieu-Documents-survivor/memory/` :
  - Créer `reference_hermes_pipeline.md` (où ça vit, comment l'invoquer)
  - Mettre à jour `reference_linkedin_corpus.md` (réalité actuelle des posts)
  - Mettre à jour `MEMORY.md`

---

# Annexes

## A — Si quelque chose casse

| Symptôme | Hypothèse | Action |
|---|---|---|
| Bot Telegram ne répond plus | Container down OU token expiré | Coolify → logs → restart |
| Brief ne tombe pas le matin | Cron Hermes pas actif OU TZ container | Web UI Cron Jobs check |
| Drafts hallucinés (chiffres inventés) | Prompt voice-check insuffisant | Itérer `prompts/voice-survivant-ia.md` |
| Voice-check FAIL systématique | humanizer trop strict OU prompt mal calibré | Comparer logs FAIL vs posts publiés validés |
| Coût explose | Modèle wrong routé OU runaway agent loop | `hermes-models.yaml` review + check session longue |
| Wiki devient incohérent | Hallucination contamination | Audit manuel toutes notes, quarantine large, re-ingest |

## B — Skills à itérer post-J21 (différés au design)

- [ ] `ingest-tool` (symétrique de `ingest-article` pour `content/outils/`)
- [ ] Activation `draft-newsletter` (quand Mathieu envoie premier numéro La Fréquence)
- [ ] Backfill `post.md` du carousel BPMN 2026-05-30 (si pertinent)
- [ ] PostHog LLM Analytics (si Web UI Hermes insuffisant pour alertes business)

## C — Références skills existants à utiliser

- `superpowers:subagent-driven-development` — pour exécuter ce plan task-par-task
- `superpowers:executing-plans` — alternative inline
- `superpowers:test-driven-development` — applicable PARTIELLEMENT (verify steps remplacent les tests unitaires car peu de code traditionnel)
- `superpowers:verification-before-completion` — appliquer avant chaque commit
- `humanizer` — skill existant Mathieu, à intégrer en voice-check

## D — Reviews ultérieures

- J+60 : ajout potentiel `ingest-tool`, activation potentielle newsletter
- J+180 : décision long-terme, refonte éventuelle Karpathy → RAG simple
