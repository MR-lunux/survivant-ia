export function typeSubstring(
  text: string,
  frame: number,
  charsPerSec: number,
  fps: number
): string {
  if (frame <= 0 || text.length === 0) return "";
  const chars = Math.floor((frame * charsPerSec) / fps);
  return text.slice(0, Math.min(chars, text.length));
}
