# Mathieu le Survivant de l'IA — Design Spec
**Date initiale** : 2026-04-25
**Dernière mise à jour DA** : 2026-05-03 (V2 Editorial Dark)
**Statut** : Approuvé · DA V2 en production sur la home

> **Note** : la DA a évolué le 2026-05-03 du « Brutalisme Corporatif Post-Apo »
> (vert Matrix #00FF41, Space Mono partout, terminal/scanline) vers
> « Editorial Dark » (sage #5BA37A, Playfair Display italic + Source Serif 4,
> mastheads magazine numérotés en romain). La section *Direction Artistique*
> ci-dessous a été remplacée par la V2. Les autres sections (vision, stack,
> structure, SEO, contraintes) restent valides.

---

## Vision

Aider les professionnels français à ne pas se faire remplacer par l'IA en développant leurs soft skills et leur compréhension des algorithmes. Positionnement : guide humain et pragmatique — pas un expert tech, pas un alarmiste.

**Audience cible** : Employés "cols blancs" francophones qui ont peur pour leur poste, qui veulent des outils concrets et accessibles, sans jargon technique.

**Tagline concept** : "L'IA ARRIVE. NE SOYEZ PAS UNE VARIABLE SUPPRIMÉE."

---

## Phase 1 — Ce qu'on construit

| Fonctionnalité | Description |
|---|---|
| Site post-apo distinctif | Design "Brutalisme Corporatif Post-Apo", sombre, professionnel |
| Blog SEO | Articles pratiques sur soft skills et comprendre l'IA |
| Hub de contenu | Centralise les posts LinkedIn, Instagram, YouTube Shorts |
| Newsletter automatique | Nouvel article → Brevo envoie automatiquement via RSS |
| Formulaire d'inscription | Capture emails visiteurs ("Rejoindre la Fréquence") |
| Liens réseaux sociaux | LinkedIn, Instagram, YouTube dans le footer/header |
| SEO optimisé | Sitemap auto, balises, indexation Google |
| Stats newsletter | Dashboard Brevo : ouvertures, clics, heatmap |
| Scroll tracking | Microsoft Clarity : où les lecteurs décrochent |

## Phase 2 — Plus tard (quand ~300 abonnés)

| Fonctionnalité | Description |
|---|---|
| Système de grades | XP, niveaux façon Ken le Survivant |
| Diplôme de Survivor | Parcours de formation payant |
| Monétisation | Brevo automation triggers pour vente |

---

## Stack Technique

| Outil | Rôle | Coût |
|---|---|---|
| Nuxt 3 + TailwindCSS | Site, design, structure pages | Gratuit |
| Nuxt Content | Gestion articles en markdown | Gratuit |
| `@nuxtjs/seo` | Sitemap auto, balises SEO, canonical | Gratuit |
| Vercel | Hébergement + déploiement auto sur commit | Gratuit |
| Brevo | Newsletter + automations + stats + RSS-to-email | Gratuit |
| LinkedIn Newsletter | Top of funnel, découverte audience FR | Gratuit |
| Google Search Console | Indexation Google, suivi positions | Gratuit |
| Microsoft Clarity | Scroll tracking, heatmap visiteurs | Gratuit |
| Nom de domaine | survivant-ia.fr ou similaire | ~10€/an |

**Coût total : ~10€/an**

---

## Direction Artistique — V2 « Editorial Dark » (2026-05-03)

L'ambiance : magazine éditorial sobre sur fond sombre chaud. Sérieux et durable, pas gamer ni cyberpunk. La signature visuelle se joue dans la typo (Playfair italic en climax + Source Serif 4 en lecture) et dans les mastheads numérotés en chiffres romains qui rythment la page comme des sections de magazine.

### Palette de couleurs

Tokens définis dans `app/assets/css/main.css` (consommer via `var(--token)` partout, jamais de hex en dur dans les composants).

| Token | Valeur | Usage |
|---|---|---|
| `--color-bg` | `#0F0F0E` | Fond principal (warm dark, jamais pur noir) |
| `--color-surface` | surface élevée | Cards, profil, swiss-cta, footer |
| `--color-surface-2` | surface niveau 2 | Hover surface |
| `--color-text` | clair | Corps de texte, titres |
| `--color-text-soft` | adouci | Body court, captions |
| `--color-muted` | gris muted | Métas, descriptions secondaires |
| `--color-muted-soft` / `--color-dim` | très muted | Placeholders italic, copyright |
| `--color-rule` | hairline sage léger | Bordures de sections, hairlines de listes |
| `--color-hairline` / `--color-hairline-strong` | hairline neutre | Sub-rules dans listes denses, profil card |
| `--color-accent` | `#5BA37A` (sage) | Mots-clés italic, numéros romains, hairlines actives, CTAs |
| `--color-accent-soft` | sage atténué | Glow hover, ombres CTA |
| `--color-accent-glow` | sage très atténué | Backgrounds très subtils |
| `--color-danger` | rouge | Erreurs formulaire (`.nl-error`) |
| `--color-mutation` / `--color-protege` / `--color-croissance` | inchangés | Statuts diagnostic scanner |

**Anti-pattern** : ne jamais réintroduire `#00FF41`, `rgba(0, 255, 65, …)` ou des dégradés vert Matrix dans le code home. Pour les pages V1 encore en cyberpunk (`/scanner`, `/identite`, `/rapports`, `/frequence`), c'est attendu — la migration vers V2 est un travail à venir.

### Typographie

Chargée via `@nuxt/fonts` dans `nuxt.config.ts`.

| Usage | Police | Tokens CSS | Réglages |
|---|---|---|---|
| Climax éditorial (taglines, h2 chapeaux, citations, numéros romains) | **Playfair Display** | `--font-serif` | `font-style: italic` + `font-variation-settings: "opsz" 144` (pour le punch optique aux grandes tailles) |
| Lecture (lead, body articles, FAQ answers, byline) | **Source Serif 4** | `--font-serif-body` | Régulier 400 / italic 400 |
| Eyebrows, labels, CTAs, méta éditoriale, navigation | **Inter** | `--font-sans` | 500/600 caps + letter-spacing 0.1–0.18em |
| Codes, numéros techniques, métadonnées (dates, sections, count meta) | **Space Mono** | `--font-mono` | Caps + letter-spacing 0.18em |

Contraste intentionnel : **Playfair italic = la voix humaine, le climax**. **Source Serif 4 = la lecture posée**. **Inter caps = le repère structurel**. **Mono = le timestamp / tag technique**. Ne pas mélanger les rôles (ex : ne jamais utiliser Mono pour un titre de section, ni Playfair pour une métadonnée).

### Patterns signatures

- **Pattern brand Survivant-IA** : alternance Inter caps (eyebrow) + Playfair italic (mot-clé accent). Exemple : `LA FRÉQUENCE` (Inter caps sage) → `Reste un cran devant.` (Playfair italic, *cran devant* en italic accent sage).
- **Hairline + spot sage** : eyebrow accompagnée d'une barre 28px × 1px sage à gauche (`::before`). Voir `.skills-eyebrow`, `.newsletter-eyebrow`.
- **Mastheads numérotés** (`HomeMasthead.vue`) : chiffre romain Playfair italic 4rem sage à gauche + h2 serif au centre + meta Mono caps muted à droite, encadré par hairlines sage. Numérotation continue sur la home (II Manifeste · IV Compétences · V Rapports · VI FAQ — III réservé pour quand le diagnostic teaser sera migré).
- **Liste éditoriale** (cf. `HomeSkillsList.vue`, `RapportsBookshelf.vue`) : grille colonnes `numéro / label / contenu`, hairlines top + bottom + entre items, padding-left au hover + petit trait sage qui pousse depuis la gauche (effet trait de plume).
- **Italic accent dans un titre** : un mot-clé en `<em>` italic sage au cœur d'un h2 Playfair. Exemple : `Devenir <em>indispensable</em>, pas remplaçable.`
- **Branch reveal** : verticale sage 2px qui pousse depuis le top + bras horizontaux 1.5rem qui poussent latéralement, items qui apparaissent en cascade (180/280/380/480ms). Utilisé dans le Bookshelf à l'ouverture d'une section.
- **CTA hairline** : pas de bouton plein, juste un hairline bottom + le texte CTA en Inter caps sage avec une `→` qui glisse au hover (gap qui s'élargit). Voir `.qcard-arrow`, `.nl-submit`, `.profil-link`.
- **Swiss CTA** : encart sombre (`var(--color-surface)`) avec stripe sage 4px en haut-gauche + box-shadow doux. Wrapper le `<HomeMasthead>`-style des deux choix newsletter / scanner dans le hero.
- **Hover surface éditoriale** : background pousse en `rgba(91, 163, 122, 0.03)` au hover, et `0.05` en état [open] (cf. `.rb-row`).

### Animations & motion

- **prefers-reduced-motion** doit être respecté dans tous les composants animés (early return dans le mounted, ou `animation: none !important` en media query).
- **Heuristique éditoriale** : 0.3–0.5s, easing `cubic-bezier(0.65, 0, 0.35, 1)` ou `ease-out`, animations subtiles (slide + fade), jamais de glitch, jamais de typing/cursor blink, jamais de scanline.
- **`ParticleCanvas`** : particules sage (RGB `91,163,122`), reliées par traits, IntersectionObserver sur `<main section>` pour faire « pulser » le canvas à chaque section visible. Démarrage différé en `requestIdleCallback` pour ne pas bloquer le TBT.
- **`SectionDivider`** : pendant l'absence d'un masthead numéroté, sépare les sections (entre Manifeste et Diagnostic Teaser actuellement). Hairline sage discrète. À remplacer par un masthead III à terme si on veut numéroter le teaser.

### Composants home actifs (V2)

| Fichier | Rôle |
|---|---|
| `HomeMasthead.vue` | Bandeau éditorial numéroté (props `num`, `title`, `meta`) |
| `HomeManifesteEditorial.vue` | Pull-quote magazine `« … »` + profil card vers `/identite` |
| `HomeDiagnosticTeaser.vue` | Teaser scanner (V1 conservée tant que pas migrée) |
| `HomeSkillsList.vue` | 4 compétences IA-proof en liste éditoriale (anciennement `HomeSkillsTriad`) |
| `RapportsBookshelf.vue` | 3 volumes (I/II/III) Playfair italic 9rem, branch reveal au clic |
| `HomeFaq.vue` | FAQ Playfair italic + `+` italic accent rotant à 45°, JSON-LD `FAQPage` préservé |
| `NewsletterForm.vue` | Form hairline (prénom + email), eyebrow `La Fréquence`, h2 Playfair, capture PostHog complète |
| `AppFooter.vue` | Hairline sage en top, brand lockup + nav mono |

Composants V1 cyberpunk **supprimés** le 2026-05-03 (Phase 10) : `HomeProofBar.vue`, `ManifestoTerminal.vue`, `RadarBg.vue`, `StatsStrip.vue`. **Conservés** car encore utilisés sur les pages V1 : `KickerLabel`, `ScannerBorder`, `GlitchButton`, `ScannerGate`.

### Wording distinctif

Naming intentionnel autour de la métaphore « survie professionnelle face à l'IA ». Ne pas relâcher en vocabulaire générique.

| Standard | Survivant-IA |
|---|---|
| S'inscrire | Rejoindre la Fréquence |
| Derniers articles | Rapports de Survie |
| À propos | Identité du Survivant |
| Contact | Envoyer un Signal |
| Newsletter | La Fréquence |
| Diagnostic / quiz | Le Scanner d'obsolescence |

### Règles de copy

- **Tutoiement systématique** dans la copy nouvelle (Tu / ton / tes). Voix Survivant-IA délibérée, pas marketing-corporate. Exception : le slogan brand historique « L'IA ARRIVE. NE SOYEZ PAS UNE VARIABLE SUPPRIMÉE. » (Vous) reste tel quel — il est figé.
- **Négation pleine** : toujours `je ne suis pas`, jamais `je suis pas`. Pas de TikTok-parlé, on garde le ton posé du magazine.
- **Tirets clavier `-`** uniquement, jamais d'em-dash `—` dans les contenus rédactionnels (titres, body, faq, descriptions). Les em-dashes sont une signature IA visible et ont été nettoyés dans tout le contenu.
- **Mathieu se présente comme « Mathieu, le Survivant de l'IA »** (référence Ken le Survivant), pas seulement « Mathieu Rerat ». La byline du manifeste suit ce format.
- **Pas de `//`** comme préfixe d'eyebrow (ancien tic cyberpunk). Si on veut un repère graphique, c'est une barre 28px × 1px sage via `::before`, ou rien.
- **Pas de mot « formation »** au sens cours payant : Survivant-IA = site + newsletter gratuite, ce n'est pas une activité de formation payante.
- **Domaine canonique** : `survivant-ia.ch` (Swiss). Jamais `.com`, `.fr` ou autre TLD dans la copy ou les liens.

### SEO — positionnement validé

Cluster prioritaire (colonne vertébrale du SEO) : **action / virage / formation** (« comment ne pas se faire remplacer par l'IA », « se former à l'IA », « prendre le virage », « devenir indispensable »). PAS le cluster peur ; on capture l'intention de gens qui veulent agir, pas s'angoisser.

### Funnel de conversion

1. **Conversion #1** : inscription à la newsletter *La Fréquence* (`NewsletterForm.vue`, capture `newsletter_signup_succeeded`).
2. **Aimant secondaire** : Scanner d'obsolescence (`/scanner`) → funnel de retour vers la newsletter via la page de résultats.
3. Tout le reste (rapports, FAQ, manifeste) sert ces deux objectifs en construisant la confiance.

---

## Structure du Site

### Pages Phase 1

**`/` — Base Opérationnelle (Home)**
- Hero : fond noir carbone + grain, titre Space Mono vert néon, sous-titre Inter
- Manifeste en 3 lignes : qui est Mathieu, pourquoi ce projet
- Derniers "Rapports de Zone" (3 articles récents)
- CTA "Rejoindre la Fréquence" (formulaire Brevo inline)
- Liens réseaux sociaux

**`/rapports` — Rapports de Zone (Blog)**
- Grille d'articles avec bordures scanner
- Filtres par thème : Soft Skills / Comprendre l'IA / Cas Pratiques
- Chaque carte : titre Mono, extrait Inter, tag de catégorie en vert néon

**`/frequence` — Rejoindre la Fréquence (Newsletter)**
- Page dédiée inscription Brevo
- Promesse claire : "1 rapport de survie par semaine"
- Aperçu d'un ancien numéro

**`/identite` — Identité du Survivant (À propos)**
- Qui est Mathieu, son parcours chef de projet IT
- Pourquoi ce projet, l'angle humain
- Photo avec traitement graphique post-apo (optionnel)

### Structure des articles (Nuxt Content)

```
content/
  rapports/
    YYYY-MM-DD-slug-article.md
```

Frontmatter minimal :
```yaml
---
title: ""
description: ""
date: YYYY-MM-DD
category: soft-skills | comprendre-ia | cas-pratiques
---
```

---

## Stratégie Newsletter — "Le Tunnel de l'Abri"

### LinkedIn Newsletter = L'Appât (Top of Funnel)
- Contenu : analyses actualité IA, coups de gueule, contenu large et viral
- Objectif : prouver l'expertise, profiter du boost algorithmique LinkedIn
- CTA systématique : "Pour les fiches pratiques non censurées par l'algo → Rejoindre la Fréquence [lien site]"

### Brevo = L'Arsenal (Bottom of Funnel)
- Contenu : cas concrets détaillés, tutoriels soft skills, offres Phase 2
- Avantage : tracking comportemental (qui clique sur quoi → automation ciblée)
- Phase 2 : si abonné clique 3x sur "Formation IA" → séquence email automatique dédiée

### Workflow de publication (aucune double saisie)

```
1. Mathieu écrit l'article dans Nuxt Content (markdown)
2. Git commit → Vercel redéploie automatiquement
3. Brevo détecte le nouveau flux RSS → envoie "Nouveau Rapport de Zone disponible"
4. Mathieu poste un résumé punchy sur LinkedIn Newsletter + lien "Version complète sur le site"
```

---

## SEO

- `@nuxtjs/seo` : sitemap.xml auto-généré, Open Graph, Twitter Card, canonical
- Google Search Console : soumission sitemap une fois au lancement (5 min)
- Nuxt SSG (Static Site Generation) : pages pré-rendues en HTML pur, crawlable à 100%
- Stratégie de mots-clés : "survivre à l'IA", "compétences face à l'IA", "ne pas se faire remplacer par l'IA" — concurrence faible en français
- Microsoft Clarity : scroll depth pour optimiser la longueur des articles

---

## Contraintes Projet

- **Temps disponible** : 1h30/jour maximum (papa de 2 enfants en bas âge, 100% en poste)
- **Profil** : Chef de projet IT, utilise Claude Code pour le développement
- **Objectif 6 mois** : construire une audience, pas monétiser
- **Principe** : zéro maintenance technique, tout automatisé
