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

1. **Lire l'article** : `content/rapports/<slug>.md` + parser frontmatter YAML. **JAMAIS modifier ce fichier**, même en lecture.
2. **Valider strictement** : `status == published` ET `maintainer == human` dans le frontmatter. Si une de ces clés est ABSENTE ou différente :
   - **NE PAS modifier l'article pour "corriger"** — c'est une violation absolue de hard rule #2 (interdit de toucher un fichier `maintainer: human`).
   - **REFUSER l'ingest** et retourner ce message exact à l'invocateur : *"Article `<slug>` non éligible : frontmatter doit contenir `status: published` ET `maintainer: human`. Demander à Mathieu de mettre à jour le frontmatter, puis relancer."*
   - **NE RIEN ÉCRIRE dans `wiki/`** pour cet article.
   - Arrêter la procédure ici.
3. **Check existing** : grep `wiki/_provenance.md` pour vérifier que l'article n'a pas déjà été ingéré. Si oui, ping Mathieu pour confirmation.
4. **Reasoning** : identifier **au maximum 5** idées atomiques transportables hors contexte. Pour chaque, déterminer le type :
   - `concept` : un concept réutilisable (ex : "L'IA n'évacue pas l'expertise, elle l'externalise")
   - `claim` : une prise de position
   - `example` : une anecdote / cas concret mémorisable
