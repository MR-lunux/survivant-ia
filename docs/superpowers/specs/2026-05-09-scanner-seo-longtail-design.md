# Scanner SEO long-tail — Spec de design (sous-projet 4)

**Date** : 2026-05-09
**Statut** : spec validée par brainstorming, prête pour writing-plans
**Scope** : sous-projet 4 du repositionnement éditorial. Création de pages statiques par métier (`/scanner/[slug]`), browse page (`/metiers`), FAQ schema, et **suppression du gate** pour libérer le SEO et la viralité.

**Specs parents** :
- `docs/superpowers/specs/2026-05-04-pivot-editorial-design.md` (sous-projet 1)
- `docs/superpowers/specs/2026-05-07-scanner-v2-design.md` (sous-projet 2, livré)

---

## 1. Intention

Convertir l'actif data du Scanner v2 (196 métiers × scoring + dynamique + leviers + sources) en **surface SEO long-tail massive et indexable**. Aujourd'hui, les URLs `/scanner?job=X` ne sont pas indexées correctement par Google (query params), donc les 196 métiers représentent zéro trafic organique. Le sous-projet 4 corrige ça en créant 196 pages statiques canoniques + une browse page, le tout enrichi de contenu éditorial unique par métier (~1000-1200 mots).

**Trois bascules par rapport au Scanner v2** :

1. **De l'interactif au statique** — chaque métier devient une URL canonique (`/scanner/[slug]`) prerenderée, avec OG image dynamique propre, JSON-LD riche, et FAQ accordions visibles dans le DOM serveur.
2. **De la conversion gated à l'ouverture totale** — le gate newsletter (qui bloquait l'accès au résultat dans Scanner v2) est retiré. Le form newsletter passe en footer de la page, optionnel. Logique : à zéro trafic, le gate est pure friction qui empêche le partage et l'indexation. Quand le trafic justifiera de re-gater, la fonctionnalité sera réactivable (`ScannerGate.vue` conservé mais débranché).
3. **D'un asset défensif à un cluster éditorial** — chaque page métier devient un mini-article (~1000-1200 mots) avec hero + matrice + leviers + 3 angles éditoriaux (contexte sectoriel, trajectoire concrète, anticipation 2026-2030) + FAQ + métiers similaires + articles thématiques + form. C'est une vraie surface de contenu, pas juste un résultat de scan exposé.

---

## 2. Cible

Identique aux sous-projets précédents : **salarié non-tech, en poste**, qui sent l'IA arriver sur son métier. Mais le sous-projet 4 capture deux **intentions de recherche** distinctes :

- **Intention 1 — Recherche froide via Google** : "comptable IA risque", "métiers menacés par l'IA finance", "se former IA pour comptable". Visiteur en mode info-gathering, atterrit sur `/scanner/comptable` directement. Lit, peut-être s'inscrit à la newsletter en footer, peut-être pas. Le SEO est la priorité.
- **Intention 2 — Exploration sectorielle** : visiteur curieux qui veut voir l'éventail des métiers couverts, atterrit sur `/metiers`, scroll/recherche, clique vers son métier. Plus engagé. La browse page nourrit l'intention 2 et redirige vers les pages métier.

L'intention 3 (test perso émotionnel) reste capturée par `/scanner` interactif tel qu'aujourd'hui, mais sans gate.

---

## 3. Décisions de design (validées en brainstorming)

