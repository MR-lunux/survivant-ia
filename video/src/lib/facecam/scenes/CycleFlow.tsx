import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  steps: string[]; // 4 words, placed at 12/3/6/9 o'clock
  emphasisLast?: boolean;
};

// Circular arrow making a full 360° rotation. Four steps appear at cardinal
// positions (top → right → bottom → left) as the arrow's tip points at them.
// On the last step, the arrow accelerates briefly to reveal "it's a cycle".

export const CycleFlow: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ durationFrames, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dur = durationFrames / fps;
  const { steps, emphasisLast = true } = props as unknown as Props;

  // Four cardinal positions, starting at top, clockwise.
  // Angle in degrees: 0 (top), 90 (right), 180 (bottom), 270 (left)
  const positions = [0, 90, 180, 270];

  // Phase plan: 70% of duration for first 360° pass + step reveals.
  // Last 30% = brief acceleration + emphasis on cycle.
  const firstPassEnd = dur * 0.72;
  const phaseEnd = dur;

  // Arrow rotation: 0 → 360° during first pass, then accelerates +360° more
  const baseRot = interpolate(t, [0, firstPassEnd], [-90, 270], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  const accelRot = t > firstPassEnd
    ? interpolate(t, [firstPassEnd, phaseEnd], [0, 360], {
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.32, 0, 0.67, 0),
      })
    : 0;
  const arrowRotation = baseRot + accelRot;

  // Step appearance: word i appears when arrow tip reaches that angle
  const stepRevealTime = (i: number) => (positions[i] / 360) * firstPassEnd + 0.05;

  // Size config
  const radius = 200;
  const containerSize = 720;

  // Cycle highlight on phase 2
  const cycleGlow = t > firstPassEnd
    ? interpolate(t, [firstPassEnd, firstPassEnd + 0.3], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    : 0;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "relative",
          width: containerSize,
          height: containerSize,
        }}
      >
        {/* Circular arrow path */}
        <svg
          width={containerSize}
          height={containerSize}
          viewBox="0 0 200 200"
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotate(${arrowRotation}deg)`,
          }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0 0 L6 3 L0 6 z" fill={COLORS.accent} />
            </marker>
          </defs>
          {/* Open circle with gap at the end for arrow head */}
          <path
            d="M 100 30 A 70 70 0 1 1 99 30"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={2}
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
            opacity={0.85}
          />
        </svg>

        {/* Center pulse glow on cycle complete */}
        <div
          style={{
            position: "absolute",
            inset: 80,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(108,227,181,${0.35 * cycleGlow}) 0%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />

        {/* Four steps at cardinal positions */}
        {steps.map((step, i) => {
          const revealAt = stepRevealTime(i);
          const local = t - revealAt;
          if (local < 0) return null;
          const sp = spring({ frame: local * fps, fps, config: { damping: 14, mass: 0.5 } });
          const fade = interpolate(local, [0, 0.15], [0, 1], {
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          const isLast = i === steps.length - 1;
          const accent = isLast && emphasisLast;

          const angleRad = (positions[i] - 90) * (Math.PI / 180);
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${sp})`,
                opacity: fade,
                fontFamily: accent ? FONTS.serif : FONTS.sans,
                fontStyle: accent ? "italic" : "normal",
                fontWeight: accent ? 500 : 800,
                fontSize: accent ? 76 : 64,
                color: accent ? COLORS.accent : COLORS.text,
                textTransform: accent ? "none" : "uppercase",
                letterSpacing: accent ? 0 : -0.5,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {step}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
