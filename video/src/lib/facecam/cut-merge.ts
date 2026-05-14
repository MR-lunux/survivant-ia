export type Cut = { from: number; to: number };
export type Segment = { sourceStart: number; sourceEnd: number; finalStart: number };

function mergeOverlapping(cuts: Cut[]): Cut[] {
  if (cuts.length === 0) return [];
  const sorted = [...cuts].sort((a, b) => a.from - b.from);
  const out: Cut[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const prev = out[out.length - 1];
    const cur = sorted[i];
    if (cur.from <= prev.to) {
      prev.to = Math.max(prev.to, cur.to);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

export function mergeCutsToSegments(cuts: Cut[], totalDurationSec: number): Segment[] {
  const merged = mergeOverlapping(cuts);
  const segments: Segment[] = [];
  let cursor = 0;
  let finalCursor = 0;
  for (const cut of merged) {
    if (cut.from > cursor) {
      segments.push({ sourceStart: cursor, sourceEnd: cut.from, finalStart: finalCursor });
      finalCursor += cut.from - cursor;
    }
    cursor = cut.to;
  }
  if (cursor < totalDurationSec) {
    segments.push({ sourceStart: cursor, sourceEnd: totalDurationSec, finalStart: finalCursor });
  }
  return segments;
}

export function sourceToFinalTime(sourceTime: number, segments: Segment[]): number | null {
  for (const seg of segments) {
    if (sourceTime >= seg.sourceStart && sourceTime <= seg.sourceEnd) {
      return seg.finalStart + (sourceTime - seg.sourceStart);
    }
  }
  return null;
}
