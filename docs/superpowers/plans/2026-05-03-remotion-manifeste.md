# Remotion Manifeste V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produire une vidéo manifeste de 30 s pour Survivant-IA, format vertical 9:16 + dérivé 4:5 LinkedIn (safe-zone), 100 % motion graphics codée en Remotion, voix-off Mathieu (MV7+), musique générée via strudel-claude. Persona "Le Survivant" — hook : « Je ne suis pas un coach IA. Je suis le Survivant. » CTA : `survivant-ia.ch`.

**⚠️ DA UPDATE (2026-05-03 fin de journée) :** Pendant la rédaction de ce plan, le site est passé de la DA brutaliste à **V2 Editorial Dark** (sage `#5BA37A` + Playfair italic + warm dark `#0F0F0E` + cream text). Le hook utilise le **pattern hybride éditorial validé (candidat B)** : "JE NE SUIS PAS UN COACH IA." en Inter 800 caps + "le Survivant." en Playfair italique sage. Tasks 2, 3, 10, 14 sont entièrement réécrites pour V2. Tasks 4-9, 11-13 héritent automatiquement des tokens V2 via `theme.ts`. Voir spec §10 pour les détails du pattern.

**Architecture:** Sous-projet React/Remotion isolé dans `video/` à la racine du repo Nuxt actuel. Compositions paramétrées par prop `format` ('9:16' | '4:5'), safe-zone partagée 1080×1350 centrée. Cinq beats narratifs implémentés en composants `Beat{1..5}*.tsx` orchestrés via `<Sequence>` dans `Manifeste.tsx`. Audio (voix-off, musique) globalement monté au niveau Manifeste ; SFX co-localisés dans chaque Beat (sync visuel + audio dans le même fichier). Animations frame-driven (`useCurrentFrame()`), jamais CSS — pour render MP4 déterministe.

**Tech Stack:** Remotion 4.x · React 18 · TypeScript strict · TailwindCSS · `@remotion/google-fonts` (Space Mono, Inter) · ffmpeg (encodage MP3) · strudel-claude (generation musicale, repo séparé). Pas de framework de test : validation = preview Remotion Studio + render visuel humain.

**Spec source :** `docs/superpowers/specs/2026-05-03-remotion-manifeste-design.md`

**File map:**

Repo root (modifications) :
- `.gitignore` — **MODIFIER** : ajouter règles Remotion sub-project

Nouveau sous-projet `video/` :
- `video/package.json` — **GÉNÉRÉ** par `npx create-video` puis modifié (scripts render multi-format)
- `video/remotion.config.ts` — **GÉNÉRÉ** par create-video
- `video/tsconfig.json` — **GÉNÉRÉ**
- `video/tailwind.config.ts` — **GÉNÉRÉ**
- `video/src/Root.tsx` — **REMPLACER** : déclare 2 compositions (9:16, 4:5)
- `video/src/theme.ts` — **CRÉER** : palette, fonts, dimensions, type Format
- `video/src/captions.ts` — **CRÉER** : transcription + timings 5 beats
- `video/src/components/KickerLabel.tsx` — **CRÉER** : carré vert frame-driven spin
- `video/src/components/BrandFrame.tsx` — **CRÉER** : wrapper safe-zone + slot kicker
- `video/src/components/Strikethrough.tsx` — **CRÉER** : ligne animée rouge
- `video/src/animations/slamIn.ts` — **CRÉER** : helper spring overshoot
- `video/src/animations/typeIn.ts` — **CRÉER** : helper type-in lettre/mot
- `video/src/animations/glitchFlash.ts` — **CRÉER** : helper flash 1-frame
- `video/src/compositions/Manifeste.tsx` — **CRÉER** : composition principale + 5 séquences + audio mount
- `video/src/beats/Beat1Hook.tsx` — **CRÉER**
- `video/src/beats/Beat2Constat.tsx` — **CRÉER**
- `video/src/beats/Beat3Scanner.tsx` — **CRÉER**
- `video/src/beats/Beat4Unique.tsx` — **CRÉER**
- `video/src/beats/Beat5CTA.tsx` — **CRÉER**
- `video/assets/audio/voiceover.mp3` — **AJOUTER** (encodé depuis WAV MV7+)
- `video/assets/audio/music.mp3` — **AJOUTER** (depuis Strudel)
- `video/assets/sfx/{keyboard-type,woosh,glitch-flash,scan-loop,thud-stamp,tone-final}.mp3` — **AJOUTER**

**Conventions Remotion à connaître :**
- Toute animation doit dériver de `useCurrentFrame()` — pas de CSS `animation`/`transition` (Remotion render frame par frame, le CSS time-based ne fonctionne pas).
- `<Sequence from={N}>` décale le frame courant : à l'intérieur, `useCurrentFrame()` retourne 0 au frame N global.
- `<Audio src=... startFrom=...>` mountable dans n'importe quelle Sequence — Remotion sync exactement avec l'export.
- Importer audio/fonts via `staticFile('audio/voiceover.mp3')` (Remotion sert les assets depuis `public/`) OU directement via `import` ESM si configuré.

---

## Task 1: Setup `video/` sub-project + Remotion Skills

**Files:**
- Create: nouveau dossier `video/` (généré par CLI)
- Modify: `.gitignore`

- [ ] **Step 1 : Vérifier que tu es à la racine du repo**

Run :
```bash
cd /Users/mathieu/Documents/survivor && pwd
```
Expected : `/Users/mathieu/Documents/survivor`

- [ ] **Step 2 : Scaffold le projet Remotion**

Run :
```bash
npx create-video@latest video
```

Quand le CLI demande, choisir :
- **Template** : `Blank` (le plus minimal)
- **TailwindCSS** : `Yes`
- **Skills (Claude Code)** : `Yes` — installe automatiquement `remotion-dev/skills`
- **Package manager** : `npm`

Si l'install des Skills échoue ou n'est pas proposée, faire manuellement :
```bash
cd video && npx skills add remotion-dev/skills && cd ..
```

Expected : un nouveau dossier `video/` avec `package.json`, `src/Root.tsx`, `src/Composition.tsx`, etc.

- [ ] **Step 3 : Vérifier que Remotion Studio démarre**

Run :
```bash
cd video && npm run dev
```
Expected : ouvre `http://localhost:3000` avec le composition par défaut "MyComp" (template Blank).

Quand vérifié, kill avec `Ctrl+C` et `cd ..`.

- [ ] **Step 4 : Mettre à jour le .gitignore racine**

Modifier `/Users/mathieu/Documents/survivor/.gitignore`. Trouver la section `# Misc` et ajouter en bas du fichier :

```
# Remotion sub-project
video/node_modules
video/out
video/.cache
video/.remotion
video/assets/audio/*.wav
```

- [ ] **Step 5 : Vérifier qu'aucun fichier indésirable n'est traqué**

Run :
```bash
git status --short | head -30
```
Expected : voir `M .gitignore` et `?? video/` (le dossier comme untracked dans son ensemble — pas de `node_modules` qui apparait individuellement).

- [ ] **Step 6 : Commit**

```bash
git add .gitignore video/
git commit -m "$(cat <<'EOF'
chore(video): scaffold Remotion sub-project + install Remotion Skills

Sub-folder video/ généré via npx create-video (template Blank + TailwindCSS).
Remotion Skills officielles installées pour les conventions agent.
.gitignore mis à jour pour ignorer node_modules, out, cache, et .wav sources.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Theme tokens (`video/src/theme.ts`)

**Files:**
- Create: `video/src/theme.ts`

- [ ] **Step 1 : Créer le fichier theme.ts (tokens V2 Editorial Dark)**

```ts
// video/src/theme.ts
// Tokens dupliqués depuis le site Nuxt (app/assets/css/main.css — V2 Editorial Dark).
// Voir docs/superpowers/specs/2026-05-03-remotion-manifeste-design.md §2 et §10 pour la justification.

export const colors = {
  // Backgrounds (warm dark)
  bg: '#0F0F0E',
  surface: '#14140F',
  surface2: '#1A1A14',
  // Text (cream warm)
  text: '#E8E5DD',
  textSoft: '#C5C2BB',
  // Muteds
  muted: '#8A8780',
  mutedSoft: '#6E6B65',
  dim: '#5C5A52',
  // Accent (sage)
  accent: '#5BA37A',
  accentSoft: 'rgba(91, 163, 122, 0.18)',
  accentGlow: 'rgba(91, 163, 122, 0.25)',
  // Hairlines (V2 signature)
  rule: 'rgba(232, 229, 221, 0.12)',
  hairline: 'rgba(232, 229, 221, 0.1)',
  hairlineStrong: 'rgba(232, 229, 221, 0.25)',
  // Status colors (unchanged from V1)
  danger: '#FF3E3E',
  mutation: '#FFA630',
  protege: '#5BC0EB',
  croissance: '#3DDC84',
} as const;

export const fonts = {
  mono: '"Space Mono", ui-monospace, monospace',
  sans: 'Inter, system-ui, sans-serif',
  serif: '"Playfair Display", Georgia, serif',
  serifBody: '"Source Serif 4", Georgia, serif',
} as const;

export type Format = '9:16' | '4:5';

export const dimensions: Record<Format, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '4:5': { width: 1080, height: 1350 },
};

// Zone safe partagée par les deux formats — tout contenu critique doit y vivre.
export const SAFE_ZONE = { width: 1080, height: 1350 };

// Constantes de timing global (30 fps × 30 s = 900 frames).
export const FPS = 30;
export const DURATION_FRAMES = 900;
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

Run :
```bash
cd video && npx tsc --noEmit
```
Expected : pas d'erreur. Si erreur, vérifier que `tsconfig.json` n'a pas de `rootDir` qui exclut `src/theme.ts`.

- [ ] **Step 3 : Commit**

```bash
git add video/src/theme.ts
git commit -m "$(cat <<'EOF'
feat(video): add V2 Editorial Dark theme tokens

Tokens dupliqués depuis main.css (V2 Editorial Dark) : palette sage
(#5BA37A) sur warm dark (#0F0F0E), cream text (#E8E5DD), hairlines,
4 fonts (Space Mono, Inter, Playfair Display, Source Serif 4). Status
colors (danger/mutation/protege/croissance) inchangés.
Définit Format ('9:16' | '4:5') et SAFE_ZONE 1080x1350.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Configurer fonts Google (4 fonts) + Tailwind v4

**Files:**
- Modify: `video/package.json`
- Modify: `video/src/index.css` (Tailwind v4 CSS-first config)
- Create: `video/src/fonts.ts`

**Note V2 :** Le scaffolding a installé Tailwind v4 (`@remotion/tailwind-v4` + `tailwindcss: 4.0.0`). Tailwind v4 utilise une config **CSS-first** via `@theme` directement dans le fichier CSS — il n'y a pas de `tailwind.config.ts` à modifier. On définit nos tokens en CSS.

- [ ] **Step 1 : Installer `@remotion/google-fonts`**

Run :
```bash
cd video && npm install @remotion/google-fonts
```
Expected : ajouté à `dependencies` de `video/package.json`.

- [ ] **Step 2 : Créer fonts.ts qui pré-charge les 4 fonts V2**

```ts
// video/src/fonts.ts
import { loadFont as loadSpaceMono } from '@remotion/google-fonts/SpaceMono';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadSourceSerif } from '@remotion/google-fonts/SourceSerif4';

// Les fonts sont chargées au top-level — disponibles partout dans la composition.

