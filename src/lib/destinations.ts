import { WORK } from "./work";
import { FRAMES, type CameraFrame } from "./cameraFrames";

/**
 * The route table, and the single source of truth for everything that has a
 * URL, a place on the map, and a name in the rail.
 *
 * This site is not a page with a map on it — it is a map you navigate, and a
 * destination that cannot be linked to or shared is not a page. Every entry
 * here produces a real route, a real camera position, and a prerendered HTML
 * file with its written content intact (see scripts/prerender.mjs).
 *
 * `blurb` is what the crawler and the no-JS visitor read first, so it must
 * stand on its own as a sentence rather than teasing something below it.
 */

export interface Destination {
  /** URL path. */
  path: string;
  /** Key into FRAMES — where the camera goes. */
  frame: string;
  /** Rail label. Plain words, never an icon alone. */
  label: string;
  /** Page title, without the brand suffix. */
  title: string;
  /** Meta description and the opening line of the prerendered body. */
  blurb: string;
  /** Grouping for the rail and the mobile tab bar. */
  group: "coast" | "work" | "studio";
  /**
   * Position in the primary commercial navigation, if it belongs there.
   *
   * Only five destinations carry one — Home, Packages, Work, Capabilities,
   * Contact. Everything else is real, linkable, and prerendered, but reached
   * from within a sheet rather than from the top level. A nav that lists
   * everything ranks nothing.
   */
  navOrder?: number;
  /** Projects carry a marker on the plane; studio destinations do not. */
  beacon?: { center: [number, number]; name: string };
}

/*
 * Where each project's marker sits.
 *
 * Deliberately NOT the camera centre. A camera frame answers "what should I be
 * looking at when this opens" — for The Aerial that is the whole corridor,
 * whose midpoint lands in Jacksonville, nowhere near the product. A beacon
 * answers "where is this thing", and five beacons sharing a coastline need to
 * be far enough apart to be separately clickable.
 *
 * All real places on and around Amelia Island, from the-aerial/lib/geo.ts and
 * the USGS figure for Crane Island.
 */
const BEACON_AT: Record<string, [number, number]> = {
  // The flagship covers the whole coast; its marker sits over the island it
  // knows best, at the Plantation end.
  "the-aerial": [-81.447, 30.572],
  // The brokerage, at Amelia Park.
  "heymann-williams-coastal": [-81.453, 30.636],
  // Kelly and Will work out of downtown Fernandina.
  "sold-on-amelia-island": [-81.4637, 30.6697],
  // USGS Geographic Names Information System.
  "crane-island-bhhs": [-81.4773, 30.6125],
  // The island's north end, by Fort Clinch.
  "ron-heymann-agent-page": [-81.4545, 30.7047],
};

const workDestinations: Destination[] = WORK.map((item) => ({
  path: `/work/${item.slug}`,
  frame: `work-${item.slug}`,
  label: item.name,
  title: `${item.name} — ${item.kind}`,
  blurb: item.summary,
  group: "work" as const,
  beacon: { center: BEACON_AT[item.slug], name: item.name },
}));

export const DESTINATIONS: Destination[] = [
  {
    path: "/",
    frame: "top",
    label: "Home",
    title: "Custom websites for real estate professionals",
    blurb:
      "Bespoke, high-performance websites for BHHS agents — built once, owned outright, no monthly platform fee. Five sites shipped along this coast.",
    group: "coast",
    navOrder: 1,
  },
  ...workDestinations,
  {
    path: "/packages",
    frame: "pricing",
    label: "Packages",
    title: "Three packages. Pay once, own it forever",
    blurb:
      "An agent page, a community site, or a full flagship build. One fee agreed in writing before anything starts, and after launch you owe nothing — hosting is free at the traffic these sites see, and the code is yours.",
    group: "studio",
    navOrder: 2,
  },
  {
    path: "/work",
    frame: "top",
    label: "Work & case studies",
    title: "Five sites. All of them real",
    blurb:
      "Five shipped real estate sites along the Amelia Island coast — a flagship 3D map, a full brokerage site, a two-agent team site, a community microsite, and a single-agent page.",
    group: "studio",
    navOrder: 3,
  },
  {
    path: "/capabilities",
    frame: "capabilities",
    label: "Capabilities demo",
    title: "Things a template cannot do for you",
    blurb:
      "Live 3D mapping, real-time NOAA tide and weather feeds, plain-English property search, prerendered pages that actually rank, and lead routing into BoldTrail. Each one is running right now, on this page or a site you can visit.",
    group: "studio",
    navOrder: 4,
  },
  {
    path: "/contact",
    frame: "contact",
    label: "Contact",
    title: "Tell me what you need",
    blurb:
      "Twenty minutes on the phone and you will know whether this is worth doing. Call (904) 548-8222 or send a note.",
    group: "studio",
    navOrder: 5,
  },
  {
    path: "/process",
    frame: "pricing",
    label: "How it goes",
    title: "No surprises",
    blurb:
      "A conversation, a fixed quote, the design before any production code, a live preview you can check any time, and launch in your own accounts.",
    group: "studio",
  },
  {
    path: "/questions",
    frame: "capabilities",
    label: "Questions",
    title: "The things people ask",
    blurb:
      "Who owns the site, what it costs to run, whether your leads still reach BoldTrail, and what happens if you change brokerages.",
    group: "studio",
  },
];

export const WORK_DESTINATIONS = DESTINATIONS.filter((d) => d.group === "work");
export const STUDIO_DESTINATIONS = DESTINATIONS.filter((d) => d.group === "studio");

/**
 * The commercial navigation, in order: Home, Packages, Work, Capabilities,
 * Contact. This is what the rail and the tab bar lead with — the five things a
 * buyer looks for by name on any site that sells something.
 */
export const PRIMARY_NAV = DESTINATIONS.filter(
  (d): d is Destination & { navOrder: number } => d.navOrder !== undefined
).sort((a, b) => a.navOrder - b.navOrder);

/**
 * Paths that moved when the site was productized. Kept as redirects rather
 * than deleted: they were prerendered, submitted to the sitemap, and may be
 * linked from anywhere. A 404 on a page that used to rank is a lead lost.
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/build": "/capabilities",
  "/pricing": "/packages",
  "/studio": "/packages",
};

/** Every project marker the map draws. */
export const BEACONS = DESTINATIONS.filter(
  (d): d is Destination & { beacon: NonNullable<Destination["beacon"]> } =>
    Boolean(d.beacon)
);

export function destinationFor(pathname: string): Destination {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return DESTINATIONS.find((d) => d.path === clean) ?? DESTINATIONS[0];
}

export function frameFor(pathname: string): CameraFrame {
  return FRAMES[destinationFor(pathname).frame] ?? FRAMES.top;
}
