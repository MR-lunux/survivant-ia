# La Boîte à Outils — design (catégorie + premier kit TRC-01)

**Date** : 2026-05-07
**Statut** : spec validé, prêt pour plan d'implémentation
**Scope** : nouvelle catégorie de premier rang « La Boîte à Outils » + premier kit `TRC-01` (Test de Résilience Cognitive)

---

## 1. Intention

Ouvrir une troisième famille de contenu sur le site, à parité avec **Rapports de Survie** (articles) et **Le Scanner** (diagnostic métier) : **La Boîte à Outils** = bibliothèque de **kits** pratiques que le visiteur dégaine en situation. Chaque kit prolonge un article : *l'article fait le pourquoi, le kit fait le comment.*

Le premier kit livré avec cette catégorie est le **TRC-01 — Test de Résilience Cognitive**, un quiz interactif de 5 questions qui mesure la dépendance cognitive du visiteur à l'IA et le pousse vers la newsletter La Fréquence.

Logique narrative à incarner :

```
LIRE (article : pourquoi l'offloading cognitif te menace)
  → MESURER (kit TRC-01 : où en es-tu, en 2 minutes)
    → DIAGNOSTIQUER (verdict + tier coloré)
      → S'ÉQUIPER (CTA newsletter contextualisé selon le tier)
```

## 2. Cible

Identique au site (acquis du pivot 2026-05-04) : le **salarié non-tech, en poste**, qui veut piloter l'IA dans son métier sans devenir développeur. Pour le TRC-01 spécifiquement, profil émotionnel : *« Je ne sais pas si j'utilise l'IA correctement. Aide-moi à me situer. »*

## 3. Décisions structurantes