// Space Mono : kicker, eyebrows, mono tech
loadSpaceMono('normal', { weights: ['400', '700'], subsets: ['latin'] });

// Inter : déclarations brutes uppercase, big titles
loadInter('normal', { weights: ['700', '800', '900'], subsets: ['latin'] });

// Playfair Display : phrases signatures en italique sage (pattern V2 du hero)
loadPlayfair('italic', { weights: ['400', '500', '800'], subsets: ['latin'] });

// Source Serif 4 : body éditorial (rare en V1, dispo si besoin)
loadSourceSerif('italic', { weights: ['400'], subsets: ['latin'] });
```

- [ ] **Step 3 : Étendre `video/src/index.css` avec les tokens V2 (Tailwind v4)**

Lire d'abord le contenu actuel pour préserver les imports Tailwind v4 que le scaffolding a mis. Le fichier ressemble probablement à :

```css
@import "tailwindcss";
```

Remplacer le contenu par :

```css
@import "tailwindcss";

/* V2 Editorial Dark — tokens partagés avec le site Survivant-IA */
@theme {
  --color-bg: #0F0F0E;
  --color-surface: #14140F;
  --color-surface-2: #1A1A14;
  --color-text: #E8E5DD;
  --color-text-soft: #C5C2BB;
  --color-muted: #8A8780;
  --color-muted-soft: #6E6B65;
  --color-dim: #5C5A52;
  --color-accent: #5BA37A;
  --color-accent-soft: rgba(91, 163, 122, 0.18);
  --color-accent-glow: rgba(91, 163, 122, 0.25);
  --color-rule: rgba(232, 229, 221, 0.12);
  --color-hairline: rgba(232, 229, 221, 0.1);
  --color-hairline-strong: rgba(232, 229, 221, 0.25);
  --color-danger: #FF3E3E;
  --color-mutation: #FFA630;
  --color-protege: #5BC0EB;
  --color-croissance: #3DDC84;

  --font-mono: 'Space Mono', ui-monospace, monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-serif-body: 'Source Serif 4', Georgia, serif;
}
```

(Les composants utiliseront `theme.ts` pour les valeurs en code TypeScript ; le CSS `@theme` sert à Tailwind si on l'utilise via classes utility. Les deux doivent rester en sync.)

- [ ] **Step 4 : Vérifier que les fonts se chargent dans Studio**

Run : `cd video && npm run dev`
Ouvrir Studio sur `http://localhost:3000`. La composition par défaut tourne toujours (on n'a pas encore branché les fonts au visual). Vérifier juste qu'il n'y a pas d'erreur de compilation.

Kill `Ctrl+C` après vérification.

- [ ] **Step 5 : Commit**

```bash
git add video/package.json video/package-lock.json video/src/fonts.ts video/src/index.css
git commit -m "$(cat <<'EOF'
feat(video): load 4 V2 fonts (Space Mono, Inter, Playfair, Source Serif 4)

Charge les 4 fonts V2 Editorial Dark via @remotion/google-fonts —
Space Mono (mono tech), Inter (déclarations brutes), Playfair Display
italique (phrases signatures sage), Source Serif 4 (body éditorial).
Tokens V2 ajoutés à index.css via @theme directive (Tailwind v4 CSS-first).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Component `KickerLabel`

**Files:**
- Create: `video/src/components/KickerLabel.tsx`

Le KickerLabel = carré vert qui spin avec halo, devant un texte uppercase Space Mono. Rotation **frame-driven**, pas CSS — sinon le render MP4 n'animera pas le carré.

- [ ] **Step 1 : Créer le fichier KickerLabel.tsx**

```tsx
// video/src/components/KickerLabel.tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fonts } from '../theme';

interface Props {
  children: React.ReactNode;
  /** Override la taille du texte (default: 0.7rem). */
  size?: string;
}

