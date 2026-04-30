# Fond animé global de particules — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Étendre le composant `ParticleCanvas` (actuellement local au hero de la home) en fond fixe global sur toutes les pages, avec un pulse lumineux à l'entrée de chaque section/H2.

**Architecture:** Un unique canvas en `position: fixed` sur le viewport, monté dans le layout par défaut. Pulse global piloté par un `IntersectionObserver` qui surveille les `<section>` (sur toutes les pages structurées) et les `<h2>` du `.article-body` (sur les articles). Pas de tests automatisés — projet sans suite de tests, validation visuelle manuelle.

**Tech Stack:** Vue 3 (Composition API, `<script setup lang="ts">`), Nuxt 4, Canvas 2D, `IntersectionObserver`, Page Visibility API.

**Spec:** `docs/superpowers/specs/2026-04-30-particles-global-bg-design.md`

---

## File Structure

| Fichier | Action | Responsabilité |
|---|---|---|
| `app/components/ParticleCanvas.vue` | **Réécriture complète** | Canvas viewport-global, animation, pulse, IO sur cibles, perf gates |
| `app/layouts/default.vue` | **Modifier** | Monter `<ParticleCanvas />` une fois (au-dessus du header) |
| `app/pages/index.vue` | **Modifier** | Retirer l'instance locale dans le hero (ligne 82) |
| `app/assets/css/main.css` | **Modifier** | Ajouter `main { position: relative; z-index: 1 }` pour que le contenu passe au-dessus du canvas |

Aucun autre fichier touché. Aucun nouveau composant créé.

---

## Task 1 — Réécriture du `ParticleCanvas` en mode viewport-global

**Files:**
- Modify (full rewrite): `app/components/ParticleCanvas.vue`

Cette tâche réécrit le composant pour qu'il :
- se positionne en `fixed` sur le viewport (au lieu de `absolute` sur le parent),
- gère le DPR (Retina) proprement,
- utilise la Page Visibility API pour pauser quand l'onglet est caché,
- ajuste la densité sur mobile (<768px),
- adoucit la vignette,
- baisse le dosage par défaut (45 particules, alpha 0.12-0.5).

Pas de pulse à cette étape — on l'ajoute en Task 2 pour pouvoir valider chaque morceau séparément.

- [ ] **Step 1.1 : Remplacer entièrement le contenu de `app/components/ParticleCanvas.vue`**

