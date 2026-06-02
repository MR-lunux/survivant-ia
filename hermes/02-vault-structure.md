# 02 — Structure du vault & conventions

Le vault Obsidian **= le repo Git survivor** lui-même. Obsidian sur le Mac est juste une UI confort (graph view, wikilinks). Hermes lit/écrit les `.md` directement sans Obsidian.

## Arborescence cible

```
survivor/
├── content/                         EXISTE — raw sources, immuables côté Hermes
│   ├── rapports/                    articles piliers (3 aujourd'hui)
│   └── outils/                      descriptions outils (4 aujourd'hui)
│
├── wiki/                            NOUVEAU — atomic notes générées par Hermes
│   ├── concepts/                    1 fichier par concept atomique
│   ├── claims/                      1 fichier par claim / prise de position
│   ├── examples/                    1 fichier par anecdote / cas concret
│   ├── _moc/                        Maps of Content par grandes questions
│   ├── _index.md                    carte du wiki, maintenue par Hermes
│   └── _provenance.md               qui vient d'où
│
├── docs/
│   ├── charte-voix.md               EXISTE — prompt système maître Hermes
│   ├── voice-fingerprint.md         NOUVEAU — auto-maintenu par Hermes
│   ├── linkedin/
│   │   ├── corpus/                  EXISTE (vide) — corpus voix, lecture seule
│   │   ├── published/               EXISTE — 3 posts (2 .md + 1 carousel only)
│   │   └── drafts/                  NOUVEAU — Hermes écrit ici
│   ├── marketing/scripts-tiktok/
│   │   ├── published/               à créer (migrer l'existant)
│   │   └── drafts/                  NOUVEAU
│   └── newsletter/                  NOUVEAU (créé mais skill désactivé MVP)
│       ├── published/
│       └── drafts/
│
├── .hermes/                         NOUVEAU
│   ├── SKILL.md                     schema Karpathy (chargé en premier)
│   ├── skills/
│   │   ├── ingest-article.md
│   │   ├── query-wiki.md
│   │   ├── lint-wiki.md
│   │   ├── draft-from-idea.md       (englobe LinkedIn / carousel / TikTok)
│   │   ├── pull-brief.md
│   │   └── daily-budget-check.md
│   ├── prompts/
│   │   ├── voice-survivant-ia.md    intègre charte + patterns observés
│   │   └── editorial-charte.md      reprend `docs/superpowers/specs/.../charte-editoriale-articles-design.md`
│   ├── hermes-models.yaml           routing modèles versionné
│   └── runtime/                     IGNORED par git, state session
│
└── .hermesignore                    NOUVEAU
```

## `.hermesignore`

Sécurité : Hermes ne voit que ce qui le concerne.

```
# Code applicatif
app/
server/
video/src/
node_modules/
.nuxt/
.output/

# Secrets, env, builds
.env*
*.log
**/dist/
**/build/

# Mémoire interne Hermes
.hermes/runtime/
```

## Frontmatter conventions

### Article pilier (`content/rapports/*.md`)

```yaml
---
title: "Comment ne pas se faire remplacer par l'IA"
slug: ne-pas-se-faire-remplacer
type: pilier
date: 2026-05-21
maintainer: human          # Hermes ne touche jamais
status: published          # draft | published | archived
audience: professionnels
cluster: action            # action (cluster 2) | peur (cluster 1)
voice: survivant-ia-v2
linked_outils: [ameliorer-son-prompt]
tags: [prompt, productivité, salarié]
---
```

### Atomic note (`wiki/concepts|claims|examples/*.md`)

```yaml
---
type: concept              # concept | claim | example
title: "L'IA n'évacue pas l'expertise, elle l'externalise"
slug: ia-externalise-expertise
maintainer: hermes         # Mathieu peut éditer ; Hermes peut re-générer
provenance:
  - source: content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md
    extracted_at: 2026-06-02T10:30:00Z
linked_concepts: [pertinence-professionnelle, autonomie-pensee]
linked_claims: []
linked_examples: [comptable-validation-dictee]
confidence: 0.92
quarantined: false         # devient true si audit hebdo FAIL
---

Définition courte (1-2 lignes).

## Contexte

Body 1-écran max (Meunier).

## Cross-references

- Lié à [[pertinence-professionnelle]] parce que…
- Contraste avec [[autonomie-pensee]] sur…

## Source brute

> Citation verbatim depuis l'article (obligatoire, anti-hallucination).
```

### Draft généré (`docs/<channel>/drafts/*.md`)

```yaml
---
type: draft-linkedin       # ou draft-tiktok / draft-newsletter
generated_at: 2026-06-02T11:00:00Z
maintainer: shared
source_idea: "le BPMN générateur que j'ai lancé hier"
source_channel: telegram   # telegram | webui | pull-brief
source_type: tool-launch   # article | tool-launch | freeform
queried_wiki:
  - wiki/concepts/processus-metier.md
  - wiki/examples/bpmn-comptables.md
queried_published:
  - docs/linkedin/published/2026-05-21-comment-ecrire-prompt/post.md
model_used: mistralai/Mistral-Small-4-119B-2603
tokens: {input: 4521, output: 312, cost_chf: 0.018}
status: awaiting_validation
voice_check: pass          # ou fail avec détail
---

[Le post LinkedIn, prêt à copier-coller]
```

## Frontmatter d'intentionnalité (pattern observé chez Mathieu)

Reprend la structure existante de ses posts publiés (`cluster`, `archetype`, `format`, `cta`, `mode_redac`, `target_chars`). Hermes génère AVEC ce frontmatter — pas juste de la metadata, c'est un outil de réflexion sur l'intention avant écriture.

## Conventions de boundary Hermes ↔ Mathieu

- `maintainer: human` → Hermes ne touche JAMAIS, même pour corriger une typo
- `maintainer: hermes` → Hermes peut re-générer librement, Mathieu peut éditer (sera potentiellement réécrasé)
- `maintainer: shared` → collab, Hermes ne re-génère que sur demande explicite
- `locked_until: <timestamp>` (optionnel sur shared) → Mathieu signale qu'il édite, Hermes patiente
- Conflits Git rares en pratique car écritures dans sous-dossiers différents

## Bootstrap au premier lancement (≤5 atomic notes / article)

1. Ingest des 3 articles piliers existants :
   - `offloading-cognitif-quand-l-ia-pense-a-ta-place.md`
   - `2026-05-08-ia-supprime-inefficience.md`
   - `2026-05-21-comment-ecrire-prompt-ameliore-reponses.md`
2. Résultat attendu : ~10-15 atomic notes au démarrage, déjà cross-référencées
3. Coût bootstrap : ~1-3 CHF total (Mistral-Small-4, ~500K tokens estimés)
4. Init `docs/voice-fingerprint.md` à partir charte + posts publiés + welcome email newsletter + 3 articles piliers
5. (Optionnel à confirmer) backfill `post.md` du carousel BPMN 2026-05-30

## Conventions Obsidian côté Mathieu

Plugins **strict** :
- **Git** (officiel community) — Auto-pull 5 min, Auto-commit au save
- **Templater** — templates atomic / idée brute / brouillon article
- **Smart Connections** — UNIQUEMENT quand wiki > 50 notes (aujourd'hui 0)

STOP. Tout autre plugin doit "earn its keep" (justifier une douleur réelle).

Workspace recommandé : graph view filtré sur `wiki/` pour voir le second cerveau se densifier.
