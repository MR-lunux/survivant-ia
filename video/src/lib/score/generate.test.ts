// src/lib/score/generate.test.ts
import { describe, it, expect } from "vitest";
import { generateStrudel } from "./generate";
import type { Score } from "./types";

describe("generateStrudel", () => {
  const sampleScore: Score = {
    composition: "TestVid",
    durationInFrames: 60,   // 2 seconds at 30fps — small for readable structs
    fps: 30,
    preset: "zimmer-tense",
    beats: [
      { atFrame: 0,  role: "impact", intensity: "heavy", label: "open" },
      { atFrame: 30, role: "drop",   intensity: "heavy", label: "close" },
    ],
  };

  it("returns a non-empty string of Strudel code", () => {
    const out = generateStrudel(sampleScore);
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });

  it("sets cps to match the total duration so 1 cycle = full video", () => {
    const out = generateStrudel(sampleScore);
    // 60 frames @ 30fps = 2s, cps = 1/2 = 0.5
    expect(out).toMatch(/setcps\(0\.5/);
  });

  it("includes the base layer from the chosen preset", () => {
    const out = generateStrudel(sampleScore);
    // zimmerTense.base produces a "sine" drone
    expect(out).toContain('s("sine")');
  });

  it("includes a sound for each role present in the beats", () => {
    const out = generateStrudel(sampleScore);
    // impact heavy → "bd:8", drop → "bd:8 sub"
    expect(out).toContain('"bd:8"');
    expect(out).toContain('"bd:8 sub"');
  });

  it("emits a struct that triggers each beat at its frame position", () => {
    const out = generateStrudel(sampleScore);
    // Structs are space-separated tokens of length=durationInFrames
    expect(out).toMatch(/struct\(`1 [~ ]+`\)/);
  });

  it("throws on unknown preset", () => {
    const bad = { ...sampleScore, preset: "unknown" as never };
    expect(() => generateStrudel(bad)).toThrow();
  });
});
