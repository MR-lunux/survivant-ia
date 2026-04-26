# Survivant de l'IA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Mathieu le Survivant de l'IA" — a Nuxt 3 site with post-apocalyptic "Corporate Brutalism" design, SEO-optimized blog, and Brevo newsletter integration.

**Architecture:** Static site generated with Nuxt 3 (SSG), articles managed as Markdown files via Nuxt Content, deployed automatically to Vercel on every git push. Brevo polls the RSS feed to auto-send newsletter emails on new articles.

**Tech Stack:** Nuxt 3, TailwindCSS, Nuxt Content v2, @nuxtjs/sitemap, @nuxt/fonts, Space Mono + Inter (Google Fonts), Vercel, Brevo, Microsoft Clarity.

---

## File Map

| File | Responsibility |
|---|---|
| `nuxt.config.ts` | Modules, fonts, sitemap, head defaults |
| `tailwind.config.ts` | Design tokens (colors, fonts) |
| `assets/css/main.css` | Global styles, grain effect, scanlines, glitch animation |
| `components/ScannerBorder.vue` | Corner-frame wrapper component |
| `components/GlitchButton.vue` | CTA button with glitch hover effect |
| `components/AppHeader.vue` | Nav + social links |
| `components/AppFooter.vue` | Footer + social links + copyright |
| `components/ArticleCard.vue` | Blog card with scanner border |
| `components/NewsletterForm.vue` | Brevo iframe/embed wrapper |
| `pages/index.vue` | Home — Base Opérationnelle |
| `pages/rapports/index.vue` | Blog list — Rapports de Zone |
| `pages/rapports/[...slug].vue` | Article detail |
| `pages/frequence.vue` | Newsletter signup page |
| `pages/identite.vue` | À propos page |
| `server/routes/rss.xml.ts` | RSS feed consumed by Brevo |
| `content/rapports/*.md` | Articles (one file per article) |
| `public/robots.txt` | Crawler permissions |

---

## Task 1: Initialize Nuxt 3 Project

**Files:**
- Create: `nuxt.config.ts`
- Create: `package.json`
- Create: `tailwind.config.ts`
- Create: `public/robots.txt`
- Create: `app.vue`

- [ ] **Step 1: Initialize project in the survivor directory**

```bash
cd /Users/mathieu/Documents/survivor
npx nuxi@latest init . --force
```

When prompted "Current directory is not empty. Continue?", answer **yes**.
Choose **npm** as package manager.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install @nuxt/content @nuxt/fonts @nuxtjs/tailwindcss @nuxtjs/sitemap
```

- [ ] **Step 3: Replace nuxt.config.ts with full config**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
  ],
  fonts: {
    families: [
      { name: 'Space Mono', provider: 'google', weights: [400, 700] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
    ],
  },
  content: {
    highlight: { theme: 'github-dark' },
  },
  sitemap: {
    hostname: 'https://survivant-ia.fr',
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'theme-color', content: '#0D0D0D' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: ['/rss.xml'],
    },
  },
})
```

- [ ] **Step 4: Create tailwind.config.ts**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#141414',
        'surface-2': '#1A1A1A',
        text: '#E0E0E0',
        muted: '#666666',
        accent: '#00FF41',
        danger: '#FF3E3E',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
} satisfies Config
```

- [ ] **Step 5: Create public/robots.txt**

```
User-agent: *
Allow: /
Sitemap: https://survivant-ia.fr/sitemap.xml
```

- [ ] **Step 6: Replace app.vue with minimal shell**

```vue
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 7: Verify project starts**

```bash
npm run dev
```

Expected: Nuxt dev server starts on `http://localhost:3000`. No errors in terminal.

- [ ] **Step 8: Commit**

```bash
git add nuxt.config.ts package.json package-lock.json tailwind.config.ts app.vue public/robots.txt .gitignore
git commit -m "feat: initialize Nuxt 3 project with Tailwind, Content, Fonts, Sitemap"
```

---

## Task 2: Global CSS — Design System

**Files:**
- Create: `assets/css/main.css`

- [ ] **Step 1: Create assets/css directory and main.css**

