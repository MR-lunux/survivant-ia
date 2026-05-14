import { AbsoluteFill } from "remotion";
import { SignatureItalic } from "../../components/Signature";
import type { SceneCommonProps } from "./types";

type Props = { text: string; fontSize?: number };

export const ItalicMoment: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { text, fontSize = 110 } = props as unknown as Props;
  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "flex-start" }}>
      <SignatureItalic text={text} at={4} fontSize={fontSize} />
    </AbsoluteFill>
  );
};
