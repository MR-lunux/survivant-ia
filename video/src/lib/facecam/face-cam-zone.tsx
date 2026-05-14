import { OffthreadVideo, staticFile } from "remotion";
import { computeCropTransform } from "./crop";
import type { CropAnchor } from "../schemas";

type Props = {
  src: string;
  inputAspect: "9:16" | "16:9";
  cropAnchor: CropAnchor;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
};

export const FaceCamZone: React.FC<Props> = ({
  src,
  inputAspect,
  cropAnchor,
  width,
  height,
  sourceWidth,
  sourceHeight,
}) => {
  const { scale, translateX, translateY } = computeCropTransform({
    inputAspect,
    cropAnchor,
    sourceWidth,
    sourceHeight,
    targetWidth: width,
    targetHeight: height,
  });

  return (
    <div style={{ width, height, overflow: "hidden", position: "relative" }}>
      <OffthreadVideo
        src={staticFile(src)}
        style={{
          width: sourceWidth,
          height: sourceHeight,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
};
