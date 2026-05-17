import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";
import { ICON_PATHS } from "./icons";

type Props = {
  label?: string;
};

// Brain icon that starts FULL (filled menthe) and progressively empties from
// top to bottom over the scene's duration. Metaphor: liberating cognitive
// space by killing the alienating task.

export const BrainEmptying: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ durationFrames, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dur = durationFrames / fps;
  const { label } = props as unknown as Props;

  const sp = spring({ frame, fps, config: { damping: 14, mass: 0.5 } });
  const entryFade = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Drain: from 1 (fully filled) at t=0.6s → 0 (empty) at t=dur-0.4s
  const drainStart = 0.6;
  const drainEnd = dur - 0.4;
  const fillLevel = t < drainStart
    ? 1
    : interpolate(t, [drainStart, drainEnd], [1, 0], {
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      });

  const size = 360;
  const paths = ICON_PATHS.brain;
  // The fill-overlay uses clipPath to mask itself to the brain SHAPE roughly.
  // Since brain is drawn with multiple strokes, we approximate with an ellipse.
  // The ellipse fill height shrinks downward as fillLevel decreases.


  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          opacity: entryFade,
          transform: `scale(${sp})`,
        }}
      >
        {/* Filled brain background: an ellipse roughly matching brain silhouette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 30,
              right: 30,
              bottom: 30,
              height: `calc(${fillLevel * 100}% - 60px)`,
              background: `linear-gradient(180deg, rgba(108,227,181,0.55) 0%, rgba(108,227,181,0.85) 100%)`,
              borderRadius: "50% 50% 40% 40% / 60% 60% 30% 30%",
              transition: "none",
            }}
          />
        </div>

        {/* Brain outline on top */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "relative" }}
        >
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>

        {/* Drain droplets falling from bottom when emptying */}
        {fillLevel < 1 && fillLevel > 0.05 && (
          <div
            style={{
              position: "absolute",
              bottom: -20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 14,
              opacity: 0.6,
            }}
          >
            {[0, 1, 2].map((i) => {
              const dropPhase = (t * 1.5 + i * 0.4) % 1;
              const dropY = dropPhase * 80;
              const dropOpacity = 1 - dropPhase;
              return (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 12,
                    background: COLORS.accent,
                    borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
                    transform: `translateY(${dropY}px)`,
                    opacity: dropOpacity * 0.7,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {label && (
        <div
          style={{
            marginTop: 56,
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
