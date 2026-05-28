import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  lines: string[];
  accentWord: string;
};

export const SlamPayoff: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { lines, accentWord } = props as unknown as Props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({ frame, fps, config: { damping: 9, stiffness: 220 } });
  const arrowSpring = spring({ frame: frame - 8, fps, config: { damping: 12 } });
  const glow = interpolate(Math.sin(frame * 0.25), [-1, 1], [0.3, 0.9]);

  return (
    <AbsoluteFill style={{
      padding: "60px 40px 0 40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        marginTop: 60,
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontFamily: FONTS.sans,
            fontWeight: 700,
            fontSize: 56,
            color: COLORS.textSoft,
            letterSpacing: -0.5,
            textTransform: "uppercase",
            opacity: slam,
          }}>
            {line}
          </div>
        ))}
        <div style={{
          fontFamily: FONTS.sans,
          fontWeight: 900,
          fontSize: 148,
          color: COLORS.accent,
          letterSpacing: -3,
          textTransform: "uppercase",
          transform: `scale(${0.6 + slam * 0.4})`,
          textShadow: `0 0 ${30 * glow}px ${COLORS.accentGlow}`,
          lineHeight: 1,
        }}>
          {accentWord}
        </div>
      </div>

      {/* Arrow at the bottom of the motion zone, pointing DOWN toward the face cam = at the viewer */}
      <div style={{
        marginBottom: 30,
        fontSize: 110,
        color: COLORS.accent,
        transform: `scale(${arrowSpring}) translateY(${(1 - arrowSpring) * 30}px)`,
        filter: `drop-shadow(0 0 ${20 * glow}px ${COLORS.accent})`,
        lineHeight: 1,
      }}>
        &#x2193;
      </div>
    </AbsoluteFill>
  );
};
