# Install checklist — Hermes Survivant-IA

Checklist actionnable pour J1-J7. Source : `06-security-ops-install.md` section 6.5 et 6.6.

## J1 — Pre-install (côté Mathieu, ~45 min)

### DNS
- [ ] Créer A-record `hermes.survivant-ia.ch` → `83.228.212.229` chez registrar

### VPS
- [ ] SSH au VPS : `ssh -i ~/.ssh/infomaniak_vps ubuntu@83.228.212.229`
- [ ] Ajouter 4 GB swap :
  ```bash
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  free -h
  ```

### GitHub
- [ ] Sur le VPS : `ssh-keygen -t ed25519 -C "hermes-deploy" -f ~/.ssh/hermes_deploy`
- [ ] `cat ~/.ssh/hermes_deploy.pub` — copier la clé publique
- [ ] GitHub → repo `survivor` → Settings → Deploy keys → Add → coller, cocher "Allow write access"
- [ ] Tester : `ssh -i ~/.ssh/hermes_deploy -T git@github.com` (doit dire "successfully authenticated")

### Telegram
- [ ] Telegram → chercher `@BotFather` → `/newbot`
  - Nom : `Survivant IA Hermes`
  - Username : `SurvivantIAHermes_bot` (ou variant si pris)
- [ ] **Copier le token** (HTTP API token, format `123456:ABC-DEF...`)
- [ ] Envoyer 1 message au bot
- [ ] Chercher `@userinfobot` → `/start` → **copier ton user_id** (nombre entier)

### Infomaniak AI
- [ ] Vérifier token v2 fonctionne :
  ```bash
  curl -H "Authorization: Bearer $INFOMANIAK_AI_TOKEN" \
    https://api.infomaniak.com/2/ai/106389/openai/v1/models
  ```
- [ ] Doit retourner une liste JSON de modèles avec `mistralai/Mistral-Small-4-119B-2603`, `Qwen/Qwen3.5-122B-A10B-FP8`, etc.

### PostHog
- [ ] PostHog (EU) → Project Settings → Personal API Keys → Create
- [ ] Scope : project 169545, **read-only**
- [ ] Copier la clé

### Google Alerts
- [ ] Aller sur https://www.google.com/alerts
- [ ] Créer 3 alertes :
  - `"Survivant-IA"` — Fréquence : "à mesure" — Sources : Tout — Langue : français — Région : Suisse — Délivrer à : **flux RSS**
  - `"survivant-ia.ch"` — idem
  - `"Mathieu Rerat" IA` — idem
- [ ] Copier les 3 URLs RSS générées

### Web UI Hermes
- [ ] Choisir un mot de passe Basic Auth (16+ chars, gestionnaire de mots de passe)

### Secrets bag (à coller dans Coolify env vars en J2)
```
INFOMANIAK_AI_TOKEN=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_OWNER_USER_ID=...
GIT_DEPLOY_KEY=<contenu de ~/.ssh/hermes_deploy>
POSTHOG_API_KEY=...
POSTHOG_HOST=https://eu.posthog.com
POSTHOG_PROJECT_ID=169545
BREVO_API_KEY=... (optionnel J1, peut attendre)
GOOGLE_ALERTS_FEED_URLS=url1,url2,url3
HERMES_WEB_UI_USER=mathieu
HERMES_WEB_UI_PASSWORD=...
```

## J2 — Déploiement (Coolify + DNS + auth)

- [ ] Coolify → New Resource → Docker Compose (template Hermes — à adapter selon doc Nous Research au moment de l'install)
- [ ] Coller toutes les env vars du secrets bag
- [ ] Configurer Traefik route : `hermes.survivant-ia.ch` → port interne Hermes
- [ ] Coolify → Basic Auth middleware Traefik (cf. doc Coolify)
- [ ] (Optionnel) IP allowlist middleware Traefik
- [ ] Démarrer le container
- [ ] Vérifier `https://hermes.survivant-ia.ch` répond + cert TLS valide
- [ ] Tester login Web UI
- [ ] Envoyer `/start` au bot Telegram → doit répondre

## J3 — Config skills

- [ ] Cloner le repo dans le volume Hermes : `git clone git@github.com:.../survivor.git /workspace`
- [ ] Créer `.hermes/SKILL.md` (cf. `03-karpathy-pipeline.md` section 3.4)
- [ ] Créer `.hermes/prompts/voice-survivant-ia.md` (inclut `docs/charte-voix.md` + patterns observés)
- [ ] Créer `.hermes/skills/ingest-article.md`
- [ ] Créer `.hermes/skills/query-wiki.md`
- [ ] Créer `.hermes/skills/daily-budget-check.md`
- [ ] Créer `.hermes/hermes-models.yaml` avec routing
- [ ] Créer `.hermesignore` à la racine repo
- [ ] Commit + push

## J4 — Bootstrap wiki

- [ ] Lancer `ingest-article` sur les 3 articles piliers via Web UI :
  - `content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md`
  - `content/rapports/2026-05-08-ia-supprime-inefficience.md`
  - `content/rapports/2026-05-21-comment-ecrire-prompt-ameliore-reponses.md`
- [ ] Vérifier ~10-15 atomic notes créées dans `wiki/`
- [ ] Init `docs/voice-fingerprint.md` (Hermes peut le faire à partir charte + 2 posts + welcome email)
- [ ] (Optionnel) Backfill `post.md` du carousel BPMN 2026-05-30 si Mathieu valide
- [ ] (Optionnel) Mettre à jour la mémoire `reference_linkedin_corpus.md` si Mathieu valide

## J5-J7 — Mode observation Push

- [ ] Daily : tester Push Telegram 1-2 fois
- [ ] Mesurer : voice_check pass rate, validation rate, coût/draft
- [ ] Ajuster `prompts/voice-survivant-ia.md` si voix dérive

## J8 — Activation Pull

- [ ] Créer `.hermes/skills/pull-brief.md`
- [ ] Créer `.hermes/skills/lint-wiki.md`
- [ ] Config sources : 9 RSS feeds + PostHog/Git/Brevo + Google Alerts + Google News RSS
- [ ] Activer cron 6h30 + cron vendredi 17h + cron 21h

## J9-J14 — Observation Pull

- [ ] Recevoir brief 6h30 chaque matin
- [ ] Trier 👍/📁/🗑️ sans pousser de draft
- [ ] Mesurer ignore_rate, fit voix réel

## J15-J21 — Pipeline complet

- [ ] J15 : premier vrai cycle end-to-end (Pull brief → 👍 → draft → validation → publication manuelle)
- [ ] Premier `lint-wiki` le vendredi
- [ ] Premier audit hallucinations

## J22 — Review formelle

- [ ] usage_stats des skills
- [ ] ignore_rate Pull
- [ ] Exit criteria touchés ?
- [ ] Décision : continuer / ajuster / abandonner

## Reviews ultérieures

- [ ] J+60 : décision ajout `ingest-tool`, activation newsletter
- [ ] J+180 : décision long-terme
