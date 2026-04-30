# Fond animé global de particules — design

**Date :** 2026-04-30
**Statut :** validé par l'utilisateur, prêt pour writing-plans
**Contexte :** Étendre l'animation `ParticleCanvas` (actuellement présente uniquement dans le hero de `pages/index.vue`) pour qu'elle apparaisse en fond sur toutes les pages du site survivant-ia.ch, avec un effet de "pulse" lumineux à l'entrée de chaque nouvelle section.

## Objectifs

- Cohérence visuelle : même atmosphère animée sur toutes les pages.
- Coût constant : un seul canvas, indépendant du nombre de sections ou de la longueur de la page.
- Lisibilité préservée : le contenu reste confortable à lire, l'animation est en fond, pas en avant-plan.
- Réactivité au scroll : retour visuel ("pulse") quand l'utilisateur change de section.

## Non-objectifs

- Spotlight localisé qui suit le titre lu (option 3 écartée — trop complexe pour un gain perceptif faible).
- Modulation manuelle de l'intensité par page (option C écartée — on garde un dosage unique, à ajuster sur le rendu réel via constantes nommées).
- Refonte des fonds de page : aucune modification structurelle requise (audit déjà fait, voir Section 5).

## Architecture

### Emplacement

- Le composant `ParticleCanvas.vue` est **réécrit** (même nom, même fichier) pour fonctionner en mode "viewport global" au lieu de "section parente".
- Il est monté **une seule fois** dans `app/layouts/default.vue`, au-dessus de `<AppHeader />`.
- L'instance actuelle dans `app/pages/index.vue:82` est **retirée**.

### Layering (du fond vers la surface)

1. Body bg `#0D0D0D` (CSS variable `--color-bg`, inchangé).
2. **Canvas particules** — `position: fixed; inset: 0; z-index: 0; pointer-events: none`.
3. Contenu des pages (`<main>`) — doit être `position: relative; z-index: 1` pour passer au-dessus du canvas.
4. `AppHeader` — déjà `rgba(13,13,13,0.9)` + backdrop-blur, particules subtilement visibles à travers. OK.
5. `AppFooter` — opaque (`var(--color-surface)`), masque le canvas dessous. OK.
6. Body grain overlay (`body::after` `z-index: 9999`) — au-dessus de tout, inchangé.

### Dimensions canvas

- `canvas.width = window.innerWidth × devicePixelRatio`
- `canvas.height = window.innerHeight × devicePixelRatio`
- `ctx.scale(dpr, dpr)` pour rendu net sur écrans Retina.
- Sur `window.resize` : redimensionne le canvas, **garde** les particules existantes en clampant leurs positions au nouveau viewport (pas de reset visuel).

## Dosage par défaut

Tous les chiffres sont exposés en **constantes nommées** en haut de `ParticleCanvas.vue` pour permettre un ajustement rapide après inspection visuelle live.

| Paramètre | Desktop | Mobile (<768px) |
|---|---|---|
| Nombre de particules | 45 | 25 |
| Alpha de base (min/max) | 0.12 / 0.5 | 0.12 / 0.5 |
| `MAX_DIST` (liens) | 130 | 90 |
| `RADIUS_MIN` / `RADIUS_MAX` | 1.2 / 2.8 | 1.2 / 2.8 |
| `SPEED_MIN` / `SPEED_MAX` | 0.12 / 0.45 | 0.12 / 0.45 |
| `PULSE_SPEED` (oscillation alpha individuelle) | 0.012 | 0.012 |
| Glow `shadowBlur` | `r × 3` | `r × 3` |
| Opacité max liens | 0.12 | 0.12 |

### Vignette radiale

- Conservée mais adoucie : `rgba(13, 13, 13, 0.85)` aux coins (au lieu de `rgba(13, 13, 13, 1)` totalement opaque dans la version actuelle).
- En `position: fixed`, la vignette suit le viewport → effet de "spotlight permanent" sur la zone de lecture centrale.

### Couleur

- `--color-accent` (`#00FF41`) inchangé. Hardcodé dans le canvas comme `'0,255,65'`.

## Pulse à l'entrée de section

### Trigger

- Sur les pages structurées (`index.vue`, `scanner.vue`, `frequence.vue`, `identite.vue`, `confidentialite.vue`) : `IntersectionObserver` sur **tous les `<section>` du DOM**.
- Sur les articles `rapports/[...slug].vue` : `IntersectionObserver` sur les **`<h2>` du contenu rendu**. Pas les `<h3>` (trop fréquents).
- Threshold : `0.5` (la cible est visible à 50% +) → déclenche un pulse.
- L'observer est attaché côté layout/composant global, en utilisant `MutationObserver` ou un re-scan sur changement de route pour découvrir les cibles des nouvelles pages.

### Mécanisme

- Variable d'état partagée `pulseEnergy: number` (0 → 1).
- Au déclenchement : `pulseEnergy = 1`.
- À chaque frame : `pulseEnergy *= 0.96` (décroissance exponentielle, retour au baseline en ~1.2s à 60fps).
- Multiplicateurs appliqués pendant le pulse :
  - `alpha_effectif = alpha_base × (1 + 0.8 × pulseEnergy)` → boost max ×1.8
  - `shadowBlur_effectif = shadowBlur_base × (1 + 0.6 × pulseEnergy)` → boost max ×1.6
