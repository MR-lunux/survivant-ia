#!/usr/bin/env node
// Usage: node apply-cuts.mjs <episodeId>
// Reads:  public/facecam-raws/<episodeId>.mp4
//         facecam-data/<episodeId>.timeline.json (for .cuts and .totalDurationSec)
// Writes: public/facecam-raws/<episodeId>.cut.mp4

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error("Usage: node apply-cuts.mjs <episodeId>");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(episodeId)) {
  console.error(`Invalid episodeId "${episodeId}": only [A-Za-z0-9_-] allowed`);
  process.exit(1);
}

const repoRoot = process.cwd();
const srcPath = join(repoRoot, "public/facecam-raws", `${episodeId}.mp4`);
const dstPath = join(repoRoot, "public/facecam-raws", `${episodeId}.cut.mp4`);
const timelinePath = join(repoRoot, "facecam-data", `${episodeId}.timeline.json`);

if (!existsSync(srcPath) || !existsSync(timelinePath)) {
  console.error(`Missing input file(s): ${srcPath} or ${timelinePath}`);
  process.exit(2);
}

const timeline = JSON.parse(readFileSync(timelinePath, "utf8"));
const cuts = timeline.cuts || [];

if (cuts.length === 0) {
  console.log("→ No cuts, copying source to .cut.mp4");
  execFileSync("ffmpeg", ["-y", "-i", srcPath, "-c", "copy", dstPath], { stdio: "inherit" });
  process.exit(0);
}

// Build select filter that drops cut regions
const keepExprParts = [];
let cursor = 0;
const sortedCuts = [...cuts].sort((a, b) => a.from - b.from);
for (const c of sortedCuts) {
  if (c.from > cursor) keepExprParts.push(`between(t,${cursor},${c.from})`);
  cursor = c.to;
}
keepExprParts.push(`gte(t,${cursor})`);
const keepExpr = keepExprParts.join("+");

const filter = `[0:v]select='${keepExpr}',setpts=N/FRAME_RATE/TB[v];[0:a]aselect='${keepExpr}',asetpts=N/SR/TB[a]`;

console.log(`→ Applying ${cuts.length} cuts via ffmpeg`);
execFileSync(
  "ffmpeg",
  ["-y", "-i", srcPath, "-filter_complex", filter, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", dstPath],
  { stdio: "inherit" },
);
console.log(`✓ Cut mp4 written to ${dstPath}`);
