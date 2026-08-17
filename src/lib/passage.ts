/**
 * The Passage — the route a lead travels, as a chartable object.
 *
 * The old storefront proved this studio can build extraordinary *places*: a
 * beacon per shipped site, a camera that flies to each one. But a place is
 * static and a lead is a voyage, so the argument the map was making was the
 * wrong one. A nautical chart does not exist to show where lighthouses are —
 * it exists so a vessel can get from open water to a berth. The lights are
 * instruments of the route.
 *
 * So this file is the route. Four stations, in the order a stranger actually
 * travels them, and it is the single vocabulary the whole site now speaks:
 *
 *   - the Passage hero draws it at full size and animates a vessel down it
 *   - every tier card on /packages draws it in miniature, lit to show how
 *     much of the route that build size actually buys
 *   - /watch draws the stations it keeps lit after launch
 *
 * Nothing here claims an outcome. Each station is a MECHANISM — a thing that
 * either exists or does not — which is the same line work.ts and catalog.ts
 * already hold: no percentages, no "+40% leads", nothing a visitor has to
 * take on trust. A mechanism you can watch beats a statistic you must believe.
 *
 * Coordinates live here rather than in the component because three different
 * renderings share them, and a station that drifts between the hero and the
 * tier cards would break the one thing the diagram is for: teaching a
 * vocabulary in the hero, then speaking it everywhere else.
 */

import type { TierSlug } from "./offer";

export type StationSlug = "channel" | "found" | "landed" | "captured";

export interface Station {
  slug: StationSlug;
  /** The word that lights up. Uppercase in the hero, as a station name. */
  name: string;
  /** What the station is, in the fewest words that stay true. */
  role: string;
  /** One sentence for the static/reduced-motion rendering and the crawler. */
  detail: string;
}

/**
 * The four stations, open water to berth.
 *
 * `channel` is the only one that is not a thing I build: it is where demand
 * comes from. Organic search puts a vessel in the water for free; a paid
 * channel puts more of them there for money, with a meter running. Drawing it
 * as a station rather than hiding it is what lets the tier diagrams stay
 * honest — a build that does not buy traffic leaves station one hollow, and
 * says so.
 */
export const STATIONS: Station[] = [
  {
    slug: "channel",
    name: "Open water",
    role: "Where the search happens",
    detail:
      "Someone types what they want into a search box. Nobody owns this water — you either have a light on it or you do not.",
  },
  {
    slug: "found",
    name: "Found",
    role: "Your light sweeps them",
    detail:
      "Your Google Business Profile and your ranked pages put you in front of that search, in the local pack, before anyone has clicked anything.",
  },
  {
    slug: "landed",
    name: "Landed",
    role: "They arrive on your page",
    detail:
      "The click lands on a page you own — fast, prerendered, and built for that intent — instead of on a portal that sells the same person back to you.",
  },
  {
    slug: "captured",
    name: "Captured",
    role: "The record reaches your CRM",
    detail:
      "The form validates, the submission is parsed, and the contact appears in BoldTrail where your follow-up already lives. No second inbox to check.",
  },
];

export const STATION_INDEX: Record<StationSlug, number> = Object.fromEntries(
  STATIONS.map((s, i) => [s.slug, i])
) as Record<StationSlug, number>;

/* ── The drawn route ──────────────────────────────────────────────────── */

export interface RouteGeometry {
  viewBox: string;
  width: number;
  height: number;
  /** The course line itself. Stations sit ON this path, by construction. */
  d: string;
  /** Where each station group anchors, in viewBox units. */
  at: Record<StationSlug, [number, number]>;
  /** Where each station's name sits relative to its marker, and how it aligns. */
  label: Record<StationSlug, { dx: number; dy: number; anchor: "start" | "middle" | "end" }>;
  /** The instrument panels, in viewBox units: x, y, width, height. */
  panel: {
    search: Panel;
    pack: Panel;
    pier: Panel;
    terminal: Panel;
  };
  /** How far the beacon's beam reaches, in viewBox units. */
  beamReach: number;
}

