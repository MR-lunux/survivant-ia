import type { CalculateMetadataFunction } from "remotion";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseTimeline } from "../lib/facecam/timeline-loader";

type Input = { episodeId: string };

export const facecamMetadata: CalculateMetadataFunction<Input> = async ({ props }) => {
  const cwd = process.cwd();
  const path = join(cwd, "facecam-data", `${props.episodeId}.timeline.json`);
  if (!existsSync(path)) {
    throw new Error(`Missing timeline: ${path}`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const timeline = parseTimeline(raw);

  // Resolve cut mp4 path (apply-cuts produces .cut.mp4)
  const cutPath = `facecam-raws/${props.episodeId}.cut.mp4`;
  // For source dimensions, ffprobe is not available at render-side reliably. Default to
  // expected source dims based on inputAspect; override via env if needed.
  const sourceWidth = timeline.inputAspect === "9:16" ? 1080 : 1920;
  const sourceHeight = timeline.inputAspect === "9:16" ? 1920 : 1080;

  return {
    durationInFrames: Math.ceil(timeline.totalDurationSec * 30),
    fps: 30,
    width: 1080,
    height: 1920,
    props: {
      ...timeline,
      cutVideoSrc: cutPath,
      sourceWidth,
      sourceHeight,
    } as unknown as Input,
  };
};
