#!/usr/bin/env node
// Usage: node import-source.mjs <sourcePath> <episodeId>
// Reads:  <sourcePath> — any video file (MOV, mp4, mkv, etc.)
// Writes: public/facecam-raws/<episodeId>.mp4 (H.264 yuv420p AAC faststart, rotation baked)
//
// Why this exists: iPhone MOV files store the stream as 1920×1080 with a rotation tag
// (rotation=-90), which Remotion's bundler doesn't reliably honor. We bake the rotation
// into the actual pixels so downstream code can trust the dimensions.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [sourcePath, episodeId] = process.argv.slice(2);
if (!sourcePath || !episodeId) {
  console.error("Usage: node import-source.mjs <sourcePath> <episodeId>");
  console.error("Example: node import-source.mjs ~/Downloads/IMG_8183.MOV episode-001");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(episodeId)) {
  console.error(`Invalid episodeId "${episodeId}": only [A-Za-z0-9_-] allowed`);
  process.exit(1);
}
if (!existsSync(sourcePath)) {
  console.error(`Source not found: ${sourcePath}`);
  process.exit(2);
}

const repoRoot = process.cwd();
const outDir = join(repoRoot, "public/facecam-raws");
const outPath = join(outDir, `${episodeId}.mp4`);
mkdirSync(outDir, { recursive: true });

if (existsSync(outPath)) {
  console.error(`Refusing to overwrite ${outPath}. Delete it first or pick another episodeId.`);
  process.exit(3);
}

// Probe rotation side-data (display matrix). Output is signed integer string, or empty.
console.log(`→ Probing source: ${sourcePath}`);
let rotation = 0;
try {
  const raw = execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "stream_side_data=rotation",
      "-select_streams", "v:0",
      "-of", "default=noprint_wrappers=1:nokey=1",
      sourcePath,
    ],
    { encoding: "utf8" },
  ).trim();
  if (raw) rotation = parseInt(raw, 10) || 0;
} catch {
  rotation = 0;
}

// Map rotation tag → ffmpeg transpose filter.
// Empirically validated against iPhone selfies (rotation=-90 → transpose=1 produces upright portrait).
let vfilter = null;
if (rotation === -90 || rotation === 270) vfilter = "transpose=1"; // 90° clockwise
else if (rotation === 90 || rotation === -270) vfilter = "transpose=2"; // 90° counterclockwise
else if (rotation === 180 || rotation === -180) vfilter = "transpose=1,transpose=1"; // 180°

console.log(`→ Detected rotation: ${rotation}° → filter: ${vfilter || "none (already upright)"}`);

const args = ["-y", "-noautorotate", "-i", sourcePath];
if (vfilter) args.push("-vf", vfilter);
args.push(
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "128k",
  "-movflags", "+faststart",
  outPath,
);

console.log(`→ Encoding to ${outPath}`);
execFileSync("ffmpeg", args, { stdio: "inherit" });

const finalDims = execFileSync(
  "ffprobe",
  [
    "-v", "error",
    "-show_entries", "stream=width,height",
    "-select_streams", "v:0",
    "-of", "csv=p=0",
    outPath,
  ],
  { encoding: "utf8" },
).trim();

const aspect = finalDims === "1080,1920" ? "9:16 portrait"
  : finalDims === "1920,1080" ? "16:9 landscape"
  : `unusual (${finalDims}) — pipeline only supports 9:16 or 16:9`;

console.log(`✓ ${outPath}`);
console.log(`  ${finalDims} → ${aspect}`);
console.log("");
console.log(`  Next: npm run facecam:prepare -- ${episodeId}`);
