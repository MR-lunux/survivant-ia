// src/lib/score/types.ts
// Schéma du score musical pour les vidéos Remotion.
// Voir docs/superpowers/specs/2026-05-10-strudel-remotion-music-pipeline-design.md
//
// Le score parle en SECONDES (pas en frames). generate.ts traduit en patterns
// Strudel (setcps=1 + mask + late) — voir generate.ts pour les détails.

export type BeatRole =
  | "impact"      // gros coup (slam-in, gros chiffre)
  | "accent"      // ponctuation moyenne (transition de Beat, mot-clé fort)
  | "transition" // pivot/riser (changement de plan)
  | "drop"        // bass drop (close domaine, verdict)
  | "sustain"     // tenue (pause, drone)
  | "texture";    // texture continue sur une durée (e.g. cliquetis de compteur)

export type Intensity = "soft" | "medium" | "heavy";

export type PresetName = "zimmer-tense" | "8bit-nostalgic" | "zimmer-uematsu";

export type Beat = {
  atSec: number;            // moment du beat en secondes (depuis le début de la vidéo)
  role: BeatRole;
  intensity: Intensity;
  label?: string;
  durationSec?: number;     // pour role="texture" : étalement de la texture en secondes
};

export type Score = {
  composition: string;       // ex: "RapportTerminal" — utilisé pour le filename audio
  durationSec: number;       // durée totale de la vidéo en secondes
  fps: number;               // framerate cible (informatif)
  preset: PresetName;
  fadeInSec?: number;        // fade-in audio appliqué au MP3 final (post-processing ffmpeg)
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
