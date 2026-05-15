#!/usr/bin/env node
// Usage: node scripts/sync-timeline.mjs <episodeId>
// Copies facecam-data/<episodeId>.timeline.json → public/facecam-data/<episodeId>.timeline.json
// so Remotion Studio (browser context) can fetch it via staticFile().
// Run once before opening Studio, and automatically via render-facecam.mjs.

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error("Usage: node scripts/sync-timeline.mjs <episodeId>");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(episodeId)) {
  console.error(`Invalid episodeId "${episodeId}": only [A-Za-z0-9_-] allowed`);
  process.exit(1);
}

const root = process.cwd();
const src = join(root, "facecam-data", `${episodeId}.timeline.json`);
const destDir = join(root, "public", "facecam-data");
const dest = join(destDir, `${episodeId}.timeline.json`);

if (!existsSync(src)) {
  console.error(`Missing source: ${src}`);
  console.error(`Generate it first: ask Claude to create facecam-data/${episodeId}.timeline.json`);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`✓ Synced: public/facecam-data/${episodeId}.timeline.json`);

// Optional: sync face-track.json too if it exists (for face-tracking crop mode)
const trackSrc = join(root, "facecam-data", `${episodeId}.face-track.json`);
const trackDest = join(destDir, `${episodeId}.face-track.json`);
if (existsSync(trackSrc)) {
  copyFileSync(trackSrc, trackDest);
  console.log(`✓ Synced: public/facecam-data/${episodeId}.face-track.json`);
}
