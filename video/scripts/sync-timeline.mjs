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