export const KickerLabel: React.FC<Props> = ({ children, size = '24px' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 8s rotation period (matche le composant Vue du site).
  const rotationPeriodFrames = 8 * fps;
  const rotation = (frame / rotationPeriodFrames) * 360;

  // Glyph size = 0.65em du font-size.
  // On force la taille en px pour stabilité visuelle dans Remotion.
  const fontSizePx = parseFloat(size);
  const glyphSize = fontSizePx * 0.65;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6em',
        fontFamily: fonts.mono,
        fontSize: size,
        fontWeight: 400,
        letterSpacing: '0.22em',
        color: colors.accent,
        textTransform: 'uppercase',
        lineHeight: 1,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: `${glyphSize}px`,
          height: `${glyphSize}px`,
          background: colors.accent,
          boxShadow: `0 0 6px ${colors.accentGlow}`,
          transform: `rotate(${rotation}deg)`,
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
};
```

- [ ] **Step 2 : Tester visuellement dans Studio**

Modifier temporairement `video/src/Root.tsx` pour ajouter une composition de test (NE PAS COMMITER cette modif — c'est juste pour vérifier visuellement) :

```tsx
// Ajouter au-dessus de la Composition existante dans Root.tsx :
import { KickerLabel } from './components/KickerLabel';

const KickerTest = () => (
  <div style={{ background: '#0D0D0D', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <KickerLabel>SURVIVANT-IA</KickerLabel>
  </div>
);

// puis :
<Composition id="KickerTest" component={KickerTest} durationInFrames={240} fps={30} width={1080} height={1920} />
```

Run : `cd video && npm run dev`. Dans Studio, sélectionner `KickerTest`. Le carré vert doit tourner sur 360° en 8 secondes (240 frames). Texte vert clignote zéro, glow visible.

Kill avec `Ctrl+C`.

- [ ] **Step 3 : Annuler la modif temporaire de Root.tsx**

```bash
cd /Users/mathieu/Documents/survivor && git checkout video/src/Root.tsx
```

- [ ] **Step 4 : Commit du composant final**

```bash
git add video/src/components/KickerLabel.tsx
git commit -m "$(cat <<'EOF'
feat(video): add KickerLabel component (frame-driven spinning glyph)

Réimplémente en React le composant Vue du site (KickerLabel.vue).
Rotation calculée depuis useCurrentFrame() — pas de CSS animation
pour garantir un export MP4 déterministe. Carré vert avec halo,
texte uppercase Space Mono, période de rotation 8s.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Component `BrandFrame` (safe-zone + slot kicker)

**Files:**
- Create: `video/src/components/BrandFrame.tsx`

Le BrandFrame est le wrapper utilisé par TOUS les beats. Il garantit :
- Safe-zone centrée 1080×1350 (le contenu critique vit dedans).
- Slot pour KickerLabel persistant.
- Padding standard pour respirer.

- [ ] **Step 1 : Créer le fichier BrandFrame.tsx**

```tsx
// video/src/components/BrandFrame.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors, dimensions, SAFE_ZONE, type Format } from '../theme';

interface Props {
  format: Format;
  /** Texte du KickerLabel (ex: "LE CONSTAT", "SCANNER"). */
  kicker: React.ReactNode;
  /** Contenu principal du beat — doit tenir dans SAFE_ZONE. */
  children: React.ReactNode;
  /** Override du background pour beats spéciaux (ex: gradient sur Beat 5). */
  background?: string;
}

export const BrandFrame: React.FC<Props> = ({ format, kicker, children, background }) => {
  const { width, height } = dimensions[format];

  // Décalage vertical pour centrer la safe-zone dans le canvas
  const safeZoneOffsetY = (height - SAFE_ZONE.height) / 2;

  return (
    <AbsoluteFill style={{ background: background ?? colors.bg }}>
      {/* Safe-zone wrapper — contenu critique */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: safeZoneOffsetY,
          width: SAFE_ZONE.width,
          height: SAFE_ZONE.height,
          padding: '64px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* Kicker en haut */}
        <div>{kicker}</div>

        {/* Contenu principal — centré */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {children}
        </div>

        {/* Bas réservé pour respirer (timestamp dev / vide en prod) */}
        <div style={{ height: '40px' }} />
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

Run : `cd video && npx tsc --noEmit`
Expected : pas d'erreur.

- [ ] **Step 3 : Commit**

```bash
git add video/src/components/BrandFrame.tsx
git commit -m "$(cat <<'EOF'
feat(video): add BrandFrame component (safe-zone wrapper + kicker slot)

Wrapper utilisé par tous les beats. Garantit que le contenu critique
vit dans la safe-zone 1080x1350, centrée verticalement dans le canvas
(9:16 ou 4:5). Slot kicker en haut, contenu principal centré, bas
réservé pour respirer.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Animation helpers (slamIn, typeIn, glitchFlash)

**Files:**
- Create: `video/src/animations/slamIn.ts`
- Create: `video/src/animations/typeIn.ts`
- Create: `video/src/animations/glitchFlash.ts`

- [ ] **Step 1 : Créer slamIn.ts**

```ts
// video/src/animations/slamIn.ts
import { spring } from 'remotion';

interface SlamInOptions {
  frame: number;
  fps: number;
  /** Décale le démarrage de l'animation (en frames). */
  delay?: number;
  /** Damping bas = bounce, damping haut = pas de bounce. Default 8 = bounce léger. */
  damping?: number;
  /** Mass et stiffness ajustent la "vitesse" du ressort. */
  mass?: number;
  stiffness?: number;
  /** Combien de frames pour atteindre la position finale (default: 30 = 1s). */
  durationInFrames?: number;
}

/**
 * Retourne une valeur 0 → 1 (avec overshoot possible) pour un effet "slam-in" brutaliste.
 * À multiplier sur scale/translateY/opacity.
 */
export function slamIn({
  frame,
  fps,
  delay = 0,
  damping = 8,
  mass = 0.5,
  stiffness = 200,
  durationInFrames = 30,
}: SlamInOptions): number {
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, mass, stiffness },
    durationInFrames,
  });
}
```

- [ ] **Step 2 : Créer typeIn.ts**

```ts
// video/src/animations/typeIn.ts

interface TypeInOptions {
  text: string;
  frame: number;
  /** Frame à laquelle le typing commence. */
  startFrame: number;
  /** Frames par caractère (default: 1 = très rapide à 30fps). */
  framesPerChar?: number;
  /** Si true, type-in mot par mot au lieu de lettre par lettre. */
  byWord?: boolean;
}

/**
 * Retourne le sous-string visible au frame courant pour un effet type-in.
 */
export function typeIn({
  text,
  frame,
  startFrame,
  framesPerChar = 1,
  byWord = false,
}: TypeInOptions): string {
  if (frame < startFrame) return '';

  const elapsed = frame - startFrame;

  if (byWord) {
    const words = text.split(' ');
    const wordsToShow = Math.min(words.length, Math.floor(elapsed / framesPerChar));
    return words.slice(0, wordsToShow).join(' ');
  }

  const charsToShow = Math.min(text.length, Math.floor(elapsed / framesPerChar));
  return text.slice(0, charsToShow);
}
```

- [ ] **Step 3 : Créer glitchFlash.ts**

```ts
// video/src/animations/glitchFlash.ts

interface GlitchFlashOptions {
  frame: number;
  /** Frame à laquelle le flash se déclenche (1 frame de durée par défaut). */
  triggerFrame: number;
  /** Durée du flash en frames (default: 1). */
  durationFrames?: number;
}

/**
 * Retourne 1 si on est dans la fenêtre du flash, 0 sinon.
 * À utiliser comme opacity sur un overlay blanc plein écran.
 */
export function glitchFlash({
  frame,
  triggerFrame,
  durationFrames = 1,
}: GlitchFlashOptions): number {
  if (frame < triggerFrame || frame >= triggerFrame + durationFrames) return 0;
  return 1;
}

/**
 * Retourne un offset horizontal simulant un glitch RGB-shift.
 * Utiliser sur transform translateX d'un calque dupliqué.
 */
export function glitchOffset({
  frame,
  triggerFrame,
  amplitude = 8,
}: {
  frame: number;
  triggerFrame: number;
  amplitude?: number;
}): number {
  // Random-but-deterministic offset basé sur le frame
  if (frame !== triggerFrame) return 0;
  const seed = (frame * 9301 + 49297) % 233280;
  return ((seed / 233280) * 2 - 1) * amplitude;
}
```

- [ ] **Step 4 : Vérifier la compilation TypeScript**

Run : `cd video && npx tsc --noEmit`
Expected : pas d'erreur.

- [ ] **Step 5 : Commit**

```bash
git add video/src/animations/
git commit -m "$(cat <<'EOF'
feat(video): add animation helpers (slamIn, typeIn, glitchFlash)

slamIn : spring overshoot 0->1 pour type qui slam (langage brutaliste).
typeIn : substring progressif pour effet type-in lettre/mot.
glitchFlash : flash 1-frame + glitchOffset pour transitions sèches.

Tous frame-driven (useCurrentFrame), pas de CSS animation.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Component `Strikethrough`

**Files:**
- Create: `video/src/components/Strikethrough.tsx`

Composant qui affiche un texte avec une barre rouge animée qui le strike de gauche à droite.

- [ ] **Step 1 : Créer le fichier Strikethrough.tsx**

```tsx
// video/src/components/Strikethrough.tsx
import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors } from '../theme';

interface Props {
  children: React.ReactNode;
  /** Frame à laquelle la barre commence à apparaitre. */
  startFrame: number;
  /** Frames pour traverser le texte (default: 8 ≈ 0.27s à 30fps — woosh rapide). */
  durationFrames?: number;
  /** Épaisseur de la barre en px. */
  thickness?: number;
  /** Couleur de la barre. */
  color?: string;
  /** Si true, atténue le texte sous la barre une fois la barre passée (default: true). */
  fadeText?: boolean;
}

export const Strikethrough: React.FC<Props> = ({
  children,
  startFrame,
  durationFrames = 8,
  thickness = 6,
  color = colors.danger,
  fadeText = true,
}) => {
  const frame = useCurrentFrame();

  // Progress 0 → 1 sur la durée du strike.
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  // Le texte se ternit après le passage de la barre.
  const textOpacity = fadeText && progress >= 1 ? 0.5 : 1;

  return (
    <span style={{ position: 'relative', display: 'inline-block', opacity: textOpacity, transition: 'opacity 0.1s' }}>
      <span>{children}</span>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: `${progress * 100}%`,
          height: `${thickness}px`,
          background: color,
          transform: 'translateY(-50%)',
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </span>
  );
};
```

- [ ] **Step 2 : Vérifier compilation**

Run : `cd video && npx tsc --noEmit`
Expected : pas d'erreur.

- [ ] **Step 3 : Commit**

```bash
git add video/src/components/Strikethrough.tsx
git commit -m "$(cat <<'EOF'
feat(video): add Strikethrough component (animated barred line)

Affiche un texte avec barre rouge qui le traverse de gauche à droite
en ~0.27s. Usage : "COACH IA" qu'on barre dans Beat 1, items de la liste
"BOOTCAMP / CERTIFS / COURS" dans Beat 4. Texte ternit après passage.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Captions (script + timings)

**Files:**
- Create: `video/src/captions.ts`

- [ ] **Step 1 : Créer le fichier captions.ts**

```ts
// video/src/captions.ts
// Transcription EXACTE de la voix-off Mathieu, avec timings frame-précis.
// 30 fps × 30 s = 900 frames au total.
//
// IMPORTANT : la voix-off doit suivre ces timings ; si Mathieu parle plus vite/lent,
// soit on ré-enregistre, soit on ajuste les timings ici (et les from= des Sequences
// dans Manifeste.tsx). Ne pas dériver — la sync est non-négociable.

export interface Caption {
  beat: 1 | 2 | 3 | 4 | 5;
  /** Texte intégral de la voix-off pour ce beat. */
  text: string;
  /** Frame de début (inclus). */
  startFrame: number;
  /** Frame de fin (exclus). */
  endFrame: number;
}

export const captions: Caption[] = [
  {
    beat: 1,
    text: 'Je ne suis pas un coach IA. Je suis le Survivant.',
    startFrame: 0,
    endFrame: 90, // 0:00 → 0:03
  },
  {
    beat: 2,
    text: "D'ici 2030, 40 % des métiers vont muter ou disparaître. Le tien aussi, peut-être.",
    startFrame: 90,
    endFrame: 270, // 0:03 → 0:09
  },
  {
    beat: 3,
    text: 'Sur survivant-ia.ch, tu scannes ton métier. Tu vois ce qui meurt, ce qui mute, ce qui survit.',
    startFrame: 270,
    endFrame: 510, // 0:09 → 0:17
  },
  {
    beat: 4,
    text: "Ici, il n'y a pas de bootcamp à 3000€. Pas de cours. Juste un signal clair, gratuit, chaque semaine.",
    startFrame: 510,
    endFrame: 750, // 0:17 → 0:25
  },
  {
    beat: 5,
    text: 'survivant-ia.ch. 5 minutes par semaine pour rester en avance.',
    startFrame: 750,
    endFrame: 900, // 0:25 → 0:30
  },
];

export function captionForBeat(beat: 1 | 2 | 3 | 4 | 5): Caption {
  const c = captions.find((x) => x.beat === beat);
  if (!c) throw new Error(`No caption for beat ${beat}`);
  return c;
}
```

- [ ] **Step 2 : Vérifier compilation**

Run : `cd video && npx tsc --noEmit`
Expected : pas d'erreur.

- [ ] **Step 3 : Commit**

```bash
git add video/src/captions.ts
git commit -m "$(cat <<'EOF'
feat(video): add captions module with full voice-over script + timings

5 segments alignés sur les 5 beats (frames 0-90, 90-270, 270-510,
510-750, 750-900). La transcription est la source de vérité — la voix-off
doit s'y aligner, et les Sequences de Manifeste.tsx utilisent ces frames.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Composition shell `Manifeste` + Root.tsx

**Files:**
- Create: `video/src/compositions/Manifeste.tsx`
- Replace: `video/src/Root.tsx`

À ce stade, la composition `Manifeste` est un shell : elle déclare les 5 Sequences mais chacune affiche un placeholder simple. On remplit les beats dans les tasks suivantes.

- [ ] **Step 1 : Créer placeholder beats vides (à remplir plus tard)**

Pour pouvoir tester le shell de la composition sans erreurs d'import, créer 5 fichiers placeholder. Chaque fichier exporte une fonction simple qui sera réécrite dans les tasks 11-15.

```tsx
// video/src/beats/Beat1Hook.tsx (placeholder)
import React from 'react';
import { BrandFrame } from '../components/BrandFrame';
import { type Format } from '../theme';

export const Beat1Hook: React.FC<{ format: Format }> = ({ format }) => (
  <BrandFrame format={format} kicker="BEAT 1 — HOOK">
    <div style={{ color: '#fff', fontSize: 60, textAlign: 'center' }}>Beat 1 placeholder</div>
  </BrandFrame>
);
```

Créer le même squelette pour `Beat2Constat.tsx`, `Beat3Scanner.tsx`, `Beat4Unique.tsx`, `Beat5CTA.tsx` en remplaçant juste le numéro et le label.

- [ ] **Step 2 : Créer Manifeste.tsx**

```tsx
// video/src/compositions/Manifeste.tsx
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { type Format } from '../theme';
import { Beat1Hook } from '../beats/Beat1Hook';
import { Beat2Constat } from '../beats/Beat2Constat';
import { Beat3Scanner } from '../beats/Beat3Scanner';
import { Beat4Unique } from '../beats/Beat4Unique';
import { Beat5CTA } from '../beats/Beat5CTA';
import '../fonts'; // assure le préchargement Google Fonts

interface Props {
  format: Format;
}

export const Manifeste: React.FC<Props> = ({ format }) => {
  return (
    <AbsoluteFill>
      {/* Beat 1 — Hook (frames 0-90) */}
      <Sequence from={0} durationInFrames={90}>
        <Beat1Hook format={format} />
      </Sequence>

      {/* Beat 2 — Constat (frames 90-270) */}
      <Sequence from={90} durationInFrames={180}>
        <Beat2Constat format={format} />
      </Sequence>

      {/* Beat 3 — Scanner (frames 270-510) */}
      <Sequence from={270} durationInFrames={240}>
        <Beat3Scanner format={format} />
      </Sequence>

      {/* Beat 4 — Unique (frames 510-750) */}
      <Sequence from={510} durationInFrames={240}>
        <Beat4Unique format={format} />
      </Sequence>

      {/* Beat 5 — CTA (frames 750-900) */}
      <Sequence from={750} durationInFrames={150}>
        <Beat5CTA format={format} />
      </Sequence>

      {/* TODO Task 16-17: monter <Audio src=voiceover.mp3 /> et <Audio src=music.mp3 volume=...> ici */}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3 : Remplacer Root.tsx pour déclarer les 2 compositions**

```tsx
// video/src/Root.tsx
import React from 'react';
import { Composition } from 'remotion';
import { Manifeste } from './compositions/Manifeste';
import { DURATION_FRAMES, FPS, dimensions } from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Manifeste-9-16"
        component={Manifeste}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={dimensions['9:16'].width}
        height={dimensions['9:16'].height}
        defaultProps={{ format: '9:16' as const }}
      />
      <Composition
        id="Manifeste-4-5"
        component={Manifeste}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={dimensions['4:5'].width}
        height={dimensions['4:5'].height}
        defaultProps={{ format: '4:5' as const }}
      />
    </>
  );
};
```

- [ ] **Step 4 : Si la template Blank avait un fichier `Composition.tsx`, le supprimer**

Run :
```bash
ls video/src/Composition.tsx 2>/dev/null && rm video/src/Composition.tsx || echo "déjà supprimé"
```

- [ ] **Step 5 : Vérifier compilation + Studio**

Run : `cd video && npx tsc --noEmit`
Expected : pas d'erreur.

Run : `cd video && npm run dev`
Expected : Studio s'ouvre, on voit deux compositions `Manifeste-9-16` et `Manifeste-4-5` dans la sidebar. Sélectionner l'une, scrubber la timeline : on voit successivement les 5 placeholders sur leurs intervalles. Kill avec `Ctrl+C`.

- [ ] **Step 6 : Commit**

```bash
git add video/src/compositions/ video/src/beats/ video/src/Root.tsx
git rm -f video/src/Composition.tsx 2>/dev/null || true
git commit -m "$(cat <<'EOF'
feat(video): add Manifeste composition shell + Root with 9:16 and 4:5

Manifeste.tsx orchestre les 5 beats via <Sequence> aux frames
0/90/270/510/750 (durées 90/180/240/240/150 = 900 total).
Root.tsx expose 2 compositions paramétrées Manifeste-9-16 (1080x1920)
et Manifeste-4-5 (1080x1350). Beats sont des placeholders pour l'instant.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Beat 1 — Hook (V2 hybride éditorial)

**Files:**
- Replace: `video/src/beats/Beat1Hook.tsx`

Beat 1 (frames 0-90, 0:00→0:03) — **pattern signature V2** (Inter caps brut + Playfair italique sage) :
- KickerLabel "SURVIVANT-IA" slam-in à frame 0.
- "JE NE SUIS PAS" type-in lettre par lettre Inter caps cream, frames 0-30.
- "UN COACH IA." Inter caps cream slam à frame 30, strike rouge à frame 45.
- "JE SUIS" Inter caps **soft** (textSoft, plus petit) slam à frame 60.
- "le Survivant." **Playfair Display italique sage** (casse normale, plus grand) slam à frame 75 + flash cream 1-frame.

Rappel : à l'intérieur d'une `<Sequence from={N}>`, `useCurrentFrame()` retourne le frame **local** (0 = début du beat). Toutes les valeurs de frame ci-dessous sont locales au beat.

- [ ] **Step 1 : Remplacer Beat1Hook.tsx**

```tsx
// video/src/beats/Beat1Hook.tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { BrandFrame } from '../components/BrandFrame';
import { KickerLabel } from '../components/KickerLabel';
import { Strikethrough } from '../components/Strikethrough';
import { slamIn } from '../animations/slamIn';
import { typeIn } from '../animations/typeIn';
import { glitchFlash } from '../animations/glitchFlash';
import { colors, fonts, type Format } from '../theme';

interface Props {
  format: Format;
}

export const Beat1Hook: React.FC<Props> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Type-in "JE NE SUIS PAS" frames 0-30
  const line1 = typeIn({ text: 'JE NE SUIS PAS', frame, startFrame: 0, framesPerChar: 2 });

  // "UN COACH IA." slam-in à frame 30
  const line2Slam = slamIn({ frame, fps, delay: 30, durationInFrames: 12 });
  const line2Visible = frame >= 30;

  // "JE SUIS" slam-in à frame 60 (smaller, soft)
  const jeSuisSlam = slamIn({ frame, fps, delay: 60, durationInFrames: 12 });
  const jeSuisVisible = frame >= 60;

  // "le Survivant." slam-in à frame 75 (Playfair italique sage — signature)
  const survivantSlam = slamIn({ frame, fps, delay: 75, durationInFrames: 18 });
  const survivantVisible = frame >= 75;

  // Cream flash 1-frame à frame 75 (V2 — pas blanc pur)
  const flash = glitchFlash({ frame, triggerFrame: 75 });

  // Sizes adaptées au format
  const decSize = format === '9:16' ? 130 : 110;        // déclarations Inter
  const jeSuisSize = format === '9:16' ? 90 : 76;       // "JE SUIS" plus petit
  const signatureSize = format === '9:16' ? 200 : 170;  // "le Survivant." Playfair plus grand

  return (
    <BrandFrame format={format} kicker={<KickerLabel>SURVIVANT-IA</KickerLabel>}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>
        {/* Line 1 — "JE NE SUIS PAS" type-in Inter caps cream */}
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: decSize,
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: colors.text,
            letterSpacing: '-0.01em',
            minHeight: decSize * 0.95,
          }}
        >
          {line1}
        </div>

        {/* Line 2 — "UN COACH IA." Inter caps cream + strikethrough red */}
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: decSize,
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: colors.text,
            letterSpacing: '-0.01em',
            opacity: line2Visible ? line2Slam : 0,
            transform: `scale(${line2Visible ? 0.92 + 0.08 * line2Slam : 0.92})`,
          }}
        >
          UN <Strikethrough startFrame={45} fadeText>COACH IA</Strikethrough>.
        </div>

        {/* "JE SUIS" Inter caps soft (smaller) */}
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: jeSuisSize,
            lineHeight: 1,
            textTransform: 'uppercase',
            color: colors.textSoft,
            letterSpacing: '0.01em',
            marginTop: 24,
            opacity: jeSuisVisible ? jeSuisSlam : 0,
            transform: `translateY(${jeSuisVisible ? (1 - jeSuisSlam) * 16 : 16}px)`,
          }}
        >
          JE SUIS
        </div>

        {/* "le Survivant." Playfair italic sage — phrase signature */}
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: signatureSize,
            lineHeight: 0.95,
            color: colors.accent,
            letterSpacing: '-0.025em',
            opacity: survivantVisible ? survivantSlam : 0,
            transform: `translateY(${survivantVisible ? (1 - survivantSlam) * 30 : 30}px)`,
          }}
        >
          le Survivant.
        </div>
      </div>

      {/* Cream flash 1-frame (V2 — pas blanc pur) */}
      {flash > 0 && (
        <AbsoluteFill style={{ background: colors.text, opacity: flash * 0.85, pointerEvents: 'none' }} />
      )}
    </BrandFrame>
  );
};
```

- [ ] **Step 2 : Tester dans Studio**

Run : `cd video && npm run dev`
Sélectionner `Manifeste-9-16`, scrubber 0 à 90 :
- Frame 0-30 : "JE NE SUIS PAS" se tape lettre par lettre, Inter caps cream
- Frame 30 : "UN COACH IA." slam-in Inter caps cream
- Frame 45 : barre rouge traverse "COACH IA" (strikethrough)
- Frame 60 : "JE SUIS" slam-in Inter caps soft (plus petit, cream-soft)
- Frame 75 : "le Survivant." slam-in Playfair italique sage (casse normale, plus grand) + cream flash 1-frame

Vérifier que Playfair Display italique se charge bien (pas de fallback Georgia visible).

Kill avec `Ctrl+C`.

- [ ] **Step 3 : Commit**

```bash
git add video/src/beats/Beat1Hook.tsx
git commit -m "$(cat <<'EOF'
feat(video): implement Beat 1 — Hook (V2 hybride éditorial)