| Décision | Choix retenu |
|---|---|
| URL pattern statique | `/scanner/[slug]` (cohérent avec le namespace Scanner) |
| URL browse page | `/metiers` (namespace propre) |
| Backward compat `/scanner?job=X` | URLs coexistent. Interactive garde son flow. Canonical link → `/scanner/[slug]` |
| Gate sur l'interactive | **Retiré**. Form newsletter en footer Section VI à la place |
| Profondeur éditoriale par page | ~1000-1200 mots avec 3 angles éditoriaux + FAQ + similaires |
| 3 angles éditoriaux | Contexte sectoriel + Trajectoire concrète + Anticipation 2026-2030 |
| FAQ par page | 5 Q/A, mix universal + spécifique, accordions HTML + JSON-LD FAQPage |
| Métiers similaires | 4-5 du même secteur, triés par proximité de risk |
| Articles thématiques | Tag-based filtering sur `secteurs` du frontmatter rapport, conditionnel (cachée si zéro match) |
| Production éditoriale | 7 agents rédacteurs (1 par grappe sectorielle) + 1 reviewer agent post-grappe |
| Browse organisation | Par secteur (7 sections), sortées par volume de jobs descendant |
| Sitemap | Auto-discovery via `crawlLinks: true` + routeRules priorities |
| Prerender | Build-time pour les 196 + 1 routes (no cold start) |
| Brand visuel | Cohérent avec Editorial Dark v2 (sage menthe, Playfair italic, Inter, system mono) |

---

## 4. Architecture

### 4.1 Routes ajoutées

| Route | Type | Rôle |
|---|---|---|
| `/scanner` | existante (refactor) | Scanner interactif **sans gate**. Form newsletter en footer Section VI. |
| `/scanner?job={slug}` | existante | Pre-load. Canonical → `/scanner/{slug}` |
| `/scanner/[slug]` | **nouvelle** | Page statique enrichie SEO (~1000-1200 mots) |
| `/metiers` | **nouvelle** | Browse page — search bar + 7 sections sectorielles |

### 4.2 Schema `Job` étendu

```ts
export type JobSecteur =
  | 'cognitif-admin-finance-juridique'
  | 'tech-data-design'
  | 'marketing-comm-management'
  | 'sciences-ingenierie'
  | 'sante-care-education'
  | 'manuels-artisanat-transport'
  | 'juridique-extra-securite-divers'

export interface Job {
  // ... champs existants Scanner v2
  secteur: JobSecteur     // nouveau
}
```

Le mapping slug → secteur est dérivé mécaniquement des 7 grappes éditoriales utilisées en Vague 3 du Scanner v2 (source de vérité = le découpage déjà appliqué). Une fois écrit dans `jobs.ts`, la liste des métiers similaires devient calculable :

```ts
function getSimilarJobs(current: Job, limit = 5): Job[] {
  return JOBS.filter(j => j.secteur === current.secteur && j.slug !== current.slug)
             .sort((a, b) => Math.abs(a.risk - current.risk) - Math.abs(b.risk - current.risk))
             .slice(0, limit)
}
```

### 4.3 Schema `Rapport` (frontmatter Markdown étendu)

```yaml
---
title: "..."
date: "..."
secteurs: ['cognitif-admin-finance-juridique', 'tech-data-design']  # nouveau, optionnel, multi-valeur
tags: ['ia', 'pivot', 'comptabilité']                                # nouveau, optionnel, libre
---
```

Sur la page `/scanner/[slug]`, query :

```ts
const articlesThematiques = await queryCollection('rapports')
  .where({ secteurs: { $contains: job.secteur } })
  .order('date', 'DESC')
  .limit(3)
  .all()
```

Section "Articles thématiques" affichée seulement si `articlesThematiques.length > 0`.

### 4.4 Sitemap & prerender

Configuration `nuxt.config.ts` étendue :

```ts
sitemap: {
  autoLastmod: true,
  defaults: { changefreq: 'monthly', priority: 0.6 },
},
routeRules: {
  // ... existants
  '/scanner/**': { sitemap: { priority: 0.8, changefreq: 'monthly' } },
  '/metiers':    { sitemap: { priority: 0.85, changefreq: 'monthly' } },
},
nitro: {
  prerender: {
    crawlLinks: true,
    routes: [
      // ... existants
      '/metiers',
      // Les 196 routes /scanner/[slug] sont découvertes automatiquement via crawlLinks
      // depuis /metiers (qui linke vers chaque métier)
    ],
  },
},
```

