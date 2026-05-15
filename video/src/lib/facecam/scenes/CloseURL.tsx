import { AbsoluteFill } from "remotion";
import { SlamIn } from "../../components/Signature";
import { Reveal } from "../../components/Reveal";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = { url: string; handle?: string };

export const CloseURL: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { url, handle = "@survivant.ia" } = props as unknown as Props;
  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "center" }}>
      <SlamIn at={2}>
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 900,
            fontSize: 92,
            color: COLORS.accent,
            letterSpacing: -2,
          }}
        >
          {url}
        </div>
      </SlamIn>
      <Reveal at={20} from="bottom" distance={16}>
        <div
          style={{
            marginTop: 24,
            fontFamily: FONTS.mono,
            fontSize: 26,
            color: COLORS.muted,
            letterSpacing: 1.5,
          }}
        >
          {handle}
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
