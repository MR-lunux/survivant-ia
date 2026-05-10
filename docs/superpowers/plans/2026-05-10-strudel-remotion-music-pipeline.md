# Strudel ↔ Remotion Music Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add synchronized music to all 3 existing Remotion videos via a score-driven pipeline using strudel-claude.

**Architecture:** Each video gets a `.score.ts` file describing musical beats abstractly (`role` × `intensity` × `preset`). A watcher generates Strudel code from the score and pushes it to a running strudel-claude instance via REST. User records the WAV in-browser, converts to MP3 via a CLI helper, drops it into Remotion's `public/audio/`. Remotion's `<Audio>` element + a modified `post-encode.mjs` produce the final mp4 with audio.

**Tech Stack:** TypeScript 5, Remotion 4.0.456, chokidar 4 (watcher), @inquirer/prompts 7 (picker), tsx 4 (TS runtime for scripts), vitest 2 (tests), ffmpeg (WAV→MP3 conversion), strudel-claude (running locally on `:3001`).

**Spec reference:** `docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md`

**Working directory:** All paths below are relative to `/Users/mathieu/Documents/survivor/video/` unless otherwise noted.

---

## Phase A — Foundation (no user interaction)

### Task 1: Install dev dependencies and add npm scripts

**Files:**
- Modify: `video/package.json`

- [ ] **Step 1: Install dev deps**

```bash
cd /Users/mathieu/Documents/survivor/video
npm install -D vitest@^2 tsx@^4 chokidar@^4 @inquirer/prompts@^7
```

- [ ] **Step 2: Add new npm scripts to `package.json`**

In the `"scripts"` object, add:

```jsonc
"test": "vitest run",
"test:watch": "vitest",
"music:scaffold": "tsx scripts/music-scaffold.ts",
"music:dev": "tsx scripts/music-dev.ts",
"music:install": "node scripts/music-install.mjs"
```

- [ ] **Step 3: Verify install + scripts**

Run: `npm run test -- --version`
Expected: vitest version printed, no errors.

- [ ] **Step 4: Commit**

```bash
git add video/package.json video/package-lock.json
git commit -m "chore(video): add deps for music pipeline (vitest, tsx, chokidar, inquirer)"
```

---

### Task 2: Score types

**Files:**
- Create: `video/src/lib/score/types.ts`

- [ ] **Step 1: Create `types.ts`**

```ts
// src/lib/score/types.ts
// Schéma du score musical pour les vidéos Remotion.
// Voir docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md

export type BeatRole =
  | "impact"      // gros coup (slam-in, gros chiffre)
  | "accent"      // ponctuation moyenne (transition de Sequence, mot-clé fort)
  | "transition" // pivot/riser (changement de plan)
  | "drop"        // bass drop (close domaine, verdict)
  | "sustain";    // tenue (pause, drone)

export type Intensity = "soft" | "medium" | "heavy";

export type PresetName = "zimmer-tense" | "8bit-nostalgic";

export type Beat = {
  atFrame: number;
  role: BeatRole;
  intensity: Intensity;
  label?: string;
};

export type Score = {
  composition: string;       // ex: "RapportTerminal" — utilisé pour le filename audio
  durationInFrames: number;
  fps: number;
  preset: PresetName;
  beats: Beat[];
};

export type PresetDefinition = {
  name: PresetName;
  // Couche permanente jouée pendant toute la durée de la vidéo.
  // Reçoit le contexte temps total ; renvoie un fragment de code Strudel valide.
  base: (ctx: { totalSeconds: number }) => string;
  // Snippet de code Strudel pour un beat ponctuel (sans positionnement temporel).
  // Le générateur s'occupera de positionner le snippet dans le temps.
  beat: (beat: Beat) => string;
};
```

- [ ] **Step 2: Verify TS compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add video/src/lib/score/types.ts
git commit -m "feat(video/music): add score types (Beat, Score, PresetDefinition)"
```

---

### Task 3: zimmer-tense preset

**Files:**
- Create: `video/src/lib/score/presets/zimmer-tense.ts`

- [ ] **Step 1: Create preset file**

```ts
// src/lib/score/presets/zimmer-tense.ts
// Direction sonore "Hans Zimmer" : sub-bass tendu, brass-like stabs, drone permanent.
// L'idiome Strudel exact (sample names, params) sera itéré pendant les vidéos pilotes.

import type { PresetDefinition } from "../types";

