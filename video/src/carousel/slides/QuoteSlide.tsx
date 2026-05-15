// video/src/carousel/slides/QuoteSlide.tsx
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, FOOTER_HEIGHT, SLIDE_PADDING } from '../tokens';
import { BrandFooter } from '../components/BrandFooter';
import { GrainOverlay } from '../components/GrainOverlay';
import type { QuoteContent } from '../types';

type Props = {
  content: QuoteContent;
};

/**
 * Slide 7/8 — QUOTE / INSIGHT
 * Phrase signature en Playfair italic, attribution en mono.
 */
export const QuoteSlide: React.FC<Props> = ({ content }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill
        style={{
          padding: SLIDE_PADDING,
          paddingBottom: SLIDE_PADDING + FOOTER_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 48,
        }}
      >
        {/* Quote-mark décoratif */}
        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 180,
            lineHeight: 0.8,
            color: COLORS.accent,
            opacity: 0.4,
          }}
        >
          “
        </div>

        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 64,
            lineHeight: 1.2,
            color: COLORS.text,
            letterSpacing: '-0.01em',
          }}
        >
          {content.quote}
        </div>

        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            letterSpacing: '0.16em',
            color: COLORS.muted,
            textTransform: 'uppercase',
            marginTop: 24,
          }}
        >
          {content.attribution}
        </div>
      </AbsoluteFill>

      <BrandFooter index={6} />
      <GrainOverlay />
    </AbsoluteFill>
  );
};
