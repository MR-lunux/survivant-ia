// video/src/carousel/slides/BasculeSlide.tsx
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, FOOTER_HEIGHT, SLIDE_PADDING } from '../tokens';
import { KickerBrand } from '../components/KickerBrand';
import { BrandFooter } from '../components/BrandFooter';
import { GrainOverlay } from '../components/GrainOverlay';
import type { BasculeContent } from '../types';

type Props = {
  content: BasculeContent;
};

/**
 * Slide 3/8 — BASCULE
 * Pivot émotionnel : "tu as raison, MAIS c'est ton opportunité".
 * Amorce en Inter (sobre), bascule en Playfair italic accent (impact).
 */
export const BasculeSlide: React.FC<Props> = ({ content }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill
        style={{
          padding: SLIDE_PADDING,
          paddingBottom: SLIDE_PADDING + FOOTER_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 56,
        }}
      >
        <KickerBrand text={content.kicker} />
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 400,
            fontSize: 48,
            lineHeight: 1.3,
            color: COLORS.muted,
            letterSpacing: '-0.005em',
          }}
        >
          {content.amorce}
        </div>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 64,
            lineHeight: 1.15,
            color: COLORS.accent,
            letterSpacing: '-0.01em',
          }}
        >
          {content.bascule}
        </div>
      </AbsoluteFill>

      <BrandFooter index={2} />
      <GrainOverlay />
    </AbsoluteFill>
  );
};
