// video/src/carousel/components/KickerBrand.tsx
import { COLORS, FONTS } from '../tokens';

type Props = {
  /** Texte du kicker (ex: "LE CONSTAT"). */
  text: string;
};

/**
 * Carré menthe avec glow + texte en Inter caps.
 * Statique en V1 (pas de spin — c'est un still PNG).
 * Cohérent avec la règle brand : jamais de "//", uniquement le carré.
 */
export const KickerBrand: React.FC<Props> = ({ text }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 16,
          height: 16,
          backgroundColor: COLORS.accent,
          boxShadow: `0 0 24px 4px ${COLORS.accentGlow}`,
        }}
      />
      <span
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: '0.18em',
          color: COLORS.textSoft,
          textTransform: 'uppercase',
        }}
      >
        {text}
      </span>
    </div>
  );
};
