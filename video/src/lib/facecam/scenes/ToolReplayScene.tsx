import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { typeSubstring } from "../helpers/typing";
import { PillarsCanvas } from "../components/PillarsCanvas";
import type { SceneCommonProps } from "./types";

type Props = {
  phase: "typing" | "loading" | "output";
};

const SAMPLE_PROMPT = "écris-moi un article LinkedIn sur comment acheter une maison";

export const ToolReplayScene: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { phase } = props as unknown as Props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (phase === "output") {
    // Full-screen overlay (documented exception — escapes the half-height parent)
    return (
      <AbsoluteFill style={{ height: "200%", top: 0, zIndex: 50 }}>
        <div style={{ position: "absolute", inset: 0, background: COLORS.bg }} />
        <AbsoluteFill style={{ justifyContent: "center", padding: 40 }}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              letterSpacing: "0.18em",
              color: COLORS.accent,
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            LE PROMPT AMÉLIORÉ
          </div>
          <PillarsCanvas visiblePillars={6} highlight={null} mode="normal" />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // typing + loading phases: half-height (default), framed like the real form
  const typedPrompt =
    phase === "typing" ? typeSubstring(SAMPLE_PROMPT, frame, 18, fps) : SAMPLE_PROMPT;
  const pulse =
    phase === "loading"
      ? interpolate(Math.sin(frame * 0.45), [-1, 1], [0.3, 1.0])
      : 0;

  return (
    <AbsoluteFill style={{ padding: 60, justifyContent: "center" }}>
      <div
        style={{
          border: `1px solid ${COLORS.hairlineStrong}`,
          background: COLORS.bg,
          padding: 24,
        }}
      >
        {/* Label — mirrors .kfm-label */}
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 13,
            letterSpacing: "0.18em",
            color: COLORS.accent,
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          TON PROMPT À AMÉLIORER
        </div>

        {/* Textarea — mirrors .kfm-textarea */}
        <div
          style={{
            border: `1px solid ${COLORS.rule}`,
            background: COLORS.surface,
            padding: "16px 20px",
            fontFamily: FONTS.sans,
            fontSize: 18,
            color: COLORS.text,
            minHeight: 120,
            lineHeight: 1.5,
          }}
        >
          {typedPrompt}
          {phase === "typing" && typedPrompt.length < SAMPLE_PROMPT.length && (
            <span style={{ opacity: Math.sin(frame * 0.4) > 0 ? 1 : 0 }}>▍</span>
          )}
        </div>

        {/* Meta row — mirrors .kfm-meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          {/* Character count — mirrors .kfm-count */}
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            {typedPrompt.length} / 4000 caractères
          </div>

          {phase === "loading" ? (
            // Loading state — mirrors .ko-loading
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: FONTS.mono,
                fontSize: 13,
                letterSpacing: "0.14em",
                color: COLORS.accent,
                textTransform: "uppercase",
              }}
            >
              {/* Pulsing dot — mirrors .ko-loading-dot */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLORS.accent,
                  opacity: pulse,
                  display: "inline-block",
                }}
              />
              {"L'IA structure ton prompt…"}
            </div>
          ) : (
            // Submit button — mirrors .kfm-submit
            <div
              style={{
                border: `1px solid ${COLORS.accent}`,
                color: COLORS.accent,
                padding: "12px 22px",
                fontFamily: FONTS.mono,
                fontSize: 13,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {"Améliore mon prompt →"}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
