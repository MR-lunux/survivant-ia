import { PillarsCanvas } from "../components/PillarsCanvas";
import type { SceneCommonProps } from "./types";

type Props = {
  visiblePillars: number;
  highlight?: number | null;
};

export const PillarsBuild: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ props }) => {
  const p = props as unknown as Props;
  return (
    <PillarsCanvas
      visiblePillars={p.visiblePillars}
      highlight={p.highlight ?? null}
      mode="normal"
    />
  );
};
