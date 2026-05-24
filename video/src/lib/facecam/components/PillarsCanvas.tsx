import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../../theme";

export const PILLARS = [
  { key: "role",        label: "RÔLE",       hint: "Qui l'IA doit-elle incarner" },
  { key: "tache",       label: "TÂCHE",      hint: "Ce qu'elle doit faire, précisément" },
  { key: "contexte",    label: "CONTEXTE",   hint: "Pourquoi, pour qui" },
  { key: "contraintes", label: "CONTRAINTES", hint: "Ce qu'elle ne doit pas faire" },
  { key: "format",      label: "FORMAT",     hint: "Ton, structure, longueur" },
  { key: "exemple",     label: "EXEMPLE",    hint: "À quoi tu t'attends" },
] as const;

type Props = {
  visiblePillars: number;       // 0-6
  highlight?: number | null;    // 1-6, null = none
  mode?: "normal" | "saturated" | "breached";
  /** When the scene mounts globally in the timeline, used for reveal stagger. */
  sceneStartFrame?: number;
};

export const PillarsCanvas: React.FC<Props> = ({
  visiblePillars,
  highlight = null,
  mode = "normal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isBreached = mode === "breached";
  const isSaturated = mode === "saturated";

  // Subtle vibration in saturated mode
  const shakeX = isSaturated ? Math.sin(frame * 0.6) * 2 : 0;
  const shakeY = isSaturated ? Math.cos(frame * 0.55) * 1.5 : 0;

  // Red overlay breath in breached mode
  const breachAlpha = isBreached
    ? interpolate(Math.sin(frame * 0.3), [-1, 1], [0.15, 0.55])
    : 0;

  return (
    <AbsoluteFill style={{ padding: 60, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "repeat(3, auto)",
          gap: 16,
          width: "100%",
          maxWidth: 900,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        {PILLARS.map((p, idx) => {
          const i = idx + 1;
          const isVisible = i <= visiblePillars;
          const isHighlighted = highlight === i;

          // Spring-in when first revealed
          const revealSpring = isVisible
            ? spring({ frame: Math.max(0, frame - idx * 4), fps, config: { damping: 14 } })
            : 0;

          const scale = isHighlighted ? 1.08 : 1.0;
          const borderColor = isHighlighted ? COLORS.accent : COLORS.hairlineStrong;

          return (
            <div
              key={p.key}
              style={{
                opacity: revealSpring,
                transform: `scale(${scale * revealSpring + (1 - revealSpring) * 0.92})`,
                border: `1px solid ${borderColor}`,
                background: isHighlighted ? COLORS.surface : "transparent",
                padding: "18px 22px",
                position: "relative",
              }}
            >
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 14,
                letterSpacing: "0.18em",
                color: COLORS.accent,
                marginBottom: 6,
              }}>
                {String(i).padStart(2, "0")} · {p.label}
              </div>
              <div style={{
                fontFamily: FONTS.sans,
                fontSize: 20,
                color: COLORS.textSoft,
                lineHeight: 1.3,
              }}>
                {p.hint}
              </div>
            </div>
          );
        })}
      </div>

      {/* Breach overlay */}
      {isBreached && (
        <AbsoluteFill style={{
          background: `rgba(255, 62, 62, ${breachAlpha})`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }} />
      )}
    </AbsoluteFill>
  );
};