Toutes les pages générées en static au build → aucun cold start, perf max, pas de coût Vercel runtime.

### 4.5 Composants Vue à créer

| Composant | Rôle | Reuse |
|---|---|---|
| `app/pages/scanner/[slug].vue` | Page métier statique (route dynamique Nuxt) | reuse logique render scanner v2 result + 3 nouvelles sections |
| `app/pages/metiers/index.vue` | Browse page | nouveau, indépendant |
| `app/components/MetierCard.vue` | Card minimaliste sur browse + section similaires | nouveau, reusable |
| `app/components/MetierEditorialSection.vue` | Bloc des 3 angles éditoriaux concaténés | nouveau |
| `app/components/MetierFAQ.vue` | Accordions + JSON-LD FAQPage | factorisable avec HomeFaq.vue |
| `app/components/MetierArticles.vue` | Liste articles thématiques (conditionnelle) | nouveau |
| `app/components/MetierSimilaires.vue` | Bloc métiers similaires | utilise MetierCard |
| `app/components/OgImage/Metier.satori.vue` | OG dynamique des pages métier statiques | adaptation de Scanner.satori.vue |

---

## 5. UX & layout

### 5.1 Layout `/scanner/[slug]`

```
┌─────────────────────────────────────────────────────┐
│ AUTHOR BANNER (E-E-A-T)                              │
│ • "Par Mathieu Rerat · Deputy Head of IT"           │
│ • "Mis à jour le {dateModified}"                    │
├─────────────────────────────────────────────────────┤
│ HERO                                                 │
│ • Kicker "Diagnostic IA · Comptable"                │
│ • H1 italique Playfair "Tu mutes." (88px)           │
│ • Scores risque · levier IA (mono caps)             │
│ • Dynamique narrative                                │
├─────────────────────────────────────────────────────┤  sage rule
│ — I. Position dans le cadran                         │
│ • Matrice chip 160px + légende flex-list            │
├─────────────────────────────────────────────────────┤  sage rule
│ — II. Tes leviers cette semaine                      │
│ • Intro Playfair italic                              │
│ • 3 leviers numérotés 01/02/03                      │
├─────────────────────────────────────────────────────┤  sage rule
│ — III. Pourquoi ton métier mute (variant quadrant)  │
│ • Angle 1 : Contexte sectoriel (~200 mots)          │
│ • Angle 2 : Trajectoire concrète (~250 mots)        │
│ • Angle 3 : Anticipation 2026-2030 (~200 mots)      │
├─────────────────────────────────────────────────────┤  sage rule
│ — IV. Questions fréquentes                           │
│ • 5 accordions <details> + JSON-LD FAQPage          │
├─────────────────────────────────────────────────────┤  sage rule
│ — V. Pour aller plus loin                            │
│ • Articles thématiques (conditionnel ≥1)            │
│ • Métiers similaires (4-5 du même secteur)          │
├─────────────────────────────────────────────────────┤  sage rule
│ — VI. La suite                                       │
│ • Headline italic "Reste un cran devant."           │
│ • Form email + bouton + checkbox formations         │
├─────────────────────────────────────────────────────┤  sage rule fade
│ Footer actions : ↗ Sources · ⎘ Copier · ↻ Tester    │
└─────────────────────────────────────────────────────┘
```

Variations du H1 selon quadrant : "Tu mutes." (mutes) / "Tu pilotes." (pilotes) / "Tu tiens." (tiens) / "Tu pivotes." (pivotes).

Variations du sous-titre Section III selon quadrant :
- mutes : "Pourquoi ton métier mute"
- pilotes : "Pourquoi tu es bien placé"
- tiens : "Pourquoi ton métier tient"
- pivotes : "Pourquoi tu dois anticiper"

### 5.2 Layout `/metiers`

