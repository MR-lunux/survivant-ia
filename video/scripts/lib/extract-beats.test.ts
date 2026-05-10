// scripts/lib/extract-beats.test.ts
import { describe, it, expect } from "vitest";
import { extractBeats } from "./extract-beats";

describe("extractBeats", () => {
  it("finds a single Beat", () => {
    const src = `<Beat duration={5}>X</Beat>`;
    expect(extractBeats(src)).toEqual([{ atSec: 0, durationSec: 5 }]);
  });

  it("computes cumulative atSec for multiple Beats", () => {
    const src = `
      <Beat duration={5}>A</Beat>
      <Beat duration={5}>B</Beat>
      <Beat duration={2.5}>C</Beat>
      <Beat duration={9}>D</Beat>
    `;
    expect(extractBeats(src)).toEqual([
      { atSec: 0,    durationSec: 5 },
      { atSec: 5,    durationSec: 5 },
      { atSec: 10,   durationSec: 2.5 },
      { atSec: 12.5, durationSec: 9 },
    ]);
  });

  it("handles decimal durations precisely", () => {
    const src = `
      <Beat duration={2.5}>A</Beat>
      <Beat duration={9.7}>B</Beat>
    `;
    expect(extractBeats(src)).toEqual([
      { atSec: 0,   durationSec: 2.5 },
      { atSec: 2.5, durationSec: 9.7 },
    ]);
  });

  it("tolerates whitespace and newlines inside the tag", () => {
    const src = `<Beat
        duration={5.5}
      >X</Beat>`;
    expect(extractBeats(src)).toEqual([{ atSec: 0, durationSec: 5.5 }]);
  });

  it("returns empty array when no Beat is present", () => {
    expect(extractBeats("// no jsx here")).toEqual([]);
  });
});
