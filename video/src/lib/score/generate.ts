// src/lib/score/generate.ts
import type { Score, Beat } from "./types";
import { PRESETS } from "./presets";

export function generateStrudel(score: Score): string {
  const preset = PRESETS[score.preset];
  if (!preset) throw new Error(`Unknown preset: ${String(score.preset)}`);

  const totalSeconds = score.durationInFrames / score.fps;
  const cps = 1 / totalSeconds;

  const layers: string[] = [
    `  // base\n  ${preset.base({ totalSeconds })}`,
  ];

  // Group beats by role so we emit one layer per role
  // (one struct per layer, at most 5 layers — readable Strudel output).
  const byRole = groupByRole(score.beats);
  for (const role of Object.keys(byRole) as Array<keyof typeof byRole>) {
    const beats = byRole[role]!;
    const dominantBeat = pickDominant(beats);
    const snippet = preset.beat(dominantBeat);
    const struct = buildStruct(beats.map(b => b.atFrame), score.durationInFrames);
    layers.push(`  // ${role} (${beats.length} beat${beats.length > 1 ? "s" : ""})\n  ${snippet}.struct(\`${struct}\`)`);
  }

  return [
    `setcps(${cps.toFixed(6)});`,
    `stack(`,
    layers.join(",\n"),
    `)`,
  ].join("\n");
}

function groupByRole(beats: Beat[]): Partial<Record<Beat["role"], Beat[]>> {
  const out: Partial<Record<Beat["role"], Beat[]>> = {};
  for (const b of beats) {
    (out[b.role] ??= []).push(b);
  }
  return out;
}

// Choose the highest-intensity beat in a group as the "voice" for that layer.
// All beats in the group share the same snippet — variation per beat is a v1.5 feature.
function pickDominant(beats: Beat[]): Beat {
  const order: Record<Beat["intensity"], number> = { soft: 0, medium: 1, heavy: 2 };
  return [...beats].sort((a, b) => order[b.intensity] - order[a.intensity])[0]!;
}

// Build a high-resolution mini-notation struct: one slot per frame.
// "1" at frame positions in `frames`, "~" elsewhere. Joined by spaces.
function buildStruct(frames: number[], totalFrames: number): string {
  const slots = new Array(totalFrames).fill("~");
  for (const f of frames) {
    if (f >= 0 && f < totalFrames) slots[f] = "1";
  }
  return slots.join(" ");
}