```
┌─────────────────────────────────────────────────────┐
│ HERO                                                 │
│ • Kicker "MÉTIERS COUVERTS"                          │
│ • H1 italic "Les 196 métiers que Survivant-IA       │
│   analyse."                                          │
│ • Sous-titre "Cherche le tien ou explore par        │
│   secteur."                                          │
├─────────────────────────────────────────────────────┤
│ SEARCH BAR                                           │
│ • Filter live by name (instant)                     │
│ • Highlight matches dans les sections                │
├─────────────────────────────────────────────────────┤
│ 7 SECTIONS SECTORIELLES (ordre par volume desc)      │
│   - Manuels / artisanat / transport (~38)           │
│   - Cognitif / admin / finance / juridique (~36)    │
│   - Marketing / comm / management (~28)             │
│   - Santé / care / éducation (~27)                  │
│   - Tech / data / design (~26)                      │
│   - Sciences / ingénierie (~20)                     │
│   - Juridique-extra / sécurité / divers (~18)       │
│                                                      │
│   Chaque section :                                   │
│   • Section heading + count                         │
│   • Grid 3-4 cols de MetierCard cliquables          │
├─────────────────────────────────────────────────────┤
│ FOOTER CTA                                           │
│ "Pas trouvé ton métier ? Tente le diagnostic        │
│  interactif → /scanner"                             │
└─────────────────────────────────────────────────────┘
```

### 5.3 MetierCard (utilisée sur `/metiers` ET dans la section "Similaires")

```
┌──────────────────────────┐
│ Comptable                │   ← H3 sans-serif Inter
│ ▎TU MUTES · 72%          │   ← badge mono caps avec couleur quadrant
└──────────────────────────┘
↳ click → /scanner/comptable
```

Style minimaliste, hover state subtil (border accent menthe), pas d'image, pas d'icône. Cohérent avec brand v2.

### 5.4 OG image dynamique pour les pages métier

`Metier.satori.vue` reprend la structure de `Scanner.satori.vue` mais adaptée aux pages statiques :
- Fond warm dark `#0F0F0E`
- Sage rule top
- Kicker "Diagnostic IA · Comptable"
- H1 italic "Tu mutes." (Playfair)
- Scores risque/levier
- Sage rule bottom
- Logo + URL `survivant-ia.ch/scanner/comptable`

Énorme levier de partageabilité LinkedIn / WhatsApp.

---

## 6. Production de contenu

### 6.1 Volume

| Type | Volume | Effort |
|---|---|---|
| Champ `secteur` per-job | 196 entrées (mécanique) | mineur |
| 3 angles éditoriaux per-job | 196 × ~650 mots = ~127k mots | gros |
| 5 FAQ Q/A per-job | 196 × 5 = 980 questions/réponses | gros |
| Tags + secteurs sur 2 rapports existants | 2 entrées | mineur |
| **Total mots éditoriaux uniques** | **~150k mots** | **très gros** |

### 6.2 Pipeline de production

**Étape 1 · Migration mécanique** (~1 jour)

- Ajout du champ `secteur` aux 196 entrées (script déduit du mapping grappe-sectoriel établi en Vague 3 du Scanner v2)
- Ajout des frontmatters `secteurs` + `tags` aux 2 rapports existants
- Création des 8 nouveaux composants Vue (squelettes + styles)
- Routes `/scanner/[slug].vue` et `/metiers/index.vue`
- Composant `Metier.satori.vue` (OG dynamique)
- Sitemap + prerender + canonicals + PostHog instrumentation

**Étape 2 · Production éditoriale par grappes** (~2 jours, séquentiel)

7 grappes sectorielles × 1 agent rédacteur (sequential, pas parallel — single-thread sur le file pour éviter conflits, comme Vague 3 Scanner v2) :

