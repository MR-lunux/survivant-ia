import { describe, it, expect } from "vitest";
import { FaceCamTimelineSchema } from "../../schemas";

const validTimeline = {
  episodeId: "ep-001",
  inputAspect: "9:16",
  cropAnchor: "top",
  cuts: [{ from: 4.2, to: 5.1 }],
  totalDurationSec: 38.6,
  events: [
    {
      tStart: 0,
      tEnd: 2.4,
      scene: "KickerOpening",
      props: { kicker: "REX / IT", signature: "le Survivant." },
    },
  ],
};

describe("FaceCamTimelineSchema", () => {
  it("accepts a valid timeline", () => {
    expect(() => FaceCamTimelineSchema.parse(validTimeline)).not.toThrow();
  });

  it("rejects unknown scene name", () => {
    const bad = { ...validTimeline, events: [{ ...validTimeline.events[0], scene: "Unknown" }] };
    expect(() => FaceCamTimelineSchema.parse(bad)).toThrow();
  });

  it("rejects tEnd <= tStart", () => {
    const bad = { ...validTimeline, events: [{ ...validTimeline.events[0], tStart: 5, tEnd: 3 }] };
    expect(() => FaceCamTimelineSchema.parse(bad)).toThrow();
  });

  it("rejects negative tStart", () => {
    const bad = { ...validTimeline, events: [{ ...validTimeline.events[0], tStart: -1, tEnd: 2 }] };
    expect(() => FaceCamTimelineSchema.parse(bad)).toThrow();
  });

  it("accepts custom cropAnchor object form", () => {
    const ok = { ...validTimeline, cropAnchor: { y: 0.35 } };
    expect(() => FaceCamTimelineSchema.parse(ok)).not.toThrow();
  });

  it("rejects cropAnchor.y outside [0,1]", () => {
    const bad = { ...validTimeline, cropAnchor: { y: 1.5 } };
    expect(() => FaceCamTimelineSchema.parse(bad)).toThrow();
  });

  it("accepts optional sourceDims", () => {
    const ok = { ...validTimeline, sourceDims: { w: 3840, h: 2160 } };
    expect(() => FaceCamTimelineSchema.parse(ok)).not.toThrow();
  });
});

describe("prompt-rush new scenes", () => {
  const base = {
    episodeId: "prompt-rush",
    inputAspect: "9:16" as const,
    cropAnchor: "top" as const,
    cuts: [],
    totalDurationSec: 122,
  };

  it.each([
    ["FakeAIChatScene", { mode: "glitch", promptText: "x", outputLines: [] }],
    ["SlamPayoff", { lines: ["c'est de la"], accentWord: "TIENNE" }],
    ["PillarsBuild", { visiblePillars: 3, highlight: 3 }],
    ["PillarsStress", { phase: "overload" }],
    ["ToolReplayScene", { phase: "typing" }],
  ])("accepts scene %s", (scene, props) => {
    const timeline = {
      ...base,
      events: [{ tStart: 0, tEnd: 5, scene, props }],
    };
    expect(() => FaceCamTimelineSchema.parse(timeline)).not.toThrow();
  });
});
