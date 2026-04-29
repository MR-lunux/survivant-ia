# Spec — Scanner d'obsolescence : upgrade data & sources modal

**Date :** 2026-04-29
**Page concernée :** `/scanner`
**Objectif :** Remplacer le schéma de données simpliste actuel (3 statuts, source en string libre) par un schéma riche aligné sur les rapports 2025-2026 (4 statuts, dynamique narrative par métier, catalogue de sources cliquable via modal).

---

## Contexte stratégique

Le scanner actuel sert deux fonctions : acquisition SEO sur des requêtes à forte intention ("mon métier va-t-il disparaître avec l'IA") et conversion vers la newsletter "La Fréquence". Trois faiblesses du schéma actuel :

1. **Statut binaire-ish** (`danger / augmente / resistant`) — ne capture pas la nuance "EN MUTATION SÉVÈRE", qui est précisément le statut qui parle au public cible (devs, journalistes, analystes qui se croient à l'abri).
2. **Pas de narratif** — le visiteur reçoit un score brut sans comprendre POURQUOI son métier est dans cet état. Coupe court à l'effet émotionnel qui pousse à l'inscription newsletter.
3. **Sources en string libre** — `"MIT 2025 / OCDE 2023"` n'est pas vérifiable, n'est pas un lien, n'est pas crédible. E-E-A-T faible.

Cette itération corrige les trois points, en s'appuyant sur l'analyse exhaustive 2026 (Tufts AI Jobs Risk Index, McKinsey, WEF, PayScope, Goldman Sachs, LinkedIn).

---

## Décisions de design (validées en brainstorming)

| Décision | Choix retenu |
|---|---|
| Périmètre data | Migration progressive (option C) : les ~40 métiers du rapport extraits tels quels + les ~80 autres enrichis manuellement dans le même schéma |
| Taxonomie statut | 4 statuts : `danger` / `mutation` / `protege` / `croissance` (option B — fusion OBSOLESCENCE→DANGER et CROISSANCE+MAX→CROISSANCE) |
| Sources | Catalogue centralisé `sources.ts` + modal hybride : sources spécifiques au métier en haut + catalogue complet groupé par catégorie en dessous |
| Voix de la `dynamic` | Apostrophe + factuel ("Tu es dans le viseur. La rédaction de contenu web est massivement automatisée par les LLM..."), max 300 caractères |
| Bouton sources | Dans la card de résultat, lien underline discret après la dynamique, avant le CTA newsletter |
| Bloc sources actuel en footer | Supprimé — le modal le remplace |

---

## Architecture des données

### `app/data/sources.ts` (nouveau fichier)

```ts
export type SourceCategory =
  | 'academique'    // Tufts, McKinsey, universités
  | 'banque'        // Goldman Sachs
  | 'plateforme'    // LinkedIn, PayScope
  | 'institution'   // WEF, OCDE
  | 'media'         // Blog du Modérateur, Visual Capitalist, BDM, etc.

export interface Source {
  id: number          // 1..N, mappé sur les notes de bas de rapport
  title: string       // ex: "American AI Jobs Risk Index"
  author: string      // ex: "Fletcher School, Tufts University"
  year: number        // ex: 2026
  url: string         // URL d'accès
  context: string     // ≤ 120 chars, ex: "Index quantifiant le risque sur 784 métiers américains"
  category: SourceCategory
}

export const SOURCES: Source[] = [
  // ~20-22 entrées finales, extraites des 27 "Works cited" du rapport
  // après dédoublonnage (plusieurs notes pointent vers la même étude Tufts/McKinsey)
]

export function findSourceById(id: number): Source | undefined
export function getSourcesByIds(ids: number[]): Source[]
export function getSourcesByCategory(): Record<SourceCategory, Source[]>
```

**Note de dédoublonnage :** le rapport cite parfois plusieurs URLs Tufts/McKinsey pour la même étude. Le catalogue dédoublonne — on vise ~20-22 sources uniques après nettoyage. Les IDs restent stables pour permettre les références depuis `jobs.ts`.

### `app/data/jobs.ts` (refonte du schéma)

```ts
export type JobStatus = 'danger' | 'mutation' | 'protege' | 'croissance'

export interface Job {
  slug: string         // identifiant URL-safe, ex: "comptable" — INCHANGÉ pour préserver SEO/partages
  label: string        // libellé FR affiché, ex: "Comptable"
  risk: number         // 0–100, score d'exposition
  horizon: number      // 2 | 5 | 10 années avant impact majeur
  status: JobStatus    // ÉDITORIAL, ne PAS dériver d'un seuil sur risk
  dynamic: string      // ≤ 300 chars, voix Survivant-IA (apostrophe + factuel)
  sources: number[]    // ids du catalogue, [] = pas de source spécifique
}
```

**Point critique : `status` n'est PAS dérivé du `risk %`.**
Exemples qui le démontrent :
- Comptable, risk 72% → `danger` (le poste se contracte)
- Développeur, risk 55% → `mutation` (le rôle se transforme, ne disparaît pas)
- Data Scientist, risk 37% → `mutation` (AutoML automatise les tâches de base, le rôle pivote vers MLOps)
- Cardiologue, risk 1% → `protege`
- Infirmier, risk 18% → `croissance` (vieillissement démographique)

Un seuil sur `risk` confondrait Comptable et Développeur. La distinction tient à la dynamique économique (contraction de la demande vs transformation du rôle) — c'est éditorial.

### Migration des données

**Étape A — Métiers présents dans le rapport (~40)**
Extraction directe : `risk` + `horizon` + `status` + `dynamic` + `sources` viennent du tableau du rapport (Sections "Création/Information/Ingénierie", "Administration/Finance/Commerce", "Sciences/Stratégie/Conformité", "Santé/Éducation/Travail Physique").

**Étape B — Métiers actuels NON présents dans le rapport (~80)**
Pour chacun :
- `risk` et `horizon` : conservés depuis l'ancien `jobs.ts`
- `status` : remappé manuellement de `augmente`/`resistant` vers `mutation`/`protege`/`croissance` selon la logique éditoriale (jamais auto)
- `dynamic` : rédigée dans le ton Survivant-IA (apostrophe + 1-2 phrases factuelles inspirées de la dynamique sectorielle du rapport)
- `sources: []` — le modal affichera le catalogue général

**Étape C — Mapping libellé FR ↔ libellé US du rapport**
Certains libellés du rapport sont US/littéraux (ex: "Spécialistes en Relations Publiques", "Architectes de Bases de Données"). Pour chaque correspondance :
- Le libellé existant FR est conservé côté visiteur (ex: "Programmeur" reste "Programmeur", pas "Développeurs Informatiques")
- Le mapping interne sert uniquement à transférer les valeurs `risk` / `dynamic` / `sources` du rapport vers le bon `slug` existant

Le mapping complet sera produit dans le plan d'implémentation et nécessite une validation éditoriale (Mathieu).

**Slugs : aucun renommage.** Tous les slugs existants sont préservés pour ne pas casser les URLs partagées (`/scanner?job=programmeur`) et le SEO.

---

## UX & visuel

### Design tokens des 4 statuts

| Statut | Couleur (suggestion) | Libellé affiché | Verdict court (proposition) |
|---|---|---|---|
| `danger` | Rouge `#FF3B3B` | `// EN DANGER` | "Ton métier est dans le viseur." |
| `mutation` | Orange `#FFA630` | `// EN MUTATION SÉVÈRE` | "Ton métier ne disparaît pas. Il devient méconnaissable." |
| `protege` | Cyan `#5BC0EB` | `// PROTÉGÉ` | "L'IA ne te remplace pas — elle a besoin de toi." |
| `croissance` | Vert `#3DDC84` | `// EN CROISSANCE` | "Tu es dans le bon wagon. Pour l'instant." |

Couleurs et copy à finaliser à l'implémentation. Le rouge `danger` actuel est conservé.

### Layout de la card de résultat

```
[ HEADER : SCAN COMPLETED · LABEL MÉTIER ]

[ BANDEAU : BADGE STATUT | RISK % | HORIZON ]

> [VERDICT COURT du statut]

┌─ DYNAMIQUE ANTICIPÉE ─────────────────┐
│ [dynamic, max 300 chars]              │
└───────────────────────────────────────┘

[→ Voir les sources de cette analyse]   ← bouton sources, underline discret

┌─ CTA NEWSLETTER (variant statut) ─────┐
│ [copy variable]                       │
│ [bouton inscription La Fréquence]     │
└───────────────────────────────────────┘

[⎘ Copier le lien] [↻ Tester un autre métier]
```

L'animation terminal de scan reste inchangée (bénéfice : on capitalise sur l'expérience signature actuelle).

