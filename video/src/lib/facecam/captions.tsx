import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../theme";

export type Caption = { text: string; start: number; end: number };

type Props = {
  captions: Caption[];
  topPx: number; // where to position the caption pill
};

// Burned-in subtitles for silent-viewing TikTok. Renders one phrase at a time,
// centered, on a dark blurred pill that stays readable over any face-cam background.

export const Captions: React.FC<Props> = ({ captions, topPx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = captions.find((c) => t >= c.start && t <= c.end);
  if (!active) return null;

  const localT = t - active.start;
  const dur = active.end - active.start;
  const fade = interpolate(
    localT,
    [0, 0.12, dur - 0.1, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) },
  );
  const rise = interpolate(
    localT,
    [0, 0.18],
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
          padding: "0 60px",
          opacity: fade,
          transform: `translateY(${rise}px)`,
        }}
      >
        <div
          style={{
            maxWidth: 940,
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
          }}
        >
          {active.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
