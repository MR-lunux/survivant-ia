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

- source: content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md
  ingested_at: 2026-06-03T15:42:00Z
  ingest_skill_version: 1.0.0
  notes:
    - wiki/concepts/offloading-cognitif-mecanisme-humain-economie-cognitive.md
    - wiki/claims/atrophie-cognitive-par-sur-delégation-ia.md
    - wiki/concepts/transfert-de-tache-mentale.md
    - wiki/claims/capacite-a-resoudre-problemes-sans-ia-diminue.md
    - wiki/examples/trois-symptomes-dependance-ia.md
