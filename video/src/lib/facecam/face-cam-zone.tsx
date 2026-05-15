import { OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { computeCropTransform } from "./crop";
import type { CropAnchor } from "../schemas";

export type FaceTrackPoint = { t: number; cx: number; cy: number };

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

function interpolateTrack(track: FaceTrackPoint[], t: number): FaceTrackPoint {
  if (t <= track[0].t) return track[0];
  if (t >= track[track.length - 1].t) return track[track.length - 1];
  for (let i = 1; i < track.length; i++) {
    if (track[i].t >= t) {
      const a = track[i - 1];
      const b = track[i];
      const r = (t - a.t) / (b.t - a.t);
      return { t, cx: a.cx + (b.cx - a.cx) * r, cy: a.cy + (b.cy - a.cy) * r };
    }
  }
  return track[track.length - 1];
}

function dynamicTransformFromFaceTrack(
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
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const transform = faceTrack && faceTrack.length > 0
    ? (() => {
        const { cx, cy } = interpolateTrack(faceTrack, frame / fps);
        return dynamicTransformFromFaceTrack(inputAspect, cx, cy, sourceWidth, sourceHeight, width, height);
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
