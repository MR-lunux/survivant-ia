# Scanner v2 — Spec de design (sous-projet 2)

**Date** : 2026-05-07
**Statut** : spec validée par brainstorming, prête pour writing-plans
**Scope** : sous-projet 2 du repositionnement éditorial (suite du sous-projet 1 livré le 2026-05-04). Refonte complète du scanner d'obsolescence (`/scanner`) en diagnostic IA aligné sur le pivot "piloter l'IA".

**Spec parent** : `docs/superpowers/specs/2026-05-04-pivot-editorial-design.md` (section 7 hors-scope mentionne explicitement le sous-projet 2 comme à brainstormer indépendamment).

---

## 1. Intention

Faire passer le scanner d'un outil défensif monodimensionnel ("ton métier est dans le viseur, voici à quel point") à un **diagnostic transformatif bidimensionnel** ("voici comment piloter l'IA dans ton métier en utilisant ce que tu as déjà"). Aligner le scanner sur la promesse globale du site : "survivre à l'IA au travail, c'est apprendre à la piloter".

Trois bascules clés vs v1 :

1. **Sortir du mono-axe risque**. Ajouter un score `potential` (levier d'amplification IA, 0-100) qui répond à "qu'est-ce que je peux gagner en pilotant l'IA dans mon métier ?". Le couple risk × potential génère une matrice 2D à 4 quadrants éditoriaux.
2. **Sortir du verdict-douche-froide**. Remplacer l'écran résultat actuel (badge + dynamique + bouton sources + CTA newsletter) par une lecture en 3 sections éditoriales : **constat** (la dynamique narrative existante du header) → **3 leviers concrets cette semaine** → **rampe newsletter + checkbox liste d'attente formations**.
3. **Sortir du look dashboard**. Aligner le visuel sur le DA Editorial Dark + sage menthe + Playfair italic du sous-projet 1. Hero centré, sage rules de 80px, Roman numerals, leviers en flux et non en cards.

---

## 2. Cible

Identique au pivot éditorial : le **salarié non-tech, en poste**, qui sent l'IA arriver sur son métier et veut devenir celui qui maîtrise l'IA mieux que les autres dans son équipe. Le scanner v2 capture ce visiteur dans un état d'angoisse-curiosité, lui livre une lecture compréhensible de sa position, et le ramène vers la conversion principale (newsletter La Fréquence) avec un signal additionnel d'intérêt formations (Brevo attribute).

---

## 3. Décisions de design (validées en brainstorming)

| Décision | Choix retenu |
|---|---|
| Scope | Option C (full) — schema migration + matrice 2D + écran résultat 3 sections + leviers per-job + Brevo enrichment + OG image dynamique |
| Définition de `potential` | Levier d'amplification IA (option A) — "à quel point l'IA peut amplifier ton output dans ton métier actuel". Lecture opérationnelle, pas carrière. |
| Nommage des 4 quadrants | Verbes courts à la 2e personne (option A) — `TU TIENS` / `TU PILOTES` / `TU PIVOTES` / `TU MUTES` |
| Visibilité de la matrice dans le résultat | Layout B éditorial — matrix chip 160px à gauche d'une légende flex-list à droite, dans la section "I — Position dans le cadran" |
| Structure du plan d'action | 3 sections : constat (= dynamique du header, pas de duplication) → 3 leviers per-job → rampe newsletter + checkbox formations |
| Source du contenu leviers | Hybride — structure constante, leviers spécifiques per-job rédigés par Claude (source-grounded sur le catalogue des 22 articles dans `app/data/sources.ts`), avec fallback per-quadrant si `leviers.length === 0` |
| Brevo dual CTA | Liste unique "La Fréquence" + attribut booléen `FORMATIONS_INTEREST` + 4 attributs scanner (`SCANNER_QUADRANT`, `SCANNER_JOB`, `SCANNER_RISK`, `SCANNER_LEVIER`). Pas de seconde liste. |
| Layout général | Éditorial : hero centré big Playfair italic 88px, sage rules de 80px en menthe entre sections, Roman numerals `— I.` / `— II.` / `— III.`, leviers en flux (pas en cards) |
| Animation terminal pendant le scan | Conservée (signature brand). Audit du code v1 pour purger les `//` éventuels qui traîneraient. |
| Home Diagnostic teaser | Update labels seulement (`RISQUE` / `LEVIER IA` / `QUADRANT`). Effet redact conservé. |
| OG image dynamique | Inclus dans v2 (énorme levier shareability LinkedIn). Création de `app/components/OgImage/Scanner.satori.vue`. |
| Audit des dynamiques v1 | Ré-écriture des ~60 dynamiques encore défensives sur les 195. Le reste reste tel quel. |
| Migration v1 → v2 | Hybride (option C en Q7a) — heuristique baseline status v1 → quadrant v2 + override Claude sur les ~50 outliers. |
| Slugs | Tous préservés. Zéro régression URL. |

---

## 4. Architecture des données

### 4.1 Schéma `Job` étendu (`app/data/jobs.ts`)

```ts
export type JobStatus = 'danger' | 'mutation' | 'protege' | 'croissance'   // v1, conservé pour backward compat
export type JobQuadrant = 'tiens' | 'pilotes' | 'pivotes' | 'mutes'         // v2, nouveau

export interface Job {
  // ── existant (v1, conservé tel quel) ─────────────────────
  slug: string
  label: string
  risk: number              // 0-100, exposition IA. Calibré v1, conservé.
  horizon: number           // 2 | 5 | 10
  status: JobStatus         // 4-state v1, conservé pour backward compat (sitemap, JSON-LD, analytics)
  dynamic: string           // ≤ 300 chars, voix Survivant-IA. Audit pivot ~60 jobs.
  sources: number[]         // ids dans app/data/sources.ts

  // ── nouveau (v2) ──────────────────────────────────────────
  quadrant: JobQuadrant     // 4-state v2, ÉDITORIAL — non dérivé d'un seuil
  potential: number         // 0-100, levier d'amplification IA
  leviers: string[]         // 3 leviers per-job ; [] = fallback per-quadrant
}
```

**Justifications** :
- `status` v1 conservé pour ne pas casser les analytics et JSON-LD existants. Devient un champ "legacy" qui reflète une vue mono-axe ; le quadrant v2 est la vue principale en UI.
- `quadrant` est éditorial **au runtime** : aucune formule ne le calcule depuis risk + potential. À la **migration** (one-shot, dans `jobs.ts`), une heuristique baseline propose une valeur initiale (cf. 4.3), puis Claude override manuellement les outliers. Une fois le fichier committé, `quadrant` est figé jusqu'à la prochaine modif éditoriale.
- `potential` est borné [0, 100], même échelle que `risk` pour cohérence visuelle des deux scores. Même règle qu'au-dessus : heuristique de migration + override manuel.
- `leviers` est `string[]` (pas `string[][]` pour leviers structurés) — chaque ligne contient le titre + description courte concaténés par un séparateur (à définir dans le plan, probablement `\n` ou ` — `). Maintien simple.

### 4.2 Catalogue de fallback per-quadrant (`app/data/quadrant-leviers.ts`)

```ts
export interface QuadrantLeviers {
  quadrant: JobQuadrant
  intro: string             // Playfair italic, ≤ 100 chars, ex: "Trois leviers génériques pour tous les métiers en mutation."
  leviers: string[]         // exactement 3 items, format identique à Job.leviers
}

export const QUADRANT_LEVIERS: QuadrantLeviers[] = [
  { quadrant: 'tiens', intro: '...', leviers: [...] },
  { quadrant: 'pilotes', intro: '...', leviers: [...] },
  { quadrant: 'pivotes', intro: '...', leviers: [...] },
  { quadrant: 'mutes', intro: '...', leviers: [...] },
]
```

L'UI lit `Job.leviers` en priorité ; si vide, lit `QUADRANT_LEVIERS[job.quadrant].leviers`.

### 4.3 Migration v1 → v2

**Heuristique de mapping baseline** appliquée à tous les jobs sans annotation manuelle :

| Status v1 | Quadrant v2 par défaut | Potential v2 par défaut |
|---|---|---|
| `danger` | `pivotes` (job se contracte ET levier IA faible) | 25 (haute exposition + faible amplification) |
| `mutation` | `mutes` (job se transforme ET levier IA fort) | 70 (l'IA t'arme) |
| `protege` | `tiens` (job stable ET peu de levier IA) | 25 (peu d'amplification) |
| `croissance` | `pilotes` (job protégé ET fort levier IA) | 70 (avantage à capitaliser) |

**Override manuel des ~50 outliers** par Claude après application de la baseline. Exemples connus à overrider :

- `comptable` (status=danger) → `mutes` (levier IA très haut malgré risk élevé)
- `data-scientist` (status=mutation) → `mutes` mais potential=80 (haut levier)
- `medecin-generaliste` (status=protege) → `pilotes` (haut levier IA via diagnostic assisté)
- `cardiologue` (status=protege) → `pilotes` (très haut levier IA via imagerie)
- `agriculteur` (status=croissance) → `pilotes` mais avec potential plus modéré (peu de levier IA quotidien hormis prévision météo)
- `programmeur` / `developpeur-logiciel` (status=mutation/danger) → `mutes` avec potential=85 (le plus haut levier IA de tous)

Ces overrides sont écrits directement dans le fichier `jobs.ts` lors de la migration ; pas de fichier séparé d'override.

### 4.4 Brevo — attributs custom à créer

Dans Brevo Settings → Contact attributes, créer :

| Nom | Type | Usage |
|---|---|---|
| `FORMATIONS_INTEREST` | Boolean | Coché par checkbox dans le form scanner. True = lead chaud pour la liste d'attente formations. |
| `SCANNER_QUADRANT` | Text | `tiens` / `pilotes` / `pivotes` / `mutes`. Capture le diagnostic au moment du signup. |
| `SCANNER_JOB` | Text | Slug du métier scanné (ex: `comptable`). |
| `SCANNER_RISK` | Number | Score risk 0-100 du job scanné. |
| `SCANNER_LEVIER` | Number | Score potential 0-100 du job scanné. |

L'API serveur (`server/api/newsletter.post.ts` ou équivalent) doit être étendu pour accepter ces 5 champs en plus de l'email et les pousser à Brevo via leur SDK. Si le visiteur ne vient pas du scanner (signup direct depuis la home), les 4 attributs `SCANNER_*` restent vides.

---

## 5. Architecture UI

### 5.1 Composants impactés

| Fichier | Action | Nature |
|---|---|---|
| `app/data/jobs.ts` | edit | Schéma étendu + migration v1→v2 + audit dynamiques défensives |
| `app/data/quadrant-leviers.ts` | **new** | Catalogue de fallback (4 quadrants × 3 leviers) |
| `app/pages/scanner.vue` | rewrite | Refonte complète : hero éditorial, sections I/II/III, sage rules, animation terminal nettoyée des `//` |
| `app/components/SourcesModal.vue` | unchanged | Reste tel quel |
| `app/components/HomeDiagnosticTeaser.vue` | edit | Labels uniquement (`RISQUE` / `LEVIER IA` / `QUADRANT`) |
| `app/components/OgImage/Scanner.satori.vue` | **new** | OG image dynamique avec quadrant + scores + label métier |
| `app/components/OgImage/Default.satori.vue` | unchanged | Reste l'OG image générique du site |
| `nuxt.config.ts` | edit (peut-être) | Enregistrement de la nouvelle OG component si nécessaire |
| `server/api/newsletter.post.ts` (ou équivalent Brevo) | edit | Extension pour accepter et pousser les 5 attributs custom |
| `app/components/NewsletterForm.vue` | unchanged | Le form home reste simple (email seul). Le form scanner est intégré directement dans `scanner.vue` (variant avec checkbox formations). |

### 5.2 Layout éditorial du résultat

**Structure verticale**, max-width 720px, centré, sage rules de 80px en menthe entre sections.

```
[ Kicker top: "Diagnostic IA · {label}" — carré menthe + caps mono ]

[ Verdict centré : "Tu mutes." — Playfair italic 88px ]

[ Scores discrets : "72/100 · risque  •  75/100 · levier IA" — mono caps ]

[ Dynamique narrative : Inter 17px, max 560px centré ]

[ Sage rule 80px ]

— I.  Position dans le cadran
   [ Matrix chip 160px (4 quadrants, ton quadrant en fond plein orange + bordure menthe) ]
   [ Légende flex-list à droite : 4 lignes "QUADRANT — phrase d'explication" ; ton quadrant highlighté ]

[ Sage rule 80px ]

— II.  Tes leviers cette semaine
   [ Intro Playfair italic 32px : "Trois actions concrètes pour piloter l'IA dans ton métier de {label}." ]
   [ 3 leviers en flux, chacun : digit 01/02/03 mono menthe + titre Inter 18px gras + description Inter 15px max 580px ]
   [ Bordures fines #1F1F1F séparant chaque levier ]

[ Sage rule 80px ]

— III.  La suite
   [ Headline Playfair italic 32px : "Reste un cran devant." ]
   [ Paragraphe Inter 16px : "Un nouvel article chaque semaine pour piloter l'IA dans ton métier..." ]
   [ Form : input email + bouton "Rejoindre →" ]
   [ Checkbox optionnelle : "Préviens-moi en avance des formations approfondies (bientôt)..." ]

[ Sage rule fade #2A2A2A ]

[ Footer actions centrés mono : "↗ Sources  ·  ⎘ Copier le lien  ·  ↻ Nouveau scan" ]
```

### 5.3 Couleurs des 4 quadrants (Tailwind tokens existants conservés)

Les CSS custom properties existent déjà depuis le 2026-05-05 dans `app/assets/css/main.css` :

| Quadrant | Couleur | Token |
|---|---|---|
| `tiens` | `#5BC0EB` cyan | `var(--color-protege)` (héritage v1, sémantique correspond toujours) |
| `pilotes` | `#3DDC84` vert | `var(--color-croissance)` |
| `pivotes` | `#FF3E3E` rouge | `var(--color-danger)` |
| `mutes` | `#FFA630` orange | `var(--color-mutation)` |

Pas de nouveaux tokens. La sémantique de couleur est conservée (rouge = alerte, orange = transition, cyan = stable, vert = upside).

### 5.4 Animation terminal pendant le scan

Conservée. Le bloc `SCAN_LINES` dans `scanner.vue` reste fonctionnel. Audit obligatoire :
- Vérifier qu'aucun `//` traîne dans les lignes affichées (le `connecting to Tufts-2026 dataset` etc. doit rester sans préfixe `//`)
- Mettre à jour les lignes pour refléter le diagnostic 2D si pertinent (ex: `simulating LLM amplification curve` au lieu de `simulating LLM capability curve`)
- Cohérence avec le pivot : le `survival_check` peut rester (mot-clé partage), mais le verdict final doit afficher la nouvelle structure quadrant + scores.

### 5.5 OG image dynamique scanner (`Scanner.satori.vue`)

Image 1200×630 générée par satori côté serveur, accessible via la nouvelle URL pattern Nuxt OG image (probablement `/og-image/scanner-{slug}.png`).

**Contenu** :
- Background : `#0F0F0E` warm dark
- Sage rule top (80px en menthe `#6CE3B5`)
- Kicker mono caps : "DIAGNOSTIC IA · COMPTABLE" (substituer le label)
- Verdict big italic Playfair : "Tu mutes." (substituer selon quadrant)
- Sous-ligne mono : "72/100 risque · 75/100 levier IA"
- Matrix chip 200px positionné en bas à droite ou centré, avec quadrant actif highlight
- Sage rule bottom
- Logo + URL Survivant-IA (idem Default.satori.vue)

Space Mono reste embarqué pour satori (per le sous-projet 1 addendum 10.3.2). Inter et Playfair Italic via fonts.googleapis.

### 5.6 HomeDiagnosticTeaser update

Update les 4 lignes de `<div class="rep-field">` dans `app/components/HomeDiagnosticTeaser.vue` :

| Avant | Après |
|---|---|
| `SUJET` › en attente d'identification | (supprimer cette ligne — le label métier est implicite via la promesse "diagnostic IA en 10 secondes") |
| `RISQUE` › XX / 100 | `RISQUE` › XX / 100 (inchangé) |
| `HORIZON` › XX ans (2 · 5 · 10) | `LEVIER IA` › XX / 100 |
| `STATUT` › EN MUTATION SÉVÈRE (1 sur 4) | `QUADRANT` › TU MUTES (1 sur 4) |

L'effet redact (caractères masqués) est conservé sur RISQUE, LEVIER IA, et QUADRANT.

---

## 6. Conventions et règles éditoriales

À appliquer à toute nouvelle copy ou refactor de copy dans ce sous-projet :

1. **Pas de `//`** dans les kickers, labels, badges. Utiliser le composant `<KickerLabel>` (carré menthe + caps mono). Cf. `feedback_kicker_label.md` mémoire.
2. **Pas d'em-dashes** `—` dans la copy française. Remplacer par `:` (définition) ou `,` (incise).
3. **Verbes prioritaires** : `piloter`, `maîtriser`, `s'en servir`, `prendre le virage`, `muter`, `capitaliser`. Bannir : `ne pas se faire remplacer`, `chevaucher`, `méthode`.
4. **Tutoiement** partout (convention déjà établie sur le site).
5. **Cible explicite** : `salarié(s)` quand le contexte le permet. Sinon `tu` direct.
6. **Format leviers** : titre court Inter 18px gras (1 ligne) + description Inter 15px (1-2 phrases, max 280 chars). Source-grounded sur le catalogue des 22 articles quand pertinent.
7. **Nommage des quadrants** dans la copy : `TU TIENS`, `TU PILOTES`, `TU PIVOTES`, `TU MUTES` (caps mono). Le verdict dramatique reste en Playfair italic à la 2e personne : "Tu mutes.", "Tu pilotes.", etc. (avec le point final, c'est une déclaration).
8. **Pas de `formation` au singulier** sans qualification ("formations approfondies" est OK car pluriel + à venir, "formation IA" tout seul est interdit).

---

## 7. Découpage et phasing

### 7.1 Trois vagues parallélisables

**Vague 1 · Infra & data** (~1 jour avec parallélisation)
- Parallèle :
  - 6 batches d'agents pour l'heuristique baseline v1→v2 (32 jobs chacun)
  - 1 agent pour les ~50 overrides outliers
  - 1 agent pour les 12 fallback leviers de `quadrant-leviers.ts`
  - 1 agent pour l'extension de l'API Brevo + création des 5 attributs custom (à exécuter aussi côté Brevo manuellement par Mathieu)
- Séquentiel après : commit unifié avec le schéma migré et les 195 jobs annotés
- Rien de visible côté visiteur à ce stade — le scanner v1 tourne toujours

**Vague 2 · UI éditoriale** (~1.5 jours avec parallélisation)
- Parallèle :
  - 1 agent pour la création de `Scanner.satori.vue` (OG image dynamique)
  - 1 agent pour l'update de `HomeDiagnosticTeaser.vue`
  - 2-3 agents pour l'audit + réécriture des ~60 dynamiques défensives (par grappes sectorielles cohérentes). **Heuristique "défensive"** : la dynamique contient des termes comme `viseur`, `menacé`, `remplacé`, `obsolescence`, `disparaître` sans contrebalancer par un verbe transformatif (`piloter`, `muter`, `s'en servir`, `amplifier`). Si défensive, réécrire dans le ton transformatif sans tomber dans le creux ("opportunité géniale!"). Garder la lucidité du constat, pivoter sur l'action.
- Séquentiel : 1 agent dédié à la refonte de `app/pages/scanner.vue` (gros fichier, single-thread pour cohérence)
- Premier ship visible : scanner v2 live avec tous les leviers en fallback per-quadrant + OG image dynamique active

**Vague 3 · Leviers spécifiques** (~1 jour de génération + review au tempo Mathieu)
- Parallèle : 6-8 agents pour la rédaction des 585 leviers (195 jobs × 3), groupés par grappes sectorielles cohérentes pour limiter le drift de voix entre batches
- Style guide imposé en prompt à chaque agent :
  - Voix Survivant-IA (apostrophe + factuel, ≤ 280 chars description, source-grounded sur les 22 articles)
  - Format strict : titre 1-ligne Inter gras puis description 1-2 phrases concrètes
  - Mention d'outils réels (Pennylane, Claude, GitHub Copilot, etc.) plutôt que d'évocations vagues
  - Cohérence sectorielle au sein d'un même batch (un agent = un secteur, pas un mix juridique + tech + manuel)
- Séquentiel : Mathieu reviews et édite par batch de 30 jobs

### 7.2 Total estimé

**~3-4 jours réels** au lieu de 11 jours en mode séquentiel. Le bottleneck devient la review Mathieu, pas la génération.

---

## 8. Hors-scope (rappel et expansion)

**Pas dans ce sous-projet 2** :
- Routes statiques par métier (`/scanner/comptable`) — sous-projet 4 SEO
- Browse page `/metiers` — sous-projet 4 SEO
- FAQ schema par métier — sous-projet 4 SEO
- A/B test des CTA newsletter — itération séparée après data PostHog
- Création d'une page formations dédiée — quand les formations existent vraiment, ça devient son propre sous-projet
- Filtrage / browse / comparateur de métiers
- Production éditoriale d'articles à linker depuis l'écran résultat — dépend du stock de Rapports, hors scope ici
- Internationalisation (le scanner reste FR)
- Refonte du modal sources (`SourcesModal.vue`) — reste tel quel, déjà bon

---

## 9. Critères de validation

Le sous-projet 2 sera considéré comme livré quand :

- [ ] Schéma `Job` étendu avec `quadrant` + `potential` + `leviers` pour les 195 jobs
- [ ] `app/data/quadrant-leviers.ts` créé avec 4 entrées × 3 leviers chacune
- [ ] Brevo enrichi avec 5 attributs custom (`FORMATIONS_INTEREST`, `SCANNER_QUADRANT`, `SCANNER_JOB`, `SCANNER_RISK`, `SCANNER_LEVIER`)
- [ ] API serveur étend l'endpoint newsletter pour accepter et pousser ces attributs
- [ ] Hero éditorial centré (Playfair italic 88px verdict, scores discrets, dynamique 17px)
- [ ] Sections I/II/III avec sage rules de 80px en menthe et Roman numerals `— I.`/`— II.`/`— III.`
- [ ] Légende 4 quadrants en flex-list (pas en grid de boxes), quadrant actif highlighté avec marqueur "← toi"
- [ ] 3 leviers per-job affichés ; fallback per-quadrant si `Job.leviers.length === 0`
- [ ] Form newsletter intégré dans le scanner avec checkbox formations optionnelle
- [ ] OG image dynamique scanner (`Scanner.satori.vue`) avec quadrant + scores + label métier
- [ ] Animation terminal conservée, sans aucun `//` résiduel
- [ ] HomeDiagnosticTeaser updaté avec labels `RISQUE` / `LEVIER IA` / `QUADRANT`
- [ ] Tous les slugs v1 préservés (zéro régression URL — test grep diff vs `7f085b6:app/data/jobs.ts`)
- [ ] Build clean, copy purgée des `//` et des em-dashes
- [ ] PostHog tracking conservé (events `scanner_search_no_results`, `scanner_job_selected`, `scanner_scan_completed`)
- [ ] Mots bannis absents : `méthode`, `chevaucher`, `mardi`, `ne pas se faire remplacer` (sauf en titres SEO conservés stratégiquement)
- [ ] Aucune régression visuelle sur les autres pages du site (home, identité, frequence, rapports)

---

## 10. Risques et décisions reportées

| Risque | Mitigation |
|---|---|
| Drift de voix sur les 585 leviers générés en parallèle par 6-8 agents | Style guide rigoureux en prompt + grappes sectorielles cohérentes (un agent = un secteur) + review batch par batch par Mathieu |
| Bottleneck review Mathieu sur les 585 leviers | Livraison staggered : agents tournent en parallèle mais livrent un batch de 30 à la fois |
| Mapping v1→v2 sur les outliers manqué | La heuristique baseline couvre 80% des cas. Les 20% restants sont identifiés par audit Claude + override manuel par Mathieu si désaccord. |
| OG image dynamique satori complexe | Le pattern existe déjà (Default.satori.vue). On copie la structure, on adapte le contenu. Si blocage technique, on sort l'OG image en sous-projet 2.5. |
| Le score `potential` est subjectif et peut diverger de l'intuition utilisateur | C'est éditorial assumé. La légende "Lecture du cadran" explique chaque quadrant pour lever l'ambiguïté. Si feedback utilisateur massif sur des incohérences, on ajuste batch par batch. |
| Régression URLs sur slugs v1 | Test grep diff systématique. Pas de renommage. |
| L'animation terminal reste en registre "tech/hacker" alors que le site a pivoté éditorial | Décision validée : la signature scanner est cette animation, on ne la touche pas. Audit `//` seulement. |

---

## 11. Ce qui ne change pas

- Identité visuelle globale (warm dark + sage menthe + Playfair italic + Inter)
- Pile typographique (Inter + Playfair Display + system mono — pas de Space Mono front-end depuis le 2026-05-05)
- Univers sémantique de marque : Fréquence, Scanner, Rapports de Survie, Volumes, transmission chiffrée, RSS
- Tutoiement partout
- Animation terminal pendant le scan (signature)
- 22 sources dans `app/data/sources.ts`
- Modal sources (`SourcesModal.vue`)
- Slugs des 195 jobs (zéro renommage)
- PostHog instrumentation (tous les events conservés)

---

## 12. Prochaine étape

Plan d'implémentation détaillé via la skill `superpowers:writing-plans`. Le plan produira :

- La heuristique de mapping v1→v2 ligne par ligne sur les 195 jobs
- La liste des ~50 outliers à overrider manuellement avec leur quadrant + potential cibles
- Les 12 fallback leviers (4 quadrants × 3) rédigés
- Le découpage en 3 vagues d'implémentation avec tâches parallélisables identifiées
- Les style guides exacts pour les agents qui rédigeront les 585 leviers spécifiques
- Le découpage des grappes sectorielles pour limiter le drift de voix
