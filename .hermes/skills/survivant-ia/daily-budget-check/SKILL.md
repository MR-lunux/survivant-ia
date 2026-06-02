---
name: daily-budget-check
description: Check budget LLM quotidien. Cron 21h Geneva. Alerte Telegram si seuil dépassé. Premier skill cron de test.
version: 1.0.0
metadata:
  hermes:
    category: survivant-ia
    tags: [survivant-ia, content-pipeline, monitoring, cron, budget]
---

# Daily budget check — alerte coût LLM

## When to Use

Cron quotidien **21h Geneva**. Premier skill cron de test du pipeline Telegram. Peut aussi être invoquée manuellement par Mathieu ("combien j'ai dépensé aujourd'hui ?").

## Procedure

### Étape 1 — Récupérer la dépense du jour

Appeler l'API Hermes interne pour récupérer les usage stats du jour courant :
- Total tokens (in/out)
- Coût estimé CHF
- Sessions count
- Per-model breakdown

Endpoint typique : `/api/usage/today` ou via le hermes CLI `hermes usage today --format json`.

### Étape 2 — Comparer aux seuils

Seuils configurés :
- **Daily soft** : 1 CHF/jour → notif amicale ("ok, RAS")
- **Daily hard** : 3 CHF/jour → alerte sérieuse
- **Monthly running** :
  - Projection mois > 30 CHF (seuil alerte) → ⚠️
  - Projection mois > 50 CHF (exit criteria) → 🚨

### Étape 3 — Construire le message

**Cas normal** (sous seuil) :
```
📊 Budget — <date>

Aujourd'hui : X.XX CHF (N sessions)
Mois courant : X.X CHF / projection N CHF
Top modèle : Mistral-Small-4 (X.XX CHF)

[Tout OK ✓]
```

**Cas seuil alerte** :
```
⚠️ Budget — <date> — SEUIL ALERTE

Aujourd'hui : X.XX CHF (N sessions) [au-dessus de 3 CHF/jour]
Mois courant : X.X CHF / projection N CHF (> seuil 30)
Top dépense : <session> sur <skill> (X.XX CHF)

Reco : passer creative_writing sur Nemotron temporairement, ou pauser Pull.

[Voir détails Web UI via SSH tunnel]
```

**Cas exit criteria** :
```
🚨 Budget — <date> — EXIT CRITERIA TOUCHÉ

Projection mois : N CHF > 50 (exit criteria du SKILL.md racine).

Conformément à hard rule #7, je m'arrête.
Décision Mathieu requise :
- Augmenter le cap (modif SKILL.md)
- Investiguer les sessions chères
- Passer en RAG simple (abandon Karpathy wiki)

Plus aucun appel LLM jusqu'à ta décision.
```

### Étape 4 — Envoyer Telegram + logger

- Envoyer à `TELEGRAM_HOME_CHANNEL` (= Mathieu).
- Log dans `~/.hermes/logs/budget-check.jsonl` :
```json
{
  "date": "2026-06-02",
  "daily_chf": 0.42,
  "month_so_far_chf": 8.3,
  "month_projection_chf": 28,
  "alert_level": "ok|warning|critical",
  "top_model": "mistralai/Mistral-Small-4-119B-2603",
  "top_model_chf": 0.31
}
```

### Étape 5 — Si exit criteria atteint, kill switch

Si `month_projection > 50 CHF` :
- Mettre `~/.hermes/state/halt_reason: "budget exit criteria"` (fichier flag)
- Les autres skills doivent vérifier ce flag avant tout appel LLM
- Hermes ne reprend qu'après suppression manuelle du flag par Mathieu

## Pitfalls

- **Spam quotidien** : envoyer message **TOUS LES JOURS** même si tout va bien. Mathieu doit prendre l'habitude de voir le récap. Sans ça, il oublie le système.
- **Sous-estimer le coût** : utiliser le coût réel facturé Infomaniak, pas une projection basée sur prix tier.
- **Alerter sans action concrète** : toujours inclure 1 reco actionnable.
- **Killswitch trop brutal** : avant exit criteria, plusieurs warnings progressifs (30 / 40 / 50).

## Verification

- Message envoyé à 21h Geneva chaque jour (vérifier dans logs gateway)
- Cohérence : daily_chf de la veille apparaît bien le lendemain dans Web UI usage stats
- Fichier `~/.hermes/logs/budget-check.jsonl` a une nouvelle ligne par jour
- Si seuil dépassé, le bon niveau d'alerte est envoyé (warning vs critical)