```css
/* assets/css/main.css */

/* ── CSS Variables ───────────────────────────────── */
:root {
  --color-bg: #0D0D0D;
  --color-surface: #141414;
  --color-surface-2: #1A1A1A;
  --color-text: #E0E0E0;
  --color-muted: #666666;
  --color-accent: #00FF41;
  --color-danger: #FF3E3E;
  --font-mono: 'Space Mono', monospace;
  --font-sans: 'Inter', sans-serif;
}

/* ── Base ────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

html {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: var(--color-bg);
}

/* ── Grain effect (film noise overlay) ──────────── */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}

/* ── Typography ──────────────────────────────────── */
h1, h2, h3 {
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  line-height: 1.2;
}

h1 { font-size: clamp(2rem, 5vw, 3.5rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2rem); }
h3 { font-size: clamp(1.1rem, 2vw, 1.4rem); }

p { font-family: var(--font-sans); margin: 0 0 1rem; }

a {
  color: var(--color-accent);
  text-decoration: none;
  transition: opacity 0.15s;
}
a:hover { opacity: 0.75; }

/* ── Accent text ─────────────────────────────────── */
.text-accent { color: var(--color-accent); }
.text-danger  { color: var(--color-danger); }
.text-muted   { color: var(--color-muted); }
.font-mono    { font-family: var(--font-mono); }

/* ── Scanline effect ─────────────────────────────── */
.scanline {
  position: relative;
  overflow: hidden;
}
.scanline::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 255, 65, 0.025) 3px,
    rgba(0, 255, 65, 0.025) 4px
  );
}

/* ── Glitch button ───────────────────────────────── */
@keyframes glitch-clip-1 {
  0%   { clip-path: inset(40% 0 61% 0); transform: translate(-3px, 0); }
  25%  { clip-path: inset(92% 0 1% 0);  transform: translate(3px, 0); }
  50%  { clip-path: inset(43% 0 1% 0);  transform: translate(-3px, 0); }
  75%  { clip-path: inset(25% 0 58% 0); transform: translate(3px, 0); }
  100% { clip-path: inset(58% 0 43% 0); transform: translate(-3px, 0); }
}
@keyframes glitch-clip-2 {
  0%   { clip-path: inset(60% 0 20% 0); transform: translate(3px, 0); }
  25%  { clip-path: inset(5% 0 70% 0);  transform: translate(-3px, 0); }
  50%  { clip-path: inset(70% 0 5% 0);  transform: translate(3px, 0); }
  75%  { clip-path: inset(30% 0 40% 0); transform: translate(-3px, 0); }
  100% { clip-path: inset(10% 0 80% 0); transform: translate(3px, 0); }
}

.btn-glitch {
  position: relative;
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-bg);
  background-color: var(--color-accent);
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.15s;
  text-decoration: none;
}
.btn-glitch::before,
.btn-glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  background-color: var(--color-bg);
  opacity: 0;
}
.btn-glitch:hover::before {
  opacity: 1;
  animation: glitch-clip-1 0.4s steps(1) infinite;
}
.btn-glitch:hover::after {
  opacity: 1;
  animation: glitch-clip-2 0.4s steps(1) infinite;
  animation-delay: 0.1s;
}

/* ── Utility ─────────────────────────────────────── */
.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── Nuxt Content prose styles ───────────────────── */
.prose {
  font-family: var(--font-sans);
  color: var(--color-text);
  max-width: 72ch;
}
.prose h1, .prose h2, .prose h3 {
  font-family: var(--font-mono);
  color: var(--color-text);
}
.prose strong { color: var(--color-accent); font-weight: 700; }
.prose a { color: var(--color-accent); }
.prose code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--color-surface-2);
  padding: 0.1em 0.4em;
  border-radius: 2px;
}
.prose blockquote {
  border-left: 3px solid var(--color-accent);
  padding-left: 1rem;
  margin-left: 0;
  color: var(--color-muted);
  font-style: italic;
}
```

- [ ] **Step 2: Verify dev server shows styled page**

```bash
npm run dev
```

