import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Item = { label: string; startFrame: number };

const ITEMS: Item[] = [
  { label: "sans âme",              startFrame: 30 },
  { label: "blindé d'emojis",       startFrame: 95 },
  { label: "phrases toutes faites", startFrame: 155 },
];

const CONCLUSION_START = 215;

export const NegativeVerdict: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const conclusionSpring = spring({
    frame: frame - CONCLUSION_START,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  return (
    <AbsoluteFill style={{ padding: "260px 60px 40px 60px", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          opacity: headerSpring,
          transform: `translateY(${(1 - headerSpring) * 8}px)`,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            letterSpacing: "0.22em",
            color: COLORS.accent,
            textTransform: "uppercase",
          }}
        >
          résultat
        </div>
      </div>
      <div
        style={{
          height: 1,
          background: COLORS.hairlineStrong,
          marginBottom: 40,
          opacity: headerSpring,
          transformOrigin: "left",
          transform: `scaleX(${headerSpring})`,
        }}
      />

      {/* Items list (text + animated strikethrough) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32, flex: 1 }}>
        {ITEMS.map((item, i) => {
          const localFrame = frame - item.startFrame;
          const labelSpring = spring({ frame: localFrame, fps, config: { damping: 13, stiffness: 170 } });
          const strikeProgress = interpolate(localFrame, [16, 32], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                opacity: labelSpring,
                transform: `translateX(${(1 - labelSpring) * -24}px)`,
              }}
            >
              {/* Failure marker box */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  border: `2px solid ${COLORS.danger}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.danger,
                  fontFamily: FONTS.sans,
                  fontWeight: 900,
                  fontSize: 30,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ✕
              </div>
              {/* Label with animated strikethrough */}
              <div style={{ position: "relative", display: "inline-block" }}>
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontWeight: 800,
                    fontSize: 44,
                    color: COLORS.text,
                    letterSpacing: -0.5,
                    textTransform: "uppercase",
                    lineHeight: 1.05,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: -4,
                    width: `calc(${strikeProgress * 100}% + 8px)`,
                    height: 3,
                    background: COLORS.danger,
                    transformOrigin: "left",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Conclusion */}
      <div
        style={{
          opacity: conclusionSpring,
          transform: `translateY(${(1 - conclusionSpring) * 14}px)`,
          textAlign: "center",
          fontFamily: FONTS.serif,
          fontStyle: "italic",
          fontSize: 72,
          color: COLORS.accent,
          letterSpacing: -1,
          marginTop: 20,
          lineHeight: 1,
        }}
      >
        décevant.
      </div>
    </AbsoluteFill>
  );
};
