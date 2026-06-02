---
name: lint-wiki
description: Lint hebdomadaire du wiki Karpathy. Santé technique + audit hallucinations cross-model + check exit criteria. Vendredi 17h Geneva.
version: 1.0.0
metadata:
  hermes:
    category: survivant-ia
    tags: [survivant-ia, content-pipeline, karpathy-wiki, maintenance, cron]
---

# Lint wiki — santé hebdo + audit anti-graveyard

## When to Use

Cron hebdomadaire **vendredi 17h Geneva** (ritual "fin de semaine, je referme le second cerveau"). Peut aussi être invoquée manuellement par Mathieu pour un check ponctuel.

## Procedure

### Part A — Maintenance technique

1. **Scan orphelins** : lister les notes `wiki/concepts|claims|examples/*.md` qui n'ont AUCUN wikilink entrant ET aucun sortant. Suggestion : merger ou ajouter à une MOC.
2. **Détecter redondances** : embedder titres + 1ère phrase de chaque note. Si similarité > 0.92 entre 2 notes → flag pour merge.
3. **Détecter notes vides** : body < 200 chars → flag.
4. **Détecter liens cassés** : pour chaque wikilink dans une note, vérifier que la cible existe.
5. **Drift MOC** : si une MOC (`wiki/_moc/*.md`) référence > 15 notes → suggérer split en 2 MOC plus thématiques.

### Part B — Hallucination audit (cross-model, critique)

6. **Sampler 3 atomic notes au hasard** (uniform sampling sur tout `wiki/`).
7. **Pour chaque note** :
   - Charger la note + sa Source Brute citée
   - Charger l'article pilier de provenance (cf. `wiki/_provenance.md`)
   - Faire un appel à `auxiliary.compression` (Mistral-Small-4, **modèle DIFFÉRENT du Qwen utilisé pour l'ingest**) :
     ```
     Cette note dit : "<claim de la note>"
     Citation source : "<verbatim Source Brute>"
     Article complet : <full text>
     
     L'article contient-il la matière pour soutenir le claim ?
     Réponds STRICTEMENT par PASS, FAIL ou DOUBT, puis 1 phrase de justification.
     ```
   - Si **FAIL** ou **DOUBT** → ajouter `quarantined: true` au frontmatter de la note (exclue du `query-wiki`) et ping Mathieu : "⚠️ Note `<slug>` quarantined (audit hebdo). Spot-check requis."

### Part C — Exit criteria check (discipline anti-graveyard)

8. **Calculer** :
   - `maintenance_time_estimate` : approx du temps wiki ce semaine (basé sur # commits, # quarantines, # merges)
   - `contamination_rate` : `(FAIL + DOUBT) / total_audits` cette semaine
   - `monthly_cost_so_far` : via API Hermes interne

9. **Si seuil dépassé** → alerte rouge Telegram :
   - `maintenance > 1h/semaine` → "⚠️ Wiki maintenance trop chère. Considérer simplification."
   - `contamination_rate > 0.5 sur 4 semaines` → "⚠️ Wiki contamination critique. Fallback RAG simple recommandé."
   - `monthly_cost > 30 CHF` → "⚠️ Budget alerte (seuil 30/50 CHF/mois)."
   - `monthly_cost > 50 CHF` → "🚨 EXIT CRITERIA TOUCHÉ. Hermes s'arrête."

### Part D — Rapport hebdo Telegram

10. Envoyer un récap concis à Mathieu :
    ```
    🧹 Lint wiki — vendredi <date>
    
    Santé technique :
    • N notes (X concepts, Y claims, Z examples)
    • N orphelins (action: aucune ou MOC à créer)
    • N redondances mergées
    • 0 liens cassés
    
    Hallucination audit (3 random) :
    • PASS : N
    • DOUBT : N → note <slug> quarantined
    • FAIL : N
    
    Exit criteria :
    • maintenance : X.Xh cette sem ✓
    • contamination : X.XX
    • monthly_cost : X.X / 30 CHF (seuil 50)
    
    Ignore_rate Pull : XX% (cap 75%)
    ```

11. Commit le rapport dans `docs/superpowers/posthog-reports/2026-XX-XX-lint-wiki.md` (ou ailleurs selon convention).

## Pitfalls

- **Auditer avec le même modèle qui a ingéré** : INTERDIT. Cross-model obligatoire (Mistral audite Qwen, sinon inutile — recherche Proudfrog LLM Wiki criticism).
- **Quarantine sans alerter Mathieu** : toujours notifier.
- **Modifier les notes pour "corriger" l'hallucination** : tu ne corriges pas, tu quarantines. La correction est manuelle.
- **Ignorer exit criteria** : si seuil atteint, tu DOIS alerter même si "ça va aller".
- **Spammer Mathieu** : 1 message Telegram synthétique, pas 10 séparés.

## Verification

- 3 audits effectués (pas 2, pas 4)
- Modèle d'audit = `auxiliary.compression` (Mistral-Small-4), pas le modèle d'ingest
- Si FAIL/DOUBT → frontmatter `quarantined: true` ajouté au fichier
- Rapport Telegram envoyé
- Si exit criteria atteint → alerte rouge envoyée