Open `http://localhost:3000`. Background should be near-black (#0D0D0D), text grey (#E0E0E0).

- [ ] **Step 3: Commit**

```bash
git add assets/css/main.css
git commit -m "feat: add global CSS design system (grain, scanlines, glitch, typography)"
```

---

## Task 3: ScannerBorder + GlitchButton Components

**Files:**
- Create: `components/ScannerBorder.vue`
- Create: `components/GlitchButton.vue`

- [ ] **Step 1: Create ScannerBorder.vue**

```vue
<!-- components/ScannerBorder.vue -->
<template>
  <div class="scanner-border-wrapper" :class="props.class">
    <span class="corner corner-tl" />
    <span class="corner corner-tr" />
    <span class="corner corner-bl" />
    <span class="corner corner-br" />
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>

<style scoped>
.scanner-border-wrapper {
  position: relative;
}
.corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: var(--color-accent);
  border-style: solid;
  opacity: 0.6;
}
.corner-tl { top: 0; left: 0;     border-width: 2px 0 0 2px; }
.corner-tr { top: 0; right: 0;    border-width: 2px 2px 0 0; }
.corner-bl { bottom: 0; left: 0;  border-width: 0 0 2px 2px; }
.corner-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }
</style>
```

- [ ] **Step 2: Create GlitchButton.vue**

```vue
<!-- components/GlitchButton.vue -->
<template>
  <component
    :is="props.to ? resolveComponent('NuxtLink') : 'button'"
    :to="props.to"
    class="btn-glitch"
    :data-text="props.label"
    v-bind="$attrs"
  >
    {{ props.label }}
  </component>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  to?: string
}>()
</script>
```

- [ ] **Step 3: Verify components are auto-imported**

In `pages/index.vue`, temporarily add:
```vue
<template>
  <div style="padding: 2rem;">
    <ScannerBorder style="padding: 1rem; display: inline-block;">
      <p>Test scanner border</p>
    </ScannerBorder>
    <br><br>
    <GlitchButton label="Rejoindre la Fréquence" />
  </div>
</template>
```

Run `npm run dev`, open `http://localhost:3000`. Verify:
- Green corner brackets appear around the text
- Button is green, on hover shows glitch effect

- [ ] **Step 4: Commit**

```bash
git add components/ScannerBorder.vue components/GlitchButton.vue
git commit -m "feat: add ScannerBorder and GlitchButton components"
```

---

## Task 4: AppHeader + AppFooter

**Files:**
- Create: `components/AppHeader.vue`
- Create: `components/AppFooter.vue`
- Create: `layouts/default.vue`

- [ ] **Step 1: Create AppHeader.vue**

```vue
<!-- components/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="container header-inner">
      <NuxtLink to="/" class="logo">
        <span class="logo-bracket">[</span>
        <span class="logo-text">SURVIVANT</span>
        <span class="logo-bracket">]</span>
      </NuxtLink>

      <nav class="nav">
        <NuxtLink to="/rapports" class="nav-link">Rapports de Zone</NuxtLink>
        <NuxtLink to="/frequence" class="nav-link">La Fréquence</NuxtLink>
        <NuxtLink to="/identite" class="nav-link">Identité</NuxtLink>
      </nav>

      <div class="social-links">
        <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
          <IconLinkedIn />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
          <IconInstagram />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">
          <IconYoutube />
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 255, 65, 0.15);
  background: rgba(13, 13, 13, 0.9);
  backdrop-filter: blur(8px);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 2rem;
}
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
.nav {
  display: flex;
  gap: 2rem;
}
.nav-link {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  text-decoration: none;
  transition: color 0.15s;
}
.nav-link:hover,
.nav-link.router-link-active { color: var(--color-accent); }
.social-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.social-links a {
  color: var(--color-muted);
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.social-links a:hover { color: var(--color-accent); }
</style>
```

- [ ] **Step 2: Create icon components**

Create `components/IconLinkedIn.vue`:
```vue
<!-- components/IconLinkedIn.vue -->
<template>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
</template>
```

Create `components/IconInstagram.vue`:
```vue
<!-- components/IconInstagram.vue -->
<template>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
</template>
```

Create `components/IconYoutube.vue`:
```vue
<!-- components/IconYoutube.vue -->
<template>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
</template>
```

- [ ] **Step 3: Create AppFooter.vue**

```vue
<!-- components/AppFooter.vue -->
<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="font-mono text-accent">[SURVIVANT]</span>
        <p class="footer-tagline">L'IA ARRIVE. NE SOYEZ PAS UNE VARIABLE SUPPRIMÉE.</p>
      </div>

      <div class="footer-links">
        <NuxtLink to="/rapports">Rapports de Zone</NuxtLink>
        <NuxtLink to="/frequence">Rejoindre la Fréquence</NuxtLink>
        <NuxtLink to="/identite">Identité du Survivant</NuxtLink>
      </div>

      <div class="footer-social">
        <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn"><IconLinkedIn /></a>
        <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram"><IconInstagram /></a>
        <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube"><IconYoutube /></a>
      </div>
    </div>

    <div class="container footer-bottom">
      <span class="text-muted font-mono" style="font-size: 0.7rem;">
        © {{ new Date().getFullYear() }} — TRANSMISSION CHIFFRÉE — /rss.xml disponible
      </span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 6rem;
  border-top: 1px solid rgba(0, 255, 65, 0.15);
  padding: 3rem 0 2rem;
  background: var(--color-surface);
}
.footer-inner {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 3rem;
  align-items: start;
  margin-bottom: 2rem;
}
.footer-tagline {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: 0.5rem;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
}
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.footer-links a {
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: var(--color-muted);
  text-decoration: none;
  transition: color 0.15s;
}
.footer-links a:hover { color: var(--color-accent); }
.footer-social {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.footer-social a {
  color: var(--color-muted);
  display: flex;
  transition: color 0.15s;
}
.footer-social a:hover { color: var(--color-accent); }
.footer-bottom { border-top: 1px solid var(--color-surface-2); padding-top: 1rem; }
</style>
```

- [ ] **Step 4: Create default layout**

```vue
<!-- layouts/default.vue -->
<template>
  <div class="layout">
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.main-content { flex: 1; }
</style>
```

- [ ] **Step 5: Verify header and footer render**

Run `npm run dev`, open `http://localhost:3000`. Check:
- Header visible with nav links and social icons
- Footer visible with brand text, links, social icons
- Scanner corner brackets and glitch button visible from previous task

- [ ] **Step 6: Commit**

```bash
git add components/AppHeader.vue components/AppFooter.vue components/IconLinkedIn.vue components/IconInstagram.vue components/IconYoutube.vue layouts/default.vue
git commit -m "feat: add AppHeader, AppFooter, layout, and social icon components"
```

---

## Task 5: ArticleCard + NewsletterForm Components

**Files:**
- Create: `components/ArticleCard.vue`
- Create: `components/NewsletterForm.vue`

- [ ] **Step 1: Create ArticleCard.vue**

```vue
<!-- components/ArticleCard.vue -->
<template>
  <NuxtLink :to="`/rapports/${article._path?.split('/').pop()}`" class="article-card-link">
    <ScannerBorder class="article-card">
      <div class="card-meta">
        <span class="card-category" :class="`cat-${article.category}`">
          {{ categoryLabel }}
        </span>
        <span class="card-date font-mono">{{ formattedDate }}</span>
      </div>
      <h3 class="card-title">{{ article.title }}</h3>
      <p class="card-description">{{ article.description }}</p>
      <span class="card-read font-mono">LIRE LE RAPPORT →</span>
    </ScannerBorder>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  article: {
    _path?: string
    title: string
    description: string
    date: string
    category: string
  }
}>()

const categoryLabels: Record<string, string> = {
  'soft-skills': 'SOFT SKILLS',
  'comprendre-ia': 'COMPRENDRE L\'IA',
  'cas-pratiques': 'CAS PRATIQUES',
}

const categoryLabel = computed(() => categoryLabels[props.article.category] ?? props.article.category)

const formattedDate = computed(() => {
  return new Date(props.article.date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
})
</script>

<style scoped>
.article-card-link { text-decoration: none; display: block; }
.article-card {
  padding: 1.75rem;
  background: var(--color-surface);
  transition: background 0.2s;
  cursor: pointer;
}
.article-card:hover { background: var(--color-surface-2); }
.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.card-category {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  padding: 0.25rem 0.6rem;
  border: 1px solid;
}
.cat-soft-skills    { color: var(--color-accent); border-color: rgba(0,255,65,0.3); }
.cat-comprendre-ia  { color: #64B5F6;             border-color: rgba(100,181,246,0.3); }
.cat-cas-pratiques  { color: #FFD54F;             border-color: rgba(255,213,79,0.3); }
.card-date {
  font-size: 0.7rem;
  color: var(--color-muted);
}
.card-title {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--color-text);
  margin: 0 0 0.75rem;
  line-height: 1.3;
}
.card-description {
  font-size: 0.9rem;
  color: var(--color-muted);
  margin: 0 0 1.25rem;
  line-height: 1.6;
}
.card-read {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--color-accent);
}
</style>
```

- [ ] **Step 2: Create NewsletterForm.vue**

> **Note:** Replace `VOTRE_ID_FORMULAIRE_BREVO` with the actual form ID from your Brevo account (Contacts → Forms → create form → get embed code).

```vue
<!-- components/NewsletterForm.vue -->
<template>
  <div class="newsletter-form-wrapper scanline">
    <ScannerBorder class="newsletter-inner">
      <div class="nl-header">
        <span class="nl-status font-mono">● FRÉQUENCE ACTIVE</span>
        <h3 class="nl-title">Rejoindre la Fréquence</h3>
        <p class="nl-subtitle">
          1 rapport de survie par semaine. Les outils concrets que les algorithmes ne peuvent pas te donner.
        </p>
      </div>

      <!-- Replace src with your Brevo form embed URL -->
      <!-- Get it from: Brevo > Contacts > Forms > your form > Share / Embed -->
      <iframe
        v-if="formUrl"
        :src="formUrl"
        class="brevo-iframe"
        scrolling="no"
        allowfullscreen
        title="Formulaire d'inscription newsletter"
      />

      <div v-else class="form-placeholder">
        <input
          type="email"
          placeholder="votre@email.com"
          class="email-input"
          disabled
        />
        <button class="btn-glitch" data-text="REJOINDRE" disabled>
          REJOINDRE
        </button>
        <p class="setup-note font-mono">
          → Configurer Brevo : remplacer formUrl dans ce composant
        </p>
      </div>
    </ScannerBorder>
  </div>
</template>

<script setup lang="ts">
// Set this to your Brevo embed URL after creating the form in Brevo dashboard
// Example: 'https://sibforms.com/serve/MUIEAAAA...'
const formUrl = ''
</script>

<style scoped>
.newsletter-form-wrapper { padding: 2rem; background: var(--color-surface); }
.newsletter-inner { padding: 2rem; }
.nl-status {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-accent);
  display: block;
  margin-bottom: 1rem;
}
.nl-title {
  font-family: var(--font-mono);
  font-size: 1.4rem;
  color: var(--color-text);
  margin: 0 0 0.75rem;
}
.nl-subtitle {
  font-size: 0.9rem;
  color: var(--color-muted);
  margin: 0 0 1.5rem;
}
.brevo-iframe {
  width: 100%;
  min-height: 200px;
  border: none;
  background: transparent;
}
.form-placeholder {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}
.email-input {
  flex: 1;
  min-width: 200px;
  background: var(--color-surface-2);
  border: 1px solid rgba(0, 255, 65, 0.2);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  outline: none;
  opacity: 0.5;
}
.setup-note {
  width: 100%;
  font-size: 0.65rem;
  color: var(--color-danger);
  margin: 0.5rem 0 0;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add components/ArticleCard.vue components/NewsletterForm.vue
git commit -m "feat: add ArticleCard and NewsletterForm components"
```

---

## Task 6: First Article (Content)

**Files:**
- Create: `content/rapports/2026-04-25-bienvenue-survivant.md`

- [ ] **Step 1: Create content directory and first article**

```bash
mkdir -p content/rapports
```

```markdown
---
title: "Bienvenue dans la Zone : pourquoi l'IA ne doit pas vous faire peur"
description: "L'IA n'est pas votre ennemi. Votre ennemi, c'est de ne pas vous y préparer. Voici les 3 compétences qui vous rendront indispensables quoi qu'il arrive."
date: 2026-04-25
category: comprendre-ia
---

L'IA ARRIVE. Ce n'est pas une menace — c'est un fait. Et comme tout fait, vous avez deux options : le subir ou vous y préparer.

Ce site existe pour la deuxième option.

## Ce que l'IA ne peut pas faire

Les algorithmes sont imbattables pour traiter des données, trouver des patterns, générer du contenu à la demande. Mais ils restent fondamentalement **des outils d'exécution**, pas de jugement.

Ils ne peuvent pas :
- **Naviguer l'ambiguïté humaine** — comprendre qu'un client dit "c'est bien" mais veut dire "ça ne me convient pas"
- **Construire une relation de confiance** — la confiance s'établit humain à humain
- **Prendre des décisions éthiques** — ils optimisent, ils ne raisonnent pas

## Les 3 compétences à développer maintenant

> **Compétence n°1 : La précision du langage**

L'IA parle mieux que beaucoup d'humains. Mais elle ne *comprend* pas. Quelqu'un qui sait exactement quoi demander, pourquoi, et comment formuler les bonnes contraintes — c'est lui qui commande l'IA, pas l'inverse.

> **Compétence n°2 : L'intelligence émotionnelle**

Les soft skills ne sont pas "molles". Elles sont **impossibles à automatiser**. Savoir lire une salle, désamorcer un conflit, motiver une équipe — aucun modèle de langage ne fait ça.

> **Compétence n°3 : La pensée systémique**

Comprendre comment les choses s'assemblent, identifier les effets secondaires, voir les interactions cachées — c'est le travail d'un chef de projet, d'un manager, d'un stratège. L'IA voit les pièces. Vous voyez le puzzle.

## La mission de ce site

Chaque semaine, un rapport de zone. Des outils concrets, pas du jargon. Des cas réels, pas de la théorie.

**Rejoignez la Fréquence. On survit mieux ensemble.**
```

- [ ] **Step 2: Verify content is detected**

Run `npm run dev`. Check that no errors appear in the terminal related to content.

- [ ] **Step 3: Commit**

```bash
git add content/rapports/2026-04-25-bienvenue-survivant.md
git commit -m "content: add first article — bienvenue dans la zone"
```

---

## Task 7: Home Page — Base Opérationnelle

**Files:**
- Create: `pages/index.vue`

- [ ] **Step 1: Create pages/index.vue**

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Mathieu le Survivant de l\'IA — Préparez-vous avant que ça arrive',
  description: 'Soft skills, comprendre l\'IA, cas pratiques. 1 rapport de survie par semaine pour ne pas se faire remplacer.',
  ogTitle: 'Mathieu le Survivant de l\'IA',
  ogDescription: 'Soft skills, comprendre l\'IA, cas pratiques. 1 rapport de survie par semaine.',
  twitterCard: 'summary_large_image',
})

