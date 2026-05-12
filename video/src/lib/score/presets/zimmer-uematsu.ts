// src/lib/score/presets/zimmer-uematsu.ts
// Direction sonore mixte : Hans Zimmer (sub-bass, brass stabs, reverb cinéma) +
// Nobuo Uematsu (piano arpèges, cordes mélancoliques, brass héroïque).
//
// Stack le drone Zimmer + un pad d'accords mineurs + une nappe haute Uematsu.
// Accents = notes mélodiques piano-like. Drop = hit orchestral + sub.

import type { PresetDefinition } from "../types";

export const zimmerUematsu: PresetDefinition = {
  name: "zimmer-uematsu",
  base: () => `stack(
    note("c1").s("sine").gain(0.32).room(0.6),
    note("eb2 g2 c3").s("sawtooth").gain(0.10).lpf(900).attack(2).slow(4),
    note("c5 eb5 g5 c6").s("triangle").gain(0.06).attack(3).release(4).slow(8)
  )`,
  beat: ({ role, intensity }) => {
    if (role === "impact") {
      return intensity === "heavy"
        ? `s("bd:8").gain(1.0).room(0.5)`
        : `s("bd:5").gain(0.7).room(0.3)`;
    }
    if (role === "drop") return `s("bd:8 sub").gain(1.2).attack(0.05).room(0.5)`;
    if (role === "transition") return `note("c4 d4 e4 g4 c5").s("sawtooth").gain(0.5).fast(4).lpf(2500)`;
    if (role === "accent") {
      if (intensity === "heavy") return `note("c5").s("triangle").gain(0.7).attack(0.01).release(0.4).room(0.4)`;
      if (intensity === "medium") return `note("g4").s("triangle").gain(0.5).attack(0.01).release(0.25).room(0.3)`;
      return `s("hh:1").gain(0.4)`;
    }
    if (role === "texture") return `s("hh:0").gain(0.35).attack(0.001).release(0.05)`;
    // sustain
    return `note("c3").s("sawtooth").gain(0.25).attack(0.5).release(0.5).lpf(1500)`;
  },
};
