import type { CameraFrame } from "./cameraFrames";
import { TIERS } from "./offer";
import { SHOW_PRICING } from "./brand";

/**
 * The catalog — everything for sale, as distinct from everything shipped.
 *
 * work.ts is history and holds itself to "nothing aspirational". This file is
 * the opposite kind of honest: everything here is FOR SALE, not shipped
 * history, and the two must never blur.
 *
 *   - `status: "shipped"` means the pattern is running today in the WORK
 *     project named by `proofSlug`. Never claim shipped without one — the
 *     prerender asserts it and fails the build.
 *   - `status: "concept"` means build-ready and never presented as past work.
 *     Concept copy describes deliverables (the future tense of a sale), never
 *     outcomes (the past tense of work). No invented clients, screenshots, or
 *     metrics, anywhere, ever.
 *
 * Six flagship concepts carry a beacon and a camera frame: real, verified
 * places down the corridor The Aerial covers, far enough from the Amelia
 * cluster to be separately readable. Coordinates follow the repo rule — a map
 * that flies to the wrong place is worse than one that does not fly at all —
 * and each one is annotated with its source.
 */

export type OfferingStatus = "shipped" | "concept";

export type CategorySlug =
  | "agents"
  | "brokerages"
  | "communities"
  | "listings"
  | "tools";

export interface OfferingCategory {
  slug: CategorySlug;
  name: string;
  /** One sentence, used in the catalog sheet and the prerendered body. */
  blurb: string;
  order: number;
}

export interface Offering {
  slug: string;
  name: string;
  category: CategorySlug;
  /** Who buys this, in one line. */
  audience: string;
  /** The one-liner on the catalog row. Also the route's verify phrase. */
  pitch: string;
  /** Meta description and prerender blurb — must stand alone as a sentence. */
  summary: string;
  /** The long paragraph on the detail sheet. */
  detail: string;
  /** What is actually handed over. Deliverables, never past outcomes. */
  includes: string[];
  /** The build size that prices it, from offer.ts. */
  tierSlug: "agent-page" | "community-site" | "flagship";
  /** Optional price override; tier price otherwise. SHOW_PRICING gates both. */
  priceFrom?: number | null;
  timeline: string;
  status: OfferingStatus;
  /** WorkItem slug that proves the pattern. REQUIRED when status is "shipped". */
  proofSlug?: string;
  /**
   * For flagship concepts only: a marker on the coast and its own camera.
   * The marker means "this is the kind of place this build belongs", never
   * "this was built here".
   */
  beacon?: { center: [number, number]; name: string };
  frame?: CameraFrame;
  /** Accent hue (deg) for the row rule and the concept figure. */
  hue: number;
}

export const CATEGORIES: OfferingCategory[] = [
  {
    slug: "agents",
    name: "For the individual agent",
    blurb: "One agent, one market, one link that works everywhere.",
    order: 1,
  },
  {
    slug: "brokerages",
    name: "Teams & brokerages",
    blurb: "A roster is a distribution network. Treat it like one.",
    order: 2,
  },
  {
    slug: "communities",
    name: "Communities & developments",
    blurb: "Own one place completely instead of renting the whole county.",
    order: 3,
  },
  {
    slug: "listings",
    name: "Listings & campaigns",
    blurb: "A listing is a marketing campaign with a deadline.",
    order: 4,
  },
  {
    slug: "tools",
    name: "Search, data & tools",
    blurb: "The parts that make a site an instrument instead of a brochure.",
    order: 5,
  },
];

/* Category hues, so the catalog reads as five families rather than 24 strays. */
const HUE: Record<CategorySlug, number> = {
  agents: 28,
  brokerages: 43,
  communities: 160,
  listings: 210,
  tools: 280,
};

