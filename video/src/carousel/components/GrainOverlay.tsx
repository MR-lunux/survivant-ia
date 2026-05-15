// video/src/carousel/components/GrainOverlay.tsx

const GRAIN_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E`;

/**
 * Grain noise overlay — répliqué de body::after du site.
 * Position absolue, pleine slide, opacity 0.035 (légèrement plus fort qu'au site
 * pour compenser la perte de subtilité au render).
 */
export const GrainOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.035,
        // eslint-disable-next-line @remotion/no-background-image
        backgroundImage: `url("${GRAIN_SVG}")`,
        backgroundSize: '128px 128px',
      }}
    />
  );
};
