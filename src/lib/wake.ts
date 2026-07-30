import { BEACONS } from "./destinations";

/**
 * The wake — the visitor's own track across the chart.
 *
 * Every navigation to a destination that carries a beacon is logged here, in
 * order, for this session. LiveMap draws the track as a hairline between the
 * marks; the rail counts it ("4 of 12 marks charted"). Session-scoped on
 * purpose — it is a chart of *this* passage, matching the Opening's
 * once-per-session semantics — and honest by construction: it can only record
 * places actually visited.
 *
 * The store lives outside React so ordering never matters: a navigation that
 * lands before the map has loaded is captured here and drawn at load; anything
 * later reaches the map through the registered sink.
 */

const KEY = "seamark:wake";

const BEACON_BY_PATH = new Map(BEACONS.map((d) => [d.path, d]));

export const TOTAL_MARKS = BEACONS.length;

function load(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is string => typeof p === "string" && BEACON_BY_PATH.has(p)
    );
  } catch {
    // Private browsing may refuse storage; the wake just starts empty.
    return [];
  }
}

let track: string[] = load();

const listeners = new Set<() => void>();
let mapSink: ((coords: [number, number][]) => void) | null = null;

/*
 * useSyncExternalStore wants a stable snapshot value between changes, so the
 * count is cached and only replaced when the track actually grows.
 */
let snapshot = { charted: new Set(track).size, last: track[track.length - 1] ?? null };

function persist() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(track));
  } catch {
    /* ignore */
  }
}

/** The track as coordinates, in visit order. */
export function wakeCoords(): [number, number][] {
  return track.map((p) => BEACON_BY_PATH.get(p)!.beacon.center);
}

/** Record a navigation. Ignores non-beacon paths and consecutive repeats. */
export function recordVisit(pathname: string) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (!BEACON_BY_PATH.has(clean)) return;
  if (track[track.length - 1] === clean) return;

  track = [...track, clean];
  snapshot = { charted: new Set(track).size, last: clean };
  persist();
  mapSink?.(wakeCoords());
  for (const cb of listeners) cb();
}

/**
 * The mark visited before the current one — the start of the current leg.
 * Null when the passage has just begun.
 */
export function previousMark(): (typeof BEACONS)[number] | null {
  if (track.length < 2) return null;
  return BEACON_BY_PATH.get(track[track.length - 2]) ?? null;
}

/* ── React seam ───────────────────────────────────────────────────────── */

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot() {
  return snapshot;
}

/* ── Map seam ─────────────────────────────────────────────────────────── */

/** LiveMap registers on load; pass null on teardown. */
export function registerWakeSink(fn: ((coords: [number, number][]) => void) | null) {
  mapSink = fn;
  if (fn) fn(wakeCoords());
}
