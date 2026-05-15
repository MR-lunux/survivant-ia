#!/usr/bin/env node
// Usage: node track-face.mjs <episodeId>
// Reads:  public/facecam-raws/<episodeId>.mp4
// Writes: facecam-data/<episodeId>.face-track.json
//
// Spawns a Python subprocess (in video/.venv) that runs MediaPipe face detection
// on sampled frames, then smooths the trajectory with a moving-average window
// to remove jitter between samples.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SMOOTH_WINDOW_SEC = 0.6;

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error("Usage: node track-face.mjs <episodeId>");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(episodeId)) {
  console.error(`Invalid episodeId "${episodeId}": only [A-Za-z0-9_-] allowed`);
  process.exit(1);
}

const repoRoot = process.cwd();
const mp4Path = join(repoRoot, "public/facecam-raws", `${episodeId}.mp4`);
const outDir = join(repoRoot, "facecam-data");
const outPath = join(outDir, `${episodeId}.face-track.json`);
const venvPython = join(repoRoot, ".venv/bin/python3");
const trackerScript = join(repoRoot, "scripts/track-face.py");

if (!existsSync(mp4Path)) {
  console.error(`Missing: ${mp4Path}. Run facecam:import first.`);
  process.exit(2);
}
if (!existsSync(venvPython)) {
  console.error(`Missing Python venv at ${venvPython}.`);
  console.error(`Run once: python3.9 -m venv .venv && .venv/bin/pip install mediapipe opencv-python`);
  process.exit(3);
}
mkdirSync(outDir, { recursive: true });

console.log(`→ Detecting faces in ${mp4Path}`);
const result = spawnSync(venvPython, [trackerScript, mp4Path], { encoding: "utf8" });
if (result.status !== 0) {
  console.error(`Face detection failed (exit ${result.status}):`);
  console.error(result.stderr);
  process.exit(4);
}

const raw = JSON.parse(result.stdout);
const { width, height, track } = raw;
if (track.length === 0) {
  console.error("No face detected in any sampled frame.");
  process.exit(5);
}

// Smooth the trajectory with a moving average over SMOOTH_WINDOW_SEC.
// Removes per-frame jitter while preserving real movement.
const smoothed = track.map((point, i) => {
  let sumCx = 0, sumCy = 0, count = 0;
  for (let j = 0; j < track.length; j++) {
    if (Math.abs(track[j].t - point.t) <= SMOOTH_WINDOW_SEC / 2) {
      sumCx += track[j].cx;
      sumCy += track[j].cy;
      count++;
    }
  }
  return { t: point.t, cx: Math.round((sumCx / count) * 10) / 10, cy: Math.round((sumCy / count) * 10) / 10 };
});

const output = { width, height, track: smoothed };
writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");

console.log(`✓ ${outPath}`);
console.log(`  ${smoothed.length} face samples (window ${SMOOTH_WINDOW_SEC}s smoothed)`);
console.log(`  source dims ${width}×${height}`);
