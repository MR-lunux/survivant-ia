import type { CropAnchor } from "../schemas";

export type CropTransform = {
  scale: number;
  translateX: number;
  translateY: number;
};

export type CropInput = {
  inputAspect: "9:16" | "16:9";
  cropAnchor: CropAnchor;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
};

function anchorToFraction(a: CropAnchor): number {
  if (typeof a === "object") return a.y;
  if (a === "top") return 0;
  if (a === "bottom") return 1;
  return 0.5;
}

export function computeCropTransform(input: CropInput): CropTransform {
  const { inputAspect, cropAnchor, sourceWidth, sourceHeight, targetWidth, targetHeight } = input;

  if (inputAspect === "9:16") {
    const scale = targetWidth / sourceWidth;
    const scaledHeight = sourceHeight * scale;
    const yFrac = anchorToFraction(cropAnchor);
    const translateY = -(scaledHeight - targetHeight) * yFrac;
    return { scale, translateX: 0, translateY };
  }

  // 16:9 — scale to fill target height, crop sides
  const scale = targetHeight / sourceHeight;
  const scaledWidth = sourceWidth * scale;
  const translateX = -(scaledWidth - targetWidth) / 2;
  return { scale, translateX, translateY: 0 };
}
