// scripts/music-dev.ts
// Usage:
//   npx tsx scripts/music-dev.ts                # interactive picker
//   npx tsx scripts/music-dev.ts <Composition>  # lock onto specific video
//
// Watches the chosen .score.ts. On save: re-imports it, runs drift check,
// generates Strudel code, POSTs to strudel-claude (/api/code, /api/play).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import chokidar from "chokidar";
import { select } from "@inquirer/prompts";
import { generateStrudel } from "../src/lib/score/generate";
import { checkDrift } from "./lib/check-drift";
import type { Score } from "../src/lib/score/types";

// Default port = 3010 (3000-3003 used locally by Remotion + Nuxt dev servers).
// Override via STRUDEL_CLAUDE_URL env var if your strudel-claude runs elsewhere.
const STRUDEL_URL = process.env.STRUDEL_CLAUDE_URL ?? "http://localhost:3010";
const root = resolve(__dirname, "..");
const videosDir = join(root, "src/videos");

function listScoreCandidates(): { name: string; hasScore: boolean; mtime: number }[] {
  const files = readdirSync(videosDir).filter(f => f.endsWith(".tsx"));
  return files.map(tsx => {
    const name = tsx.replace(/\.tsx$/, "");
    const scorePath = join(videosDir, `${name}.score.ts`);
    return {
      name,
      hasScore: existsSync(scorePath),
      mtime: existsSync(scorePath) ? statSync(scorePath).mtimeMs : 0,
    };
  });
}

async function pickComposition(): Promise<string> {
  const candidates = listScoreCandidates();
  return await select({
    message: "Which video are you scoring?",
    choices: candidates.map(c => ({
      name: `${c.name}  ${c.hasScore ? `(score exists, mtime ${new Date(c.mtime).toLocaleString()})` : "(no score yet — run music:scaffold first)"}`,
      value: c.name,
      disabled: !c.hasScore && "no score file",
    })),
  });
}

async function checkStrudelClaude(): Promise<boolean> {
  try {
    const res = await fetch(`${STRUDEL_URL}/api/status`);
    return res.ok;
  } catch {
    return false;
  }
}

async function loadScore(scorePath: string): Promise<Score> {
  // Bust the import cache so re-saves reflect immediately.
  const url = `${scorePath}?t=${Date.now()}`;
  const mod = await import(url);
  if (!mod.SCORE) throw new Error(`${scorePath} does not export SCORE`);
  return mod.SCORE as Score;
}

async function pushToStrudel(code: string): Promise<void> {
  const codeRes = await fetch(`${STRUDEL_URL}/api/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!codeRes.ok) throw new Error(`POST /api/code failed: ${codeRes.status}`);
  const playRes = await fetch(`${STRUDEL_URL}/api/play`, { method: "POST" });
  if (!playRes.ok) throw new Error(`POST /api/play failed: ${playRes.status}`);
}

async function rebuildAndSend(composition: string): Promise<void> {
  const scorePath = join(videosDir, `${composition}.score.ts`);
  const tsxPath = join(videosDir, `${composition}.tsx`);

  let score: Score;
  try {
    score = await loadScore(scorePath);
  } catch (err) {
    console.error(`✗ Failed to load score: ${(err as Error).message}`);
    return;
  }

  const tsxSrc = readFileSync(tsxPath, "utf8");
  const warnings = checkDrift(score, tsxSrc);
  if (warnings.length) {
    console.warn("⚠ Drift detected:");
    for (const w of warnings) console.warn(`  - ${w}`);
  }

  const code = generateStrudel(score);
  try {
    await pushToStrudel(code);
    console.log(`✓ Sent ${score.beats.length} beats to strudel-claude (preset: ${score.preset}).`);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
  }
}

async function main() {
  console.log("🎵 strudel-remotion music dev");

  const ok = await checkStrudelClaude();
  if (!ok) {
    console.error(`✗ strudel-claude unreachable on ${STRUDEL_URL}.`);
    console.error(`  Start it: cd ~/Documents/strudel-claude && npm run dev`);
    process.exit(1);
  }
  console.log(`✓ strudel-claude detected on ${STRUDEL_URL}`);

  const argComposition = process.argv.slice(2).find(a => !a.startsWith("--"));
  const composition = argComposition ?? (await pickComposition());

  console.log(`✓ Locked on ${composition}. Watching .score.ts...\n`);

  const scorePath = join(videosDir, `${composition}.score.ts`);
  await rebuildAndSend(composition);

  let pending: NodeJS.Timeout | null = null;
  chokidar.watch(scorePath, { ignoreInitial: true }).on("change", () => {
    if (pending) clearTimeout(pending);
    pending = setTimeout(() => rebuildAndSend(composition), 200); // debounce
  });

  // Keep process alive
  process.stdin.resume();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
