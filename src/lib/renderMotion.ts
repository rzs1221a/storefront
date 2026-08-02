/**
 * The render-motion governor, ported (simplified) from
 * heymann-williams-coastal/src/lib/renderMotion.ts.
 *
 * A rAF monitor keeps an exponential moving average of real frame time and
 * writes the verdict onto <html>:
 *
 *   data-render-load="silk" | "steady" | "austere"
 *   --render-motion-scale: 1 | 0.85 | 0.6
 *
 * index.css keys the glass filter strength and animation durations off those,
 * so the glass gets lighter before the page gets slow — the site degrades in
 * material quality, never in frame rate. `?motionHud=1` shows the live
 * verdict. Under prefers-reduced-motion the governor pins austere and the
 * motion scale collapses, which the CSS reads as "no choreography".
 */

type RenderLoad = "silk" | "steady" | "austere";
type RenderIntent = "idle" | "route" | "map" | "gesture";

type RenderMotionSnapshot = {
  averageFrameMs: number;
  fps: number;
  intent: RenderIntent;
  load: RenderLoad;
  longFrames: number;
};

const subscribers = new Set<(snapshot: RenderMotionSnapshot) => void>();

let monitorRaf = 0;
let monitorRefs = 0;
let lastFrame = 0;
let averageFrameMs = 16.7;
let longFrames = 0;
let load: RenderLoad = "silk";
let intent: RenderIntent = "idle";
let intentUntil = 0;

function nowMs() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function root() {
  return typeof document === "undefined" ? null : document.documentElement;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function motionScale() {
  if (prefersReducedMotion()) return 0.01;
  if (load === "austere") return 0.6;
  if (load === "steady") return 0.85;
  return 1;
}

function notify() {
  const snapshot = getRenderMotionSnapshot();
  subscribers.forEach((listener) => listener(snapshot));
}

function syncRootState() {
  const el = root();
  if (!el) return;
  el.dataset.renderLoad = load;
  el.dataset.renderIntent = intent;
  el.style.setProperty("--render-motion-scale", String(motionScale()));
}

function updateLoad() {
  if (intentUntil <= nowMs() && intent !== "idle") intent = "idle";

  const nextLoad: RenderLoad = prefersReducedMotion()
    ? "austere"
    : averageFrameMs > 28
      ? "austere"
      : averageFrameMs > 20
        ? "steady"
        : "silk";

  if (nextLoad !== load) {
    load = nextLoad;
    notify();
  }
  syncRootState();
}

function monitor(now: number) {
  if (lastFrame) {
    const delta = Math.min(Math.max(now - lastFrame, 8), 120);
    averageFrameMs = averageFrameMs * 0.88 + delta * 0.12;
    if (delta > 50) longFrames += 1;
    updateLoad();
  }
  lastFrame = now;
  monitorRaf = window.requestAnimationFrame(monitor);
}

/** Start the governor. Returns a cleanup; reference-counted. */
export function initRenderMotionEngine() {
  if (typeof window === "undefined") return () => undefined;
  monitorRefs += 1;
  syncRootState();
  if (!monitorRaf) {
    lastFrame = 0;
    monitorRaf = window.requestAnimationFrame(monitor);
  }
  return () => {
    monitorRefs = Math.max(0, monitorRefs - 1);
    if (monitorRefs === 0 && monitorRaf) {
      window.cancelAnimationFrame(monitorRaf);
      monitorRaf = 0;
    }
  };
}

export function subscribeRenderMotion(
  listener: (snapshot: RenderMotionSnapshot) => void
) {
  subscribers.add(listener);
  listener(getRenderMotionSnapshot());
  return () => {
    subscribers.delete(listener);
  };
}

export function getRenderMotionSnapshot(): RenderMotionSnapshot {
  return {
    averageFrameMs,
    fps: Math.round(1000 / Math.max(averageFrameMs, 1)),
    intent,
    load,
    longFrames,
  };
}

/**
 * Declare a known-expensive window (a route change, a camera flight) so the
 * HUD and any listeners can attribute the frames it costs.
 */
export function setRenderMotionIntent(nextIntent: RenderIntent, duration = 900) {
  intent = nextIntent;
  intentUntil = Math.max(intentUntil, nowMs() + duration);
  syncRootState();
  notify();
}

/** The `?motionHud=1` diagnostics readout. */
export function mountMotionHud() {
  if (typeof window === "undefined") return;
  if (new URLSearchParams(window.location.search).get("motionHud") !== "1") return;
  const hud = document.createElement("aside");
  hud.className = "render-motion-hud";
  hud.setAttribute("aria-label", "Render motion diagnostics");
  document.body.appendChild(hud);
  subscribeRenderMotion((s) => {
    hud.textContent = `RM ${s.fps}fps · ${s.load} · ${s.intent} · ${s.longFrames} long`;
  });
}
