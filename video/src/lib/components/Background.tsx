import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";

// Fond warm dark de base
export const BaseBg: React.FC = () => {
  return <AbsoluteFill style={{ backgroundColor: COLORS.bg }} />;
};

// Grain léger éditorial — opacité 0.025 alignée sur le site V2
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.025 }) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 9999,
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        backgroundSize: "128px 128px",
      }}
    />
  );
};