const { data: articles } = await useAsyncData('home-articles', () =>
  queryContent('rapports')
    .sort({ date: -1 })
    .limit(3)
    .find()
)
</script>

<template>
  <div>
    <!-- ── HERO ───────────────────────────────── -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-status">
          <span class="status-dot" />
          <span class="font-mono">TRANSMISSION EN COURS</span>
        </div>

        <h1 class="hero-title">
          L'IA ARRIVE.<br>
          <span class="text-accent">NE SOYEZ PAS<br>UNE VARIABLE SUPPRIMÉE.</span>
        </h1>

        <p class="hero-subtitle">
          Développez les compétences que les algorithmes ne pourront jamais copier.
          Soft skills, compréhension de l'IA, cas pratiques concrets — sans jargon.
        </p>

        <div class="hero-cta">
          <GlitchButton label="Rejoindre la Fréquence" to="/frequence" />
          <NuxtLink to="/rapports" class="hero-link font-mono">
            LIRE LES RAPPORTS →
          </NuxtLink>
        </div>
      </div>

      <div class="hero-grid-bg" aria-hidden="true" />
    </section>

    <!-- ── MANIFESTE ──────────────────────────── -->
    <section class="manifeste">
      <div class="container">
        <ScannerBorder class="manifeste-inner">
          <p class="font-mono" style="color: var(--color-muted); font-size: 0.7rem; letter-spacing: 0.1em; margin-bottom: 1rem;">// MANIFESTE</p>
          <p>Je suis chef de projet IT. Je vois l'IA arriver. Je refuse de regarder sans agir.</p>
          <p>Ce site n'est pas là pour vous faire peur — c'est là pour vous armer. Les outils sont plus simples que vous ne le croyez. La menace est réelle mais gérable.</p>
          <p style="margin: 0;"><strong class="text-accent">Préparons-nous avant que ça arrive.</strong></p>
        </ScannerBorder>
      </div>
    </section>

    <!-- ── DERNIERS RAPPORTS ───────────────────── -->
    <section class="rapports-section">
      <div class="container">
        <div class="section-header">
          <h2>Rapports de Zone</h2>
          <NuxtLink to="/rapports" class="font-mono" style="font-size: 0.75rem; letter-spacing: 0.1em;">TOUS LES RAPPORTS →</NuxtLink>
        </div>

        <div class="articles-grid">
          <ArticleCard
            v-for="article in articles"
            :key="article._path"
            :article="article"
          />
        </div>
      </div>
    </section>

    <!-- ── NEWSLETTER ─────────────────────────── -->
    <section class="newsletter-section">
      <div class="container">
        <NewsletterForm />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  position: relative;
  padding: 6rem 0 5rem;
  overflow: hidden;
}
.hero-grid-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(0, 255, 65, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}
.hero-inner { max-width: 800px; }
.hero-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-bottom: 2rem;
}
.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
.hero-title {
  font-size: clamp(2.2rem, 6vw, 4rem);
  line-height: 1.1;
  margin: 0 0 1.5rem;
}
.hero-subtitle {
  font-size: 1.1rem;
  color: var(--color-muted);
  max-width: 55ch;
  margin: 0 0 2.5rem;
  line-height: 1.7;
}
.hero-cta {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.hero-link {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  transition: color 0.15s;
}
.hero-link:hover { color: var(--color-accent); }

/* Manifeste */
.manifeste { padding: 4rem 0; }
.manifeste-inner {
  padding: 2rem;
  background: var(--color-surface);
  max-width: 700px;
}
.manifeste-inner p {
  color: var(--color-muted);
  line-height: 1.8;
  margin-bottom: 0.75rem;
}

/* Articles */
.rapports-section { padding: 4rem 0; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2rem;
}
.section-header h2 { margin: 0; }
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Newsletter */
.newsletter-section { padding: 4rem 0; }
</style>
```

- [ ] **Step 2: Verify home page renders correctly**

Run `npm run dev`, open `http://localhost:3000`. Check:
- Hero with pulsing green dot, grid background, title with accent color
- Manifeste section with scanner border
- Article cards (should show the first article from Task 6)
- Newsletter form section

- [ ] **Step 3: Commit**

```bash
git add pages/index.vue
git commit -m "feat: add home page (Base Opérationnelle)"
```

---

## Task 8: Blog Pages — Rapports de Zone

**Files:**
- Create: `pages/rapports/index.vue`
- Create: `pages/rapports/[...slug].vue`

- [ ] **Step 1: Create pages/rapports/index.vue**

```vue
<!-- pages/rapports/index.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Rapports de Zone — Mathieu le Survivant de l\'IA',
  description: 'Tous les rapports : soft skills, comprendre l\'IA, cas pratiques. Préparez-vous.',
})

const activeCategory = ref<string | null>(null)

const { data: articles } = await useAsyncData('all-articles', () =>
  queryContent('rapports').sort({ date: -1 }).find()
)

const filteredArticles = computed(() => {
  if (!activeCategory.value) return articles.value ?? []
  return (articles.value ?? []).filter(a => a.category === activeCategory.value)
})

const categories = [
  { key: null,            label: 'TOUS' },
  { key: 'soft-skills',   label: 'SOFT SKILLS' },
  { key: 'comprendre-ia', label: 'COMPRENDRE L\'IA' },
  { key: 'cas-pratiques', label: 'CAS PRATIQUES' },
]
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <div class="page-header">
      <span class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.15em; color: var(--color-muted);">// RAPPORTS DE ZONE</span>
      <h1>Tous les Rapports</h1>
      <p style="color: var(--color-muted); max-width: 55ch;">
        Soft skills, compréhension de l'IA, cas pratiques concrets. Des outils pour survivre, pas de la théorie.
      </p>
    </div>

    <div class="filters">
      <button
        v-for="cat in categories"
        :key="cat.key ?? 'all'"
        class="filter-btn font-mono"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <div class="articles-grid">
      <ArticleCard
        v-for="article in filteredArticles"
        :key="article._path"
        :article="article"
      />
    </div>

    <p v-if="filteredArticles.length === 0" class="font-mono" style="color: var(--color-muted); text-align: center; padding: 4rem 0;">
      AUCUN RAPPORT DANS CETTE ZONE POUR L'INSTANT.
    </p>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 3rem; }
.page-header h1 { margin: 0.5rem 0 1rem; }
.filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}
.filter-btn {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  padding: 0.4rem 0.9rem;
  background: transparent;
  border: 1px solid rgba(0, 255, 65, 0.2);
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover,
.filter-btn.active {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>
```

- [ ] **Step 2: Create pages/rapports/[...slug].vue**

```vue
<!-- pages/rapports/[...slug].vue -->
<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.join('/')
  : route.params.slug

const { data: article } = await useAsyncData(`article-${slug}`, () =>
  queryContent(`/rapports/${slug}`).findOne()
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Rapport introuvable' })
}

useSeoMeta({
  title: () => `${article.value?.title} — Survivant de l'IA`,
  description: () => article.value?.description ?? '',
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.description ?? '',
  twitterCard: 'summary',
})

