import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Beat = {
  text: string;
  fontSize: number;
  weight: 600 | 700 | 800 | 900;
  startFrame: number;
  glitch?: boolean;
};

const BEATS: Beat[] = [
  { text: "SI L'IA TE DONNE", fontSize: 54, weight: 700, startFrame: 0 },
  { text: "DES RÉPONSES",     fontSize: 92, weight: 800, startFrame: 18 },
  { text: "DÉSASTREUSES",     fontSize: 130, weight: 900, startFrame: 36, glitch: true },
];

export const HookGlitch: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scanlineOffset = (frame * 2) % 8;

  return (
    <AbsoluteFill
      style={{
        padding: "240px 40px 40px 40px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Scanlines background overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, rgba(108, 227, 181, 0.05) 0px, rgba(108, 227, 181, 0.05) 1px, transparent 1px, transparent 4px)`,
          backgroundPositionY: `${scanlineOffset}px`,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {BEATS.map((beat, i) => {
          const localFrame = frame - beat.startFrame;
          if (localFrame < 0) {
            return <div key={i} style={{ opacity: 0, height: beat.fontSize, fontSize: beat.fontSize }} />;
          }
          const sp = spring({ frame: localFrame, fps, config: { damping: 9, stiffness: 240 } });

          if (beat.glitch) {
            // Flicker pattern for "DÉSASTREUSES"
            const opacity = interpolate(
              localFrame,
              [0, 3, 4, 6, 8, 10, 11, 13],
              [0, 1, 0.4, 1, 0.7, 1, 0.6, 1],
              { extrapolateRight: "clamp" },
            );
            const scale = 0.7 + sp * 0.3;
            const jitterX = Math.sin(localFrame * 0.85) * 4 + Math.cos(localFrame * 1.4) * 2.5;
            const rgbShift = interpolate(Math.sin(localFrame * 0.45), [-1, 1], [3, 8]);
            const slamGlow = interpolate(localFrame, [0, 6], [40, 12], { extrapolateRight: "clamp" });

            return (
              <div key={i} style={{ position: "relative", opacity }}>
                {/* RGB split: red layer offset left */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    fontFamily: FONTS.sans,
                    fontWeight: beat.weight,
                    fontSize: beat.fontSize,
                    color: COLORS.danger,
                    letterSpacing: -3,
                    textTransform: "uppercase",
                    transform: `translate(${-rgbShift}px, 0) scale(${scale})`,
                    mixBlendMode: "screen",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {beat.text}
                </div>
                {/* RGB split: cyan layer offset right */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    fontFamily: FONTS.sans,
                    fontWeight: beat.weight,
                    fontSize: beat.fontSize,
                    color: COLORS.protege,
                    letterSpacing: -3,
                    textTransform: "uppercase",
                    transform: `translate(${rgbShift}px, 0) scale(${scale})`,
                    mixBlendMode: "screen",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {beat.text}
                </div>
                {/* Main mint layer with jitter + slam glow */}
                <div
                  style={{
                    position: "relative",
                    fontFamily: FONTS.sans,
                    fontWeight: beat.weight,
                    fontSize: beat.fontSize,
                    color: COLORS.accent,
                    letterSpacing: -3,
                    textTransform: "uppercase",
                    textAlign: "center",
                    transform: `translate(${jitterX}px, 0) scale(${scale})`,
                    lineHeight: 1,
                    textShadow: `0 0 ${slamGlow}px ${COLORS.accent}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {beat.text}
                </div>
              </div>
            );
          }

          // Non-glitch beat (smaller intro lines)
          const slide = interpolate(sp, [0, 1], [12, 0]);
          return (
            <div
              key={i}
              style={{
                fontFamily: FONTS.sans,
                fontWeight: beat.weight,
                fontSize: beat.fontSize,
                color: COLORS.textSoft,
                letterSpacing: -1,
                textTransform: "uppercase",
                textAlign: "center",
                opacity: sp,
                transform: `translateY(${slide}px)`,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {beat.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
