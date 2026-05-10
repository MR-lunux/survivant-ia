// src/lib/score/generate.test.ts
import { describe, it, expect } from "vitest";
import { generateStrudel } from "./generate";
import type { Score } from "./types";

describe("generateStrudel", () => {
  const sampleScore: Score = {
    composition: "TestVid",
    durationSec: 2,         // 2 seconds — small for readable structs
    fps: 30,
    preset: "zimmer-tense",
    beats: [
      { atSec: 0,  role: "impact", intensity: "heavy", label: "open" },
      { atSec: 1,  role: "drop",   intensity: "heavy", label: "close" },
    ],
  };

  it("returns a non-empty string of Strudel code", () => {
    const out = generateStrudel(sampleScore);
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });

  it("sets cps to match the total duration so 1 cycle = full video", () => {
    const out = generateStrudel(sampleScore);
    // 2 seconds → cps = 1/2 = 0.5
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
    // Structs are space-separated tokens of length=durationSec*fps=60
    expect(out).toMatch(/struct\(`1 [~ ]+`\)/);
  });

  it("converts atSec to frame index using fps", () => {
    const out = generateStrudel(sampleScore);
    // The drop beat is at atSec=1, fps=30 → slot 30 should be "1"
    // Structs are 60-slot patterns. Find the drop layer (uses bd:8 sub) and check slot 30.
    const lines = out.split("\n");
    const dropLine = lines.find(l => l.includes('"bd:8 sub"'));
    expect(dropLine).toBeTruthy();
    // Extract the struct content
    const match = dropLine!.match(/struct\(`([^`]+)`\)/);
    expect(match).toBeTruthy();
    const slots = match![1].split(" ");
    expect(slots.length).toBe(60); // 2s * 30fps = 60
    expect(slots[30]).toBe("1");   // beat at atSec=1 lands at frame 30
    expect(slots[0]).toBe("~");    // no drop at frame 0
  });

  it("throws on unknown preset", () => {
    const bad = { ...sampleScore, preset: "unknown" as never };
    expect(() => generateStrudel(bad)).toThrow();
  });
});
