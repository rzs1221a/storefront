/**
 * The ground follows the argument.
 *
 * The background map is already mounted behind every section. This module
 * makes it move with the reader: each section declares a camera frame, and as
 * that section becomes the dominant thing on screen the coast beneath the page
 * flies there. Read about Crane Island and you are looking at Crane Island.
 *
 * Every coordinate below is real. They come from `the-aerial/lib/geo.ts` and,
 * for Crane Island, the USGS Geographic Names Information System figure that
 * heymann-williams-coastal's README records (an earlier pin was a quarter mile
 * too far north). Nothing here is invented — a map that flies to the wrong
 * place is worse than one that does not fly at all.
 */

export interface CameraFrame {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

/** Frames keyed by the id registered on each section or work card. */
export const FRAMES: Record<string, CameraFrame> = {
  /*
   * The opening frame: Amelia Island and the mouth of the St. Marys, with the
   * Atlantic to the east.
   *
   * It used to open on the whole corridor at zoom 8.2, which was grander and
   * unusable — all five project beacons sit within about ten miles of each
   * other, so at that altitude they collapsed into one illegible pile. This is
   * close enough that every marker is separately readable and clickable, and
   * still wide enough to read as a coastline rather than a street map.
   */
  // Pitch is held to 40° here rather than the steeper angles used elsewhere:
  // tilt compresses distance toward the horizon, and at 46° the two northern
  // beacons crowded each other even though they are two and a half miles apart.
  top: { center: [-81.458, 30.641], zoom: 11.65, pitch: 40, bearing: -14 },

  /*
   * Project frames descend into the buildings.
   *
   * mapStyle.ts has carried real OSM footprints and heights from minzoom 14
   * since the first commit, fading in between 14 and 15 — and the site never
   * showed a single one, because the deepest frame here stopped at 14.6. These
   * now sit at 16–17 with a steep pitch, so arriving at a project means
   * descending among actual structures rather than looking at a flat plate.
   */

  // The Aerial covers the whole corridor, so it descends over the island it
  // knows best rather than pulling back to a midpoint out at sea.
  "work-the-aerial": {
    center: [-81.4472, 30.5724],
    zoom: 16.1,
    pitch: 64,
    bearing: -22,
  },

  // Heymann Williams — Amelia Park, where the brokerage sits.
  "work-heymann-williams-coastal": {
    center: [-81.4531, 30.6362],
    zoom: 16.4,
    pitch: 66,
    bearing: 18,
  },

  // Sold on Amelia Island — downtown Fernandina. The densest built fabric on
  // the island, and the best of the five for showing extrusions.
  "work-sold-on-amelia-island": {
    center: [-81.4637, 30.6697],
    zoom: 16.8,
    pitch: 67,
    bearing: -28,
  },

  // Crane Island — the exact USGS coordinate, low over the water.
  "work-crane-island-bhhs": {
    center: [-81.4773, 30.6125],
    zoom: 16.2,
    pitch: 68,
    bearing: 34,
  },

  // Ron Heymann — the island's north end, over Fort Clinch.
  "work-ron-heymann-agent-page": {
    center: [-81.4545, 30.7047],
    zoom: 16.0,
    pitch: 62,
    bearing: -34,
  },

  // Studio destinations stay higher: they are arguments rather than places, and
  // the coast reads better behind them than a rooftop would.
  capabilities: { center: [-81.44, 30.65], zoom: 12.4, pitch: 58, bearing: 8 },
  pricing: { center: [-81.46, 30.62], zoom: 11.4, pitch: 50, bearing: -20 },
  contact: { center: [-81.47, 30.66], zoom: 12.6, pitch: 60, bearing: 24 },

};

/**
 * Where the arrival begins: far out over the corridor and flat, the way you
 * would actually approach this coast. The opening descends from here into the
 * `top` frame. Ported in spirit from the-aerial's APPROACH_VIEW.
 */
export const APPROACH: CameraFrame = {
  center: [-81.2, 30.15],
  zoom: 7.6,
  pitch: 0,
  bearing: 0,
};

/** What BackgroundMap hands us. Kept minimal so the map stays swappable. */
export interface CameraController {
  flyTo(frame: CameraFrame, durationMs: number): void;
  isFlying(): boolean;
}

let controller: CameraController | null = null;
let pendingKey: string | null = null;
let activeKey: string | null = null;
let settleTimer = 0;

/** Called by LiveMap once the map is ready. */
export function registerCamera(next: CameraController | null) {
  controller = next;
  if (!controller) return;

  /*
   * A destination is very often chosen before the map has finished loading —
   * a deep link lands on /work/crane-island while tiles are still arriving.
   * Honour whatever was last requested instead of stranding the camera at the
   * opening frame until the visitor navigates again.
   */
  if (pendingFrame) controller.flyTo(pendingFrame, 1800);
  else if (pendingKey) applyFrame(pendingKey);
}

function applyFrame(key: string) {
  const frame = FRAMES[key];
  if (!frame) return;

  pendingKey = key;
  if (!controller) return;

  // A fast scroll past four sections must not queue four flights. Only the
  // most recent target is ever flown to, and if one is already in the air the
  // next is cut short so the camera keeps up with the reader instead of
  // trailing several seconds behind them.
  const duration = controller.isFlying() ? 1500 : 3000;

  activeKey = key;
  controller.flyTo(frame, duration);

  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    // Nothing to do but let BackgroundMap know the air is clear; it resumes
    // its idle orbit off the same signal.
  }, duration);
}

