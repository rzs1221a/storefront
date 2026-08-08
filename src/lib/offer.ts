/**
 * The productized offer — the single file to edit when packaging changes.
 *
 * The prices below are PUBLISHED: `SHOW_PRICING` in lib/brand.ts is true, and
 * both the tier cards and the catalog's `priceLabelFor` render these figures.
 * Change a number here and it changes everywhere at once.
 *
 * The model is deliberate: one-time build fee, no recurring platform charge,
 * the agent owns the code and the hosting account. That is the one claim the
 * subscription platforms structurally cannot match, so the whole offer is built
 * around it.
 *
 * The four tiers are named as the coast names its lights, smallest to largest:
 * a daymark is an unlit charted mark, a beacon is lit, a light station is
 * crewed, and the flagship leads the fleet. Each tier still carries both a
 * `name` and a `system`. The name is the brand; the system is the same thing
 * described as a plain deliverable, for the reader who sells houses and has
 * never heard of a daymark. Leading with either alone would lose the other
 * reader.
 *
 * Builds are only half the offer: the catalog's `tools` category is six
 * MODULES — add-ons priced individually (`priceFrom` in catalog.ts) that
 * attach to any build, or retrofit into a site that already exists.
 */

/** The four build sizes. catalog.ts types every build offering against this. */
export type TierSlug = "daymark" | "beacon" | "light-station" | "flagship";

export interface Tier {
  slug: TierSlug;
  /** What the buyer calls it. */
  name: string;
  /** The same thing as a productized system, for the technical reader. */
  system: string;
  /** Price in whole dollars. `null`, or SHOW_PRICING false, renders "Let's talk". */
  price: number | null;
  /** Shown after the price, e.g. "one-time". */
  priceNote: string;
  /** Who this is for, in one line. */
  audience: string;
  summary: string;
  /** Concrete buyer profiles. Answers "is this me?" faster than prose can. */
  idealFor: string[];
  /** What is actually handed over at the end. */
  deliverables: string[];
  /** Plain-language delivery window. */
  turnaroundTime: string;
  /** The button on the card. Written as the buyer's next step, not a demand. */
  ctaLabel: string;
  /** Slug from work.ts — the real project that proves this tier. */
  exampleSlug: string;
  featured?: boolean;
  /** Ribbon on the featured card. */
  badge?: string;
}

export const TIERS: Tier[] = [
  {
    slug: "daymark",
    name: "Daymark",
    system: "The single-page build",
    price: 1500,
    priceNote: "one-time",
    audience: "One agent, one listing, or one campaign — one page done properly.",
    summary:
      "One authoritative page that loads instantly, ranks for its name, and routes every enquiry into your CRM. An agent page, a listing site, a funnel — any of the single-page builds in the catalog.",
    idealFor: [
      "You are an individual agent with no site, or a brokerage profile page",
      "You have a listing or campaign that deserves its own address",
      "You want one link that works on a business card, a sign, and a phone",
    ],
    deliverables: [
      "Custom design — not a template with your headshot dropped in",
      "Bio, listings, testimonials, and contact — or the campaign equivalent",
      "Lead form routed into BoldTrail or your inbox",
      "Property-alert links resolving on your own domain",
      "Full SEO: metadata, Open Graph, schema.org, sitemap",
      "Free hosting on Netlify, in your account",
    ],
    turnaroundTime: "About one week",
    ctaLabel: "Inquire about this tier",
    exampleSlug: "ron-heymann-agent-page",
  },
  {
    slug: "beacon",
    name: "Beacon",
    system: "The multi-page site",
    price: 3500,
    priceNote: "one-time",
    audience: "An agent, team, or niche that has outgrown one page.",
    summary:
      "A real site with real routes — a community claimed completely, a team under one brand, a name built to survive a brokerage change — each page able to rank on its own.",
    idealFor: [
      "You already have a farm area and want to be the obvious authority in it",
      "You run a team and need buyer and seller flows that route correctly",
      "You want to update your own content without filing a request",
    ],
    deliverables: [
      "Multi-page architecture — each page a separate entry point from search",
      "Geo-targeted metadata and structured data for your specific intent",
      "Guided buyer and seller lead flows",
      "CRM lead routing and content editor included",
      "Interactive map of your community or coverage area",
    ],
    turnaroundTime: "Two to three weeks",
    ctaLabel: "Inquire about this tier",
    exampleSlug: "sold-on-amelia-island",
    featured: true,
    badge: "Most popular",
  },
  {
    slug: "light-station",
    name: "Light Station",
    system: "The platform build",
    price: 6500,
    priceNote: "from, one-time",
    audience: "A brokerage or operation that needs a system, not a site.",
    summary:
      "Multi-route, map-driven, prerendered for search: a full roster, a page for every neighborhood you cover, and cinematic map storytelling — the pattern running today on a seventeen-route shipped build.",
    idealFor: [
      "You are a team or brokerage with a roster and more than one market",
      "You need pages for every neighborhood you cover, each one able to rank",
      "You want the site itself to be the reason someone calls you",
    ],
    deliverables: [
      "Multi-route architecture with a full agent roster",
      "Map-synced storytelling with authored camera stations",
      "Per-neighborhood pages prerendered to static HTML for SEO",
      "Route-level code splitting and a documented design system",
      "Full reduced-motion and keyboard accessibility pass",
    ],
    turnaroundTime: "Three to six weeks",
    ctaLabel: "Inquire about this tier",
    exampleSlug: "heymann-williams-coastal",
  },
  {
    slug: "flagship",
    name: "Flagship",
    system: "The custom market platform",
    price: 12000,
    priceNote: "from, one-time",
    audience: "Whoever decides to own the map of their market.",
    summary:
      "The Aerial's model, pointed at your market: the whole area as a living 3D interface with plain-English search and live local data. The difference between having a website and having the map everyone else's website embeds.",
    idealFor: [
      "You want your market itself to be the interface, not a scroll feed",
      "You need plain-English search over your actual inventory",
      "You are building the thing nobody else in your market can copy",
    ],
    deliverables: [
      "Your whole market as a living 3D map — terrain, imagery, buildings",
      "Named areas and communities, each descendable and linkable",
      "Plain-English property search wired to your feed",
      "Live local data — tide, weather, light — as instruments in the page",
      "Desktop and mobile profiles shipped from one codebase",
    ],
    turnaroundTime: "Six to ten weeks",
    ctaLabel: "Discuss a custom build",
    exampleSlug: "the-aerial",
  },
];

