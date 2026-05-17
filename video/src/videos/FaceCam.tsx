import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
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

// Wraps each scene's Sequence with fade-in (6 frames) + fade-out (10 frames)
// and a subtle scale dance (1.0 → 1.0 → 0.98) on the way out, so transitions
// between scenes feel alive instead of jump-cut.
const SceneFade: React.FC<{ durationFrames: number; children: React.ReactNode }> = ({ durationFrames, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 6, durationFrames - 10, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) },
  );
  const scale = interpolate(
    frame,
    [0, 6, durationFrames - 10, durationFrames],
    [0.98, 1.0, 1.0, 0.98],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) },
  );
  return (
    <div style={{ width: "100%", height: "100%", opacity, transform: `scale(${scale})`, transformOrigin: "center" }}>
      {children}
    </div>
  );
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
  // Split shifted DOWN to give burned-in CapCut captions room above the hairline.
  // 1080×1080 motion / 1080×840 face cam (instead of 50/50) = +120px breathing
  // room for captions positioned at the top of the source video.
  const motionHeight = 1080;
  const faceHeight = height - motionHeight; // 840

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
                <SceneFade durationFrames={dur}>
                  <Scene durationFrames={dur} tStart={evt.tStart} props={evt.props} />
                </SceneFade>
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
          Otherwise the face cam wrapper (top: motionHeight) starts at y=motionHeight
          and visually covers the 1px line at that exact y. */}
      <HairlinePulse topPx={motionHeight} />

      {/* Burned-in captions for silent viewing. Positioned in the top of the face
          cam zone so they don't conflict with TikTok's bottom UI. */}
      {captions && captions.length > 0 && (
        <Captions captions={captions} topPx={motionHeight + 40} />
      )}
    </AbsoluteFill>
  );
};
