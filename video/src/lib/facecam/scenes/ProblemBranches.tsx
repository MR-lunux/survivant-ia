import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

const CENTER_X = 540;
const CENTER_Y = 500;

type Branch = { label: string; x: number; y: number; startFrame: number };

const BRANCHES: Branch[] = [
  { label: "LONG ET PÉNIBLE", x: 540, y: 300, startFrame: 40 },
  { label: "DONNÉES PRIVÉES", x: 220, y: 730, startFrame: 150 },
  { label: "ZÉRO PROTECTION", x: 860, y: 730, startFrame: 250 },
];

function lineLength(b: Branch): number {
  return Math.hypot(b.x - CENTER_X, b.y - CENTER_Y);
}

export const ProblemBranches: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Central "LE PROBLÈME" slams in
  const centralSpring = spring({ frame, fps, config: { damping: 9, stiffness: 220 } });
  const pulse = interpolate(Math.sin(frame * 0.22), [-1, 1], [0.5, 1]);

  return (
    <AbsoluteFill>
      {/* SVG branches behind */}
      <svg width="1080" height="960" style={{ position: "absolute", top: 0, left: 0 }}>
        {BRANCHES.map((b) => {
          const len = lineLength(b);
          // Line draws from center toward node over 14 frames after b.startFrame
          const drawProgress = interpolate(
            frame,
            [b.startFrame, b.startFrame + 14],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const visibleLen = len * drawProgress;
          const x2 = CENTER_X + (b.x - CENTER_X) * drawProgress;
          const y2 = CENTER_Y + (b.y - CENTER_Y) * drawProgress;
          return (
            <g key={b.label}>
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={x2}
                y2={y2}
                stroke={COLORS.accent}
                strokeWidth={1.5}
                opacity={0.65}
              />
              {/* Tracer dot at line tip while drawing */}
              {drawProgress > 0 && drawProgress < 1 && (
                <circle cx={x2} cy={y2} r={5} fill={COLORS.accent} opacity={pulse} />
              )}
              {/* Visible length echo for screen readers (no-op visually) */}
              <title>{`${b.label} (${Math.round(visibleLen)}px)`}</title>
            </g>
          );
        })}
      </svg>

      {/* Central node */}
      <div
        style={{
          position: "absolute",
          left: CENTER_X,
          top: CENTER_Y,
          transform: `translate(-50%, -50%) scale(${0.7 + centralSpring * 0.3})`,
          opacity: centralSpring,
        }}
      >
        <div
          style={{
            border: `1px solid ${COLORS.accent}`,
            background: COLORS.bg,
            padding: "16px 28px",
            fontFamily: FONTS.mono,
            fontSize: 16,
            letterSpacing: "0.22em",
            color: COLORS.accent,
            textTransform: "uppercase",
            boxShadow: `0 0 ${18 * pulse}px ${COLORS.accent}`,
            whiteSpace: "nowrap",
          }}
        >
          le problème
        </div>
      </div>

      {/* Branch labels */}
      {BRANCHES.map((b) => {
        const labelStart = b.startFrame + 14;
        const labelSpring = spring({
          frame: frame - labelStart,
          fps,
          config: { damping: 12, stiffness: 160 },
        });
        return (
          <div
            key={b.label}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              transform: `translate(-50%, -50%) translateY(${(1 - labelSpring) * 12}px)`,
              opacity: labelSpring,
            }}
          >
            <div
              style={{
                border: `1px solid ${COLORS.hairlineStrong}`,
                background: COLORS.surface,
                padding: "14px 20px",
                fontFamily: FONTS.sans,
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: -0.3,
                color: COLORS.text,
                textTransform: "uppercase",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              {b.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
