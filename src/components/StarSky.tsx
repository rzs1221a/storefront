import { useEffect, useRef } from "react";
import { getSky, equatorialToHorizon } from "../lib/sky";
import catalogue from "../data/stars.json";

/**
 * The real night sky over Amelia Island, drawn above the map.
 *
 * 1,627 real stars to magnitude 5.0 from a vendored catalogue, projected to
 * their true altitude and azimuth for this observer at this moment, and aligned
 * to the map's own bearing — turn the map and the sky turns with it, correctly.
 * The moon is placed by its real position and drawn at its real phase.
 *
 * It only exists after sunset, ramping in through civil twilight, so most
 * daytime visitors will never see it and pay nothing for it: no catalogue is
 * walked and no frame is drawn while the sun is up.
 *
 * Verified by scripts/sky-check.mjs, which asserts Polaris sits at the
 * observer's latitude — an invariant a wrong projection cannot satisfy.
 */

const STARS = catalogue.stars as [number, number, number][];

/** Redraw cadence. The sky moves 15° an hour; 4fps is generous. */
const FRAME_MS = 250;

export default function StarSky({ bearing, pitch }: { bearing: number; pitch: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /*
   * Read the camera through a ref so the draw loop is never rebuilt mid-flight.
   * Written in an effect rather than in the render body: React may discard a
   * render, and a ref mutated during one would then hold a value that never
   * happened. Same reason LiveMap keeps `navRef` in an effect.
   */
  const camera = useRef({ bearing, pitch });
  useEffect(() => {
    camera.current = { bearing, pitch };
  }, [bearing, pitch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    let width = 0;
    let height = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /**
     * Where the horizon sits on screen, from the camera's pitch.
     *
     * A flat camera (pitch 0) looks straight down and shows no sky at all; the
     * more it tilts, the further down the screen the horizon falls. This is a
     * deliberately simple linear model rather than a true inverse projection —
     * MapLibre's horizon depends on terrain and field of view, and matching it
     * exactly buys nothing when the sky above it is what matters.
     */
    const horizonY = (p: number) => {
      if (p < 25) return -1; // effectively overhead: no sky in frame
      return height * (0.02 + ((p - 25) / 60) * 0.42);
    };

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (time - last < FRAME_MS) return;
      last = time;
      if (document.hidden) return;

      const sky = getSky();
      ctx.clearRect(0, 0, width, height);

      // Nothing to draw while the sun is up. The catalogue is never walked.
      if (sky.starOpacity <= 0.01) return;

      const { bearing: bear, pitch: pit } = camera.current;
      const hy = horizonY(pit);
      if (hy < 0) return;

      const now = new Date();

      /*
       * Screen mapping: azimuth relative to where the camera is looking spreads
       * across the width, altitude rises from the horizon toward the top.
       * Roughly 140° of sky spans the viewport, which reads as natural rather
       * than fish-eyed.
       */
      const FOV = 140;
      const project = (altitude: number, azimuth: number) => {
        let rel = azimuth - bear;
        while (rel > 180) rel -= 360;
        while (rel < -180) rel += 360;
        if (Math.abs(rel) > FOV / 2) return null;
        const x = width * (0.5 + rel / FOV);
        // Altitude 0 sits on the horizon line, 90° reaches the top edge.
        const y = hy - (altitude / 90) * hy;
        return { x, y };
      };

      ctx.globalAlpha = sky.starOpacity;

      for (const [ra, dec, mag] of STARS) {
        const pos = equatorialToHorizon(ra, dec, now);
        if (pos.altitude <= 0) continue;
        const p = project(pos.altitude, pos.azimuth);
        if (!p) continue;

        // Magnitude is a reversed, logarithmic scale: −1.4 is Sirius, 5.0 is
        // the faintest thing most people can see. Map it to size and alpha so
        // the bright stars actually read as the constellations they belong to.
        const brightness = Math.max(0, Math.min(1, (5.2 - mag) / 6.6));
        const radius = 0.35 + brightness * 1.5;
        const alpha = 0.25 + brightness * 0.75;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        // The brightest stars carry a touch of warmth; the rest stay cool.
        ctx.fillStyle =
          mag < 1.2
            ? `rgba(255, 246, 232, ${alpha})`
            : `rgba(214, 228, 240, ${alpha})`;
        ctx.fill();

        // A soft bloom on the few genuinely bright ones, so Sirius and Vega
        // look like themselves rather than like every other dot.
        if (mag < 0.6 && !reduced) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 226, 245, ${alpha * 0.12})`;
          ctx.fill();
        }
      }

      /* The moon, in its real place and at its real phase. */
      if (sky.moon.altitude > 0) {
        const p = project(sky.moon.altitude, sky.moon.azimuth);
        if (p) {
          const r = 9;
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(226, 232, 240, 0.07)";
          ctx.fill();

          // Lit fraction from the phase: 0 and 1 are new, 0.5 is full.
          const illum = 1 - Math.abs(sky.moon.phase - 0.5) * 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 240, 232, ${0.18 + illum * 0.72})`;
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-sky" aria-hidden="true" />;
}
