# Hermes — Pipeline de contenu Survivant-IA

**Date** : 2026-06-02
**Auteur** : Mathieu + Claude (brainstorming session)
**Statut** : Design validé, en attente d'implementation plan
**Référence dossier** : `hermes/` (breakdown navigable des mêmes sections)

---

## Goal

Mettre en place un agent **Hermes** (Nous Research, MIT, self-hosted) sur le VPS Infomaniak pour automatiser le pipeline de contenu Survivant-IA. L'agent transforme un article pilier ou une idée brute en dérivés multi-canal (LinkedIn post, LinkedIn carousel structure, TikTok script), avec un second cerveau structuré façon Karpathy LLM Wiki dans le repo Git, validation manuelle systématique sur Telegram, et garde-fous anti-graveyard pour survivre à 6 mois.

**Scope MVP** : Pipeline contenu uniquement. **Pipeline outils** (réponse rapide à un problème par publication d'un outil sur `survivant-ia.ch`) explicitement hors scope, à traiter dans un spec séparé.

**Non-goals explicites** :
- Pas d'auto-publication (LinkedIn 2026 algo pénalise auto-publish : -50 à -70% reach)
- Pas de newsletter draft au MVP (0 numéro envoyé, pas de raison de drafter dans le vide)
- Pas d'API X / Twitter (skip social signals, presse tech anglo + Google News RSS suffit)
- Pas d'Ollama local (VPS 4 vCPU sans GPU, ROI négatif)
- Pas de PostHog LLM Analytics au MVP (Hermes Web UI natif suffit pour suivi tokens/coûts)

## Architecture (vue d'ensemble)

```
       REPO GIT (= vault Obsidian)
       ─ content/rapports/   articles piliers (RAW, immuables côté Hermes)
       ─ content/outils/     descriptions outils (RAW)
       ─ wiki/               atomic notes (LLM-generated, éphémère)
       ─ docs/linkedin/      drafts/ + published/
       ─ docs/marketing/     scripts-tiktok/ drafts + published
       ─ docs/newsletter/    (différé)
       ─ .hermes/            SKILL.md + skills/ + prompts/

          ↑ lit/écrit               ↑ tu édites
       ┌──────────────────┐    ┌──────────────────┐
       │ HERMES (VPS)     │    │ Obsidian Mac/iOS │
       │ Coolify + Traefik│    │ + plugin Git     │
       │ hermes.survivant-│    └──────────────────┘
       │ ia.ch            │
       │ Infomaniak AI    │
       └──────────────────┘
            ↓     ↑
       Telegram bot + Web UI
            ↓     ↑
       Mathieu (validation V1, manuelle systématique)

       Pull signals → 7 RSS tech anglo + HN + ArXiv +
                      PostHog + Git + Brevo + Google News RSS (FR) +
                      Google Alerts
```

## Décisions structurelles (validées en brainstorming)

| Sujet | Décision |
|---|---|
| LLM provider | Infomaniak AI uniquement (souveraineté CH, coût prévisible) |
| Modèle routing | Qwen3.5-122B agent / Mistral-Small-4-119B créatif / Nemotron-Nano-30B classification / Qwen3-Embedding-8B RAG |
| Hôte | VPS Infomaniak `83.228.212.229` via Coolify + Traefik (existants) |
| Sous-domaine | `hermes.survivant-ia.ch` |
| Trigger | Push (Telegram + Web UI) **et** Pull (brief matinal 6h30) |
| Validation | V1 = manuelle systématique, commit dans repo, publication à la main par Mathieu |
| Knowledge base | Karpathy LLM Wiki pattern (3 couches : raw / wiki / schema) |
| Source canonique | Article pilier OU outil publié (2 types confirmés) |
| Canaux sortie | LinkedIn post / LinkedIn carousel structure / TikTok script |
| Newsletter | Différée hors MVP, architecture compatible |
| Voice | Charte `docs/charte-voix.md` = prompt système maître + patterns observés sur posts publiés |
| Tutoiement | "tu" systématique, jamais "vous" |
| Cluster édito | Cluster 2 action prioritaire (pas cluster peur) |

## 9 garde-fous anti-graveyard (recherche → design)

Issus de 18+ sources de recherche (Karpathy LLM Wiki criticism, Tiago Forte critiques, Collector's fallacy, AI brain fry, LinkedIn 2026 algo, Obsidian plugin bloat, Eliott Meunier Atomic Thinking) :

1. **3 skills core uniquement au démarrage** : `ingest-article`, `query-wiki`, `daily-budget-check`. Le reste à la demande.
2. **Cap dur 5 atomic notes / article** au lieu de 8-15. Lint hebdo purge redondances.
3. **Exit criteria explicites dans SKILL.md** : abandonne si maintenance > 1h/sem OU contamination > 2 false claims/sem OU coût > 50 CHF/mois → fallback RAG simple.
4. **Audit hallucinations hebdo cross-model** : Mistral audite Qwen (un LLM mauvais juge de ses propres erreurs).
5. **Plugins Obsidian strict** : Git, Templater, Smart Connections (quand wiki > 50 notes). STOP.
6. **MOC par questions** (méthode Meunier), jamais exhaustives.
7. **Wiki éphémère** — hard rule dans SKILL.md : si attachement émotionnel → re-ingest depuis raw.
8. **Voice-check humanizer obligatoire** avant chaque draft livré.
9. **Bootstrap passif** étalé sur 3 semaines avec mode observation, pas all-in J+1.

## Les 6 sections du design

Détails complets dans `hermes/01` à `hermes/06`. Synthèse ici :

### 1. Infrastructure & déploiement
- Container Docker via Coolify
- Volumes : `~/.hermes/memory/`, `/workspace/` (clone Git)
- Pré-requis : 4 GB swap, A-record DNS, deploy key GitHub
- Routing modèles dans `hermes-models.yaml` versionné
- Monitoring : Hermes Web UI natif (tokens/coûts) + skill cron `daily-budget-check` Telegram alerte

### 2. Structure du vault & conventions
- Vault = repo Git lui-même. Obsidian = UI confort sur le même dossier.
- Nouveau : `wiki/{concepts,claims,examples,_moc,_provenance}/`, `docs/<channel>/drafts/`, `.hermes/`, `.hermesignore`
- Frontmatter standardisé `maintainer: human|hermes|shared` pour éviter conflits Mathieu/Hermes
- Bootstrap : ingest des 3 articles piliers (≤5 atomic notes chacun), init `docs/voice-fingerprint.md`

### 3. Pipeline Karpathy (ingest / query / lint)
- **3 skills SKILL.md** au format Hermes
- **Ingest** : article → ≤5 atomic notes avec citation verbatim obligatoire (anti-hallucination)
- **Query** : avant chaque draft, embedding match wiki + recent published (anti-redite, redite_risk > 0.7 = alerte)
- **Lint** (vendredi 17h) : santé technique + audit hallucinations cross-model + check exit criteria
- `SKILL.md` racine = schema Karpathy (qui, quoi, hard rules, exit criteria, voice)

### 4. Push flow (Telegram + Web UI → drafts)
- Bot Telegram whitelist user_id Mathieu, rate limit 20/h 50/jour
- Web UI `hermes.survivant-ia.ch` + Basic Auth + IP allowlist
- Skill unique `draft-from-idea` avec sous-routines LinkedIn / LinkedIn+carousel / TikTok
- Mode "annonce-outil" appliqué auto quand source = `from: tool-launch` (template hook/pivot/self-disclosure/80-20/CTA non-extractif/closing capsule)
- Charte voix = prompt système maître, voice-check humanizer avant livraison
- Validation Telegram 👍/✏️/🔄/🗑️, drafts committés dans `docs/<channel>/drafts/`

### 5. Pull flow (signaux → brief matinal 6h30)
- **9 sources** : MIT TR AI, The Verge AI, Ars AI, TechCrunch AI, FT Tech, Guardian Tech, 404 Media, HN+ArXiv + PostHog + Git + Brevo + Google News RSS (10 keywords FR) + Google Alerts
- Pipeline : collect → classify (Nemotron) → embed RAG match wiki → rank multi-critères → top 3 brief
- Brief Telegram 6h30 : 3 sujets max, angle Survivant-IA pré-mâché, tag pilier
- Garde-fous : cap dur 3, dimanche silence, skip-day, ignore_rate watch, source quality decay
- Pas d'auto-draft : 👍 déclenche `draft-from-idea` (validation Push conservée)
- Vendredi 18h : mini-recap rétro (anti-burnout)

### 6. Sécurité, ops, déploiement, calendrier
- Secrets en env Coolify, jamais en repo
- Telegram whitelist stricte, browser-use scopé sites publics uniquement
- Backup quotidien `~/.hermes/memory/` chiffré vers Infomaniak kDrive
- Update Hermes : version pinnée, check mensuel manuel
- Pre-install checklist ~45 min côté Mathieu
- Bootstrap passif 3 semaines : S1 Push manuel, S2 Pull observation, S3 cycle complet
- Reviews formelles J+21, J+60, J+180 avec option abandon réelle

## Budget & métriques

| Métrique | Cible / Estimation |
|---|---|
| Coût LLM mensuel | 6-20 CHF/mois (selon volume Push) |
| Coût Pull seul | ~0.45 CHF/mois |
| Seuil alerte budget | 30 CHF/mois |
| Exit criteria coût | 50 CHF/mois |
| Exit criteria maintenance | > 1h/semaine |
| Exit criteria contamination | > 2 false claims / semaine |
| Effort install (Mathieu) | ~3-4h sur 2 jours |
| Effort quotidien | 5-15 min |
| Effort hebdo (lint) | 10 min vendredi |
| RTO disaster | 2h |

## Risques identifiés (à surveiller)

1. **Hallucination contamination** dans le wiki (cf. Proudfrog LLM Wiki criticism). Mitigation : cross-model audit hebdo + spot-check 3 random notes/semaine.
2. **AI brain fry** (recherche Harvard 2026, seuil 3+ agents IA). Mitigation : 3 skills core, ajout progressif.
3. **Pull burnout** (ignore_rate qui monte → désintérêt → abandon). Mitigation : cap 3, dimanche off, skip-day, lint watch.
4. **Drift voix** quand Hermes draft seul. Mitigation : charte voix verrouillée, voice-fingerprint maintenu, validation V1.
5. **LinkedIn 2026 algo Authenticity Score** pénalise contenu AI générique. Mitigation : voice-check humanizer obligatoire, pas d'auto-publish, validation Mathieu systématique.
6. **Coût qui dérive**. Mitigation : daily-budget-check Telegram, hard cap 50 CHF, modèles routés par task (Nemotron sur volume).
7. **VPS disque 19 GB serré**. Mitigation : monitoring `~/.hermes/` + caches, alerte si > 12 GB used.

## Prochaines étapes

1. Mathieu reviewe ce spec + le breakdown `hermes/`
2. Si validé : implementation plan via skill `writing-plans`
3. Pre-install checklist côté Mathieu (~45 min)
4. Install J1-J2 (déploiement Coolify + DNS + config skills)
5. Bootstrap passif 3 semaines per calendrier Section 6.6
6. Review J+21 avec décision poursuivre/ajuster/abandonner

## Annexes (dans `hermes/`)

- `hermes/README.md` — navigation
- `hermes/01-infrastructure.md`
- `hermes/02-vault-structure.md`
- `hermes/03-karpathy-pipeline.md`
- `hermes/04-push-flow.md`
- `hermes/05-pull-flow.md`
- `hermes/06-security-ops-install.md`
- `hermes/decisions-log.md` — log brainstorming 2026-06-02 (toutes les décisions A/B/C/D et leurs justifications)
- `hermes/install-checklist.md` — checklist actionnable J1-J2
- `hermes/research-findings.md` — synthèse 18+ sources (Karpathy, Meunier, Tiago Forte critiques, AI brain fry, LinkedIn 2026 algo, etc.)
