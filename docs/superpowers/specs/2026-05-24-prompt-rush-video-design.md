# Vidéo TikTok "Prompt Rush — Les 6 piliers" — Design

**Date** : 2026-05-24
**Episode ID** : `prompt-rush`
**Source** : `~/Library/Mobile Documents/com~apple~CloudDocs/video-tiktok/prompt-ia/prompt-rush-clean.mov`
**Script** : 6 piliers d'un bon prompt IA → CTA vers `/outils/ameliorer-son-prompt`
**Format** : 1080×1920, 30fps, durée cible ~120s, muet (VO et captions en CapCut)
**Direction** : motion design riche assumé (rupture délibérée avec la préférence "pas d'over-animation")

---

## Storyboard (6 actes)

| # | Acte | Durée | Traitement |
|---|---|---|---|
| 1 | HOOK | 0-12s | Faux output IA qui glitch → "c'est pas de sa faute" hairline sobre → slam plein cadre **"C'EST DE LA TIENNE"** avec flèche menthe pointant le spectateur |
| 2 | DIAGNOSTIC | 12-32s | Faux écran chat IA sobre (sans logo OpenAI), prompt minable tapé en haut → output wall-of-text qui dégueule avec spawn d'emojis 😍🎯✨ |
| 3 | THÈSE | 32-42s | HairlineDivider menthe → ItalicMoment Playfair *"ses six piliers."* |
| 4 | LES 6 PILIERS | 42-92s | **Grille 2×3 qui se construit case par case, zoom caméra sur la case active à chaque beat** (~7-8s/pilier) |
| 5 | PROBLEM BRIDGE | 92-105s | Phase overload (grille saturée, vibrations) → phase breach (shield rouge clignote, hairline qui se casse) |
| 6 | SOLUTION + CTA | 105-122s | Replay fidèle du vrai outil : form `KitAmelioreTonPromptForm` → loading → output 6 piliers → CloseURL `survivant-ia.ch/outils/ameliorer-son-prompt` |

**Arc visuel** : faux output (hook) ↔ faux chat (diagnostic) ↔ vrai outil (CTA) — même langage UI, montée en authenticité. La **grille 2×3 des piliers** est le motif récurrent qui boucle visuellement les actes 4-5-6.

**Ordre des piliers** (acte 4, suit le script) :
1. Rôle — 2. Tâche — 3. Contexte — 4. Contraintes — 5. Format — 6. Exemple

---

## Architecture technique

### Composants nouveaux

**Primitives partagées** (`video/src/lib/facecam/components/`)

- **`<PillarsCanvas>`** — grille 2×3 des 6 piliers, source de vérité visuelle unique.
  - Props : `visiblePillars: 0-6`, `highlight: 1-6 | null`, `mode: 'normal' | 'saturated' | 'breached'`
  - Réutilisée par `PillarsBuild`, `PillarsStress`, et `ToolReplayScene` (phase `output`)

- **`<FakeChatFrame>`** — UI chat IA sobre, sans logo identifiable.
  - Props : `promptText: string`, `outputLines: string[]`, `mode: 'glitch' | 'spam' | 'neutral'`, `emojiBurst?: boolean`
  - Mutualisée entre hook (mode glitch) et diagnostic (mode spam)

**Scènes** (`video/src/lib/facecam/scenes/`)

| Scène | Acte(s) | Props clés | Animation |
|---|---|---|---|
| `FakeAIChatScene` | 1, 2 | `mode`, `promptText`, `outputLines`, `emojiBurst` | Output corrompt (glitch) ou emoji spam progressif |
| `SlamPayoff` | 1 (punchline) | `lines: string[]`, `accentWord: string` | Slam typo plein cadre (lignes + mot accent menthe final) + flèche menthe scale+glow pointant le spectateur |
| `PillarsBuild` | 4 | `visiblePillars`, `highlight` | Reveal séquentiel + zoom caméra Remotion sur case active |
| `PillarsStress` | 5 | `phase: 'overload' \| 'breach'` | Overload : saturation + vibration. Breach : shield rouge clignotant, hairline qui se casse |
| `ToolReplayScene` | 6 | `phase: 'typing' \| 'loading' \| 'output'` | Replay fidèle du vrai form/output, CSS calqué sur classes Vue |

**Composants réutilisés** : `HairlineDivider`, `ItalicMoment`, `CloseURL`, `face-cam-zone`, `Background`, `ParticleBackground`.

