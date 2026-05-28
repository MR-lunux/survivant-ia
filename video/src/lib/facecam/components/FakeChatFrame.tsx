import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { typeSubstring } from "../helpers/typing";
import { emojiBurstFor } from "../helpers/emoji-burst";

type Props = {
  promptText: string;
  outputLines: string[];
  mode: "glitch" | "spam" | "neutral";
  /** When true (spam mode), spawn drifting emojis on top of the output. */
  emojiBurst?: boolean;
  /** Chars per second for auto-typing the prompt. Default 24. */
  typeSpeed?: number;
};

export const FakeChatFrame: React.FC<Props> = ({ promptText, outputLines, mode, emojiBurst = false, typeSpeed = 24 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typedPrompt = typeSubstring(promptText, frame, typeSpeed, fps);

  // Output appears line-by-line after the prompt finishes typing
  const promptDoneFrame = Math.ceil((promptText.length / typeSpeed) * fps);
  const outputStartFrame = promptDoneFrame + 8;
  const linesShown = Math.max(
    0,
    Math.floor((frame - outputStartFrame) / 18)
  );

  // Glitch jitter on output letters (mode === "glitch")
  const glitchOffset = mode === "glitch" ? Math.sin(frame * 1.2) * 3 : 0;

  return (
    <AbsoluteFill style={{ padding: "240px 60px 40px 60px", justifyContent: "flex-start" }}>
      {/* Outer chat frame */}
      <div style={{
        border: `1px solid ${COLORS.hairlineStrong}`,
        background: COLORS.surface,
        padding: 24,
        fontFamily: FONTS.mono,
        width: "100%",
      }}>
        {/* Top: user prompt bubble */}
        <div style={{
          fontSize: 13,
          letterSpacing: "0.18em",
          color: COLORS.muted,
          marginBottom: 8,
        }}>
          VOUS
        </div>
        <div style={{
          fontFamily: FONTS.sans,
          fontSize: 22,
          color: COLORS.text,
          marginBottom: 22,
          lineHeight: 1.35,
        }}>
          {typedPrompt}
          {typedPrompt.length < promptText.length && (
            <span style={{ opacity: Math.sin(frame * 0.4) > 0 ? 1 : 0 }}>▍</span>
          )}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: COLORS.hairline,
          margin: "0 0 18px 0",
        }} />

        {/* Bottom: AI output */}
        <div style={{
          fontSize: 13,
          letterSpacing: "0.18em",
          color: COLORS.accent,
          marginBottom: 8,
        }}>
          IA
        </div>
        <div style={{
          fontFamily: FONTS.sans,
          fontSize: 18,
          color: COLORS.textSoft,
          lineHeight: 1.45,
          transform: `translateX(${glitchOffset}px)`,
          minHeight: 240,
          position: "relative",
        }}>
          {outputLines.slice(0, linesShown).map((line, i) => (
            <div key={i} style={{
              marginBottom: 6,
              opacity: interpolate(
                frame - (outputStartFrame + i * 18),
                [0, 8],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}>
              {line}
            </div>
          ))}

          {/* Emoji spam layer */}
          {emojiBurst && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {emojiBurstFor(frame, fps).map((e) => (
                <span
                  key={e.spawnFrame}
                  style={{
                    position: "absolute",
                    left: `${e.x * 100}%`,
                    top: `${e.y * 100}%`,
                    fontSize: 36,
                    transform: `scale(${interpolate(frame - e.spawnFrame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  }}
                >
                  {e.glyph}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
