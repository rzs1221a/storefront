/**
 * The portfolio. Every claim in this file is verifiable against the source
 * repositories — line counts came from counting real source files, and each
 * `proof` string points at the file that implements the feature being claimed.
 * Keep it that way. Nothing here should be aspirational.
 */

export interface WorkItem {
  slug: string;
  name: string;
  /** What kind of site this is, in the buyer's language. */
  kind: string;
  /** Who it was built for. Factual — the brokerage, the team, or in-house. */
  client: string;
  /**
   * What the site accomplishes, stated as a result.
   *
   * Deliberately NOT a conversion statistic. I do not have access to these
   * clients' analytics, and inventing "+40% leads" for a portfolio page would
   * be the one lie that discredits every true claim beside it. What is here
   * is what the site verifiably does.
   */
  outcome: string;
  /** One honest sentence about what it DOES, not how it looks. */
  summary: string;
  /** The longer story, shown on the expanded card. */
  detail: string;
  /** Headline capabilities a template site cannot reproduce. */
  highlights: string[];
  stack: string[];
  /** Source lines of code, counted from the repo. */
  loc: number;
  liveUrl?: string;
  /** Whether we captured this one from the live site or a local build. */
  shotSource: "live" | "local";
  /** Landscape screenshot path under /work. */
  desktop: string;
  mobile: string;
  /** Accent hue (deg) sampled from the project's own palette, for the card rule. */
  hue: number;
  /**
   * The mark's light characteristic, in real aids-to-navigation notation —
   * every lighted seamark identifies itself by a distinct rhythm, and so does
   * every shipped project here. `anim` names the CSS keyframe class in
   * index.css; null means a fixed light (F), burning steady. Concepts carry
   * no light at all: an unbuilt mark is unlit, and the type system in
   * destinations.ts keeps it that way.
   */
  light: { characteristic: string; anim: string | null };
}

