// src/lib/score/presets/index.ts
import type { PresetDefinition, PresetName } from "../types";
import { zimmerTense } from "./zimmer-tense";
import { eightBitNostalgic } from "./8bit-nostalgic";
import { zimmerUematsu } from "./zimmer-uematsu";

export const PRESETS: Record<PresetName, PresetDefinition> = {
  "zimmer-tense": zimmerTense,
  "8bit-nostalgic": eightBitNostalgic,
  "zimmer-uematsu": zimmerUematsu,
};
