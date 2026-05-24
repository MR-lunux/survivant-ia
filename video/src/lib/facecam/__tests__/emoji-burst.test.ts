import { describe, it, expect } from "vitest";
import { emojiBurstFor } from "../helpers/emoji-burst";

describe("emojiBurstFor", () => {
  const fps = 30;

  it("returns empty array before first burst", () => {
    expect(emojiBurstFor(0, fps).length).toBe(0);
  });

  it("is deterministic — same frame yields same output", () => {
    const a = emojiBurstFor(120, fps);
    const b = emojiBurstFor(120, fps);
    expect(a).toEqual(b);
  });

  it("produces monotonically growing count over time", () => {
    const at1s = emojiBurstFor(30, fps).length;
    const at5s = emojiBurstFor(150, fps).length;
    const at10s = emojiBurstFor(300, fps).length;
    expect(at5s).toBeGreaterThanOrEqual(at1s);
    expect(at10s).toBeGreaterThanOrEqual(at5s);
  });

  it("each emoji has glyph, x, y, spawnFrame", () => {
    const list = emojiBurstFor(120, fps);
    expect(list.length).toBeGreaterThan(0);
    for (const e of list) {
      expect(typeof e.glyph).toBe("string");
      expect(typeof e.x).toBe("number");
      expect(typeof e.y).toBe("number");
      expect(typeof e.spawnFrame).toBe("number");
    }
  });
});
