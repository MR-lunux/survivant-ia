import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing, Img, staticFile } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  iconSrc: string; // public-relative path, e.g. "facecam-icons/brain.svg"
  label: string;
};

export const IconReveal: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { iconSrc, label } = props as unknown as Props;

  const sp = spring({ frame, fps, config: { damping: 14, mass: 0.5 } });
  const rot = interpolate(sp, [0, 1], [-3, 0]);
  const fade = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const labelFade = interpolate(frame, [10, 18], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "center" }}>
      <Img
        src={staticFile(iconSrc)}
        style={{
          width: 280,
          height: 280,
          opacity: fade,
          transform: `scale(${sp}) rotate(${rot}deg)`,
        }}
      />
      <div
        style={{
          marginTop: 32,
          fontFamily: FONTS.sans,
          fontSize: 44,
          textTransform: "uppercase",
          color: COLORS.text,
          letterSpacing: -0.5,
          opacity: labelFade,
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