/** Look a tier up by the slug a `?package=` parameter carries. */
export function tierBySlug(slug: string | null | undefined): Tier | undefined {
  if (!slug) return undefined;
  return TIERS.find((t) => t.slug === slug);
}

/**
 * The comparison argument.
 *
 * Deliberately describes market *patterns* rather than naming competitors with
 * specific dollar figures. Publishing named per-vendor pricing on a commercial
 * page means standing behind numbers that change without notice — the pattern
 * is accurate, durable, and makes the same point.
 */
export const COMPARISON = {
  headline: "What you are actually being sold elsewhere",
  rows: [
    {
      question: "Who owns the site?",
      platform: "The platform. Cancel and it goes dark.",
      us: "You do. Source code, hosting account, domain — all in your name.",
    },
    {
      question: "What does it cost after launch?",
      platform: "A monthly fee, typically for as long as you want the site up.",
      us: "Nothing to me. Netlify hosting is free at the traffic a site like this sees.",
    },
    {
      question: "What happens if you change brokerages?",
      platform: "Usually a rebuild, and often a new contract.",
      us: "Change the logo and colors. The site is yours and it moves with you.",
    },
    {
      question: "How different does it look?",
      platform: "A template. Your competitors down the hall chose from the same set.",
      us: "Designed for you. Nothing else looks like it.",
    },
    {
      question: "Where do the leads go?",
      platform: "Into the platform's CRM, on the platform's terms.",
      us: "Into BoldTrail, or your inbox, or wherever you want them.",
    },
    {
      question: "Can you change the content yourself?",
      platform: "Usually yes, within the template's limits.",
      us: "Yes — a real editor, and no limits on what I can change for you.",
    },
  ],
} as const;

/** What happens after they say yes. Sets expectations, reduces friction. */
export const PROCESS = [
  {
    step: "01",
    name: "A conversation",
    detail:
      "Twenty minutes. What you sell, who you sell to, and what is not working about your current site. No pitch deck.",
  },
  {
    step: "02",
    name: "A fixed quote",
    detail:
      "Scope and price in writing before anything starts. The number does not move unless you ask for something new.",
  },
  {
    step: "03",
    name: "Design first",
    detail:
      "You see the real design before a line of production code is written. Revisions here are free and expected.",
  },
  {
    step: "04",
    name: "Build and review",
    detail:
      "I build it on a live preview link you can check any time. You watch it come together instead of waiting in the dark.",
  },
  {
    step: "05",
    name: "Launch, in your name",
    detail:
      "Your Netlify account, your domain, your repository. I hand you the keys and walk you through them.",
  },
] as const;

export const FAQ = [
  {
    q: "Do I really own it?",
    a: "Yes, completely. The code lives in a repository in your name, the site deploys from your own Netlify account, and the domain is registered to you. If you and I never speak again, nothing turns off.",
  },
  {
    q: "What does it cost to keep running?",
    a: "For a site at the traffic an agent site sees, Netlify's free tier covers hosting. You pay for your domain — usually around fifteen dollars a year — and that is genuinely it. There is no fee to me after launch unless you want ongoing work.",
  },
  {
    q: "Will my leads still reach BoldTrail?",
    a: "Yes. I have already built this — the lead flows on Sold on Amelia Island validate submissions and ingest them into BoldTrail through the Lead Dropbox parser. Your existing follow-up, campaigns, and reporting keep working exactly as they do now.",
  },
  {
    q: "What if I switch brokerages?",
    a: "We swap the branding and the site keeps working. That is the whole advantage of owning it — a platform site typically has to be rebuilt, because it was never yours.",
  },
  {
    q: "Can I update it myself?",
    a: "Yes, if you want to. I can wire in an editor where you log in, change photos, bios, listings, and text, and hit publish — live in about a minute. Sold on Amelia Island works exactly this way today.",
  },
  {
    q: "How long does it take?",
    a: "A Daymark — the single-page build — is about a week. A Beacon is two to three. A Light Station runs three to six weeks, and a Flagship six to ten depending on scope. You get a real date with your quote, not an estimate that slips.",
  },
  {
    q: "What do you need from me?",
    a: "Your photos, your bio, and about an hour of your time across the whole project. If you do not have good photography I will tell you honestly, because it matters more than almost anything else on the page.",
  },
  {
    q: "Why are you cheaper than the platforms?",
    a: "Because I am not building a platform. There is no sales team, no support org, and no investors expecting recurring revenue from you. You are paying for design and engineering time, once.",
  },
] as const;
