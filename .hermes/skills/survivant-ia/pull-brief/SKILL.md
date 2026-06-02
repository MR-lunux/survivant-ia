---
name: pull-brief
description: Brief matinal Survivant-IA. Collecte signaux RSS + PostHog + Git + Brevo + Google, filtre par fit voix, livre top 3 sujets sur Telegram à 6h30 Geneva (lundi-samedi).
version: 1.0.0
metadata:
  hermes:
    category: survivant-ia
    tags: [survivant-ia, content-pipeline, pull, signals, cron]
---

# Pull brief — signaux → brief matinal

## When to Use

Cron **6h30 Geneva, lundi-samedi** (dimanche silence anti-burnout). Peut aussi être invoqué à la demande ("donne-moi le brief de ce matin").

NE PAS automatiquement drafter. Le brief propose, Mathieu valide avec 👍 puis `draft-from-idea` prend le relais.

## Procedure

### Étape 1 — Collect (parallèle)

Récupérer depuis les sources configurées (cf. `.hermes/config/rss-sources.yaml` une fois créé) :

**Couche A — Presse tech anglo (9 RSS gratuits)** :
- MIT Technology Review (AI)
- The Verge (AI)
- Ars Technica (AI tag)
- TechCrunch (AI)
- Financial Times Tech (AI)
- The Guardian Tech (UK)
- 404 Media
- Hacker News (front + AI tag)
- ArXiv cs.AI / cs.CL

**Couche C — Signaux internes** (activés progressivement, démarrer avec RSS only) :
- PostHog anomalies (project 169545) — DIFFÉRÉ J15+
- Git activity sur `content/outils/` — DIFFÉRÉ J15+
- Brevo subscribers trend — DIFFÉRÉ J15+

**Couche D — Mentions** :
- Google Alerts (3 feeds : "Survivant-IA", "survivant-ia.ch", "Mathieu Rerat IA") — DIFFÉRÉ J15+
- Google News RSS pour 10 keywords FR — DIFFÉRÉ J15+

Au démarrage MVP : Couche A seulement (9 RSS).

Normaliser chaque item en `{title, source, url, body, timestamp}`, dédupliquer par URL.

Volume cible : ~50-80 items bruts/jour.

### Étape 2 — Classify (Nemotron-Nano, ultra cheap)

Pour chaque item, demander à Nemotron :
- Est-ce dans le périmètre Survivant-IA (IA + travail + souveraineté + métiers) ?
- Score pertinence 0-10
- Cluster 2 action prioritaire (pas peur)

Coupe : top 30.

### Étape 3 — Embed + RAG match

Pour chaque item du top 30 :
- Embed titre + 200 premiers mots (Qwen3-Embedding-8B)
- Match vs wiki existant → score `fit_voix`
- Match vs 10 derniers posts publiés → score `redite_risk`

Coupe : top 10 avec `fit_voix ≥ 0.6` ET `redite_risk ≤ 0.6`.

### Étape 4 — Rank final

```
score = 0.4 * fit_voix + 0.3 * pertinence + 0.2 * freshness + 0.1 * engagement_signal
```

Coupe : top 3 (cap dur).

### Étape 5 — Generate brief (Mistral-Small-4)

Pour chaque sujet du top 3, écrire :
- 1 phrase de quoi ça parle
- Source + lien
- Angle Survivant-IA suggéré (1 phrase, voix correcte, pré-mâchée, cluster action)
- Tag pilier potentiel : `[outil-concret]` | `[soft-skill]` | `[décryptage]`
- Estimation coût/temps si Mathieu pushe le draft

### Étape 6 — Deliver Telegram (6h30 Geneva)

```
📡 FRÉQUENCE — Brief du <jour>

3 signaux qui valent un coup d'œil :

[1] <Titre court>
    Source : <name> · Fit voix X.XX · Redite X.XX
    Angle : "<suggestion pré-mâchée>"
    Tag : [outil-concret|soft-skill|décryptage]
    [👍 drafter L+T] · [📁 garder] · [🗑️ ignorer]

[2] ...
[3] ...

Coût brief ce matin : 0.0XX CHF
[😴 Skip today, brief frais demain]
```

### Étape 7 — Handle actions Mathieu

- **👍** : déclencher `draft-from-idea` avec l'angle suggéré comme intention. Validation V1 standard suit.
- **📁** : sauver l'item dans `docs/marketing/trends/saved-YYYY-MM-DD.md` pour réutilisation ultérieure.
- **🗑️** : log "rejet" pour tracker ignore_rate. Pas de contenu sauvegardé.
- **😴** : skip today, demain reçoit signaux frais (pas accumulés).

### Étape 8 — Métriques pour lint hebdo

Log dans `~/.hermes/metrics/pull.jsonl` :
```json
{
  "date": "2026-06-02",
  "brief_sent": 3,
  "actions": {"validated": 1, "saved": 1, "ignored": 1, "skip_day": 0},
  "cost_chf": 0.018,
  "per_source_kept": {"MIT TR": 1, "TechCrunch": 1, "ArXiv": 1, "...": 0}
}
```

## Pitfalls

- **Cap 3 sujets** : ne JAMAIS livrer 4 ou 5 même si tu en as identifié plus. Cap dur (recherche AI brain fry).
- **Brief dimanche** : skip total. Le dimanche, Mathieu doit pouvoir respirer.
- **Auto-draft sans 👍** : interdit. Le brief propose, Mathieu décide.
- **Sources biaisées** : si une source domine systématiquement (ex : 3/3 sujets TechCrunch sur 7j), c'est un signal de bias. Le lint hebdo s'en occupe.
- **Ignore_rate > 75% sur 14j** : exit criteria signalé par lint-wiki. Hermes propose de pauser Pull 2 semaines.

## Verification

- Telegram message envoyé à 6h30 Geneva (sauf dimanche)
- Exactement 3 sujets dans le brief
- Chaque sujet a : titre, source, fit_voix, redite_risk, angle pré-mâché, tag pilier, actions
- Coût total visible dans le message
- Métriques loggées dans `~/.hermes/metrics/pull.jsonl`
