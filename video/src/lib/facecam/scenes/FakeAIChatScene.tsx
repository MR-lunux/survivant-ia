import { FakeChatFrame } from "../components/FakeChatFrame";
import type { SceneCommonProps } from "./types";

type Props = {
  mode: "glitch" | "spam" | "neutral";
  promptText: string;
  outputLines: string[];
  emojiBurst?: boolean;
  typeSpeed?: number;
};

export const FakeAIChatScene: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const p = props as unknown as Props;
  return (
    <FakeChatFrame
      promptText={p.promptText}
      outputLines={p.outputLines}
      mode={p.mode}
      emojiBurst={p.emojiBurst ?? false}
      typeSpeed={p.typeSpeed}
    />
  );
};
