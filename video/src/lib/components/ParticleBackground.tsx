// Port Remotion-friendly du ParticleCanvas.vue.
// Déterministe (positions calculées à partir du frame, pas d'état RAF persistant).
// Draws sur un <canvas> via useLayoutEffect synchronisé sur useCurrentFrame.
//
// Note importante : on n'utilise PAS shadowBlur (extrêmement lourd en canvas headless,
// fait crasher le render offline avec 50+ particules). À la place, halo statique = un
// 2e cercle plus large semi-transparent centré sur la particule.

import { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame, useVideoConfig, random } from "remotion";

// ── Tunables (alignés sur ParticleCanvas.vue, ajustés pour render offline) ─
const ACCENT = "108, 227, 181"; // sage #6CE3B5

const COUNT = 40;          // -5 vs site (45) pour perf render
const MAX_DIST = 150;
const SPEED_MIN = 0.5;     // boostés vs site (0.12) car 30fps cinéma vs 60fps RAF
const SPEED_MAX = 1.4;
const RADIUS_MIN = 1.4;
const RADIUS_MAX = 2.6;
const ALPHA_MIN = 0.18;
const ALPHA_MAX = 0.55;
const PULSE_SPEED = 0.012;
const LINK_OPACITY = 0.14;
const HALO_FACTOR = 4;
const HALO_OPACITY_FACTOR = 0.18;
const VIGNETTE_ALPHA = 0.85;

interface Particle {
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
}

export const ParticleBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialisation déterministe (cache via useMemo)
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const angle = random(`p-angle-${i}`) * Math.PI * 2;
      const speed =
        SPEED_MIN + random(`p-speed-${i}`) * (SPEED_MAX - SPEED_MIN);
      return {
        x0: random(`p-x-${i}`) * W,
        y0: random(`p-y-${i}`) * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: RADIUS_MIN + random(`p-r-${i}`) * (RADIUS_MAX - RADIUS_MIN),
        alpha: ALPHA_MIN + random(`p-a-${i}`) * (ALPHA_MAX - ALPHA_MIN),
        phase: random(`p-phase-${i}`) * Math.PI * 2,
      };
    });
  }, [W, H]);

  // Redraw synchronously before paint = capture cohérente côté Remotion offline
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // Positions au frame courant
    const pts = particles.map((p) => {
      let x = (p.x0 + p.vx * frame) % W;
      if (x < 0) x += W;
      let y = (p.y0 + p.vy * frame) % H;
      if (y < 0) y += H;
      const a =
        p.alpha * (0.7 + 0.3 * Math.sin(p.phase + frame * PULSE_SPEED));
      return { x, y, r: p.r, alpha: Math.max(0, Math.min(1, a)) };
    });

    // Lignes de connexion (avant les points pour qu'ils soient au-dessus)
    ctx.lineWidth = 0.8;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - d / MAX_DIST) * LINK_OPACITY})`;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    // Particules avec halo statique (pas de shadowBlur)
    for (const p of pts) {
      // Halo doux
      ctx.beginPath();
      ctx.fillStyle = `rgba(${ACCENT}, ${p.alpha * HALO_OPACITY_FACTOR})`;
      ctx.arc(p.x, p.y, p.r * HALO_FACTOR, 0, Math.PI * 2);
      ctx.fill();
      // Centre net
      ctx.beginPath();
      ctx.fillStyle = `rgba(${ACCENT}, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vignette radiale (fade vers les bords, cohérence DA warm dark)
    const vignette = ctx.createRadialGradient(
      W / 2, H / 2, 0,
      W / 2, H / 2, Math.max(W, H) * 0.55,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.55, "rgba(0,0,0,0)");
    vignette.addColorStop(1, `rgba(15, 15, 14, ${VIGNETTE_ALPHA})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }, [frame, W, H, particles]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
};
