#!/usr/bin/env node
// Usage: node render-facecam.mjs <episodeId>
// 1. Applies cuts (produces <episodeId>.cut.mp4)
// 2. Renders Remotion FaceCam composition
// 3. Post-encodes mp4 (Constrained Baseline, faststart)

import { execFileSync } from "node:child_process";
import { join } from "node:path";

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error("Usage: node render-facecam.mjs <episodeId>");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(episodeId)) {
  console.error(`Invalid episodeId "${episodeId}": only [A-Za-z0-9_-] allowed`);
  process.exit(1);
}

console.log(`\n=== Render FaceCam · ${episodeId} ===\n`);
execFileSync("node", [join(process.cwd(), "scripts/sync-timeline.mjs"), episodeId], { stdio: "inherit" });
execFileSync("node", [join(process.cwd(), "scripts/apply-cuts.mjs"), episodeId], { stdio: "inherit" });

const rawOut = `out/_raw-facecam-${episodeId}.mp4`;
const finalOut = `facecam-${episodeId}.mp4`;
execFileSync(
  "npx",
  ["remotion", "render", "FaceCam", rawOut, "--props", JSON.stringify({ episodeId }), "--x264-preset=medium"],
  { stdio: "inherit" },
);
execFileSync("node", [join(process.cwd(), "scripts/post-encode.mjs"), `_raw-facecam-${episodeId}.mp4`, finalOut], { stdio: "inherit" });
console.log(`\n✓ out/${finalOut}`);
