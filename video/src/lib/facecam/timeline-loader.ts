import { FaceCamTimelineSchema, type FaceCamTimeline } from "../schemas";

export function parseTimeline(raw: unknown): FaceCamTimeline {
  return FaceCamTimelineSchema.parse(raw);
}
