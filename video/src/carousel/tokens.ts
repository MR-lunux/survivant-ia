// video/src/carousel/tokens.ts
// Tokens DA répliqués de app/assets/css/main.css :root.
// Dernière sync : 2026-05-07.
// Source de vérité = main.css. Toute modif côté site doit être propagée ici
// manuellement (et dans video/src/index.css @theme). Pas de mécanisme auto.

export const COLORS = {
  bg: '#0F0F0E',
  surface: '#14140F',
  surface2: '#1A1A14',
  text: '#E8E5DD',
  textSoft: '#C5C2BB',
  muted: '#8A8780',
  mutedSoft: '#6E6B65',
  dim: '#5C5A52',
  accent: '#6CE3B5',
  accentSoft: 'rgba(108, 227, 181, 0.18)',
  accentGlow: 'rgba(108, 227, 181, 0.25)',
  rule: 'rgba(232, 229, 221, 0.12)',
  hairline: 'rgba(232, 229, 221, 0.1)',
  hairlineStrong: 'rgba(232, 229, 221, 0.25)',
} as const;

export const FONTS = {
  sans: 'Inter, system-ui, sans-serif',
  serif: 'Playfair Display, Georgia, serif',
  mono: 'ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Consolas, monospace',
} as const;

/** Padding intérieur des slides (en px sur 1080×1350). */
export const SLIDE_PADDING = 96;

/** Hauteur du footer brand sur chaque slide. */
export const FOOTER_HEIGHT = 80;
