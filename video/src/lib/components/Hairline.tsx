import { COLORS } from "../theme";

// Hairline horizontal (remplace les bordures épaisses)
export const HairlineRule: React.FC<{
  color?: string;
  thickness?: number;
  width?: number | string;
  style?: React.CSSProperties;
}> = ({ color = COLORS.hairlineStrong, thickness = 1, width = "100%", style }) => {
  return (
    <div
      style={{
        width,
        height: thickness,
        backgroundColor: color,
        ...style,
      }}
    />
  );
};

// Card éditoriale en hairline (remplace le ScannerFrame épais)
export const HairlineCard: React.FC<{
  children: React.ReactNode;
  padding?: string | number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, padding = "40px 36px", color = COLORS.hairlineStrong, style }) => {
  return (
    <div
      style={{
        border: `1px solid ${color}`,
        backgroundColor: "rgba(20, 20, 15, 0.5)",
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