- Boost **global** sur toutes les particules (pas localisé).

### Throttle anti-spam

- Si un pulse a été déclenché dans les **800 ms précédentes**, le suivant est ignoré.
- Évite les flashs cumulés en cas de scroll rapide.

### Pulse initial

- À la première frame où une section/h2 cible est observée comme intersectée, on déclenche un pulse "de bienvenue".

### Reduced motion

- Si `prefers-reduced-motion: reduce`, le canvas n'est pas instancié du tout. Pas de pulse. La page reste sur fond uni `#0D0D0D`.

## Performance & garde-fous

### Pause quand l'onglet n'est pas visible

- Remplace l'`IntersectionObserver` actuel (qui surveillait la section parente) par la **Page Visibility API** (`document.visibilityState`).
- `visibilitychange` listener : `cancelAnimationFrame` quand caché, relance la boucle au retour.

### Single RAF

- Un seul `requestAnimationFrame` global pour tout (animation des particules + décroissance du `pulseEnergy`). Pas de timer séparé.

### `prefers-reduced-motion`

- Test au mount. Si `reduce`, `return` immédiat dans `onMounted` — aucun canvas ne tourne.

### DPR (Retina)

- Géré via `ctx.scale(dpr, dpr)` après resize (voir Architecture > Dimensions canvas).

## Audit fonds de pages

**Verdict : aucune modification structurelle des CSS de page n'est nécessaire.**

Audit réalisé le 2026-04-30. Constats :

- Les `<section>` des pages **n'ont pas de `background` direct**. Elles sont transparentes par défaut.
- Ce qui est opaque, ce sont les **cartes internes** (`.identity-card`, `.article-body`, `.stat-card`, `.benefits-inner`, `.faq-item`, etc.) avec `var(--color-surface)`. C'est désirable : elles forment des "îlots de lisibilité" au-dessus du fond animé.
- `app/pages/rapports/index.vue:127` est déjà `background: transparent`. ✅
- `app/layouts/default.vue` — `.main-content { flex: 1 }` sans `background-color`. ✅
- `AppHeader` semi-transparent + blur. ✅
- `AppFooter` opaque, masque proprement le canvas dessous. ✅

### Décision pour `.article-body` (rapports/[...slug].vue:214)

- **Conservé tel quel** : `background: var(--color-surface)` opaque.
- Justification : un article fait souvent 1500+ mots, la lecture prime sur l'effet visuel. Les particules sont visibles dans les marges et les zones de respiration autour de la carte d'article.
- Option de revoir cette décision après le rendu réel si l'effet semble trop coupé visuellement.

## Composants impactés

| Fichier | Modification |
|---|---|
| `app/components/ParticleCanvas.vue` | Réécriture complète (mode viewport global, pulse, perfs) |
| `app/layouts/default.vue` | Ajout du `<ClientOnly><ParticleCanvas /></ClientOnly>` au-dessus du `<AppHeader />` |
| `app/pages/index.vue` | Retrait de l'instance ligne 82 |
| `app/assets/css/main.css` | Vérifier que `<main>` ou `<body>` n'ont pas de bg qui couvre le canvas (audit fait, OK — mais à reconfirmer après implémentation) |

Aucun autre fichier n'est touché.

## Tests / validation

Pas de tests automatisés (animation visuelle). Validation manuelle :

1. Home (`/`) — particules visibles dans le hero, pulse à chaque entrée de section au scroll, lecture des cartes "Rapports / Newsletter / Scanner Teaser" confortable.
2. Article long (`/rapports/<slug>`) — particules visibles dans les marges, `.article-body` reste lisible, pulse aux H2.
3. Scanner (`/scanner`) — particules ne gênent pas l'utilisation du scanner, pulse aux changements de section.
4. Mobile (375px) — 25 particules, pas de jank visible au scroll, perfs fluides.
5. `prefers-reduced-motion` activé — fond uni `#0D0D0D`, pas d'animation, pas de pulse.
6. Onglet caché → revenu — animation reprend sans saut visuel anormal.
7. Resize fenêtre — pas de reset des particules, juste un repositionnement.

## Risques connus

- **Calibration du dosage** : les chiffres (45 particules, alpha 0.12-0.5, etc.) sont une estimation à l'œil. Le vrai test est sur le rendu live. Acceptable parce que toutes les valeurs sont en constantes nommées en haut du fichier.
- **Découverte dynamique des cibles** : sur les articles, le contenu markdown est rendu côté client après hydration. L'`IntersectionObserver` doit observer les `<h2>` après que le DOM est peuplé. Solution : `MutationObserver` sur `<main>` ou ré-attachement au changement de route Nuxt.
- **Performance mobile sur appareils faibles** : 25 particules + glow + paire-à-paire reste possiblement coûteux. Si problème, fallback : désactiver les liens entre particules sur mobile (gain ~80% du coût de la frame).
