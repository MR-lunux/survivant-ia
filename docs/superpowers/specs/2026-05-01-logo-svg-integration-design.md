# Logo SVG — intégration site + favicon

**Statut**: design validé, en attente de plan d'implémentation
**Date**: 2026-05-01

## Contexte

Le logo officiel de Survivant-IA a été livré en PNG 1242×1246 (`logo/logo.png`) — marque géométrique verte (deux polygones: une barre horizontale + une forme triangulaire avec encoche, formant un "S" stylisé) sur fond sombre.

Le site n'a aujourd'hui aucune image de marque:
- Le header utilise un logo typographique `[SURVIVANT]` (mono, crochets verts).
- Le favicon est un `favicon.ico` 32×32 par défaut.

Objectif: intégrer la marque dans le header **et** comme favicon multi-plateforme, en SVG vectoriel pour la netteté.

## Décisions

| Sujet | Décision |
|---|---|
| Format source | **SVG manuellement reconstruit** depuis le PNG (formes purement géométriques → vecteur exact). Conversion déjà faite: `logo/logo.svg` (394 octets, 14 sommets, diff silhouette < 0.1%). |
| Couleur marque | **`#00FF41`** (vert Matrix existant du site). On conserve l'accent actuel et on recolore le logo via `currentColor`, plutôt que d'adopter le `#7CFC8A` du PNG d'origine. |
| Header | **Marque + wordmark `SURVIVANT-IA`** (mono blanc) en desktop ≥640px ; **marque seule** en mobile <640px. |
| Favicon | **Tile autonome**: marque verte sur carré sombre `#0C0E0C` avec coins arrondis (`rx=180/1024 ≈ 18%`). Lisible sur tous fonds d'onglet. |
| Génération | **One-shot script** (`scripts/generate-favicons.sh`), assets commités. Pas de hook de build — la marque ne change pas. |

## Architecture

### Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `app/components/AppLogo.vue` | Composant Vue qui inline le SVG (2 polygones). Props `variant: 'mark' \| 'lockup'` et `tag`. Hérite couleur via `currentColor`. |
| `public/favicon.svg` | Favicon SVG moderne (tile sombre + marque verte, viewBox carré). Servi aux navigateurs récents. |
| `public/favicon.ico` | Multi-résolution 16/32/48, fallback navigateurs anciens. |
| `public/apple-touch-icon.png` | 180×180, iOS home screen. |
| `public/icon-192.png`, `public/icon-512.png` | PNG manifest, Android home screen + PWA. |
| `public/site.webmanifest` | Manifest PWA minimal (name, icons, theme/bg color). |
| `scripts/generate-favicons.sh` | Pipeline ImageMagick: `favicon-source.svg` → tous les rasters + copie SVG. À lancer manuellement. |
| `logo/favicon-source.svg` | Source intermédiaire (marque verte sur tile carré sombre, padding ~19%, coins arrondis). Non commité dans `public/` directement — c'est l'input du script. |

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `app/components/AppHeader.vue` | Remplace `<span class="logo-bracket">[</span><span class="logo-text">SURVIVANT</span>...` par `<AppLogo variant="lockup" />`. Ajuste le CSS du `.logo` pour le lockup (marque verte + wordmark blanc, gap, responsive). |
| `nuxt.config.ts` | Ajoute dans `app.head.link`: `icon` (svg + ico), `apple-touch-icon`, `manifest`. Ajoute `meta name="theme-color" content="#0d0d0d"`. |

## Composant `AppLogo.vue`

```vue
<template>
  <component :is="tag ?? 'span'" class="logo" :class="`logo--${variant ?? 'mark'}`" aria-label="Survivant-IA">
    <svg class="logo-mark" viewBox="0 0 1053.4 1058.4" fill="currentColor" aria-hidden="true">
      <polygon points="40.7,1019.2 39.7,863.2 234.2,831.7 234.2,604.7 39.7,573.2 39.7,418.2 1014.2,640.7 1011.7,797.2 40.7,1019.2"/>
      <polygon points="1013.7,256.2 39.7,256.2 39.2,39.7 1013.7,39.2 1013.7,256.2"/>
    </svg>
    <span v-if="(variant ?? 'mark') === 'lockup'" class="logo-text">SURVIVANT-IA</span>
  </component>
</template>

<script setup lang="ts">
defineProps<{ variant?: 'mark' | 'lockup'; tag?: string }>()
</script>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 0.6rem; }
.logo-mark {
  width: auto;
  height: 1.6em;       /* suit la taille de fonte du parent */
  color: var(--color-accent);
}
.logo-text {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--color-text);
  white-space: nowrap;
}
@media (max-width: 640px) {
  .logo--lockup .logo-text { display: none; }
}
</style>
```

**Points clés:**
- L'`aria-label` est sur le wrapper, le SVG est `aria-hidden` → un seul nom accessible (évite la duplication "Survivant-IA Survivant-IA" pour les lecteurs d'écran).
- La marque est en `--color-accent` (vert), le wordmark en `--color-text` (blanc) → le header garde sa lecture sobre, le vert est un signal ponctuel.
- `height: 1.6em` → le composant suit le contexte typographique. Dans le header (font-size implicite ~16px), ça fait ~26px. Si on veut une marque plus grande, on bump `font-size` du parent.

