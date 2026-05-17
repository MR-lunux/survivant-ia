import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";
import { ICON_PATHS } from "./icons";

// Two-beat scene:
//   beat 1 (~30%) — the word "idée" appears with a lightbulb halo above
//   beat 2 (~70%) — transition to a keyboard with code lines being "typed"
//                   (lines appear left-to-right, simulating commentaire writing)

const Icon: React.FC<{ name: string; size: number; color: string; opacity?: number; transform?: string }> = ({
  name,
  size,
  color,
  opacity = 1,
  transform,
}) => {
  const paths = ICON_PATHS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity, transform }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
};

export const IdeaToKeyboard: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dur = durationFrames / fps;

  const beat1End = dur * 0.35;
  const inBeat1 = t < beat1End;

  // Beat 1: lightbulb halo + "idée" word
  const bulbSp = inBeat1 ? spring({ frame: t * fps, fps, config: { damping: 14, mass: 0.5 } }) : 1;
  const ideaFadeIn = interpolate(t, [0.15, 0.45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const ideaFadeOut = interpolate(t, [beat1End - 0.25, beat1End], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ideaOpacity = ideaFadeIn * ideaFadeOut;

  // Beat 2: keyboard centered + lines typing
  const kbStart = beat1End - 0.1;
  const kbT = t - kbStart;
  const kbSp = kbT > 0 ? spring({ frame: kbT * fps, fps, config: { damping: 14, mass: 0.5 } }) : 0;
  const kbOpacity = interpolate(kbT, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lines "typing" — N lines appear one-by-one, each filling left-to-right
  const lineCount = 4;
  const lineStartTime = beat1End + 0.2; // after keyboard appears
  const typingDur = dur - lineStartTime - 0.3;
  const linePerSec = typingDur / lineCount;
  const lineWidths = [0.95, 0.7, 0.88, 0.6]; // varied for natural look

  // Tap pulses on keyboard (Beat 2)
  const showTapPulses = t > beat1End && t < dur - 0.3;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      {/* Beat 1 — lightbulb + "idée" */}
      {ideaOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${bulbSp})`,
            opacity: ideaOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div style={{ position: "relative", width: 260, height: 260 }}>
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(108,227,181,0.5) 0%, transparent 60%)`,
              }}
            />
            <Icon name="lightbulb" size={260} color={COLORS.accent} />
          </div>
          <div
            style={{
              fontFamily: FONTS.serif,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 100,
              color: COLORS.accent,
              letterSpacing: 0,
            }}
          >
            idée.
          </div>
        </div>
      )}

      {/* Beat 2 — keyboard typing comments */}
      {kbT > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${kbSp})`,
            opacity: kbOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          {/* Lines being typed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 560, alignItems: "flex-start" }}>
            {Array.from({ length: lineCount }).map((_, i) => {
              const lineStart = lineStartTime + i * linePerSec;
              const localLineT = t - lineStart;
              if (localLineT < 0) return null;
              const lineProgress = interpolate(localLineT, [0, linePerSec * 0.8], [0, 1], {
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.4, 0, 0.6, 1),
              });
              return (
                <div
                  key={i}
                  style={{
                    height: 10,
                    background: COLORS.muted,
                    borderRadius: 5,
                    width: `${lineWidths[i] * 100 * lineProgress}%`,
                    minWidth: 4,
                    opacity: 0.85,
                  }}
                />
              );
            })}
          </div>

          {/* Keyboard */}
          <div style={{ position: "relative" }}>
            <Icon name="keyboard" size={280} color={COLORS.accent} />
            {/* Tap pulses */}
            {showTapPulses && (
              <div
                style={{
                  position: "absolute",
                  top: -22,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 28,
                }}
              >
                {[0, 0.25, 0.5].map((phase, j) => {
                  const pulse = (Math.sin((t + phase) * Math.PI * 5) + 1) / 2;
                  return (
                    <div
                      key={j}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        background: COLORS.accent,
                        opacity: 0.4 + pulse * 0.6,
                        transform: `scale(${0.7 + pulse * 0.4})`,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
