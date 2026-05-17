import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  label?: string;
};

// Analog clock with animated hour + minute hands. Minute hand sweeps 360°
// per scene, hour hand 30° (= 1 hour). Visualizes "time flying" / freeing up.

export const ClockTicking: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ durationFrames, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dur = durationFrames / fps;
  const { label } = props as unknown as Props;

  const sp = spring({ frame, fps, config: { damping: 14, mass: 0.5 } });
  const fade = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Minute hand: full rotation across scene duration
  const minuteRot = interpolate(t, [0, dur], [0, 360], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  // Hour hand: 1/12th of minute speed
  const hourRot = minuteRot / 12;

  const size = 340;
  const cx = 50;
  const cy = 50;
  const radius = 44;

  // Hour markers (12 ticks)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const outer = radius - 2;
    const inner = radius - 6;
    const x1 = cx + Math.cos(angle) * outer;
    const y1 = cy + Math.sin(angle) * outer;
    const x2 = cx + Math.cos(angle) * inner;
    const y2 = cy + Math.sin(angle) * inner;
    return { x1, y1, x2, y2, key: i };
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          opacity: fade,
          transform: `scale(${sp})`,
        }}
      >
        {/* Halo */}
        <div
          style={{
            position: "absolute",
            inset: -30,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(108,227,181,0.25) 0%, transparent 60%)`,
          }}
        />

        <svg width={size} height={size} viewBox="0 0 100 100">
          {/* Clock face circle */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke={COLORS.accent} strokeWidth={1.5} />

          {/* Hour markers */}
          {ticks.map((tk) => (
            <line
              key={tk.key}
              x1={tk.x1}
              y1={tk.y1}
              x2={tk.x2}
              y2={tk.y2}
              stroke={COLORS.accent}
              strokeWidth={0.8}
              strokeLinecap="round"
              opacity={0.7}
            />
          ))}

          {/* Hour hand */}
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - radius * 0.5}
            stroke={COLORS.text}
            strokeWidth={2}
            strokeLinecap="round"
            transform={`rotate(${hourRot} ${cx} ${cy})`}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Minute hand */}
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - radius * 0.75}
            stroke={COLORS.accent}
            strokeWidth={1.5}
            strokeLinecap="round"
            transform={`rotate(${minuteRot} ${cx} ${cy})`}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              filter: `drop-shadow(0 0 4px rgba(108,227,181,0.7))`,
            }}
          />

          {/* Center dot */}
          <circle cx={cx} cy={cy} r={1.5} fill={COLORS.accent} />
        </svg>
      </div>

      {label && (
        <div
          style={{
            marginTop: 50,
            fontFamily: FONTS.sans,
            fontSize: 52,
            color: COLORS.text,
            textTransform: "uppercase",
            letterSpacing: -0.5,
            fontWeight: 800,
            opacity: interpolate(frame, [14, 24], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};