/** The destination currently framed, or null. */
export function currentFrameKey() {
  return activeKey;
}

/**
 * Fly to an explicit frame. This is the route-driven path — the shell calls it
 * on every navigation, so the camera follows the URL rather than the scroll
 * position. Same queueing discipline as the observer path: only the latest
 * target is flown to, and a flight already in the air shortens the next so the
 * camera keeps up with the visitor instead of trailing several seconds behind.
 */
export function flyToFrame(frame: CameraFrame) {
  pendingFrame = frame;
  if (!controller) return;

  const duration = controller.isFlying() ? 1600 : 2800;
  controller.flyTo(frame, duration);
}

/** Held so a navigation that lands before the map is ready is not lost. */
let pendingFrame: CameraFrame | null = null;

/* ── The tour ─────────────────────────────────────────────────────────── */

/**
 * The tour needs the raw map rather than the flyTo seam above, because it
 * wants MapLibre's `flyTo` — which arcs up and back down between stops — where
 * navigation wants `easeTo`, which interpolates directly. The arc is the whole
 * character of a tour and would be nauseating on every click.
 */
type TourMap = {
  flyTo(opts: Record<string, unknown>): void;
  once(event: string, handler: () => void): void;
};

let tourMap: TourMap | null = null;
let tourTimer = 0;

export function registerTourMap(map: TourMap | null) {
  tourMap = map;
}

export interface TourStop {
  frame: CameraFrame;
  name: string;
  line: string;
  path: string;
}

/**
 * Fly every project in order, banking alternately, and cancel the moment the
 * visitor takes the controls back.
 *
 * This is the answer to the one genuine weakness of a map interface: it cannot
 * be skimmed. One control, and it shows you everything.
 *
 * Modeled on the-aerial/components/Aerial.tsx `startTour`.
 */
export function runTour(
  stops: TourStop[],
  onStop: (stop: TourStop | null, index: number) => void,
  holdMs = 6200
): () => void {
  const map = tourMap;
  if (!map || !stops.length) return () => {};

  let index = 0;
  let stopped = false;

  const end = () => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(tourTimer);
    onStop(null, -1);
  };

  const next = () => {
    if (stopped) return;
    if (index >= stops.length) {
      // Land back on the coast so the tour resolves rather than abandoning
      // the camera at the last stop.
      map.flyTo({ ...FRAMES.top, speed: 0.45, curve: 1.4, essential: true });
      end();
      return;
    }
    const stop = stops[index];
    onStop(stop, index);
    map.flyTo({
      center: stop.frame.center,
      zoom: stop.frame.zoom,
      pitch: stop.frame.pitch,
      // Bank alternately, so consecutive stops do not read as the same shot.
      bearing: index % 2 === 0 ? stop.frame.bearing : -stop.frame.bearing,
      speed: 0.5,
      curve: 1.4,
      essential: true,
    });
    index += 1;
    tourTimer = window.setTimeout(next, holdMs);
  };

  // Any attempt to steer ends it immediately — a tour you cannot escape is a
  // hostage situation, not a feature.
  for (const ev of ["dragstart", "wheel", "touchstart"]) {
    map.once(ev, end);
  }

  next();
  return end;
}

/**
 * Observe every element carrying `data-frame` and fly to the one occupying the
 * most of the viewport. An IntersectionObserver rather than a scroll listener:
 * no work happens on frames where nothing crosses a boundary.
 *
 * Returns a teardown function. Under reduced motion it observes nothing and
 * the map holds the opening frame.
 */
export function observeFrames(
  onActive?: (key: string | null) => void
): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ratios = new Map<string, number>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const key = (entry.target as HTMLElement).dataset.frame;
        if (!key) continue;
        ratios.set(key, entry.isIntersecting ? entry.intersectionRatio : 0);
      }

      // Whichever registered section owns the most screen wins.
      let best: string | null = null;
      let bestRatio = 0;
      for (const [key, ratio] of ratios) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = key;
        }
      }

      if (!best || best === activeKey) return;
      onActive?.(best);
      if (!reduced) applyFrame(best);
      else activeKey = best;
    },
    // A spread of thresholds so "most visible" is meaningful for sections that
    // are taller than the viewport as well as shorter ones.
    { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] }
  );

  for (const el of document.querySelectorAll<HTMLElement>("[data-frame]")) {
    observer.observe(el);
  }

  return () => {
    observer.disconnect();
    window.clearTimeout(settleTimer);
  };
}

/**
 * Hover-to-fly for the work cards. Desktop only, and debounced — a mouse
 * crossing the grid on its way somewhere else must not thrash the camera.
 */
let hoverTimer = 0;

export function flyOnHover(key: string) {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.clearTimeout(hoverTimer);
  hoverTimer = window.setTimeout(() => applyFrame(key), 140);
}

export function cancelHoverFly() {
  window.clearTimeout(hoverTimer);
}
