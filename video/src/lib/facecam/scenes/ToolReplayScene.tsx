import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { PillarsCanvas } from "../components/PillarsCanvas";
import type { SceneCommonProps } from "./types";

type Props = {
  phase: "intro" | "process" | "output";
};

const SAMPLE_PROMPT = "écris-moi un article LinkedIn sur comment acheter une maison";

export const ToolReplayScene: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { phase } = props as unknown as Props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (phase === "output") {
    // Full-screen overlay showing structured output
    const labelSpring = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
    return (
      <AbsoluteFill style={{ height: "200%", top: 0, zIndex: 50 }}>
        <div style={{ position: "absolute", inset: 0, background: COLORS.bg }} />
        <AbsoluteFill style={{ padding: "180px 0 40px 0" }}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              letterSpacing: "0.22em",
              color: COLORS.accent,
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 18,
              opacity: labelSpring,
              transform: `translateY(${(1 - labelSpring) * 12}px)`,
            }}
          >
            ton prompt structuré
          </div>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <PillarsCanvas visiblePillars={6} highlight={null} mode="normal" />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // intro & process phases — vertical pipeline: prompt → tool box
  const isProcess = phase === "process";

  // Intro animation: fade in everything sequentially
  const promptSpring = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const arrowSpring = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const boxSpring = spring({ frame: frame - 14, fps, config: { damping: 14 } });

  // Process animation: bad prompt slides DOWN into the box + fades; tool box glows brighter
  const flowProgress = isProcess
    ? interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const pulse = interpolate(Math.sin(frame * 0.28), [-1, 1], [0.4, 1]);
  const glowIntensity = isProcess ? 0.5 + flowProgress * 0.5 : 0.5;

  // Particle beams flowing from prompt → tool during process phase
  const beamCount = 6;

  return (
    <AbsoluteFill style={{ padding: "240px 50px 40px 50px" }}>
      {/* Top: bad prompt block */}
      <div
        style={{
          opacity: promptSpring * (1 - flowProgress * 0.85),
          transform: `translateY(${flowProgress * 180}px) scale(${1 - flowProgress * 0.15})`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 13,
            letterSpacing: "0.18em",
            color: COLORS.muted,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ton prompt brut
        </div>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: "italic",
            fontSize: 30,
            color: COLORS.textSoft,
            lineHeight: 1.3,
            border: `1px solid ${COLORS.hairline}`,
            background: COLORS.surface,
            padding: "16px 22px",
          }}
        >
          &laquo; {SAMPLE_PROMPT} &raquo;
        </div>
      </div>

      {/* Middle: arrow */}
      <div
        style={{
          fontSize: 48,
          color: COLORS.accent,
          textAlign: "center",
          margin: "22px 0 18px 0",
          opacity: arrowSpring,
          transform: `scale(${arrowSpring}) translateY(${flowProgress * 80}px)`,
        }}
      >
        &#x2193;
      </div>

      {/* Process beams (during process phase only) */}
      {isProcess && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 200, pointerEvents: "none" }}>
          {Array.from({ length: beamCount }).map((_, i) => {
            const localPhase = (frame + i * 6) % 24;
            const beamY = (localPhase / 24) * 200;
            const beamOpacity = interpolate(localPhase, [0, 6, 18, 24], [0, 1, 1, 0]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${30 + i * 8}%`,
                  top: beamY,
                  width: 2,
                  height: 18,
                  background: COLORS.accent,
                  opacity: beamOpacity * 0.6,
                  filter: `blur(0.5px)`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Bottom: tool box */}
      <div
        style={{
          opacity: boxSpring,
          transform: `scale(${boxSpring})`,
          border: `2px solid ${COLORS.accent}`,
          background: COLORS.surface,
          padding: "28px 32px",
          textAlign: "center",
          boxShadow: `0 0 ${24 * pulse * glowIntensity}px ${COLORS.accent}, inset 0 0 ${12 * pulse * glowIntensity}px ${COLORS.accentSoft}`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 14,
            letterSpacing: "0.22em",
            color: COLORS.accent,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          l'outil
        </div>
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 40,
            color: COLORS.text,
            letterSpacing: -0.5,
            lineHeight: 1.1,
            textTransform: "uppercase",
          }}
        >
          {isProcess ? "structure en cours…" : "améliore ton prompt"}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 16,
            color: COLORS.muted,
            marginTop: 14,
            letterSpacing: 1,
          }}
        >
          survivant-ia.ch
        </div>
      </div>
    </AbsoluteFill>
  );
};
