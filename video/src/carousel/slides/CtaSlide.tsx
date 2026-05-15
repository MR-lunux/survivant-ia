// video/src/carousel/slides/CtaSlide.tsx
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, FOOTER_HEIGHT, SLIDE_PADDING } from '../tokens';
import { BrandFooter } from '../components/BrandFooter';
import { GrainOverlay } from '../components/GrainOverlay';
import type { CtaContent } from '../types';

type Props = {
  content: CtaContent;
};

/**
 * Slide 8/8 — CTA
 * Box accent menthe avec titre + soustitre + URL en mono.
 */
export const CtaSlide: React.FC<Props> = ({ content }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill
        style={{
          padding: SLIDE_PADDING,
          paddingBottom: SLIDE_PADDING + FOOTER_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Carré menthe geant */}
        <div
          style={{
            width: 80,
            height: 80,
            backgroundColor: COLORS.accent,
            boxShadow: `0 0 60px 12px ${COLORS.accentGlow}`,
          }}
        />

        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.1,
            color: COLORS.text,
            letterSpacing: '-0.02em',
          }}
        >
          {content.titre}
        </div>

        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 40,
            lineHeight: 1.3,
            color: COLORS.textSoft,
          }}
        >
          {content.soustitre}
        </div>

        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 32,
            letterSpacing: '0.12em',
            color: COLORS.accent,
            textTransform: 'uppercase',
            marginTop: 16,
          }}
        >
          → {content.url}
        </div>
      </AbsoluteFill>

      <BrandFooter index={7} />
      <GrainOverlay />
    </AbsoluteFill>
  );
};