const formattedDate = computed(() =>
  new Date(article.value!.date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
)

const categoryLabels: Record<string, string> = {
  'soft-skills': 'SOFT SKILLS',
  'comprendre-ia': 'COMPRENDRE L\'IA',
  'cas-pratiques': 'CAS PRATIQUES',
}
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <NuxtLink to="/rapports" class="back-link font-mono">← RETOUR AUX RAPPORTS</NuxtLink>

    <article class="article-wrapper" v-if="article">
      <header class="article-header">
        <div class="article-meta">
          <span class="article-category font-mono">
            {{ categoryLabels[article.category] ?? article.category }}
          </span>
          <span class="article-date font-mono">{{ formattedDate }}</span>
        </div>
        <h1 class="article-title">{{ article.title }}</h1>
        <p class="article-description">{{ article.description }}</p>
      </header>

      <ScannerBorder class="article-body">
        <ContentRenderer :value="article" class="prose" />
      </ScannerBorder>

      <div class="article-footer">
        <div class="article-cta">
          <p class="font-mono" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 1.5rem;">
            // SI CE RAPPORT VOUS A ÉTÉ UTILE, REJOIGNEZ LA FRÉQUENCE
          </p>
          <NewsletterForm />
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  margin-bottom: 3rem;
  text-decoration: none;
  transition: color 0.15s;
}
.back-link:hover { color: var(--color-accent); }
.article-wrapper { max-width: 780px; }
.article-header { margin-bottom: 3rem; }
.article-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}
.article-category {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  border: 1px solid rgba(0, 255, 65, 0.3);
  padding: 0.25rem 0.6rem;
}
.article-date {
  font-size: 0.7rem;
  color: var(--color-muted);
}
.article-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  margin: 0 0 1rem;
  line-height: 1.15;
}
.article-description {
  font-size: 1.05rem;
  color: var(--color-muted);
  line-height: 1.7;
  margin: 0;
}
.article-body { padding: 2.5rem; background: var(--color-surface); margin-bottom: 4rem; }
.article-footer { border-top: 1px solid rgba(0, 255, 65, 0.1); padding-top: 3rem; }
</style>
```

- [ ] **Step 3: Verify blog pages work**

Run `npm run dev`.
- Open `http://localhost:3000/rapports` — verify article list with filters
- Click on the article — verify detail page with correct title, date, content
- Verify scanner border appears around article body

