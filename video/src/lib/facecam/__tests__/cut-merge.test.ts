import { describe, it, expect } from "vitest";
import { mergeCutsToSegments, sourceToFinalTime } from "../cut-merge";

describe("mergeCutsToSegments", () => {
  it("no cuts → single full segment", () => {
    expect(mergeCutsToSegments([], 10)).toEqual([{ sourceStart: 0, sourceEnd: 10, finalStart: 0 }]);
  });

  it("single cut in the middle splits into 2 segments", () => {
    const segs = mergeCutsToSegments([{ from: 4, to: 5 }], 10);
    expect(segs).toEqual([
      { sourceStart: 0, sourceEnd: 4, finalStart: 0 },
      { sourceStart: 5, sourceEnd: 10, finalStart: 4 },
    ]);
  });

  it("overlapping cuts get merged", () => {
    const segs = mergeCutsToSegments(
      [
        { from: 2, to: 4 },
        { from: 3, to: 5 },
      ],
      10,
    );
    expect(segs).toEqual([
      { sourceStart: 0, sourceEnd: 2, finalStart: 0 },
      { sourceStart: 5, sourceEnd: 10, finalStart: 2 },
    ]);
  });

  it("cut at the very start", () => {
    const segs = mergeCutsToSegments([{ from: 0, to: 1.5 }], 10);
    expect(segs).toEqual([{ sourceStart: 1.5, sourceEnd: 10, finalStart: 0 }]);
  });

  it("cut at the very end", () => {
    const segs = mergeCutsToSegments([{ from: 8, to: 10 }], 10);
    expect(segs).toEqual([{ sourceStart: 0, sourceEnd: 8, finalStart: 0 }]);
  });
});

describe("sourceToFinalTime", () => {
  it("maps source time before any cut", () => {
    const segs = mergeCutsToSegments([{ from: 4, to: 5 }], 10);
    expect(sourceToFinalTime(2, segs)).toBe(2);
  });

  it("maps source time after a cut", () => {
    const segs = mergeCutsToSegments([{ from: 4, to: 5 }], 10);
    expect(sourceToFinalTime(6, segs)).toBe(5);
  });

  it("returns null for source time inside a cut", () => {
    const segs = mergeCutsToSegments([{ from: 4, to: 5 }], 10);
    expect(sourceToFinalTime(4.5, segs)).toBeNull();
  });
});