export interface Panel {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Two orientations of the same voyage.
 *
 * On a phone the Passage does not shrink — it rotates. The route runs top to
 * bottom and the visitor's own thumb drives the vessel down it, which is
 * arguably the better version: the scroll gesture *is* the journey. Same
 * stations, same order, same path-following code; only the geometry swaps.
 *
 * Every `at` coordinate is an endpoint of a curve segment in `d`, so a station
 * marker and the vessel passing it are never a pixel apart. Change one and you
 * must change the other.
 */
export const ROUTE_WIDE: RouteGeometry = {
  viewBox: "0 0 1000 420",
  width: 1000,
  height: 420,
  d: "M 70 300 C 160 320, 250 250, 330 200 S 520 200, 620 250 S 830 190, 930 130",
  at: {
    channel: [70, 300],
    found: [330, 200],
    landed: [620, 250],
    captured: [930, 130],
  },
  label: {
    channel: { dx: 0, dy: 34, anchor: "middle" },
    found: { dx: 0, dy: 40, anchor: "middle" },
    landed: { dx: 0, dy: -22, anchor: "middle" },
    captured: { dx: 0, dy: -22, anchor: "middle" },
  },
  panel: {
    search: { x: 14, y: 176, w: 272, h: 74 },
    pack: { x: 190, y: 28, w: 300, h: 112 },
    pier: { x: 452, y: 292, w: 220, h: 112 },
    terminal: { x: 706, y: 286, w: 282, h: 126 },
  },
  beamReach: 250,
};

/**
 * The phone. Note what this is NOT: the wide route scaled down. A 2.4:1 scene
 * squeezed onto a 390px screen is four illegible panels, so the route rotates
 * instead — it runs down the left spine and the instruments stack beside it,
 * which leaves every panel at readable width and turns the visitor's own
 * scroll into the thing that drives the vessel down the funnel.
 */
export const ROUTE_TALL: RouteGeometry = {
  viewBox: "0 0 440 1000",
  width: 440,
  height: 1000,
  d: "M 80 130 C 120 220, 90 320, 130 400 S 60 570, 75 660 S 130 830, 130 920",
  at: {
    channel: [80, 130],
    found: [130, 400],
    landed: [75, 660],
    captured: [130, 920],
  },
  label: {
    channel: { dx: 0, dy: 34, anchor: "start" },
    found: { dx: 0, dy: 34, anchor: "start" },
    landed: { dx: 0, dy: 34, anchor: "start" },
    captured: { dx: 0, dy: -26, anchor: "start" },
  },
  panel: {
    search: { x: 190, y: 60, w: 236, h: 92 },
    pack: { x: 190, y: 326, w: 236, h: 140 },
    pier: { x: 190, y: 580, w: 236, h: 150 },
    terminal: { x: 190, y: 842, w: 236, h: 150 },
  },
  beamReach: 190,
};

/* ── The loop's timeline ──────────────────────────────────────────────── */

/**
 * One cycle, normalized to 0–1 so the two drivers can share it: on desktop a
 * rAF loop advances it with the clock, on a phone the scroll position sets it
 * directly. Everything the scene draws is a pure function of this number,
 * which is what makes the reduced-motion rendering trivial — hold it at 1 and
 * the completed passage draws itself, no animation, no exemption.
 */
export const LOOP_SECONDS = 21;

export interface Beat {
  /** Start and end of this beat, as a fraction of the loop. */
  from: number;
  to: number;
}

export const BEATS = {
  /** The query types itself; the vessel fades in on open water. */
  query: { from: 0.0, to: 0.16 },
  /** The beacon sweeps; when the beam crosses the vessel, the pack lands. */
  sweep: { from: 0.16, to: 0.3 },
  /** The vessel runs the plotted course down to the pier. */
  run: { from: 0.3, to: 0.56 },
  /** The form fills and the record travels off-chart into the CRM. */
  capture: { from: 0.56, to: 0.8 },
  /** Two beats of held, complete state before the chart resets. */
  hold: { from: 0.8, to: 1.0 },
} satisfies Record<string, Beat>;

/** 0 before the beat, 1 after it, eased in between. Every element uses this. */
export function beatProgress(progress: number, beat: Beat): number {
  if (progress <= beat.from) return 0;
  if (progress >= beat.to) return 1;
  return easeOutCubic((progress - beat.from) / (beat.to - beat.from));
}

/** Which stations are lit at a given loop position. */
export function litAt(progress: number): StationSlug[] {
  const lit: StationSlug[] = [];
  if (progress >= BEATS.query.from) lit.push("channel");
  if (progress >= BEATS.sweep.to) lit.push("found");
  if (progress >= BEATS.run.to) lit.push("landed");
  if (progress >= BEATS.capture.to) lit.push("captured");
  return lit;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** The query that types itself. Real intent, real market, no invented volume. */
export const DEMO_QUERY = "sell my house amelia island";

/* ── What each build size actually covers ─────────────────────────────── */

/**
 * The tier diagrams' whole argument: a buyer comparing builds is comparing how
 * much of the route they are buying, not parsing two feature lists.
 *
 * `note` is what keeps Daymark and Beacon from drawing identically — both
 * cover the same three stations, but at different scale, and the note says so
 * in the diagram itself rather than making the reader infer it. Every note
 * here must be defensible against the tier's own `deliverables` in offer.ts;
 * a diagram that lights a station the build does not deliver would be the
 * exact dishonesty the rest of this codebase is built to prevent.
 */
export type Coverage = Partial<Record<StationSlug, string>>;

export const TIER_COVERAGE: Record<TierSlug, Coverage> = {
  daymark: {
    found: "One page, ranked for your name",
    landed: "A single authoritative page",
    captured: "Form → BoldTrail",
  },
  beacon: {
    found: "Every page its own entry from search",
    landed: "Multi-page, geo-targeted",
    captured: "Guided buyer and seller flows",
  },
  "light-station": {
    channel: "Market pages that keep earning traffic",
    found: "A page for every area you cover",
    landed: "Map-driven, prerendered throughout",
    captured: "Routed to the right agent, validated",
  },
  flagship: {
    channel: "The market itself as the draw",
    found: "The map everyone else embeds",
    landed: "Plain-English search over your feed",
    captured: "Every path ends in your CRM",
  },
};
