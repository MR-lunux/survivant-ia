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