Pattern signature V2 : Inter 800 caps cream pour les déclarations
brutes ("JE NE SUIS PAS UN COACH IA."), Inter caps soft pour "JE SUIS",
Playfair Display italique sage pour la phrase signature "le Survivant."
(casse normale, plus grand). Strikethrough rouge sur "COACH IA",
cream flash 1-frame (pas blanc pur) à frame 75.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Beat 2 — Le constat

**Files:**
- Replace: `video/src/beats/Beat2Constat.tsx`

Beat 2 (frames 90-270 global → 0-180 local, 0:03→0:09) :
- KickerLabel "LE CONSTAT".
- Compteur "00" → "40" frame-stepped sur frames 0-60 local.
- "%" claque en mutation orange à frame 60.
- Sous-titre "DES MÉTIERS VONT MUTER D'ICI 2030" type-in en stagger mot par mot.
- Au "Le tien aussi" (~frame 120), palette glisse rouge → orange.

- [ ] **Step 1 : Remplacer Beat2Constat.tsx**

```tsx
// video/src/beats/Beat2Constat.tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { BrandFrame } from '../components/BrandFrame';
import { KickerLabel } from '../components/KickerLabel';
import { slamIn } from '../animations/slamIn';
import { typeIn } from '../animations/typeIn';
import { colors, fonts, type Format } from '../theme';

interface Props {
  format: Format;
}

export const Beat2Constat: React.FC<Props> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Compteur 0 → 40 sur frames 0-60, frame-stepped (pas smooth).
  const rawCount = interpolate(frame, [0, 60], [0, 40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const count = Math.floor(rawCount); // step

  // "%" slam-in à frame 60.
  const percentSlam = slamIn({ frame, fps, delay: 60, durationInFrames: 12 });

  // Sous-titre type-in mot par mot à partir de frame 75.
  const subtitle = typeIn({
    text: 'DES MÉTIERS VONT MUTER',
    frame,
    startFrame: 75,
    framesPerChar: 4,
    byWord: true,
  });
  const subtitleLine2 = typeIn({
    text: "D'ICI 2030",
    frame,
    startFrame: 105,
    framesPerChar: 4,
    byWord: true,
  });

  // Palette glisse rouge → orange à partir de frame 120.
  const paletteShift = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const numberColor = interpolateColor(colors.danger, colors.mutation, paletteShift);

  // Adapter la taille au format.
  const numberSize = format === '9:16' ? 380 : 320;
  const subtitleSize = format === '9:16' ? 56 : 48;

  return (
    <BrandFrame
      format={format}
      kicker={<KickerLabel>LE CONSTAT</KickerLabel>}
      background={`radial-gradient(circle at 50% 50%, ${withAlpha(numberColor, 0.12)} 0%, ${colors.bg} 60%), ${colors.bg}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', fontFamily: fonts.sans }}>
        {/* Big number 40% */}
        <div
          style={{
            fontWeight: 900,
            fontSize: numberSize,
            lineHeight: 0.85,
            letterSpacing: '-0.03em',
            color: numberColor,
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          {String(count).padStart(2, '0')}
          <span
            style={{
              fontSize: numberSize * 0.55,
              color: colors.mutation,
              opacity: percentSlam,
              transform: `scale(${0.7 + 0.3 * percentSlam})`,
              transformOrigin: 'left bottom',
              marginLeft: '8px',
            }}
          >
            %
          </span>
        </div>

        {/* Sous-titre */}
        <div
          style={{
            fontWeight: 700,
            fontSize: subtitleSize,
            color: colors.text,
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          <div style={{ minHeight: subtitleSize }}>{subtitle}</div>
          <div style={{ minHeight: subtitleSize, marginTop: 12 }}>{subtitleLine2}</div>
        </div>
      </div>
    </BrandFrame>
  );
};

// Util locale : interpole entre 2 hex colors via RGB.
function interpolateColor(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '');
  return {
    r: parseInt(m.substring(0, 2), 16),
    g: parseInt(m.substring(2, 4), 16),
    b: parseInt(m.substring(4, 6), 16),
  };
}

function withAlpha(color: string, alpha: number): string {
  // Si déjà rgb/rgba, on patche ; sinon on suppose hex et on transforme en rgba.
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  if (color.startsWith('#')) {
    const { r, g, b } = hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}
```

- [ ] **Step 2 : Tester dans Studio**

Run : `cd video && npm run dev`
Sélectionner `Manifeste-9-16`, scrubber 90 à 270 (frames globaux) :
- 90-150 (local 0-60) : compteur "00" → "40"
- 150 (local 60) : "%" claque en orange
- 165-200 (local 75-110) : "DES MÉTIERS VONT MUTER" mot par mot
- 195-225 (local 105-135) : "D'ICI 2030"
- 210+ (local 120+) : nombre vire du rouge à l'orange

Kill `Ctrl+C`.

- [ ] **Step 3 : Commit**

```bash
git add video/src/beats/Beat2Constat.tsx
git commit -m "$(cat <<'EOF'
feat(video): implement Beat 2 — Le constat

Compteur 0->40 frame-stepped sur 60 frames, "%" slam orange à frame 60,
sous-titre type-in mot par mot, palette glisse danger->mutation à partir
du beat 120. Big number en danger red qui vire orange.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Beat 3 — Scanner

**Files:**
- Replace: `video/src/beats/Beat3Scanner.tsx`

Beat 3 (frames 270-510 global → 0-240 local, 0:09→0:17) :
- KickerLabel "SCANNER".
- Mock scanner : input avec "→ greffier(ère)", ligne de scan verte qui descend en boucle, glow.
- "VERDICT : MUTATION 58%" stamp à frame 150 local (frame 420 global) avec flash + thud.
- Sous-titre "ce qui meurt / mute / survit" en bas, fade-stagger.

- [ ] **Step 1 : Remplacer Beat3Scanner.tsx**

```tsx
// video/src/beats/Beat3Scanner.tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill } from 'remotion';
import { BrandFrame } from '../components/BrandFrame';
import { KickerLabel } from '../components/KickerLabel';
import { slamIn } from '../animations/slamIn';
import { typeIn } from '../animations/typeIn';
import { glitchFlash } from '../animations/glitchFlash';
import { colors, fonts, type Format } from '../theme';

interface Props {
  format: Format;
}

export const Beat3Scanner: React.FC<Props> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Type-in URL "→ survivant-ia.ch" puis remplace par "→ greffier(ère)".
  // 0-30 : URL se tape
  // 30-50 : URL effacée caractère par caractère
  // 50-80 : "greffier(ère)" se tape
  const urlText = '→ survivant-ia.ch';
  const jobText = '→ greffier(ère)';

  let inputContent = '';
  if (frame < 30) {
    inputContent = typeIn({ text: urlText, frame, startFrame: 0, framesPerChar: 1.5 });
  } else if (frame < 50) {
    const reverseProgress = Math.floor(((frame - 30) / 20) * urlText.length);
    inputContent = urlText.slice(0, urlText.length - reverseProgress);
  } else {
    inputContent = typeIn({ text: jobText, frame, startFrame: 50, framesPerChar: 2 });
  }

  // Ligne de scan verte qui descend en boucle (durée loop : 30 frames).
  const scanCycle = 30;
  const scanProgress = ((frame - 80) % scanCycle) / scanCycle;
  const scanVisible = frame >= 80 && frame < 150;

  // Verdict stamp à frame 150 (slam + flash).
  const verdictSlam = slamIn({ frame, fps, delay: 150, durationInFrames: 10 });
  const verdictFlash = glitchFlash({ frame, triggerFrame: 150, durationFrames: 2 });

  // Sous-titre "ce qui meurt / mute / survit" stagger à partir de frame 175.
  const sub1Opacity = interpolate(frame, [175, 190], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sub2Opacity = interpolate(frame, [185, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sub3Opacity = interpolate(frame, [195, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Tailles adaptées
  const inputFontSize = format === '9:16' ? 56 : 48;
  const verdictNumSize = format === '9:16' ? 200 : 160;

  return (
    <BrandFrame format={format} kicker={<KickerLabel>SCANNER</KickerLabel>}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          fontFamily: fonts.mono,
        }}
      >
        {/* Mock scanner box */}
        <div
          style={{
            border: `2px solid ${colors.accent}`,
            background: '#0d0d0d',
            padding: '40px 32px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: 280,
          }}
        >
          {/* Input line */}
          <div
            style={{
              fontSize: inputFontSize,
              color: colors.text,
              fontFamily: fonts.mono,
              minHeight: inputFontSize * 1.2,
              marginBottom: 24,
            }}
          >
            {inputContent}
            {/* Curseur clignotant */}
            {frame % 30 < 15 && <span style={{ color: colors.accent }}>_</span>}
          </div>

          {/* Status text */}
          <div style={{ fontSize: 22, color: colors.muted, fontFamily: fonts.mono }}>
            {frame >= 80 && frame < 150 ? 'analyse en cours...' : frame >= 150 ? 'analyse terminée' : ''}
          </div>

          {/* Ligne de scan */}
          {scanVisible && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${30 + scanProgress * 70}%`,
                height: 3,
                background: colors.accent,
                boxShadow: `0 0 15px ${colors.accent}`,
              }}
            />
          )}
        </div>

        {/* Verdict stamp */}
        <div
          style={{
            opacity: verdictSlam,
            transform: `scale(${0.7 + 0.3 * verdictSlam}) rotate(${(1 - verdictSlam) * -5}deg)`,
            border: `4px solid ${colors.mutation}`,
            padding: '24px 32px',
            background: 'rgba(255, 166, 48, 0.08)',
            display: frame >= 150 ? 'block' : 'none',
          }}
        >
          <div style={{ fontSize: 28, color: colors.mutation, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: fonts.mono }}>
            VERDICT : MUTATION
          </div>
          <div
            style={{
              fontSize: verdictNumSize,
              color: colors.danger,
              fontFamily: fonts.sans,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            58%
          </div>
        </div>

        {/* Sous-titre stagger */}
        <div style={{ display: 'flex', gap: 24, fontSize: 28, fontFamily: fonts.mono, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          <span style={{ opacity: sub1Opacity, color: colors.danger }}>ce qui meurt</span>
          <span style={{ opacity: sub2Opacity, color: colors.mutation }}>/ ce qui mute</span>
          <span style={{ opacity: sub3Opacity, color: colors.croissance }}>/ ce qui survit</span>
        </div>
      </div>

      {/* Flash blanc 2 frames sur stamp */}
      {verdictFlash > 0 && (
        <AbsoluteFill style={{ background: 'white', opacity: verdictFlash * 0.8, pointerEvents: 'none' }} />
      )}
    </BrandFrame>
  );
};
```

- [ ] **Step 2 : Tester dans Studio**

Run : `cd video && npm run dev`
Scrubber Manifeste-9-16 frames 270-510 :
- 270-300 : URL "→ survivant-ia.ch" se tape
- 300-320 : URL s'efface
- 320-360 : "→ greffier(ère)" se tape
- 350-420 : ligne de scan descend en boucle
- 420 : flash + verdict stamp "MUTATION 58%"
- 445+ : "ce qui meurt / mute / survit" apparait stagger

Kill `Ctrl+C`.

- [ ] **Step 3 : Commit**

```bash
git add video/src/beats/Beat3Scanner.tsx
git commit -m "$(cat <<'EOF'
feat(video): implement Beat 3 — Scanner

Type-in URL survivant-ia.ch puis efface et tape "greffier(ère)" pour
illustrer le scanner. Ligne de scan verte qui descend en boucle, status
"analyse en cours...". Verdict stamp "MUTATION 58%" qui claque à frame
150 local avec flash blanc 2-frames. Sous-titre stagger
"ce qui meurt / mute / survit" en couleurs danger/mutation/croissance.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Beat 4 — Ce qui me rend unique

**Files:**
- Replace: `video/src/beats/Beat4Unique.tsx`

Beat 4 (frames 510-750 global → 0-240 local, 0:17→0:25) :
- KickerLabel "L'UNIQUE".
- Liste qui apparait stagger : "BOOTCAMP À 3000€", "CERTIFICATIONS", "COURS EN LIGNE".
- Chaque ligne se fait barrer en rouge avec un swipe.
- "SIGNAL CLAIR. GRATUIT. HEBDO." apparait en accent green encadré, plus grand, à frame ~180 local.

- [ ] **Step 1 : Remplacer Beat4Unique.tsx**

```tsx
// video/src/beats/Beat4Unique.tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { BrandFrame } from '../components/BrandFrame';
import { KickerLabel } from '../components/KickerLabel';
import { Strikethrough } from '../components/Strikethrough';
import { slamIn } from '../animations/slamIn';
import { colors, fonts, type Format } from '../theme';

interface Props {
  format: Format;
}

const STRIKE_ITEMS: Array<{ text: string; appearFrame: number; strikeFrame: number }> = [
  { text: 'BOOTCAMP À 3000€', appearFrame: 0, strikeFrame: 30 },
  { text: 'CERTIFICATIONS', appearFrame: 40, strikeFrame: 70 },
  { text: 'COURS EN LIGNE', appearFrame: 80, strikeFrame: 110 },
];

export const Beat4Unique: React.FC<Props> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "SIGNAL CLAIR. GRATUIT. HEBDO." apparait à frame 180 local.
  const finalSlam = slamIn({ frame, fps, delay: 180, durationInFrames: 18 });
  const finalVisible = frame >= 180;

  // Sizes
  const itemSize = format === '9:16' ? 72 : 60;
  const finalSize = format === '9:16' ? 96 : 80;

  return (
    <BrandFrame format={format} kicker={<KickerLabel>L&apos;UNIQUE</KickerLabel>}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          fontFamily: fonts.sans,
        }}
      >
        {/* Liste à barrer */}
        {STRIKE_ITEMS.map((item) => {
          const slam = slamIn({ frame, fps, delay: item.appearFrame, durationInFrames: 12 });
          const visible = frame >= item.appearFrame;
          return (
            <div
              key={item.text}
              style={{
                fontSize: itemSize,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: colors.text,
                opacity: visible ? slam : 0,
                transform: `translateX(${visible ? (1 - slam) * -40 : -40}px)`,
              }}
            >
              <Strikethrough startFrame={item.strikeFrame} fadeText durationFrames={10}>
                {item.text}
              </Strikethrough>
            </div>
          );
        })}

        {/* SIGNAL CLAIR. GRATUIT. HEBDO. — V2 : cream text, sage hairline border */}
        <div
          style={{
            marginTop: 40,
            padding: '32px 40px',
            border: `1px solid ${colors.accent}`,
            background: colors.accentSoft,
            opacity: finalVisible ? finalSlam : 0,
            transform: `scale(${finalVisible ? 0.92 + 0.08 * finalSlam : 0.92})`,
            boxShadow: `0 0 24px ${colors.accentGlow}`,
          }}
        >
          <div
            style={{
              fontSize: finalSize,
              fontWeight: 900,
              textTransform: 'uppercase',
              color: colors.text,
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            SIGNAL CLAIR.
            <br />
            GRATUIT.
            <br />
            HEBDO.
          </div>
        </div>
      </div>
    </BrandFrame>
  );
};
```

- [ ] **Step 2 : Tester dans Studio**

Scrubber Manifeste-9-16 frames 510-750 :
- 510 : "BOOTCAMP À 3000€" slam-in
- 540 : barre rouge sur cette ligne
- 550 : "CERTIFICATIONS" slam-in
- 580 : barre rouge dessus
- 590 : "COURS EN LIGNE" slam-in
- 620 : barre rouge dessus
- 690+ : "SIGNAL CLAIR. GRATUIT. HEBDO." encadré vert qui slam

Kill `Ctrl+C`.

- [ ] **Step 3 : Commit**

```bash
git add video/src/beats/Beat4Unique.tsx
git commit -m "$(cat <<'EOF'
feat(video): implement Beat 4 — Ce qui me rend unique

Liste 3 items (BOOTCAMP À 3000€, CERTIFICATIONS, COURS EN LIGNE) qui
apparaissent stagger toutes les 40 frames et se font barrer en rouge.
Puis "SIGNAL CLAIR. GRATUIT. HEBDO." encadré en accent green slam à
frame 180 local — la promesse Survivant.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Beat 5 — CTA (V2 signature italique sage)

**Files:**
- Replace: `video/src/beats/Beat5CTA.tsx`

Beat 5 (frames 750-900 global → 0-150 local, 0:25→0:30) — **deuxième signature Playfair italique sage** (symétrie avec Beat 1) :
- KickerLabel "PRENDS LE VIRAGE".
- URL "SURVIVANT-IA.CH" centrée en sage Space Mono, cadre 2px sage avec soft glow breathing.
- "5 MIN / SEMAINE." Inter caps cream type-in mot par mot.
- "POUR RESTER" Inter caps soft (smaller).
- "**en avance.**" en **Playfair Display italique sage** (casse normale, plus grand) — clôture du film, miroir de "le Survivant." du Beat 1.
- Fond gradient sage subtle qui respire.

- [ ] **Step 1 : Remplacer Beat5CTA.tsx**

```tsx
// video/src/beats/Beat5CTA.tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { BrandFrame } from '../components/BrandFrame';
import { KickerLabel } from '../components/KickerLabel';
import { slamIn } from '../animations/slamIn';
import { typeIn } from '../animations/typeIn';
import { colors, fonts, type Format } from '../theme';

interface Props {
  format: Format;
}

export const Beat5CTA: React.FC<Props> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // URL slam-in à frame 0 local
  const urlSlam = slamIn({ frame, fps, delay: 0, durationInFrames: 18 });

  // Pulse breathing — V2 soft glow
  const breathPeriod = 1.5 * fps;
  const breath = Math.sin((frame / breathPeriod) * Math.PI * 2);
  const glow = 25 + 12 * breath; // softer que V1

  // "5 MIN / SEMAINE." type-in mot par mot à frame 30
  const promesseLine1 = typeIn({
    text: '5 MIN / SEMAINE.',
    frame,
    startFrame: 30,
    framesPerChar: 4,
    byWord: true,
  });

  // "POUR RESTER" à frame 60 (Inter caps soft)
  const restonsVisible = frame >= 60;
  const restonsSlam = slamIn({ frame, fps, delay: 60, durationInFrames: 12 });

  // "en avance." Playfair italique sage — signature, à frame 90
  const enAvanceVisible = frame >= 90;
  const enAvanceSlam = slamIn({ frame, fps, delay: 90, durationInFrames: 16 });

  // Fond gradient sage subtle qui respire (V2)
  const gradientAlpha = 0.10 + 0.06 * breath;
  const background = `radial-gradient(circle at 50% 60%, rgba(91, 163, 122, ${gradientAlpha}) 0%, ${colors.bg} 70%)`;

  // Sizes
  const urlSize = format === '9:16' ? 90 : 76;
  const promesseSize = format === '9:16' ? 56 : 48;
  const restonsSize = format === '9:16' ? 40 : 34;
  const signatureSize = format === '9:16' ? 130 : 110; // "en avance." Playfair

  return (
    <BrandFrame format={format} kicker={<KickerLabel>PRENDS LE VIRAGE</KickerLabel>} background={background}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        {/* URL — V2 cadre 2px sage + soft glow */}
        <div
          style={{
            border: `2px solid ${colors.accent}`,
            padding: '28px 44px',
            background: 'rgba(91, 163, 122, 0.04)',
            opacity: urlSlam,
            transform: `scale(${0.88 + 0.12 * urlSlam})`,
            boxShadow: `0 0 ${glow}px ${colors.accentGlow}`,
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: urlSize,
              fontWeight: 700,
              color: colors.accent,
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            SURVIVANT-IA.CH
          </div>
        </div>

        {/* "5 MIN / SEMAINE." Inter caps cream */}
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: promesseSize,
            color: colors.text,
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            minHeight: promesseSize * 1.2,
          }}
        >
          {promesseLine1}
        </div>

        {/* "POUR RESTER" Inter caps soft + "en avance." Playfair italique sage */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              fontFamily: fonts.sans,
              fontWeight: 800,
              fontSize: restonsSize,
              color: colors.textSoft,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              opacity: restonsVisible ? restonsSlam : 0,
              transform: `translateY(${restonsVisible ? (1 - restonsSlam) * 16 : 16}px)`,
            }}
          >
            POUR RESTER
          </div>
          <div
            style={{
              fontFamily: fonts.serif,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: signatureSize,
              color: colors.accent,
              lineHeight: 1,
              letterSpacing: '-0.025em',
              opacity: enAvanceVisible ? enAvanceSlam : 0,
              transform: `translateY(${enAvanceVisible ? (1 - enAvanceSlam) * 24 : 24}px)`,
            }}
          >
            en avance.
          </div>
        </div>
      </div>
    </BrandFrame>
  );
};
```

- [ ] **Step 2 : Tester dans Studio**

Scrubber Manifeste-9-16 frames 750-900 :
- 750 : URL "SURVIVANT-IA.CH" slam-in dans cadre 2px sage
- 750-900 : cadre sage pulse en soft glow breathing (V2)
- 780-810 : "5 MIN / SEMAINE." Inter caps cream type-in mot par mot
- 810-840 : "POUR RESTER" Inter caps soft slam-in
- 840-870 : "en avance." Playfair italique sage slam-in (casse normale, plus grand)
- 880-900 : tient sur la signature, cut sec à 900

Vérifier la symétrie italique : Beat 1 finit avec "le Survivant." Playfair sage, Beat 5 finit avec "en avance." Playfair sage. Cohérence brand.

Kill `Ctrl+C`.

- [ ] **Step 3 : Commit**

```bash
git add video/src/beats/Beat5CTA.tsx
git commit -m "$(cat <<'EOF'
feat(video): implement Beat 5 — CTA (V2 signature italique sage)

