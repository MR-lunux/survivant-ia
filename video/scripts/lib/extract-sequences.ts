// scripts/lib/extract-sequences.ts
// Extract <Sequence from={N} durationInFrames={M}> tags from a .tsx source string.
// Regex-based — sufficient for the current code style. Upgrade to AST parse if
// the codebase grows more elaborate JSX (computed expressions, dynamic frames, etc.).

export type ExtractedSequence = {
  atFrame: number;
  durationInFrames: number;
};

const SEQ_RE = /<Sequence\s+from=\{(\d+)\}\s+durationInFrames=\{(\d+)\}/g;

export function extractSequences(src: string): ExtractedSequence[] {
  const out: ExtractedSequence[] = [];
  let m: RegExpExecArray | null;
  while ((m = SEQ_RE.exec(src)) !== null) {
    out.push({
      atFrame: Number(m[1]),
      durationInFrames: Number(m[2]),
    });
  }
  return out;
}
