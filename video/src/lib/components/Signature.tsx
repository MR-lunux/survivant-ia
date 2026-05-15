// Signature : pattern canonique du hero V2.
// Inter caps cream pour la ligne déclarative.
// Playfair italic sage (casse normale) pour la signature.
//
// Tous les composants ici acceptent une prop `at` (frame d'entrée) et animent
// l'apparition (fade + slide-up via spring). Si pas de prop, anim démarre à frame 0.

import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONTS } from "../theme";

const useEnterAnim = (at: number, distance = 30) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({
    frame: frame - at,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  return {
    opacity: interpolate(sp, [0, 1], [0, 1]),
    translateY: interpolate(sp, [0, 1], [distance, 0]),
  };
};

// SignatureItalic — Playfair italique sage avec entrée animée
export const SignatureItalic: React.FC<{
  text: string;
  fontSize?: number;
  color?: string;
  at?: number;
}> = ({ text, fontSize = 110, color = COLORS.accent, at = 0 }) => {
  const { opacity, translateY } = useEnterAnim(at, 36);
  return (
    <div
      style={{
        fontFamily: FONTS.serif,
        fontStyle: "italic",
        fontWeight: 500,
        fontSize,
        color,
        letterSpacing: "-0.01em",
        lineHeight: 1.05,
        textShadow: `0 0 28px ${COLORS.accentGlow}`,
        opacity,
        transform: `translateY(${translateY}px)`,
        willChange: "transform, opacity",
      }}
    >
      {text}
    </div>
  );
};

// SignaturePair — declarative caps + signature italique en dessous
export const SignaturePair: React.FC<{
  declarative: string;
  signature: string;
  declarativeSize?: number;
  signatureSize?: number;
  align?: "left" | "center";
  at?: number;            // frame de départ pour la déclarative
  signatureAt?: number;   // frame de départ pour la signature (défaut : at + 14)
}> = ({
  declarative,
  signature,
  declarativeSize = 56,
  signatureSize = 110,
  align = "left",
  at = 0,
  signatureAt,
}) => {
  const decl = useEnterAnim(at, 24);
  const sig = useEnterAnim(signatureAt ?? at + 14, 36);
  return (
    <div style={{ textAlign: align, width: "100%" }}>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 800,
          fontSize: declarativeSize,
          textTransform: "uppercase",
          color: COLORS.text,
          letterSpacing: "-0.01em",
          lineHeight: 1.05,
          marginBottom: 14,
          opacity: decl.opacity,
          transform: `translateY(${decl.translateY}px)`,
        }}
      >
        {declarative}
      </div>
      <div
        style={{
          fontFamily: FONTS.serif,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: signatureSize,
          color: COLORS.accent,
          letterSpacing: "-0.01em",
          lineHeight: 1.0,
          textShadow: `0 0 28px ${COLORS.accentGlow}`,
          opacity: sig.opacity,
          transform: `translateY(${sig.translateY}px)`,
        }}
      >
        {signature}
      </div>
    </div>
  );
};

// SlamIn — entrée plus brutale (overshoot) pour les big numbers et les statements
export const SlamIn: React.FC<{
  children: React.ReactNode;
  at?: number;
}> = ({ children, at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({
    frame: frame - at,
    fps,
    config: { damping: 7, stiffness: 200, mass: 0.8 }, // overshoot punchy
  });
  return (
    <div
      style={{
        opacity: interpolate(sp, [0, 1], [0, 1]),
        transform: `scale(${interpolate(sp, [0, 1], [0.85, 1])})`,
        transformOrigin: "left center",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};