| Décision | Choix retenu |
|---|---|
| Wording catégorie | **La Boîte à Outils** (proper noun, comme *Le Scanner* / *La Fréquence*) |
| Affichage en nav | `Boîte à Outils` (sans l'article) |
| URL racine | `/outils` |
| URL kit individuel | `/outils/[slug]` (ex : `/outils/trc-01`) |
| Position dans la nav header | Entre `Rapports de Survie` et `La Fréquence` |
| Position sur la home (phase 1) | **Aucune** (1 seul kit en V1, ouverture phase 2 à 3+ kits) |
| Relation kit ↔ article-parent | **Couplage 1-1 obligatoire** (chaque kit a un article-parent canonique, et inversement un article qui en justifie l'existence) |
| Stockage data | Nuxt Content `content/outils/*.md` (frontmatter YAML + body Markdown) |
| Convention id kit | `ACR-NN` (3 lettres + 2 chiffres). Premier kit : **TRC-01** |
| Premier kit | **TRC-01 — Test de Résilience Cognitive** (`kind: quiz`) |
| Mot banni dans les kits | `diagnostic` (réservé au Scanner pour éviter la confusion) |
| Verbes d'action prioritaires | `mesurer`, `tester`, `piloter`, `maîtriser`, `s'en servir` |

## 4. Architecture

### 4.1 Modèle de données

Schéma frontmatter commun à tous les kits, validé par convention (pas de runtime schema en V1) :

```yaml
---
id: TRC-01                       # ACR-NN, identifiant unique
kind: quiz                       # quiz | cheatsheet | video | fiche | calculator
slug: trc-01                     # URL slug
title: Test de Résilience Cognitive
subtitle: 5 questions pour mesurer ta dépendance à l'IA
description: Test rapide pour évaluer si l'IA est devenue ta béquille cognitive.
kicker: KIT · TRC-01             # affiché dans le KickerLabel
parentArticleSlug: offloading-cognitif-quand-l-ia-pense-a-ta-place
specs:                            # affichés dans la card et la page détail
  - "5 QUESTIONS"
  - "~2 MIN"
  - "TEST INTERACTIF"
  - "RÉSULTAT IMMÉDIAT"
data:                             # bloc structuré dépendant du `kind`
  questions:
    - id: 1
      label: "RÉFLEXE INITIAL"
      prompt: "Face à un problème complexe ou un nouveau projet, quel est ton premier réflexe ?"
      choices:
        - { key: A, text: "J'esquisse la structure mentalement ou sur papier.", points: 0 }
        - { key: B, text: "J'ouvre l'IA pour qu'elle me donne un plan.", points: 1 }
    # … (5 questions au total)
  tiers:
    - { range: [0, 1], slug: lucide,     color: accent,    label: "SURVIVANT LUCIDE",   status: "Optimal",       body: "…" }
    - { range: [2, 3], slug: dependance, color: mutation,  label: "DÉPENDANCE EN COURS", status: "Vigilance",     body: "…" }
    - { range: [4, 5], slug: atrophie,   color: danger,    label: "ATROPHIE CRITIQUE",  status: "Alerte Rouge",  body: "…" }
  newsletter:                     # variantes par tier (kicker + H3 + body)
    lucide:     { kicker: "RESTER UN CRAN DEVANT",  h3: "…", body: "…" }
    dependance: { kicker: "REPRENDRE LE CONTRÔLE",  h3: "…", body: "…" }
    atrophie:   { kicker: "RÉÉDUCATION COGNITIVE",  h3: "…", body: "…" }
---

[Markdown body : intro éditoriale (avant le quiz) + outro éditoriale (après le quiz : méthode, sources, limites). Rendu via <ContentRenderer>. Important pour le SEO.]
```

L'article-parent gagne un champ optionnel dans son frontmatter pour pointer vers son kit :

```yaml
# content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md
---
title: "L'offloading cognitif : quand l'IA pense à ta place"
description: "…"
date: 2026-05-07
category: comprendre-ia
relatedKit: trc-01    # ← nouveau champ optionnel
---
```

### 4.2 Routing

| URL | Page | Composant |
|---|---|---|
| `/outils` | Liste des kits | `app/pages/outils/index.vue` (nouveau) |
| `/outils/[slug]` | Détail d'un kit | `app/pages/outils/[slug].vue` (nouveau) |

### 4.3 Composants impactés

| Fichier | Type | Nature |
|---|---|---|
| `app/pages/outils/index.vue` | **new** | Page liste La Boîte à Outils |
| `app/pages/outils/[slug].vue` | **new** | Page détail kit (frame commune par `kind`) |
| `app/components/KitCard.vue` | **new** | Carte kit pour la grille de la page liste |
| `app/components/KitCallout.vue` | **new** | Bloc CTA « article → kit » à insérer en footer d'article |
| `app/components/kits/KitQuiz.vue` | **new** | Composant interactif rendu pour `kind: quiz` |
| `app/components/kits/KitQuizQuestion.vue` | **new** | Sous-composant : une question affichée |
| `app/components/kits/KitQuizResult.vue` | **new** | Sous-composant : écran de résultat |
| `app/components/AppHeader.vue` | edit | Ajout du lien `Boîte à Outils` dans la nav |
| `app/components/NewsletterForm.vue` | edit | Acceptation de props `context` (`kit_id`, `tier`) pour enrichir le tracking |
| `app/pages/rapports/[...slug].vue` | edit | Insertion conditionnelle de `<KitCallout>` avant `<NewsletterForm>` si `relatedKit` est défini sur l'article |
| `nuxt.config.ts` | edit | Déclaration de la collection `outils` pour Nuxt Content |
| `content/outils/trc-01.md` | **new** | Données + copy du premier kit |
| `content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md` | **new** | Article-parent du TRC-01 (prérequis de livraison) |

### 4.4 Configuration Nuxt Content

Ajouter une collection `outils` à côté de la collection `rapports` existante, dans le mécanisme de configuration de Nuxt Content actuellement utilisé par le projet (vraisemblablement `content.config.ts` à la racine ; à confirmer à l'implémentation en lisant la config existante). Schéma typé qui valide au minimum : `id`, `kind`, `parentArticleSlug`, `title`, `subtitle`, `kicker`. Les champs `data`, `specs`, `newsletter` peuvent rester libres (`any`) en V1 pour permettre l'évolution du schéma sans casser la build au fur et à mesure que de nouveaux `kind` sont ajoutés.

## 5. Pages

### 5.1 Page liste `/outils` (`pages/outils/index.vue`)

**Layout** :
- Container 1100px max
- Breadcrumb (`Boîte à Outils` seul, current)
- Header (max-width 720px) :
  - Kicker `<KickerLabel>` : `LA BOÎTE À OUTILS`
  - H1 Playfair italic : *« Des **instruments de poche** pour piloter l'IA dans ton métier. »* (accent sage sur « instruments de poche »)
  - Paragraphe intro : *« Tests, calculateurs, cheatsheets, fiches pratiques. Chaque outil prolonge un article : tu lis pour comprendre, tu utilises l'outil pour appliquer. Tout est gratuit, sans inscription. »*
- Counter bar (border-top + border-bottom dashed) :
  - Gauche : `<strong>{N}</strong> outils disponibles · + d'autres en route`
  - Droite : `RÉSULTATS PRIVÉS · AUCUNE COLLECTE`
- Filtres `kind` (tous les `kind` connus, avec compte) :
  - V1 : `TOUS` actif, autres désactivés (1 seul kit)
  - À 3+ kits : activer dynamiquement les filtres dont `count > 0`
- Grille de `<KitCard>` (auto-fill, minmax 310px, gap 1.5rem)
- 1 placeholder « PROCHAINEMENT » (kind générique) en V1, retiré quand 3+ kits réels
- Bottom-note centré : `UN OUTIL EN TÊTE QUE TU AIMERAIS TROUVER ICI ? <a>ÉCRIS-MOI →</a>` (lien `mailto:` ou page contact)

**SEO** :
- `useSeoMeta` : title `La Boîte à Outils : tests et instruments pour piloter l'IA | Survivant-IA`, description sur le bénéfice, OG image générée via `defineOgImage`
- JSON-LD `CollectionPage` + `BreadcrumbList`
- Inclus dans le sitemap

### 5.2 Page détail kit `/outils/[slug]` (`pages/outils/[slug].vue`)

**Frame commune (tous les `kind`)** :
1. Container 780px max (cohérent avec les Rapports)
2. Breadcrumb : `Boîte à Outils › {id}`
3. Kicker `<KickerLabel>` : `KIT · {id}` (carré spinning sage, comme partout sur le site)
4. H1 Playfair italic : `{title}` — option d'accent sage sur un mot-clé via balisage `<em>`
5. Specs mono inline avec dots séparateurs : `{specs.join(' · ')}`
6. Bandeau article-parent (border + bg surface) :
   - Label mono `▶ À LIRE D'ABORD`
   - Title de l'article-parent
   - Flèche `→` à droite, le bloc entier est un lien
7. Body (variable) :
   - Pour TOUS les kinds : intro Markdown du body, rendue via `<ContentRenderer>`
   - Composant rendu par `kind` (V1 : `<KitQuiz>` pour `quiz`)
   - Outro Markdown du body, rendue via `<ContentRenderer>`
8. Footer commun :
   - Carte « Pour aller plus loin » : retour vers article-parent (label `// POUR EN SAVOIR PLUS` + title + teaser + lien `▶ LIRE L'ARTICLE COMPLET`)
   - `<NewsletterForm context="kit-detail" :kit-id="…" />` (sans tier — tier seulement injecté dans `<KitQuizResult>`)

**Pas de `<ScannerBorder>`** — réservé à l'identité du Scanner.

**SEO** :
- `useSeoMeta` : title `{title} ({id}) | Survivant-IA`, description, OG image générée
- JSON-LD : `WebApplication` (pour le kit) + `Quiz` (Schema.org, pour `kind: quiz`) + `BreadcrumbList`
- Lien canonique vers `https://survivant-ia.ch/outils/{slug}`
- `useHead` injecte un `<link rel="related" href="…">` vers l'article-parent (signal SEO secondaire)

### 5.3 Composant `<KitCard>` (page liste)

```
┌─────────────────────────────┐
│ ▎TRC-01           [QUIZ]    │ ← top-rule sage 36px (60px au hover)
│                              │
│ Test de Résilience          │ ← Playfair italic 1.45rem
│ Cognitive                    │
│                              │
│ 5 questions pour mesurer    │ ← description (var(--color-muted))
│ si l'IA est devenue ta…     │
│                              │
│ ───────────────────────     │ ← border-top dashed
│ 5 QUESTIONS · ~2 MIN ·      │ ← specs mono
│ RÉSULTAT IMMÉDIAT            │
│                              │
│ ▶ MESURER MA RÉSILIENCE     │ ← cta mono accent
└─────────────────────────────┘
```

Toute la card est cliquable (le wrapper est un `<NuxtLink to="/outils/{slug}?from=list">`, query param injecté pour le tracking `kit_viewed.from`). Hover : `border-color: var(--color-accent)`, `transform: translateY(-2px)`, top-rule passe de 36px à 60px.

Variante `coming` (placeholder) : opacity 0.7, border dashed, kind/id grisés, title `PROCHAINEMENT` en mono caps, pas de hover, pas cliquable.

### 5.4 Composant `<KitCallout>` (footer d'article)

Bloc à insérer dans `app/pages/rapports/[...slug].vue`, **avant** le `<NewsletterForm>`, **conditionnellement** si l'article a un champ `relatedKit` dans son frontmatter.

**Layout** :
- Container 780px (hérité de l'article)
- Bordure accent-soft + gradient discret sage menthe en arrière-plan
- Top-rule sage 80px (140px au hover du bloc entier)
- Kicker : `<span class="glyph"></span> DU LIRE AU FAIRE`
- Ligne ID/kind : `{id} · {kind.toUpperCase()}` (ex : `TRC-01 · QUIZ INTERACTIF`)
- H3 Playfair italic : `{title}` ou pitch éditorial spécifique au callout (à définir dans le frontmatter du kit comme `calloutPitch` optionnel)
- Pitch éditorial : 1-2 phrases qui prolongent l'article et amorcent le kit
- Specs mono inline
- Ligne CTA : bouton sage menthe `▶ MESURER MA RÉSILIENCE` + side-note mono `Reste sur le site · Aucune collecte`

**Comportement** :
- Le wrapper externe est un `<NuxtLink to="/outils/{slug}?from=article">` — toute la carte est cliquable. Le bouton interne est stylé en bouton (pas un vrai `<button>`, pour éviter d'imbriquer un bouton dans un lien — HTML invalide). Le query param `?from=article` permet à `<KitQuiz>` de capter la source d'arrivée.
- Sur click : navigation Nuxt + capture de l'event `kit_cta_clicked_from_article` avec `from_article_slug`, `to_kit_id`. La capture se fait dans un handler `@click` (passe avant la navigation NuxtLink).

## 6. TRC-01 spécifiquement

### 6.1 Contenu (5 questions, scoring 0-1, 3 paliers)

**Q1 — Réflexe initial**
> Face à un problème complexe ou un nouveau projet, quel est ton premier réflexe ?
- `[ A ]` J'esquisse la structure mentalement ou sur papier. *(0 pt)*
- `[ B ]` J'ouvre l'IA pour qu'elle me donne un plan. *(1 pt)*

**Q2 — Processus de validation**
> L'IA te génère un rapport de 3 pages. Comment le valides-tu ?
- `[ A ]` Je le lis ligne par ligne avec un esprit critique. *(0 pt)*
- `[ B ]` Je le scanne en diagonale, ça a l'air pro, je valide. *(1 pt)*

**Q3 — Résilience technique**
> Demain, panne mondiale. Plus aucune IA n'est accessible. Ton état ?
- `[ A ]` Je suis ralenti, mais je connais mon métier. *(0 pt)*
- `[ B ]` Je suis incapable de fournir mes livrables. *(1 pt)*

**Q4 — Résolution d'erreur**
> Une formule ou un bout de code généré par l'IA plante. Que fais-tu ?
- `[ A ]` Je lis l'erreur pour comprendre ce qui cloche. *(0 pt)*
- `[ B ]` Je demande à l'IA : « corrige ça, ça ne marche pas ». *(1 pt)*

**Q5 — Capitalisation**
> Tu dois refaire une tâche similaire à celle d'il y a 3 mois. Comment fais-tu ?
- `[ A ]` Je me base sur mes notes et mon expérience. *(0 pt)*
- `[ B ]` Je redemande un prompt à zéro, je n'ai rien retenu. *(1 pt)*

### 6.2 Paliers de résultat (3 tiers)

| Score | Slug | Couleur | Label | Status | Body verdict |
|---|---|---|---|---|---|
| 0–1 | `lucide` | accent (`#6CE3B5`) | **SURVIVANT LUCIDE** | Optimal | *Tu utilises l'IA comme un multiplicateur de force, pas comme une béquille. Ton cerveau reste le pilote de l'opération. Continue à entretenir cette notion de l'effort.* |
| 2–3 | `dependance` | mutation (`#FFA630`) | **DÉPENDANCE EN COURS** | Vigilance | *L'offloading cognitif commence à s'installer. Tu gagnes en vitesse, mais tu perds en profondeur. Il est temps de réinjecter de la conscience dans tes processus pour éviter l'atrophie.* |
| 4–5 | `atrophie` | danger (`#FF3E3E`) | **ATROPHIE CRITIQUE** | Alerte Rouge | *Tu es passé en mode passager. Ton esprit critique est en veille prolongée. Si l'IA s'arrête, ton expertise s'effondre. Tu dois entamer une rééducation cognitive d'urgence.* |

### 6.3 CTA newsletter par tier

**Tier `lucide` (0–1)** — *ton : entretien, pas urgence*
- Kicker : `RESTER UN CRAN DEVANT`
- H3 : *« Tu pilotes déjà. Reste à la pointe. »*
- Body : « Chaque semaine, des outils et signaux pour garder une longueur d'avance sur les autres dans ton équipe. Cinq minutes de lecture, sans hype, sans funnel. »

**Tier `dependance` (2–3)** — *ton : alerte sereine*
- Kicker : `REPRENDRE LE CONTRÔLE`
- H3 : *« Le test t'inquiète ? Reste un cran devant. »*
- Body : « Chaque semaine, un article concret pour muscler ton esprit critique et apprendre à piloter l'IA sans y laisser ton cerveau. Cinq minutes de lecture, sans hype, sans funnel. »

**Tier `atrophie` (4–5)** — *ton : urgence, rééducation*
- Kicker : `RÉÉDUCATION COGNITIVE`
- H3 : *« Le test est sévère. La rééducation commence ici. »*
- Body : « Chaque semaine, un article concret pour rééduquer ton esprit critique et reprendre le pilote face à l'IA. Pas de théorie, pas de jargon, juste la sortie. »

Bouton newsletter dans tous les cas : `Rejoindre la Fréquence →`

### 6.4 Mécanique du quiz (`<KitQuiz>`)

**State machine** (composable Vue local au composant) :

```
state = 'intro' → 'question' → … → 'decrypting' → 'result' → 'restart' → 'question'
```

- **`intro`** *(optionnel)* : si on veut un écran « Prêt ? » avant Q1. **V1 : on saute directement à `question` Q1 dès affichage du composant.**
- **`question`** : affiche la question courante (1 à 5).
- **`decrypting`** : transition entre la dernière réponse et l'affichage du résultat. ~1.2s. Animation typewriter/scramble sur le tier name, et compteur numérique animé qui défile vite jusqu'au score final.
- **`result`** : écran résultat affiché.
- **`restart`** : reset l'état, passe à `question` Q1.

**Pattern d'interaction** :
- Une seule question affichée à la fois (la zone `<KitQuiz>` change de contenu, pas de scroll vertical)
- Transition CSS courte ~300ms (fade + slide léger horizontal) entre questions
- Click sur `[ A ]` ou `[ B ]` → enregistre les points + avance immédiatement à la question suivante
- Bouton `◀ Q PRÉCÉDENTE` discret en bas-gauche dès que `currentQuestion > 1` (permet de revenir et changer)
- Indicateur de progression discret en bas, centré : 5 dots, dot rempli sage si question répondue (`● ● ● ○ ○`)

**Persistance** : aucune en V1. État local au composant (refs), reset à chaque montage. Pas de localStorage. RGPD-clean, simple.

**URL** : reste `/outils/trc-01` tout du long. Pas de query params, pas de routes par question.

### 6.5 Écran de résultat (`<KitQuizResult>`)

**Layout** :
- Container 780px (hérité de la page kit)
- Carte résultat principale :
  - Bordure couleur tier (accent / mutation / danger)
  - Top-rule 3px couleur tier avec glow
  - ID `TRC-01` en mono petit, top-right
  - Meta `DIAGNOSTIC TERMINÉ · CALCUL: 2.4s` en mono petit *(temps fixe pour donner une impression d'instrument)*
  - Score block (border-bottom dashed couleur tier) :
    - Score numérique géant (5rem) en mono couleur tier, avec text-shadow glow
    - À droite : label `// STATUT` mono + tier name en mono caps couleur tier (zone d'animation typewriter)
  - Status line : LED qui pulse couleur tier + `NIVEAU : {Optimal/Vigilance/Alerte Rouge}` en mono
  - Body verdict : Playfair italic 1.2rem, padding-left 1.5rem, border-left 2px couleur tier
  - Actions secondaires : `↻ Recommencer le test` (bouton outline)
- Bloc kicker final + newsletter (séparé visuellement) :
  - Bordure accent-soft (sage menthe brand, **pas la couleur du tier**) — marque la transition « voici le diagnostic / voici la rampe d'action »
  - Top-rule sage menthe 60px avec glow
  - Kicker `<KickerLabel>` avec carré spinning : `{newsletter[tier].kicker}` (variant par tier)
  - H3 Playfair italic : `{newsletter[tier].h3}`
  - Body : `{newsletter[tier].body}`
  - Form : input email + bouton sage menthe `Rejoindre la Fréquence →`
  - **Le `<NewsletterForm>` est utilisé en mode override** : on lui passe les props `kicker`, `h3`, `body` pour les variants par tier, sinon il reste identique au form standard côté backend Brevo.

**Animation de décryptage** :
- Sur la zone `tier name` : typewriter/scramble (caractères aléatoires qui se résolvent vers le tier name) — bibliothèque légère ou code custom CSS+JS, ~1.2s
- Sur le score numérique : compteur qui défile vite (de 0 à `finalScore` en ~0.8s, easing ease-out), suivi d'une mini-pulse glow
- Reduced-motion : afficher direct sans animation (respect `prefers-reduced-motion`)

## 7. Conventions et règles éditoriales

À appliquer partout dans les fichiers créés/modifiés pour cette feature :

1. **Mot banni dans les kits** : `diagnostic` (réservé au Scanner)
2. **Verbes d'action prioritaires** : `mesurer`, `tester`, `piloter`, `maîtriser`, `s'en servir`, `prendre le virage`
3. **Tutoiement** : maintenu partout (convention site)
4. **Em-dashes `—` interdits** : remplacer par `:` (définition) ou `,` (incise) — convention française
5. **Pas de mots interdits du pivot** : `méthode`, `chevaucher`, `chevaucher la vague`, `mardi`
6. **`KickerLabel`** : toujours utiliser le composant `<KickerLabel>` (carré sage spinning), jamais le préfixe `//` en hardcoded
7. **Convention id kit** : `ACR-NN` (3 lettres + 2 chiffres) — TRC-01, futurs CHK-01, FCH-01, etc.
8. **Wording catégorie** : *La Boîte à Outils* en proper noun (avec article) en copy éditoriale ; `Boîte à Outils` (sans article) dans la nav et les breadcrumbs
9. **Wording kit générique** : `kit` au singulier, `kits` au pluriel ; éviter « outil » seul dans la copy quand on parle d'un kit (utiliser « kit » ou « instrument »)

## 8. Tracking PostHog

### 8.1 Events obligatoires (V1)

| Event | Properties | Déclencheur |
|---|---|---|
| `kit_viewed` | `id`, `kind`, `from` (`direct` / `article` / `list`) | Mount de `pages/outils/[slug].vue`. Stratégie de détection de `from` : (1) si query param `?from=article` ou `?from=list` est présent, on l'utilise (injecté par `<KitCallout>` et `<KitCard>`) ; (2) sinon `direct`. Le query param est ensuite retiré silencieusement de l'URL via `router.replace` pour garder l'URL propre. |
| `kit_quiz_started` | `id` | Premier click sur un choix (Q1 répondue) |
| `kit_quiz_completed` | `id`, `score`, `tier` | Q5 répondue, score calculé, transition `decrypting` lancée |
| `kit_quiz_restarted` | `id` | Click sur `↻ Recommencer le test` |
| `kit_cta_clicked_from_article` | `from_article_slug`, `to_kit_id` | Click sur `<KitCallout>` dans un article |
| `kit_list_card_clicked` | `id`, `position` (1-based) | Click sur une `<KitCard>` de la page liste |

### 8.2 Events optionnels (V1, tous activés)

| Event | Properties | Déclencheur |
|---|---|---|
| `kit_quiz_question_answered` | `id`, `question` (1-5), `choice` (`A`/`B`), `points` (0/1) | Click sur un choix |
| `kit_quiz_abandoned` | `id`, `last_question` (1-5) | `beforeunload` ou route change avec `currentQuestion < 5` et `state === 'question'` |
| `kit_list_viewed` | — | Mount de `pages/outils/index.vue` |

### 8.3 Enrichissement `<NewsletterForm>`

Quand le `<NewsletterForm>` est utilisé dans `<KitQuizResult>`, il reçoit en props :
- `context: 'kit-result'`
- `kitId: 'TRC-01'`
- `tier: 'lucide' | 'dependance' | 'atrophie'`

Ces props sont ajoutées aux propriétés des events PostHog existants du form (`subscribe_attempted`, `subscribe_succeeded`, `subscribe_failed`, ou équivalents). Permet de mesurer la conversion newsletter par tier de résultat.

## 9. SEO

- **Titles** : `Test de Résilience Cognitive (TRC-01) — La Boîte à Outils | Survivant-IA` (page kit) ; `La Boîte à Outils : tests et instruments pour piloter l'IA | Survivant-IA` (page liste)
- **OG images** : générées via `defineOgImage('Default', { title, kicker })`. Kicker pour la page liste : `// LA BOÎTE À OUTILS`. Kicker pour le TRC-01 : `// KIT · TRC-01`.
- **JSON-LD** :
  - Page liste : `CollectionPage` + `BreadcrumbList`
  - Page kit : `WebApplication` + `Quiz` (Schema.org pour `kind: quiz` uniquement, à étendre quand d'autres `kind` arrivent) + `BreadcrumbList`
- **Sitemap** : ajouter `/outils` et `/outils/[slug]` (configuration Nuxt sitemap module si présent, sinon ajout manuel)
- **Linking interne** :
  - Article-parent → kit (via `<KitCallout>`)
  - Kit → article-parent (bandeau haut + carte footer)
  - Page liste → tous les kits (KitCards)
- **Copy SEO** : le body Markdown du `.md` (intro + outro autour du composant) doit contenir au moins **400-600 mots** de copy éditoriale indexable pour soutenir le ranking de la page kit. Pas un quiz nu.

## 10. Hors scope (backlog)

**Phase 2 — quand 3+ kits livrés** :
- Section dédiée `Boîte à Outils` sur la home (suggestion : nouveau `<HomeMastheadBoiteAOutils>` après `IV — Rapports de Survie`, devient `V`, FAQ devient `VI`, renumérotation des Mastheads)
- Activation des filtres `kind` dans la page liste
- Ajout de 1-2 questions FAQ home sur les kits (« qu'est-ce qu'un kit ? », « combien y en a-t-il ? »)
- Retrait du placeholder « PROCHAINEMENT » de la page liste

**Phase 3+ — features avancées** :
- Export PDF du résultat (TRC-01 et autres futurs quiz)
- Partage social du résultat (image OG dynamique générée par tier + texte pré-rempli pour Instagram/LinkedIn/X)
- Notation/commentaire d'un kit (modération nécessaire)
- Suggestion de kit depuis les résultats du Scanner (quand un métier scanné a un kit pertinent associé)
- Persistance du résultat dans localStorage avec un opt-in clair (« voir mon évolution dans le temps »)
- Composants pour autres `kind` : `<KitCheatsheet>`, `<KitVideo>`, `<KitFiche>`, `<KitCalculator>` (à designer au cas par cas, pas en pre-design générique)

## 11. Prérequis et dépendances

- **Article-parent du TRC-01 doit exister avant la livraison** : `content/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place.md` — couplage 1-1 obligatoire. Si l'article n'est pas prêt, le TRC-01 n'est pas livré (la promesse éditoriale du kit s'effondre sans son article).
- **Title de travail de l'article-parent** : *L'offloading cognitif : quand l'IA pense à ta place* (peut évoluer à la rédaction).
- **Pas de dépendance externe nouvelle** : on reste sur Nuxt Content, PostHog, Brevo (existants).

## 12. Critères de validation

Le sous-projet sera considéré comme livré quand :

- [ ] La nav header affiche `Boîte à Outils` entre `Rapports de Survie` et `La Fréquence`
- [ ] L'URL `/outils` retourne la page liste avec au moins le kit TRC-01 visible
- [ ] L'URL `/outils/trc-01` retourne la page détail du TRC-01 avec le quiz fonctionnel
- [ ] Le quiz TRC-01 affiche une question à la fois, avec transition fluide
- [ ] Le bouton précédent permet de revenir et changer une réponse
- [ ] L'écran résultat affiche le bon tier (couleur, label, body) selon le score 0-5
- [ ] L'effet de décryptage est présent (typewriter sur tier name + compteur de score)
- [ ] Le CTA newsletter sur l'écran résultat varie selon le tier (3 variants livrés)
- [ ] Le bouton `↻ Recommencer` reset le quiz à Q1
- [ ] La page liste affiche 1 placeholder « PROCHAINEMENT » + le bottom-note
- [ ] L'article-parent `offloading-cognitif-quand-l-ia-pense-a-ta-place` existe et linke vers le TRC-01 via `<KitCallout>`
- [ ] Le `<KitCallout>` ne s'affiche **pas** sur les articles sans `relatedKit`
- [ ] Le mot `diagnostic` n'apparaît **pas** dans les copies des kits (page liste, page TRC-01, KitCallout, écran résultat)
- [ ] L'id `TRC-01` apparaît partout (kicker, breadcrumb, card, callout) — pas de DRC-01 résiduel
- [ ] Les 6 events PostHog obligatoires sont émis aux bons moments
- [ ] Le `<NewsletterForm>` placé sur l'écran résultat envoie `kit_id` + `tier` dans ses events
- [ ] JSON-LD `CollectionPage` injecté sur `/outils`, `WebApplication` + `Quiz` injectés sur `/outils/trc-01`
- [ ] OG images générées pour `/outils` et `/outils/trc-01`
- [ ] La page TRC-01 contient au moins 400-600 mots de copy SEO autour du composant quiz
- [ ] `prefers-reduced-motion` désactive les animations (compteur, typewriter, transitions)
- [ ] Aucune régression visuelle sur le DA Editorial Dark sage menthe (pages existantes inchangées)
