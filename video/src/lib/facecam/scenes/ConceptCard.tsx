import { AbsoluteFill } from "remotion";
import { HairlineCard } from "../../components/Hairline";
import { Reveal } from "../../components/Reveal";
import { SignatureItalic } from "../../components/Signature";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = {
  kicker: string;
  lines: string[];
  closeItalic?: string;
};

export const ConceptCard: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { kicker, lines, closeItalic } = props as unknown as Props;
  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "flex-start" }}>
      <HairlineCard padding={40} style={{ maxWidth: 920 }}>
        <Reveal at={2} from="bottom" distance={20}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 22,
              color: COLORS.muted,
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 28,
            }}
          >
            {kicker}
          </div>
        </Reveal>
        {lines.map((line, i) => (
          <Reveal key={i} at={8 + i * 4} from="bottom" distance={20}>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontWeight: 800,
                fontSize: 56,
                textTransform: "uppercase",
                color: COLORS.text,
                letterSpacing: -0.5,
                lineHeight: 1.1,
                marginTop: i === 0 ? 0 : 12,
              }}
            >
              {line}
            </div>
          </Reveal>
        ))}
        {closeItalic && <SignatureItalic text={closeItalic} at={8 + lines.length * 4 + 4} fontSize={52} />}
      </HairlineCard>
    </AbsoluteFill>
  );
};
