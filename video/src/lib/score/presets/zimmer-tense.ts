// src/lib/score/presets/zimmer-tense.ts
// Direction sonore "Hans Zimmer" : sub-bass tendu, brass-like stabs, drone permanent.
// L'idiome Strudel exact (sample names, params) sera itéré pendant les vidéos pilotes.

import type { PresetDefinition } from "../types";

export const zimmerTense: PresetDefinition = {
  name: "zimmer-tense",
  base: () => `note("c1").s("sine").gain(0.35).room(0.7).slow(8)`,
  beat: ({ role, intensity }) => {
    if (role === "impact") {
      return intensity === "heavy"
        ? `s("bd:8").gain(1.0).room(0.4)`
        : `s("bd:5").gain(0.7).room(0.3)`;
    }
    if (role === "drop") return `s("bd:8 sub").gain(1.2).attack(0.05)`;
    if (role === "transition") return `s("crash").gain(0.6)`;
    if (role === "accent") {
      return intensity === "heavy"
        ? `s("hh:5").gain(0.7)`
        : `s("hh:3").gain(0.5)`;
    }
    // sustain
    return `note("c2").s("sawtooth").gain(0.3)`;
  },
};
