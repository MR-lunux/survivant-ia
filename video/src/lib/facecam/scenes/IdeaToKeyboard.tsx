import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";
import { ICON_PATHS } from "./icons";

// Two-beat scene:
//   beat 1 (~30%) — lightbulb icon + italic "idée."
//   beat 2 (~70%) — a chat-style message bubble where text is typed
//                   character by character with a blinking cursor

const TYPED_TEXT = "voici mon idée…";

const Icon: React.FC<{ name: string; size: number; color: string; opacity?: number }> = ({ name, size, color, opacity = 1 }) => {
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
      style={{ opacity }}
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

  // Beat 1: lightbulb + "idée"
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

  // Beat 2: chat bubble fades in, text types out
  const bubbleStart = beat1End - 0.1;
  const bubbleT = t - bubbleStart;
  const bubbleSp = bubbleT > 0 ? spring({ frame: bubbleT * fps, fps, config: { damping: 14, mass: 0.5 } }) : 0;
  const bubbleOpacity = interpolate(bubbleT, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Typing animation: chars appear over time. Start typing after bubble fades in.
  const typingStart = bubbleStart + 0.35;
  const typingDur = (dur - typingStart) * 0.7; // leave 30% to read the result
  const typingProgress = interpolate(t, [typingStart, typingStart + typingDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  const visibleChars = Math.floor(typingProgress * TYPED_TEXT.length);
  const visibleText = TYPED_TEXT.slice(0, visibleChars);

  // Blinking cursor: visible 0.5s on, 0.5s off
  const cursorVisible = bubbleT > 0.35 && Math.floor(t * 2) % 2 === 0;
  const isTypingDone = visibleChars >= TYPED_TEXT.length;

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
          <div style={{ position: "relative", width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(108,227,181,0.5) 0%, transparent 60%)`,
              }}
            />
            <Icon name="lightbulb" size={220} color={COLORS.accent} />
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

      {/* Beat 2 — chat bubble typing */}
      {bubbleT > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${bubbleSp})`,
            opacity: bubbleOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: 760,
          }}
        >
          {/* Bubble */}
          <div
            style={{
              position: "relative",
              width: "100%",
              background: COLORS.surface,
              border: `1px solid rgba(232, 229, 221, 0.18)`,
              borderRadius: 24,
              padding: "30px 36px",
              minHeight: 140,
              boxShadow: `0 0 32px rgba(108, 227, 181, ${0.18 * bubbleOpacity})`,
            }}
          >
            {/* Mini header — like a chat input label */}
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 22,
                color: COLORS.muted,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              › commentaire
            </div>
            {/* Typed text */}
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: 52,
                fontWeight: 600,
                color: COLORS.text,
                lineHeight: 1.2,
                letterSpacing: -0.5,
                minHeight: 64,
              }}
            >
              {visibleText}
              {!isTypingDone && (
                <span
                  style={{
                    display: "inline-block",
                    width: 4,
                    height: 56,
                    background: COLORS.accent,
                    marginLeft: 6,
                    verticalAlign: "middle",
                    opacity: cursorVisible ? 1 : 0,
                  }}
                />
              )}
              {isTypingDone && (
                <span
                  style={{
                    display: "inline-block",
                    width: 4,
                    height: 56,
                    background: COLORS.accent,
                    marginLeft: 6,
                    verticalAlign: "middle",
                    opacity: cursorVisible ? 1 : 0,
                  }}
                />
              )}
            </div>
            {/* Bubble tail (bottom-left) */}
            <svg
              width={28}
              height={20}
              viewBox="0 0 28 20"
              style={{ position: "absolute", bottom: -18, left: 60 }}
            >
              <path
                d="M0 0 L28 0 L14 20 Z"
                fill={COLORS.surface}
                stroke="rgba(232, 229, 221, 0.18)"
                strokeWidth={1}
              />
              {/* Cover top of tail with surface fill to hide the seam */}
              <path d="M0 0 L28 0 L14 1 Z" fill={COLORS.surface} />
            </svg>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
