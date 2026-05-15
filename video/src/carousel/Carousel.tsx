// video/src/carousel/Carousel.tsx
import { useCurrentFrame } from 'remotion';
import type { CycleData } from './types';
import { HookSlide } from './slides/HookSlide';
import { SetupSlide } from './slides/SetupSlide';
import { BasculeSlide } from './slides/BasculeSlide';
import { LevierSlide } from './slides/LevierSlide';
import { QuoteSlide } from './slides/QuoteSlide';
import { CtaSlide } from './slides/CtaSlide';

type Props = {
  cycle: CycleData;
};

/**
 * Composition Carousel — fps=1, durationInFrames=8.
 * Chaque frame N (0-7) rend la slide correspondante :
 *   0 = Hook, 1 = Setup, 2 = Bascule, 3-5 = Leviers I-III, 6 = Quote, 7 = CTA.
 *
 * Render produit 8 PNG (1080×1350) → carrousel LinkedIn (PDF concat) + Instagram.
 */
export const Carousel: React.FC<Props> = ({ cycle }) => {
  const frame = useCurrentFrame();

  switch (frame) {
    case 0:
      return <HookSlide content={cycle.hook} />;
    case 1:
      return <SetupSlide content={cycle.setup} />;
    case 2:
      return <BasculeSlide content={cycle.bascule} />;
    case 3:
      return <LevierSlide content={cycle.leviers[0]} slideIndex={3} />;
    case 4:
      return <LevierSlide content={cycle.leviers[1]} slideIndex={4} />;
    case 5:
      return <LevierSlide content={cycle.leviers[2]} slideIndex={5} />;
    case 6:
      return <QuoteSlide content={cycle.quote} />;
    case 7:
      return <CtaSlide content={cycle.cta} />;
    default:
      return null;
  }
};