URL SURVIVANT-IA.CH en Space Mono sage dans cadre 2px sage avec soft
glow breathing (V2). "5 MIN / SEMAINE." type-in Inter caps cream.
"POUR RESTER" Inter caps soft. "en avance." en Playfair Display
italique sage — symétrie avec "le Survivant." du Beat 1, signature
qui ferme le film.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Glitch transitions entre beats

**Files:**
- Modify: `video/src/compositions/Manifeste.tsx`

Ajouter un overlay glitch-flash 1-frame aux 4 frontières entre beats (90, 270, 510, 750) pour le langage "cuts secs".

- [ ] **Step 1 : Modifier Manifeste.tsx**

Remplacer le contenu actuel par :

```tsx
// video/src/compositions/Manifeste.tsx
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { type Format, colors } from '../theme';
import { Beat1Hook } from '../beats/Beat1Hook';
import { Beat2Constat } from '../beats/Beat2Constat';
import { Beat3Scanner } from '../beats/Beat3Scanner';
import { Beat4Unique } from '../beats/Beat4Unique';
import { Beat5CTA } from '../beats/Beat5CTA';
import '../fonts';

interface Props {
  format: Format;
}

const TRANSITION_FRAMES = [90, 270, 510, 750];

export const Manifeste: React.FC<Props> = ({ format }) => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}>
        <Beat1Hook format={format} />
      </Sequence>

      <Sequence from={90} durationInFrames={180}>
        <Beat2Constat format={format} />
      </Sequence>

      <Sequence from={270} durationInFrames={240}>
        <Beat3Scanner format={format} />
      </Sequence>

      <Sequence from={510} durationInFrames={240}>
        <Beat4Unique format={format} />
      </Sequence>

      <Sequence from={750} durationInFrames={150}>
        <Beat5CTA format={format} />
      </Sequence>

      {/* Glitch transitions — 1 frame d'overlay à chaque jointure */}
      <GlitchTransitions />

      {/* TODO Task 17-18 : monter <Audio> voiceover + music ici */}
    </AbsoluteFill>
  );
};

const GlitchTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  // Si on est sur un frame de transition, afficher un overlay blanc 1 frame.
  const isTransition = TRANSITION_FRAMES.includes(frame);
  if (!isTransition) return null;

  return (
    <AbsoluteFill style={{ background: colors.text, opacity: 0.85, pointerEvents: 'none' }} />
  );
};
```

