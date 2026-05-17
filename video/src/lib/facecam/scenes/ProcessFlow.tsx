import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  steps: string[];
  emphasisLast?: boolean;
};

// Vertical sequence of bullets connected by lines. Each step appears with a spring
// entry. The last step optionally renders in italic accent (signature).

export const ProcessFlow: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ durationFrames, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { steps, emphasisLast = true } = props as unknown as Props;
  const stepInterval = Math.max(8, Math.floor((durationFrames - 20) / Math.max(1, steps.length)));

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "flex-start", flexDirection: "column", gap: 28 }}>
      {steps.map((step, i) => {
        const startFrame = i * stepInterval;
        const t = frame - startFrame;
        if (t < 0) return null;
        const sp = spring({ frame: t, fps, config: { damping: 14, mass: 0.5 } });
        const fade = interpolate(t, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
        const isLast = i === steps.length - 1;
        const accent = isLast && emphasisLast;
        const lineLen = interpolate(t, [4, 16], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              opacity: fade,
              transform: `translateX(${interpolate(sp, [0, 1], [-40, 0])}px)`,
            }}
          >
            <div style={{ position: "relative", width: 24, height: 24, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: accent ? COLORS.accent : "transparent",
                  border: accent ? "none" : `2px solid ${COLORS.muted}`,
                  boxShadow: accent ? `0 0 20px rgba(108,227,181,0.7)` : "none",
                }}
              />
              {/* Connecting line to next */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    left: 11,
                    width: 2,
                    height: 56 * lineLen,
                    background: COLORS.hairline,
                  }}
                />
              )}
            </div>
            <div
              style={{
                fontFamily: accent ? FONTS.serif : FONTS.sans,
                fontStyle: accent ? "italic" : "normal",
                fontWeight: accent ? 500 : 800,
                fontSize: accent ? 78 : 64,
                color: accent ? COLORS.accent : COLORS.text,
                textTransform: accent ? "none" : "uppercase",
                letterSpacing: accent ? 0 : -0.5,
                lineHeight: 1,
              }}
            >
              {step}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
