import { describe, it, expect } from "vitest";
import { computeCropTransform } from "../crop";

describe("computeCropTransform", () => {
  it("9:16 top anchor: keeps top half of source", () => {
    const t = computeCropTransform({
      inputAspect: "9:16",
      cropAnchor: "top",
      sourceWidth: 1080,
      sourceHeight: 1920,
      targetWidth: 1080,
      targetHeight: 960,
    });
    expect(t.scale).toBeCloseTo(1, 5);
    expect(t.translateY).toBeCloseTo(0, 5);
    expect(t.translateX).toBeCloseTo(0, 5);
  });

  it("9:16 center anchor: centers vertically", () => {
    const t = computeCropTransform({
      inputAspect: "9:16",
      cropAnchor: "center",
      sourceWidth: 1080,
      sourceHeight: 1920,
      targetWidth: 1080,
      targetHeight: 960,
    });
    expect(t.translateY).toBeCloseTo(-480, 0);
  });

  it("9:16 custom anchor y=0.3", () => {
    const t = computeCropTransform({
      inputAspect: "9:16",
      cropAnchor: { y: 0.3 },
      sourceWidth: 1080,
      sourceHeight: 1920,
      targetWidth: 1080,
      targetHeight: 960,
    });
    expect(t.translateY).toBeCloseTo(-288, 0);
  });

  it("16:9 center: scales to fill target height, crops sides", () => {
    const t = computeCropTransform({
      inputAspect: "16:9",
      cropAnchor: "center",
      sourceWidth: 1920,
      sourceHeight: 1080,
      targetWidth: 1080,
      targetHeight: 960,
    });
    expect(t.scale).toBeCloseTo(0.889, 2);
    expect(t.translateX).toBeCloseTo(-313, 0);
  });
});
