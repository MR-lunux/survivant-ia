# Intégration du logo SVG (header + favicon) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le logo typographique `[SURVIVANT]` du header par la vraie marque vectorielle (lockup desktop + marque seule mobile), et déployer un set de favicons multi-plateforme (SVG moderne, ICO multi-taille, apple-touch, manifest PWA).

**Architecture:** Un composant Vue `AppLogo` qui inline le SVG (2 polygones, 14 sommets) avec `currentColor` pour héritage couleur. Le header injecte ce composant dans son `NuxtLink` racine ; le wordmark est masqué en CSS sous 640px. Les favicons sont générés une fois via un script shell ImageMagick à partir d'une source SVG `logo/favicon-source.svg`, puis commités dans `public/`. Wiring final dans `nuxt.config.ts` pour les `<link rel="icon">` + manifest.

**Tech Stack:** Vue 3 (`<script setup lang="ts">`), Nuxt 4, SVG inline, ImageMagick (CLI, déjà installé), pas de tests automatisés (projet sans suite de tests, validation visuelle manuelle).

**Spec:** `docs/superpowers/specs/2026-05-01-logo-svg-integration-design.md`

---

## File Structure

| Fichier | Action | Responsabilité |
|---|---|---|
| `app/components/AppLogo.vue` | **Créer** | Composant Vue inline-SVG, props `variant` + `tag`, scoped CSS pour layout/responsive |
| `app/components/AppHeader.vue` | **Modifier** | Remplacer le bloc `[SURVIVANT]` par `<AppLogo variant="lockup" />`, nettoyer le CSS dead |
| `logo/favicon-source.svg` | **Créer** | Source du favicon: marque verte sur tile sombre carré 1024×1024, coins arrondis |
| `scripts/generate-favicons.sh` | **Créer** | Pipeline ImageMagick → tous les rasters + copie SVG dans `public/` |
| `public/favicon.svg` | **Créer (généré)** | Favicon SVG moderne |
| `public/favicon.ico` | **Remplacer (généré)** | Multi-taille 16/32/48 |
| `public/apple-touch-icon.png` | **Créer (généré)** | 180×180, iOS |
| `public/icon-192.png`, `public/icon-512.png` | **Créer (généré)** | Manifest PWA, Android |
| `public/site.webmanifest` | **Créer** | Manifest PWA minimal |
| `nuxt.config.ts` | **Modifier** | Ajouter les `<link>` favicon/apple/manifest dans `app.head.link` |
| `app/app.vue` | **Modifier** | Mettre à jour l'URL `logo` du JSON-LD Organization (favicon.ico → icon-512.png) |

Le `theme-color` meta existe déjà dans `nuxt.config.ts` (`#0D0D0D`) → pas de changement.

---

## Task 1 — Créer `AppLogo.vue`

**Files:**
- Create: `app/components/AppLogo.vue`

- [ ] **Step 1.1 : Créer le fichier `app/components/AppLogo.vue`**

```vue
<template>
  <component
    :is="tag ?? 'span'"
    class="logo"
    :class="`logo--${variant ?? 'mark'}`"
    role="img"
    aria-label="Survivant-IA"
  >
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
.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  line-height: 1;
}
.logo-mark {
  width: auto;
  height: 1.6em;
  color: var(--color-accent);
  flex-shrink: 0;
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
  .logo-mark { height: 1.4em; }
}
</style>
```

- [ ] **Step 1.2 : Vérifier la syntaxe TypeScript / Vue**