- [ ] **Step 2 : Tester dans Studio**

Scrubber `Manifeste-9-16` exactement aux frames 90, 270, 510, 750 :
- À chacun, on voit un flash blanc 1-frame.
- Aucun glitch sur les autres frames.

Kill `Ctrl+C`.

- [ ] **Step 3 : Commit**

```bash
git add video/src/compositions/Manifeste.tsx
git commit -m "$(cat <<'EOF'
feat(video): add 1-frame glitch transitions between beats

Overlay blanc 1-frame aux frontières 90, 270, 510, 750 — langage
"cuts secs" du brief brutaliste. Pas de fade, pas de crossfade.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: Voix-off — recording + integration

**Files:**
- Add: `video/assets/audio/voiceover.mp3`
- Modify: `video/src/compositions/Manifeste.tsx` (mount `<Audio>`)

**Action humaine requise (Mathieu) :** enregistrer la voix-off avec le Shure MV7+.

- [ ] **Step 1 : Préparer le script imprimable**

Imprimer ou afficher en grand le script suivant. La voix doit sonner posée, présente, légèrement sombre — pas timide.

```
[Beat 1 — 0:00 / 3 secondes]
Je ne suis pas un coach IA. Je suis le Survivant.

[Beat 2 — 0:03 / 6 secondes]
D'ici 2030, 40 % des métiers vont muter ou disparaître. Le tien aussi, peut-être.

[Beat 3 — 0:09 / 8 secondes]
Sur survivant-ia point ch, tu scannes ton métier. Tu vois ce qui meurt, ce qui mute, ce qui survit.

[Beat 4 — 0:17 / 8 secondes]
Ici, il n'y a pas de bootcamp à 3000 euros. Pas de cours. Juste un signal clair, gratuit, chaque semaine.

[Beat 5 — 0:25 / 5 secondes]
survivant-ia point ch. 5 minutes par semaine pour rester en avance.
```

(Note : "ch" se prononce "C-H" ou "point ch" selon la fluidité ; choisir ce qui sonne le mieux.)

- [ ] **Step 2 : Enregistrement**

Avec le MV7+ branché en USB-C :
- App de recording (QuickTime Player, GarageBand, Audacity, ou autre).
- Format source : WAV 24-bit / 48 kHz mono.
- Faire 2-3 prises complètes du script (~30s chacune).
- Garder la meilleure prise.
- Sauvegarder en `~/Documents/survivor/video/assets/audio/voiceover.wav` (sera ignoré par git via `.gitignore`).

- [ ] **Step 3 : Encoder en MP3 320 kbps via ffmpeg**

```bash
cd /Users/mathieu/Documents/survivor/video/assets/audio
ffmpeg -i voiceover.wav -codec:a libmp3lame -b:a 320k voiceover.mp3
```

Si ffmpeg n'est pas installé : `brew install ffmpeg`.

Vérifier que le fichier mp3 est ~1-3 Mo : `ls -lh voiceover.mp3`.

- [ ] **Step 4 : Vérifier la durée**

```bash
cd /Users/mathieu/Documents/survivor/video/assets/audio
ffprobe -i voiceover.mp3 -show_entries format=duration -v quiet -of csv="p=0"
```
Expected : valeur entre `28.5` et `31.5` (secondes). Si très loin de 30s, re-faire une prise plus rapide/lente.

- [ ] **Step 5 : Mounter `<Audio>` dans Manifeste.tsx**

Modifier `video/src/compositions/Manifeste.tsx`. Ajouter en haut :
```tsx
import { AbsoluteFill, Sequence, useCurrentFrame, Audio, staticFile } from 'remotion';
```

Et insérer dans le JSX retourné, juste après `<GlitchTransitions />` :
```tsx
<Audio src={staticFile('audio/voiceover.mp3')} />
```

Pour que `staticFile` fonctionne, créer le dossier `video/public/audio/` et y déplacer (ou copier) le mp3 :

```bash
cd /Users/mathieu/Documents/survivor/video
mkdir -p public/audio
cp assets/audio/voiceover.mp3 public/audio/voiceover.mp3
```

(Remotion sert les assets depuis `public/`. On garde une copie source dans `assets/` pour la traçabilité, et la copie servie depuis `public/`.)

- [ ] **Step 6 : Tester la sync dans Studio**

Run : `cd video && npm run dev`
Sélectionner Manifeste-9-16 et lire la composition de bout en bout (bouton play). Écouter au casque.

Critères :
- La voix démarre frame 0 sur "Je ne suis pas..."
- Beat 2 commence à frame 90 (~3.0s) en disant "D'ici 2030..."
- Beat 3 à frame 270 (~9.0s) en disant "Sur survivant-ia.ch..."
- Beat 4 à frame 510 (~17.0s) en disant "Ici, il n'y a pas..."
- Beat 5 à frame 750 (~25.0s) en disant "survivant-ia.ch. 5 minutes..."

Si drift > 100 ms sur un beat, deux options :
1. Re-faire une prise voix avec meilleur respect du timing.
2. Ajuster les `from` des `<Sequence>` dans Manifeste.tsx pour matcher la voix réelle (et mettre à jour `captions.ts` en parallèle).

Kill `Ctrl+C`.

- [ ] **Step 7 : Commit**

```bash
git add video/public/audio/voiceover.mp3 video/assets/audio/voiceover.mp3 video/src/compositions/Manifeste.tsx
git commit -m "$(cat <<'EOF'
feat(video): integrate voice-over (Mathieu, MV7+)

