export type EmojiSpawn = {
  glyph: string;
  x: number; // 0..1 (relative to container width)
  y: number; // 0..1 (relative to container height)
  spawnFrame: number;
};

const GLYPHS = ["😍", "🎯", "✨", "🚀", "💯", "🔥", "👀", "📈"];

// Mulberry32 — small deterministic PRNG, seeded by integer.
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns the deterministic list of emojis spawned at-or-before `currentFrame`.
 * One emoji every 6 frames (5/sec @ 30fps), starting at frame 30.
 */
export function emojiBurstFor(currentFrame: number, fps: number): EmojiSpawn[] {
  const startFrame = fps; // 1s warm-up
  const cadence = 6;      // every 6 frames
  if (currentFrame < startFrame) return [];

  const out: EmojiSpawn[] = [];
  for (let f = startFrame; f <= currentFrame; f += cadence) {
    const rng = mulberry32(f);
    out.push({
      glyph: GLYPHS[Math.floor(rng() * GLYPHS.length)],
      x: rng(),
      y: rng(),
      spawnFrame: f,
    });
  }
  return out;
}
