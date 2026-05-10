// scripts/lib/check-drift.ts
import { extractBeats } from "./extract-beats";
import type { Score, Beat } from "../../src/lib/score/types";

const WINDOW_SEC = 0.2;  // ±200ms — what "close enough" means in beat alignment

// Roles considered "structural" — these should align with a <Beat> boundary.
// Word-level accents are intentionally excluded (they fire mid-Beat).
const STRUCTURAL_ROLES: ReadonlySet<Beat["role"]> = new Set(["impact", "drop", "transition"]);

export function checkDrift(score: Score, tsxSrc: string): string[] {
  const beats = extractBeats(tsxSrc);
  const warnings: string[] = [];

  // 1) Each Beat boundary should have at least one score-beat within window.
  for (const b of beats) {
    const close = score.beats.find(s => Math.abs(s.atSec - b.atSec) <= WINDOW_SEC);
    if (!close) {
      warnings.push(
        `<Beat> boundary at ${b.atSec.toFixed(2)}s in .tsx has no score beat within ±${WINDOW_SEC}s.`,
      );
    }
  }

  // 2) Each structural score-beat should map to a Beat boundary within window.
  for (const beat of score.beats) {
    if (!STRUCTURAL_ROLES.has(beat.role)) continue;
    const close = beats.find(b => Math.abs(b.atSec - beat.atSec) <= WINDOW_SEC);
    if (!close) {
      warnings.push(
        `Score beat at ${beat.atSec.toFixed(2)}s (role=${beat.role}${beat.label ? `, label=${beat.label}` : ""}) has no <Beat> boundary within ±${WINDOW_SEC}s.`,
      );
    }
  }

  return warnings;
}
