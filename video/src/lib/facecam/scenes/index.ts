import type { FC } from "react";
import type { SceneCommonProps } from "./types";

export type SceneComponent = FC<SceneCommonProps & { props: Record<string, unknown> }>;
// SceneCommonProps includes: durationFrames, tStart, props

import { KickerOpening } from "./KickerOpening";
import { WordBeat } from "./WordBeat";
import { BigStat } from "./BigStat";
import { ConceptCard } from "./ConceptCard";
import { ItalicMoment } from "./ItalicMoment";
import { IconReveal } from "./IconReveal";
import { QuoteFrame } from "./QuoteFrame";
import { HairlineDivider } from "./HairlineDivider";
import { CloseURL } from "./CloseURL";

export const SCENES: Record<string, SceneComponent> = {
  KickerOpening,
  WordBeat,
  BigStat,
  ConceptCard,
  ItalicMoment,
  IconReveal,
  QuoteFrame,
  HairlineDivider,
  CloseURL,
};
