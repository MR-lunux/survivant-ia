// scripts/lib/check-drift.test.ts
import { describe, it, expect } from "vitest";
import { checkDrift } from "./check-drift";
import type { Score } from "../../src/lib/score/types";

const baseScore: Score = {
  composition: "Test",
  durationSec: 20,
  fps: 30,
  preset: "zimmer-tense",
  beats: [
    { atSec: 0,   role: "impact", intensity: "heavy", label: "open" },
    { atSec: 6.5, role: "accent", intensity: "medium", label: "word-level" },
  ],
};

describe("checkDrift", () => {
  it("reports no warnings when every <Beat> boundary has a score beat within ±200ms", () => {
    const tsxSrc = `
      <Beat duration={6.5}>X</Beat>
      <Beat duration={13.5}>Y</Beat>
    `;
    // Beats at atSec 0 and 6.5 — both have score beats at the same times.
    expect(checkDrift(baseScore, tsxSrc)).toEqual([]);
  });

  it("warns when a <Beat> boundary has no nearby score beat", () => {
    const tsxSrc = `
      <Beat duration={3}>X</Beat>
      <Beat duration={5}>Y</Beat>
    `;
    // Beats at 0 and 3. Score has 0 (close) and 6.5 — but no score beat near 3.
    const warnings = checkDrift(baseScore, tsxSrc);
    expect(warnings.some(w => w.includes("3.00s"))).toBe(true);
  });

  it("warns when a structural score-beat has no nearby <Beat> boundary", () => {
    const score: Score = {
      ...baseScore,
      beats: [{ atSec: 33.3, role: "drop", intensity: "heavy" }],
    };
    const tsxSrc = `<Beat duration={5}>X</Beat>`;
    const warnings = checkDrift(score, tsxSrc);
    expect(warnings.some(w => w.includes("33.30s"))).toBe(true);
  });

  it("does not warn for word-level accent beats with no Beat boundary (expected)", () => {
    const score: Score = {
      ...baseScore,
      beats: [
        { atSec: 0,    role: "impact", intensity: "heavy" },
        { atSec: 14.0, role: "accent", intensity: "soft", label: "word-level" },
      ],
    };
    const tsxSrc = `<Beat duration={20}>X</Beat>`;
    expect(checkDrift(score, tsxSrc)).toEqual([]);
  });
});
