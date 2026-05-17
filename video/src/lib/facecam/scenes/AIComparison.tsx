import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

// Two-line comparison chart: flat horizontal line "SANS IA" (dim) vs a steeply
// rising line "AVEC IA" (menthe accent). Lines draw left-to-right via
// stroke-dasharray animation. End-of-line labels appear with the line tip.

export const AIComparison: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dur = durationFrames / fps;

  // Two lines draw sequentially:
  // 0 - dur*0.45 = sans IA flat line draws
  // dur*0.4 - dur*0.8 = avec IA rising line draws
  // dur*0.8 - dur     = labels persist + final highlight
  const sansDur = dur * 0.45;
  const avecStart = dur * 0.4;
  const avecDur = dur * 0.4;

  const sansProgress = interpolate(t, [0, sansDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const avecProgress = interpolate(t, [avecStart, avecStart + avecDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Chart geometry
  const W = 800;
  const H = 460;
  const padding = 40;
  // Sans IA: horizontal line in lower-middle
  const sansY = H * 0.7;
  // Avec IA: starts at same point, rises sharply
  const avecStartX = padding;
  const avecStartY = sansY;
  const avecEndX = W - padding;
  const avecEndY = H * 0.18;

  const sansPathLen = W - 2 * padding;
  const sansDashOffset = sansPathLen * (1 - sansProgress);

  const avecPathLen = Math.sqrt(
    Math.pow(avecEndX - avecStartX, 2) + Math.pow(avecEndY - avecStartY, 2),
  );
  const avecDashOffset = avecPathLen * (1 - avecProgress);

  // Labels
  const sansLabelOpacity = interpolate(t, [sansDur * 0.7, sansDur + 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const avecLabelOpacity = interpolate(t, [avecStart + avecDur * 0.7, avecStart + avecDur + 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Arrowhead at end of "AVEC IA" line (appears when nearly done)
  const arrowOpacity = interpolate(t, [avecStart + avecDur * 0.85, avecStart + avecDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ position: "relative" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Axis line subtle */}
          <line
            x1={padding}
            y1={H - padding}
            x2={W - padding}
            y2={H - padding}
            stroke={COLORS.hairline}
            strokeWidth={1}
          />

          {/* Sans IA flat */}
          <line
            x1={padding}
            y1={sansY}
            x2={W - padding}
            y2={sansY}
            stroke={COLORS.muted}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={sansPathLen}
            strokeDashoffset={sansDashOffset}
          />

          {/* Avec IA rising */}
          <line
            x1={avecStartX}
            y1={avecStartY}
            x2={avecEndX}
            y2={avecEndY}
            stroke={COLORS.accent}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={avecPathLen}
            strokeDashoffset={avecDashOffset}
            style={{
              filter: `drop-shadow(0 0 12px rgba(108,227,181,${avecProgress * 0.5}))`,
            }}
          />

          {/* Arrowhead at AVEC IA tip */}
          <g
            transform={`translate(${avecEndX}, ${avecEndY}) rotate(${
              (Math.atan2(avecEndY - avecStartY, avecEndX - avecStartX) * 180) / Math.PI
            })`}
            opacity={arrowOpacity}
          >
            <path d="M -18 -10 L 0 0 L -18 10" fill="none" stroke={COLORS.accent} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>

        {/* Sans IA label */}
        <div
          style={{
            position: "absolute",
            left: W - padding + 12,
            top: sansY - 18,
            fontFamily: FONTS.mono,
            fontSize: 28,
            color: COLORS.muted,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            opacity: sansLabelOpacity,
            whiteSpace: "nowrap",
          }}
        >
          › sans IA
        </div>

        {/* Avec IA label */}
        <div
          style={{
            position: "absolute",
            left: avecEndX - 60,
            top: avecEndY - 70,
            fontFamily: FONTS.sans,
            fontSize: 44,
            color: COLORS.accent,
            fontWeight: 800,
            letterSpacing: -0.5,
            textTransform: "uppercase",
            opacity: avecLabelOpacity,
            whiteSpace: "nowrap",
            transform: "translateX(-50%)",
          }}
        >
          avec IA
        </div>
      </div>
    </AbsoluteFill>
  );
};