```vue
<!-- app/components/ParticleCanvas.vue -->
<template>
  <canvas ref="canvasEl" class="particle-canvas" aria-hidden="true" />
</template>

<script setup lang="ts">
const canvasEl = ref<HTMLCanvasElement | null>(null)

// ── Tunables (à ajuster sur le rendu réel) ────────
const ACCENT             = '0,255,65'
const COUNT_DESKTOP      = 45
const COUNT_MOBILE       = 25
const MOBILE_BREAK       = 768
const MAX_DIST_DESKTOP   = 130
const MAX_DIST_MOBILE    = 90
const SPEED_MIN          = 0.12
const SPEED_MAX          = 0.45
const RADIUS_MIN         = 1.2
const RADIUS_MAX         = 2.8
const ALPHA_MIN          = 0.12
const ALPHA_MAX          = 0.5
const PULSE_SPEED        = 0.012
const GLOW_FACTOR        = 3
const LINK_OPACITY       = 0.12
const VIGNETTE_ALPHA     = 0.85

interface Particle { x: number; y: number; vx: number; vy: number; r: number; alpha: number; phase: number }

let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0, dpr = 1
let particles: Particle[] = []
let raf: number | null = null
let count   = COUNT_DESKTOP
let maxDist = MAX_DIST_DESKTOP

const rand = (a: number, b: number) => Math.random() * (b - a) + a
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAK

function applyMobileTuning() {
  count   = isMobile() ? COUNT_MOBILE : COUNT_DESKTOP
  maxDist = isMobile() ? MAX_DIST_MOBILE : MAX_DIST_DESKTOP
}

function createParticle(): Particle {
  const angle = rand(0, Math.PI * 2)
  const speed = rand(SPEED_MIN, SPEED_MAX)
  return {
    x: rand(0, W), y: rand(0, H),
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    r: rand(RADIUS_MIN, RADIUS_MAX),
    alpha: rand(ALPHA_MIN, ALPHA_MAX),
    phase: rand(0, Math.PI * 2),
  }
}

function resize() {
  if (!canvasEl.value) return
  const c = canvasEl.value
  dpr = window.devicePixelRatio || 1
  W = window.innerWidth
  H = window.innerHeight
  c.width        = W * dpr
  c.height       = H * dpr
  c.style.width  = W + 'px'
  c.style.height = H + 'px'
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  for (const p of particles) {
    if (p.x > W) p.x = W
    if (p.y > H) p.y = H
  }
}

function loop() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.52)
  grd.addColorStop(0,   'rgba(0,0,0,0)')
  grd.addColorStop(0.6, 'rgba(0,0,0,0)')
  grd.addColorStop(1,   `rgba(13,13,13,${VIGNETTE_ALPHA})`)

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy; p.phase += PULSE_SPEED
    if (p.x < -10) p.x = W + 10
    if (p.x > W + 10) p.x = -10
    if (p.y < -10) p.y = H + 10
    if (p.y > H + 10) p.y = -10
    const a = p.alpha * (0.7 + 0.3 * Math.sin(p.phase))
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j]
      const dx = p.x - q.x, dy = p.y - q.y
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d < maxDist) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${ACCENT},${(1 - d / maxDist) * LINK_OPACITY})`
        ctx.lineWidth = 0.6
        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke()
      }
    }
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle   = `rgba(${ACCENT},${a})`
    ctx.shadowColor = `rgba(${ACCENT},${a * 0.8})`
    ctx.shadowBlur  = p.r * GLOW_FACTOR
    ctx.fill()
    ctx.shadowBlur = 0
  }
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)
  raf = requestAnimationFrame(loop)
}

const handleResize = () => {
  applyMobileTuning()
  resize()
  if (particles.length !== count) {
    particles = Array.from({ length: count }, createParticle)
  }
}