Voix-off enregistrée Shure MV7+, encodée MP3 320kbps. Mountée via
<Audio> au niveau de Manifeste — suit le frame courant, sync garantie.
Source WAV non commitée (gitignore *.wav). MP3 servi depuis public/audio/.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: Musique — generation Strudel + integration

**Files:**
- Add: `video/assets/audio/music.mp3`
- Add: `video/public/audio/music.mp3`
- Modify: `video/src/compositions/Manifeste.tsx`

**Préalable :** strudel-claude doit être installé séparément.

- [ ] **Step 1 : Cloner et démarrer strudel-claude (si pas déjà fait)**

```bash
cd ~/Documents
git clone https://github.com/renatoworks/strudel-claude.git
cd strudel-claude
npm install
npm run dev
```

Le serveur expose l'éditeur sur `http://localhost:3000` (note : conflit potentiel avec Remotion Studio — si les deux tournent, démarrer strudel-claude sur un autre port via `PORT=3001 npm run dev`).

- [ ] **Step 2 : Composer la musique via Strudel**

Depuis une session Claude Code dans le dossier `~/Documents/strudel-claude/`, demander à composer une piste de **30 secondes** (= 60 bars en 4/4 à 120 bpm, ou ajuster bpm) avec la structure suivante alignée sur les beats du manifeste :

| Beat | Durée | Direction sonore |
|------|-------|------------------|
| 1 (0:00-0:03) | 3s | Drone sub-bass minimal seul. Ligne de drum très loin / inaudible. |
| 2 (0:03-0:09) | 6s | Kick sourd qui entre, hi-hat sec discret, drone continue. |
| 3 (0:09-0:17) | 8s | Texture glitch/clic synchronisée au scanner — petits bursts irréguliers. Drone + kick conservés. |
| 4 (0:17-0:25) | 8s | Tension qui monte — ajout d'une note de basse pulsée, un drone aigu qui glisse. |
| 5 (0:25-0:30) | 5s | Drop sec à 0:25 (kick + sub-bass nu), résolution à 0:30 sur le drone seul. |

Niveau global : -18 dB sous la voix. Pas de mélodie complexe, pas de feel-good. **Pas de drop EDM**.

Demander à Claude (dans la session strudel-claude) de pousser le code via l'API REST `/api/code` puis `/api/play`. Itérer jusqu'à ce que ça sonne cohérent avec les beats Remotion.

- [ ] **Step 3 : Enregistrer le WAV depuis le browser strudel-claude**

Quand le patch est validé, utiliser le bouton "Record" de l'app pour enregistrer 30s en WAV. Sauvegarder le fichier en `~/Documents/survivor/video/assets/audio/music.wav`.

- [ ] **Step 4 : Encoder en MP3 320 kbps**

```bash
cd /Users/mathieu/Documents/survivor/video/assets/audio
ffmpeg -i music.wav -codec:a libmp3lame -b:a 320k music.mp3
cp music.mp3 ../../public/audio/music.mp3
```

(On garde le wav dans `assets/` pour la trace ; il est ignoré par git via `*.wav`.)

- [ ] **Step 5 : Mounter `<Audio>` musique dans Manifeste.tsx**

Modifier `video/src/compositions/Manifeste.tsx`. Juste après le `<Audio>` voiceover, ajouter :

```tsx
<Audio src={staticFile('audio/music.mp3')} volume={0.13} />
```

Note : `volume={0.13}` ≈ -18 dB sous le 1.0 unitaire (formule : `10^(-18/20) ≈ 0.126`). Ajuster à l'oreille si la voix est masquée.

- [ ] **Step 6 : Tester l'équilibre voix + musique dans Studio**

Run : `cd video && npm run dev`
Lecture complète au casque. La voix doit être claire et présente, la musique doit poser une atmosphère sans jamais se mettre en travers. Si la musique mange la voix, baisser `volume` (ex: 0.10).

Kill `Ctrl+C`.

- [ ] **Step 7 : Commit**

```bash
git add video/public/audio/music.mp3 video/assets/audio/music.mp3 video/src/compositions/Manifeste.tsx
git commit -m "$(cat <<'EOF'
feat(video): integrate Strudel-generated music

Piste 30s composée via strudel-claude, alignée sur les 5 beats
(drone Beat 1, kick Beat 2, glitch Beat 3, tension Beat 4, drop Beat 5).
Volume 0.13 (~-18dB) pour rester sous la voix. Cohérence brand : musique
codée pour un site brutaliste codé.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 18: SFX — generation Strudel + integration

**Files:**
- Add: `video/public/sfx/{woosh,glitch-flash,scan-loop,thud-stamp,tone-final,keyboard-type}.mp3`
- Modify: `video/src/beats/Beat1Hook.tsx`, `Beat3Scanner.tsx`, `Beat4Unique.tsx`, `Beat5CTA.tsx`

Chaque SFX est mounté DANS le beat où il sonne — co-localisation visuel + audio.

| SFX | Beat | Frame local | Description |
|-----|------|-------------|-------------|
| `woosh.mp3` | Beat 1 | 45 | Strikethrough "COACH IA" |
| `glitch-flash.mp3` | Beat 1 / 2 / 3 / 4 / 5 | 90 / 0 / 0 / 0 / 0 (au transition global) | Flash transition |
| `keyboard-type.mp3` | Beat 3 | 0-30 | Type-in URL (loop) |
| `scan-loop.mp3` | Beat 3 | 80-150 | Scanner qui scanne (loop) |
| `thud-stamp.mp3` | Beat 3 | 150 | Verdict stamp |
| `woosh.mp3` (×3) | Beat 4 | 30, 70, 110 | Strikethroughs liste |
| `tone-final.mp3` | Beat 5 | 0 | Slam URL CTA |

- [ ] **Step 1 : Générer les SFX via Strudel**

Dans la session strudel-claude (cf. Task 17), composer chacun des 6 SFX comme patches courts (0.2-1s chacun). Enregistrer chaque SFX comme WAV séparé depuis l'app strudel.

Si Strudel ne produit pas un `keyboard-type` convaincant, fallback **Mixkit** : aller sur `https://mixkit.co/free-sound-effects/keyboard/` et télécharger un type rapide (license CC0).

- [ ] **Step 2 : Encoder en MP3 et placer dans public/sfx/**

```bash
cd /Users/mathieu/Documents/survivor/video
mkdir -p public/sfx assets/sfx

# Pour chacun des 6 SFX (woosh, glitch-flash, keyboard-type, scan-loop, thud-stamp, tone-final) :
for sfx in woosh glitch-flash keyboard-type scan-loop thud-stamp tone-final; do
  if [ -f "assets/sfx/${sfx}.wav" ]; then
    ffmpeg -y -i "assets/sfx/${sfx}.wav" -codec:a libmp3lame -b:a 192k "public/sfx/${sfx}.mp3"
    cp "public/sfx/${sfx}.mp3" "assets/sfx/${sfx}.mp3"
  else
    echo "SKIP ${sfx} (source wav manquante)"
  fi
done

ls -lh public/sfx/
```
Expected : 6 fichiers mp3 dans `public/sfx/`, chacun < 100 Ko.

- [ ] **Step 3 : Brancher woosh + flash dans Beat1Hook.tsx**

Dans `video/src/beats/Beat1Hook.tsx`, ajouter en imports :
```tsx
import { Audio, staticFile, Sequence } from 'remotion';
```

Avant le `</BrandFrame>` final, ajouter :
```tsx
{/* SFX co-localisés */}
<Sequence from={45} durationInFrames={20}>
  <Audio src={staticFile('sfx/woosh.mp3')} volume={0.6} />
</Sequence>
```

- [ ] **Step 4 : Brancher SFX scanner dans Beat3Scanner.tsx**

Dans `video/src/beats/Beat3Scanner.tsx`, imports :
```tsx
import { Audio, staticFile, Sequence } from 'remotion';
```

Avant le `</BrandFrame>` final :
```tsx
{/* Type-in URL */}
<Sequence from={0} durationInFrames={30}>
  <Audio src={staticFile('sfx/keyboard-type.mp3')} volume={0.4} loop />
</Sequence>

{/* Type-in greffier(ère) */}
<Sequence from={50} durationInFrames={30}>
  <Audio src={staticFile('sfx/keyboard-type.mp3')} volume={0.4} loop />
</Sequence>

{/* Scan loop */}
<Sequence from={80} durationInFrames={70}>
  <Audio src={staticFile('sfx/scan-loop.mp3')} volume={0.35} loop />
</Sequence>

{/* Thud stamp verdict */}
<Sequence from={150} durationInFrames={20}>
  <Audio src={staticFile('sfx/thud-stamp.mp3')} volume={0.7} />
</Sequence>
```

- [ ] **Step 5 : Brancher woosh ×3 dans Beat4Unique.tsx**

Dans `video/src/beats/Beat4Unique.tsx`, imports :
```tsx
import { Audio, staticFile, Sequence } from 'remotion';
```

Avant le `</BrandFrame>` final :
```tsx
{/* Woosh × 3, sync avec Strikethrough */}
{[30, 70, 110].map((f) => (
  <Sequence key={f} from={f} durationInFrames={20}>
    <Audio src={staticFile('sfx/woosh.mp3')} volume={0.6} />
  </Sequence>
))}
```

- [ ] **Step 6 : Brancher tone-final dans Beat5CTA.tsx**

Dans `video/src/beats/Beat5CTA.tsx`, imports :
```tsx
import { Audio, staticFile, Sequence } from 'remotion';
```

Avant `</BrandFrame>` :
```tsx
<Sequence from={0} durationInFrames={30}>
  <Audio src={staticFile('sfx/tone-final.mp3')} volume={0.5} />
