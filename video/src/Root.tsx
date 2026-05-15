import "./index.css";
import { Composition } from "remotion";
import { FaceCam } from "./videos/FaceCam";
import { facecamMetadata } from "./videos/facecam-metadata";

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
    </>
  );
};
