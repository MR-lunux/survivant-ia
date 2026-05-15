import "./index.css";
import "./lib/loadFonts";
import { Composition } from "remotion";
import { FaceCam } from "./videos/FaceCam";
import { facecamMetadata } from "./videos/facecam-metadata";
import { Carousel } from "./carousel/Carousel";
import { cycleTemplate } from "./carousel/data/cycle-template";
import { cycleDictee } from "./carousel/data/cycle-dictee";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FaceCam"
        component={FaceCam as React.FC<Record<string, unknown>>}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ episodeId: "_demo-10s" }}
        calculateMetadata={facecamMetadata as never}
      />

      <Composition
        id="Carousel-Template"
        component={Carousel}
        durationInFrames={8}
        fps={1}
        width={1080}
        height={1350}
        defaultProps={{ cycle: cycleTemplate }}
      />

      <Composition
        id="Carousel-Dictee"
        component={Carousel}
        durationInFrames={8}
        fps={1}
        width={1080}
        height={1350}
        defaultProps={{ cycle: cycleDictee }}
      />
    </>
  );
};
