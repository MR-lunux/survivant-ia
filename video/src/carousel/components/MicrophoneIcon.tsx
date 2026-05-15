// video/src/carousel/components/MicrophoneIcon.tsx
// Icône microphone stroke ligne, accent menthe Survivant-IA.
// One-shot pour le cycle dictée comptable (2026-05-15) — pas industrialisé en système d'icônes.
import { COLORS } from '../tokens';

type Props = {
  size?: number;
};

export const MicrophoneIcon: React.FC<Props> = ({ size = 140 }) => {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 100 140"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={35} y={15} width={30} height={65} rx={15} />
      <path d="M 20 65 V 75 A 30 30 0 0 0 80 75 V 65" />
      <line x1={50} y1={105} x2={50} y2={120} />
      <line x1={35} y1={120} x2={65} y2={120} />
    </svg>
  );
};
