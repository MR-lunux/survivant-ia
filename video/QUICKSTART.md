# FaceCam — quickstart Mathieu

Recette copier-coller pour produire un épisode. Pour les détails (architecture, kit de scènes), voir `README.md` et `src/lib/facecam/SCENES.md`.

---

## Setup (une fois)

```bash
cd video

# Whisper FR + ffmpeg + cmake
bash scripts/setup-whisper.sh
brew install ffmpeg cmake

# MediaPipe face tracking (venv Python 3.9 local)
python3.9 -m venv .venv
.venv/bin/pip install mediapipe opencv-python
```

---

## Pipeline d'un épisode

### 1. Rushes + derush dans CapCut

Tu films en portrait 9:16 sur ton phone, idéalement avec le texte au-dessus de ta tête comme prompteur. Tu derushes dans CapCut pour garder uniquement les bonnes prises. Export en `.mov`.

**Pas de captions encore** — elles s'ajoutent à la toute fin (étape 7).

### 2. Drop dans le repo

Un dossier par sujet dans `video/facecam-data/<sujet>/`, contenant :
- `0517.mov` — ton derush propre
- `0517.txt` — ton script texte (une ligne par phrase)

### 3. Import

```bash
npm run facecam:import -- video/facecam-data/<sujet>/0517.mov <episodeId>
```

Le script bake la rotation iPhone, downscale en 1080×1920, encode en H.264 propre. Sortie : `public/facecam-raws/<episodeId>.mp4`.

### 4. Prepare (Whisper + silences)

```bash
npm run facecam:prepare -- <episodeId>
```

Sortie : `facecam-data/<episodeId>.transcript.json` (mots + timestamps) + `.silences.json`. Durée : ~temps réel sur M1.

### 5. Face track

```bash
npm run facecam:track -- <episodeId>
```

MediaPipe détecte ta position visage à 5fps, calcule la moyenne + bias yeux. Crop static stable (anti-tremblement).

### 6. Demander à Claude le montage

Dans une session Claude Code dans ce projet :

> "Voici episode-XXX. Lis le transcript + le script .txt, génère la timeline avec motion design DA-aligné."

Pour les beats que tu veux storyboarder, brief :

> "À 00:34, je dis 'X'. J'aimerais [métaphore visuelle]."

Claude génère `facecam-data/<episodeId>.timeline.json` et peut coder de nouvelles scènes custom si besoin.

### 7. Render

```bash
npm run render:facecam -- <episodeId>
```

Sortie : `out/facecam-<episodeId>.mp4` (Constrained Baseline H.264 yuv420p faststart, joue partout).

### 8. CapCut final — captions karaoke

Réimporte `out/facecam-<episodeId>.mp4` dans CapCut. Lance l'auto-caption FR. Style :
- Police bold sans-serif
- Fill `#6CE3B5` pour le mot actif (karaoke menthe)
- Fill blanc/cream pour le reste
- Position en haut ou centre, hors de la zone face cam

Export final → publication TikTok / Reels / Shorts.

---

## Si ça plante

| Erreur | Cause | Fix |
|---|---|---|
| `Missing whisper binary` | setup whisper pas fait | `bash scripts/setup-whisper.sh` |
| `Invalid episodeId "..."` | caractères interdits dans le nom | utiliser uniquement `[A-Za-z0-9_-]` |
| `Refusing to overwrite ...` | import 2× même episodeId | `rm public/facecam-raws/<id>.mp4` puis re-import |
| `Missing timeline at ...` | timeline.json pas généré | demande à Claude (étape 6) |
| `unusual ratio` | source ni 9:16 ni 16:9 | refilme dans le bon ratio |
| Studio preview vide | sync timeline pas fait | `node scripts/sync-timeline.mjs <id>` |
| QuickTime refuse le mp4 | codec non conforme | `npm run fix:mp4` |
| Visage coupé en haut/bas | cropAnchor mal réglé | tweak `cropAnchor` dans timeline JSON (`"top"`, `"center"`, `"bottom"`, `{y: 0.3}`) |
| Vidéo source à l'envers | rotation iPhone mal interprétée | re-importe avec `facecam:import` (rotation auto-bakée) |

---

## Re-render rapide d'une variante

Si tu changes la timeline.json mais que tu veux pas refaire tout le pipeline :

```bash
node scripts/sync-timeline.mjs <episodeId>
node scripts/render-facecam.mjs <episodeId>
```

Le `sync-timeline` recopie la timeline vers `public/` pour que Remotion la voie. Le render produit un nouveau mp4.

---

## Smoke test

Si tu doutes que le pipeline fonctionne :

```bash
node scripts/make-demo-fixture.mjs
node scripts/render-facecam.mjs _demo-10s
```

Sortie attendue : `out/facecam-_demo-10s.mp4` (~1 Mo, 10s).
