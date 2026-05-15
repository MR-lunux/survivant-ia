import "./index.css";
import { Composition } from "remotion";
import { VIDEO } from "./lib/theme";
import { RapportTerminal } from "./videos/RapportTerminal";
import { Storytime } from "./videos/Storytime";
import { TestDiagnostic } from "./videos/TestDiagnostic";
import { FaceCam } from "./videos/FaceCam";
import { facecamMetadata } from "./videos/facecam-metadata";
import {
  RapportTerminalSchema,
  rapportTerminalDefaults,
  StorytimeSchema,
  storytimeDefaults,
  TestDiagnosticSchema,
  testDiagnosticDefaults,
} from "./lib/schemas";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RapportTerminal"
        component={RapportTerminal}
        durationInFrames={900}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        schema={RapportTerminalSchema}
        defaultProps={rapportTerminalDefaults}
      />
      <Composition
        id="Storytime"
        component={Storytime}
        durationInFrames={1452}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        schema={StorytimeSchema}
        defaultProps={storytimeDefaults}
      />
      <Composition
        id="TestDiagnostic"
        component={TestDiagnostic}
        durationInFrames={1200}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        schema={TestDiagnosticSchema}
        defaultProps={testDiagnosticDefaults}
      />
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