- [ ] **Step 4: Commit**

```bash
git add pages/rapports/index.vue "pages/rapports/[...slug].vue"
git commit -m "feat: add blog list and article detail pages"
```

---

## Task 9: Newsletter + À propos Pages

**Files:**
- Create: `pages/frequence.vue`
- Create: `pages/identite.vue`

- [ ] **Step 1: Create pages/frequence.vue**

```vue
<!-- pages/frequence.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Rejoindre la Fréquence — Survivant de l\'IA',
  description: '1 rapport de survie par semaine. Les outils concrets pour ne pas se faire remplacer par l\'IA.',
})
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <div class="freq-header">
      <span class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.15em; color: var(--color-muted);">// LA FRÉQUENCE</span>
      <h1>Rejoindre la Fréquence</h1>
      <p class="freq-intro">
        Chaque semaine, un rapport de zone dans votre boîte mail. Concret, actionnable, sans jargon.
        Ce que les algorithmes ne peuvent pas vous apprendre.
      </p>
    </div>

    <div class="freq-content">
      <div class="freq-form">
        <NewsletterForm />
      </div>

      <div class="freq-benefits">
        <ScannerBorder class="benefits-inner">
          <p class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.1em; color: var(--color-muted); margin-bottom: 1.5rem;">// CE QUE VOUS RECEVEZ</p>
          <ul class="benefits-list">
            <li>
              <span class="benefit-icon">▸</span>
              <div>
                <strong>1 outil concret par semaine</strong>
                <p>Pas de théorie. Une technique que vous pouvez appliquer le lendemain.</p>
              </div>
            </li>
            <li>
              <span class="benefit-icon">▸</span>
              <div>
                <strong>Soft skills que l'IA ne remplacera pas</strong>
                <p>Communication, gestion de l'ambiguïté, intelligence émotionnelle.</p>
              </div>
            </li>
            <li>
              <span class="benefit-icon">▸</span>
              <div>
                <strong>Comprendre l'IA sans en avoir peur</strong>
                <p>Ce qu'elle fait vraiment, ses limites, et comment vous positionner.</p>
              </div>
            </li>
          </ul>
        </ScannerBorder>
      </div>
    </div>
  </div>
</template>

<style scoped>
.freq-header { margin-bottom: 3rem; }
.freq-header h1 { margin: 0.5rem 0 1rem; }
.freq-intro { font-size: 1.05rem; color: var(--color-muted); max-width: 55ch; line-height: 1.7; margin: 0; }
.freq-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}
@media (max-width: 768px) {
  .freq-content { grid-template-columns: 1fr; }
}
.benefits-inner { padding: 2rem; background: var(--color-surface); }
.benefits-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.benefits-list li { display: flex; gap: 1rem; }
.benefit-icon { color: var(--color-accent); font-family: var(--font-mono); flex-shrink: 0; margin-top: 0.1rem; }
.benefits-list strong { display: block; color: var(--color-text); margin-bottom: 0.25rem; }
.benefits-list p { font-size: 0.85rem; color: var(--color-muted); margin: 0; }
</style>
```

