// Filet de sécurité — répare TOUS les mp4 dans /out/ pour qu'ils jouent partout.
//
// Cas d'usage :
// - Tu as cliqué le bouton "Render" de Studio (pas de post-encode auto)
// - Un render:* a planté en cours et a laissé un mp4 partial / cassé
// - Tu hérites de mp4s d'un autre poste avec un encoding incompatible
//
// Ce script :
// 1. Liste tous les *.mp4 dans /out/
// 2. Pour chacun, vérifie le profil + faststart
// 3. Si non conforme (profil != Constrained Baseline OU pas de faststart OU corrompu),
//    le ré-encode dans le bon format
// 4. Supprime aussi les fichiers _raw-*.mp4 orphelins
//
// Usage : npm run fix:mp4

import { execFile } from "node:child_process";
import { readdir, unlink, stat } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";

const exec = promisify(execFile);
const OUT_DIR = "out";

async function probe(file) {
  try {
    const { stdout } = await exec("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=profile,pix_fmt,color_range",
      "-of", "default=nw=1:nk=1",
      file,
    ]);
    const lines = stdout.trim().split("\n");
    return {
      profile: lines[0] || "",
      pixFmt: lines[1] || "",
      colorRange: lines[2] || "",
    };
  } catch {
    return null; // probably corrupt
  }
}

async function hasFaststart(file) {
  // moov doit être avant mdat dans le fichier
  try {
    const { stdout } = await exec("sh", [
      "-c",
      `grep -aob -e "moov" -e "mdat" "${file}" | head -2`,
    ]);
    const lines = stdout.trim().split("\n");
    if (lines.length < 2) return false;
    const moov = parseInt(lines.find((l) => l.includes("moov"))?.split(":")[0]);
    const mdat = parseInt(lines.find((l) => l.includes("mdat"))?.split(":")[0]);
    if (isNaN(moov) || isNaN(mdat)) return false;
    return moov < mdat;
  } catch {
    return false;
  }
}

async function probeColorBitstream(file) {
  // Vérifie que les flags couleur sont dans le bitstream H.264 (pas juste container)
  try {
    const { stdout } = await exec("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=color_primaries,color_transfer",
      "-of", "default=nw=1:nk=1",
      file,
    ]);
    const lines = stdout.trim().split("\n");
    return {
      primaries: lines[0] || "",
      transfer: lines[1] || "",
    };
  } catch {
    return null;
  }
}

async function isOk(file) {
  const meta = await probe(file);
  if (!meta) return { ok: false, reason: "corrompu (probe failed)" };
  if (meta.profile !== "Constrained Baseline") {
    return { ok: false, reason: `profil ${meta.profile} (devrait être Constrained Baseline)` };
  }
  if (meta.pixFmt !== "yuv420p") {
    return { ok: false, reason: `pix_fmt ${meta.pixFmt} (devrait être yuv420p)` };
  }
  if (meta.colorRange !== "tv") {
    return { ok: false, reason: `color_range ${meta.colorRange} (devrait être tv)` };
  }
  const colorBs = await probeColorBitstream(file);
  if (!colorBs || colorBs.primaries === "unknown" || colorBs.transfer === "unknown") {
    return { ok: false, reason: "metadata couleur manquante dans le bitstream H.264" };
  }
  if (!(await hasFaststart(file))) {
    return { ok: false, reason: "faststart manquant" };
  }
  return { ok: true };
}

async function reEncode(srcPath) {
  const tmpPath = srcPath + ".__fixing.mp4";
  await exec("ffmpeg", [
    "-y",
    "-i", srcPath,
    "-c:v", "libx264",
    "-profile:v", "baseline",
    "-level", "4.0",
    "-pix_fmt", "yuv420p",
    // Force les flags couleur DANS le bitstream H.264 (sinon QT/Quick Look macOS refuse)
    "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
    "-colorspace", "bt709",
    "-color_primaries", "bt709",
    "-color_trc", "bt709",
    "-color_range", "tv",
    "-crf", "22",
    "-preset", "medium",
    "-movflags", "+faststart",
    "-brand", "mp42",
    "-an",
    tmpPath,
  ]);
  // Atomic replace
  await exec("mv", [tmpPath, srcPath]);
}

async function main() {
  let files;
  try {
    files = await readdir(OUT_DIR);
  } catch {
    console.log(`pas de dossier ${OUT_DIR}/, rien à faire.`);
    return;
  }

  const mp4s = files.filter((f) => f.endsWith(".mp4"));
  if (mp4s.length === 0) {
    console.log("aucun .mp4 dans out/, rien à faire.");
    return;
  }

  // Cleanup des _raw-* orphelins
  const raws = mp4s.filter((f) => f.startsWith("_raw-"));
  for (const raw of raws) {
    const path = join(OUT_DIR, raw);
    try {
      await unlink(path);
      console.log(`✕ supprimé ${path} (intermédiaire orphelin)`);
    } catch {}
  }

  // Fix les autres
  const targets = mp4s.filter((f) => !f.startsWith("_raw-"));
  let fixed = 0;
  let skipped = 0;
  for (const name of targets) {
    const path = join(OUT_DIR, name);
    const status = await isOk(path);
    if (status.ok) {
      console.log(`✓ ${path} OK`);
      skipped++;
      continue;
    }
    console.log(`⚙ ${path} — ${status.reason} → ré-encode`);
    try {
      await reEncode(path);
      console.log(`✓ ${path} réparé`);
      fixed++;
    } catch (err) {
      console.error(`✕ ${path} — échec ré-encode :`, err.message);
    }
  }

  console.log(`\nRésumé : ${fixed} réparé(s), ${skipped} déjà OK.`);
}

await main();
