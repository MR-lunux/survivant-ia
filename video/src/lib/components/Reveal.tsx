// Helper d'entrée animée — wrap n'importe quel contenu pour qu'il apparaisse
// avec un spring (slide-up + fade-in) au frame indiqué.
//
// Usage :
//   <Reveal at={30} from="bottom" distance={40}>
//     <h1>Mon titre</h1>
//   </Reveal>
//
// Tweakables :
//   at        : frame de départ de l'animation (par défaut 0)
//   from      : direction d'entrée — "bottom" | "top" | "left" | "right" | "none"
//   distance  : amplitude du translate en pixels (par défaut 40)
//   damping   : amortissement du spring (par défaut 14, plus haut = moins de rebond)
//   stiffness : raideur du spring (par défaut 110)

import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type Direction = "bottom" | "top" | "left" | "right" | "none";

export const Reveal: React.FC<{
  children: React.ReactNode;
  at?: number;
  from?: Direction;
  distance?: number;
  damping?: number;
  stiffness?: number;
  durationFrames?: number;  // dure-t-elle plus longtemps avant settle ?
}> = ({
  children,
  at = 0,
  from = "bottom",
  distance = 40,
  damping = 14,
  stiffness = 110,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({
    frame: frame - at,
    fps,
    durationInFrames: durationFrames,
    config: { damping, stiffness },
  });

  const opacity = interpolate(sp, [0, 1], [0, 1]);

  let tx = 0;
  let ty = 0;
  if (from === "bottom") ty = interpolate(sp, [0, 1], [distance, 0]);
  if (from === "top") ty = interpolate(sp, [0, 1], [-distance, 0]);
  if (from === "left") tx = interpolate(sp, [0, 1], [-distance, 0]);
  if (from === "right") tx = interpolate(sp, [0, 1], [distance, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translate(${tx}px, ${ty}px)`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};
