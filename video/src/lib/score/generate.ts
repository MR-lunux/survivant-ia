// src/lib/score/generate.ts
//
// Transforme un Score en code Strudel exécutable.
//
// Stratégie (v2, post-refactor sync) :
//   - setcps(1) : Strudel exécute 1 cycle par seconde (sa valeur normale, fiable)
//   - Pour chaque beat à atSec=N :
//       - cycleIndex = floor(N), inCycle = N - cycleIndex
//       - Le beat fire au cycle `cycleIndex` à `inCycle` secondes dans ce cycle
//       - Implémenté via `.late(inCycle).mask("<0 0 ... 1 ... 0>")`
//         où le mask en notation `<>` lit un élément par cycle (1 lecture
//         sur toute la durée du morceau)
//   - Le base layer du preset est étiré sur tout le morceau via `.slow(numCycles)`
//   - Les beats role="texture" avec `durationSec` sont expansés en ticks atomiques
//     (8 ticks par seconde par défaut) avant rendu
//
// Pourquoi cette refactor :
//   La v1 utilisait setcps(1/30) + struct(900-slot). Strudel n'a pas respecté
//   ce cps extrême et a interprété le struct comme 900 hits par seconde,
//   produisant un tempo régulier décorrélé du score. La nouvelle approche
//   utilise des valeurs cps mainstream et des idiomes Strudel canoniques.

import type { Score, Beat } from "./types";
import { PRESETS } from "./presets";

const TEXTURE_TICKS_PER_SEC = 8;

export function generateStrudel(score: Score): string {
  const preset = PRESETS[score.preset];
  if (!preset) throw new Error(`Unknown preset: ${String(score.preset)}`);

  const numCycles = Math.max(1, Math.ceil(score.durationSec));
  const lines: string[] = [];

  // Base layer (drone étiré sur toute la durée)
  const baseSnippet = preset.base({ totalSeconds: score.durationSec });
  lines.push(`  // base layer (sustained ${score.durationSec}s)\n  ${baseSnippet}.slow(${numCycles})`);

  // Étape 1 : expand les textures en ticks atomiques
  const atomicBeats: Beat[] = [];
  for (const beat of score.beats) {
    if (beat.role === "texture" && beat.durationSec && beat.durationSec > 0) {
      const numTicks = Math.max(1, Math.round(beat.durationSec * TEXTURE_TICKS_PER_SEC));
      for (let i = 0; i < numTicks; i++) {
        atomicBeats.push({
          ...beat,
          atSec: beat.atSec + i / TEXTURE_TICKS_PER_SEC,
        });
      }
    } else {
      atomicBeats.push(beat);
    }
  }

  // Étape 2 : une ligne stack par beat atomique
  for (const beat of atomicBeats) {
    const cycleIndex = Math.floor(beat.atSec);
    const inCycle = beat.atSec - cycleIndex;
    if (cycleIndex < 0 || cycleIndex >= numCycles) continue;

    const maskTokens = new Array(numCycles).fill("0");
    maskTokens[cycleIndex] = "1";
    const maskStr = `<${maskTokens.join(" ")}>`;

    const snippet = preset.beat(beat);
    const labelComment = beat.label ? ` ${beat.label}` : "";
    const inCycleStr = inCycle.toFixed(3);
    lines.push(`  // ${beat.role}${labelComment} @ ${beat.atSec.toFixed(2)}s\n  ${snippet}.late(${inCycleStr}).mask("${maskStr}")`);
  }

  return [
    `setcps(1);`,
    `stack(`,
    lines.join(",\n"),
    `)`,
  ].join("\n");
}
