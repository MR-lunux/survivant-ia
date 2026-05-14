import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  value: number;
  suffix?: string;
  caption?: string;
  label?: string;
  color?: "accent" | "danger" | "mutation" | "text";
};

export const BigStat: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { value, suffix = "", caption, label, color = "text" } = props as unknown as Props;
  const colorVal = COLORS[color];

  // Counter: 0 → value over ~1.2s with spring overshoot
  const sp = spring({ frame, fps, config: { damping: 14, mass: 0.5, stiffness: 110 } });
  const counter = Math.round(value * sp);
  const capFade = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const labelFade = interpolate(frame, [10, 18], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "flex-start" }}>
      {caption && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 26,
            color: COLORS.muted,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: capFade,
            marginBottom: 18,
          }}
        >
          {caption}
        </div>
      )}
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 900,
          fontSize: 280,
          letterSpacing: -8,
          color: colorVal,
          lineHeight: 0.95,
        }}
      >
        {counter}
        {suffix}
      </div>
      {label && (
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 36,
            color: COLORS.textSoft,
            opacity: labelFade,
            marginTop: 24,
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};
