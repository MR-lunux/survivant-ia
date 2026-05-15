# Survivant-IA · Remotion video factory

Génération automatique des vidéos TikTok / Reels / Shorts pour `survivant-ia.ch`. Code en React + Remotion. Un seul template : FaceCam face-cam + motion design en overlay.

---

## Sommaire

1. [Installation (1 fois)](#installation-1-fois)
2. [Workflow FaceCam](#workflow-facecam)
3. [Le kit — 9 scènes](#le-kit--9-scènes)
4. [Rendu et fichiers de sortie](#rendu-et-fichiers-de-sortie)
5. [Charte DA appliquée](#charte-da-appliquée)
6. [Safe zones TikTok / Reels / Shorts](#safe-zones-tiktok--reels--shorts)
7. [Architecture du code](#architecture-du-code)
8. [Troubleshooting](#troubleshooting)
9. [Hors-scope (à faire ailleurs)](#hors-scope-à-faire-ailleurs)

---

## Installation (1 fois)

Prérequis : Node 20+ et `ffmpeg` installé sur le Mac (`brew install ffmpeg`).

```bash
cd /Users/mathieu/Documents/survivor/video
npm install
```

Au premier render, Remotion télécharge Chrome Headless (~150 Mo). Automatique, une seule fois.

Installe whisper.cpp et le modèle large-v3 FR (~3 Go) :

```bash
bash scripts/setup-whisper.sh
```

---

## Workflow FaceCam

### Vue d'ensemble (5 étapes)

1. Tourne ton mp4 en portrait (ou horizontal) → dépose-le dans `public/facecam-raws/<episodeId>.mp4`
2. Lance la préparation : `npm run facecam:prepare -- <episodeId>` (transcription Whisper + détection silences → brouillon de timeline)
3. Demande à Claude de générer ou affiner `facecam-data/<episodeId>.timeline.json` à partir de la transcription et de tes notes
4. Ouvre Studio (`npm run dev`), clique sur la composition `FaceCam` → prévisualise, ajuste `cropAnchor` si le cadrage coupe le visage
5. Rends le fichier final : `npm run render:facecam -- <episodeId>` → `out/facecam-<episodeId>.mp4`

### Guide de tournage

**Portrait 9:16 (téléphone recommandé)**

- Tête dans le tiers supérieur du cadre, regard niveau objectif
- Distance ~50 cm — assez près pour voir les expressions, pas trop pour éviter l'effet barrel
- Éclairage frontal : lumière douce devant toi, fond sombre dans ton dos (cohérence DA V2 Editorial Dark)
- Téléphone sur trépied — aucune instabilité tolérée (le crop ne stabilise pas)

**Horizontal 16:9 (webcam)**

- Centré, cadre tête-et-épaules, fond sombre
- `apply-cuts.mjs` gère automatiquement le recadrage 16:9 → 9:16

**6 règles opérationnelles**

| # | Règle |
|---|---|
| 1 | Oeil = objectif : regarde la caméra, pas l'écran |
| 2 | Distance stable : ne te penche pas en cours de tournage |
| 3 | Lumière frontale : lampe de bureau ou ring-light devant toi |
| 4 | Fond sombre : mur neutre, pas de fenêtre derrière |
| 5 | Support fixe : trépied, pas la main |
| 6 | Regard caméra sur les phrases-clés : c'est là que l'accroche se joue |

### Smoke test apres un clone

Pour vérifier que le pipeline tourne apres un clone ou un changement structurel :

```bash
node scripts/make-demo-fixture.mjs   # genere un mp4 testsrc 10s dans public/facecam-raws/
npm run render:facecam -- _demo-10s
```

La timeline demo `facecam-data/_demo-10s.timeline.json` est gitignorée. Recrée-la à la main si absente :

```json
{
  "episodeId": "_demo-10s",
  "inputAspect": "9:16",
  "cropAnchor": "top",
  "cuts": [],
  "totalDurationSec": 10,
  "events": [
    { "tStart": 0, "tEnd": 2.5, "scene": "KickerOpening", "props": { "kicker": "DEMO · FACECAM", "line": "test du pipeline", "signature": "le Survivant." } },
    { "tStart": 2.5, "tEnd": 5.0, "scene": "BigStat", "props": { "value": 73, "suffix": "%", "caption": "stat de test", "label": "label de test" } },
    { "tStart": 5.0, "tEnd": 7.5, "scene": "ItalicMoment", "props": { "text": "ca marche.", "fontSize": 120 } },
    { "tStart": 7.5, "tEnd": 10, "scene": "CloseURL", "props": { "url": "survivant-ia.ch" } }
  ]
}
```

Sortie attendue : `out/facecam-_demo-10s.mp4` (~1 Mo).

---

## Le kit — 9 scènes

| Scène | Usage |
|---|---|
| `KickerOpening` | Ecran d'ouverture : kicker Space Mono + ligne Inter caps + signature Playfair |
| `WordBeat` | Mot unique très grand qui s'impose — pour les concepts one-word |
| `BigStat` | Gros chiffre animé 0 → valeur + caption mono + label |
| `ConceptCard` | Carte concept : titre Inter caps + explication + source |
| `ItalicMoment` | Phrase Playfair italique plein écran — les moments signature |
| `IconReveal` | Icône SVG avec entrée spring + label — pour les leviers/points |
| `QuoteFrame` | Citation encadrée par hairlines, avec attribution |
| `HairlineDivider` | Séparateur menthe 1px animé — transition entre beats |
| `CloseURL` | Ecran de fermeture : domaine sage en Playfair + appel à l'action |

---

## Rendu et fichiers de sortie

```bash
npm run render:facecam -- <episodeId>   # → out/facecam-<episodeId>.mp4
npm run fix:mp4                          # recodage défensif si QuickTime refuse
```

Format de sortie : 1080×1920, 30fps, H.264 Constrained Baseline, yuv420p TV-range, faststart. Compatible QuickTime, TikTok, iOS, Android sans recompression.

> Utilise toujours le CLI, jamais le bouton "Render" de Studio pour les fichiers finaux. Le bouton bypasse le post-encode → mp4 sans `+faststart`, QuickTime refuse.

### Pourquoi ce format ?

- **H.264 Constrained Baseline** : profil le plus universellement supporté (vieux iOS, QuickTime, players embarqués, web)
- **yuv420p TV-range** (vs yuvj420p full-range) : seul format accepté en upload TikTok sans recompression hasardeuse
- **faststart** : metadata en début de fichier = streaming-ready
- **Pas d'audio** : tu ajoutes voix/musique dans ton outil son préféré après render

---

## Charte DA appliquée

Tokens canoniques V2 Editorial Dark, alignés sur `app/assets/css/main.css` du site :

| Token | Valeur |
|---|---|
| `bg` | `#0F0F0E` (warm dark, pas pur noir) |
| `surface` | `#14140F` |
| `text` | `#E8E5DD` (cream warm) |
| `textSoft` | `#C5C2BB` |
| `muted` | `#8A8780` |
| `accent` | `#6CE3B5` (menthe, pas néon) |
| `accentGlow` | `rgba(108, 227, 181, 0.25)` (subtil) |
| `hairline` | `rgba(232, 229, 221, 0.10)` |
| `hairlineStrong` | `rgba(232, 229, 221, 0.25)` |
| `danger` | `#FF3E3E` |
| `mutation` | `#FFA630` |

Fonts :
- **Inter** (400/500/700/800/900) — déclaratif uppercase + body
- **Space Mono** (400/700) — kickers, captions tech, URL
- **Playfair Display** italic (400/500/700) — phrases signatures

Pattern signature canonique : ligne déclarative Inter caps cream + signature Playfair italique menthe juste en dessous. Utilisé sur tous les moments forts.

Effets :
- **Particules menthe en fond** (40 particules + lignes de connexion + vignette radiale). Déterministe pour rendu offline.
- **Grain léger** (opacity 0.025)
- **Hairlines 1px** au lieu de bordures épaisses

Toute la palette est dans `src/lib/theme.ts`.

---

## Safe zones TikTok / Reels / Shorts

| Côté | Marge | Pourquoi |
|---|---|---|
| Top | 240px | Status bar + username overlay |
| Right | 200px | Boutons like / comment / share / save |
| Bottom | 400px | Caption + handle + nom de la musique |
| Left | 80px | Marge minimale (gestures swipe) |

---

## Architecture du code

```
video/
├── README.md
├── package.json
├── remotion.config.ts              ← codec H.264, yuv420p, CRF 22
├── scripts/
│   ├── transcribe.mjs              ← Whisper transcription
│   ├── detect-silences.mjs         ← détection silences ffmpeg
│   ├── apply-cuts.mjs              ← découpe + recadrage 16:9→9:16
│   ├── prepare-facecam.mjs         ← orchestrateur (transcribe + silences)
│   ├── render-facecam.mjs          ← render CLI par episodeId
│   ├── sync-timeline.mjs           ← synchronisation timeline
│   ├── post-encode.mjs             ← ffmpeg post-encode défensif
│   ├── fix-mp4.mjs                 ← correction codec sur out/*.mp4
│   ├── make-demo-fixture.mjs       ← génère un mp4 testsrc 10s (smoke test)
│   ├── setup-whisper.sh            ← install whisper.cpp + modèle large-v3
│   └── lib/                        ← utilitaires scripts (check-drift, extract-beats)
├── src/
│   ├── Root.tsx                    ← déclare la composition FaceCam
│   ├── index.css                   ← imports fonts Google + base dark
│   ├── lib/
│   │   ├── theme.ts                ← COLORS, FONTS, VIDEO
│   │   ├── schemas.ts              ← schémas zod FaceCam Timeline
│   │   ├── score/                  ← infra musique (usage futur)
│   │   └── components/
│   │       ├── Background.tsx      ← BaseBg (warm dark) + Grain
│   │       ├── ParticleBackground.tsx
│   │       ├── KickerSpin.tsx      ← carré menthe qui tourne
│   │       ├── Hairline.tsx        ← HairlineRule + HairlineCard
│   │       ├── Signature.tsx       ← SignatureItalic + SlamIn
│   │       └── Reveal.tsx          ← fade + slide générique
│   └── videos/
│       ├── FaceCam.tsx             ← composition principale
│       ├── facecam-metadata.ts     ← calculateMetadata (durée dynamique)
│       └── lib/facecam/            ← moteur FaceCam + 9 scènes
└── public/
    └── facecam-raws/               ← sources mp4 bruts (gitignored sauf .gitkeep)
```

### Concepts Remotion utiles

- `useCurrentFrame()` : frame actuel (0 au début, 30 à 1s @ 30fps)
- `interpolate(frame, [a,b], [from,to])` : mappage linéaire
- `spring({frame, fps, config})` : animation spring physique de 0 à 1
- `<Sequence from={N} durationInFrames={M}>` : rend ses enfants pendant frames [N..N+M]

---

## Troubleshooting

### Le mp4 ne s'ouvre pas dans QuickTime / Aperçu / Quick Look

**Cause #1 (la plus piégeuse) : cache Quick Look macOS.** Si tu as essayé d'ouvrir le mp4 pendant qu'il était cassé, macOS a caché ce résultat. Même après réparation, Quick Look continue à refuser.

```bash
npm run cache:clear
# OU manuellement :
qlmanage -r cache && qlmanage -r
```

**Cause #2 : fichier vraiment cassé.** Tu as cliqué le bouton Render de Studio ou un render a planté en cours.

```bash
npm run fix:mp4
```

Ce script vérifie tous les mp4 dans `out/` et ré-encode ceux qui ne sont pas conformes.

### Whisper introuvable

Relance `bash scripts/setup-whisper.sh`. Vérifie que le binaire est dans `scripts/lib/whisper.cpp/main`.

### Le crop coupe le visage

Dans `facecam-data/<episodeId>.timeline.json`, passe `cropAnchor` à `"center"` ou `"bottom"` selon la position de ta tête.

### Erreur de validation timeline JSON

Lis le message d'erreur zod : il indique le chemin exact du champ invalide. Vérifie notamment que `tEnd > tStart` sur chaque event et que `scene` est l'un des 9 noms du kit.

### Source HEVC / format non lisible

Si ton mp4 est en HEVC (iPhone en mode "haute efficacité"), `apply-cuts.mjs` tente une conversion automatique. En cas d'échec : `ffmpeg -i in.mp4 -c:v libx264 -pix_fmt yuv420p -c:a aac out.mp4`.

### "Cannot find native binding" / rspack errors

Le `node_modules` a été contaminé par une install d'une autre archi. Solution :

```bash
rm -rf node_modules package-lock.json
npm install
```

### Studio ne charge pas / play fait rien

Hard-refresh le navigateur (Cmd+Shift+R). Vérifie qu'aucun `delayRender(...) timed out` n'apparaît dans le terminal du `npm run dev`.

### Les fonts ne s'affichent pas

Ouvre la console navigateur (Cmd+Option+I). Si tu vois des erreurs `googleapis.com Failed to load`, c'est que ton réseau bloque Google Fonts. Le fallback système prend le relais.

### Le render semble bloqué au milieu

Si le canvas (particules) crashe, le render hang. Vérifie le terminal. Solution : réduis `COUNT` dans `src/lib/components/ParticleBackground.tsx` (40 par défaut).

---

## Hors-scope (à faire ailleurs)

- **Voix off** : enregistre dans QuickTime / Logic / Audacity, pose-la sur le mp4 dans CapCut / DaVinci. Le mp4 sort muet de Remotion volontairement.
- **Musique** : idem. L'infra `src/lib/score/` existe pour un usage futur — pas encore intégrée au render FaceCam.
- **Sous-titres TikTok auto** : la plateforme le fait native sur upload.
- **Auto-publish TikTok / IG** : à faire manuellement.
