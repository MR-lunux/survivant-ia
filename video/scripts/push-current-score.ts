// scripts/push-current-score.ts — utility for ad-hoc pushing
// Usage: npx tsx scripts/push-current-score.ts <Composition>

import { generateStrudel } from "../src/lib/score/generate";

const STRUDEL_URL = process.env.STRUDEL_CLAUDE_URL ?? "http://localhost:3010";

async function main() {
  const composition = process.argv[2];
  if (!composition) {
    console.error("usage: tsx scripts/push-current-score.ts <Composition>");
    process.exit(1);
  }
  const scorePath = `../src/videos/${composition}.score.ts?t=${Date.now()}`;
  const mod = await import(scorePath);
  if (!mod.SCORE) throw new Error(`No SCORE export in ${composition}.score.ts`);

  const code = generateStrudel(mod.SCORE);
  const res = await fetch(`${STRUDEL_URL}/api/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  console.log("POST /api/code:", res.status, res.ok ? "✓" : "✗");

  const verify = await fetch(`${STRUDEL_URL}/api/code`);
  const got = await verify.json() as { code: string };
  const lines = got.code.split("\n");
  console.log(`Server has ${lines.length} lines.`);
  console.log("Sample (line 5):", lines[4]);
}

main().catch(err => { console.error(err); process.exit(1); });
