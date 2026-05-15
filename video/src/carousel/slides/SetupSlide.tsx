// video/src/carousel/slides/SetupSlide.tsx
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, FOOTER_HEIGHT, SLIDE_PADDING } from '../tokens';
import { KickerBrand } from '../components/KickerBrand';
import { BrandFooter } from '../components/BrandFooter';
import { GrainOverlay } from '../components/GrainOverlay';
import type { SetupContent } from '../types';

type Props = {
  content: SetupContent;
};

/**
 * Slide 2/8 — SETUP
 * Le constat / la situation. KickerBrand + paragraphe Inter.
 */
export const SetupSlide: React.FC<Props> = ({ content }) => {
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
        <KickerBrand text={content.kicker} />
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 500,
            fontSize: 56,
            lineHeight: 1.25,
            color: COLORS.text,
            letterSpacing: '-0.01em',
          }}
        >
          {content.body}
        </div>
      </AbsoluteFill>

      <BrandFooter index={1} />
      <GrainOverlay />
    </AbsoluteFill>
  );
};
