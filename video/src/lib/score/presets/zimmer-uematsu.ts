// src/lib/score/presets/zimmer-uematsu.ts
//
// Direction sonore évocative (pas reproductible — Strudel par défaut n'a pas
// les samples orchestraux réels) :
//   - Sub-bass Zimmer : sine grave + reverb cathédrale
//   - Pad strings Uematsu : sawtooth filtré low-pass en accord mineur lent
//   - Shimmer haute : triangle aigu en arpèges nostalgiques
//   - Impact BRAAM : stack(kick + sawtooth sub stab) pour les slam-ins
//   - Drop : kick massif + sub-bass long
//
// Le but n'est pas de SONNER comme Zimmer ou Uematsu (impossible sans
// orchestre samplé), mais d'évoquer leur AMBIANCE : tension cinématique +
// mélancolie mélodique. La sync code↔code reste l'argument fort.

import type { PresetDefinition } from "../types";

export const zimmerUematsu: PresetDefinition = {
  name: "zimmer-uematsu",
  base: () => `stack(
    note("c1").s("sine").gain(0.40).room(0.7),
    note("<c3 eb3 ab3 g3>").s("sawtooth").gain(0.16).lpf(1100).attack(2).release(2),
    note("<g5 eb5 c5 g4>").s("triangle").gain(0.08).attack(0.8).release(2).slow(2),
    note("c5 eb5 g5 c6 g5 eb5").s("triangle").gain(0.06).attack(0.005).release(0.4).slow(4)
  )`,
  beat: ({ role, intensity }) => {
    if (role === "impact") {
      // BRAAAM : kick percussif + sub stab sawtooth
      return intensity === "heavy"
        ? `stack(s("bd:8").gain(1.0).room(0.4), note("c2").s("sawtooth").gain(0.55).attack(0.01).release(0.5).lpf(900))`
        : `stack(s("bd:5").gain(0.7).room(0.3), note("c2").s("sawtooth").gain(0.35).attack(0.02).release(0.3).lpf(700))`;
    }
    if (role === "drop") {
      // Kick massif + sub long
      return `stack(s("bd:8 sub").gain(1.2).attack(0.05).room(0.5), note("c1").s("sawtooth").gain(0.55).attack(0.05).release(1.0).lpf(500))`;
    }
    if (role === "transition") {
      // Filter sweep ascendant
      return `note("c4 d4 e4 g4 c5").s("sawtooth").gain(0.45).fast(4).lpf(sine.range(800,3000).slow(0.5))`;
    }
    if (role === "accent") {
      if (intensity === "heavy") {
        // Piano-bell héroïque
        return `stack(note("c5").s("triangle").gain(0.7).attack(0.003).release(0.6).room(0.4), note("c4").s("triangle").gain(0.3).attack(0.003).release(0.5))`;
      }
      if (intensity === "medium") {
        // Note mélodique douce
        return `note("g4").s("triangle").gain(0.55).attack(0.003).release(0.35).room(0.3)`;
      }
      // Soft = hi-hat ouvert léger
      return `s("hh:1").gain(0.4).room(0.2)`;
    }
    if (role === "texture") {
      // Cliquetis sec pour les compteurs (tick mécanique)
      return `s("hh:0").gain(0.4).attack(0.001).release(0.04)`;
    }
    // sustain = pad doux
    return `note("c3").s("sawtooth").gain(0.25).attack(0.5).release(0.7).lpf(1500)`;
  },
};
