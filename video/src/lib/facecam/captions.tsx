import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../theme";

export type CaptionWord = { text: string; start: number; end: number };
export type Caption = { start: number; end: number; words: CaptionWord[] };

type Props = {
  captions: Caption[];
  topPx: number;
};

// Burned-in captions with karaoke-style highlighting. Active word lights up in
// menthe accent, prior/coming words stay cream. Forced single line via nowrap.

export const Captions: React.FC<Props> = ({ captions, topPx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = captions.find((c) => t >= c.start && t <= c.end);
  if (!active) return null;

  const localT = t - active.start;
  const dur = active.end - active.start;
  // Clamp fade in/out so they fit even for very short captions (e.g. "non" at 0.22s)
  const fadeIn = Math.min(0.12, dur * 0.3);
  const fadeOut = Math.min(0.1, dur * 0.3);
  const fade = interpolate(
    localT,
    [0, fadeIn, dur - fadeOut, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) },
  );
  const rise = interpolate(
    localT,
    [0, Math.min(0.18, dur * 0.4)],
    [10, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) },
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 9999 }}>
      <div
        style={{
          position: "absolute",
          top: topPx,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          padding: "0 40px",
          opacity: fade,
          transform: `translateY(${rise}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(15, 15, 14, 0.88)",
            padding: "18px 30px",
            borderRadius: 10,
            border: `1px solid rgba(232, 229, 221, 0.10)`,
            fontFamily: FONTS.sans,
            fontSize: 42,
            fontWeight: 700,
            color: COLORS.text,
            textAlign: "center",
            lineHeight: 1.18,
            letterSpacing: -0.3,
            whiteSpace: "nowrap",
          }}
        >
          {active.words.map((w, i) => {
            // Karaoke progressive: word lights up in menthe when t reaches w.start
            // and stays accent for the rest of the phrase. Future words sit dim cream.
            const isActiveOrPassed = t >= w.start;
            const color = isActiveOrPassed ? COLORS.accent : COLORS.text;
            const opacity = isActiveOrPassed ? 1 : 0.5;
            return (
              <span key={i} style={{ color, opacity }}>
                {w.text}
                {i < active.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
