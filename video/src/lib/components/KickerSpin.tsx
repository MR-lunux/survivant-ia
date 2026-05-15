import { useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../theme";

// Kicker canonique : carré sage qui tourne (glow doux).
// Aligné sur app/components/KickerLabel.vue — 8s rotation.
export const KickerSpin: React.FC<{
  label: string;
  size?: number;
  fontSize?: number;
  color?: string;
}> = ({ label, size = 14, fontSize = 20, color = COLORS.accent }) => {
  const frame = useCurrentFrame();
  // 8s = 240 frames @ 30fps pour 360deg (canonical timing)
  const rotation = (frame / 240) * 360;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: FONTS.mono,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          transform: `rotate(${rotation}deg)`,
          boxShadow: `0 0 12px ${COLORS.accentGlow}`,
        }}
      />
      <span
        style={{
          color: COLORS.textSoft,
          fontSize,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
};