| Grappe | Jobs | Mots produits |
|---|---|---|
| A — Cognitif/admin/finance/juridique | ~36 | ~29k |
| B — Tech/data/design | ~26 | ~21k |
| C — Marketing/comm/management | ~28 | ~22k |
| D — Sciences/ingénierie | ~20 | ~16k |
| E — Santé/care/éducation | ~27 | ~22k |
| F — Manuels/artisanat/transport | ~38 | ~30k |
| G — Juridique-extra/sécurité/divers | ~18 | ~14k |
| **Total** | **193 mappés directement** (les 3 jobs restants sont rattachés à la grappe la plus proche pendant la migration §9.1) | **~154k** |

Chaque agent rédige pour ~25-38 jobs :
- 3 angles éditoriaux (~650 mots/job)
- 5 questions/réponses FAQ (~150 mots/job)
- = ~800 mots de contenu unique par job

**Étape 3 · QA reviewer agent par grappe**

Après chaque grappe livrée, **un agent reviewer dédié** lit le diff et flagge :
- Drift de voix entre les jobs de la grappe (incohérence de tonalité)
- Répétition mécanique > 30% entre paragraphes (cas où les agents copient-collent une structure)
- Mots bannis (`méthode`, `chevaucher`, `viseur` non-contrebalancé)
- Affirmations factuelles non sourcées (chiffres invoqués sans data précise)
- Format strict respecté (longueurs des angles, structure FAQ)
- Présence des minimas obligatoires : 2 chiffres précis + 1 lien sortant + 1 outil nommé par page

Le reviewer ne corrige pas — il rapporte. Mathieu lit le rapport et décide :
- Validation et passage à la grappe suivante
- Relance ciblée du rédacteur sur les jobs flaggés

### 6.3 Style guide imposé aux rédacteurs

```
Voix Survivant-IA :
- Tutoiement, direct, terrain
- Pas de jargon, pas de creux ("opportunité géniale!", "embrace the future")
- Lucide sur le constat, transformatif sur l'action
- Verbes prioritaires : piloter, maîtriser, automatiser, intégrer, basculer, capitaliser, repositionner
- Mots bannis : méthode, chevaucher, viseur (sauf si suivi immédiat d'un verbe transformatif)

Format :
- Angle 1 (Contexte sectoriel) : ~200 mots, 1-2 chiffres précis du catalogue sources, registre journalistique
- Angle 2 (Trajectoire concrète) : ~250 mots, vignette ancrée dans des outils réels et pratiques sectoriels (pas de fabulation, ancrer dans des données ou exemples réalistes)
- Angle 3 (Anticipation 2026-2030) : ~200 mots, 3-5 signaux faibles spécifiques au secteur, tendances outils, pivots émergents
- FAQ : 5 Q/A, questions Inter sans-serif, réponses 2-4 phrases avec data précise

Apostrophes échappées : \\' dans les strings TypeScript ou backticks selon le contexte.

Cohérence sectorielle : un agent = une grappe = des outils sectoriels cohérents (Pennylane pour la finance, Cursor pour le dev, AlphaFold pour la bio, etc.). Pas de mélange des contextes.

Source-grounding strict : chaque page DOIT contenir au moins 2 chiffres tirés du catalogue des 22 sources Survivant-IA, 1 lien sortant vers une source du catalogue, 1 mention d'outil réel et nommé.
```

---

## 7. SEO long-tail mitigations (anti-pénalité Google)

Le risque #1 : Google flagge les pages comme "AI-generated content low quality". 7 mitigations ajoutées :

### 7.1 Auteur identifié + Person schema

Chaque page affiche en haut :
```
Par Mathieu Rerat · Deputy Head of IT · Mis à jour le {dateModified}
```

JSON-LD `Article` avec `author: Person` (Mathieu, déjà sourcé sur `/identite`) + `dateModified` réel. Signal E-E-A-T fort (humain identifiable + parcours vérifiable + fraîcheur).

### 7.2 Source-grounding obligatoire et vérifiable

