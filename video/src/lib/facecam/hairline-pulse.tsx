import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS } from "../theme";

export const HairlinePulse: React.FC<{ topPx: number }> = ({ topPx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulse alpha 0.35 ↔ 1.0 on a 4s cycle, ease-in-out — contraste marqué
  const cycleFrames = fps * 4;
  const phase = (frame % cycleFrames) / cycleFrames; // 0..1
  const easedPhase = interpolate(
    Math.sin(phase * Math.PI * 2),
    [-1, 1],
    [0.35, 1.0],
    { easing: Easing.bezier(0.4, 0, 0.6, 1) },
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 10000 }}>
      <div
        style={{
          position: "absolute",
          top: topPx - 3,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, rgba(108,227,181,0.2) 0%, ${COLORS.accent} 12%, ${COLORS.accent} 88%, rgba(108,227,181,0.2) 100%)`,
          opacity: easedPhase,
          boxShadow: `0 0 20px rgba(108, 227, 181, ${0.8 * easedPhase}), 0 0 44px rgba(108, 227, 181, ${0.4 * easedPhase})`,
        }}
      />
    </AbsoluteFill>
  );
};
