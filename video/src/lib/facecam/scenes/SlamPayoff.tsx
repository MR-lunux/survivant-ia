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

  // Slam: spring scale from 0.6 → 1.0 in ~10 frames
  const slam = spring({ frame, fps, config: { damping: 9, stiffness: 220 } });

  // Arrow points at viewer: scales + glows after slam settles
  const arrowSpring = spring({ frame: frame - 8, fps, config: { damping: 12 } });
  const glow = interpolate(Math.sin(frame * 0.25), [-1, 1], [0.3, 0.9]);

  return (
    // Full-screen overlay: escape the half-height parent by extending downward.
    // The AbsoluteFill wrapper in FaceCam sets height: motionHeight (960px).
    // By setting height: "200%" here we paint to 1920px — full canvas — without
    // overflow: hidden cutting us off. Documented exception to the 50/50 split.
    <AbsoluteFill style={{ height: "200%", top: 0, zIndex: 50 }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(15, 15, 14, 0.92)",
      }} />
      <AbsoluteFill style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 32,
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 84,
            color: COLORS.textSoft,
            letterSpacing: -1,
            textTransform: "uppercase",
            opacity: slam,
          }}>
            {line}
          </div>
        ))}
        <div style={{
          fontFamily: FONTS.sans,
          fontWeight: 900,
          fontSize: 180,
          color: COLORS.accent,
          letterSpacing: -3,
          textTransform: "uppercase",
          transform: `scale(${0.6 + slam * 0.4})`,
          textShadow: `0 0 ${30 * glow}px ${COLORS.accentGlow}`,
        }}>
          {accentWord}
        </div>

        {/* Arrow pointing at the viewer */}
        <div style={{
          marginTop: 40,
          fontSize: 140,
          color: COLORS.accent,
          transform: `scale(${arrowSpring}) translateY(${(1 - arrowSpring) * 40}px)`,
          filter: `drop-shadow(0 0 ${20 * glow}px ${COLORS.accent})`,
        }}>
          &#x2193;
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
