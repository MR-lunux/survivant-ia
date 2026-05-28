import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONTS } from "../../theme";
import type { SceneCommonProps } from "./types";

const FLOORS = [1, 2, 3, 4, 5];
const FLOOR_TOP_Y = 340;     // y of the top floor (just below safe zone label space)
const FLOOR_SPACING = 86;    // vertical gap between floors
const LINE_WIDTH = 340;

function floorY(idx: number): number {
  // idx 0 = bottom, FLOORS.length-1 = top
  return FLOOR_TOP_Y + (FLOORS.length - 1 - idx) * FLOOR_SPACING;
}

export const LevelUp: React.FC<SceneCommonProps & { props: Record<string, unknown> }> = ({ durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Elevator climb: starts at frame 8, reaches top at ~75% of scene
  const climbStart = 8;
  const climbEnd = Math.floor(durationFrames * 0.75);
  const climbProgress = interpolate(frame, [climbStart, climbEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const elevatorY = climbProgress * (FLOORS.length - 1); // 0..4

  // Reveal "niveau supérieur." after climb tops out
  const finalReveal = spring({
    frame: frame - climbEnd,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  // Elevator dot absolute position (CSS top)
  const dotTop = floorY(elevatorY);

  // Pulse on dot
  const pulse = interpolate(Math.sin(frame * 0.32), [-1, 1], [0.55, 1]);

  return (
    <AbsoluteFill>
      {/* Floors */}
      {FLOORS.map((n, idx) => {
        const isCurrent = Math.abs(elevatorY - idx) < 0.45;
        const isPassed = elevatorY >= idx - 0.1;
        const color = isCurrent ? COLORS.accent : isPassed ? COLORS.textSoft : COLORS.dim;
        const opacity = isCurrent ? 1 : isPassed ? 0.55 : 0.22;
        const filter = isCurrent ? `drop-shadow(0 0 12px ${COLORS.accent})` : "none";
        return (
          <div
            key={n}
            style={{
              position: "absolute",
              top: floorY(idx),
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity,
              filter,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 22,
                color,
                letterSpacing: "0.18em",
                minWidth: 36,
                textAlign: "right",
              }}
            >
              {String(n).padStart(2, "0")}
            </span>
            <div style={{ width: LINE_WIDTH, height: 2, background: color }} />
          </div>
        );
      })}

      {/* Elevator indicator */}
      <div
        style={{
          position: "absolute",
          top: dotTop,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: COLORS.accent,
          filter: `drop-shadow(0 0 ${18 * pulse}px ${COLORS.accent}) drop-shadow(0 0 ${8 * pulse}px ${COLORS.accent})`,
        }}
      />

      {/* Vertical track line behind the dot (subtle hairline column) */}
      <div
        style={{
          position: "absolute",
          top: floorY(FLOORS.length - 1),
          left: "50%",
          height: (FLOORS.length - 1) * FLOOR_SPACING,
          width: 1,
          background: COLORS.hairline,
          transform: "translateX(-0.5px)",
        }}
      />

      {/* "niveau supérieur." reveal at top */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.serif,
          fontStyle: "italic",
          fontSize: 56,
          color: COLORS.accent,
          opacity: finalReveal,
          transform: `translateY(${(1 - finalReveal) * 18}px)`,
          letterSpacing: -0.5,
        }}
      >
        niveau supérieur.
      </div>
    </AbsoluteFill>
  );
};
