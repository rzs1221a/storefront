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

  // The Aerial covers the entire coast, so it pulls back out to it.
  "work-the-aerial": { center: [-81.45, 30.42], zoom: 8.6, pitch: 44, bearing: -8 },

  // Heymann Williams — Amelia Island and Nassau County.
  "work-heymann-williams-coastal": {
    center: [-81.48, 30.61],
    zoom: 11.2,
    pitch: 50,
    bearing: 16,
  },

  // Sold on Amelia Island — downtown Fernandina, where the two agents work.
  "work-sold-on-amelia-island": {
    center: [-81.4637, 30.6697],
    zoom: 13.4,
    pitch: 56,
    bearing: -24,
  },

  // Crane Island — the exact USGS coordinate.
  "work-crane-island-bhhs": {
    center: [-81.4773, 30.6125],
    zoom: 14.6,
    pitch: 60,
    bearing: 32,
  },

  // Ron Heymann — the island's north end, Fort Clinch.
  "work-ron-heymann-agent-page": {
    center: [-81.4545, 30.7047],
    zoom: 12.8,
    pitch: 52,
    bearing: -30,
  },

  capabilities: { center: [-81.44, 30.65], zoom: 11.6, pitch: 54, bearing: 8 },
  pricing: { center: [-81.46, 30.62], zoom: 10.6, pitch: 46, bearing: -20 },
  contact: { center: [-81.47, 30.66], zoom: 11.8, pitch: 58, bearing: 24 },
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
