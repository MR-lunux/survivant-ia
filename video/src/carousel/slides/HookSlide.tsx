// video/src/carousel/slides/HookSlide.tsx
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SLIDE_PADDING } from '../tokens';
import { KickerBrand } from '../components/KickerBrand';
import { BrandFooter } from '../components/BrandFooter';
import { GrainOverlay } from '../components/GrainOverlay';
import { MicrophoneIcon } from '../components/MicrophoneIcon';
import type { HookContent } from '../types';

type Props = {
  content: HookContent;
};

/**
 * Slide 1/8 — HOOK
 * Phrase courte qui stoppe le scroll.
 * line1 : Inter, accent menthe, taille forte.
 * line2 (optionnel) : Playfair italic, texte clair.
 */
export const HookSlide: React.FC<Props> = ({ content }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <div
        style={{
          position: 'absolute',
          top: SLIDE_PADDING,
          left: SLIDE_PADDING,
        }}
      >
        <KickerBrand text="SURVIVANT-IA" />
      </div>

      <AbsoluteFill
        style={{
          padding: SLIDE_PADDING,
          paddingTop: SLIDE_PADDING * 2,
          paddingBottom: SLIDE_PADDING * 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {content.icon === 'microphone' && (
          <div style={{ marginBottom: 48 }}>
            <MicrophoneIcon size={120} />
          </div>
        )}
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 900,
            fontSize: 84,
            lineHeight: 1.05,
            color: COLORS.accent,
            letterSpacing: '-0.02em',
          }}
        >
          {content.line1}
        </div>
        {content.line2 && (
          <div
            style={{
              fontFamily: FONTS.serif,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 60,
              lineHeight: 1.15,
              color: COLORS.text,
              marginTop: 32,
              letterSpacing: '-0.01em',
            }}
          >
            {content.line2}
          </div>
        )}
      </AbsoluteFill>

      <BrandFooter index={0} />
      <GrainOverlay />
    </AbsoluteFill>
  );
};
