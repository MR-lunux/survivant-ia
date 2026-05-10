// RapportTerminal.score.ts — généré par music:scaffold, adapté à la main.
// Spec: docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md

import type { Score } from "../lib/score/types";

export const SCORE: Score = {
  composition: "RapportTerminal",
  durationInFrames: 900,
  fps: 30,
  preset: "zimmer-tense",
  beats: [
    { atFrame: 60,  role: "impact",     intensity: "heavy",  label: "stat1-slam" },
    { atFrame: 200, role: "impact",     intensity: "heavy",  label: "stat2-slam" },
    { atFrame: 340, role: "accent",     intensity: "medium", label: "deux" },
    { atFrame: 420, role: "accent",     intensity: "soft",   label: "saute-typeon" },
    { atFrame: 490, role: "transition", intensity: "soft",   label: "pivot-leviers" },
    { atFrame: 518, role: "accent",     intensity: "medium", label: "pilote-italic" },
    { atFrame: 570, role: "accent",     intensity: "soft",   label: "lever-1" },
    { atFrame: 645, role: "accent",     intensity: "soft",   label: "lever-2" },
    { atFrame: 720, role: "accent",     intensity: "soft",   label: "lever-3" },
    { atFrame: 820, role: "drop",       intensity: "heavy",  label: "close-domaine" },
  ],
};
