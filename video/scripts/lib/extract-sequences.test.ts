// scripts/lib/extract-sequences.test.ts
import { describe, it, expect } from "vitest";
import { extractSequences } from "./extract-sequences";

describe("extractSequences", () => {
  it("finds a single Sequence", () => {
    const src = `<Sequence from={60} durationInFrames={130}>`;
    expect(extractSequences(src)).toEqual([{ atFrame: 60, durationInFrames: 130 }]);
  });

  it("finds multiple Sequences in any order", () => {
    const src = `
      <Sequence from={0} durationInFrames={140}>...</Sequence>
      <Sequence from={870} durationInFrames={200}>...</Sequence>
      <Sequence from={1080} durationInFrames={120}>...</Sequence>
    `;
    expect(extractSequences(src)).toEqual([
      { atFrame: 0, durationInFrames: 140 },
      { atFrame: 870, durationInFrames: 200 },
      { atFrame: 1080, durationInFrames: 120 },
    ]);
  });

  it("tolerates whitespace and newlines inside the tag", () => {
    const src = `<Sequence
        from={60}
        durationInFrames={1140}
      >`;
    expect(extractSequences(src)).toEqual([{ atFrame: 60, durationInFrames: 1140 }]);
  });

  it("returns empty array when no Sequence is present", () => {
    expect(extractSequences("// no jsx here")).toEqual([]);
  });
});
