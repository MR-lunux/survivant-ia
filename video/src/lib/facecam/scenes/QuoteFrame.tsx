import { AbsoluteFill } from "remotion";
import { Reveal } from "../../components/Reveal";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = { quote: string; attribution: string };

export const QuoteFrame: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { quote, attribution } = props as unknown as Props;
  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "flex-start" }}>
      <Reveal at={2} from="bottom" distance={18}>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: 200,
            color: COLORS.accent,
            lineHeight: 0.5,
            marginBottom: 12,
          }}
        >
          &ldquo;
        </div>
      </Reveal>
      <Reveal at={8} from="bottom" distance={22}>
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 500,
            fontSize: 56,
            color: COLORS.text,
            lineHeight: 1.15,
            maxWidth: 880,
          }}
        >
          {quote}
        </div>
      </Reveal>
      <Reveal at={18} from="bottom" distance={14}>
        <div
          style={{
            marginTop: 32,
            fontFamily: FONTS.mono,
            fontSize: 22,
            color: COLORS.muted,
            letterSpacing: 1.5,
          }}
        >
          — {attribution}
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
