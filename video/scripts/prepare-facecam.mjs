#!/usr/bin/env node
// Usage: node prepare-facecam.mjs <episodeId>
// Runs transcribe + detect-silences in sequence.

import { execFileSync } from "node:child_process";
import { join } from "node:path";

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error("Usage: node prepare-facecam.mjs <episodeId>");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(episodeId)) {
  console.error(`Invalid episodeId "${episodeId}": only [A-Za-z0-9_-] allowed`);
  process.exit(1);
}

const root = process.cwd();
console.log(`\n=== Prepare FaceCam · ${episodeId} ===\n`);
execFileSync("node", [join(root, "scripts/transcribe.mjs"), episodeId], { stdio: "inherit" });
execFileSync("node", [join(root, "scripts/detect-silences.mjs"), episodeId], { stdio: "inherit" });
console.log(`\n✓ Prepared. Next: ask Claude to generate facecam-data/${episodeId}.timeline.json`);
