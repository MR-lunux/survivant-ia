import { AbsoluteFill } from "remotion";
import { SlamIn } from "../../components/Signature";
import { Reveal } from "../../components/Reveal";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

type Props = { url: string; handle?: string };

export const CloseURL: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { url, handle = "@survivant.ia" } = props as unknown as Props;

  // Split URL on the first slash so long paths render on a second line
  // and don't overflow the canvas width.
  const slashIdx = url.indexOf("/");
  const hasPath = slashIdx >= 0;
  const domain = hasPath ? url.slice(0, slashIdx) : url;
  const path = hasPath ? url.slice(slashIdx) : "";

  return (
    <AbsoluteFill style={{ padding: "240px 60px 60px 60px", justifyContent: "center", alignItems: "center" }}>
      <SlamIn at={2}>
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 900,
            fontSize: 88,
            color: COLORS.accent,
            letterSpacing: -2,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {domain}
        </div>
        {path && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 30,
              color: COLORS.textSoft,
              letterSpacing: 0.5,
              marginTop: 14,
              textAlign: "center",
              wordBreak: "break-all",
            }}
          >
            {path}
          </div>
        )}
      </SlamIn>
      <Reveal at={20} from="bottom" distance={16}>
        <div
          style={{
            marginTop: 36,
            fontFamily: FONTS.mono,
            fontSize: 22,
            color: COLORS.muted,
            letterSpacing: 1.5,
            textAlign: "center",
          }}
        >
          {handle}
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