export const CATALOG: Offering[] = [
  /* ── For the individual agent ─────────────────────────────────────── */
  {
    slug: "agent-page",
    name: "Agent Page",
    category: "agents",
    audience: "A single agent who needs a real home online.",
    pitch:
      "One authoritative page that ranks for your name and routes every enquiry into your CRM.",
    summary:
      "A single-agent page that loads instantly, ranks for your name, and routes every enquiry into BoldTrail or your inbox — with your property-alert links resolving on your own domain.",
    detail:
      "The entry-level build, and the one most agents actually need first. One page, designed for you rather than assembled from a template, carrying your bio, listings, testimonials, and a lead form that lands in your CRM. It also does the quiet job that earns its keep: BoldTrail's property-alert emails send traffic to /details and /search paths, and this page proxies them through to the platform host so that traffic resolves on your domain instead of dead-ending.",
    includes: [
      "Custom design — not a template with your headshot dropped in",
      "Bio, listings, testimonials, and contact",
      "Lead form routed into BoldTrail or your inbox",
      "Property-alert links resolving on your own domain",
      "Full SEO: metadata, Open Graph, schema.org, sitemap",
      "Free hosting on Netlify, in your account",
    ],
    tierSlug: "agent-page",
    timeline: "About one week",
    status: "shipped",
    proofSlug: "ron-heymann-agent-page",
    hue: HUE.agents,
  },
  {
    slug: "agent-brand-site",
    name: "Agent Brand Site",
    category: "agents",
    audience: "An agent whose name is the brand.",
    pitch:
      "A multi-page personal site built around your name instead of your brokerage's.",
    summary:
      "A multi-page personal site — bio, areas served, testimonials, sold gallery — built around the agent's own name, so the brand survives a brokerage change intact.",
    detail:
      "The step past a single page: a small site where every route works for your name. Areas served get their own pages so each can rank on its own, testimonials read as a body of evidence rather than a carousel, and the sold gallery makes the record visible. Because you own the code and the domain, a brokerage change means swapping a logo — not starting over.",
    includes: [
      "Everything in Agent Page",
      "Separate pages for each area you serve, each able to rank",
      "Sold gallery and structured testimonials",
      "About page written for search, not just for visitors",
      "Content editor so you update it yourself",
    ],
    tierSlug: "community-site",
    timeline: "Two to three weeks",
    status: "concept",
    hue: HUE.agents,
  },
  {
    slug: "home-valuation-funnel",
    name: "Home Valuation Funnel",
    category: "agents",
    audience: "An agent who wants seller leads, specifically.",
    pitch:
      "A \"what's my home worth\" seller magnet that walks address to details to contact, validated into your CRM.",
    summary:
      "A guided what's-my-home-worth funnel — address, property details, timeline, contact — delivering validated seller leads into BoldTrail rather than a raw form dump.",
    detail:
      "Seller leads are the ones worth building for, and a valuation page is still the strongest magnet for them. This is a guided flow rather than a single form: address first, then property details, then timeline, then contact — each step small enough to finish. Submissions validate before they send, then ingest into BoldTrail through the same Lead Dropbox pattern already running in shipped work, so the leads land where your follow-up already lives.",
    includes: [
      "Multi-step valuation flow designed to be finished, not abandoned",
      "Validated submissions — no junk addresses in your CRM",
      "Lead ingestion into BoldTrail or your inbox",
      "A results page that books the conversation, not a fake instant number",
      "Runs standalone on its own domain or inside an existing site",
    ],
    tierSlug: "agent-page",
    timeline: "About one week",
    status: "concept",
    proofSlug: "sold-on-amelia-island",
    hue: HUE.agents,
  },
  {
    slug: "relocation-guide",
    name: "Relocation Guide",
    category: "agents",
    audience: "An agent whose buyers arrive from out of state.",
    pitch:
      "Own \"moving to your market\" — the buyer who hasn't picked an agent yet because they haven't picked a town.",
    summary:
      "A relocation content hub for one market — neighborhoods, schools, commutes, cost of living — built to catch the out-of-state buyer months before they contact any agent.",
    detail:
      "The most valuable buyer on the internet is the one who typed \"moving to\" — months out, unattached, and reading everything. A relocation guide is a real content site: neighborhoods compared honestly, schools and commutes and costs laid out, each page prerendered as static HTML so it can rank on its own. By the time that reader wants a showing, you are not one of the agents they found — you are the one who already helped them.",
    includes: [
      "A content hub for one market, structured around real relocation questions",
      "Per-neighborhood comparison pages, each a separate entry point from search",
      "Prerendered static HTML — readable by crawlers and AI assistants",
      "Lead capture tuned to the research phase, not just \"contact me\"",
      "Content editor so the guide grows after launch",
    ],
    tierSlug: "community-site",
    timeline: "Two to three weeks",
    status: "concept",
    // St. Marys, GA — the corridor's northern anchor. GNIS: 30.7305, -81.5465.
    beacon: { center: [-81.5465, 30.7305], name: "St. Marys" },
    frame: { center: [-81.5465, 30.7305], zoom: 14.6, pitch: 60, bearing: -18 },
    hue: HUE.agents,
  },
  {
    slug: "sold-portfolio",
    name: "Sold Portfolio Page",
    category: "agents",
    audience: "An agent with a record worth showing.",
    pitch:
      "Every closing you've had, on a map, as proof — the listing presentation that exists before the appointment.",
    summary:
      "A sold-portfolio page that puts an agent's closing record on a real map, so the listing presentation is already made before the appointment is booked.",
    detail:
      "Sellers pick the agent who has demonstrably done it before, on their street if possible. A sold portfolio puts your record where it can be seen: each closing a pin on a real map, filterable by neighborhood and year, with the story of the ones worth telling. Send the link before a listing appointment and the hardest slide of the presentation has already happened.",
    includes: [
      "Your sold record as an interactive map, not a list",
      "Filter by neighborhood, year, and property type",
      "Case-study treatment for the closings worth the story",
      "Schema markup so the record is legible to search engines",
      "Private by default if you prefer — a link you send, not a page that ranks",
    ],
    tierSlug: "agent-page",
    timeline: "About one week",
    status: "concept",
    hue: HUE.agents,
  },

  /* ── Teams & brokerages ───────────────────────────────────────────── */
  {
    slug: "team-site",
    name: "Team Site",
    category: "brokerages",
    audience: "A team that works as one brand.",
    pitch:
      "Guided buyer and seller funnels, live lead delivery into your CRM, and an editor so the team runs its own content.",
    summary:
      "A team site with separate guided buyer and seller funnels, validated lead delivery into BoldTrail, and a built-in editor so the team changes its own content without calling anyone.",
    detail:
      "A team site earns its keep by routing: the seller flow walks address to details to timeline to contact, the buyer flow runs a guided questionnaire, and each lands with the right agent, validated, inside BoldTrail. The team logs into an editor and changes its own photos, bios, featured properties, and testimonials — live in about a minute, no developer in the loop. This exact pattern is running today.",
    includes: [
      "Separate guided buyer and seller funnels, routed to the right agent",
      "Validated lead ingestion into BoldTrail via serverless functions",
      "Git-backed CMS — the team edits the site itself",
      "Per-agent profiles under one brand",
      "Mortgage calculator, live listing links, full schema markup",
    ],
    tierSlug: "community-site",
    timeline: "Two to three weeks",
    status: "shipped",
    proofSlug: "sold-on-amelia-island",
    hue: HUE.brokerages,
  },
  {
    slug: "brokerage-site",
    name: "Brokerage Site",
    category: "brokerages",
    audience: "A brokerage that wants its site to be the recruiter and the rainmaker.",
    pitch:
      "Multi-route, map-driven, full roster, and a page for every neighborhood you cover — each able to rank on its own.",
    summary:
      "A full brokerage site: multi-route architecture, a cinematic map-synced community story, the complete agent roster, and dozens of neighborhood pages prerendered to rank individually.",
    detail:
      "The full build. A reusable map plate powers the hero, the exploration gateway, and community stories that fly between authored camera stations as the narrative advances. Every neighborhood the brokerage covers gets a real page, stamped out as static HTML at build time, so each is its own entry point from search. The roster, the brand, and the lead flows all live in one system the brokerage owns outright. The pattern is running today on a seventeen-route site with twenty-six neighborhood pages.",
    includes: [
      "Multi-route architecture on a documented design system",
      "Map-synced community storytelling with authored camera stations",
      "Full agent roster with structured profiles",
      "Per-neighborhood pages prerendered to static HTML",
      "Route-level code splitting — the map engine never loads where it isn't used",
      "Full reduced-motion and keyboard accessibility pass",
    ],
    tierSlug: "flagship",
    timeline: "Four to eight weeks",
    status: "shipped",
    proofSlug: "heymann-williams-coastal",
    hue: HUE.brokerages,
  },
  {
    slug: "agent-roster-system",
    name: "Agent Roster System",
    category: "brokerages",
    audience: "A brokerage whose agents each deserve a real page.",
    pitch:
      "A page per agent, stamped out from one system — every agent gets a real personal URL feeding the same brand.",
    summary:
      "A roster system that generates a real page per agent from one template and one data file — every agent gets a personal URL that ranks for their name and feeds the brokerage's lead flow.",
    detail:
      "Most brokerage sites give each agent a database row rendered into a modal. This gives each one a page: a real URL, prerendered, with their bio, their listings, their areas, and their own lead form — all generated from one system, so adding an agent is a data change rather than a project. The brokerage's brand frames every page; the agent's name is what each page ranks for. Built on the same prerender pattern that stamps out neighborhood pages in shipped work.",
    includes: [
      "A real prerendered page per agent, generated from one template",
      "Per-agent lead routing into the brokerage's CRM",
      "Adding an agent is a data edit, not a development request",
      "Roster index with search and area filters",
      "Each page carries schema markup for the agent as an entity",
    ],
    tierSlug: "flagship",
    timeline: "Four to six weeks",
    status: "concept",
    proofSlug: "heymann-williams-coastal",
    hue: HUE.brokerages,
  },
  {
    slug: "recruiting-funnel",
    name: "Agent Recruiting Site",
    category: "brokerages",
    audience: "A broker who recruits as deliberately as they sell.",
    pitch:
      "The site you show an agent you want, not a client — your tech, your brand, your splits, with a private inquiry flow.",
    summary:
      "A recruiting site aimed at agents instead of buyers — the brokerage's technology, culture, and economics presented plainly, with a confidential inquiry flow.",
    detail:
      "Brokerages grow by recruiting, and the pitch to an agent is nothing like the pitch to a buyer — yet almost every brokerage sends both to the same homepage. A recruiting site speaks to the audience that signs: what the brokerage actually provides, what the technology actually does, how the economics actually work, said plainly enough to be believed. The inquiry flow is built for someone employed down the street: discreet, low-commitment, and routed straight to the broker.",
    includes: [
      "A dedicated site speaking to agents, separate from the consumer brand",
      "Technology and marketing stack presented as evidence, not adjectives",
      "Confidential inquiry flow routed directly to the broker",
      "Interview and onboarding content that filters as it attracts",
      "Runs on its own domain or a subdomain of the main site",
    ],
    tierSlug: "community-site",
    timeline: "Two to three weeks",
    status: "concept",
    hue: HUE.brokerages,
  },

  /* ── Communities & developments ───────────────────────────────────── */
  {
    slug: "community-authority-site",
    name: "Community Authority Site",
    category: "communities",
    audience: "An agent or brokerage claiming one community.",
    pitch:
      "One community, owned completely — metadata, schema, and content built for a single high-value search intent.",
    summary:
      "A single-community authority site built to own the search results for one high-value niche, with geo-targeted metadata and structured data aimed at that exact intent.",
    detail:
      "The play most agents miss: instead of competing for the whole county against every brokerage in it, own one community completely. One long authoritative page — architecture, lifestyle, inventory, the honest case for the place — with every technical signal pointed at that single search intent. The pattern is running today for a deep-water waterfront community, on the brokerage's own subdomain, with coordinates verified against USGS GNIS rather than guessed.",
    includes: [
      "Geo-targeted metadata and schema built for one specific search intent",
      "Long-form authority content, structured for both readers and crawlers",
      "Verified coordinates and map embed of the community itself",
      "Fast enough to win the mobile ranking signal",
      "Deployable on your own subdomain",
    ],
    tierSlug: "community-site",
    timeline: "Two to three weeks",
    status: "shipped",
    proofSlug: "crane-island-bhhs",
    hue: HUE.communities,
  },
  {
    slug: "interactive-community-map",
    name: "Interactive Community Map",
    category: "communities",
    audience: "A developer or agent selling a master-planned community.",
    pitch:
      "A development's streets, lots, and amenities as a living 3D map a buyer flies — not a PDF site plan.",
    summary:
      "A master-planned community rendered as a living 3D map — streets, phases, lots, and amenities a buyer can fly through — replacing the static site-plan PDF entirely.",
    detail:
      "Every master-planned community sells from a site plan, and almost every site plan is a PDF scan of a printed board. This replaces it: the community as a living map with real terrain and satellite imagery, streets and phases and amenities as first-class layers, lots clickable down to their facts. The engine is the one already running in shipped work — real 3D flight over real ground — pointed at one development instead of a county.",
    includes: [
      "The community as a living 3D map with real terrain and imagery",
      "Phases, amenities, and lots as clickable layers",
      "Lot-level detail pages that can carry availability",
      "Runs standalone or embedded in the development's existing site",
      "Built on the same map engine as the shipped flagship",
    ],
    tierSlug: "flagship",
    timeline: "Four to six weeks",
    status: "concept",
    proofSlug: "the-aerial",
    // Wildlight, the master-planned community by Yulee — pinned at Yulee's
    // GNIS point (30.6307, -81.5740); Wildlight itself has no GNIS entry yet.
    beacon: { center: [-81.574, 30.6307], name: "Wildlight" },
    frame: { center: [-81.574, 30.6307], zoom: 14.8, pitch: 62, bearing: 20 },
    hue: HUE.communities,
  },
  {
    slug: "development-launch-site",
    name: "Development Launch Site",
    category: "communities",
    audience: "A developer taking a community from dirt to sell-out.",
    pitch:
      "Pre-construction to sell-out: phases, availability, and reservation interest for a new community, on its own domain.",
    summary:
      "A launch site for a new development that evolves from pre-construction teaser to phased availability to sell-out, capturing reservation interest at every stage.",
    detail:
      "A development's website has to be several sites in sequence: the teaser that builds the list before ground breaks, the launch that converts the list into reservations, the sales phase with live availability, and the record that remains at sell-out. Building it as one system that changes state — rather than four rebuilds — means the domain, the rankings, and the interest list compound instead of resetting. Lead capture is staged to match: register interest early, reserve specifically later.",
    includes: [
      "One site that changes state: teaser, launch, sales, sold out",
      "Phase and availability presentation you update yourself",
      "Staged lead capture, from interest list to reservation inquiry",
      "The community's story told well enough to justify its price sheet",
      "Its own domain, so the equity accrues to the development",
    ],
    tierSlug: "flagship",
    timeline: "Four to eight weeks",
    status: "concept",
    // Nocatee, St. Johns County — 30.1054, -81.4160.
    beacon: { center: [-81.416, 30.1054], name: "Nocatee" },
    frame: { center: [-81.416, 30.1054], zoom: 14.6, pitch: 61, bearing: -14 },
    hue: HUE.communities,
  },
  {
    slug: "neighborhood-page-network",
    name: "Neighborhood Page Network",
    category: "communities",
    audience: "An agent or brokerage covering many neighborhoods.",
    pitch:
      "Dozens of neighborhood pages stamped out as real static HTML — each a separate entry point from search.",
    summary:
      "A network of neighborhood pages generated as real static HTML at build time — dozens of separate entry points from search, each with complete written content a crawler can read.",
    detail:
      "One page cannot rank for thirty neighborhoods, and thirty hand-built pages cannot stay maintained. The answer is a system: neighborhood content structured as data, stamped out at build time as real static HTML, so every page has complete written content before any JavaScript runs — which is what crawlers, and increasingly AI assistants, actually read. Twenty-six pages built this way are live today on one shipped site.",
    includes: [
      "A page per neighborhood, generated from structured content",
      "Real static HTML at build time — no JavaScript required to read it",
      "Per-page metadata, canonical tags, and schema",
      "Adding a neighborhood is a content edit, not a project",
      "Sitemap and internal linking generated from the same source",
    ],
    tierSlug: "flagship",
    timeline: "Three to five weeks",
    status: "shipped",
    proofSlug: "heymann-williams-coastal",
    hue: HUE.communities,
  },
  {
    slug: "area-flagship-map",
    name: "Area Flagship Map",
    category: "communities",
    audience: "Whoever decides to own the map of their market.",
    pitch:
      "The Aerial's model pointed at your market — the whole area as a living 3D interface with plain-English search.",
    summary:
      "An entire market as a living 3D map — regions, communities, and landmarks you descend into, with plain-English search and live local data — built on the shipped flagship's model.",
    detail:
      "The top of the catalog, and the one you can fly right now: The Aerial covers this coast with seventy named areas, seventeen descendable communities, plain-English search, and a dateline reading the real tide, wind, light, and moon. That model — the market as the interface, no homepage, no scroll feed — can be pointed at another market. It is the difference between having a website and having the map everyone else's website embeds.",
    includes: [
      "Your whole market as a living 3D map — terrain, imagery, buildings",
      "Named areas and communities, each descendable and linkable",
      "Plain-English search over the same fields an MLS feed carries",
      "Live local data wired into the interface, not widget embeds",
      "Desktop and mobile profiles shipped from one codebase",
    ],
    tierSlug: "flagship",
    timeline: "Six to ten weeks",
    status: "shipped",
    proofSlug: "the-aerial",
    hue: HUE.communities,
  },

  /* ── Listings & campaigns ─────────────────────────────────────────── */
  {
    slug: "single-listing-site",
    name: "Single-Listing Site",
    category: "listings",
    audience: "An agent with a listing that deserves its own address.",
    pitch:
      "One property, its own domain, its own page — the best marketing that listing gets, and the appointment-winner for the next one.",
    summary:
      "A dedicated single-property site on its own domain — photography-first, fast, and built to be shown in the next listing presentation as proof of how you market.",
    detail:
      "A significant listing marketed only as MLS entry number four hundred is a wasted asset. A single-listing site gives the property its own address — the photography treated as the point rather than a thumbnail grid, the story of the house told once and well, showings requested in two taps. And it does double duty: the next seller you sit with sees exactly how their home would be marketed, which is an argument no flyer makes.",
    includes: [
      "The property's own domain and page, designed around its photography",
      "Tour, video, and floor plan presented without a hosting platform's frame",
      "Showing requests routed straight to you",
      "Open-graph and schema built so shared links unfurl properly",
      "Retires gracefully into a sold page that keeps working for you",
    ],
    tierSlug: "agent-page",
    timeline: "Under a week",
    status: "concept",
    // Jacksonville Beach — GNIS: 30.2947, -81.3931.
    beacon: { center: [-81.3931, 30.2947], name: "Jacksonville Beach" },
    frame: { center: [-81.3931, 30.2947], zoom: 15.2, pitch: 63, bearing: 16 },
    hue: HUE.listings,
  },
  {
    slug: "open-house-page",
    name: "Open-House Page",
    category: "listings",
    audience: "An agent who runs open houses and loses the walk-ins.",
    pitch:
      "A QR sign-in that captures every walk-in as a validated CRM lead, then keeps working as the follow-up page.",
    summary:
      "An open-house page with QR sign-in that captures every walk-in as a validated lead in your CRM, then serves as the listing's follow-up page after the doors close.",
    detail:
      "The clipboard by the door is where open-house leads go to die. A QR code on the sign-in table opens a page that captures the visitor properly — validated, tagged to the listing, landed in your CRM before they reach the kitchen. After the open house it keeps working: the same page carries the listing's photos and details, so your follow-up text links somewhere worth tapping instead of trailing off.",
    includes: [
      "QR sign-in flow a visitor finishes in under a minute",
      "Validated leads tagged to the listing, in your CRM immediately",
      "The page doubles as the listing's follow-up link",
      "Reusable — new listing, same system, fresh QR",
      "Works on the visitor's phone with no app and no account",
    ],
    tierSlug: "agent-page",
    timeline: "Under a week",
    status: "concept",
    hue: HUE.listings,
  },
  {
    slug: "listing-launch-kit",
    name: "Listing Launch Kit",
    category: "listings",
    audience: "An agent who runs listings as campaigns.",
    pitch:
      "Coming-soon, just-listed, and sold — one page that changes state through the campaign, feeding one lead flow.",
    summary:
      "One listing page that moves through the campaign with you — coming-soon interest capture, just-listed showing requests, sold as proof — with every stage feeding the same lead flow.",
    detail:
      "A listing is a campaign with phases, and each phase wants different things from the same page. Coming-soon builds the interest list while the photography is still being shot. Just-listed converts that list into showings the first weekend. Sold turns the page into evidence for your next appointment. Building it as one page that changes state means the link you shared in week one is still the right link in week twelve.",
    includes: [
      "One URL through the whole campaign — no dead links mid-listing",
      "Coming-soon interest capture before the MLS entry exists",
      "Just-listed mode with showing requests and open-house dates",
      "Sold mode that adds the result to your public record",
      "Every stage feeds the same validated lead flow",
    ],
    tierSlug: "agent-page",
    timeline: "About one week",
    status: "concept",
    hue: HUE.listings,
  },
  {
    slug: "tour-media-page",
    name: "Tour & Media Page",
    category: "listings",
    audience: "An agent who pays for good media and gives the leads away.",
    pitch:
      "Your Matterport, video, and photography wrapped in a page that captures the viewer instead of leaking them to a platform.",
    summary:
      "A media page that presents a listing's Matterport, video, and photography under the agent's own brand and capture flow, instead of a hosting platform's page and their buttons.",
    detail:
      "You pay for the Matterport, the video, the photography — then share links that land on the hosting platforms' pages, wearing their brands, next to their buttons. A media page brings it home: every asset embedded under your name, on your domain, with the inquiry going to you. The viewer gets a better presentation; you keep the lead you already paid for.",
    includes: [
      "Matterport, video, photography, and floor plans on one page",
      "Your brand and your capture flow, not the platform's",
      "Fast loading despite heavy media — deferred and sized properly",
      "Share links that unfurl correctly everywhere",
      "Works per-listing or as a permanent media hub",
    ],
    tierSlug: "agent-page",
    timeline: "Under a week",
    status: "concept",
    hue: HUE.listings,
  },

  /* ── Search, data & tools ─────────────────────────────────────────── */
  {
    slug: "plain-english-idx",
    name: "Plain-English Property Search",
    category: "tools",
    audience: "A site whose search should speak the buyer's language.",
    pitch:
      "\"Oceanfront under 2m\" typed into a box and answered — natural language parsed to structured criteria, wired to your feed.",
    summary:
      "A property search that parses plain English — \"oceanfront under 2m\", \"4 bed with a dock\" — into structured criteria, ready to wire against your MLS or IDX feed.",
    detail:
      "The parser is not the concept — it is already running in The Aerial, resolving phrases like \"4 bed with a dock in st marys\" against the same fields a RESO feed carries, entirely on-device, and writing back what it understood. What this offering adds is the wiring: connecting that parser to your live MLS or IDX feed, so the box on your site answers with your actual inventory. Every filter dropdown removed is a visitor who does not abandon the search.",
    includes: [
      "The plain-English parser already proven in shipped work",
      "Wiring against your MLS or IDX feed",
      "Writes back what it understood — no silent wrong guesses",
      "Results as a list, a map, or both",
      "Degrades honestly when the feed is down, instead of pretending",
    ],
    tierSlug: "flagship",
    timeline: "Three to five weeks",
    status: "concept",
    proofSlug: "the-aerial",
    // Atlantic Beach — GNIS: 30.3344, -81.4009.
    beacon: { center: [-81.4009, 30.3344], name: "Atlantic Beach" },
    frame: { center: [-81.4009, 30.3344], zoom: 15.0, pitch: 60, bearing: -24 },
    hue: HUE.tools,
  },
  {
    slug: "market-report-engine",
    name: "Market Report Engine",
    category: "tools",
    audience: "An agent who wants content that compounds.",
    pitch:
      "Neighborhood market reports generated as real pages every month — content that compounds while you sleep.",
    summary:
      "A market report engine that generates real, prerendered neighborhood report pages on a schedule — an archive that compounds into exactly the content search engines reward.",
    detail:
      "Everyone agrees agents should publish market updates; almost nobody sustains it, because each one is an evening of work. An engine changes the economics: report pages generated from market data on a schedule, each one real static HTML with its own URL, accumulating into an archive that demonstrates you have watched this market for years. The judgment stays yours — a line of commentary turns a chart into a report — but the production cost drops to minutes.",
    includes: [
      "Scheduled report pages per neighborhood, generated from market data",
      "Real prerendered pages with their own URLs — an archive that ranks",
      "Your commentary slot on every report, because judgment is the product",
      "Charts rendered as accessible HTML, not screenshot images",
      "Email-ready summaries cut from the same data",
    ],
    tierSlug: "community-site",
    timeline: "Two to four weeks",
    status: "concept",
    // St. Augustine — the corridor's southern anchor. GNIS: 29.8947, -81.3131.
    beacon: { center: [-81.3131, 29.8947], name: "St. Augustine" },
    frame: { center: [-81.3131, 29.8947], zoom: 14.8, pitch: 62, bearing: 26 },
    hue: HUE.tools,
  },
  {
    slug: "live-coastal-data",
    name: "Live Local Data Modules",
    category: "tools",
    audience: "A coastal site that should read its own conditions.",
    pitch:
      "NOAA tide, NWS weather, sun and light computed per address — live instruments in the page, not widget embeds.",
    summary:
      "Live local data modules — NOAA tide gauge readings, National Weather Service conditions, sun and light computed per location — built into the page as instruments rather than widget embeds.",
    detail:
      "On a coastal listing, the tide is a property feature. These modules read it live: direct integrations against NOAA gauges and the National Weather Service through serverless functions, plus sun, moon, and golden hour computed for the exact address. Not an iframe wearing someone else's brand — instruments in your page, cached at the edge, with the failure case designed rather than left to chance. Running today in The Aerial and behind this very site's capabilities page.",
    includes: [
      "NOAA tide gauge and NWS conditions, integrated directly",
      "Sun, moon, and golden hour computed per address",
      "Edge caching so public gauges are never hammered",
      "Designed failure states — no broken widget when a feed drops",
      "Drops into an existing site or ships inside a new one",
    ],
    tierSlug: "community-site",
    timeline: "One to two weeks",
    status: "shipped",
    proofSlug: "the-aerial",
    hue: HUE.tools,
  },
  {
    slug: "crm-lead-routing",
    name: "CRM Lead Routing",
    category: "tools",
    audience: "Anyone whose website leads should land where follow-up lives.",
    pitch:
      "Validated submissions ingested into BoldTrail through the Lead Dropbox parser — your follow-up keeps working untouched.",
    summary:
      "Website lead flows validated and ingested into BoldTrail through the Lead Dropbox parser, so existing follow-up, campaigns, and reporting keep working exactly as they do today.",
    detail:
      "A website that collects leads into its own inbox creates a second place to check, which is one more than anyone checks. This wires the site into the CRM you already run: submissions validate before they send — no junk addresses, no half-filled forms — then ingest into BoldTrail through the Lead Dropbox parser, tagged with their source. Your drip campaigns, your reporting, your phone alerts: untouched. The pattern is running today in shipped work.",
    includes: [
      "Validation before send — clean data or no data",
      "Ingestion into BoldTrail via the Lead Dropbox parser",
      "Source tagging so you know which page produced which lead",
      "Fallback delivery to email if the CRM path ever fails",
      "Works with existing forms or the flows I build",
    ],
    tierSlug: "agent-page",
    timeline: "Under a week",
    status: "shipped",
    proofSlug: "sold-on-amelia-island",
    hue: HUE.tools,
  },
  {
    slug: "self-serve-editor",
    name: "Self-Serve Content Editor",
    category: "tools",
    audience: "An owner who refuses to file a ticket to fix a typo.",
    pitch:
      "Log in, change photos, bios, listings, text; hit publish; live in a minute. No ticket, no developer.",
    summary:
      "A git-backed content editor wired into your site — log in, change photos, bios, listings, and text, hit publish, live in about a minute, with every change versioned.",
    detail:
      "A site you cannot update goes stale in a season, and a site you update by emailing a developer goes stale in two. The editor fixes the economics: log in, change the photo, fix the price, publish — live in about a minute. Because it is git-backed, every change is versioned and reversible, and there is no CMS database to host, secure, or pay for. Agents are using exactly this today on a shipped site.",
    includes: [
      "Browser editor for photos, bios, listings, and text",
      "Publish to live in about a minute",
      "Every change versioned — mistakes roll back",
      "No database to host or secure",
      "Editable fields chosen deliberately, so nothing breaks by accident",
    ],
    tierSlug: "agent-page",
    timeline: "About one week",
    status: "shipped",
    proofSlug: "sold-on-amelia-island",
    hue: HUE.tools,
  },
  {
    slug: "transaction-client-portal",
    name: "Transaction Client Portal",
    category: "tools",
    audience: "A team or brokerage tired of \"any update?\" texts.",
    pitch:
      "Every closing milestone visible to your client on a page with your name on it, instead of a thread of status texts.",
    summary:
      "A client-facing transaction portal — every milestone from contract to close visible on a branded page — replacing the thread of \"any update?\" texts.",
    detail:
      "Between contract and close, a client's experience of you is mostly silence punctuated by their own worried texts. A transaction portal replaces that: a page with your brand on it where the client sees each milestone as it lands — inspection scheduled, appraisal in, clear to close — without anyone typing a status update. The coordination burden drops; the professionalism compounds; the next referral cites how informed they felt.",
    includes: [
      "A branded, client-facing view of every transaction milestone",
      "Milestone updates without composing a single status text",
      "Role-appropriate visibility — the client sees what a client should",
      "Notifications when something actually changes",
      "Scales from a single team to a brokerage's whole pipeline",
    ],
    tierSlug: "flagship",
    timeline: "Four to eight weeks",
    status: "concept",
    hue: HUE.tools,
  },
];

/** Derived, never hand-typed, so the counts cannot drift. */
export const CATALOG_TOTALS = {
  options: CATALOG.length,
  shipped: CATALOG.filter((o) => o.status === "shipped").length,
  concepts: CATALOG.filter((o) => o.status === "concept").length,
};

export function offeringBySlug(slug: string | null | undefined) {
  if (!slug) return undefined;
  return CATALOG.find((o) => o.slug === slug);
}

export function offeringsByCategory(category: CategorySlug) {
  return CATALOG.filter((o) => o.category === category);
}

/** The concepts that carry a place on the map. */
export const FLAGSHIP_CONCEPTS = CATALOG.filter((o) => o.beacon);

/**
 * The price line for an offering. Honors SHOW_PRICING exactly like the tier
 * cards do — nothing in the catalog can leak a number while pricing is off.
 */
export function priceLabelFor(offering: Offering): string {
  if (!SHOW_PRICING) return "Let's talk";
  const tier = TIERS.find((t) => t.slug === offering.tierSlug);
  const price = offering.priceFrom ?? tier?.price;
  if (price == null) return "Let's talk";
  return `from $${price.toLocaleString("en-US")}, one-time`;
}
