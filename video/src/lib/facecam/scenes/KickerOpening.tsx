import { AbsoluteFill } from "remotion";
import { KickerSpin } from "../../components/KickerSpin";
import { SignatureItalic } from "../../components/Signature";
import { Reveal } from "../../components/Reveal";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  kicker: string;
  line: string;
  signature: string;
};

export const KickerOpening: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { kicker, line, signature } = props as unknown as Props;
  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "flex-start", alignItems: "flex-start" }}>
      <KickerSpin label={kicker} />
      <Reveal at={6} from="bottom" distance={28}>
        <div
          style={{
            marginTop: 80,
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 78,
            letterSpacing: -1,
            textTransform: "uppercase",
            color: COLORS.text,
            lineHeight: 1.02,
          }}
        >
          {line}
        </div>
      </Reveal>
      <SignatureItalic text={signature} at={18} fontSize={72} />
    </AbsoluteFill>
  );
};
