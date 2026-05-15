import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { SCENES } from "../lib/facecam/scenes";
import { FaceCamZone } from "../lib/facecam/face-cam-zone";
import { HairlinePulse } from "../lib/facecam/hairline-pulse";
import { AmbientLayer } from "../lib/facecam/ambient-layer";
import { BaseBg } from "../lib/components/Background";
import type { FaceCamTimeline, CropAnchor } from "../lib/schemas";

type Props = FaceCamTimeline & {
  cutVideoSrc: string;
  sourceWidth: number;
  sourceHeight: number;
};

export const FaceCam: React.FC<Props> = ({
  events,
  cutVideoSrc,
  inputAspect,
  cropAnchor,
  sourceWidth,
  sourceHeight,
}) => {
  const { fps, width, height } = useVideoConfig();
  const motionHeight = height / 2; // 960
  const faceHeight = height / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0F0F0E" }}>
      <BaseBg />

      {/* Top half: motion design + ambient + scenes */}
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

      {/* Hairline separator at y=motionHeight */}
      <HairlinePulse topPx={motionHeight} />

      {/* Bottom half: face cam */}
      <AbsoluteFill style={{ top: motionHeight, height: faceHeight }}>
        <FaceCamZone
          src={cutVideoSrc}
          inputAspect={inputAspect}
          cropAnchor={cropAnchor as CropAnchor}
          width={width}
          height={faceHeight}
          sourceWidth={sourceWidth}
          sourceHeight={sourceHeight}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
