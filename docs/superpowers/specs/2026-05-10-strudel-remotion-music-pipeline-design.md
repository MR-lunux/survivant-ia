# Strudel ↔ Remotion music pipeline — design

**Date** : 2026-05-10
**Scope** : ajouter une bande son aux vidéos Remotion de Survivant-IA, générée et synchronisée via strudel-claude.
**Status** : design validé, prêt à passer en plan d'implémentation.

---

## Contexte

Les 3 vidéos Remotion (`RapportTerminal`, `Storytime`, `TestDiagnostic`) sont aujourd'hui muettes :
`scripts/post-encode.mjs:48` force `-an` (pas de piste audio) au post-encode ffmpeg.

L'objectif : intégrer une bande son **synchronisée frame-précise** sur les beats narratifs, dans
deux directions sonores possibles (Hans Zimmer tendu / 8-bit nostalgique). L'outil canonique pour
composer la musique est `strudel-claude` (cf. `memory/reference_strudel_claude.md`) — un live-coding
Strudel exposant une API REST et un enregistreur WAV browser-side.

## Décisions de design (validées en brainstorming)

| Question | Décision |
|---|---|
| Source de vérité du timing | La vidéo Remotion (les `<Sequence from={N}>` existants). On ne refactor pas. |
| Schéma du score | Beats abstraits (`role` × `intensity`) + `preset` par vidéo. |
| Granularité des beats | Mix : Sequence-level toujours, word-level optionnel selon la vidéo. |
| Où vit le score | Un fichier `<Composition>.score.ts` à côté du `.tsx`. |
| Nombre de presets v1 | Un seul (`zimmer-tense`). `8bit-nostalgic` en v1.5. |
| Mode d'itération | Watcher chokidar qui POST le code Strudel à `/api/code` à chaque save. |
| Cible du watcher | Picker interactif au démarrage, lock sur une vidéo pour la session. |
| GUI custom | Aucune. 3 fenêtres existantes (VS Code + Remotion Studio + strudel-claude). |
| Drift score↔vidéo | Validation advisory (warning console), non bloquante. |

## Architecture

```
video/
├── src/
│   ├── videos/
│   │   ├── RapportTerminal.tsx              # MODIFIÉ : 1 ligne <Audio src=...>
│   │   ├── RapportTerminal.score.ts         # NEW : 1 fichier par vidéo
│   │   ├── Storytime.tsx + .score.ts
│   │   └── TestDiagnostic.tsx + .score.ts
│   └── lib/
│       └── score/
│           ├── types.ts                     # NEW : Score, Beat, Role, Intensity
│           ├── generate.ts                  # NEW : score → string Strudel
│           └── presets/
│               ├── index.ts                 # NEW : registry
│               └── zimmer-tense.ts          # NEW : preset v1
├── scripts/
│   ├── post-encode.mjs                      # MODIFIÉ : retirer -an, ajouter -c:a aac
│   ├── music-scaffold.mjs                   # NEW : .tsx → .score.ts brouillon
│   ├── music-dev.mjs                        # NEW : watcher + picker + POST strudel-claude
│   └── music-install.mjs                    # NEW : WAV → MP3 → public/audio/
├── public/
│   └── audio/                               # NEW : MP3 servis par staticFile()
│       ├── rapport-terminal.mp3
│       ├── storytime.mp3
│       └── test-diagnostic.mp3
└── package.json                             # MODIFIÉ : 3 nouveaux scripts npm
```

**Périmètre du changement code** :
- 7 nouveaux fichiers de lib/scripts (`types.ts`, `generate.ts`, `presets/index.ts`, `presets/zimmer-tense.ts`, `music-scaffold.mjs`, `music-dev.mjs`, `music-install.mjs`)
- 1 nouveau fichier `.score.ts` par vidéo (×3, généré par scaffold puis adapté à la main)
- 1 ligne `<Audio>` ajoutée par vidéo `.tsx` (×3)
- 2 modifs ponctuelles : `post-encode.mjs` (audio activé), `package.json` (3 scripts npm)
- 1 nouveau dossier `public/audio/` (les MP3 produits sont gitignored ou commités selon préférence — à trancher en plan)
- 0 refactor du code Remotion existant

## Schéma du score

