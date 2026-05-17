// Inline SVG paths for FaceCam motion design icons.
// Tabler-style: viewBox 0 0 24 24, stroke design, no fill.
// Add new icons here as needed.

export const ICON_PATHS: Record<string, string[]> = {
  document: [
    "M14 3v4a1 1 0 0 0 1 1h4",
    "M17 21H7a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z",
    "M9 9h1",
    "M9 13h6",
    "M9 17h6",
  ],
  keyboard: [
    "M2 6m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2H4a2 2 0 0 1 -2 -2z",
    "M6 10l0 .01",
    "M10 10l0 .01",
    "M14 10l0 .01",
    "M18 10l0 .01",
    "M6 14l0 .01",
    "M18 14l0 .01",
    "M10 14l4 0",
  ],
  check: ["M5 12l5 5l10 -10"],
  refresh: [
    "M20 11a8.1 8.1 0 0 0 -15.5 -2M4 5v4h4",
    "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4",
  ],
  brain: [
    "M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8",
    "M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8",
    "M17.5 16a3.5 3.5 0 0 0 0 -7H17",
    "M19 9.3V6.5a3.5 3.5 0 0 0 -7 0",
    "M6.5 16a3.5 3.5 0 0 1 0 -7H7",
    "M5 9.3V6.5a3.5 3.5 0 0 1 7 0v10",
  ],
  microphone: [
    "M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z",
    "M5 10a7 7 0 0 0 14 0",
    "M8 21l8 0",
    "M12 17l0 4",
  ],
  lightning: ["M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"],
  trendingUp: [
    "M3 17l6 -6l4 4l8 -8",
    "M14 7l7 0l0 7",
  ],
  ai: [
    "M12 2a10 10 0 1 0 10 10",
    "M12 12l9 -3",
    "M12 12l-9 3",
    "M12 12l5 8",
  ],
  clock: [
    "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",
    "M12 7v5l3 3",
  ],
  skull: [
    "M12 3c-5 0 -9 4 -9 9c0 2.4 1 4.6 2.5 6.2L6 21h12l.5 -2.8c1.5 -1.6 2.5 -3.8 2.5 -6.2c0 -5 -4 -9 -9 -9z",
    "M9 13a1 1 0 1 0 -2 0a1 1 0 0 0 2 0z",
    "M17 13a1 1 0 1 0 -2 0a1 1 0 0 0 2 0z",
    "M10 19v2",
    "M14 19v2",
  ],
};

export type IconName = keyof typeof ICON_PATHS;
