// Post-process : convertit le mp4 sorti par Remotion (profil High, parfois yuvj420p
// ou color_range pc) en H.264 Constrained Baseline + yuv420p TV-range +faststart.
// Si Remotion a embarqué une piste audio (via <Audio>), on la ré-encode en AAC 192k.
// Garantit la lecture sur QuickTime, iOS, TikTok upload, anciens téléphones.
//
// Usage : node scripts/post-encode.mjs <input-name-in-out> <output-name-in-out>

import { execFile } from "node:child_process";
import { unlink } from "node:fs/promises";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { join } from "node:path";

const exec = promisify(execFile);
const OUT_DIR = "out";

const [, , inputName, outputName] = process.argv;

if (!inputName || !outputName) {
  console.error("usage: post-encode.mjs <input-name> <output-name>");
  process.exit(1);
}

const inPath = join(OUT_DIR, inputName);
const outPath = join(OUT_DIR, outputName);

if (!existsSync(inPath)) {
  console.error(`input introuvable : ${inPath}`);
  process.exit(1);
}

console.log(`› post-encode ${inPath} → ${outPath}`);

try {
  await exec("ffmpeg", [
    "-y",
    "-i", inPath,
    "-c:v", "libx264",
    "-profile:v", "baseline",
    "-level", "4.0",
    "-pix_fmt", "yuv420p",
    "-colorspace", "bt709",
    "-color_primaries", "bt709",
    "-color_trc", "bt709",
    "-color_range", "tv",
    "-crf", "22",
    "-preset", "medium",
    "-movflags", "+faststart",
    "-c:a", "aac",
    "-b:a", "192k",
    outPath,
  ]);

  // Cleanup raw input
  await unlink(inPath);
  console.log(`✓ ${outPath} prêt pour TikTok / QuickTime / iOS`);
} catch (err) {
  console.error("ffmpeg a échoué :", err.message);
  process.exit(1);
}
