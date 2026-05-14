import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS } from "../theme";

export const HairlinePulse: React.FC<{ topPx: number }> = ({ topPx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulse alpha 0.6 ↔ 1.0 on a 4s cycle, ease-in-out
  const cycleFrames = fps * 4;
  const phase = (frame % cycleFrames) / cycleFrames; // 0..1
  const easedPhase = interpolate(
    Math.sin(phase * Math.PI * 2),
    [-1, 1],
    [0.6, 1.0],
    { easing: Easing.bezier(0.4, 0, 0.6, 1) },
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: topPx,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, rgba(108,227,181,0.15) 0%, ${COLORS.accent} 15%, ${COLORS.accent} 85%, rgba(108,227,181,0.15) 100%)`,
          opacity: easedPhase,
          boxShadow: `0 0 8px rgba(108, 227, 181, ${0.4 * easedPhase})`,
        }}
      />
    </AbsoluteFill>
  );
};
