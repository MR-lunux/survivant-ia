// scripts/lib/check-drift.ts
import { extractSequences } from "./extract-sequences";
import type { Score, Beat } from "../../src/lib/score/types";

const WINDOW_FRAMES = 5;

// Roles considered "structural" — these should align with a <Sequence> boundary.
// Word-level accents are intentionally excluded.
const STRUCTURAL_ROLES: ReadonlySet<Beat["role"]> = new Set(["impact", "drop", "transition"]);

export function checkDrift(score: Score, tsxSrc: string): string[] {
  const sequences = extractSequences(tsxSrc);
  const warnings: string[] = [];

  // 1) Each Sequence start should have at least one beat within window.
  for (const seq of sequences) {
    const close = score.beats.find(b => Math.abs(Math.round(b.atSec * score.fps) - seq.atFrame) <= WINDOW_FRAMES);
    if (!close) {
      warnings.push(
        `Sequence at frame ${seq.atFrame} in .tsx has no beat within ±${WINDOW_FRAMES} frames.`,
      );
    }
  }

  // 2) Each structural beat should map to a Sequence start within window.
  for (const beat of score.beats) {
    if (!STRUCTURAL_ROLES.has(beat.role)) continue;
    const beatFrame = Math.round(beat.atSec * score.fps);
    const close = sequences.find(s => Math.abs(s.atFrame - beatFrame) <= WINDOW_FRAMES);
    if (!close) {
      warnings.push(
        `Beat at frame ${beatFrame} (role=${beat.role}${beat.label ? `, label=${beat.label}` : ""}) has no <Sequence> within ±${WINDOW_FRAMES} frames.`,
      );
    }
  }

  return warnings;
}
