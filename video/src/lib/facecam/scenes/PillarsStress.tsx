import { PillarsCanvas } from "../components/PillarsCanvas";
import type { SceneCommonProps } from "./types";

type Props = {
  phase: "overload" | "breach";
};

export const PillarsStress: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const { phase } = props as unknown as Props;
  return (
    <PillarsCanvas
      visiblePillars={6}
      highlight={null}
      mode={phase === "overload" ? "saturated" : "breached"}
    />
  );
};
