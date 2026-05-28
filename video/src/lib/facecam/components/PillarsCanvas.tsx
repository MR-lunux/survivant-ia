import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";

export const PILLARS = [
  { key: "role",        label: "RÔLE",        hint: "qui l'IA doit-elle incarner" },
  { key: "tache",       label: "TÂCHE",       hint: "ce qu'elle doit faire, précisément" },
  { key: "contexte",    label: "CONTEXTE",    hint: "pourquoi, pour qui" },
  { key: "contraintes", label: "CONTRAINTES", hint: "ce qu'elle ne doit pas faire" },
  { key: "format",      label: "FORMAT",      hint: "ton, structure, longueur" },
  { key: "exemple",     label: "EXEMPLE",     hint: "à quoi tu t'attends" },
] as const;

type Props = {
  visiblePillars: number;
  highlight?: number | null;
  mode?: "normal" | "saturated" | "breached";
};

type CellState = "hidden" | "revealing" | "revealed";

function getCellState(i: number, visiblePillars: number, highlight: number | null): CellState {
  if (i > visiblePillars) return "hidden";
  if (i === highlight) return "revealing";
  return "revealed";
}

function Cell({
  index,
  pillar,
  state,
  frame,
  fps,
}: {
  index: number;
  pillar: (typeof PILLARS)[number];
  state: CellState;
  frame: number;
  fps: number;
}) {
  const isRevealing = state === "revealing";
  const isVisible = state !== "hidden";

  const revealSpring = isRevealing
    ? spring({ frame, fps, config: { damping: 12, stiffness: 150 } })
    : isVisible
      ? 1
      : 0;

  // Border & number color
  const borderColor = isRevealing
    ? COLORS.accent
    : isVisible
      ? COLORS.hairlineStrong
      : COLORS.hairline;
  const numberColor = isRevealing
    ? COLORS.accent
    : isVisible
      ? COLORS.textSoft
      : COLORS.dim;
  const numberOpacity = isRevealing ? 1 : isVisible ? 1 : 0.55;

  // Pulse on active border
  const pulse = interpolate(Math.sin(frame * 0.22), [-1, 1], [0.5, 1]);
  const borderGlow = isRevealing
    ? `0 0 ${18 * pulse}px ${COLORS.accent}, inset 0 0 ${10 * pulse}px ${COLORS.accentSoft}`
    : "none";

  // Content slide-up + fade for label + hint
  const contentSlide = (1 - revealSpring) * 18;

  return (
    <div
      style={{
        position: "relative",
        border: `1px solid ${borderColor}`,
        background: isRevealing ? "rgba(20, 20, 15, 0.85)" : "rgba(20, 20, 15, 0.35)",
        padding: "16px 18px",
        boxShadow: borderGlow,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 0,
      }}
    >
      {/* Top row: number + label or placeholder */}
      <div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 14,
            letterSpacing: "0.18em",
            color: numberColor,
            opacity: numberOpacity,
            marginBottom: 6,
          }}
        >
          {String(index).padStart(2, "0")}
        </div>

        {isVisible ? (
          <div
            style={{
              fontFamily: FONTS.sans,
              fontWeight: 800,
              fontSize: 30,
              color: isRevealing ? COLORS.accent : COLORS.text,
              letterSpacing: -0.5,
              textTransform: "uppercase",
              lineHeight: 1.05,
              opacity: revealSpring,
              transform: `translateY(${contentSlide}px)`,
            }}
          >
            {pillar.label}
          </div>
        ) : (
          // Placeholder hairline where the label would be
          <div
            style={{
              width: "55%",
              height: 2,
              background: COLORS.hairlineStrong,
              opacity: 0.35,
              marginTop: 10,
            }}
          />
        )}
      </div>

      {/* Bottom: hint or placeholder */}
      {isVisible ? (
        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: "italic",
            fontSize: 22,
            color: COLORS.textSoft,
            lineHeight: 1.25,
            marginTop: 10,
            opacity: revealSpring,
            transform: `translateY(${contentSlide}px)`,
          }}
        >
          {pillar.hint}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
          <div style={{ width: "85%", height: 1, background: COLORS.hairline }} />
          <div style={{ width: "60%", height: 1, background: COLORS.hairline }} />
        </div>
      )}
    </div>
  );
}

export const PillarsCanvas: React.FC<Props> = ({
  visiblePillars,
  highlight = null,
  mode = "normal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isSaturated = mode === "saturated";
  const isBreached = mode === "breached";
  const shakeX = isSaturated ? Math.sin(frame * 0.6) * 2 : 0;
  const shakeY = isSaturated ? Math.cos(frame * 0.55) * 1.5 : 0;
  const breachAlpha = isBreached
    ? interpolate(Math.sin(frame * 0.3), [-1, 1], [0.15, 0.55])
    : 0;

  return (
    <AbsoluteFill>
      <div
        style={{
          padding: "260px 50px 60px 50px",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            gap: 18,
            width: "100%",
            height: "100%",
          }}
        >
          {PILLARS.map((p, idx) => {
            const i = idx + 1;
            const state = getCellState(i, visiblePillars, highlight);
            return (
              <Cell
                key={p.key}
                index={i}
                pillar={p}
                state={state}
                frame={frame}
                fps={fps}
              />
            );
          })}
        </div>
      </div>

      {isBreached && (
        <AbsoluteFill
          style={{
            background: `rgba(255, 62, 62, ${breachAlpha})`,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
