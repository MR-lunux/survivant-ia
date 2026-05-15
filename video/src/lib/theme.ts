// V2 Editorial Dark — tokens canoniques alignés sur app/assets/css/main.css
// Refresh 2026-05 : sage green accent, warm dark, serif typography Playfair.

export const COLORS = {
  bg: "#0F0F0E",            // warm dark (pas pur noir)
  surface: "#14140F",
  surface2: "#1A1A14",
  text: "#E8E5DD",          // cream warm
  textSoft: "#C5C2BB",
  muted: "#8A8780",
  mutedSoft: "#6E6B65",
  dim: "#5C5A52",
  accent: "#6CE3B5",        // sage / mint (l'accent canonique du site)
  accentSoft: "rgba(108, 227, 181, 0.18)",
  accentGlow: "rgba(108, 227, 181, 0.25)",
  rule: "rgba(232, 229, 221, 0.12)",
  hairline: "rgba(232, 229, 221, 0.10)",
  hairlineStrong: "rgba(232, 229, 221, 0.25)",

  // Status (scanner) — inchangés
  danger: "#FF3E3E",
  mutation: "#FFA630",
  protege: "#5BC0EB",
  croissance: "#3DDC84",
} as const;

export const FONTS = {
  mono: 'ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Consolas, monospace',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
  serif: '"Playfair Display", Georgia, serif',  // pour signatures italiques
} as const;

// Format TikTok 9:16
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

// Safe zones TikTok / Reels / Shorts
// - top : status bar + parfois username overlay
// - right : boutons like / comment / share / save
// - bottom : caption + handle + sound
// - left : marge minimale (gestures swipe)
export const SAFE_AREA = {
  top: 240,
  right: 200,
  bottom: 400,
  left: 80,
} as const;