Chaque page DOIT contenir au minimum :
- 2 chiffres précis tirés du catalogue des 22 sources (ex : "L'index Tufts évalue à 72% l'exposition", "Goldman Sachs anticipe -28% des effectifs juniors")
- 1 lien sortant vers une source du catalogue (Tufts, McKinsey, WEF, Goldman Sachs, LinkedIn, etc.)
- 1 mention d'outil réel et nommé (Pennylane, Claude, Cursor, AlphaFold, etc.)

Le reviewer agent vérifie ces minimas. Si une page n'en a pas, on relance le rédacteur sur cette page.

### 7.3 Variation sectorielle ET métier-spécifique enforced

L'Angle 2 (trajectoire concrète) doit citer des outils ET des situations propres au métier. Le reviewer compare les pages d'une même grappe et flagge tout chevauchement de structure ou de phrasing > 30%.

La FAQ doit avoir au moins 3 questions sur 5 spécifiques au métier (ex : "Quels outils IA un comptable doit-il maîtriser en 2026 ?" est spécifique ; "Combien de temps me reste-t-il avant que l'IA prenne mon poste ?" est universelle).

### 7.4 Schema markup riche par page

Sur chaque `/scanner/[slug]` :
- `Article` (avec author, datePublished, dateModified, headline, description, articleBody)
- `Person` (Mathieu comme auteur, sourcé via `@id`)
- `BreadcrumbList` (Accueil → Scanner → {Métier})
- `FAQPage` (les 5 Q/A)
- `mentions` qui pointe vers les sources externes citées

Google voit "vrai article + vrai auteur + vraies sources" et te traite comme un publisher éditorial.

### 7.5 Pas de pages "thin"

Même les métiers low-traffic (artificier, opérateur de crématorium, etc.) doivent avoir leurs ~1000 mots avec contenu spécifique. Pas de "ton métier est protégé, fin de l'histoire". Le reviewer flagge toute page < 700 mots de contenu utile (hors leviers et matrice qui sont communs).

### 7.6 Plan d'amélioration itératif post-launch

À 4 semaines après le déploiement, audit PostHog des top 20 pages → Mathieu édite ces 20 manuellement avec :
- Témoignages réels (ses 9 ans en transformation digitale, anecdotes terrain)
- 1-2 phrases personnelles qui montrent qu'il est passé par là
- Liens vers articles que Mathieu aura publiés entre-temps

Ces 20 pages premium servent de proof points pour Google ("high quality cluster" qui légitimisent le reste du cluster).

### 7.7 Mention IA-as-tool, pas IA-as-author

