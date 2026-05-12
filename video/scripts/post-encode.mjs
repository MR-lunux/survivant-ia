// Post-process : convertit le mp4 sorti par Remotion (profil High, parfois yuvj420p
// ou color_range pc) en H.264 Constrained Baseline + yuv420p TV-range +faststart.
// Garantit la lecture sur QuickTime, iOS, TikTok upload, anciens téléphones.
//
// Audio : ré-encode en AAC 192k (les vidéos embarquent une piste musique via
// <Audio> dans le composant Remotion). Si tu retires `<Audio>` d'une vidéo,
// Remotion peut produire une piste AAC silencieuse qui faisait freeze
// QuickTime — auquel cas remplace `-c:a aac` par `-an`.
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
    // Inscrit les flags couleur DANS le bitstream H.264 (pas seulement le
    // container). Sans ça, QuickTime / Quick Look macOS refuse parfois.
    "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
    "-colorspace", "bt709",
    "-color_primaries", "bt709",
    "-color_trc", "bt709",
    "-color_range", "tv",
    "-crf", "22",
    "-preset", "medium",
    "-movflags", "+faststart",
    "-brand", "mp42",
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
