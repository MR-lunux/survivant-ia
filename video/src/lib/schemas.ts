// Schémas zod pour le template FaceCam.
// Studio Remotion détecte ces schémas et génère un formulaire dans la sidebar.

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// FaceCam Timeline
// ─────────────────────────────────────────────────────────────────────────────

export const SCENE_NAMES = [
  "KickerOpening",
  "WordBeat",
  "BigStat",
  "ConceptCard",
  "ItalicMoment",
  "IconReveal",
  "QuoteFrame",
  "HairlineDivider",
  "CloseURL",
  "IconBurst",
  "VoiceWaveBars",
  "ProcessFlow",
  "ComptableToTomb",
  "CycleFlow",
  "BrainEmptying",
  "AIComparison",
  "ClockTicking",
  "IdeaToKeyboard",
] as const;

export const TimelineEventSchema = z
  .object({
    tStart: z.number().min(0),
    tEnd: z.number().min(0),
    scene: z.enum(SCENE_NAMES),
    props: z.object({}).passthrough(),
  })
  .refine((e) => e.tEnd > e.tStart, {
    message: "tEnd must be greater than tStart",
  });

export const CropAnchorSchema = z.union([
  z.enum(["top", "center", "bottom"]),
  z.object({ y: z.number().min(0).max(1) }),
]);

export const FaceCamTimelineSchema = z.object({
  episodeId: z.string().min(1),
  inputAspect: z.enum(["9:16", "16:9"]),
  cropAnchor: CropAnchorSchema,
  cuts: z.array(z.object({ from: z.number().min(0), to: z.number().min(0) })),
  totalDurationSec: z.number().positive(),
  events: z.array(TimelineEventSchema),
  sourceDims: z.object({ w: z.number().positive(), h: z.number().positive() }).optional(),
});

export type FaceCamTimeline = z.infer<typeof FaceCamTimelineSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type CropAnchor = z.infer<typeof CropAnchorSchema>;
export type SceneName = (typeof SCENE_NAMES)[number];
