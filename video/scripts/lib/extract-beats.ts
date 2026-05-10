// scripts/lib/extract-beats.ts
// Extract <Beat duration={N}> tags from a .tsx source string and compute
// each Beat's cumulative start time in seconds.
//
// Mathieu's video architecture: <BeatStack> wraps a sequence of <Beat duration={X}>,
// where each X is in seconds (decimals allowed). Each beat's `atSec` is the
// sum of all previous beats' durations.
//
// Regex-based — sufficient for the current code style. Upgrade to AST parse if
// the codebase grows more elaborate JSX (computed durations, etc.).

export type ExtractedBeat = {
  atSec: number;        // start time in seconds
  durationSec: number;  // own duration in seconds
};

const BEAT_RE = /<Beat\s+duration=\{([\d.]+)\}/g;

export function extractBeats(src: string): ExtractedBeat[] {
  const out: ExtractedBeat[] = [];
  let m: RegExpExecArray | null;
  let cumulative = 0;
  while ((m = BEAT_RE.exec(src)) !== null) {
    const dur = Number(m[1]);
    out.push({ atSec: cumulative, durationSec: dur });
    cumulative += dur;
  }
  return out;
}
