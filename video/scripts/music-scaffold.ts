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