Pas de "écrit par une IA" en bas (ça serait du shooting in foot). Mais aussi pas de mensonge : Mathieu reste l'auteur signataire (designeur, superviseur, validateur). C'est sa voix éditoriale, juste accélérée par l'IA — ce qui est cohérent avec le pivot du site (`piloter l'IA`).

---

## 8. Instrumentation PostHog

### 8.1 Events à capturer manuellement

| Event | Quand | Properties |
|---|---|---|
| `metier_page_viewed` | À chaque visite d'une page `/scanner/[slug]` | slug, quadrant, secteur, risk, potential, referrer |
| `metier_similar_clicked` | Click sur un métier dans le bloc "Similaires" | from_slug, to_slug, from_secteur |
| `metier_faq_opened` | Click sur un accordion FAQ | slug, question_index, question_text |
| `metier_article_clicked` | Click sur un article thématique | from_slug, article_slug |
| `metiers_browse_search` | Saisie dans le search bar | query, results_count |
| `metiers_browse_secteur_clicked` | Click sur un métier depuis browse | secteur, slug |
| `newsletter_subscribed_from_metier_page` | Signup depuis form Section VI | slug, quadrant, secteur, formations_interest |
| `newsletter_subscribed_from_scanner` | (existant, conservé) | (idem v2) |

### 8.2 Enrichissement des $pageview

Sur `/scanner/[slug]`, enrichir le `$pageview` automatique avec les properties : `metier_slug`, `metier_quadrant`, `metier_secteur`, `metier_risk`, `metier_potential`. Permet la segmentation directe dans le dashboard PostHog.

### 8.3 Funnels post-launch à monter

1. **Browse → métier → newsletter** : `/metiers` → `metier_page_viewed` → `newsletter_subscribed_from_metier_page`
2. **Métier → article** : `metier_page_viewed` → `metier_article_clicked` → `$pageview` sur l'article
3. **Métier → métier similaire** : `metier_page_viewed` → `metier_similar_clicked` → `metier_page_viewed` (next)

### 8.4 Reporté post-launch

- Cohorte VIP "métier checked X fois" pour relance newsletter
- A/B test sur l'ordre des sections
- Heatmaps PostHog session recordings sur top trafic

---

## 9. Phasing et déploiement

### 9.1 Trois vagues séquentielles

**Vague 1 · Infrastructure** (~1 jour)
- Migration mécanique (champ `secteur`, frontmatters rapports)
- Création des 8 composants Vue (avec contenu stub par défaut = scanner v2 sans angles ni FAQ)
- Routes statiques + browse page fonctionnelle
- Sitemap + prerender + canonicals + PostHog instrumentation
- **Suppression du gate** : `ScannerGate.vue` débranché du flow `/scanner` (composant conservé, juste plus appelé). Form newsletter restauré dans Section VI du résultat.
- Lien "Voir tous les métiers →" depuis la home (footer ou section dédiée)

À ce stade, les pages `/scanner/[slug]` sont opérationnelles avec contenu = scanner v2 actuel (matrice + leviers + sources) **sans** les 3 angles éditoriaux ni FAQ. Indexables par Google dès le déploiement.

**Vague 2 · Contenu éditorial** (~2 jours, séquentiel par grappe)
- 7 grappes × 1 agent rédacteur (3 angles + 5 FAQ par job)
- 7 grappes × 1 agent reviewer (QA voix/répétition/format/source-grounding)
- Validation Mathieu entre chaque grappe
- Commits groupés par grappe

**Vague 3 · QA finale + déploiement** (~0.5 jour)
- Vérification de tous les JSON-LD via Google Rich Results Test (Article + FAQPage + BreadcrumbList)
- Spot-check visuel sur 8 pages (2 par quadrant) + browse page
- Test Lighthouse SEO (mobile + desktop, score > 95)
- Test redirection canonicals (`/scanner?job=X` → canonical pointe vers `/scanner/X`)
- Confirmation des PostHog events end-to-end (devtools network)
- Déploiement Vercel + soumission sitemap à Google Search Console
- Mise en place d'un dashboard PostHog "Scanner SEO" avec les 3 funnels

### 9.2 Total estimé

**~3-4 jours réels** (avec validation Mathieu intercalée). Bottleneck = bande passante de review.

---

## 10. Hors-scope

- **Articles thématiques massifs** : la production de rapports reste un sous-projet séparé. Le sous-projet 4 ne fait que wirer le filtrage tag-based.
- **Filtres avancés sur la browse** : pas de filtres "par quadrant", "par risk range", "par horizon" pour l'instant. Search bar + sections par secteur uniquement.
- **Hreflang international** : scanner reste FR-CH only.
- **Schemas additionnels** au-delà d'Article + Person + BreadcrumbList + FAQPage + mentions.
- **A/B testing layout** : reporté post-launch après data PostHog.
- **Refonte du scanner interactive** au-delà de la suppression du gate.
- **Réécriture des leviers existants** : les 588 leviers de Vague 3 Scanner v2 restent tels quels.
- **Optimisation perf** au-delà de la baseline (prerender + system fonts).

---

## 11. Critères de validation

Le sous-projet 4 sera considéré comme livré quand :

- [ ] `secteur` field présent sur tous les 196 jobs (validation de cohérence avec les grappes éditoriales)
- [ ] Routes `/scanner/[slug]` (× 196) et `/metiers` répondent en 200 OK
- [ ] Sitemap contient les 197 nouvelles URLs (vérification via `curl /sitemap.xml`)
- [ ] Pages métier ont les 6 sections éditoriales : hero, position, leviers, 3 angles, FAQ, similaires + articles, form newsletter
- [ ] Browse page a les 7 sections sectorielles + search bar fonctionnelle
- [ ] Gate retiré du flow `/scanner` interactif (form newsletter restauré en Section VI)
- [ ] FAQ JSON-LD valide sur Google Rich Results Test (5 questions par page)
- [ ] Article + Person + BreadcrumbList JSON-LD valides
- [ ] OG image dynamique fonctionne sur les pages métier statiques (preview LinkedIn correct)
- [ ] PostHog events instrumentés (8 events listés en §8.1)
- [ ] Tous les slugs Scanner v2 préservés (zéro régression URL — test grep diff)
- [ ] Build clean, copy purgée des `//`, mots bannis absents
- [ ] Auteur byline visible sur toutes les pages métier (E-E-A-T)
- [ ] Au moins 5 spot-checks visuels validés par Mathieu sur des métiers de quadrants différents
- [ ] Sitemap soumis à Google Search Console
- [ ] Canonical link `/scanner?job=X` → `/scanner/X` testé