### Données / schémas

- Étendre `video/src/lib/facecam/schemas.ts` (zod) : ajouter les 5 nouvelles scènes au discriminated union + leurs props
- Fichier de timeline : `video/facecam-data/prompt-rush.timeline.json`
- Pas de nouveau data fixture côté site (le replay du tool est purement visuel, pas branché sur l'API)

### Réplication fidèle du vrai outil

`ToolReplayScene` recrée en JSX/CSS Remotion les composants Vue `KitAmelioreTonPromptForm` + `KitAmelioreTonPromptOutput`. Méthode :

- Lire les `<style scoped>` de chaque composant Vue
- Recopier les classes (`.kfm-label`, `.kfm-textarea`, `.kfm-meta`, `.kfm-submit`, `.ko-label`, `.ko-block`, etc.) en CSS Remotion
- Utiliser les mêmes tokens (`COLORS.accent`, `COLORS.surface`, `COLORS.text` de `theme.ts`, déjà alignés sur `app/assets/css/main.css`)
- Auto-typing du prompt : interpolation `frame → substring.length` à 12-18 char/sec
- Loading : pulsation du dot menthe identique au `.ko-loading-dot`

URL finale : `survivant-ia.ch/outils/ameliorer-son-prompt` (canonique, slug confirmé dans `outils-manifest.ts`).

---

## Layout — split 50/50 + overlays full-screen

**Règle par défaut** : motion design dans la moitié haute (1080×960), face cam dans la moitié basse. Split intouchable.

**Exceptions validées** (overlays full-screen sur 1-4s par-dessus la face cam) :

- `SlamPayoff` (acte 1) : overlay 1-2s sur la punchline "C'EST DE LA TIENNE"
- `ToolReplayScene` phase `output` (acte 6) : overlay 3-4s pour donner de l'air à la grille des 6 piliers du replay

Pas d'autre dérogation. Le reste fitte strictement dans la moitié haute.

---

## Pipeline asset

### Étape 1 — Import source

Script `video/scripts/import-source.mjs` (existant) :
- Copie `prompt-rush-clean.mov` → `video/public/facecam-raws/prompt-rush.mp4`
- Transcode HEVC→H.264 si nécessaire (fallback ffmpeg)

### Étape 2 — Prepare (Whisper + silences)

```bash
npm run facecam:prepare -- prompt-rush
```

Produit :
- `video/facecam-data/prompt-rush.transcript.json` (word timings Whisper)
- `video/facecam-data/prompt-rush.silences.json`
- `video/facecam-data/prompt-rush.audio.wav`
- `video/facecam-data/prompt-rush.timeline.json` (brouillon)

### Étape 3 — Timeline build

À partir des word timings, ajuster `prompt-rush.timeline.json` au mot près. Structure :

```json
{
  "episodeId": "prompt-rush",
  "inputAspect": "9:16",
  "cropAnchor": "top",
  "cuts": [],
  "totalDurationSec": 122,
  "events": [
    { "tStart": 0,   "tEnd": 5,   "scene": "FakeAIChatScene",
      "props": { "mode": "glitch", "promptText": "...", "outputLines": ["..."] } },
    { "tStart": 5,   "tEnd": 8,   "scene": "ItalicMoment",
      "props": { "text": "c'est pas de sa faute", "fontSize": 90 } },
    { "tStart": 8,   "tEnd": 12,  "scene": "SlamPayoff",
      "props": { "lines": ["c'est de la"], "accentWord": "TIENNE" } },
    { "tStart": 12,  "tEnd": 32,  "scene": "FakeAIChatScene",
      "props": { "mode": "spam", "promptText": "écris-moi un article LinkedIn sur comment acheter une maison",
                 "outputLines": ["..."], "emojiBurst": true } },
    { "tStart": 32,  "tEnd": 35,  "scene": "HairlineDivider" },
    { "tStart": 35,  "tEnd": 42,  "scene": "ItalicMoment",
      "props": { "text": "ses six piliers." } },
    { "tStart": 42,  "tEnd": 50,  "scene": "PillarsBuild",
      "props": { "visiblePillars": 1, "highlight": 1 } },
    { "tStart": 50,  "tEnd": 58,  "scene": "PillarsBuild",
      "props": { "visiblePillars": 2, "highlight": 2 } },
    { "tStart": 58,  "tEnd": 66,  "scene": "PillarsBuild",
      "props": { "visiblePillars": 3, "highlight": 3 } },
    { "tStart": 66,  "tEnd": 74,  "scene": "PillarsBuild",
      "props": { "visiblePillars": 4, "highlight": 4 } },
    { "tStart": 74,  "tEnd": 82,  "scene": "PillarsBuild",
      "props": { "visiblePillars": 5, "highlight": 5 } },
    { "tStart": 82,  "tEnd": 92,  "scene": "PillarsBuild",
      "props": { "visiblePillars": 6, "highlight": 6 } },
    { "tStart": 92,  "tEnd": 100, "scene": "PillarsStress",
      "props": { "phase": "overload" } },
    { "tStart": 100, "tEnd": 105, "scene": "PillarsStress",
      "props": { "phase": "breach" } },
    { "tStart": 105, "tEnd": 109, "scene": "ToolReplayScene",
      "props": { "phase": "typing" } },
    { "tStart": 109, "tEnd": 112, "scene": "ToolReplayScene",
      "props": { "phase": "loading" } },
    { "tStart": 112, "tEnd": 117, "scene": "ToolReplayScene",
      "props": { "phase": "output" } },
    { "tStart": 117, "tEnd": 122, "scene": "CloseURL",
      "props": { "url": "survivant-ia.ch/outils/ameliorer-son-prompt" } }
  ]
}
```

Timings indicatifs : ils seront ajustés au mot près à partir de la transcription Whisper réelle.

### Étape 4 — Preview Studio

```bash
cd video && npm run dev
```

Sélection composition `FaceCam`, prévisualisation, ajustement `cropAnchor`.

### Étape 5 — Render final

```bash
npm run render:facecam -- prompt-rush
# → video/out/facecam-prompt-rush.mp4
```

H.264 yuv420p TV-range, faststart, muet. TikTok-ready sans recompression.

---

## Audio & captions

- Audio source du `.mov` : utilisé **uniquement** par Whisper pour les timings. Pas mixé dans le rendu.
- mp4 final muet (comportement standard du pipeline).
- VO + musique : ajoutées par toi dans CapCut après render.
- Captions : générés dans CapCut (auto-caption TikTok ou manuel), **rien dans Remotion**.

---

## Charte DA (rappel, sans dérogation)

Tokens canoniques V2 Editorial Dark (`video/src/lib/theme.ts`) :
- `bg` `#0F0F0E` · `surface` `#14140F` · `text` `#E8E5DD` · `accent` `#6CE3B5` (menthe)
- `danger` `#FF3E3E` (utilisé uniquement dans `PillarsStress` phase `breach`)
- Fonts : Inter caps (déclaratif), Space Mono (kickers/UI), Playfair italic (signatures)

**Interdictions strictes** : aucun emoji dans le code (.tsx, .ts). Les emojis du diagnostic sont rendus comme **glyphes texte** dans des arrays JSON de props, pas dans le source code des composants — ils représentent un **artefact moqué** dans la fiction du faux écran chat, pas un choix DA.

---

## Risques & mitigations

| Risque | Mitigation |
|---|---|
| Source HEVC iPhone non lisible directement | `import-source.mjs` transcode automatiquement |
| Whisper rate les timings sur le débit rapide (ex: "très exactement") | Manual override dans le timeline.json par mot après preview |
| Zoom caméra sur `PillarsBuild` brise la cohérence des cases déjà révélées | Implémentation via `interpolate` sur scale+translate du conteneur grille, pas un swap de scène. Garantit continuité visuelle |
| `ToolReplayScene` diverge visuellement du vrai site si le CSS du site évolue | Spec impose lecture des `<style scoped>` Vue au moment de l'implémentation. Drift = problème connu, à re-synchroniser manuellement à chaque refonte UI. Non-bloquant pour cette vidéo |
| Render `PillarsStress` phase `breach` (rouge danger) clashe avec la DA dark | Limité à 5s max, intensité contrôlée (opacity max 0.6 sur le rouge, pas full saturation) |

---

## Hors-scope

- Voix off (CapCut)
- Musique (CapCut)
- Captions / sous-titres (CapCut auto)
- Auto-publish TikTok / IG (manuel)
- Réutilisation des nouvelles scènes pour de futures vidéos (à valider épisode par épisode)
- Modification du composant Vue `KitAmelioreTonPrompt` côté site (replay = recréation visuelle, pas refactor)
