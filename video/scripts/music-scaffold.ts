// scripts/music-scaffold.ts
// Usage: npx tsx scripts/music-scaffold.ts <Composition> [--force]
// Reads src/videos/<Composition>.tsx, extracts <Beat duration={N}> tags, writes a
// draft src/videos/<Composition>.score.ts with placeholder roles and intensity.
// Refuses to overwrite existing score files unless --force is passed.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { extractBeats } from "./lib/extract-beats";

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
const beats = extractBeats(src);

if (beats.length === 0) {
  console.error(`✗ No <Beat> tags found in ${composition}.tsx.`);
  process.exit(1);
}

// Total duration: sum of all beat durations.
const totalSec = beats.reduce((acc, b) => acc + b.durationSec, 0);

const beatLines = beats
  .map(b => `    { atSec: ${b.atSec}, role: "accent", intensity: "medium" },  // BEAT ${b.atSec}s–${b.atSec + b.durationSec}s`)
  .join("\n");

const file = `// ${composition}.score.ts — généré par music:scaffold, à adapter à la main.
// Ajuste role ("impact" | "accent" | "transition" | "drop" | "sustain"),
// intensity ("soft" | "medium" | "heavy"), et ajoute des beats word-level.
// Spec: docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md

import type { Score } from "../lib/score/types";

export const SCORE: Score = {
  composition: "${composition}",
  durationSec: ${totalSec},
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
console.log(`  ${beats.length} beat(s) → score beats (all "accent medium" — adapte-les).`);
