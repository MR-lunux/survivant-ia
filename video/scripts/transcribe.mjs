#!/usr/bin/env node
// Usage: node transcribe.mjs <episodeId>
// Reads:  public/facecam-raws/<episodeId>.mp4
// Writes: facecam-data/<episodeId>.transcript.json

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error("Usage: node transcribe.mjs <episodeId>");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(episodeId)) {
  console.error(`Invalid episodeId "${episodeId}": only [A-Za-z0-9_-] allowed`);
  process.exit(1);
}

const WHISPER_DIR = process.env.WHISPER_DIR || join(homedir(), ".local/whisper.cpp");
const WHISPER_BIN = existsSync(join(WHISPER_DIR, "build/bin/whisper-cli"))
  ? join(WHISPER_DIR, "build/bin/whisper-cli")
  : join(WHISPER_DIR, "main");
const MODEL = join(WHISPER_DIR, "models/ggml-large-v3.bin");

const repoRoot = process.cwd();
const mp4Path = join(repoRoot, "public/facecam-raws", `${episodeId}.mp4`);
const wavPath = join(repoRoot, "facecam-data", `${episodeId}.audio.wav`);
const outDir = join(repoRoot, "facecam-data");
const outJsonPath = join(outDir, `${episodeId}.transcript.json`);

if (!existsSync(mp4Path)) {
  console.error(`Missing: ${mp4Path}`);
  process.exit(2);
}
if (!existsSync(WHISPER_BIN)) {
  console.error(`Missing whisper binary: ${WHISPER_BIN}. Run scripts/setup-whisper.sh first.`);
  process.exit(3);
}
mkdirSync(outDir, { recursive: true });

console.log("→ Extracting audio");
execFileSync("ffmpeg", ["-y", "-i", mp4Path, "-ac", "1", "-ar", "16000", "-vn", wavPath], { stdio: "inherit" });

console.log("→ Running Whisper (this may take a moment)");
execFileSync(
  WHISPER_BIN,
  [
    "-m", MODEL,
    "-l", "fr",
    "-f", wavPath,
    "--output-json-full",
    "--word-thold", "0.01",
    "-of", join(outDir, `${episodeId}.transcript`),
  ],
  { stdio: "inherit" },
);

// Whisper writes <prefix>.json — normalize to our shape with word-level array
const raw = JSON.parse(readFileSync(`${join(outDir, `${episodeId}.transcript`)}.json`, "utf8"));
const words = [];
for (const segment of raw.transcription || []) {
  // whisper-cli emits a `tokens` array with per-token timestamps when --output-json-full is set
  for (const tok of segment.tokens || []) {
    const text = (tok.text || "").trim();
    if (!text || text.startsWith("[")) continue; // skip special tokens
    const start = (tok.timestamps?.from ?? tok.offsets?.from ?? 0) / 1000;
    const end = (tok.timestamps?.to ?? tok.offsets?.to ?? 0) / 1000;
    words.push({ word: text, start, end });
  }
}
const normalized = { language: "fr", words };
writeFileSync(outJsonPath, JSON.stringify(normalized, null, 2), "utf8");
console.log(`✓ Transcript written to ${outJsonPath} (${words.length} words)`);
