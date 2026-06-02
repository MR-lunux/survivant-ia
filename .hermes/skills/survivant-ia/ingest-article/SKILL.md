---
name: ingest-article
description: Ingère un article pilier Survivant-IA et le décompose en ≤5 atomic notes interlinkées dans le wiki Karpathy. Citation verbatim obligatoire.
version: 1.0.0
metadata:
  hermes:
    category: survivant-ia
    tags: [survivant-ia, content-pipeline, karpathy-wiki, ingest]
---

# Ingest article — Survivant-IA second brain

## When to Use

Utiliser cette skill quand Mathieu :
- Demande explicitement "ingère l'article X" ou "ajoute l'article Y au wiki"
- Vient de publier un nouvel article dans `content/rapports/` avec `status: published` ET `maintainer: human`
- Veut bootstrapper le wiki à partir des articles piliers existants

Ne PAS utiliser si :
- L'article est encore en draft (`status: draft`)
- L'article a `maintainer: hermes` (autorégénéré, pas une source canonique)
- L'article a déjà été ingéré (présent dans `wiki/_provenance.md`) — demander confirmation Mathieu via Telegram avant re-ingest

## Procedure

1. **Lire l'article** : `content/rapports/<slug>.md` + parser frontmatter YAML.
2. **Valider** : `status == published` ET `maintainer == human`. Sinon refuser.
3. **Check existing** : grep `wiki/_provenance.md` pour vérifier que l'article n'a pas déjà été ingéré. Si oui, ping Mathieu pour confirmation.
4. **Reasoning** : identifier **au maximum 5** idées atomiques transportables hors contexte. Pour chaque, déterminer le type :
   - `concept` : un concept réutilisable (ex : "L'IA n'évacue pas l'expertise, elle l'externalise")
   - `claim` : une prise de position
   - `example` : une anecdote / cas concret mémorisable
5. **Pour chaque atomic note** :
   - Titre = phrase complète qui exprime l'idée (pas un mot-clé)
   - Slug : kebab-case dérivé du titre
   - Body ≤ 1 écran (méthode Meunier)
   - **Section "Source brute" obligatoire** avec citation verbatim depuis l'article
   - Wikilinks `[[autre-note]]` uniquement vers des notes existantes OU créées dans CE batch
   - Frontmatter complet (cf. format ci-dessous)
6. **Écrire** dans `wiki/concepts/<slug>.md` / `wiki/claims/<slug>.md` / `wiki/examples/<slug>.md`.
7. **Update `wiki/_provenance.md`** : ajouter entrée avec source + ISO timestamp + liste des notes créées.
8. **Update `wiki/_index.md`** : ajouter les nouvelles notes dans la section appropriée.
9. **MOC check** : si la note s'inscrit dans une MOC existante (`wiki/_moc/*.md`), proposer le lien. Sinon, proposer à Mathieu via Telegram "nouvelle MOC suggérée : <question> ?"
10. **Commit** sur branche `hermes/auto` (jamais `main` directement) :
    ```
    git checkout -b hermes/auto 2>/dev/null || git checkout hermes/auto
    git add wiki/
    git commit -m "ingest(wiki): <slug> → N atomic notes"
    git push origin hermes/auto
    ```
11. **Ping Telegram** récap : "Article X ingéré → N notes : [titres]. Wiki maintenant à M notes. Coût : 0.0X CHF."

## Format atomic note

```yaml
---
type: concept              # concept | claim | example
title: "Phrase complète qui exprime l'idée"
slug: kebab-case-slug
maintainer: hermes
provenance:
  - source: content/rapports/<slug>.md
    extracted_at: <ISO timestamp>
linked_concepts: []
linked_claims: []
linked_examples: []
confidence: 0.X
quarantined: false
---

Définition courte (1-2 lignes max).

## Contexte

Body ≤ 1 écran (méthode Meunier).

## Cross-references

- Lié à [[autre-note]] parce que…
- Contraste avec [[autre-note-2]] sur le point…

## Source brute

> Citation verbatim depuis l'article (obligatoire, anti-hallucination).
```

## Pitfalls

- **Inventer une wikilink** vers une note qui n'existe pas → JAMAIS. Si la note référencée n'existe pas dans le wiki ni dans le batch courant, ne pas créer le wikilink.
- **Dépasser 5 notes** même si l'article est dense. Choisir les plus utiles pour produire du contenu dérivé, pas les plus complètes.
- **Citation source manquante** → ne pas écrire la note. Si impossible de citer verbatim, abandonner cette atomic note.
- **Toucher un fichier `maintainer: human`** → interdit absolu.
- **Commit sur main directement** → toujours `hermes/auto`.

## Verification

- ≤ 5 fichiers `.md` créés dans `wiki/{concepts,claims,examples}/`
- Chaque fichier a une section "Source brute" avec citation verbatim présente dans l'article source
- `wiki/_provenance.md` mis à jour avec entrée pour cet article
- Commit visible sur branche `hermes/auto` (pas main)
- Ping Telegram récap envoyé
- Mathieu valide spot-check sur 1 note au hasard (titre, citation, wikilinks cohérents)
