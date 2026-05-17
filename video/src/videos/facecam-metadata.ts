import type { CalculateMetadataFunction } from "remotion";
import { staticFile } from "remotion";
import { parseTimeline } from "../lib/facecam/timeline-loader";
import type { FaceTrackPoint } from "../lib/facecam/face-cam-zone";
import type { Caption } from "../lib/facecam/captions";

type Input = { episodeId: string };

export const facecamMetadata: CalculateMetadataFunction<Input> = async ({ props }) => {
  const url = staticFile(`facecam-data/${props.episodeId}.timeline.json`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Missing timeline at ${url} (status ${res.status}). Run: node scripts/sync-timeline.mjs ${props.episodeId}`,
    );
  }
  const raw = await res.json();
  const timeline = parseTimeline(raw);

  // Optional face-track: if facecam-data/<id>.face-track.json exists in public, use it
  // for dynamic crop offset. Falls back to static cropAnchor when absent.
  let faceTrack: FaceTrackPoint[] | undefined;
  let trackSourceDims: { w: number; h: number } | undefined;
  try {
    const trackUrl = staticFile(`facecam-data/${props.episodeId}.face-track.json`);
    const trackRes = await fetch(trackUrl);
    if (trackRes.ok) {
      const trackRaw = (await trackRes.json()) as { width: number; height: number; track: FaceTrackPoint[] };
      if (Array.isArray(trackRaw.track) && trackRaw.track.length > 0) {
        faceTrack = trackRaw.track;
        trackSourceDims = { w: trackRaw.width, h: trackRaw.height };
      }
    }
  } catch {
    // no track, falls back to static cropAnchor
  }

  // Optional captions: burned-in subtitles for silent viewing
  let captions: Caption[] | undefined;
  try {
    const capUrl = staticFile(`facecam-data/${props.episodeId}.captions.json`);
    const capRes = await fetch(capUrl);
    if (capRes.ok) {
      const capRaw = (await capRes.json()) as Caption[];
      if (Array.isArray(capRaw) && capRaw.length > 0) {
        captions = capRaw;
      }
    }
  } catch {
    // no captions, scene runs caption-free
  }

  // Resolve cut mp4 path (apply-cuts produces .cut.mp4)
  const cutPath = `facecam-raws/${props.episodeId}.cut.mp4`;
  // Source dims: prefer face-track dims (definitive, measured by Python), then timeline
  // override, then a default based on inputAspect.
  const sourceWidth = trackSourceDims?.w ?? timeline.sourceDims?.w ?? (timeline.inputAspect === "9:16" ? 1080 : 1920);
  const sourceHeight = trackSourceDims?.h ?? timeline.sourceDims?.h ?? (timeline.inputAspect === "9:16" ? 1920 : 1080);

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
      faceTrack,
      captions,
    } as unknown as Input,
  };
};