const handleVisibility = () => {
  if (document.visibilityState === 'hidden') {
    if (raf) { cancelAnimationFrame(raf); raf = null }
  } else if (!raf && ctx) {
    loop()
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!canvasEl.value) return
  ctx = canvasEl.value.getContext('2d')
  applyMobileTuning()
  resize()
  particles = Array.from({ length: count }, createParticle)
  loop()
  window.addEventListener('resize', handleResize, { passive: true })
  document.addEventListener('visibilitychange', handleVisibility)
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
```

- [ ] **Step 1.2 : Monter le composant globalement dans le layout**

Modifier `app/layouts/default.vue` pour ajouter `<ClientOnly><ParticleCanvas /></ClientOnly>` au-dessus du header. Vu sa structure actuelle :

```vue
<template>
  <div class="layout">
    <ScrollProgress />
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
```

Remplacer par :

```vue
<template>
  <div class="layout">
    <ClientOnly><ParticleCanvas /></ClientOnly>
    <ScrollProgress />
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
```

(`ParticleCanvas` est auto-importé par Nuxt depuis `app/components/`, pas besoin de l'importer manuellement.)

- [ ] **Step 1.3 : Retirer l'instance locale dans `app/pages/index.vue`**

Ligne 82 :
```vue
      <ClientOnly><ParticleCanvas /></ClientOnly>
```

→ **supprimer cette ligne entièrement**. La ligne 81 (`<div ref="heroGrid" class="hero-grid-bg" aria-hidden="true" />`) reste, c'est un autre overlay.

- [ ] **Step 1.4 : Ajouter la règle de layering sur `<main>` dans `main.css`**

Ouvrir `app/assets/css/main.css`. Trouver la section "Base" autour des lignes 24-42 (`html { ... }` puis `body { ... }`). Juste après le bloc `body { ... }` (qui se termine ligne 42), ajouter :

```css
main {
  position: relative;
  z-index: 1;
}
```

Justification : sans ça, `<main>` est `static` par défaut donc le `z-index: 1` du contenu ne fonctionnerait pas, et le canvas (z-index 0) pourrait passer par-dessus dans certains contextes de stacking.

- [ ] **Step 1.5 : Lancer le serveur de dev**

```bash
npm run dev
```

Attendre que Nuxt affiche `Local: http://localhost:3000`.

- [ ] **Step 1.6 : Validation visuelle manuelle**

Ouvrir un navigateur et vérifier :

1. **Home** (`http://localhost:3000/`) — particules visibles dans le hero ET dans les sections en dessous (Rapports, Newsletter, Scanner Teaser). Pas de saut visuel à l'entrée des sections (pas encore de pulse, normal).
2. **Article long** (`http://localhost:3000/rapports/<n'importe-quel-slug>`) — particules visibles dans les marges autour de la carte article (`.article-body` reste opaque, c'est voulu).
3. **Scanner** (`http://localhost:3000/scanner`) — particules visibles, pas de gêne pour l'utilisation du scanner.
4. **Mobile (DevTools, 375px)** — particules visibles, pas de jank au scroll. Resize entre desktop et mobile : le nombre de particules s'ajuste sans crash.
5. **Onglet caché → revenu** (changer d'onglet, attendre 5s, revenir) — l'animation reprend sans saut.
6. **`prefers-reduced-motion`** (DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce, puis recharger la page) — fond uni, aucune particule, aucun canvas dans le DOM (`document.querySelector('.particle-canvas')` doit retourner `null` après reload).

Si tout passe, continuer. Sinon : noter ce qui cloche, ajuster les constantes en haut du fichier `ParticleCanvas.vue`, recharger.

- [ ] **Step 1.7 : Commit**

```bash
git add app/components/ParticleCanvas.vue app/layouts/default.vue app/pages/index.vue app/assets/css/main.css
git commit -m "$(cat <<'EOF'
feat(bg): canvas global de particules en fond fixe

ParticleCanvas réécrit en mode viewport-global (position: fixed),
monté une fois dans le layout par défaut. DPR géré, pause sur tab
caché, dosage atténué (45 particules / alpha 0.12-0.5), tuning mobile
(<768px → 25 particules).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2 — Ajout du pulse à l'entrée de section

**Files:**
- Modify: `app/components/ParticleCanvas.vue`

Cette tâche ajoute la mécanique de pulse : un `IntersectionObserver` sur les `<section>` (toutes les pages) et les `<h2>` du `.article-body` (uniquement sur les articles), avec décroissance exponentielle, throttle anti-spam, et re-attachement sur changement de route.

- [ ] **Step 2.1 : Ajouter les constantes de pulse en haut du `<script setup>`**

Dans `app/components/ParticleCanvas.vue`, après la ligne `const VIGNETTE_ALPHA     = 0.85`, ajouter :

```ts
const PULSE_ALPHA_BOOST  = 0.8
const PULSE_GLOW_BOOST   = 0.6
const PULSE_DECAY        = 0.96
const PULSE_THROTTLE_MS  = 800
const PULSE_TARGET_THRESHOLD = 0.5
```

- [ ] **Step 2.2 : Ajouter l'état du pulse et l'observer**

Toujours dans le même fichier, après la ligne `let count   = COUNT_DESKTOP` et `let maxDist = MAX_DIST_DESKTOP`, ajouter :

```ts
let pulseEnergy = 0
let lastPulseAt = 0
let io: IntersectionObserver | null = null
const router = useRouter()
```

(`useRouter()` est auto-importé par Nuxt.)

- [ ] **Step 2.3 : Ajouter les handlers de l'observer et le rescan des cibles**

Avant la fonction `function loop()`, ajouter :

```ts
function onIntersect(entries: IntersectionObserverEntry[]) {
  for (const e of entries) {
    if (!e.isIntersecting) continue
    const now = performance.now()
    if (now - lastPulseAt < PULSE_THROTTLE_MS) return
    lastPulseAt = now
    pulseEnergy = 1
    return
  }
}

function rescanTargets() {
  if (!io) return
  io.disconnect()
  document.querySelectorAll('main section').forEach(el => io!.observe(el))
  const path = router.currentRoute.value.path
  const isArticle = path.startsWith('/rapports/') && path !== '/rapports' && path !== '/rapports/'
  if (isArticle) {
    document.querySelectorAll('main .article-body h2').forEach(el => io!.observe(el))
  }
}
```

- [ ] **Step 2.4 : Appliquer le boost de pulse dans la `loop()` et décroître l'énergie**

Dans la fonction `loop()`, deux changements :

**A.** Dans la boucle `for` qui itère sur les particules, remplacer la ligne :
```ts
    const a = p.alpha * (0.7 + 0.3 * Math.sin(p.phase))
```
par :
```ts
    const a = p.alpha * (0.7 + 0.3 * Math.sin(p.phase)) * (1 + PULSE_ALPHA_BOOST * pulseEnergy)
```

**B.** Toujours dans la boucle, remplacer la ligne :
```ts
    ctx.shadowBlur  = p.r * GLOW_FACTOR
```
par :
```ts
    ctx.shadowBlur  = p.r * GLOW_FACTOR * (1 + PULSE_GLOW_BOOST * pulseEnergy)
```

**C.** Juste avant la dernière ligne `raf = requestAnimationFrame(loop)`, ajouter la décroissance :
```ts
  pulseEnergy *= PULSE_DECAY
  if (pulseEnergy < 0.001) pulseEnergy = 0
```

- [ ] **Step 2.5 : Initialiser l'observer dans `onMounted` et brancher le re-scan sur changement de route**

Dans `onMounted(() => { ... })`, juste après la ligne `loop()` (et avant les `addEventListener`), ajouter :

```ts
  io = new IntersectionObserver(onIntersect, { threshold: PULSE_TARGET_THRESHOLD })
  rescanTargets()
  router.afterEach(() => nextTick(() => rescanTargets()))
```

(`nextTick` est auto-importé par Nuxt.)

- [ ] **Step 2.6 : Cleanup dans `onUnmounted`**

Dans `onUnmounted(() => { ... })`, juste avant la dernière ligne, ajouter :

```ts
  if (io) { io.disconnect(); io = null }
```

Note : `router.afterEach()` retourne une fonction de désinscription qu'on devrait normalement stocker pour cleanup. En pratique le composant est dans le layout, monté une seule fois pour toute la vie de l'app — il n'unmount jamais. Pas de fuite réelle. Skip pour rester simple.

- [ ] **Step 2.7 : Recharger la page de dev**

Le serveur dev est toujours actif depuis Task 1. Si pas, `npm run dev`. Recharger `http://localhost:3000/`.

- [ ] **Step 2.8 : Validation visuelle**

1. **Home** : au chargement, on doit voir un pulse initial (les particules brillent un instant, puis reviennent au baseline en ~1.2s). Scroller vers le bas : à chaque entrée de section (Rapports, Newsletter, Scanner Teaser), un pulse se déclenche.
2. **Scroll très rapide sur la home** : pas de cumul de pulses (throttle 800ms doit absorber les déclenchements rapprochés).
3. **Article** : naviguer sur un `/rapports/<slug>`. Pulse initial. Scroller : pulse à chaque H2 du contenu de l'article.
4. **Navigation page-à-page** : depuis la home, cliquer sur un article. Pulse au chargement. Revenir à la home. Pulse au chargement. Aller sur scanner. Pulse au chargement. (Le `router.afterEach` doit ré-attacher l'observer correctement.)
5. **`prefers-reduced-motion`** : aucune animation, aucun pulse, le canvas n'existe pas dans le DOM.

Si quelque chose semble trop intense ou trop subtil, ajuster `PULSE_ALPHA_BOOST`, `PULSE_GLOW_BOOST`, ou `PULSE_DECAY` en haut du fichier.

- [ ] **Step 2.9 : Commit**

```bash
git add app/components/ParticleCanvas.vue
git commit -m "$(cat <<'EOF'
feat(bg): pulse lumineux à l'entrée de chaque section

IntersectionObserver sur <section> et h2 d'article, threshold 0.5,
throttle 800ms, décroissance exponentielle ~1.2s. Re-scan des cibles
sur changement de route via router.afterEach.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 — Validation finale et passage en production locale

**Files:**
- Aucun changement de code (sauf calibrage des constantes si besoin).

Cette tâche valide le rendu sur tous les parcours du spec et permet d'ajuster les constantes une dernière fois avant de considérer le travail terminé.

- [ ] **Step 3.1 : Build de production local**

```bash
npm run build
npm run preview
```

Attendre `Local: http://localhost:3000` (ou autre port indiqué). Les builds de prod peuvent avoir des comportements de tree-shaking ou minification différents — autant vérifier avant de commit "fini".

- [ ] **Step 3.2 : Parcours de validation complet**

Sur le serveur de preview, vérifier les 7 points de la section "Tests / validation" du spec :

1. Home — particules + pulse à chaque section, lecture confortable.
2. Article (`/rapports/<slug>`) — particules dans les marges, pulse aux H2, lecture du corps confortable.
3. Scanner — pas de gêne, pulse aux changements de section.
4. Mobile (DevTools 375px) — 25 particules, scroll fluide, pas de jank.
5. `prefers-reduced-motion` — fond uni, rien d'animé.
6. Onglet caché → revenu — animation reprend proprement.
7. Resize fenêtre — pas de reset des particules, repositionnement uniquement.

- [ ] **Step 3.3 : Calibrage final (optionnel)**

Si certaines valeurs ne te plaisent pas (densité, intensité du pulse, opacité de la vignette), modifier les constantes en haut de `app/components/ParticleCanvas.vue`. Re-build et re-tester.

Constantes les plus probables à ajuster :
- `ALPHA_MIN` / `ALPHA_MAX` — luminosité de base.
- `COUNT_DESKTOP` / `COUNT_MOBILE` — densité.
- `PULSE_ALPHA_BOOST` / `PULSE_GLOW_BOOST` — intensité du pulse.
- `VIGNETTE_ALPHA` — assombrissement des coins.

- [ ] **Step 3.4 : Commit du calibrage final (si modifications faites en 3.3)**

```bash
git add app/components/ParticleCanvas.vue
git commit -m "$(cat <<'EOF'
tune(bg): ajustement final du dosage des particules

Calibrage post-validation visuelle.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

(Skipper cette étape si rien n'a été modifié en 3.3.)

- [ ] **Step 3.5 : Tuer le serveur de dev/preview**

`Ctrl+C` dans le terminal qui fait tourner `npm run preview`.

---

## Notes pour l'engineur

- **Pas de tests automatisés** : ce projet n'a pas de Vitest, Playwright, ou autre. Toute validation est manuelle. C'est volontaire — l'animation canvas n'est pas raisonnablement testable en unitaire, et le coût d'introduire une stack de test E2E pour une seule fonctionnalité visuelle ne se justifie pas.
- **Auto-imports Nuxt** : `ref`, `onMounted`, `onUnmounted`, `useRouter`, `nextTick` sont auto-importés. Pas besoin de `import` explicite.
- **`<ClientOnly>` est important** : le canvas utilise `window`, `document`, `requestAnimationFrame` — pas dispo en SSR. Sans `<ClientOnly>`, build cassé.
- **Si le pulse fire en boucle** sur une page : vérifier que `lastPulseAt` est bien mis à jour AVANT le `return` dans `onIntersect`. Sinon le throttle ne fonctionne pas.
- **Si les particules sautent au resize** : vérifier que `applyMobileTuning()` est bien appelé AVANT `resize()` dans `handleResize()`.
- **Si le canvas n'apparaît pas du tout** : ouvrir DevTools Elements et chercher `.particle-canvas`. S'il existe mais n'est pas visible, c'est un problème de stacking context — vérifier le z-index de `<main>` (Step 1.4).
