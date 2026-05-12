// src/lib/score/generate.test.ts
import { describe, it, expect } from "vitest";
import { generateStrudel } from "./generate";
import type { Score } from "./types";

describe("generateStrudel", () => {
  const sampleScore: Score = {
    composition: "TestVid",
    durationSec: 3,
    fps: 30,
    preset: "zimmer-tense",
    beats: [
      { atSec: 0,   role: "impact", intensity: "heavy", label: "open" },
      { atSec: 1.5, role: "drop",   intensity: "heavy", label: "close" },
    ],
  };

  it("returns a non-empty string of Strudel code", () => {
    const out = generateStrudel(sampleScore);
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });

  it("uses setcps(1) (mainstream value, no more extreme cps)", () => {
    const out = generateStrudel(sampleScore);
    expect(out).toMatch(/^setcps\(1\);/);
  });

  it("includes the base layer from the chosen preset, slowed to span the song", () => {
    const out = generateStrudel(sampleScore);
    expect(out).toContain('s("sine")');
    expect(out).toContain(".slow(3)");  // numCycles = ceil(3) = 3
  });

  it("includes a sound for each role present in the beats", () => {
    const out = generateStrudel(sampleScore);
    expect(out).toContain('"bd:8"');       // impact heavy
    expect(out).toContain('"bd:8 sub"');   // drop
  });

  it("emits .late() + .mask() with <> notation per beat", () => {
    const out = generateStrudel(sampleScore);
    // Impact at 0s: cycleIndex=0, inCycle=0 → late(0.000), mask <1 0 0>
    expect(out).toContain('.late(0.000).mask("<1 0 0>")');
    // Drop at 1.5s: cycleIndex=1, inCycle=0.5 → late(0.500), mask <0 1 0>
    expect(out).toContain('.late(0.500).mask("<0 1 0>")');
  });

  it("expands texture beats into multiple atomic ticks", () => {
    const score: Score = {
      ...sampleScore,
      beats: [
        { atSec: 0.5, durationSec: 1, role: "texture", intensity: "soft", label: "counter" },
      ],
    };
    const out = generateStrudel(score);
    // 1 second of texture at 8 ticks/sec → 8 lines
    const occurrences = (out.match(/\/\/ texture counter @/g) || []).length;
    expect(occurrences).toBe(8);
  });

  it("throws on unknown preset", () => {
    const bad = { ...sampleScore, preset: "unknown" as never };
    expect(() => generateStrudel(bad)).toThrow();
  });
});