### CTA newsletter par statut (proposition initiale)

| Statut | Hook |
|---|---|
| `danger` | "La newsletter qui te dit comment NE PAS te faire remplacer →" |
| `mutation` | "Apprends à muter avant que ton métier ne le fasse sans toi →" |
| `protege` | "Reste devant. La veille IA chaque semaine →" |
| `croissance` | "Capitalise sur ta position. Reçois La Fréquence →" |

À itérer avec A/B test plus tard (hors scope itération).

---

## Modal des sources

### Composant : `app/components/SourcesModal.vue` (nouveau)

**Props**
- `job: Job | null` — métier consulté ; si null, n'affiche que le catalogue complet
- `open: boolean` — état contrôlé par le parent
- emit `close`

**Structure**

```
[ ✕ Fermer ]
// SOURCES

▸ SOURCES DE TON RÉSULTAT
   (visible UNIQUEMENT si job.sources.length > 0)

   [Pour chaque id ∈ job.sources]
   ┌────────────────────────────────────────┐
   │ [id] Title                          ↗ │
   │      Author · Year                    │
   │      Context (≤ 120 chars)            │
   └────────────────────────────────────────┘

▸ TOUTES LES SOURCES DE L'ANALYSE
   (toujours visible)
   (texte intro si pas de section "résultat" ci-dessus :
    "Cette analyse repose sur les sources suivantes.")

   ── ÉTUDES ACADÉMIQUES ──
   [Source items...]

   ── BANQUES D'INVESTISSEMENT ──
   [Source items...]

   ── INSTITUTIONS ──
   [Source items...]

   ── PLATEFORMES PROFESSIONNELLES ──
   [Source items...]

   ── MÉDIAS / SYNTHÈSES ──
   [Source items...]
```

