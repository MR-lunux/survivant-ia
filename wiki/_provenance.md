---
maintainer: hermes
type: wiki-provenance
---

# Provenance — wiki Karpathy

Traçabilité source → atomic notes. Maintenu par `ingest-article` à chaque ingest.

## Format

Une entrée YAML par article ingéré :

~~~yaml
- source: content/rapports/<slug>.md
  ingested_at: <ISO timestamp>
  ingest_skill_version: 1.0.0
  notes:
    - wiki/concepts/<slug-1>.md
    - wiki/claims/<slug-2>.md
    - wiki/examples/<slug-3>.md
~~~

## Entrées

- source: content/rapports/2026-05-08-ia-supprime-inefficience.md
  ingested_at: 2026-06-03T20:41:00Z
  ingest_skill_version: 1.0.0
  notes:
    - wiki/concepts/ia-n-est-pas-remplacement-postes-supprime-inefficience.md
    - wiki/concepts/augmentation-efficacite-personnelle-grace-ia.md
    - wiki/examples/reperer-taches-soupir-quotidiennes.md
    - wiki/examples/reste-dans-la-conversation-ia.md
    - wiki/concepts/dialogue-itératif-ia-vers-prompts-efficaces.md