```ts
// src/lib/score/types.ts
export type BeatRole =
  | "impact"      // gros coup (slam-in, gros chiffre)
  | "accent"      // ponctuation moyenne (transition de Sequence, mot-clé fort)
  | "transition" // pivot/riser (changement de plan)
  | "drop"        // bass drop (close domaine, verdict)
  | "sustain";    // tenue (pause, drone)

export type Intensity = "soft" | "medium" | "heavy";

export type Preset = "zimmer-tense" | "8bit-nostalgic";

export type Beat = {
  atFrame: number;
  role: BeatRole;
  intensity: Intensity;
  label?: string;       // ex: "stat1-slam" — pour debug/grep, optionnel
};

export type Score = {
  composition: string;       // "RapportTerminal"
  durationInFrames: number;
  fps: number;
  preset: Preset;
  beats: Beat[];
};
```

### Exemple — `RapportTerminal.score.ts`

```ts
import type { Score } from "../lib/score/types";

export const SCORE: Score = {
  composition: "RapportTerminal",
  durationInFrames: 900,
  fps: 30,
  preset: "zimmer-tense",
  beats: [
    { atFrame: 60,  role: "impact",     intensity: "heavy",  label: "stat1" },
    { atFrame: 200, role: "impact",     intensity: "heavy",  label: "stat2" },
    { atFrame: 340, role: "accent",     intensity: "medium", label: "deux" },
    { atFrame: 420, role: "accent",     intensity: "soft",   label: "saute" },     // word-level
    { atFrame: 490, role: "transition", intensity: "soft",   label: "pivot" },
    { atFrame: 518, role: "accent",     intensity: "medium", label: "pilote" },    // word-level
    { atFrame: 570, role: "accent",     intensity: "soft" },
    { atFrame: 645, role: "accent",     intensity: "soft" },
    { atFrame: 720, role: "accent",     intensity: "soft" },
    { atFrame: 820, role: "drop",       intensity: "heavy",  label: "close" },
  ],
};
```

## Schéma d'un preset

```ts
// src/lib/score/presets/zimmer-tense.ts
import type { Beat } from "../types";

export type PresetDefinition = {
  name: string;
  base: (ctx: { totalSeconds: number }) => string;   // couche permanente (drone)
  beat: (beat: Beat) => string;                       // snippet pour un beat ponctuel
};

export const zimmerTense: PresetDefinition = {
  name: "zimmer-tense",
  base: () => `note("c1").s("sine").gain(0.35).room(0.7).slow(8)`,
  beat: ({ role, intensity }) => {
    if (role === "impact" && intensity === "heavy") return `s("bd:8").gain(1.0).room(0.4)`;
    if (role === "drop")                            return `s("bd:8 sub").gain(1.2).attack(0.05)`;
    if (role === "transition")                      return `s("crash").gain(0.6)`;
    if (role === "accent")                          return `s("hh:3").gain(0.5)`;
    return `s("perc").gain(0.3)`;
  },
};
```

L'idiome exact des sons (`bd:8`, `crash`, etc.) sera itéré pendant l'implémentation jusqu'à ce que la
sonorité matche réellement la référence Zimmer. **L'implémentation du preset est de la R&D, pas juste du code** —
à budgéter explicitement dans le plan.

## Générateur Strudel

```ts
// src/lib/score/generate.ts
export function generateStrudel(score: Score): string {
  const preset = PRESETS[score.preset];
  const totalSeconds = score.durationInFrames / score.fps;

  const base = preset.base({ totalSeconds });

  const triggers = score.beats.map(beat => {
    const atSec = beat.atFrame / score.fps;
    const snippet = preset.beat(beat);
    return `// ${beat.label ?? beat.role} @ frame ${beat.atFrame}\n  ${snippet}.late(${atSec.toFixed(3)})`;
  }).join(",\n");

  return `setcps(1);\nstack(\n  ${base},\n${triggers}\n)`;
}
```

L'idiome Strudel exact (`stack`, `late`, `cps`, `struct`, `cat`…) à valider durant l'implémentation
contre la doc Strudel actuelle. Le contrat reste : in = `Score`, out = chaîne de code Strudel valide.

## Pipeline de bout en bout

```
┌──────────────────┐
│ RapportTerminal  │ ← tu édites
│   .score.ts      │
└────────┬─────────┘
         │ Cmd+S
         ▼
┌──────────────────────┐
│ scripts/music-dev    │
│  1. lit le score     │
│  2. check drift      │
│  3. generateStrudel  │
│  4. POST /api/code   │
│  5. POST /api/play   │
└────────┬─────────────┘
         │ HTTP
         ▼
