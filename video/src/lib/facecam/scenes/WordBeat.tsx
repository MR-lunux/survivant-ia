import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps, WordCue } from "./types";

type Props = {
  words: WordCue[];
  size?: "huge" | "lg" | "md";
};

const SIZE_PX = { huge: 110, lg: 78, md: 54 };

export const WordBeat: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ tStart, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { words, size = "lg" } = props as unknown as Props;
  const fontSize = SIZE_PX[size];

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, maxWidth: 920 }}>
        {words.map((w, i) => {
          const enterFrame = Math.round((w.anchor - tStart) * fps);
          const t = frame - enterFrame;
          if (t < 0) return null;
          const sp = spring({ frame: t, fps, config: { damping: 14, mass: 0.5 } });
          const fade = interpolate(t, [0, 4], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
          const scale = w.emphasis ? interpolate(sp, [0, 0.7, 1], [0.85, 1.08, 1]) : sp;
          const color = w.emphasis ? COLORS.accent : COLORS.text;
          const fontStyle = w.emphasis ? "italic" : "normal";
          const family = w.emphasis ? FONTS.serif : FONTS.sans;
          return (
            <span
              key={i}
              style={{
                fontFamily: family,
                fontStyle,
                fontWeight: 800,
                fontSize,
                letterSpacing: -1,
                textTransform: w.emphasis ? "none" : "uppercase",
                color,
                opacity: fade,
                transform: `scale(${scale})`,
                transformOrigin: "left center",
                lineHeight: 1.05,
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