Run: `npx vue-tsc --noEmit 2>&1 | grep -i "AppLogo\|error" | head -10`
Expected: aucune erreur mentionnant `AppLogo`. (Si la commande timeout ou si vue-tsc n'est pas configuré, la vérification visuelle de la Task 2 servira de garde-fou.)

- [ ] **Step 1.3 : Commit**

```bash
git add app/components/AppLogo.vue
git commit -m "feat(brand): add AppLogo Vue component with inline SVG mark"
```

---

## Task 2 — Intégrer `AppLogo` dans `AppHeader.vue`

**Files:**
- Modify: `app/components/AppHeader.vue:4-8` (template) and `app/components/AppHeader.vue:63-72` (CSS)

- [ ] **Step 2.1 : Remplacer le bloc logo dans le `<template>`**

Remplacer les lignes 4-8 actuelles:
```vue
<NuxtLink to="/" class="logo" data-attr="header-nav-home">
  <span class="logo-bracket">[</span>
  <span class="logo-text">SURVIVANT</span>
  <span class="logo-bracket">]</span>
</NuxtLink>
```

par:
```vue
<NuxtLink to="/" class="logo-link" data-attr="header-nav-home" aria-label="Survivant-IA — accueil">
  <AppLogo variant="lockup" />
</NuxtLink>
```

- [ ] **Step 2.2 : Nettoyer le CSS dead dans le `<style scoped>`**

Remplacer le bloc CSS actuel (lignes 63-72):
```css
.logo {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
}
.logo-bracket { color: var(--color-accent); }
```

par:
```css
.logo-link {
  display: inline-flex;
  text-decoration: none;
  color: inherit;
}
```

- [ ] **Step 2.3 : Lancer `npm run dev` et vérifier visuellement**

Run: `npm run dev` (en background si pas déjà lancé)

Ouvrir `http://localhost:3000/` :
- ✅ Header desktop ≥640px: marque verte (taille ~26px) + `SURVIVANT-IA` en mono blanc à droite, gap visible
- ✅ Cliquer le logo → ramène à `/` (lien intact)
- ✅ DevTools responsive <640px: wordmark caché, marque seule visible
- ✅ Marque nette à tout zoom (250%, 400%) — c'est du vecteur

Aller sur `/rapports` (page non-home) :
- ✅ Header avec lockup + nav links visibles à droite
- ✅ Layout pas cassé (gap, alignement)

Si problème visuel → ajuster les valeurs CSS dans `AppLogo.vue` (`height: 1.6em`, `gap`, etc.) et re-vérifier. Pas de commit tant que le visuel n'est pas OK.

- [ ] **Step 2.4 : Commit**

```bash
git add app/components/AppHeader.vue
git commit -m "feat(brand): replace text logo with AppLogo lockup in header"
```

---

## Task 3 — Créer la source SVG du favicon

**Files:**
- Create: `logo/favicon-source.svg`

- [ ] **Step 3.1 : Créer le fichier `logo/favicon-source.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="180" fill="#0C0E0C"/>
  <g transform="translate(192, 192) scale(0.625)" fill="#00FF41">
    <polygon points="40.7,1019.2 39.7,863.2 234.2,831.7 234.2,604.7 39.7,573.2 39.7,418.2 1014.2,640.7 1011.7,797.2 40.7,1019.2"/>
    <polygon points="1013.7,256.2 39.7,256.2 39.2,39.7 1013.7,39.2 1013.7,256.2"/>
  </g>
</svg>
```

Détails:
- ViewBox carré 1024×1024.
- `rx="180"` ≈ 17.6% du côté → coins arrondis style squircle iOS.
- `translate(192, 192) scale(0.625)` → la marque (1053.4 × 0.625 ≈ 658) tient avec ~183px de padding de chaque côté (~18%).
- Couleurs en dur (pas de `currentColor`): le rendu raster n'a pas de contexte CSS.

- [ ] **Step 3.2 : Vérification visuelle rapide**

Run: `magick -background none logo/favicon-source.svg -resize 64x64 /tmp/favicon-preview.png && open /tmp/favicon-preview.png`
Expected: image 64×64 avec carré sombre arrondi + marque verte centrée, lisible.

Si la marque déborde, est tronquée ou est mal centrée → ajuster `translate` / `scale` jusqu'à obtenir un padding visuel équilibré.

- [ ] **Step 3.3 : Commit**

```bash
git add logo/favicon-source.svg
git commit -m "feat(brand): add favicon source SVG (mark on dark squircle tile)"
```

---

## Task 4 — Script de génération des favicons

**Files:**
- Create: `scripts/generate-favicons.sh`

- [ ] **Step 4.1 : Créer le script `scripts/generate-favicons.sh`**

```bash
#!/usr/bin/env bash
# Generate all favicon variants from logo/favicon-source.svg.
# Run manually whenever the brand mark changes; commit the resulting public/ files.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="logo/favicon-source.svg"
OUT="public"

if [ ! -f "$SRC" ]; then
  echo "Error: $SRC not found" >&2
  exit 1
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "Error: ImageMagick 'magick' command not found" >&2
  exit 1
fi

echo "Generating favicons from $SRC..."

# Modern SVG favicon (served as-is to recent browsers)
cp "$SRC" "$OUT/favicon.svg"

# iOS home screen
magick -background none "$SRC" -resize 180x180 "$OUT/apple-touch-icon.png"

# PWA / manifest icons (Android, installable web app)
magick -background none "$SRC" -resize 192x192 "$OUT/icon-192.png"
magick -background none "$SRC" -resize 512x512 "$OUT/icon-512.png"

# Multi-resolution .ico (legacy browsers + Windows)
magick -background none "$SRC" \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  -delete 0 "$OUT/favicon.ico"

echo
echo "Done. Generated:"
ls -la "$OUT"/{favicon.svg,favicon.ico,apple-touch-icon.png,icon-192.png,icon-512.png}
```

- [ ] **Step 4.2 : Rendre le script exécutable**

Run: `chmod +x scripts/generate-favicons.sh`

- [ ] **Step 4.3 : Lancer le script**

Run: `bash scripts/generate-favicons.sh`
Expected output (taille approximative):
```
public/favicon.svg               ≈ 480 octets
public/favicon.ico               ≈ 5-15 KB
public/apple-touch-icon.png      ≈ 4-8 KB
public/icon-192.png              ≈ 4-9 KB
public/icon-512.png              ≈ 12-25 KB
```

- [ ] **Step 4.4 : Vérifier les rasters générés**

Run: `magick public/favicon.ico -format "%w %h %m\n" info: | sort -u`
Expected: trois lignes `16 16 ICO`, `32 32 ICO`, `48 48 ICO` (ou similaire indiquant que les 3 tailles sont bien empaquetées).

Run: `magick public/icon-192.png -format "%wx%h %[bit-depth]bit alpha=%A\n" info:`
Expected: `192x192 8bit alpha=Blend` (ou `True`).

Si une taille est manquante ou si la tile sombre n'apparaît pas (transparence partout), revoir Step 3.1 (le `rect` de fond doit être présent dans la source).

- [ ] **Step 4.5 : Commit**

```bash
git add scripts/generate-favicons.sh public/favicon.svg public/favicon.ico public/apple-touch-icon.png public/icon-192.png public/icon-512.png
git commit -m "feat(brand): generate favicon set (svg, ico, apple-touch, 192/512 png)"
```

---

## Task 5 — Manifest PWA

**Files:**
- Create: `public/site.webmanifest`

- [ ] **Step 5.1 : Créer `public/site.webmanifest`**

```json
{
  "name": "Survivant-IA",
  "short_name": "Survivant-IA",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#0D0D0D",
  "background_color": "#0D0D0D",
  "display": "standalone"
}
```

- [ ] **Step 5.2 : Valider le JSON**

Run: `python3 -c "import json; json.load(open('public/site.webmanifest')); print('valid')"`
Expected: `valid`

- [ ] **Step 5.3 : Commit**

```bash
git add public/site.webmanifest
git commit -m "feat(brand): add minimal PWA web manifest for icons"
```

---

## Task 6 — Wiring `nuxt.config.ts`

**Files:**
- Modify: `nuxt.config.ts:58-63` (bloc `app.head.link`)

- [ ] **Step 6.1 : Ajouter les liens favicon dans `app.head.link`**

Remplacer le bloc `link:` actuel (lignes 58-63):
```ts
link: [
  { rel: 'alternate', type: 'application/rss+xml', title: "Survivant-IA — RSS", href: 'https://survivant-ia.ch/rss.xml' },
  { rel: 'alternate', hreflang: 'fr-CH', href: 'https://survivant-ia.ch/' },
  { rel: 'alternate', hreflang: 'fr', href: 'https://survivant-ia.ch/' },
  { rel: 'alternate', hreflang: 'x-default', href: 'https://survivant-ia.ch/' },
],
```

par:
```ts
link: [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  { rel: 'manifest', href: '/site.webmanifest' },
  { rel: 'alternate', type: 'application/rss+xml', title: "Survivant-IA — RSS", href: 'https://survivant-ia.ch/rss.xml' },
  { rel: 'alternate', hreflang: 'fr-CH', href: 'https://survivant-ia.ch/' },
  { rel: 'alternate', hreflang: 'fr', href: 'https://survivant-ia.ch/' },
  { rel: 'alternate', hreflang: 'x-default', href: 'https://survivant-ia.ch/' },
],
```

(Le `theme-color` meta existe déjà à `#0D0D0D` ligne 65 — ne pas le doubler.)

- [ ] **Step 6.2 : Vérifier dans le navigateur**

Run: `npm run dev` (si pas déjà actif)

Ouvrir `http://localhost:3000/`, DevTools → onglet **Elements**, dans `<head>` vérifier la présence de:
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`
- `<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="16x16 32x32 48x48">`
- `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`
- `<link rel="manifest" href="/site.webmanifest">`

DevTools → onglet **Application** → **Manifest**:
- `Name`: Survivant-IA
- `Theme color`: #0D0D0D
- 2 icônes listées (192, 512), preview lisible
- Pas d'erreur en bas du panneau

DevTools → onglet **Network**, recharger:
- `/favicon.svg` → 200 OK, type `image/svg+xml`
- `/site.webmanifest` → 200 OK
- `/apple-touch-icon.png` → 200 OK

Onglet du navigateur lui-même: l'icône verte sur tile sombre apparaît.

- [ ] **Step 6.3 : Commit**

```bash
git add nuxt.config.ts
git commit -m "feat(brand): wire favicon set + web manifest in nuxt head config"
```

---

## Task 7 — Mettre à jour le JSON-LD Organization

**Files:**
- Modify: `app/app.vue:19`

- [ ] **Step 7.1 : Remplacer l'URL du logo dans le schema Organization**

Ligne 19, remplacer:
```ts
logo: 'https://survivant-ia.ch/favicon.ico',
```

par:
```ts
logo: 'https://survivant-ia.ch/icon-512.png',
```

Pourquoi: Google rich results préfère un PNG carré ≥112×112 ; favicon.ico est trop petit/imprévisible.

- [ ] **Step 7.2 : Vérifier le JSON-LD dans le navigateur**

Ouvrir `http://localhost:3000/` (dev server), View Source (Cmd+U), chercher `application/ld+json`. Vérifier que `"logo":"https://survivant-ia.ch/icon-512.png"` apparaît bien dans le JSON.

(Optionnel: copier le JSON-LD dans https://search.google.com/test/rich-results pour valider — pas requis pour le commit.)

- [ ] **Step 7.3 : Commit**

```bash
git add app/app.vue
git commit -m "feat(brand): point Organization JSON-LD logo to icon-512.png"
```

---

## Task 8 — Vérification end-to-end

Pas de fichiers modifiés ici — c'est la passe finale de QA visuelle avant de pousser.

- [ ] **Step 8.1 : Build de production local**

Run: `npm run build`
Expected: build OK, aucune erreur TypeScript ni Vue. `Generating prerendered routes...` traite les routes incl. `/`, `/rapports`, etc.

Run: `npm run preview` (lance la version buildée)
Ouvrir `http://localhost:3000/`.

- [ ] **Step 8.2 : Checklist visuelle (build prod)**

Sur `/` :
- ✅ Header lockup desktop, marque seule mobile (DevTools responsive 375px)
- ✅ Marque verte nette à 100%, 200%, 400% zoom
- ✅ Wordmark `SURVIVANT-IA` lisible, alignement vertical correct
- ✅ Onglet navigateur: tile sombre + marque verte

Sur `/rapports`, `/scanner`, `/frequence`, `/identite` :
- ✅ Header cohérent, nav links à côté du lockup, pas de débordement

DevTools Network (rechargement dur Cmd+Shift+R):
- ✅ `/favicon.svg`, `/favicon.ico`, `/apple-touch-icon.png`, `/site.webmanifest` → 200 OK

DevTools Lighthouse (catégorie Accessibility) sur `/` :
- ✅ Score ≥ celui d'avant les changements (relever le score actuel sur main avant de comparer)

- [ ] **Step 8.3 : Vérifier qu'aucun ancien asset ne traîne**

Run: `ls public/ | sort`
Expected:
```
apple-touch-icon.png
favicon.ico
favicon.svg
icon-192.png
icon-512.png
robots.txt
site.webmanifest
```

(Aucun fichier orphelin type `favicon-old.ico`. Si `favicon.ico` n'a pas été overwrité par Task 4, le supprimer manuellement et relancer `bash scripts/generate-favicons.sh`.)

- [ ] **Step 8.4 : Pas de commit nécessaire pour cette task**

Si la vérification révèle un problème non couvert par les tasks précédentes, créer un commit de fix ciblé. Sinon, rien à faire.

---

## Notes pour l'exécutant

- **Ordre strict**: Task 4 doit être lancée APRÈS Task 3 (le script lit `logo/favicon-source.svg`). Task 6 (wiring) doit être lancée APRÈS Task 4 (les fichiers doivent exister). Le reste (1, 2, 5, 7) peut être réordonné mais l'ordre proposé est le plus naturel pour la vérif visuelle.
- **Si `magick` manque**: macOS → `brew install imagemagick`. Le script vérifie sa présence et exit avec message clair.
- **Si vue-tsc n'est pas configuré** (Task 1.2): pas grave, la vérif visuelle de Task 2.3 attrape les régressions Vue/TS dans le rendu.
- **Cache navigateur**: les favicons sont agressivement cachés. Pour vérifier en dev, force-reload (Cmd+Shift+R) ou ouvrir un onglet de navigation privée.
- **Pas de revert auto**: si Task 2.3 montre que le visuel est cassé, fix le CSS d'`AppLogo.vue` ou d'`AppHeader.vue` plutôt que de revert. Le composant doit pouvoir s'adapter sans toucher au reste.