export const zimmerTense: PresetDefinition = {
  name: "zimmer-tense",
  base: () => `note("c1").s("sine").gain(0.35).room(0.7).slow(8)`,
  beat: ({ role, intensity }) => {
    if (role === "impact") {
      return intensity === "heavy"
        ? `s("bd:8").gain(1.0).room(0.4)`
        : `s("bd:5").gain(0.7).room(0.3)`;
    }
    if (role === "drop") return `s("bd:8 sub").gain(1.2).attack(0.05)`;
    if (role === "transition") return `s("crash").gain(0.6)`;
    if (role === "accent") {
      return intensity === "heavy"
        ? `s("hh:5").gain(0.7)`
        : `s("hh:3").gain(0.5)`;
    }
    // sustain
    return `note("c2").s("sawtooth").gain(0.3)`;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add video/src/lib/score/presets/zimmer-tense.ts
git commit -m "feat(video/music): add zimmer-tense preset (sub-bass + stabs)"
```

---

### Task 4: 8bit-nostalgic preset

**Files:**
- Create: `video/src/lib/score/presets/8bit-nostalgic.ts`

- [ ] **Step 1: Create preset file**

```ts
// src/lib/score/presets/8bit-nostalgic.ts
// Direction sonore "8-bit nostalgique" : square waves NES-like, chiptune drums,
// arpèges courts. À itérer en pratique sur les vidéos pilotes.

import type { PresetDefinition } from "../types";

export const eightBitNostalgic: PresetDefinition = {
  name: "8bit-nostalgic",
  base: () => `note("c4 eb4 g4").s("square").gain(0.2).slow(4)`,
  beat: ({ role, intensity }) => {
    if (role === "impact") {
      return intensity === "heavy"
        ? `note("c2").s("square").gain(1.0).attack(0.01).decay(0.15)`
        : `note("e2").s("square").gain(0.7).attack(0.01).decay(0.1)`;
    }
    if (role === "drop") return `note("c1").s("square").gain(1.1).decay(0.4)`;
    if (role === "transition") return `note("c5 d5 e5 g5").s("square").gain(0.4).fast(8)`;
    if (role === "accent") {
      return intensity === "heavy"
        ? `s("bd:1").gain(0.8)`
        : `s("hh:1").gain(0.5)`;
    }
    // sustain
    return `note("c3").s("triangle").gain(0.3)`;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add video/src/lib/score/presets/8bit-nostalgic.ts
git commit -m "feat(video/music): add 8bit-nostalgic preset (square waves, NES-ish)"
```

---

### Task 5: Preset registry

**Files:**
- Create: `video/src/lib/score/presets/index.ts`

- [ ] **Step 1: Create registry**

```ts
// src/lib/score/presets/index.ts
import type { PresetDefinition, PresetName } from "../types";
import { zimmerTense } from "./zimmer-tense";
import { eightBitNostalgic } from "./8bit-nostalgic";

export const PRESETS: Record<PresetName, PresetDefinition> = {
  "zimmer-tense": zimmerTense,
  "8bit-nostalgic": eightBitNostalgic,
};
```

- [ ] **Step 2: Verify TS compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add video/src/lib/score/presets/index.ts
git commit -m "feat(video/music): wire preset registry"
```

---

### Task 6: generateStrudel — failing test

**Files:**
- Create: `video/src/lib/score/generate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/score/generate.test.ts
import { describe, it, expect } from "vitest";
import { generateStrudel } from "./generate";
import type { Score } from "./types";

describe("generateStrudel", () => {
  const sampleScore: Score = {
    composition: "TestVid",
    durationInFrames: 60,   // 2 seconds at 30fps — small for readable structs
    fps: 30,
    preset: "zimmer-tense",
    beats: [
      { atFrame: 0,  role: "impact", intensity: "heavy", label: "open" },
      { atFrame: 30, role: "drop",   intensity: "heavy", label: "close" },
    ],
  };

  it("returns a non-empty string of Strudel code", () => {
    const out = generateStrudel(sampleScore);
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });

  it("sets cps to match the total duration so 1 cycle = full video", () => {
    const out = generateStrudel(sampleScore);
    // 60 frames @ 30fps = 2s, cps = 1/2 = 0.5
    expect(out).toMatch(/setcps\(0\.5/);
  });

  it("includes the base layer from the chosen preset", () => {
    const out = generateStrudel(sampleScore);
    // zimmerTense.base produces a "sine" drone
    expect(out).toContain('s("sine")');
  });

  it("includes a sound for each role present in the beats", () => {
    const out = generateStrudel(sampleScore);
    // impact heavy → "bd:8", drop → "bd:8 sub"
    expect(out).toContain('"bd:8"');
    expect(out).toContain('"bd:8 sub"');
  });

  it("emits a struct that triggers each beat at its frame position", () => {
    const out = generateStrudel(sampleScore);
    // Structs are space-separated tokens of length=durationInFrames
    expect(out).toMatch(/struct\(`1 [~ ]+`\)/);
  });

  it("throws on unknown preset", () => {
    const bad = { ...sampleScore, preset: "unknown" as never };
    expect(() => generateStrudel(bad)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/score/generate.test.ts`
Expected: FAIL with "Failed to load … generate" or "generateStrudel is not a function".

- [ ] **Step 3: Commit (red)**

```bash
git add video/src/lib/score/generate.test.ts
git commit -m "test(video/music): add failing test for generateStrudel"
```

---

### Task 7: generateStrudel — implementation

**Files:**
- Create: `video/src/lib/score/generate.ts`

- [ ] **Step 1: Write the implementation**

```ts
// src/lib/score/generate.ts
import type { Score, Beat } from "./types";
import { PRESETS } from "./presets";

export function generateStrudel(score: Score): string {
  const preset = PRESETS[score.preset];
  if (!preset) throw new Error(`Unknown preset: ${String(score.preset)}`);

  const totalSeconds = score.durationInFrames / score.fps;
  const cps = 1 / totalSeconds;

  const layers: string[] = [
    `  // base\n  ${preset.base({ totalSeconds })}`,
  ];

  // Group beats by role so we emit one layer per role
  // (one struct per layer, at most 5 layers — readable Strudel output).
  const byRole = groupByRole(score.beats);
  for (const role of Object.keys(byRole) as Array<keyof typeof byRole>) {
    const beats = byRole[role]!;
    const dominantBeat = pickDominant(beats);
    const snippet = preset.beat(dominantBeat);
    const struct = buildStruct(beats.map(b => b.atFrame), score.durationInFrames);
    layers.push(`  // ${role} (${beats.length} beat${beats.length > 1 ? "s" : ""})\n  ${snippet}.struct(\`${struct}\`)`);
  }

  return [
    `setcps(${cps.toFixed(6)});`,
    `stack(`,
    layers.join(",\n"),
    `)`,
  ].join("\n");
}

function groupByRole(beats: Beat[]): Partial<Record<Beat["role"], Beat[]>> {
  const out: Partial<Record<Beat["role"], Beat[]>> = {};
  for (const b of beats) {
    (out[b.role] ??= []).push(b);
  }
  return out;
}

// Choose the highest-intensity beat in a group as the "voice" for that layer.
// All beats in the group share the same snippet — variation per beat is a v1.5 feature.
function pickDominant(beats: Beat[]): Beat {
  const order: Record<Beat["intensity"], number> = { soft: 0, medium: 1, heavy: 2 };
  return [...beats].sort((a, b) => order[b.intensity] - order[a.intensity])[0]!;
}

// Build a high-resolution mini-notation struct: one slot per frame.
// "1" at frame positions in `frames`, "~" elsewhere. Joined by spaces.
function buildStruct(frames: number[], totalFrames: number): string {
  const slots = new Array(totalFrames).fill("~");
  for (const f of frames) {
    if (f >= 0 && f < totalFrames) slots[f] = "1";
  }
  return slots.join(" ");
}
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npm run test -- src/lib/score/generate.test.ts`
Expected: 6 tests passing.

- [ ] **Step 3: Commit (green)**

```bash
git add video/src/lib/score/generate.ts
git commit -m "feat(video/music): implement generateStrudel (one layer per role)"
```

---

### Task 8: extractSequences parser — failing test

**Files:**
- Create: `video/scripts/lib/extract-sequences.test.ts`

**Note:** We split the parser into a pure function so it's unit-testable. The `music-scaffold.ts` script will use it.

- [ ] **Step 1: Write the failing test**

```ts
// scripts/lib/extract-sequences.test.ts
import { describe, it, expect } from "vitest";
import { extractSequences } from "./extract-sequences";

describe("extractSequences", () => {
  it("finds a single Sequence", () => {
    const src = `<Sequence from={60} durationInFrames={130}>`;
    expect(extractSequences(src)).toEqual([{ atFrame: 60, durationInFrames: 130 }]);
  });

  it("finds multiple Sequences in any order", () => {
    const src = `
      <Sequence from={0} durationInFrames={140}>...</Sequence>
      <Sequence from={870} durationInFrames={200}>...</Sequence>
      <Sequence from={1080} durationInFrames={120}>...</Sequence>
    `;
    expect(extractSequences(src)).toEqual([
      { atFrame: 0, durationInFrames: 140 },
      { atFrame: 870, durationInFrames: 200 },
      { atFrame: 1080, durationInFrames: 120 },
    ]);
  });

  it("tolerates whitespace and newlines inside the tag", () => {
    const src = `<Sequence
        from={60}
        durationInFrames={1140}
      >`;
    expect(extractSequences(src)).toEqual([{ atFrame: 60, durationInFrames: 1140 }]);
  });

  it("returns empty array when no Sequence is present", () => {
    expect(extractSequences("// no jsx here")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test -- scripts/lib/extract-sequences.test.ts`
Expected: FAIL "Failed to load … extract-sequences".

- [ ] **Step 3: Commit (red)**

```bash
git add video/scripts/lib/extract-sequences.test.ts
git commit -m "test(video/music): add failing test for extractSequences"
```

---

### Task 9: extractSequences — implementation

**Files:**
- Create: `video/scripts/lib/extract-sequences.ts`

- [ ] **Step 1: Implement**

```ts
// scripts/lib/extract-sequences.ts
// Extract <Sequence from={N} durationInFrames={M}> tags from a .tsx source string.
// Regex-based — sufficient for the current code style. Upgrade to AST parse if
// the codebase grows more elaborate JSX (computed expressions, dynamic frames, etc.).

export type ExtractedSequence = {
  atFrame: number;
  durationInFrames: number;
};

const SEQ_RE = /<Sequence\s+from=\{(\d+)\}\s+durationInFrames=\{(\d+)\}/g;

export function extractSequences(src: string): ExtractedSequence[] {
  const out: ExtractedSequence[] = [];
  let m: RegExpExecArray | null;
  while ((m = SEQ_RE.exec(src)) !== null) {
    out.push({
      atFrame: Number(m[1]),
      durationInFrames: Number(m[2]),
    });
  }
  return out;
}
```

- [ ] **Step 2: Run tests, verify they pass**

Run: `npm run test -- scripts/lib/extract-sequences.test.ts`
Expected: 4 tests passing.

- [ ] **Step 3: Commit (green)**

```bash
git add video/scripts/lib/extract-sequences.ts
git commit -m "feat(video/music): implement extractSequences regex parser"
```

---

### Task 10: music-scaffold script

**Files:**
- Create: `video/scripts/music-scaffold.ts`

- [ ] **Step 1: Write the script**

```ts
// scripts/music-scaffold.ts
// Usage: npx tsx scripts/music-scaffold.ts <Composition> [--force]
// Reads src/videos/<Composition>.tsx, extracts <Sequence> beats, writes a
// draft src/videos/<Composition>.score.ts with placeholder roles and intensity.
// Refuses to overwrite existing score files unless --force is passed.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { extractSequences } from "./lib/extract-sequences";

const args = process.argv.slice(2);
const force = args.includes("--force");
const composition = args.find(a => !a.startsWith("--"));

if (!composition) {
  console.error("usage: tsx scripts/music-scaffold.ts <Composition> [--force]");
  process.exit(1);
}

const root = resolve(__dirname, "..");
const tsxPath = join(root, "src/videos", `${composition}.tsx`);
const scorePath = join(root, "src/videos", `${composition}.score.ts`);

if (!existsSync(tsxPath)) {
  console.error(`✗ ${tsxPath} not found.`);
  process.exit(1);
}

if (existsSync(scorePath) && !force) {
  console.error(`✗ ${scorePath} already exists. Pass --force to overwrite.`);
  process.exit(1);
}

const src = readFileSync(tsxPath, "utf8");
const sequences = extractSequences(src);

if (sequences.length === 0) {
  console.error(`✗ No <Sequence> tags found in ${composition}.tsx.`);
  process.exit(1);
}

// Total duration: max(from + durationInFrames). Falls back to last seq end.
const totalFrames = Math.max(...sequences.map(s => s.atFrame + s.durationInFrames));

const beatLines = sequences
  .sort((a, b) => a.atFrame - b.atFrame)
  .map(seq => `    { atFrame: ${seq.atFrame}, role: "accent", intensity: "medium" },  // SEQ ${seq.atFrame}-${seq.atFrame + seq.durationInFrames}`)
  .join("\n");

const file = `// ${composition}.score.ts — généré par music:scaffold, à adapter à la main.
// Ajuste role ("impact" | "accent" | "transition" | "drop" | "sustain"),
// intensity ("soft" | "medium" | "heavy"), et ajoute des beats word-level.
// Spec: docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md

import type { Score } from "../lib/score/types";

export const SCORE: Score = {
  composition: "${composition}",
  durationInFrames: ${totalFrames},
  fps: 30,
  preset: "zimmer-tense",
  beats: [
${beatLines}
    // ↓ ajoute des beats word-level ici (e.g. mots-clés, tampons, glitchs)
  ],
};
`;

writeFileSync(scorePath, file, "utf8");
console.log(`✓ Wrote ${scorePath}`);
console.log(`  ${sequences.length} sequence(s) → beats (all "accent medium" — adapte-les).`);
```

- [ ] **Step 2: Smoke test**

Run: `cd /Users/mathieu/Documents/survivor/video && npx tsx scripts/music-scaffold.ts RapportTerminal`
Expected: writes `src/videos/RapportTerminal.score.ts` with 6 beats. Inspect the file.

- [ ] **Step 3: Verify the generated file compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Delete the smoke-test output (we'll regenerate properly in Phase B)**

```bash
rm video/src/videos/RapportTerminal.score.ts
```

- [ ] **Step 5: Commit**

```bash
git add video/scripts/music-scaffold.ts
git commit -m "feat(video/music): add music-scaffold script (.tsx → draft .score.ts)"
```

---

### Task 11: music-install script

**Files:**
- Create: `video/scripts/music-install.mjs`

- [ ] **Step 1: Write the script**

```js
// scripts/music-install.mjs
// Usage: node scripts/music-install.mjs <input.wav> <Composition>
// Convert a WAV (recorded from strudel-claude) to MP3 192kbps and place it in
// video/public/audio/<composition-kebab>.mp3 where Remotion's staticFile()
// can find it.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const runFile = promisify(execFile);

const [, , inputWav, composition] = process.argv;

if (!inputWav || !composition) {
  console.error("usage: music-install.mjs <input.wav> <Composition>");
  process.exit(1);
}

if (!existsSync(inputWav)) {
  console.error(`✗ Input not found: ${inputWav}`);
  process.exit(1);
}

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const audioDir = join(root, "public/audio");
mkdirSync(audioDir, { recursive: true });

// kebab-case the composition name: RapportTerminal → rapport-terminal
const kebab = composition
  .replace(/([a-z])([A-Z])/g, "$1-$2")
  .toLowerCase();

const outPath = join(audioDir, `${kebab}.mp3`);

console.log(`› ffmpeg ${inputWav} → ${outPath}`);

try {
  await runFile("ffmpeg", [
    "-y",
    "-i", inputWav,
    "-b:a", "192k",
    "-ar", "48000",
    "-ac", "2",
    outPath,
  ]);
  console.log(`✓ ${outPath}`);
  console.log(`  Add this to ${composition}.tsx if not already done:`);
  console.log(`    <Audio src={staticFile("audio/${kebab}.mp3")} />`);
} catch (err) {
  console.error("ffmpeg failed:", err.message);
  process.exit(1);
}
```

- [ ] **Step 2: Smoke test**

Generate a tiny WAV for the smoke test and convert it:
```bash
ffmpeg -f lavfi -i "sine=frequency=440:duration=1" -ar 48000 /tmp/test.wav
node video/scripts/music-install.mjs /tmp/test.wav SmokeTest
```
Expected: `video/public/audio/smoke-test.mp3` is created. ffprobe shows mp3 stream at 48000 Hz.

- [ ] **Step 3: Cleanup smoke output**

```bash
rm video/public/audio/smoke-test.mp3 /tmp/test.wav
```

- [ ] **Step 4: Commit**

```bash
git add video/scripts/music-install.mjs
git commit -m "feat(video/music): add music-install script (WAV → MP3 → public/audio)"
```

---

### Task 12: drift checker — failing test

**Files:**
- Create: `video/scripts/lib/check-drift.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// scripts/lib/check-drift.test.ts
import { describe, it, expect } from "vitest";
import { checkDrift } from "./check-drift";
import type { Score } from "../../src/lib/score/types";

const baseScore: Score = {
  composition: "Test",
  durationInFrames: 600,
  fps: 30,
  preset: "zimmer-tense",
  beats: [
    { atFrame: 60, role: "impact", intensity: "heavy" },
    { atFrame: 200, role: "accent", intensity: "medium", label: "word-level" },
  ],
};

describe("checkDrift", () => {
  it("reports no warnings when every Sequence has a beat within ±5 frames", () => {
    const tsxSrc = `
      <Sequence from={60} durationInFrames={140}>X</Sequence>
      <Sequence from={200} durationInFrames={400}>Y</Sequence>
    `;
    expect(checkDrift(baseScore, tsxSrc)).toEqual([]);
  });

  it("warns when a Sequence has no nearby beat", () => {
    const tsxSrc = `
      <Sequence from={60} durationInFrames={140}>X</Sequence>
      <Sequence from={350} durationInFrames={140}>Y</Sequence>
    `;
    const warnings = checkDrift(baseScore, tsxSrc);
    expect(warnings.some(w => w.includes("frame 350"))).toBe(true);
  });

  it("warns when a structural beat (impact/drop/transition) has no nearby Sequence", () => {
    const score: Score = {
      ...baseScore,
      beats: [
        { atFrame: 999, role: "drop", intensity: "heavy" },
      ],
    };
    const tsxSrc = `<Sequence from={60} durationInFrames={140}>X</Sequence>`;
    const warnings = checkDrift(score, tsxSrc);
    expect(warnings.some(w => w.includes("frame 999"))).toBe(true);
  });

  it("does not warn for word-level accent beats with no Sequence (expected)", () => {
    const score: Score = {
      ...baseScore,
      beats: [
        { atFrame: 60, role: "impact", intensity: "heavy" },
        { atFrame: 420, role: "accent", intensity: "soft", label: "word-level" },
      ],
    };
    const tsxSrc = `<Sequence from={60} durationInFrames={500}>X</Sequence>`;
    expect(checkDrift(score, tsxSrc)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run, verify failure**

Run: `npm run test -- scripts/lib/check-drift.test.ts`
Expected: FAIL.

- [ ] **Step 3: Commit (red)**

```bash
git add video/scripts/lib/check-drift.test.ts
git commit -m "test(video/music): add failing test for drift checker"
```

---

### Task 13: drift checker — implementation

**Files:**
- Create: `video/scripts/lib/check-drift.ts`

- [ ] **Step 1: Implement**

```ts
// scripts/lib/check-drift.ts
import { extractSequences } from "./extract-sequences";
import type { Score, Beat } from "../../src/lib/score/types";

const WINDOW_FRAMES = 5;

// Roles considered "structural" — these should align with a <Sequence> boundary.
// Word-level accents are intentionally excluded.
const STRUCTURAL_ROLES: ReadonlySet<Beat["role"]> = new Set(["impact", "drop", "transition"]);

export function checkDrift(score: Score, tsxSrc: string): string[] {
  const sequences = extractSequences(tsxSrc);
  const warnings: string[] = [];

  // 1) Each Sequence start should have at least one beat within window.
  for (const seq of sequences) {
    const close = score.beats.find(b => Math.abs(b.atFrame - seq.atFrame) <= WINDOW_FRAMES);
    if (!close) {
      warnings.push(
        `Sequence at frame ${seq.atFrame} in .tsx has no beat within ±${WINDOW_FRAMES} frames.`,
      );
    }
  }

  // 2) Each structural beat should map to a Sequence start within window.
  for (const beat of score.beats) {
    if (!STRUCTURAL_ROLES.has(beat.role)) continue;
    const close = sequences.find(s => Math.abs(s.atFrame - beat.atFrame) <= WINDOW_FRAMES);
    if (!close) {
      warnings.push(
        `Beat at frame ${beat.atFrame} (role=${beat.role}${beat.label ? `, label=${beat.label}` : ""}) has no <Sequence> within ±${WINDOW_FRAMES} frames.`,
      );
    }
  }

  return warnings;
}
```

- [ ] **Step 2: Run tests, verify they pass**

Run: `npm run test -- scripts/lib/check-drift.test.ts`
Expected: 4 tests passing.

- [ ] **Step 3: Commit (green)**

```bash
git add video/scripts/lib/check-drift.ts
git commit -m "feat(video/music): implement drift checker (advisory warnings)"
```

---

### Task 14: music-dev script (watcher + picker)

**Files:**
- Create: `video/scripts/music-dev.ts`

- [ ] **Step 1: Write the script**

```ts
// scripts/music-dev.ts
// Usage:
//   npx tsx scripts/music-dev.ts                # interactive picker
//   npx tsx scripts/music-dev.ts <Composition>  # lock onto specific video
//
// Watches the chosen .score.ts. On save: re-imports it, runs drift check,
// generates Strudel code, POSTs to strudel-claude (/api/code, /api/play).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import chokidar from "chokidar";
import { select } from "@inquirer/prompts";
import { generateStrudel } from "../src/lib/score/generate";
import { checkDrift } from "./lib/check-drift";
import type { Score } from "../src/lib/score/types";

const STRUDEL_URL = process.env.STRUDEL_CLAUDE_URL ?? "http://localhost:3001";
const root = resolve(__dirname, "..");
const videosDir = join(root, "src/videos");

function listScoreCandidates(): { name: string; hasScore: boolean; mtime: number }[] {
  const files = readdirSync(videosDir).filter(f => f.endsWith(".tsx"));
  return files.map(tsx => {
    const name = tsx.replace(/\.tsx$/, "");
    const scorePath = join(videosDir, `${name}.score.ts`);
    return {
      name,
      hasScore: existsSync(scorePath),
      mtime: existsSync(scorePath) ? statSync(scorePath).mtimeMs : 0,
    };
  });
}

async function pickComposition(): Promise<string> {
  const candidates = listScoreCandidates();
  return await select({
    message: "Which video are you scoring?",
    choices: candidates.map(c => ({
      name: `${c.name}  ${c.hasScore ? `(score exists, mtime ${new Date(c.mtime).toLocaleString()})` : "(no score yet — run music:scaffold first)"}`,
      value: c.name,
      disabled: !c.hasScore && "no score file",
    })),
  });
}

async function checkStrudelClaude(): Promise<boolean> {
  try {
    const res = await fetch(`${STRUDEL_URL}/api/status`);
    return res.ok;
  } catch {
    return false;
  }
}

async function loadScore(scorePath: string): Promise<Score> {
  // Bust the import cache so re-saves reflect immediately.
  const url = `${scorePath}?t=${Date.now()}`;
  const mod = await import(url);
  if (!mod.SCORE) throw new Error(`${scorePath} does not export SCORE`);
  return mod.SCORE as Score;
}

async function pushToStrudel(code: string): Promise<void> {
  const codeRes = await fetch(`${STRUDEL_URL}/api/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!codeRes.ok) throw new Error(`POST /api/code failed: ${codeRes.status}`);
  const playRes = await fetch(`${STRUDEL_URL}/api/play`, { method: "POST" });
  if (!playRes.ok) throw new Error(`POST /api/play failed: ${playRes.status}`);
}

async function rebuildAndSend(composition: string): Promise<void> {
  const scorePath = join(videosDir, `${composition}.score.ts`);
  const tsxPath = join(videosDir, `${composition}.tsx`);

  let score: Score;
  try {
    score = await loadScore(scorePath);
  } catch (err) {
    console.error(`✗ Failed to load score: ${(err as Error).message}`);
    return;
  }

  const tsxSrc = readFileSync(tsxPath, "utf8");
  const warnings = checkDrift(score, tsxSrc);
  if (warnings.length) {
    console.warn("⚠ Drift detected:");
    for (const w of warnings) console.warn(`  - ${w}`);
  }

  const code = generateStrudel(score);
  try {
    await pushToStrudel(code);
    console.log(`✓ Sent ${score.beats.length} beats to strudel-claude (preset: ${score.preset}).`);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
  }
}

async function main() {
  console.log("🎵 strudel-remotion music dev");

  const ok = await checkStrudelClaude();
  if (!ok) {
    console.error(`✗ strudel-claude unreachable on ${STRUDEL_URL}.`);
    console.error(`  Start it: cd ~/Documents/strudel-claude && npm run dev`);
    process.exit(1);
  }
  console.log(`✓ strudel-claude detected on ${STRUDEL_URL}`);

  const argComposition = process.argv.slice(2).find(a => !a.startsWith("--"));
  const composition = argComposition ?? (await pickComposition());

  console.log(`✓ Locked on ${composition}. Watching .score.ts...\n`);

  const scorePath = join(videosDir, `${composition}.score.ts`);
  await rebuildAndSend(composition);

  let pending: NodeJS.Timeout | null = null;
  chokidar.watch(scorePath, { ignoreInitial: true }).on("change", () => {
    if (pending) clearTimeout(pending);
    pending = setTimeout(() => rebuildAndSend(composition), 200); // debounce
  });

  // Keep process alive
  process.stdin.resume();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Smoke test (without strudel-claude running)**

Run: `cd /Users/mathieu/Documents/survivor/video && npx tsx scripts/music-dev.ts RapportTerminal`
Expected: prints "✗ strudel-claude unreachable on http://localhost:3001." and exits.

- [ ] **Step 3: Commit**

```bash
git add video/scripts/music-dev.ts
git commit -m "feat(video/music): add music-dev watcher (picker + drift + auto-push)"
```

---

### Task 15: post-encode.mjs — enable audio

**Files:**
- Modify: `video/scripts/post-encode.mjs:33-50`

- [ ] **Step 1: Replace `-an` with audio re-encoding flags**

In `video/scripts/post-encode.mjs`, find the ffmpeg args block. Current:
```js
    "-movflags", "+faststart",
    "-an",
    outPath,
```

Replace with:
```js
    "-movflags", "+faststart",
    "-c:a", "aac",
    "-b:a", "192k",
    outPath,
```

- [ ] **Step 2: Update file header comment to reflect audio is now passed through**

Replace top comment block:
```js
// Post-process : convertit le mp4 sorti par Remotion (profil High, parfois yuvj420p
// ou color_range pc) en H.264 Constrained Baseline + yuv420p TV-range +faststart.
// Garantit la lecture sur QuickTime, iOS, TikTok upload, anciens téléphones.
//
// Usage : node scripts/post-encode.mjs <input-name-in-out> <output-name-in-out>
```

with:
```js
// Post-process : convertit le mp4 sorti par Remotion (profil High, parfois yuvj420p
// ou color_range pc) en H.264 Constrained Baseline + yuv420p TV-range +faststart.
// Si Remotion a embarqué une piste audio (via <Audio>), on la ré-encode en AAC 192k.
// Garantit la lecture sur QuickTime, iOS, TikTok upload, anciens téléphones.
//
// Usage : node scripts/post-encode.mjs <input-name-in-out> <output-name-in-out>
```

- [ ] **Step 3: Commit**

```bash
git add video/scripts/post-encode.mjs
git commit -m "feat(video/post-encode): preserve audio (drop -an, add aac 192k)"
```

---

## Phase B — Score the 3 existing videos

Each task in this phase has two parts: **B-agent** (subagent writes/adapts the score and adds the `<Audio>` line) and **B-user** (Mathieu records the music in strudel-claude and runs `music:install`). The agent stops after writing the score and printing instructions; Mathieu does the recording and confirms back.

### Task 16: Score RapportTerminal

**Files:**
- Create: `video/src/videos/RapportTerminal.score.ts` (via scaffold + adapt)
- Modify: `video/src/videos/RapportTerminal.tsx` (add `<Audio>` line)
- Create: `video/public/audio/rapport-terminal.mp3` (via record + install — user step)

- [ ] **Step 1 (agent): Scaffold the score**

Run: `cd /Users/mathieu/Documents/survivor/video && npx tsx scripts/music-scaffold.ts RapportTerminal`
Expected: `src/videos/RapportTerminal.score.ts` created with 6 beats (frames 60, 200, 340, 490, 570, 820).

- [ ] **Step 2 (agent): Adapt the score**

Replace the contents of `src/videos/RapportTerminal.score.ts` with the adapted version below. This corresponds to the spec example: stat slam-ins are `impact heavy`, statement is `accent medium` with the "deux" word, pivot is `transition soft`, leviers are `accent soft`, close is `drop heavy`. Word-level beats added: 420 ("saute" via TypeOn), 518 ("pilote." italic).

```ts
// RapportTerminal.score.ts — généré par music:scaffold, adapté à la main.
// Spec: docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md

import type { Score } from "../lib/score/types";

export const SCORE: Score = {
  composition: "RapportTerminal",
  durationInFrames: 900,
  fps: 30,
  preset: "zimmer-tense",
  beats: [
    { atFrame: 60,  role: "impact",     intensity: "heavy",  label: "stat1-slam" },
    { atFrame: 200, role: "impact",     intensity: "heavy",  label: "stat2-slam" },
    { atFrame: 340, role: "accent",     intensity: "medium", label: "deux" },
    { atFrame: 420, role: "accent",     intensity: "soft",   label: "saute-typeon" },
    { atFrame: 490, role: "transition", intensity: "soft",   label: "pivot-leviers" },
    { atFrame: 518, role: "accent",     intensity: "medium", label: "pilote-italic" },
    { atFrame: 570, role: "accent",     intensity: "soft",   label: "lever-1" },
    { atFrame: 645, role: "accent",     intensity: "soft",   label: "lever-2" },
    { atFrame: 720, role: "accent",     intensity: "soft",   label: "lever-3" },
    { atFrame: 820, role: "drop",       intensity: "heavy",  label: "close-domaine" },
  ],
};
```

- [ ] **Step 3 (agent): Verify TS compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4 (agent): Commit the score**

```bash
git add video/src/videos/RapportTerminal.score.ts
git commit -m "feat(video/music): score RapportTerminal (zimmer-tense, 10 beats)"
```

- [ ] **Step 5 (USER): Record the music in strudel-claude**

User instructions to surface to Mathieu:
1. Make sure strudel-claude is running: `cd ~/Documents/strudel-claude && npm run dev`
2. In the video repo: `cd /Users/mathieu/Documents/survivor/video && npm run music:dev -- RapportTerminal`
3. The Strudel code will be POSTed to strudel-claude. Open the strudel-claude browser tab and listen.
4. Tweak `RapportTerminal.score.ts` in your editor — each Cmd+S re-pushes the new code.
5. When the music feels right, click `[● REC]` in strudel-claude and let it play through the full 30s. Stop the recording, download the WAV.
6. Run: `npm run music:install -- ~/Downloads/<the-recorded-file>.wav RapportTerminal`
7. Reply "done" once `public/audio/rapport-terminal.mp3` exists.

- [ ] **Step 6 (agent): Verify MP3 exists and looks valid**

Run:
```bash
test -f video/public/audio/rapport-terminal.mp3 && ffprobe -v error -show_entries stream=codec_name,sample_rate,channels video/public/audio/rapport-terminal.mp3
```
Expected: codec_name=mp3, sample_rate=48000, channels=2.

- [ ] **Step 7 (agent): Add `<Audio>` line to the .tsx**

In `video/src/videos/RapportTerminal.tsx`:

Modify the import block (around line 5-13) to add `Audio, staticFile`:

```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
```

Then in the component return, add the `<Audio>` element as the first child of the outer `<AbsoluteFill>`:

```tsx
return (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
    <Audio src={staticFile("audio/rapport-terminal.mp3")} />
    <BaseBg />
    <ParticleBackground />
    {/* ... rest unchanged ... */}
```

- [ ] **Step 8 (agent): Verify TS compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9 (agent): Commit `<Audio>` integration + MP3**

```bash
git add video/src/videos/RapportTerminal.tsx video/public/audio/rapport-terminal.mp3
git commit -m "feat(video/RapportTerminal): wire <Audio> to recorded music track"
```

---

### Task 17: Score Storytime

Same pattern as Task 16, applied to Storytime. Sequences detected: `from={0,130,340,550,790,1000,1230}`, `durationInFrames=1350`. Storytime is the introspective REX video — try the **8bit-nostalgic** preset (memory of a younger writing self).

**Files:**
- Create: `video/src/videos/Storytime.score.ts`
- Modify: `video/src/videos/Storytime.tsx` (add `<Audio>`)
- Create: `video/public/audio/storytime.mp3` (user step)

- [ ] **Step 1 (agent): Scaffold**

Run: `cd /Users/mathieu/Documents/survivor/video && npx tsx scripts/music-scaffold.ts Storytime`

- [ ] **Step 2 (agent): Adapt the score**

Replace the generated file with:

```ts
// Storytime.score.ts — généré par music:scaffold, adapté à la main.
// Spec: docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md
import type { Score } from "../lib/score/types";

export const SCORE: Score = {
  composition: "Storytime",
  durationInFrames: 1350,
  fps: 30,
  preset: "8bit-nostalgic",
  beats: [
    { atFrame: 0,    role: "sustain",    intensity: "soft",   label: "open-pad" },
    { atFrame: 130,  role: "accent",     intensity: "medium", label: "rex-deputy" },
    { atFrame: 340,  role: "accent",     intensity: "soft",   label: "perte-mots" },
    { atFrame: 550,  role: "transition", intensity: "soft",   label: "offloading-concept" },
    { atFrame: 790,  role: "accent",     intensity: "medium", label: "muscles-mots" },
    { atFrame: 1000, role: "impact",     intensity: "heavy",  label: "simple-valideur-reveal" },
    { atFrame: 1230, role: "drop",       intensity: "heavy",  label: "close-protocole" },
  ],
};
```

- [ ] **Step 3 (agent): Verify TS, commit score**

```bash
npx tsc --noEmit
git add video/src/videos/Storytime.score.ts
git commit -m "feat(video/music): score Storytime (8bit-nostalgic, 7 beats)"
```

- [ ] **Step 4 (USER): Record + install** (same instructions as Task 16 step 5, with Storytime)

- [ ] **Step 5 (agent): Verify MP3**

Run: `test -f video/public/audio/storytime.mp3 && ffprobe -v error -show_entries stream=codec_name,sample_rate video/public/audio/storytime.mp3`

- [ ] **Step 6 (agent): Add `<Audio>` to Storytime.tsx**

Modify the import to add `Audio, staticFile`:

```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
```

Add `<Audio>` as first child of outer `<AbsoluteFill>`:

```tsx
<Audio src={staticFile("audio/storytime.mp3")} />
```

- [ ] **Step 7 (agent): Verify TS, commit**

```bash
npx tsc --noEmit
git add video/src/videos/Storytime.tsx video/public/audio/storytime.mp3
git commit -m "feat(video/Storytime): wire <Audio> to recorded music track"
```

---

### Task 18: Score TestDiagnostic

**Files:**
- Create: `video/src/videos/TestDiagnostic.score.ts`
- Modify: `video/src/videos/TestDiagnostic.tsx`
- Create: `video/public/audio/test-diagnostic.mp3` (user step)

Sequences detected in TestDiagnostic: `from={0,60,870,1080}`, `durationInFrames=1200`. The structural Sequences don't fully cover the "3 signs" beats (those are managed by `enterFrame` inside `SignCard`). We add word-level beats for each sign and the verdict.

- [ ] **Step 1 (agent): Scaffold**

Run: `cd /Users/mathieu/Documents/survivor/video && npx tsx scripts/music-scaffold.ts TestDiagnostic`

- [ ] **Step 2 (agent): Adapt the score**

Replace with:

```ts
// TestDiagnostic.score.ts — généré par music:scaffold, adapté à la main.
// Spec: docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md
import type { Score } from "../lib/score/types";

export const SCORE: Score = {
  composition: "TestDiagnostic",
  durationInFrames: 1200,
  fps: 30,
  preset: "zimmer-tense",
  beats: [
    { atFrame: 0,    role: "sustain",    intensity: "soft",   label: "open-scan" },
    { atFrame: 60,   role: "transition", intensity: "soft",   label: "scan-init" },
    { atFrame: 150,  role: "impact",     intensity: "heavy",  label: "signe-1-detected" },
    { atFrame: 390,  role: "impact",     intensity: "heavy",  label: "signe-2-detected" },
    { atFrame: 630,  role: "impact",     intensity: "heavy",  label: "signe-3-detected" },
    { atFrame: 870,  role: "transition", intensity: "medium", label: "verdict-reveal" },
    { atFrame: 1080, role: "drop",       intensity: "heavy",  label: "close-cta" },
  ],
};
```

**Note for the engineer:** the `signe-1/2/3` frames (150/390/630) are estimates based on the spec script (4-8s, 12-20s, 21-28s). After scaffold + first listen, Mathieu may move them ±10 frames.

- [ ] **Step 3 (agent): Verify TS, commit**

```bash
npx tsc --noEmit
git add video/src/videos/TestDiagnostic.score.ts
git commit -m "feat(video/music): score TestDiagnostic (zimmer-tense, 7 beats)"
```

- [ ] **Step 4 (USER): Record + install**

- [ ] **Step 5 (agent): Verify MP3**

Run: `test -f video/public/audio/test-diagnostic.mp3 && ffprobe -v error -show_entries stream=codec_name,sample_rate video/public/audio/test-diagnostic.mp3`

- [ ] **Step 6 (agent): Add `<Audio>` to TestDiagnostic.tsx**

Modify import to add `Audio, staticFile`:

```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
```

Add `<Audio>` as first child of outer `<AbsoluteFill>`:

```tsx
<Audio src={staticFile("audio/test-diagnostic.mp3")} />
```

- [ ] **Step 7 (agent): Verify TS, commit**

```bash
npx tsc --noEmit
git add video/src/videos/TestDiagnostic.tsx video/public/audio/test-diagnostic.mp3
git commit -m "feat(video/TestDiagnostic): wire <Audio> to recorded music track"
```

---

## Phase C — Final verification

### Task 19: Render all 3 + verify audio in mp4

**Files:**
- Output (transient): `video/out/*.mp4`

- [ ] **Step 1: Render all videos**

```bash
cd /Users/mathieu/Documents/survivor/video
npm run render:all
```
Expected: 3 mp4 files in `out/`. No ffmpeg errors.

- [ ] **Step 2: Verify each output has an AAC audio stream**

```bash
for f in out/rapport-terminal.mp4 out/storytime.mp4 out/test-diagnostic.mp4; do
  echo "=== $f ==="
  ffprobe -v error -show_entries stream=codec_name,codec_type,sample_rate,channels "$f"
done
```
Expected for each: `codec_type=video, codec_name=h264` AND `codec_type=audio, codec_name=aac, sample_rate=48000, channels=2`.

- [ ] **Step 3 (USER): Smoke-test playback on QuickTime + iOS**

Open each `out/*.mp4` in QuickTime. Confirm audio plays. Optional: AirDrop one to your phone, play it, ensure no silent glitch.

- [ ] **Step 4: Run the full test suite one last time**

```bash
npm run test
npm run lint
```
Expected: tests pass, lint passes.

- [ ] **Step 5: Final clean tree check**

```bash
git status
```
Expected: clean working tree (Phase B already committed everything).

---

## Self-review checklist (post-implementation)

After implementing all tasks, the engineer/user should be able to confirm:

- [ ] `RapportTerminal`, `Storytime`, `TestDiagnostic` each have a synchronized music track
- [ ] Both presets (`zimmer-tense`, `8bit-nostalgic`) are used at least once
- [ ] `npm run music:dev -- <Composition>` lets Mathieu iterate on the score with <1s feedback
- [ ] Drift warnings appear correctly when score and `.tsx` are out of sync
- [ ] `npm run render:all` produces 3 mp4 files with AAC audio
- [ ] Output mp4 plays with audio on QuickTime + iOS

---

## Open implementation questions (resolve as encountered)

1. **Strudel `struct()` long string handling**: a 900-1350 step struct may stress strudel-claude's parser. If it breaks, fallback is per-beat `.late(seconds)` triggers — refactor `generate.ts` accordingly.
2. **Sample availability in Strudel**: `bd:8`, `crash`, `hh:5` are conventional but vary by Strudel sample bank. If a sample isn't found, the preset emits silence for that role — investigate by running music:dev with strudel-claude and inspecting browser console.
3. **MP3 size in repo**: 3 tracks × ~30-45s × 192kbps ≈ 2-3 MB total. Acceptable, but if it grows (next waves of videos), consider Git LFS.
4. **Re-scaffolding after timing changes**: if Mathieu later changes a `<Sequence from={N}>`, he can re-run `music:scaffold -- <Composition> --force` to regenerate the score from scratch — losing his manual word-level adjustments. v1.5 enhancement: smart merge.
5. **TS scripts and tsconfig**: the existing `tsconfig.json` targets ES2018 + commonjs. tsx handles this fine, but if compile errors surface on `__dirname` or top-level await in scripts, document the fix in `TWEAK.md`.
