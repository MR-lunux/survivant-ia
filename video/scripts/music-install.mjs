// scripts/music-install.mjs
// Usage: node scripts/music-install.mjs <input.wav> <Composition> [options]
//
// Options:
//   --trim-silence       Strip leading silence (silenceremove, -50dB threshold)
//   --fade-in <sec>      Apply a linear fade-in over <sec> seconds at the start
//   --duration <sec>     Cut output to exactly <sec> seconds (after trim/fade)
//
// Examples:
//   node scripts/music-install.mjs ~/Downloads/foo.wav RapportTerminal
//   node scripts/music-install.mjs ~/Downloads/foo.wav RapportTerminal \
//        --trim-silence --fade-in 2 --duration 30
//
// Converts the WAV (recorded from strudel-claude) to MP3 192kbps stereo 48kHz
// and places it in video/public/audio/<composition-kebab>.mp3 where Remotion's
// staticFile() can find it.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const runFile = promisify(execFile);

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith("--"));
const [inputWav, composition] = positional;

function readFlag(name) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return null;
  return args[i + 1];
}
function hasFlag(name) {
  return args.includes(`--${name}`);
}

if (!inputWav || !composition) {
  console.error("usage: music-install.mjs <input.wav> <Composition> [--trim-silence] [--fade-in <sec>] [--duration <sec>]");
  process.exit(1);
}

if (!existsSync(inputWav)) {
  console.error(`✗ Input not found: ${inputWav}`);
  process.exit(1);
}

const trimSilence = hasFlag("trim-silence");
const fadeInSec = Number(readFlag("fade-in")) || 0;
const durationSec = Number(readFlag("duration")) || 0;

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const audioDir = join(root, "public/audio");
mkdirSync(audioDir, { recursive: true });

const kebab = composition
  .replace(/([a-z])([A-Z])/g, "$1-$2")
  .toLowerCase();

const outPath = join(audioDir, `${kebab}.mp3`);

// Build the ffmpeg audio filter chain
const filters = [];
if (trimSilence) {
  filters.push("silenceremove=start_periods=1:start_threshold=-50dB:start_duration=0.05");
}
if (fadeInSec > 0) {
  filters.push(`afade=t=in:st=0:d=${fadeInSec}`);
}

const ffmpegArgs = ["-y", "-i", inputWav];
if (filters.length) {
  ffmpegArgs.push("-af", filters.join(","));
}
if (durationSec > 0) {
  ffmpegArgs.push("-t", String(durationSec));
}
ffmpegArgs.push("-b:a", "192k", "-ar", "48000", "-ac", "2", outPath);

const summary = [
  trimSilence && "trim-silence",
  fadeInSec > 0 && `fade-in=${fadeInSec}s`,
  durationSec > 0 && `duration=${durationSec}s`,
].filter(Boolean).join(", ") || "no transforms";
console.log(`› ffmpeg ${inputWav} → ${outPath} (${summary})`);

try {
  await runFile("ffmpeg", ffmpegArgs);
  console.log(`✓ ${outPath}`);
  console.log(`  Add this to ${composition}.tsx if not already done:`);
  console.log(`    <Audio src={staticFile("audio/${kebab}.mp3")} />`);
} catch (err) {
  console.error("ffmpeg failed:", err.message);
  process.exit(1);
}