┌──────────────────┐
│  strudel-claude  │ ← tu écoutes / tu records
│  (browser :3001) │   [● REC] → WAV
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ scripts/music-install.mjs                    │
│  ffmpeg WAV → MP3 192kbps → public/audio/    │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ RapportTerminal.tsx      │
│ <Audio src={staticFile(  │  ← 1 ligne ajoutée
│   "audio/rapport.mp3"    │     une fois pour toutes
│ )} />                    │
└────────┬─────────────────┘
         │ npm run render:rapport
         ▼
┌──────────────────────┐
│ post-encode.mjs      │
│  -an retiré          │  ← 1 mot supprimé
│  +c:a aac +b:a 192k  │     2 flags ajoutés
└────────┬─────────────┘
         │
         ▼
   rapport-terminal.mp4 (avec son)
```

## Watcher avec picker

```
$ npm run music:dev
🎵 strudel-claude detected on :3001

? Which video are you scoring?
❯ RapportTerminal  (preset: zimmer-tense, last edit 2min ago)
  Storytime        (preset: 8bit-nostalgic, last edit 1h ago)
  TestDiagnostic   (no score yet — run music:scaffold first)

✓ Locked on RapportTerminal. Watching .score.ts...
✓ Sent to strudel-claude. Listening on :3001.
[Cmd+S in editor → re-emits → strudel-claude reloads]
```

- `npm run music:dev` → picker interactif (via `@inquirer/prompts` ou équivalent)
- `npm run music:dev -- RapportTerminal` → skip le picker, lock direct
- Lock pour la durée de la session : pas de saut surprise sur une autre vidéo
- Switch de vidéo = Ctrl+C, relance

## Drift detection (advisory)

À chaque save, le watcher :
1. Parse le `.tsx` correspondant (regex `<Sequence\s+from=\{(\d+)\}` + `durationInFrames=\{(\d+)\}`)
2. Compare avec les `atFrame` du score
3. Print des warnings non-bloquants

```
[music:dev] Score → Strudel envoyé.
⚠ Drift detected:
  - Sequence at frame 70 in RapportTerminal.tsx has no matching beat (off by 10 from beat#1).
  - Beat at frame 60 has no matching <Sequence> (renamed? deleted?).
```

Volontairement advisory : on accepte qu'un beat word-level n'ait pas de Sequence correspondante, et qu'une
Sequence puisse exister sans beat dédié (e.g. la SEQ 4 de pivot dont l'animation est portée par le beat 490 de transition).

Heuristique : warner uniquement si une Sequence n'a **aucun** beat dans une fenêtre de ±5 frames autour de son
`from`, et si un beat de role `impact|drop|transition` n'a aucun `<Sequence>` dans cette fenêtre.

## Conversion WAV → MP3

```bash
npm run music:install -- ~/Downloads/recording.wav RapportTerminal
```

Fait :
```
ffmpeg -i ~/Downloads/recording.wav -b:a 192k -ar 48000 -ac 2 \
  video/public/audio/rapport-terminal.mp3
```

- 192 kbps = sweet spot taille/qualité TikTok
- 48 kHz / stéréo = standard vidéo, évite des resampling au render

## Modifs Remotion par vidéo (1 ligne)

```tsx
// src/videos/RapportTerminal.tsx
import { Audio, staticFile } from "remotion";

export const RapportTerminal: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Audio src={staticFile("audio/rapport-terminal.mp3")} />
      {/* ... le reste reste exactement identique ... */}
    </AbsoluteFill>
  );
};
```

Le `<Audio>` est ajouté **après** que le score soit recorded et la MP3 installée (sinon Remotion warn sur fichier manquant). On peut ajouter la ligne au moment où on lance la première itération sur cette vidéo, en sachant qu'elle ne fera rien tant que le MP3 n'est pas dispo.

## Modif `post-encode.mjs`

Diff :

```diff
-      "-an",
+      "-c:a", "aac",
+      "-b:a", "192k",
```

L'audio AAC + faststart + baseline H.264 reste compatible TikTok / iOS / QuickTime.

## Nouveaux scripts npm

```jsonc
{
  "scripts": {
    "music:scaffold": "node scripts/music-scaffold.mjs",
    "music:dev": "node scripts/music-dev.mjs",
    "music:install": "node scripts/music-install.mjs"
  }
}
```

## Critères de succès

- [ ] Les 3 vidéos existantes ont chacune une bande son alignée sur leurs beats narratifs
- [ ] Ajouter une nouvelle vidéo = `.tsx` + `music:scaffold` + adapt + `music:dev` + record + `music:install`. Délai musique <30 min.
- [ ] Le watcher `music:dev` réduit le cycle "modif → écoute" à <1s en moyenne
- [ ] Le drift score↔vidéo est warné dans la console, pas silencieux
- [ ] `npm run render:*` produit des mp4 avec piste audio AAC validée (vérifié `ffprobe`)
- [ ] Un mp4 généré joue avec son sur QuickTime + iOS + upload TikTok

## Hors scope v1

| Sujet | Raison |
|---|---|
| Headless auto-record (Playwright qui capture l'audio depuis strudel-claude) | Ajoute un browser-runner + capture audio routing. Trop pour gagner 1 clic. À reprendre si volume >20 vidéos/mois. |
| Plus d'un preset | On part avec `zimmer-tense` seul. `8bit-nostalgic` en v1.5 quand le preset Zimmer est figé. |
| Markers visuels dans Remotion Studio (overlay des beats sur le scrubber) | Optionnel, ~30 lignes. Stretch goal pendant l'implémentation, sinon v1.5. |
| Ducking automatique pour voix off | Pas de VO dans les scripts actuels. À reprendre quand un script en demandera. |
| Cross-video musical themes (motifs récurrents entre vidéos) | YAGNI. Chaque vidéo TikTok stand-alone. |
| Strudel determinism / seeded output | strudel-claude n'expose pas de seed. Le WAV figé après record est l'output reproductible. |
| Re-scaffold automatique en cas de drift critique | Le warning console suffit pour v1. Manuel : tu relances `music:scaffold` quand tu veux merger. |

## Risques connus + mitigation

| Risque | Mitigation |
|---|---|
| Le preset Zimmer ne sonne pas Zimmer (Strudel n'a pas les samples brass orchestraux) | Itérer le preset (couches sub-bass, sawtooth tendus, samples libres dispo dans Strudel). Si insuffisant : injecter des samples maison via `samples()` Strudel. À provisionner du temps R&D dans le plan. |
| Drift check trop bruyant (beats word-level générant des faux warnings) | Heuristique fenêtre ±5 frames + filtrage par role. Itérable. |
| Race chokidar avec autoformat à la save | Debounce 200ms sur le handler. |
| Strudel-claude pas lancé quand `music:dev` démarre | Connect-retry avec backoff + message clair "lance strudel-claude sur :3001 et appuie ENTER". |
| Audio plus court/long que la vidéo | Remotion gère nativement (silence padding / truncate). Documenté dans le code. |
| Le port `:3001` de strudel-claude entre en conflit avec autre chose | Configurable via env `STRUDEL_CLAUDE_URL` dans le watcher. |
| `staticFile("audio/...")` ne trouve pas le fichier | Remotion warn au render mais ne crash pas — comportement acceptable. Documenté dans `TWEAK.md`. |

## Questions ouvertes pour le plan d'implémentation

1. **Idiome Strudel précis** pour positionner des one-shots à des secondes absolues : `.late()` vs `.struct()` vs `cat()` avec position fractionnaire — à valider en lisant la doc Strudel actuelle pendant l'implémentation.
2. **Format ffmpeg final** : faut-il `-c:a aac` ou `-c:a copy` quand Remotion rend déjà en AAC ? À vérifier sur la sortie raw de `remotion render`.
3. **Inquirer vs alternatives** : `@inquirer/prompts` (officiel) vs `prompts` (lighter). À choisir selon les deps déjà présentes.
4. **Scaffolder : merge ou réécriture ?** Quand `music:scaffold` est rerun sur un score existant, faut-il merger les nouvelles `<Sequence>` détectées en gardant les adaptations utilisateur, ou tout réécrire avec confirmation ? Recommandation : merger par défaut, avec flag `--overwrite`.
5. **Sample rate du record strudel-claude** : si l'output est 44.1 kHz, le `music:install` re-sample à 48 kHz via ffmpeg — vérifier que la qualité reste OK.

---

**Suite** : passage en `superpowers:writing-plans` pour découper en étapes implémentables avec checkpoints.
