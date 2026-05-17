import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { COLORS } from "../../theme";
import type { SceneCommonProps } from "./types";
import { ICON_PATHS } from "./icons";

// Narrative hook scene for the "comptable aliéné" topic:
//   beat 1 (0 → 2.2s)   keyboard with code lines piling up — saisi-saisi-saisi
//   beat 2 (2.2 → 5.0s) lines compact into a document stack — la valeur ajoutée nulle
//   beat 3 (5.0 → end)  everything falls, tomb rises from below in danger color
//
// Designed for a ~7s segment. Adapts beat boundaries to whatever durationFrames
// is passed, so you can drop it into a 5.5s or 8s slot.

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

export const ComptableToTomb: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dur = durationFrames / fps;

  // Beat boundaries scale with scene duration (default 7s baseline).
  const beat2 = dur * (2.2 / 7.0);
  const beat3 = dur * (5.0 / 7.0);
  const inBeat1 = t < beat2;
  const inBeat2 = t >= beat2 && t < beat3;
  const inBeat3 = t >= beat3;

  // ── Beat 1: lines appear above keyboard ──────────────────────────
  const lineCount = 6;
  const lineStaggerSec = (beat2 - 0.2) / lineCount;
  const lineWidths = [0.92, 0.6, 0.85, 0.7, 0.95, 0.55]; // deterministic pseudo-random

  // ── Beat 2: documents stack ──────────────────────────────────────
  const docCount = 4;
  const docDelay = 0.3;

  // ── Beat 3: fall + tomb rise ─────────────────────────────────────
  const tShake = inBeat3 ? Math.min(0.25, t - beat3) : 0;
  const shake = Math.sin(tShake * 60) * (tShake < 0.25 ? 6 * (1 - tShake / 0.25) : 0);
  const fallStart = beat3 + 0.25;
  const fallY = t > fallStart
    ? interpolate(t, [fallStart, fallStart + 0.45], [0, 700], {
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.32, 0, 0.67, 0),
      })
    : 0;
  const tombT = t - (fallStart + 0.15);
  const tombY = tombT > 0
    ? interpolate(tombT, [0, 0.6], [400, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })
    : 400;
  const tombSp = tombT > 0 ? spring({ frame: tombT * fps, fps, config: { damping: 14, mass: 0.5 } }) : 0;
  const haloPulse = tombT > 0
    ? interpolate(tombT, [0, 0.4, 0.8 + (Math.sin(tombT * 4) * 0.5 + 0.5) * 0.4], [0, 1, 0.75], {
        extrapolateRight: "clamp",
      })
    : 0;

  // Stage shake during beat 2 transition (entire stack vibrates)
  const stageTilt = inBeat3 && tShake < 0.25 ? Math.sin(tShake * 40) * 3 : 0;

  // Keyboard
  const kbOpacity = inBeat3
    ? interpolate(t, [beat3, beat3 + 0.3], [1, 0], { extrapolateRight: "clamp" })
    : 1;
  const kbScale = inBeat2
    ? interpolate(t, [beat2, beat2 + 0.4], [1, 0.78], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })
    : 1;
  const kbTranslateY = inBeat2 || inBeat3
    ? interpolate(t, [beat2, beat2 + 0.4], [0, 80], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })
    : 0;

  // Lines fade out at start of beat 2
  const linesFade = inBeat2 || inBeat3
    ? interpolate(t, [beat2, beat2 + 0.3], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      {/* Falling stage: contains keyboard + lines + docs */}
      <div
        style={{
          position: "relative",
          width: 720,
          height: 720,
          transform: `translateY(${fallY}px) rotate(${stageTilt}deg)`,
        }}
      >
        {/* Beat 1 — lines appearing above keyboard */}
        <div style={{ position: "absolute", top: 80, left: 60, right: 60, opacity: linesFade }}>
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineStart = 0.2 + i * lineStaggerSec;
            const lineFade = interpolate(t, [lineStart, lineStart + 0.12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            });
            const slideIn = interpolate(t, [lineStart, lineStart + 0.18], [-30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            });
            return (
              <div
                key={i}
                style={{
                  height: 8,
                  marginBottom: 14,
                  background: COLORS.muted,
                  borderRadius: 4,
                  width: `${lineWidths[i] * 100}%`,
                  opacity: lineFade * 0.85,
                  transform: `translateX(${slideIn}px)`,
                }}
              />
            );
          })}
        </div>

        {/* Beat 2 — document stack centered */}
        {Array.from({ length: docCount }).map((_, i) => {
          const docStart = beat2 + i * docDelay;
          const dt = t - docStart;
          if (dt < 0) return null;
          const sp = spring({ frame: dt * fps, fps, config: { damping: 12, mass: 0.5 } });
          const fade = interpolate(dt, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });
          // tilt + horizontal offset per doc for stack feel
          const tilts = [-4, 3, -2, 5];
          const xs = [-12, 8, 18, -6];
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 240 + i * -8,
                left: "50%",
                transform: `translate(-50%, 0) translate(${xs[i]}px, ${(1 - sp) * -40}px) rotate(${tilts[i] * sp}deg) scale(${sp})`,
                opacity: fade,
              }}
            >
              <Icon name="document" size={200} color={COLORS.accent} />
            </div>
          );
        })}

        {/* Beat 1 + early Beat 2 — keyboard prominent at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: `translateX(-50%) translateY(${kbTranslateY}px) scale(${kbScale})`,
            opacity: kbOpacity,
          }}
        >
          <Icon name="keyboard" size={300} color={COLORS.accent} />
          {/* Tap pulse: two small dots above the keyboard pulsing at 2Hz */}
          {inBeat1 && (
            <div
              style={{
                position: "absolute",
                top: -30,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 32,
              }}
            >
              {[0, 0.25].map((phase, j) => {
                const pulse = (Math.sin((t + phase) * Math.PI * 4) + 1) / 2;
                return (
                  <div
                    key={j}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      background: COLORS.accent,
                      opacity: 0.4 + pulse * 0.6,
                      transform: `scale(${0.7 + pulse * 0.4})`,
                      boxShadow: `0 0 12px rgba(108,227,181,${pulse * 0.6})`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Beat 3 — tomb rises from below in danger color, with halo */}
      {tombT > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: "50%",
            transform: `translateX(-50%) translateY(${tombY}px) scale(${tombSp})`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 480,
              height: 480,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255,62,62,0.4) 0%, transparent 60%)`,
              opacity: haloPulse,
            }}
          />
          <Icon name="tomb" size={300} color={COLORS.danger} />
        </div>
      )}

      {/* Stage shake — apply to whole scene by translating root slightly */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translateX(${shake}px)` }} />
    </AbsoluteFill>
  );
};
