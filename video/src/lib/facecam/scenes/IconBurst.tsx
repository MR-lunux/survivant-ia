import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";
import { ICON_PATHS } from "./icons";

type Props = {
  iconName: string;
  label?: string;
  color?: "accent" | "text" | "danger" | "mutation";
  size?: number;
};

export const IconBurst: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { iconName, label, color = "accent", size = 280 } = props as unknown as Props;
  const paths = ICON_PATHS[iconName];
  if (!paths) return null;

  const colorVal = COLORS[color];
  const sp = spring({ frame, fps, config: { damping: 12, mass: 0.5 } });
  const fade = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const rotation = interpolate(sp, [0, 1], [-8, 0]);

  // Halo: bursts out at start, settles
  const haloPhase = interpolate(frame, [0, 14, 28], [0, 1, 0.55], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const haloScale = interpolate(frame, [0, 24], [0.5, 1.35], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  // Outer ring rotation (slow continuous)
  const ringRotation = (frame / fps) * 18;

  const accentAlpha = color === "accent" ? 0.35 : 0.18;
  const haloColor = color === "accent" ? `rgba(108,227,181,${accentAlpha})` : "rgba(232,229,221,0.18)";

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: size + 80, height: size + 80, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {/* Outer rotating ring (decorative) */}
        <svg
          width={size + 80}
          height={size + 80}
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            inset: 0,
            opacity: fade * 0.5,
            transform: `rotate(${ringRotation}deg)`,
          }}
        >
          <circle
            cx={50}
            cy={50}
            r={47}
            fill="none"
            stroke={colorVal}
            strokeWidth={0.4}
            strokeDasharray="3 4"
            opacity={0.5}
          />
        </svg>
        {/* Halo burst */}
        <div
          style={{
            position: "absolute",
            inset: 30,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${haloColor} 0%, transparent 65%)`,
            opacity: haloPhase,
            transform: `scale(${haloScale})`,
          }}
        />
        {/* Icon */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colorVal}
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "relative",
            opacity: fade,
            transform: `scale(${sp}) rotate(${rotation}deg)`,
          }}
        >
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
      </div>
      {label && (
        <div
          style={{
            marginTop: 40,
            fontFamily: FONTS.sans,
            fontSize: 52,
            color: COLORS.text,
            textTransform: "uppercase",
            letterSpacing: -0.5,
            fontWeight: 800,
            opacity: interpolate(frame, [12, 24], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};
