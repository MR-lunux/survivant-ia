import { OffthreadVideo, staticFile } from "remotion";
import { computeCropTransform } from "./crop";
import type { CropAnchor } from "../schemas";

export type FaceTrackPoint = { t: number; cx: number; cy: number; h?: number };

// Eye position is roughly 25% from the top of the MediaPipe face bbox.
// To center on eyes, shift the crop center UPWARD by 25% of bbox height.
const EYE_BIAS_FRACTION = 0.25;

type Props = {
  src: string;
  inputAspect: "9:16" | "16:9";
  cropAnchor: CropAnchor;
  faceTrack?: FaceTrackPoint[];
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
};

function meanCenter(track: FaceTrackPoint[]): { cx: number; cy: number } {
  let sumCx = 0, sumCy = 0, sumH = 0, nH = 0;
  for (const p of track) {
    sumCx += p.cx;
    sumCy += p.cy;
    if (typeof p.h === "number") {
      sumH += p.h;
      nH++;
    }
  }
  const cx = sumCx / track.length;
  const cy = sumCy / track.length;
  const meanH = nH > 0 ? sumH / nH : 0;
  // Bias upward toward eyes (eyes ~25% from top of bbox = 25% above bbox center)
  return { cx, cy: cy - meanH * EYE_BIAS_FRACTION };
}

function staticTransformFromFaceCenter(
  inputAspect: "9:16" | "16:9",
  cx: number,
  cy: number,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): { scale: number; translateX: number; translateY: number } {
  if (inputAspect === "9:16") {
    const scale = targetWidth / sourceWidth;
    const ty = targetHeight / 2 - cy * scale;
    const minTy = -(sourceHeight * scale - targetHeight);
    return { scale, translateX: 0, translateY: Math.max(minTy, Math.min(0, ty)) };
  }
  const scale = targetHeight / sourceHeight;
  const tx = targetWidth / 2 - cx * scale;
  const minTx = -(sourceWidth * scale - targetWidth);
  return { scale, translateX: Math.max(minTx, Math.min(0, tx)), translateY: 0 };
}

export const FaceCamZone: React.FC<Props> = ({
  src,
  inputAspect,
  cropAnchor,
  faceTrack,
  width,
  height,
  sourceWidth,
  sourceHeight,
}) => {
  // Static averaged crop: compute mean face center once, no per-frame movement.
  // Dynamic tracking caused nausea-inducing jitter for talking-head selfies.
  const transform = faceTrack && faceTrack.length > 0
    ? (() => {
        const { cx, cy } = meanCenter(faceTrack);
        return staticTransformFromFaceCenter(inputAspect, cx, cy, sourceWidth, sourceHeight, width, height);
      })()
    : computeCropTransform({
        inputAspect,
        cropAnchor,
        sourceWidth,
        sourceHeight,
        targetWidth: width,
        targetHeight: height,
      });

  const { scale, translateX, translateY } = transform;

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