**Comportement & accessibilité**
- Ouverture : click sur "Voir les sources de cette analyse" dans la card
- Fermeture : Escape, click backdrop, bouton ✕
- Focus trap : focus initial sur ✕ ou premier lien, restitué à l'élément déclencheur à la fermeture
- ARIA : `role="dialog"`, `aria-modal="true"`, `aria-labelledby` sur le titre
- Pas de routing/URL change

**Liens externes**
- `target="_blank" rel="noopener noreferrer"`
- Icône `↗` discrète à droite du titre
- Hover : underline + déplacement subtil

**Mobile**
- Bottom sheet plein écran, backdrop opaque
- Bouton ✕ sticky en haut
- Swipe-to-dismiss : nice-to-have, non bloquant

### SEO / E-E-A-T

Le modal doit être présent dans le DOM serveur même fermé, pour que Google indexe les liens vers les sources (signal d'autorité). Implémentation : `v-show` plutôt que `v-if`, ou usage de `<dialog>` natif HTML qui est dans le DOM et caché par défaut. À trancher en implémentation.

---

## Hors-scope (pas dans cette itération)

- Scoring algorithmique basé sur compétences/tâches du visiteur
- Filtrage / browse / liste publique des métiers
- Comparateur de métiers
- Versioning / historique des données / changelog
- Admin runtime — `jobs.ts` et `sources.ts` restent versionnés en git
- A/B test des CTA newsletter (fera l'objet d'une itération séparée)
- Internationalisation (le scanner reste FR)

---

## Risques & décisions reportées

| Risque | Mitigation |
|---|---|
| Cohérence éditoriale des `dynamic` générées pour les ~80 métiers non-rapportés | Mathieu relit la table avant merge ; le plan d'implémentation regroupera les rédactions par lots de ~20 pour faciliter la revue |
| Mapping libellé FR ↔ libellé US du rapport ambigu (ex: "Spécialiste RP" = "Chargé de comm" ?) | Le plan d'implémentation listera chaque correspondance et demandera validation explicite |
| Couleurs des 4 statuts à harmoniser avec la charte existante | Tokens posés dans `tailwind.config.ts`, ajustables sans toucher au code des composants |
| Backward compat des URLs partagées | Aucun slug renommé. Test de non-régression sur `/scanner?job=<slug>` pour les ~120 slugs existants |
| Performance : 27 sources + 120 jobs en DOM serveur | Volume négligeable (~10 KB de HTML), aucun impact attendu |

---

## Critères d'acceptation

1. Schéma `Job` migré : `dynamic` et `sources` présents pour 100% des métiers ; `status` conforme à la nouvelle taxonomie ; pas de slug renommé
2. `sources.ts` créé avec ~20-22 sources uniques, toutes catégorisées, avec URL valide et `context` ≤ 120 chars
3. Card de résultat affiche : badge statut coloré + risk % + horizon + verdict + dynamique + bouton sources + CTA newsletter (variant statut)
4. Modal sources fonctionne : section contextuelle conditionnelle, catalogue groupé, focus trap, fermeture clavier/click, mobile bottom sheet
5. Bloc sources actuel en footer supprimé
6. Tous les slugs existants restent fonctionnels (test de non-régression)
7. Le DOM serveur contient les sources même modal fermé (E-E-A-T)
8. OG image dynamique gère les 4 statuts (couleur de fond)

---

## Prochaine étape

Plan d'implémentation détaillé via la skill `writing-plans`, qui produira :
- Mapping ligne-à-ligne libellés du rapport ↔ slugs existants
- Liste des 27→~22 sources dédupliquées avec context rédigé
- Brouillons de `dynamic` pour les ~80 métiers non-rapportés (groupés en lots pour revue)
- Tâches d'implémentation découpées par fichier