---

## 12. Risques

| Risque | Mitigation |
|---|---|
| Drift de voix sur 196 × 800 mots produits par 7 agents | QA reviewer agent par grappe + validation Mathieu inter-grappes + style guide rigoureux |
| Google flag les pages comme "AI-generated content low quality" | 7 mitigations §7 : auteur identifié + Person schema + source-grounding strict + variation sectorielle enforced + schema riche + pas de pages thin + plan iteratif post-launch + IA-as-tool |
| Volume éditorial fait grossir le bundle JS | Contenu en static prerendered, aucun impact bundle JS. CSS scoped par composant. |
| Articles thématiques quasi-absents pendant longtemps | Section affichée conditionnellement (cachée si zéro match) — pas de page vide |
| Régression sur le scanner interactif (gate enlevé, layout changé) | Tests grep slugs + spot-check 4 quadrants + smoke test browser + preserve `ScannerGate.vue` débranché pour réactivation future |
| Perte de conversion newsletter (gate retiré) | Form en Section VI footer + checkbox formations + tracking PostHog du taux de conversion par métier pour adjustments futurs |
| 3 jobs sans grappe attribuée (la production de Vague 3 Scanner v2 a couvert 193/196) | Le mapping `secteur` doit explicitement les rattacher à une grappe lors de la migration mécanique en Vague 1 |
| Pages prerendered qui pèsent au build | 196 + 1 routes prerendered : ajoute ~30s au build Vercel, acceptable. Si problème, fallback sur on-demand SSG. |

---

## 13. Ce qui ne change pas

- 196 slugs préservés (zéro renommage, zéro régression URL)
- Identité visuelle Editorial Dark + sage menthe + Playfair italic + Inter + system mono
- Composants existants : `SourcesModal.vue`, `HomeFaq.vue`, `Default.satori.vue`, `Scanner.satori.vue`
- 22 sources dans `app/data/sources.ts`
- 588 leviers spécifiques (Scanner v2 Vague 3) inchangés
- Brevo schema (5 attributs custom déjà créés)
- PostHog events Scanner v2 conservés
- Tutoiement, voix Survivant-IA, mots bannis du sous-projet 1

---

## 14. Prochaine étape

Plan d'implémentation détaillé via la skill `superpowers:writing-plans`. Le plan produira :
- Mapping mécanique slug → secteur pour les 196 jobs
- Découpage des composants Vue avec interfaces et props
- Pipeline détaillé Vague 1 / Vague 2 (par grappe) / Vague 3
- Style guide complet pour les agents rédacteurs
- Style guide pour l'agent reviewer
- Liste des 8 events PostHog avec leur shape de properties
- Checklist QA finale