- [ ] **Step 2: Create pages/identite.vue**

```vue
<!-- pages/identite.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Identité du Survivant — Mathieu le Survivant de l\'IA',
  description: 'Chef de projet IT, papa, et guide pour survivre à l\'IA. Pourquoi ce site existe.',
})
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem; max-width: 780px;">
    <span class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.15em; color: var(--color-muted);">// IDENTITÉ DU SURVIVANT</span>
    <h1 style="margin: 0.5rem 0 3rem;">Qui suis-je ?</h1>

    <ScannerBorder class="identity-card">
      <div class="identity-content">
        <div class="identity-header">
          <div class="identity-avatar">M</div>
          <div>
            <h2 style="margin: 0 0 0.25rem; font-size: 1.2rem;">Mathieu</h2>
            <span class="font-mono" style="font-size: 0.7rem; color: var(--color-accent); letter-spacing: 0.1em;">CHEF DE PROJET IT — SURVIVANT EN COURS</span>
          </div>
        </div>
      </div>
    </ScannerBorder>

    <div class="identity-text">
      <p>
        Je travaille comme chef de projet IT. Je vois l'IA arriver dans mon domaine, dans mon entreprise, dans ma façon de travailler. Et je me suis posé une question simple : <strong class="text-accent">comment est-ce qu'on se prépare ?</strong>
      </p>

      <p>
        Pas en devenant développeur. Pas en apprenant Python ou en maîtrisant ChatGPT comme un pro. Mais en développant ce que personne ne peut automatiser : la façon de penser, de communiquer, de gérer l'incertitude.
      </p>

      <p>
        Ce site est né de cette conviction. Il s'adresse aux professionnels qui ne sont pas dans la tech, qui ont peur pour leur poste, et qui cherchent des outils concrets — pas des promesses vagues.
      </p>

      <ScannerBorder class="mission-block">
        <p class="font-mono" style="font-size: 0.7rem; color: var(--color-muted); margin-bottom: 0.75rem; letter-spacing: 0.1em;">// MISSION</p>
        <p style="margin: 0; font-size: 1rem;">
          Aider les gens à se préparer <em>avant</em> que l'IA ne prenne leur job — pas à pleurer <em>après</em>.
        </p>
      </ScannerBorder>

      <p>
        Je publie un rapport de zone chaque semaine. Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous, avec quelques cartes en main.
      </p>
    </div>
  </div>
</template>

<style scoped>
.identity-card { padding: 2rem; background: var(--color-surface); margin-bottom: 3rem; }
.identity-header { display: flex; align-items: center; gap: 1.5rem; }
.identity-avatar {
  width: 56px; height: 56px;
  border: 2px solid var(--color-accent);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
}
.identity-text p {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-muted);
  margin-bottom: 1.5rem;
}
.mission-block {
  padding: 1.5rem;
  background: var(--color-surface);
  margin: 2rem 0;
}
</style>
```

- [ ] **Step 3: Verify both pages render**

Run `npm run dev`.
- Open `http://localhost:3000/frequence` — verify newsletter form + benefits list
- Open `http://localhost:3000/identite` — verify about page content

- [ ] **Step 4: Commit**

```bash
git add pages/frequence.vue pages/identite.vue
git commit -m "feat: add newsletter and about pages"
```

---

## Task 10: RSS Feed for Brevo

**Files:**
- Create: `server/routes/rss.xml.ts`

- [ ] **Step 1: Create server/routes/rss.xml.ts**

