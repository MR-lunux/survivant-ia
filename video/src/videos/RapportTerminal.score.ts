// RapportTerminal.score.ts — score adapté à la main depuis le scaffold + lecture du .tsx.
// Spec: docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md
//
// Architecture beat-driven : la vidéo est composée de 6 <Beat duration={N}> :
//   1. Stat 1 (0-5s)         · slam-in big number + progress bar
//   2. Stat 2 (5-10s)        · slam-in big number + progress bar
//   3. Statement choc (10-15s) · "DEUX" punch + caption TypeOn
//   4. Pivot (15-17.5s)      · pivot vers les 3 leviers + signature italique
//   5. 3 leviers (17.5-26.5s) · 3 cards qui apparaissent à 0.2, 2.7, 5.2s du Beat
//   6. Close (26.5-30s)      · domaine slam-in + footer
//
// Les `atSec` ci-dessous correspondent aux moments précis où il y a du PUNCH
// dans la vidéo (slam-in, signature, drop). Pas un beat par Beat-boundary —
// un beat musical par moment d'impact narratif.

import type { Score } from "../lib/score/types";

export const SCORE: Score = {
  composition: "RapportTerminal",
  durationSec: 30,
  fps: 30,
  preset: "zimmer-tense",
  beats: [
    // Beat 1 — Stat 1 (5s)
    { atSec: 0.2,  role: "impact",     intensity: "heavy",  label: "stat1-slam" },

    // Beat 2 — Stat 2 (5s)
    { atSec: 5.2,  role: "impact",     intensity: "heavy",  label: "stat2-slam" },

    // Beat 3 — Statement choc (5s)
    { atSec: 10.2, role: "accent",     intensity: "medium", label: "statement-deux" },
    { atSec: 12.7, role: "accent",     intensity: "soft",   label: "caption-typeon" },

    // Beat 4 — Pivot leviers (2.5s)
    { atSec: 15.0, role: "transition", intensity: "soft",   label: "pivot-kicker" },
    { atSec: 15.9, role: "accent",     intensity: "medium", label: "pilote-signature" },

    // Beat 5 — 3 leviers (9s)
    { atSec: 17.7, role: "accent",     intensity: "soft",   label: "lever-1" },
    { atSec: 20.2, role: "accent",     intensity: "soft",   label: "lever-2" },
    { atSec: 22.7, role: "accent",     intensity: "soft",   label: "lever-3" },

    // Beat 6 — Close (3.5s)
    { atSec: 26.9, role: "drop",       intensity: "heavy",  label: "close-domaine-slam" },
  ],
};
