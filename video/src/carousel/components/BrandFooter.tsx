// video/src/carousel/components/BrandFooter.tsx
import { COLORS, FONTS, FOOTER_HEIGHT, SLIDE_PADDING } from '../tokens';

type Props = {
  /** Index de la slide courante (0-7). */
  index: number;
};

/**
 * Footer fin présent sur chaque slide.
 * Gauche : "SURVIVANT-IA · 0X / 08"
 * Droite : "SURVIVANT-IA.CH"
 */
export const BrandFooter: React.FC<Props> = ({ index }) => {
  const numeroAffiche = String(index + 1).padStart(2, '0');
  return (
    <div
      style={{
        position: 'absolute',
        left: SLIDE_PADDING,
        right: SLIDE_PADDING,
        bottom: 0,
        height: FOOTER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: `1px solid ${COLORS.rule}`,
        fontFamily: FONTS.mono,
        fontSize: 16,
        letterSpacing: '0.12em',
        color: COLORS.muted,
        textTransform: 'uppercase',
      }}
    >
      <span>SURVIVANT-IA · {numeroAffiche} / 08</span>
      <span>SURVIVANT-IA.CH</span>
    </div>
  );
};
