# SEO clusters map — Survivant-IA

Référence pour la décision « à quel cluster rattacher cet article ? » lors de l'étape 2 du workflow brief inversé (voir charte éditoriale articles).

État au 2026-05-07. Map évolutive : enrichie à chaque article qui ouvre un nouveau territoire.

---

## Cluster 2 — Action (colonne vertébrale)

**Statut** : prioritaire — colonne vertébrale SEO du site (mémoire `project_survivant_ia_seo_positioning`).

**Requêtes types** :
- comment ne pas se faire remplacer par l'IA
- se former à l'IA *(sans utiliser « formation » comme nom commun dans la copy — mémoire business model)*
- prendre le virage de l'IA
- quelles compétences développer pour résister à l'IA
- comment piloter l'IA dans son métier
- comment maîtriser l'IA au travail

**Articles qui servent ce cluster** :
- [L'IA ne supprime pas des postes : elle supprime l'inefficience](/rapports/2026-05-08-ia-supprime-inefficience) — 2026-05-08

---

## Cluster Autonomie cognitive

**Statut** : ouvert le 2026-05-07 par le premier article publié.

**Requêtes types** :
- offloading cognitif IA
- démence numérique IA
- atrophie cognitive IA
- pilotage cognitif face à l'IA
- comment ne pas devenir un simple valideur
- éviter la dépendance à l'IA au travail
- l'IA atrophie le cerveau

**Articles qui servent ce cluster** :
- [Démence numérique : ne deviens pas un simple valideur](/rapports/2026-05-07-demence-numerique-simple-valideur) — 2026-05-07

---

## Clusters défensifs (pages dédiées, pré-pivot SEO-aware)

**Statut** : conservés volontairement avec le mot-clé défensif dans `<title>` / `og:title` pour le SEO de surface, mais avec descriptions pivotées (mémoire pivot 2026-05-04, addendum §10.2.2).

| Page | Mot-clé défensif préservé | Pivot appliqué |
|---|---|---|
| `/scanner` | « mon métier menacé par l'IA » | description, ogDescription, twitterDescription, JSON-LD |
| FAQ home | Q1, Q4, Q6, Q7 préservées (mots-clés défensifs en question) | réponses pivotées vers piloter / maîtriser |

---

## Méthode pour ajouter un cluster

À chaque article qui ouvre un territoire que les clusters existants ne couvrent pas :

1. Ajouter une section `## Cluster <nom>` dans ce fichier
2. Lister 3 à 5 requêtes types
3. Pointer l'article qui ouvre le cluster (date + lien interne)
4. Si le cluster devient récurrent (≥ 2 articles), envisager une catégorie dédiée dans `content/rapports/` (impacterait `app/utils/categoryLabels.ts` et `app/components/RapportsBookshelf.vue` — voir spec charte éditoriale articles §16)

---

## Mises à jour du document

| Date | Action |
|---|---|
| 2026-05-07 | Création — cluster 2 + cluster Autonomie cognitive ouvert par l'article démence numérique |
| 2026-05-08 | Cluster 2 — premier article servant la colonne vertébrale ("L'IA ne supprime pas des postes : elle supprime l'inefficience") |