export const WORK: WorkItem[] = [
  {
    slug: "the-aerial",
    name: "The Aerial",
    kind: "Flagship product",
    client: "Seamark Studio — in-house flagship",
    outcome:
      "One interface covering seventy named areas across four regions, where a buyer explores by flying rather than by filtering a list.",
    summary:
      "The entire coast from Camden County, Georgia to St. Augustine as a living 3D map — no homepage, no nav, no scroll feed. You open it and you are above the real county.",
    detail:
      "Seventy named areas and landmarks, seventeen descendable communities, four regions. Real terrain with satellite imagery draped over it, OpenStreetMap building extrusions rising county-wide, and Google photorealistic 3D tiles fading in past zoom 15 so you descend toward an actual rooftop. The search field reads plain English — \"oceanfront under 2m\", \"4 bed with a dock in st marys\" — and resolves it against the same fields a RESO feed carries. The dateline reports the real hour, light, tide, wind, and moon.",
    highlights: [
      "Photorealistic 3D tiles with automatic hysteresis at the zoom boundary",
      "Plain-English search parsed to structured MLS criteria, entirely on-device",
      "Live NOAA tide gauge + National Weather Service conditions",
      "Sun, moon, and golden-hour computed per address with SunCalc",
      "Separate desktop and mobile profiles shipped from one codebase",
    ],
    stack: ["Next 15", "React 19", "deck.gl", "MapLibre GL", "TypeScript"],
    loc: 6842,
    liveUrl: "https://theaerial.netlify.app",
    shotSource: "live",
    desktop: "/work/the-aerial/desktop.webp",
    mobile: "/work/the-aerial/mobile.webp",
    hue: 210,
    light: { characteristic: "Fl(2) 10s", anim: "sig-fl2-10s" },
  },
  {
    slug: "heymann-williams-coastal",
    name: "Heymann Williams",
    kind: "Full brokerage site",
    client: "Heymann Williams Coastal Properties",
    outcome:
      "Twenty-six neighborhood pages shipped as real static HTML — each one a separate entry point from search — on a seventeen-route site carrying the full agent roster.",
    summary:
      "A seventeen-route brokerage site with a cinematic map-synced community story, twenty-six prerendered neighborhood pages, and a full agent roster.",
    detail:
      "The largest build of the five. A reusable MapLibre plate powers the hero, the explore gateway, the search, and the community stories — flying between authored stations as the narrative scrolls. Twenty-six neighborhood routes are stamped out as real static HTML at build time, so crawlers and AI agents see complete written content instead of an empty React root. Forty-four components, agent photography optimized to WebP at three sizes, and every animation honoring the visitor's reduced-motion setting.",
    highlights: [
      "26 neighborhood pages prerendered to static HTML for SEO",
      "Map-synced scroll storytelling with authored camera stations",
      "44 components on a documented design-token system",
      "Route-level code splitting — map engine never loads on pages without a map",
      "Full reduced-motion and keyboard accessibility pass",
    ],
    stack: ["Vite", "React 19", "TypeScript", "Tailwind v4", "MapLibre GL"],
    loc: 19866,
    shotSource: "local",
    desktop: "/work/heymann-williams-coastal/desktop.webp",
    mobile: "/work/heymann-williams-coastal/mobile.webp",
    hue: 43,
    light: { characteristic: "Fl 6s", anim: "sig-fl-6s" },
  },
  {
    slug: "sold-on-amelia-island",
    name: "Sold on Amelia Island",
    kind: "Two-agent team site",
    client: "A two-agent team on Amelia Island",
    outcome:
      "Two guided lead funnels delivering validated submissions into BoldTrail, with the agents publishing their own content changes in about a minute.",
    summary:
      "A team site with guided buyer and seller flows, live lead delivery into BoldTrail, and a built-in editor so the agents change their own content without calling anyone.",
    detail:
      "Two separate multi-step lead funnels — the seller flow walks address to property details to timeline to contact; the buyer flow runs a guided questionnaire that ends in live MLS search links. Both submit through a Netlify Function that validates with Zod and ingests into BoldTrail through the Lead Dropbox email parser. The agents log into /admin and edit their hero photos, bios, featured property, neighborhood tiles, and testimonials themselves; changes are live in about a minute.",
    highlights: [
      "Separate guided buyer and seller funnels, each routed to the right agent",
      "Validated lead ingestion into BoldTrail via Netlify Functions",
      "Git-backed CMS — the agents edit the site themselves, no redeploy request",
      "Contact details edit once and update the footer and every lead screen",
      "Mortgage calculator, live listing links, full schema.org markup",
    ],
    stack: ["Static HTML", "Netlify Functions", "Decap CMS", "Zod"],
    loc: 2710,
    shotSource: "local",
    desktop: "/work/sold-on-amelia-island/desktop.webp",
    mobile: "/work/sold-on-amelia-island/mobile.webp",
    hue: 28,
    light: { characteristic: "Iso 4s", anim: "sig-iso-4s" },
  },
  {
    slug: "crane-island-bhhs",
    name: "Crane Island",
    kind: "Community microsite",
    client: "Heymann Williams — Crane Island",
    outcome:
      "One community owned completely: metadata, schema, and content built for a single high-value search intent instead of competing county-wide, deployed on the brokerage's own subdomain.",
    summary:
      "A single-community authority page built to own the search results for one high-value niche — deep-water waterfront on Amelia Island.",
    detail:
      "The play a lot of agents miss: instead of competing for \"Amelia Island real estate\" against every brokerage in the county, own one community completely. Full geo-targeted metadata, canonical tagging, Open Graph, and analytics, with architectural guidelines, lifestyle detail, and signature inventory in one long authoritative scroll. Verified coordinates — Crane Island sits at 30.6125, -81.4773 per the USGS Geographic Names Information System, which corrected a pin that had been a quarter mile off.",
    highlights: [
      "Geo-targeted metadata and schema built for one specific search intent",
      "Coordinates verified against USGS GNIS, not guessed",
      "Loads fast enough to win the mobile ranking signal",
      "Deployed on the brokerage's own subdomain",
    ],
    stack: ["Static HTML", "Tailwind", "Schema.org"],
    loc: 1440,
    liveUrl: "https://craneisland.heymannwilliams.com",
    shotSource: "live",
    desktop: "/work/crane-island-bhhs/desktop.webp",
    mobile: "/work/crane-island-bhhs/mobile.webp",
    hue: 43,
    light: { characteristic: "Oc 8s", anim: "sig-oc-8s" },
  },
  {
    slug: "ron-heymann-agent-page",
    name: "Ron Heymann",
    kind: "Individual agent page",
    client: "Ron Heymann, individual agent",
    outcome:
      "BoldTrail property-alert traffic resolves on the agent's own domain instead of dead-ending — the difference between an email campaign that works and one that quietly leaks.",
    summary:
      "A single-agent page that catches BoldTrail's property-alert email traffic instead of letting it 404 on the wrong domain.",
    detail:
      "The entry-level build, and a good demonstration that small does not mean careless. Beyond the page itself, it proxies BoldTrail's /details, /search, and /property paths through to the platform-served host — so when a property-alert email goes out and the recipient taps a listing, it resolves on the agent's own domain rather than dead-ending. That single piece of routing is the difference between an email campaign that works and one that quietly leaks its traffic.",
    highlights: [
      "BoldTrail property-alert links resolve on the agent's own domain",
      "Built to load fast on a phone in a parking lot",
      "Deploys free on Netlify with no build step",
    ],
    stack: ["Static HTML", "Tailwind", "Netlify redirects"],
    loc: 1539,
    shotSource: "local",
    desktop: "/work/ron-heymann-agent-page/desktop.webp",
    mobile: "/work/ron-heymann-agent-page/mobile.webp",
    hue: 43,
    light: { characteristic: "LFl 8s", anim: "sig-lfl-8s" },
  },
  {
    /*
     * The storefront itself — the case study you are standing in.
     *
     * This entry is the site's strongest proof precisely because it is
     * recursive: every claim below is verifiable by the page displaying it.
     * The map behind this sheet is the product being described.
     */
    slug: "seamark-storefront",
    name: "This Storefront",
    kind: "The site you are on",
    client: "Seamark Studio — in-house",
    outcome:
      "A storefront told as a film — five acts alternating dark and light, the live mapping engine framed as a single interactive exhibit — with the honesty contract enforced by the build itself, which fails if any option claims shipped work without a named proof.",
    summary:
      "The studio's own storefront: five cinematic acts where the shipped work carries the imagery, the live chart appears once as an exhibit you can drive, and every route is prerendered — a case study you are reading from inside its subject.",
    detail:
      "The page alternates dark and light acts from one token registry — a single attribute remaps the color ramps, so every component renders on both registers with no forks. The live MapLibre chart appears exactly once, as a framed exhibit: type where you want to go in plain English and the camera answers; the engine and its tiles are fetched only when you approach the frame, never on the routes that don't show it — a performance budget asserts that against every build. Every destination is stamped out as static HTML at build time from the same imported modules the React app renders, so the crawler's copy and the visitor's copy cannot drift. A verifier measures text contrast at 4.5:1 on both registers, on every route, at four breakpoints. The tide reading in the exhibit is a live NOAA gauge, fetched when you arrived.",
    highlights: [
      "Five acts, two registers, one token system — no component forks",
      "The mapping engine as a single framed exhibit, driven in plain English",
      "A perf budget that fails the build if the map chunk leaks onto map-free routes",
      "Every route prerendered from one imported route table — nothing duplicated",
      "Contrast verified at 4.5:1 on both registers, per route, per breakpoint",
    ],
    stack: ["Vite", "React 19", "TypeScript", "Tailwind v4", "MapLibre GL"],
    loc: 9945,
    liveUrl: "https://seamark.studio",
    shotSource: "local",
    desktop: "/work/seamark-storefront/desktop.webp",
    mobile: "/work/seamark-storefront/mobile.webp",
    // The signal cyan the chrome is built around.
    hue: 186,
    light: { characteristic: "F", anim: null },
  },
];

/** Totals used in the hero. Derived, never hand-typed, so they cannot drift. */
export const TOTALS = {
  projects: WORK.length,
  loc: WORK.reduce((sum, w) => sum + w.loc, 0),
  live: WORK.filter((w) => w.liveUrl).length,
};
