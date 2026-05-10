// src/lib/score/types.ts
// Schéma du score musical pour les vidéos Remotion.
// Voir docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md
//
// REFACTOR (post-Beat-driven): le score parle maintenant en SECONDES, pas en frames.
// La conversion frame ↔ sec se fait dans generate.ts via le `fps`.

export type BeatRole =
  | "impact"      // gros coup (slam-in, gros chiffre)
  | "accent"      // ponctuation moyenne (transition de Beat, mot-clé fort)
  | "transition" // pivot/riser (changement de plan)
  | "drop"        // bass drop (close domaine, verdict)
  | "sustain";    // tenue (pause, drone)

export type Intensity = "soft" | "medium" | "heavy";

export type PresetName = "zimmer-tense" | "8bit-nostalgic";

export type Beat = {
  atSec: number;       // moment du beat en secondes (depuis le début de la vidéo)
  role: BeatRole;
  intensity: Intensity;
  label?: string;
};

export type Score = {
  composition: string;     // ex: "RapportTerminal" — utilisé pour le filename audio
  durationSec: number;     // durée totale de la vidéo en secondes
  fps: number;             // framerate cible (utilisé en interne pour la résolution du struct Strudel)
  preset: PresetName;
  beats: Beat[];
};

export type PresetDefinition = {
  name: PresetName;
  // Couche permanente jouée pendant toute la durée de la vidéo.
  // Reçoit le contexte temps total ; renvoie un fragment de code Strudel valide.
  base: (ctx: { totalSeconds: number }) => string;
  // Snippet de code Strudel pour un beat ponctuel (sans positionnement temporel).
  // Le générateur s'occupera de positionner le snippet dans le temps.
  beat: (beat: Beat) => string;
};
