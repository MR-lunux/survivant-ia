import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES } from "../lib/facecam/scenes";
import { FaceCamZone, type FaceTrackPoint } from "../lib/facecam/face-cam-zone";
import { HairlinePulse } from "../lib/facecam/hairline-pulse";
import { AmbientLayer } from "../lib/facecam/ambient-layer";
import { Captions, type Caption } from "../lib/facecam/captions";
import { BaseBg } from "../lib/components/Background";
import { ParticleBackground } from "../lib/components/ParticleBackground";
import type { FaceCamTimeline, CropAnchor } from "../lib/schemas";

type Props = FaceCamTimeline & {
  cutVideoSrc: string;
  sourceWidth: number;
  sourceHeight: number;
  faceTrack?: FaceTrackPoint[];
  captions?: Caption[];
};

export const FaceCam: React.FC<Props> = ({
  events,
  cutVideoSrc,
  inputAspect,
  cropAnchor,
  sourceWidth,
  sourceHeight,
  faceTrack,
  captions,
}) => {
  const { fps, width, height } = useVideoConfig();
  const motionHeight = height / 2; // 960
  const faceHeight = height / 2;

  // Hide the split hairline whenever a scene paints over the full canvas
  // (SlamPayoff, or ToolReplayScene phase=output) — the bar makes no sense there.
  const frame = useCurrentFrame();
  const currentTime = frame / fps;
  const activeEvent = events.find((e) => currentTime >= e.tStart && currentTime < e.tEnd);
  const phase = activeEvent?.props?.phase as string | undefined;
  const isFullScreenScene =
    activeEvent?.scene === "SlamPayoff" ||
    (activeEvent?.scene === "ToolReplayScene" && phase === "output");

  return (
    <AbsoluteFill style={{ backgroundColor: "#0F0F0E" }}>
      <BaseBg />
      {/* Particles at root: full canvas, naturally covered in bottom half by face cam.
          Putting them inside the top-half wrapper would squish the canvas vertically. */}
      <ParticleBackground />

      {/* Top half: ambient (grain + accent dot) + scenes */}
      <AbsoluteFill style={{ height: motionHeight }}>
        <AmbientLayer heightPx={motionHeight} />
        {events.map((evt, i) => {
          const Scene = SCENES[evt.scene];
          if (!Scene) return null;
          const from = Math.round(evt.tStart * fps);
          const dur = Math.round((evt.tEnd - evt.tStart) * fps);
          return (
            <Sequence key={i} from={from} durationInFrames={dur} layout="none">
              <AbsoluteFill style={{ height: motionHeight }}>
                <Scene durationFrames={dur} tStart={evt.tStart} props={evt.props} />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Bottom half: face cam */}
      <AbsoluteFill style={{ top: motionHeight, height: faceHeight }}>
        <FaceCamZone
          src={cutVideoSrc}
          inputAspect={inputAspect}
          cropAnchor={cropAnchor as CropAnchor}
          faceTrack={faceTrack}
          width={width}
          height={faceHeight}
          sourceWidth={sourceWidth}
          sourceHeight={sourceHeight}
        />
      </AbsoluteFill>

      {/* Hairline separator: rendered LAST so it sits on top of the face cam zone.
          Hidden during full-screen overlay scenes (SlamPayoff, ToolReplayScene output). */}
      {!isFullScreenScene && <HairlinePulse topPx={motionHeight} />}

      {/* Burned-in captions for silent viewing. Positioned in the top of the face
          cam zone so they don't conflict with TikTok's bottom UI. */}
      {captions && captions.length > 0 && (
        <Captions captions={captions} topPx={motionHeight + 40} />
      )}
    </AbsoluteFill>
  );
};