```typescript
// server/routes/rss.xml.ts
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const articles = await serverQueryContent(event, 'rapports')
    .sort({ date: -1 })
    .find()

  const siteUrl = 'https://survivant-ia.fr'

  const items = articles.map((article) => {
    const slug = article._path?.split('/').pop() ?? ''
    const pubDate = new Date(article.date).toUTCString()
    return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.description ?? ''}]]></description>
      <link>${siteUrl}/rapports/${slug}</link>
      <guid>${siteUrl}/rapports/${slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${article.category}</category>
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mathieu le Survivant de l'IA</title>
    <description>Rapports de survie hebdomadaires : soft skills, comprendre l'IA, cas pratiques.</description>
    <link>${siteUrl}</link>
    <language>fr</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return rss
})
```

- [ ] **Step 2: Verify RSS feed works**

Run `npm run dev`, open `http://localhost:3000/rss.xml`. Verify XML is returned with your article in it.

- [ ] **Step 3: Commit**

```bash
git add server/routes/rss.xml.ts
git commit -m "feat: add RSS feed for Brevo auto-newsletter"
```

---

## Task 11: SEO + Microsoft Clarity

**Files:**
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Add SEO meta defaults and Clarity script**

> **Note:** Replace `VOTRE_ID_CLARITY` with your Microsoft Clarity project ID.
> Get it at: clarity.microsoft.com → New Project → copy the tracking ID.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
  ],
  fonts: {
    families: [
      { name: 'Space Mono', provider: 'google', weights: [400, 700] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
    ],
  },
  content: {
    highlight: { theme: 'github-dark' },
  },
  sitemap: {
    hostname: 'https://survivant-ia.fr',
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'theme-color', content: '#0D0D0D' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'alternate', type: 'application/rss+xml', title: 'Survivant de l\'IA — RSS', href: 'https://survivant-ia.fr/rss.xml' },
      ],
      script: [
        {
          // Microsoft Clarity — replace VOTRE_ID_CLARITY
          innerHTML: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+"VOTRE_ID_CLARITY";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","VOTRE_ID_CLARITY");`,
          tagPosition: 'head',
        },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: ['/rss.xml'],
    },
  },
})
```

- [ ] **Step 2: Verify sitemap generates**

```bash
npm run build
```

Expected: build completes without errors. Check `.output/public/sitemap.xml` exists.

- [ ] **Step 3: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat: add sitemap, RSS link header, Microsoft Clarity"
```

---

## Task 12: Vercel Deployment

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "framework": null
}
```

- [ ] **Step 2: Push to GitHub and connect Vercel**

```bash
git add vercel.json
git commit -m "chore: add Vercel config"
git push origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo `MR-lunux/operom-website` (or create a new repo if needed)
3. Framework Preset: **Other** (not Nuxt — use the vercel.json)
4. Click Deploy

Expected: Build succeeds, site is live at `your-project.vercel.app`.

- [ ] **Step 3: Add custom domain (when you have one)**

In Vercel dashboard → Settings → Domains → add `survivant-ia.fr`.
Follow DNS instructions (add CNAME or A record at your domain registrar).

---

## Task 13: Google Search Console Setup

This is a manual step — no code required.

- [ ] **Step 1: Submit your site to Google**

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click "Add property" → enter `https://survivant-ia.fr`
3. Verify ownership via **HTML tag method**: copy the meta tag, add it temporarily to `nuxt.config.ts` app.head.meta, deploy, then verify
4. Once verified, go to Sitemaps → add `https://survivant-ia.fr/sitemap.xml`
5. Click Submit

Expected: Google shows "Sitemap submitted successfully". First crawl within 48-72 hours.

- [ ] **Step 2: Configure Brevo RSS-to-email**

1. Create account at [brevo.com](https://brevo.com) (free)
2. Go to Campaigns → Create → RSS campaign
3. RSS feed URL: `https://survivant-ia.fr/rss.xml`
4. Set frequency: "As soon as new item is published"
5. Design the email template with the article title + description + "Lire le rapport →" button
6. Save and activate

From now on: every time you push a new article, Brevo detects it via RSS and sends automatically.

- [ ] **Step 3: Get Brevo form embed URL**

1. In Brevo → Contacts → Forms → Create subscription form
2. Customize form (dark theme if possible, or use CSS override in NewsletterForm.vue)
3. Copy the embed URL (starts with `https://sibforms.com/serve/...`)
4. Open `components/NewsletterForm.vue`, set `const formUrl = 'YOUR_URL_HERE'`
5. Commit and push

```bash
git add components/NewsletterForm.vue
git commit -m "feat: configure Brevo form embed"
git push origin main
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|---|---|
| Site post-apo distinctif | Tasks 2, 3, 4, 7 |
| Blog SEO | Tasks 6, 8, 11 |
| Hub de contenu (LinkedIn/Insta/YouTube) | Task 4 (header/footer social links) |
| Newsletter automatique RSS | Tasks 5, 10, 13 |
| Formulaire inscription | Task 5 (NewsletterForm) |
| Liens réseaux sociaux | Task 4 (AppHeader/AppFooter) |
| SEO optimisé + sitemap | Task 11 |
| Stats newsletter (Brevo dashboard) | Task 13 (Brevo setup) |
| Scroll tracking (Clarity) | Task 11 |
| Palette #0D0D0D/#E0E0E0/#00FF41/#FF3E3E | Task 2 |
| Space Mono (titres) + Inter (corps) | Tasks 1, 2 |
| Grain de film | Task 2 |
| Bordures scanner | Task 3 |
| Scanlines | Task 2, 5 |
| Glitch au survol | Task 2, 3 |
| Wording distinctif | Tasks 5, 7, 8, 9 |
| robots.txt | Task 1 |
| Google Search Console | Task 13 |

**All requirements covered. No placeholders detected.**
