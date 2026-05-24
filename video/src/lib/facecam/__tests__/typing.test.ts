import { describe, it, expect } from "vitest";
import { typeSubstring } from "../helpers/typing";

describe("typeSubstring", () => {
  // At 30fps, 15 chars/sec → 0.5 chars/frame
  const fps = 30;
  const cps = 15;

  it("returns empty string at frame 0", () => {
    expect(typeSubstring("hello world", 0, cps, fps)).toBe("");
  });

  it("returns full string after enough frames", () => {
    // 11 chars / 0.5 cpf = 22 frames
    expect(typeSubstring("hello world", 22, cps, fps)).toBe("hello world");
  });

  it("returns partial substring at intermediate frame", () => {
    // 10 frames * 0.5 cpf = 5 chars
    expect(typeSubstring("hello world", 10, cps, fps)).toBe("hello");
  });

  it("never returns more chars than text length", () => {
    expect(typeSubstring("hi", 500, cps, fps)).toBe("hi");
  });

  it("handles empty string", () => {
    expect(typeSubstring("", 30, cps, fps)).toBe("");
  });
});