</Sequence>
```

- [ ] **Step 7 : Brancher glitch-flash aux 4 transitions**

Dans `video/src/compositions/Manifeste.tsx`, juste sous `<GlitchTransitions />`, ajouter :
```tsx
{/* SFX glitch-flash aux 4 jointures */}
{[90, 270, 510, 750].map((f) => (
  <Sequence key={f} from={f} durationInFrames={4}>
    <Audio src={staticFile('sfx/glitch-flash.mp3')} volume={0.7} />
  </Sequence>
))}
```

- [ ] **Step 8 : Tester l'ensemble dans Studio**

Run : `cd video && npm run dev`
Lecture complète au casque. Vérifier :
- Beat 1 : woosh sec sur le strike "COACH IA" à frame 45
- Transitions : flash audio + visuel à 90, 270, 510, 750
- Beat 3 : keyboard-type pendant URL/job typing, scan-loop pendant scan, thud sur verdict 150
- Beat 4 : woosh × 3 sur les strikes
- Beat 5 : tone-final discret au slam URL

Si trop fort : baisser `volume`. Si pas synchro : ajuster `from`.

- [ ] **Step 9 : Commit**

```bash
git add video/assets/sfx/ video/public/sfx/ video/src/beats/ video/src/compositions/Manifeste.tsx
git commit -m "$(cat <<'EOF'
feat(video): integrate SFX (Strudel + fallback Mixkit)

6 SFX co-localisés dans leurs beats : woosh sur strikethroughs (Beat 1, 4),
keyboard-type + scan-loop + thud-stamp dans le scanner (Beat 3),
tone-final sur le slam URL (Beat 5), glitch-flash aux 4 transitions.
Tous générés Strudel sauf keyboard-type (fallback Mixkit CC0 si besoin).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 19: Validation 4:5 — review safe-zone

**Files:**
- Possibly modify: les beats si du contenu est coupé en 4:5

- [ ] **Step 1 : Preview 4:5 dans Studio**

Run : `cd video && npm run dev`
Sélectionner `Manifeste-4-5` dans la sidebar (1080×1350).

Scrubber les 5 beats. Vérifier pour CHACUN :
- KickerLabel visible en haut, pas coupé.
- Le big titre (hook, "40%", verdict, liste, URL CTA) entièrement visible.
- Sous-titres lisibles.
- Aucun élément essentiel hors-frame.

- [ ] **Step 2 : Si du contenu déborde, ajuster les `font-size` dans le beat concerné**

Pour chaque beat où c'est nécessaire, ajuster le branchement `format === '9:16' ? X : Y` pour la taille (déjà présent dans la plupart des beats).

Exemple : si le titre Beat 1 dépasse en 4:5, baisser `titleSize` :
```tsx
const titleSize = format === '9:16' ? 140 : 100; // 100 au lieu de 120
```

- [ ] **Step 3 : Re-vérifier en alternant les deux compositions**

S'assurer que chaque adaptation 4:5 ne dégrade pas la version 9:16.

- [ ] **Step 4 : Commit**

```bash
git add video/src/beats/
git commit -m "$(cat <<'EOF'
fix(video): tune typography for 4:5 safe-zone (LinkedIn)

Ajustements de tailles de polices dans les beats où le contenu débordait
en format 4:5 (1080x1350). La version 9:16 reste inchangée.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

(Si aucun ajustement n'est nécessaire, skip ce commit et continue à la Task 20.)

---

## Task 20: Render command + scripts

**Files:**
- Modify: `video/package.json`

- [ ] **Step 1 : Ouvrir `video/package.json` et localiser la section `"scripts"`**

- [ ] **Step 2 : Ajouter / modifier les scripts**

Remplacer la section `"scripts"` par :

```json
"scripts": {
  "dev": "remotion studio",
  "render:9-16": "remotion render Manifeste-9-16 out/manifeste-9-16-v1.mp4 --crf 18 --concurrency 8",
  "render:4-5": "remotion render Manifeste-4-5 out/manifeste-4-5-v1.mp4 --crf 18 --concurrency 8",
  "render": "npm run render:9-16 && npm run render:4-5",
  "build": "remotion bundle"
}
```

- [ ] **Step 3 : Vérifier que `out/` existe ou sera créé**

```bash
mkdir -p video/out
```

- [ ] **Step 4 : Commit**

```bash
git add video/package.json
git commit -m "$(cat <<'EOF'
chore(video): add render scripts for 9:16 and 4:5

npm run render:9-16  -> out/manifeste-9-16-v1.mp4
npm run render:4-5   -> out/manifeste-4-5-v1.mp4
npm run render       -> les deux successivement

CRF 18 (visuellement lossless), concurrency 8 (Mac M-series).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 21: First render + acceptance criteria checklist

**Files:**
- Add (non-committed): `video/out/manifeste-9-16-v1.mp4`, `manifeste-4-5-v1.mp4`

- [ ] **Step 1 : Render 9:16**

```bash
cd video && npm run render:9-16
```
Expected : ~30-60s, output `out/manifeste-9-16-v1.mp4` créé. Taille attendue : 5-10 Mo.

```bash
ls -lh out/manifeste-9-16-v1.mp4
```

- [ ] **Step 2 : Render 4:5**

```bash
cd video && npm run render:4-5
```
Expected : `out/manifeste-4-5-v1.mp4`. Taille 5-10 Mo.

- [ ] **Step 3 : Visionner les 2 sur ordi**

```bash
open video/out/manifeste-9-16-v1.mp4
open video/out/manifeste-4-5-v1.mp4
```

- [ ] **Step 4 : Visionner sur tel (test plateforme réelle)**

AirDrop / iCloud Drive le `manifeste-9-16-v1.mp4` vers le tel. Visionner :
- D'abord **muet** (test scroll-stop / lisibilité auto-mute LinkedIn).
- Puis **avec son**.

- [ ] **Step 5 : Cocher la checklist d'acceptation V1**

Pour chaque critère du spec §6, vérifier et cocher mentalement (ou copier la liste dans un fichier de notes) :

- [ ] Hook lisible et compréhensible muet sur les 2 premières secondes.
- [ ] Voix-off synchronisée avec les frames (≤ 100 ms drift).
- [ ] CTA `survivant-ia.ch` lisible 1.5 s minimum à la fin.
- [ ] Render 9:16 final < 10 Mo.
- [ ] Render 4:5 final < 10 Mo, contenu critique non coupé.
- [ ] KickerLabel spin animé sans saccade (vérifier autour de la jointure 8 s = frame 240).
- [ ] Aucun `//` dans copy ni visuels.
- [ ] Aucune négation tronquée (toujours « ne…pas »).
- [ ] Domaine `survivant-ia.ch` partout, jamais `.com`.
- [ ] Vidéo lisible et convaincante muette (test LinkedIn-like).

- [ ] **Step 6 : Si un critère échoue, retour à la task concernée**

Tableau de mapping critère → task :
- Drift voix → Task 16 (re-record ou ajuster timings)
- Saccade KickerLabel → Task 4 (vérifier que la rotation est bien frame-driven, pas CSS)
- Contenu coupé en 4:5 → Task 19 (ajuster tailles)
- Audio masque la voix → Task 17 ou 18 (baisser volumes)
- Crédibilité hook muet → Task 10 (re-design le timing du type-in)

Itérer en bumping le suffixe `-v2`, `-v3` dans les renders.

- [ ] **Step 7 : Pas de commit (les MP4 sont gitignored)**

Les outputs sont dans `video/out/` qui est dans `.gitignore`. Confirmer :
```bash
git status
```
Expected : working tree clean (rien à commiter).

---

## Task 22: Final delivery + handoff doc

**Files:**
- Create: `video/README.md`

- [ ] **Step 1 : Créer un README pour le sous-projet**

```md
# Survivant-IA — Video sub-project (Remotion)

Sous-projet Remotion pour les vidéos manifeste de Survivant-IA.

## Quick start

```bash
cd video
npm install
npm run dev          # ouvre Remotion Studio sur http://localhost:3000
npm run render       # render les 2 formats (9:16 + 4:5) dans out/
```

## Compositions actuelles

- **Manifeste-9-16** (1080×1920, 30 s) : version Reels / TikTok / Shorts.
- **Manifeste-4-5** (1080×1350, 30 s) : version LinkedIn (safe-zone).

## Outputs

`out/manifeste-{9-16|4-5}-v{N}.mp4` — non commités.

## Pour modifier

- **Texte / timing voix** : `src/captions.ts` — source de vérité.
- **Couleurs / fonts** : `src/theme.ts`.
- **Beat individuel** : `src/beats/Beat{N}*.tsx`.
- **Animations** : `src/animations/*.ts`.

## Pour une nouvelle vidéo

V1 ne couvre qu'une vidéo. Pour la suivante, soit :
1. Dupliquer `compositions/Manifeste.tsx` → ex: `Pitch.tsx`, créer 5 nouveaux beats.
2. (V2+) Quand on aura 3+ vidéos, extraire un module template et créer le skill `survivant-ia-video` (cf spec §7).

## Spec source

`docs/superpowers/specs/2026-05-03-remotion-manifeste-design.md`
```

- [ ] **Step 2 : Commit**

```bash
git add video/README.md
git commit -m "$(cat <<'EOF'
docs(video): add README for the Remotion sub-project

Quick start (dev + render), description des compositions,
pointer vers la spec source et instructions pour ajouter de
nouvelles vidéos.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3 : Récap de livraison à Mathieu**

Annoncer :

> V1 livrée. 2 fichiers prêts à uploader :
>
> - `video/out/manifeste-9-16-v1.mp4` → TikTok, Reels, YouTube Shorts
> - `video/out/manifeste-4-5-v1.mp4` → LinkedIn
>
> Tous les critères d'acceptation V1 cochés. Spec source : `docs/superpowers/specs/2026-05-03-remotion-manifeste-design.md`.
> Future work (skill `survivant-ia-video`, multi-format dédié, etc.) listé dans la spec §7 — à attaquer après que cette V1 soit en ligne et validée par les retours réseau.

---

## Self-review (rempli par l'auteur du plan)

**Spec coverage :**
- Spec §1 (contexte/objectif) — couvert dans le Goal/Architecture du plan.
- Spec §2 (architecture) — Tasks 1, 2, 3 (setup + theme + Tailwind/fonts).
- Spec §3 (composition / 5 beats) — Tasks 9, 10, 11, 12, 13, 14, 15.
- Spec §4 (asset pipeline) — Tasks 16, 17, 18.
- Spec §5 (render & export) — Tasks 20, 21.
- Spec §6 (critères d'acceptation) — Task 21 step 5.
- Spec §7 (future work) — explicitement hors-scope ; documenté dans Task 22 README.
- Spec §8 (timeline) — non plannifiée comme tâche, c'est une estimation.
- Spec §9 (hors-scope) — respecté : pas de tests auto, pas d'upload auto, pas de TTS, pas de skill V1.

**Type consistency :**
- `Format` type défini en Task 2 (theme.ts), réutilisé dans Tasks 5, 9, 10, 11, 12, 13, 14.
- `colors`, `fonts` exports de theme.ts utilisés cohérememt dans tous les beats.
- `slamIn`, `typeIn`, `glitchFlash` signatures stables et utilisées telles que définies.
- `BrandFrame` props (`format`, `kicker`, `children`, `background`) cohérents entre Task 5 et tous les beats.

**Placeholder scan :** aucun TBD/TODO d'implémentation. Les "TODO Task X" inline servent à pointer vers les tasks suivantes pour le code en cours de construction (intentionnels, supprimés au commit final). Pas d'instruction vague type "add error handling".

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-remotion-manifeste.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Je dispatch un subagent frais par task, je review entre chaque, itération rapide.

**2. Inline Execution** — On exécute les tasks dans cette session, batch avec checkpoints pour review.

**Which approach?**