5. **Pour chaque atomic note candidate, EN AMONT de l'écriture du fichier** :
   - **5a. Trouver la citation verbatim** depuis l'article qui soutient l'idée. Si tu ne peux PAS produire une citation verbatim non-modifiée de l'article (mot à mot, ponctuation incluse) qui soutient le claim → **ABANDONNE cette atomic note et N'ÉCRIS RIEN**. Reprends ta sélection avec une autre idée. Cette règle est NON-NÉGOCIABLE.
   - 5b. Titre = phrase complète qui exprime l'idée (pas un mot-clé).
   - 5c. Slug : kebab-case dérivé du titre, ASCII uniquement (pas d'accents — `delegation` pas `délégation`).
   - 5d. Body ≤ 1 écran (méthode Meunier).
   - 5e. Section "Source brute" remplie avec la citation verbatim de 5a.
   - 5f. Wikilinks `[[autre-note]]` uniquement vers des notes EXISTANTES sur disque OU créées dans CE batch d'ingest. AVANT d'ajouter chaque wikilink, vérifier `ls wiki/{concepts,claims,examples}/<slug>.md`. Si la note référencée n'existe pas et ne sera pas créée dans le batch, NE PAS ajouter le wikilink.
   - 5g. Frontmatter complet (cf. format ci-dessous).
6. **Écrire le fichier** dans `wiki/concepts/<slug>.md` / `wiki/claims/<slug>.md` / `wiki/examples/<slug>.md`. Si une étape 5a a abandonné une note, écris seulement les notes qui ont passé.
7. **Update `wiki/_provenance.md`** :
   - 7a. Lire le fichier existant.
   - 7b. Si la mention `*(vide — bootstrap pending ...)*` ou similaire est présente, la SUPPRIMER avant d'ajouter ta nouvelle entrée.
   - 7c. Ajouter sous la section `## Entrées` une nouvelle entrée YAML avec source + ISO timestamp + ingest_skill_version: 1.0.0 + liste EXACTE des fichiers `notes` écrits à l'étape 6 (pas de fichier inventé).
8. **Update `wiki/_index.md`** :
   - 8a. Lire le fichier existant.
   - 8b. Mettre à jour la ligne `last_updated:` avec ISO timestamp.
   - 8c. Ajouter sous `## Concepts`, `## Claims`, `## Examples` des wikilinks `[[<slug>]]` UNIQUEMENT vers les fichiers que tu viens d'écrire (vérifier avec `ls wiki/{concepts,claims,examples}/`). N'INVENTE PAS de wikilinks vers des notes que tu n'as pas écrites. Si tu hésites → lance `find wiki -name "*.md"` et compare à ta liste.
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

- **Modifier un fichier `maintainer: human`** → INTERDIT ABSOLU. Ça inclut l'article source `content/rapports/<slug>.md`. Si le frontmatter ne valide pas (étape 2), tu REFUSES, tu n'écris pas, tu n'altères pas. Ce piège est documenté : Hermes a déjà ajouté `status: published` à un article en juin 2026 — violation grave, on ne recommence pas.
- **Slug avec caractères non-ASCII** (`délégation`, `itératif`, `école`...) → REFUSER d'écrire le fichier. Translittérer en ASCII : `delegation`, `iteratif`, `ecole`. Ce piège est documenté : on a eu `dialogue-itératif-...` qui passait sur Linux mais cassait Obsidian sync iCloud sur macOS.
- **Section "Source brute" vide** → HARD FAIL. Si tu ne peux pas produire une citation verbatim de l'article, tu DOIS abandonner la note (étape 5a). Une note avec "Source brute" vide ou inventée viole le contrat anti-hallucination de la skill.
- **Inventer une wikilink** vers une note qui n'existe pas → JAMAIS. Vérifier avec `ls`/`find` avant d'écrire chaque wikilink.
- **Over-lister dans `_index.md`** → JAMAIS de wikilinks vers des notes que tu n'as pas écrites dans ce batch. Ce piège est documenté : on a déjà eu 12 entrées listées pour 5 fichiers réels en juin 2026. Comparer ta liste à `find wiki -name "*.md"` avant de committer.
- **Dépasser 5 notes** même si l'article est dense. Choisir les plus utiles pour produire du contenu dérivé, pas les plus complètes.
- **Laisser des artefacts** dans `_provenance.md` (mention "*(vide)*", `bootstrap pending`, etc.) après ton ingest → les supprimer.
- **Slug avec accents/cédilles** : les filesystems gèrent mal — utiliser kebab-case ASCII (`delegation`, pas `délégation`).
- **Toucher un fichier `maintainer: human`** → interdit absolu.
- **Commit sur main directement** → toujours `hermes/auto`.

## Verification

Avant de committer, **lance ces vérifications** :

1. **Files written = files listed** : 
   ```
   find wiki/{concepts,claims,examples} -name "*.md" -newer /tmp/ingest-start
   ```
   Le nombre de fichiers doit matcher ce que tu vas écrire dans `_provenance.md` et `_index.md`.

2. **Pas de Source brute vide** :
   ```
   for f in wiki/{concepts,claims,examples}/*.md; do
     if ! sed -n '/^## Source brute/,/^$/p' "$f" | grep -q '^>'; then
       echo "EMPTY SOURCE BRUTE: $f"
     fi
   done
   ```
   Output attendu : VIDE. Si une note est listée → la supprimer avant commit.

3. **Pas de wikilink mort** dans `_index.md` :
   ```
   grep -o '\[\[[^]]*\]\]' wiki/_index.md | sort -u | while read link; do
     slug="${link//[\[\]]/}"
     if ! find wiki -name "${slug}.md" | grep -q .; then
       echo "BROKEN LINK: $link"
     fi
   done
   ```
   Output attendu : VIDE.

4. **Pas d'artefact "(vide)"** dans `_provenance.md` :
   ```
   grep -i "vide\|bootstrap pending" wiki/_provenance.md
   ```
   Output attendu : VIDE.

Si toutes les vérifications passent → commit + push. Sinon → corriger.

Final check côté Mathieu :
- ≤ 5 fichiers `.md` créés dans `wiki/{concepts,claims,examples}/`
- Chaque fichier a une section "Source brute" avec citation verbatim présente dans l'article source
- `wiki/_provenance.md` mis à jour avec entrée propre pour cet article (pas d'artefact)
- `wiki/_index.md` ne liste QUE les notes effectivement écrites
- Commit visible sur branche `hermes/auto` (pas main)
- Ping Telegram récap envoyé
