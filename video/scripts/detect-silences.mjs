#!/usr/bin/env node
// Usage: node detect-silences.mjs <episodeId>
// Reads:  public/facecam-raws/<episodeId>.mp4
// Writes: facecam-data/<episodeId>.silences.json

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error("Usage: node detect-silences.mjs <episodeId>");
  process.exit(1);
}

const repoRoot = process.cwd();
const mp4Path = join(repoRoot, "public/facecam-raws", `${episodeId}.mp4`);
const outPath = join(repoRoot, "facecam-data", `${episodeId}.silences.json`);

if (!existsSync(mp4Path)) {
  console.error(`Missing: ${mp4Path}`);
  process.exit(2);
}
mkdirSync(join(repoRoot, "facecam-data"), { recursive: true });

// ffmpeg silencedetect outputs to stderr; we parse "silence_start: X" / "silence_end: Y | silence_duration: Z"
let stderr = "";
try {
  execFileSync(
    "ffmpeg",
    ["-i", mp4Path, "-af", "silencedetect=noise=-50dB:d=0.5", "-f", "null", "-"],
    { encoding: "utf8" },
  );
} catch (e) {
  // ffmpeg exits non-zero on null output; stderr is what we want
  stderr = e.stderr || "";
}

const silences = [];
const startRe = /silence_start:\s*([\d.]+)/g;
const endRe = /silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g;
const starts = [...stderr.matchAll(startRe)].map((m) => parseFloat(m[1]));
const ends = [...stderr.matchAll(endRe)].map((m) => ({ end: parseFloat(m[1]), dur: parseFloat(m[2]) }));
for (let i = 0; i < Math.min(starts.length, ends.length); i++) {
  silences.push({
    start: starts[i],
    end: ends[i].end,
    durationSec: ends[i].dur,
  });
}

// Get total duration via ffprobe
const probe = execFileSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", mp4Path],
  { encoding: "utf8" },
).trim();
const totalDurationSec = parseFloat(probe);

writeFileSync(outPath, JSON.stringify({ totalDurationSec, silences }, null, 2), "utf8");
console.log(`✓ Silences written to ${outPath} (${silences.length} segments, total ${totalDurationSec.toFixed(2)}s)`);
