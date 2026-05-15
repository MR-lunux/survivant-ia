import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS } from "../../theme";
import type { SceneCommonProps } from "./types";

export const HairlineDivider: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const width = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", padding: 80 }}>
      <div
        style={{
          height: 1,
          width: `${width * 100}%`,
          background: COLORS.hairlineStrong,
          maxWidth: 920,
        }}
      />
    </AbsoluteFill>
  );
};
