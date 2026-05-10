// src/lib/score/presets/8bit-nostalgic.ts
// Direction sonore "8-bit nostalgique" : square waves NES-like, chiptune drums,
// arpèges courts. À itérer en pratique sur les vidéos pilotes.

import type { PresetDefinition } from "../types";

export const eightBitNostalgic: PresetDefinition = {
  name: "8bit-nostalgic",
  base: () => `note("c4 eb4 g4").s("square").gain(0.2).slow(4)`,
  beat: ({ role, intensity }) => {
    if (role === "impact") {
      return intensity === "heavy"
        ? `note("c2").s("square").gain(1.0).attack(0.01).decay(0.15)`
        : `note("e2").s("square").gain(0.7).attack(0.01).decay(0.1)`;
    }
    if (role === "drop") return `note("c1").s("square").gain(1.1).decay(0.4)`;
    if (role === "transition") return `note("c5 d5 e5 g5").s("square").gain(0.4).fast(8)`;
    if (role === "accent") {
      return intensity === "heavy"
        ? `s("bd:1").gain(0.8)`
        : `s("hh:1").gain(0.5)`;
    }
    // sustain
    return `note("c3").s("triangle").gain(0.3)`;
  },
};