## Intégration `AppHeader.vue`

Le bloc à remplacer:
```vue
<NuxtLink to="/" class="logo" data-attr="header-nav-home">
  <span class="logo-bracket">[</span>
  <span class="logo-text">SURVIVANT</span>
  <span class="logo-bracket">]</span>
</NuxtLink>
```

devient:
```vue
<NuxtLink to="/" class="logo-link" data-attr="header-nav-home" aria-label="Survivant-IA — accueil">
  <AppLogo variant="lockup" />
</NuxtLink>
```

Le CSS `.logo`, `.logo-bracket`, `.logo-text` du header devient inutile (déplacé dans `AppLogo.vue`). Reste juste `.logo-link { text-decoration: none; }`. Le `data-attr="header-nav-home"` reste sur le `NuxtLink` pour PostHog (autocapture stable).

## Génération des favicons

### `logo/favicon-source.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="180" fill="#0C0E0C"/>
  <g transform="translate(192, 192) scale(0.625)" fill="#00FF41">
    <polygon points="40.7,1019.2 39.7,863.2 234.2,831.7 234.2,604.7 39.7,573.2 39.7,418.2 1014.2,640.7 1011.7,797.2 40.7,1019.2"/>
    <polygon points="1013.7,256.2 39.7,256.2 39.2,39.7 1013.7,39.2 1013.7,256.2"/>
  </g>
</svg>
```

- ViewBox 1024×1024, padding 192px (~18.75%), marque scalée à 0.625 → tient dans 640×640 centré.
- Coins arrondis `rx=180` (≈18%) — convention squircle iOS, évite l'aspect "carré dur" sur les launchers Android adaptive icons.
- Couleurs en dur (`#0C0E0C` + `#00FF41`) car `currentColor` ne marche pas pour les rasters générés sans contexte CSS.

### `scripts/generate-favicons.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="logo/favicon-source.svg"
OUT="public"

# SVG moderne (servi tel quel par les navigateurs récents)
cp "$SRC" "$OUT/favicon.svg"

# Apple touch icon
magick -background none "$SRC" -resize 180x180 "$OUT/apple-touch-icon.png"

# PWA / manifest icons
magick -background none "$SRC" -resize 192x192 "$OUT/icon-192.png"
magick -background none "$SRC" -resize 512x512 "$OUT/icon-512.png"

# Multi-size .ico (16/32/48)
magick -background none "$SRC" \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  -delete 0 "$OUT/favicon.ico"

echo "Favicons regenerated:"
ls -la "$OUT"/{favicon.svg,favicon.ico,apple-touch-icon.png,icon-192.png,icon-512.png}
```

Exécution: `bash scripts/generate-favicons.sh`. Une seule fois. À relancer si la marque change.

### `public/site.webmanifest`

```json
{
  "name": "Survivant-IA",
  "short_name": "Survivant-IA",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#0d0d0d",
  "background_color": "#0d0d0d",
  "display": "standalone"
}
```

## Wiring `nuxt.config.ts`

Dans `app.head.link` (ajouter aux entrées existantes RSS):

```ts
{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
{ rel: 'manifest', href: '/site.webmanifest' },
```

Dans `app.head.meta`:
```ts
{ name: 'theme-color', content: '#0d0d0d' },
```

## Mise à jour du JSON-LD

Dans `app/app.vue`, le bloc `Organization` schema utilise actuellement:
```ts
logo: 'https://survivant-ia.ch/favicon.ico',
```

À remplacer par:
```ts
logo: 'https://survivant-ia.ch/icon-512.png',
```

→ Image plus haute résolution pour les rich results Google (PNG carré ≥112×112 minimum, on a 512).

## Vérification

À faire en local avant commit du diff (pas de tests unitaires — c'est du chrome visuel):

- `npm run dev`
- Desktop ≥640px: marque verte + `SURVIVANT-IA` en mono blanc à droite. Hover du `NuxtLink` ne casse rien. Marque parfaitement nette à toute taille (zoom navigateur).
- Mobile <640px (DevTools responsive): marque seule, wordmark caché.
- Onglet navigateur: favicon vert sur tile sombre, lisible en thèmes clair et sombre du navigateur.
- DevTools → Application → Manifest: chargé, icônes 192/512 reconnues, pas d'erreur.
- Lighthouse a11y: pas de régression sur la home (`AppHeader` est partout).
- Pages où le header n'apparaît pas en mode `nav` (homepage `/`): le logo reste cliquable et ramène à `/`.

## Hors scope

- Pas d'animation de hover sur le logo. Le mark est assez fort, on garde le header sobre.
- Pas de logo "horizontal lockup" stocké en SVG séparé. Le wordmark étant texte, il reste éditorialisable.
- Pas de version "logo blanc sur fond clair" — le site est dark only.
- Pas de PWA installable complète (juste le manifest minimum pour les icônes Android).
