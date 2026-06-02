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

*(vide — bootstrap pending Phase 4 du plan)*
