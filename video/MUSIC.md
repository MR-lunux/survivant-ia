# Pipeline musique — synchroniser une bande son sur une vidéo Remotion

Guide complet pour ajouter une musique alignée sur les beats narratifs d'une vidéo
Remotion via [strudel-claude](https://github.com/renatoworks/strudel-claude). À lire
si tu reprends ce repo ou le portes ailleurs.

## Vue d'ensemble

```
┌──────────────────────┐  ┌────────────────────┐  ┌─────────────────────┐
│ VS Code              │  │ Remotion Studio    │  │ strudel-claude      │
│ <Video>.score.ts     │  │ (browser :3000)    │  │ (browser :3010)     │
│ (tu édites)          │  │ (tu regardes)      │  │ (tu écoutes + REC)  │
└──────────┬───────────┘  └────────────────────┘  └──────────┬──────────┘
           │                                                 ▲
           │ Cmd+S                                           │ POST /api/code
           ▼                                                 │
┌────────────────────────────────────────────────────────────┘
│ npm run music:dev — watcher : score → Strudel → push HTTP
└────────────────────────────────────────────────────────────┐
                                                             ▼
                                              [● REC dans le browser]
                                                             │
                                                             ▼
                                                   recording.wav
                                                             │
                                                             ▼
                                          npm run music:install
                                                             │
                                                             ▼
                                          public/audio/<video>.mp3
                                                             │
                                                             ▼
                                          <Audio src={staticFile(...)} /> dans le .tsx
                                                             │
                                                             ▼
                                                   npm run render:<video>
                                                             │
                                                             ▼
                                                       out/<video>.mp4 avec son
```

## Pré-requis (one-time setup)

### 1. Cloner strudel-claude

```bash
cd ~/Documents
git clone https://github.com/renatoworks/strudel-claude.git
cd strudel-claude
npm install
```

### 2. Vérifier ffmpeg

```bash
ffmpeg -version
```

Si absent : `brew install ffmpeg` (macOS) ou équivalent.

### 3. Vérifier les deps du projet vidéo

Depuis ce repo, dans `video/` :

```bash
cd video
npm install
```

Les deps musique (`vitest`, `tsx`, `chokidar`, `@inquirer/prompts`) doivent être en
devDependencies. Si tu fais `npm run test` et ça affiche une version de vitest, c'est bon.

### 4. Choisir un port libre pour strudel-claude

Le watcher (`scripts/music-dev.ts`) attend strudel-claude sur **`http://localhost:3010`** par
défaut. Si ce port est pris sur ta machine, override via env var :

```bash
STRUDEL_CLAUDE_URL=http://localhost:3020 npm run music:dev -- RapportTerminal
```

(et lance strudel-claude sur le port matchant : `PORT=3020 npm run dev` dans `~/Documents/strudel-claude`)

## Workflow par vidéo (~30 min de musique)

### Étape 1 — Lancer strudel-claude

Ouvre un terminal dédié, et **garde-le ouvert** :

```bash
cd ~/Documents/strudel-claude
PORT=3010 npm run dev
```

Ouvre `http://localhost:3010` dans un onglet de navigateur. Tu verras un éditeur Strudel
plein écran. Laisse-le ouvert.

### Étape 2 — Scaffolder le score (auto)

Pour chaque vidéo Remotion (`<Video>.tsx`), génère un brouillon de `.score.ts` en lisant
les `<Beat duration={N}>` de la vidéo :

```bash
cd /path/to/video
npm run music:scaffold -- <NomDeLaVideo>
# ex: npm run music:scaffold -- RapportTerminal
```

Ça crée `src/videos/<NomDeLaVideo>.score.ts` avec un beat à chaque frontière de Beat,
tous typés `role: "accent", intensity: "medium"`. Override avec `--force` si le fichier
existe déjà.

### Étape 3 — Adapter le score à la main

Ouvre `src/videos/<NomDeLaVideo>.score.ts` et adapte :

- **Pour les `<BeatSlamIn>` ou gros chiffres** → `role: "impact", intensity: "heavy"`
- **Pour les ponctuations / mots-clés** → `role: "accent"` avec intensity selon
- **Pour les pivots / risers** → `role: "transition"`
- **Pour le close / drop final** → `role: "drop", intensity: "heavy"`
- **Pour les pauses / drones de fond** → `role: "sustain"`

**Ajoute des beats word-level** en regardant le `.tsx` :
- `<BeatSlamIn delay={0.2}>` → ajoute un beat à `atSec: <beatStart> + 0.2`
- `<BeatTypeOn delay={2.7}>` → ajoute un beat à `atSec: <beatStart> + 2.7`
- `<BeatSignature delay={0.9}>` → ajoute un accent

### Étape 4 — Choisir le preset

Dans le `.score.ts`, `preset` peut être :

- **`"zimmer-tense"`** — sub-bass tendu + brass-like stabs + drone permanent. Pour
  RapportTerminal, TestDiagnostic, et toute vidéo "tension data" / "monitoring".
- **`"8bit-nostalgic"`** — square waves NES-like + chiptune drums + arpèges. Pour
  Storytime ou tout REX émotionnel / nostalgique.

Tu peux switcher en cours d'itération — un Cmd+S et tu entends l'autre direction.

### Étape 5 — Boucle d'itération avec le watcher

Dans un autre terminal (toujours depuis `video/`) :

```bash
npm run music:dev -- <NomDeLaVideo>
```

Le watcher :
1. Détecte strudel-claude sur :3010
2. Charge ton score, génère du code Strudel, le POSTe à `/api/code` puis `/api/play`
3. Watch le `.score.ts` ; à chaque save → re-génère et re-POST (debounce 200ms)
4. Affiche des `⚠ Drift detected` si tes `atSec` ne correspondent pas aux frontières
   de Beat dans le `.tsx` (advisory, non-bloquant)

**La boucle créative** :
- Édite `<Video>.score.ts` dans VS Code
- Cmd+S
- ~500ms plus tard, strudel-claude rejoue le nouveau code
- Écoute, compare avec la preview Remotion (qui tourne en parallèle sur :3000 si
  tu as fait `npm run dev` dans une autre fenêtre)
- Itère jusqu'à ce que ça tape juste

Pour lancer Remotion Studio en parallèle :

```bash
# dans une 3ème fenêtre de terminal, depuis video/
npm run dev
# ouvre http://localhost:3000, scrubbe la timeline
```

### Étape 6 — Recorder le WAV

Quand le code Strudel sonne juste, dans le browser strudel-claude (`http://localhost:3010`) :

1. Cherche le bouton **[● REC]** (en haut de l'interface)
2. Clique pour démarrer
3. Laisse tourner ≥ la durée totale de ta vidéo (ex: 30s pour RapportTerminal)
4. Clique pour arrêter
5. Le WAV est téléchargé automatiquement par le navigateur

### Étape 7 — Convertir en MP3 et installer

```bash
cd /path/to/video
npm run music:install -- ~/Downloads/<le-fichier>.wav <NomDeLaVideo>
# ex: npm run music:install -- ~/Downloads/strudel-claude-2026-05-10.wav RapportTerminal
```

Ça produit `public/audio/<nom-kebab>.mp3` (192kbps stéréo 48kHz). Le script affiche
ensuite la ligne exacte à coller dans le `.tsx`.

### Étape 8 — Câbler `<Audio>` dans la vidéo

Dans `src/videos/<NomDeLaVideo>.tsx`, ajoute (une seule fois par vidéo) :

```tsx
import { AbsoluteFill, Audio, staticFile } from "remotion";

// ...

return (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
    <Audio src={staticFile("audio/<nom-kebab>.mp3")} />
    {/* ... le reste de la vidéo ... */}
  </AbsoluteFill>
);
```

### Étape 9 — Render final avec audio

```bash
npm run render:<videokey>
# ex: npm run render:rapport
```

Le post-encode (`scripts/post-encode.mjs`) re-encode l'audio en AAC 192k pour la
compatibilité TikTok / iOS / QuickTime.

Vérification : `ffprobe -v error -show_entries stream=codec_name,codec_type out/<video>.mp4`
doit montrer un stream `codec_type=video, codec_name=h264` ET un `codec_type=audio,
codec_name=aac, sample_rate=48000`.

## Référence : le schéma du score

`video/src/lib/score/types.ts` :

```ts
export type BeatRole =
  | "impact"      // gros coup (slam-in, gros chiffre)
  | "accent"      // ponctuation moyenne (transition de Beat, mot-clé fort)
  | "transition" // pivot/riser (changement de plan)
  | "drop"        // bass drop (close domaine, verdict)
  | "sustain";    // tenue (pause, drone)

export type Intensity = "soft" | "medium" | "heavy";
export type PresetName = "zimmer-tense" | "8bit-nostalgic";

export type Beat = {
  atSec: number;        // moment du beat (depuis début vidéo)
  role: BeatRole;
  intensity: Intensity;
  label?: string;       // libre, sert au debug ; e.g. "stat1-slam"
};

export type Score = {
  composition: string;  // ex: "RapportTerminal"
  durationSec: number;  // durée totale en secondes
  fps: number;          // 30
  preset: PresetName;
  beats: Beat[];
};
```

## Référence : architecture des fichiers

```
video/
├── src/
│   ├── lib/score/
│   │   ├── types.ts                   # schéma Score + Beat
│   │   ├── generate.ts                # Score → string Strudel
│   │   └── presets/
│   │       ├── index.ts               # registry { "zimmer-tense": ..., "8bit-nostalgic": ... }
│   │       ├── zimmer-tense.ts        # mapping role/intensity → snippets sub-bass + stabs
│   │       └── 8bit-nostalgic.ts      # mapping role/intensity → snippets square waves
│   └── videos/
│       ├── <Video>.tsx                # vidéo Remotion (utilise <BeatStack> + <Beat duration={N}>)
│       └── <Video>.score.ts           # ton score adapté
├── scripts/
│   ├── lib/
│   │   ├── extract-beats.ts           # parse <Beat duration={N}> → [{atSec, durationSec}]
│   │   └── check-drift.ts             # warns si score ≠ frontières de Beat
│   ├── music-scaffold.ts              # CLI : génère un .score.ts brouillon
│   ├── music-dev.ts                   # CLI : watcher + push à strudel-claude
│   ├── music-install.mjs              # CLI : WAV → MP3 → public/audio/
│   └── post-encode.mjs                # ffmpeg final (preserve audio AAC)
├── public/
│   └── audio/
│       └── <video>.mp3                # MP3 final, consommé par <Audio>
└── package.json                       # scripts npm: music:scaffold, music:dev, music:install, render:*
```

## Référence : presets

### `zimmer-tense`
- **Base layer** (drone permanent) : `note("c1").s("sine").gain(0.35).room(0.7).slow(8)`
- **impact heavy** : `s("bd:8").gain(1.0).room(0.4)` (kick brass-like)
- **drop** : `s("bd:8 sub").gain(1.2).attack(0.05)` (sub-bass massif)
- **transition** : `s("crash").gain(0.6)`
- **accent heavy** : `s("hh:5").gain(0.7)` ; **soft** : `s("hh:3").gain(0.5)`
- **sustain** : `note("c2").s("sawtooth").gain(0.3)` (pad tendu)

### `8bit-nostalgic`
- **Base layer** : `note("c4 eb4 g4").s("square").gain(0.2).slow(4)` (arpège mineur)
- **impact heavy** : `note("c2").s("square").gain(1.0).attack(0.01).decay(0.15)`
- **drop** : `note("c1").s("square").gain(1.1).decay(0.4)`
- **transition** : `note("c5 d5 e5 g5").s("square").gain(0.4).fast(8)` (riser)
- **accent heavy** : `s("bd:1").gain(0.8)` ; **soft** : `s("hh:1").gain(0.5)`
- **sustain** : `note("c3").s("triangle").gain(0.3)`

Pour ajouter un preset (ex: synthwave) :
1. Crée `video/src/lib/score/presets/synthwave.ts` qui exporte un `PresetDefinition`
2. Ajoute `"synthwave"` au type `PresetName` dans `types.ts`
3. Wire dans `presets/index.ts` : `"synthwave": synthwave`

## Troubleshooting

### `✗ strudel-claude unreachable on http://localhost:3010`

- Vérifie que strudel-claude tourne : `lsof -iTCP:3010 -sTCP:LISTEN -P`
- Si un autre process écoute sur 3010, override : `STRUDEL_CLAUDE_URL=http://localhost:<autre> npm run music:dev`

### `⚠ Drift detected: <Beat> boundary at X.XXs has no score beat...`

C'est advisory. Plusieurs causes acceptables :
- Tu as délibérément choisi de ne pas mettre de beat à cette frontière (ex: tu veux du silence pendant ce Beat)
- Floating-point imprécision : un beat à 5.2 et une frontière à 5.0 avec window=0.2 peut faussement warner. Ignorable.
- Tu as ajouté un word-level beat qui n'aligne avec aucune frontière (normal, c'est intentionnel pour `role: "accent"`)

Le warning ne bloque pas le push à strudel-claude.

### Les samples Strudel ne sonnent pas comme attendu

Strudel a une banque de samples `bd:N`, `hh:N`, etc. Les indices varient selon le bank.
Si `s("bd:8")` ne sonne pas brass-Zimmer, édite le preset (`presets/zimmer-tense.ts`)
pour essayer `s("bd:5")`, `s("bd:RolandTR909")`, ou un autre instrument. Voir
[strudel.cc/learn/samples](https://strudel.cc/learn/samples).

### Le rendu final n'a pas d'audio

- Vérifie que `<Audio src={staticFile(...)} />` est bien dans le `.tsx`
- Vérifie que `public/audio/<nom-kebab>.mp3` existe
- Vérifie `scripts/post-encode.mjs` : la ligne `"-an"` ne doit PAS être présente (c'est `"-c:a", "aac", "-b:a", "192k"`)
- Inspecte le rendu raw (avant post-encode) : `ffprobe out/_raw-<video>.mp4`

### Le drift checker se trompe trop souvent

Édite `scripts/lib/check-drift.ts`, `WINDOW_SEC` (par défaut 0.2). Augmente à 0.3
ou 0.5 si tes slam-ins ont des delays plus longs.

### Le scaffold ne trouve pas de Beats

`scripts/lib/extract-beats.ts` utilise une regex sur `<Beat duration={N}>`. Si ton
`.tsx` utilise une syntaxe différente (e.g. `<Beat duration={someVar}>`), la regex
ne matchera pas. Soit tu hardcodes la durée, soit tu écris ton `.score.ts` à la
main sans passer par le scaffold.

## Tests

```bash
cd video
npm run test              # 16 tests : extract-beats, check-drift, generate
npm run lint              # eslint + tsc
```

## Spec et plan

- Spec design : `docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md`
- Plan d'implémentation : `docs/superpowers/plans/2026-05-10-strudel-remotion-music-pipeline.md`
  (note : le plan a été écrit avant le refactor Beat-driven du code Remotion ; le code
  utilise maintenant `atSec`/`durationSec` au lieu de `atFrame`/`durationInFrames`,
  tout le reste tient)
