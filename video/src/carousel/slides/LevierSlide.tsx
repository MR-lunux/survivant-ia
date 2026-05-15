// video/src/carousel/slides/LevierSlide.tsx
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, FOOTER_HEIGHT, SLIDE_PADDING } from '../tokens';
import { BrandFooter } from '../components/BrandFooter';
import { GrainOverlay } from '../components/GrainOverlay';
import type { LevierContent } from '../types';

type Props = {
  content: LevierContent;
  /** Index de la slide dans le carrousel (3, 4, ou 5). */
  slideIndex: number;
};

/**
 * Slides 4-6/8 — LEVIERS I, II, III
 * Format levier-card : numéro romain géant + titre + body.
 */
export const LevierSlide: React.FC<Props> = ({ content, slideIndex }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.surface }}>
      <AbsoluteFill
        style={{
          padding: SLIDE_PADDING,
          paddingBottom: SLIDE_PADDING + FOOTER_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {/* Numéro romain en watermark */}
        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 220,
            lineHeight: 1,
            color: COLORS.accent,
            letterSpacing: '-0.02em',
            opacity: 0.95,
          }}
        >
          {content.numero}
        </div>

        {/* Titre */}
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: 1.15,
            color: COLORS.text,
            letterSpacing: '-0.01em',
            marginTop: -32,
          }}
        >
          {content.titre}
        </div>

        {/* Body */}
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 400,
            fontSize: 36,
            lineHeight: 1.4,
            color: COLORS.textSoft,
            letterSpacing: '-0.005em',
          }}
        >
          {content.body}
        </div>
      </AbsoluteFill>

      <BrandFooter index={slideIndex} />
      <GrainOverlay />
    </AbsoluteFill>
  );
};
