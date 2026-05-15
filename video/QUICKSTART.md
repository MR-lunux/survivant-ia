# FaceCam — quickstart pour Mathieu

Recette copier-coller pour produire un épisode. Pour les détails (architecture, kit, troubleshooting), voir `README.md`.

---

## Une fois (setup)

```bash
cd video
bash scripts/setup-whisper.sh
```

Clone whisper.cpp dans `~/.local/whisper.cpp`, télécharge le modèle FR `large-v3` (~3 Go), compile. Compte ~30 min, à faire une seule fois.

Vérifie `ffmpeg` : `which ffmpeg`. Sinon : `brew install ffmpeg`.

---

## Tournage

Phone selfie portrait 9:16 (le plus simple), ou webcam horizontal 16:9.

Cadrage portrait : visage centré tête-épaules dans le cadre, regard dans l'objectif, ~50 cm, fond sombre, lumière devant. Trépied obligatoire.

> Note `cropAnchor` : pour un selfie naturel (visage centré verticalement), `cropAnchor: "center"` est le bon défaut. `"top"` ne marche que si tu places strictement ta tête dans le tiers haut du cadre.

---

## Pipeline complet, étape par étape

### 1. Importe ton fichier source

```bash
cd video
npm run facecam:import -- ~/Downloads/IMG_8183.MOV episode-001
```

Le script :
- détecte la rotation (typique iPhone : `rotation=-90`) et la **bake dans le stream**
- transcode en H.264 yuv420p AAC faststart
- normalise vers `1080×1920` (portrait) ou `1920×1080` (paysage)
- écrit dans `public/facecam-raws/episode-001.mp4`

Marche avec `.MOV`, `.mp4`, `.mkv`, n'importe quoi que ffmpeg avale. Si l'extension dit déjà mp4 mais qu'il y a une rotation tag (cas fréquent), c'est ré-encodé proprement.

Nomme `episode-001`, `episode-002`, etc. Caractères autorisés : `[A-Za-z0-9_-]` uniquement.

### 2. Prépare (transcribe + détection silences)

```bash
cd video
npm run facecam:prepare -- episode-001
```

Sortie : deux fichiers dans `facecam-data/` :
- `episode-001.transcript.json` (mots + timestamps Whisper)
- `episode-001.silences.json` (blancs détectés > 0.5s)

Durée : ~1× la durée de la vidéo (Whisper local sur M1 ≈ temps réel).

### 3. Demande à Claude le montage

Dans une session Claude Code dans ce projet, dis-lui :

> "Voici episode-001. Lis transcript + silences, propose-moi les cuts, génère la timeline."

Claude :
- lit les 2 JSON
- te propose la liste de cuts à appliquer (tu dis OK ou retires des coupes spécifiques)
- génère `facecam-data/episode-001.timeline.json` (le montage complet)

### 4. Preview dans Studio

```bash
npm run dev
```

Ouvre `http://localhost:3000`, clique sur composition `FaceCam`. Dans le panneau Props à droite, mets `episodeId` à `episode-001`. Tu vois le rendu en preview live.

Si ton visage est mal cadré : ajuste `cropAnchor` (`top`, `center`, `bottom`, ou `{y: 0.3}` pour précis).

Si un mot est mal calé : édite directement `facecam-data/episode-001.timeline.json` ou redemande à Claude de regénérer.

### 5. Render final

```bash
npm run render:facecam -- episode-001
```

Sortie : `video/out/facecam-episode-001.mp4`. Format Constrained Baseline H.264 yuv420p faststart, joue partout (TikTok, QuickTime, iOS, Android).

Durée render : ~1-3 min pour 30-60s de vidéo.

---

## Si ça plante

| Erreur | Cause | Fix |
|---|---|---|
| `Missing whisper binary` | setup-whisper pas fait | `bash scripts/setup-whisper.sh` |
| `Invalid episodeId "..."` | caractères interdits dans le nom | rename avec `[A-Za-z0-9_-]` |
| `Refusing to overwrite ...` | tu importes deux fois le même episodeId | supprime le mp4 dans `public/facecam-raws/` ou pick un autre nom |
| `Missing timeline at ...` | timeline.json pas encore généré | demande à Claude étape 3 |
| Rendu plante "ratio non supporté" | source ni 9:16 ni 16:9 | refilme dans le bon ratio |
| Studio preview vide / erreur fetch | sync timeline pas fait | `node scripts/sync-timeline.mjs episode-001` |
| QuickTime refuse d'ouvrir le mp4 final | encodage pas conforme | `npm run fix:mp4` |
| Ton visage est coupé en haut ou en bas dans le rendu final | cropAnchor mal réglé | change `cropAnchor` à `"center"` (défaut conseillé) ou `{y: 0.3}` pour précis |
| Vidéo source à l'envers ou tournée 90° | rotation tag mal interprété | re-importe avec `facecam:import` (rotation auto-bakée), pas de `mv` manuel |

---

## Variantes d'un même tournage

Pour tester deux montages du même mp4 :

```bash
cp facecam-data/episode-001.timeline.json facecam-data/episode-001-v2.timeline.json
# édite v2, ou demande à Claude une variante
node scripts/sync-timeline.mjs episode-001-v2
node scripts/render-facecam.mjs episode-001-v2
```

Tu obtiens `out/facecam-episode-001-v2.mp4` à comparer.

---

## Smoke test (ça marche encore ?)

```bash
cd video
node scripts/make-demo-fixture.mjs
node scripts/render-facecam.mjs _demo-10s
```

Si `out/facecam-_demo-10s.mp4` se génère, le pipeline va bien.
