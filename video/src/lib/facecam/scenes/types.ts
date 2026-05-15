export type SceneCommonProps = {
  durationFrames: number;
  tStart: number; // scene's start in the global timeline (seconds)
};

export type WordCue = { word: string; anchor: number; emphasis?: boolean };
