// scripts/lib/check-drift.test.ts
import { describe, it, expect } from "vitest";
import { checkDrift } from "./check-drift";
import type { Score } from "../../src/lib/score/types";

const baseScore: Score = {
  composition: "Test",
  durationInFrames: 600,
  fps: 30,
  preset: "zimmer-tense",
  beats: [
    { atFrame: 60, role: "impact", intensity: "heavy" },
    { atFrame: 200, role: "accent", intensity: "medium", label: "word-level" },
  ],
};

describe("checkDrift", () => {
  it("reports no warnings when every Sequence has a beat within ±5 frames", () => {
    const tsxSrc = `
      <Sequence from={60} durationInFrames={140}>X</Sequence>
      <Sequence from={200} durationInFrames={400}>Y</Sequence>
    `;
    expect(checkDrift(baseScore, tsxSrc)).toEqual([]);
  });

  it("warns when a Sequence has no nearby beat", () => {
    const tsxSrc = `
      <Sequence from={60} durationInFrames={140}>X</Sequence>
      <Sequence from={350} durationInFrames={140}>Y</Sequence>
    `;
    const warnings = checkDrift(baseScore, tsxSrc);
    expect(warnings.some(w => w.includes("frame 350"))).toBe(true);
  });

  it("warns when a structural beat (impact/drop/transition) has no nearby Sequence", () => {
    const score: Score = {
      ...baseScore,
      beats: [
        { atFrame: 999, role: "drop", intensity: "heavy" },
      ],
    };
    const tsxSrc = `<Sequence from={60} durationInFrames={140}>X</Sequence>`;
    const warnings = checkDrift(score, tsxSrc);
    expect(warnings.some(w => w.includes("frame 999"))).toBe(true);
  });

  it("does not warn for word-level accent beats with no Sequence (expected)", () => {
    const score: Score = {
      ...baseScore,
      beats: [
        { atFrame: 60, role: "impact", intensity: "heavy" },
        { atFrame: 420, role: "accent", intensity: "soft", label: "word-level" },
      ],
    };
    const tsxSrc = `<Sequence from={60} durationInFrames={500}>X</Sequence>`;
    expect(checkDrift(score, tsxSrc)).toEqual([]);
  });
});
