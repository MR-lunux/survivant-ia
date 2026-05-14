import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ParticleBackground } from "../components/ParticleBackground";
import { Grain } from "../components/Background";
import { COLORS } from "../theme";

export const AmbientLayer: React.FC<{ heightPx: number }> = ({ heightPx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Accent dot drift: ±3px on x, 6s period (sinus)
  const driftPeriod = fps * 6;
  const drift = Math.sin((frame / driftPeriod) * Math.PI * 2) * 3;

  return (
    <AbsoluteFill style={{ height: heightPx, pointerEvents: "none" }}>
      <ParticleBackground />
      <Grain />
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40 + drift,
          width: 10,
          height: 10,
          background: COLORS.accent,
          boxShadow: `0 0 12px rgba(108,227,181,0.5)`,
        }}
      />
    </AbsoluteFill>
  );
};
