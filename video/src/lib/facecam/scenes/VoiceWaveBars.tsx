import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  label?: string;
  barCount?: number;
  caption?: string;
};

// Stylized audio waveform bars. Pure deterministic animation (no real audio analysis).
// Each bar oscillates at a slightly different frequency/phase → organic vibe.

export const VoiceWaveBars: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { label, barCount = 11, caption } = props as unknown as Props;

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      {caption && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 26,
            color: COLORS.muted,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 28,
            opacity: fadeIn,
          }}
        >
          {caption}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16, height: 320, opacity: fadeIn }}>
        {Array.from({ length: barCount }).map((_, i) => {
          // Two sine layers per bar = less mechanical
          const freq1 = 1.4 + (i % 3) * 0.45;
          const freq2 = 2.7 + (i % 5) * 0.35;
          const phase = (i * 0.6) % (Math.PI * 2);
          const wave = (Math.sin(t * freq1 + phase) + 0.6 * Math.sin(t * freq2 + phase * 1.5)) / 1.6;
          // Map wave (-1..1) to amplitude 0.2..1
          const amplitude = 0.2 + 0.8 * (wave * 0.5 + 0.5);
          const heightPx = 40 + amplitude * 280;
          const distFromCenter = Math.abs(i - (barCount - 1) / 2);
          const edgeFade = 1 - (distFromCenter / ((barCount - 1) / 2 + 1)) * 0.4;
          return (
            <div
              key={i}
              style={{
                width: 26,
                height: heightPx,
                background: COLORS.accent,
                borderRadius: 5,
                opacity: edgeFade,
                boxShadow: `0 0 ${18 + amplitude * 24}px rgba(108,227,181,${amplitude * 0.55})`,
              }}
            />
          );
        })}
      </div>

      {label && (
        <div
          style={{
            marginTop: 56,
            fontFamily: FONTS.sans,
            fontSize: 48,
            color: COLORS.text,
            textTransform: "uppercase",
            letterSpacing: -0.5,
            fontWeight: 800,
            opacity: interpolate(frame, [16, 28], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};
