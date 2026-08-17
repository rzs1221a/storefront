/**
 * The Watch — what keeps a light lit after it is built.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THIS PRODUCT IS NOT PRICED YET. READ THIS BEFORE LINKING TO IT.
 *
 * `WATCH_DRAFT` below is true, and every plan's `price` is null. The Watch was
 * specified in the design vision but its commercial terms live in a document
 * this repository has never seen, so the plans here carry structure — what is
 * covered, what is not, which stations of the passage each keeps lit — and no
 * figures. Nothing in this file invents a price.
 *
 * While `WATCH_DRAFT` is true:
 *
 *   - the /watch destination carries `draft: true` in destinations.ts
 *   - the prerender stamps `robots: noindex` on it and leaves it out of the
 *     sitemap, so an unpriced page cannot be indexed or ranked
 *   - the page renders a visible draft notice above the plans
 *   - scripts/prerender.mjs FAILS THE BUILD if a plan carries a price while
 *     the route is still marked draft, or if a plan is priceless while it is
 *     not — the flag and the figures cannot drift apart
 *
 * To ship it: fill in every `price`, set `WATCH_DRAFT` to false, drop `draft`
 * from the /watch destination, and decide whether it earns a `navOrder`.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Why this product needs the most distinct visual identity on the site: it is
 * the one most in danger of sounding like every other agency retainer. "We
 * monitor your site" is what everybody says and nobody can show. The organising
 * image is therefore a radar scope — a sweep, and blips that light as it
 * passes — because that is literally the service being sold: somebody watching
 * the scope so the agent does not have to.
 */

import type { Coverage } from "./passage";

/** Flip to false only when every plan below carries a real figure. */
export const WATCH_DRAFT = true;

/* ── The scope ────────────────────────────────────────────────────────── */

export interface Blip {
  /** What the sweep found. */
  event: string;
  /** What was done about it. The second half is the entire product. */
  action: string;
  /** Angle on the scope, in degrees clockwise from twelve. */
  bearing: number;
  /** Distance from centre, 0–1. Nearer the middle reads as more recent. */
  range: number;
}

/**
 * The service log, drawn as returns on a scope.
 *
 * Every entry is a real category of thing that goes wrong with a live site and
 * a real thing done about it — not a feature list. An agent reading "a review
 * arrived → answered" understands the product without a paragraph, and the
 * arrow is doing the work: monitoring that ends at a notification is a to-do
 * list handed back to the person who was trying to buy time.
 */
export const BLIPS: Blip[] = [
  { event: "A review arrived", action: "answered", bearing: 28, range: 0.44 },
  { event: "Hours drifted", action: "corrected", bearing: 74, range: 0.72 },
  { event: "Form test", action: "passed", bearing: 121, range: 0.35 },
  { event: "Ranking moved", action: "logged", bearing: 163, range: 0.63 },
  { event: "Listing feed stalled", action: "restarted", bearing: 209, range: 0.5 },
  { event: "Certificate renewal", action: "verified", bearing: 251, range: 0.78 },
  { event: "Page weight crept", action: "trimmed", bearing: 298, range: 0.41 },
  { event: "New photos", action: "geotagged and posted", bearing: 337, range: 0.68 },
];

/* ── The plans ────────────────────────────────────────────────────────── */

export interface WatchPlan {
  slug: string;
  name: string;
  /** The same thing as a plain deliverable, for the reader who sells houses. */
  system: string;
  /** Whole dollars per month. NULL until the owner sets it — see the header. */
  price: number | null;
  audience: string;
  summary: string;
  /** What is actually done, every month, by a person. */
  includes: string[];
  /** Stated plainly, because a watch that claims everything watches nothing. */
  excludes: string[];
  /** Which stations of the passage this plan keeps lit after launch. */
  keeps: Coverage;
  badge?: string;
  /** Renders the badge in amber. Exactly one plan may set this. */
  badgeIsLead?: boolean;
}

export const WATCH_PLANS: WatchPlan[] = [
  {
    slug: "keeper",
    name: "Keeper",
    system: "The presence watch",
    price: null,
    audience: "An agent who owns no site yet — and whose light is already on.",
    summary:
      "Your Google Business Profile is a lead route whether or not you have a website, and it is the one most agents leave unattended. This watches it: the profile, the reviews, the hours, the photos, the categories, and the suspension risks nobody warns you about until you are dark.",
    includes: [
      "Google Business Profile monitored and kept accurate",
      "Every review answered, in your voice, within a business day",
      "Hours, categories, and service areas checked against reality",
      "Photos posted on a schedule, geotagged",
      "A monthly note in plain English: what moved, what I did",
    ],
    excludes: [
      "No site is built or hosted under this plan",
      "No paid traffic is bought or managed",
    ],
    keeps: {
      found: "Your profile, attended",
    },
    badge: "No build required",
    badgeIsLead: true,
  },
  {
    slug: "tender",
    name: "Tender",
    system: "The site watch",
    price: null,
    audience: "Anyone running a site I built, or one worth keeping.",
    summary:
      "A lighthouse tender is the vessel that services the lights. Everything in Keeper, plus the site itself: forms tested against a real submission, content changes made, dependencies patched, and the whole route checked end to end rather than assumed to still work.",
    includes: [
      "Everything in Keeper",
      "Live form submissions tested into your CRM, monthly",
      "Content changes — listings, bios, testimonials, photos",
      "Dependencies patched and the build kept green",
      "Uptime, certificate, and page-weight checks",
      "Search Console and analytics read by a person, not forwarded",
    ],
    excludes: ["No paid traffic is bought or managed"],
    keeps: {
      found: "Profile and pages, attended",
      landed: "The site, tested and current",
      captured: "The route to your CRM, proven monthly",
    },
  },
  {
    slug: "full-watch",
    name: "Full Watch",
    system: "The whole route, attended",
    price: null,
    audience: "An operation that wants every station of the passage kept lit.",
    summary:
      "Everything in Tender, plus the paid channel run as an instrument rather than a mystery: a budget you set, a meter you can read, and the arithmetic printed below in full before a dollar moves.",
    includes: [
      "Everything in Tender",
      "Paid search managed against a budget you set",
      "Landing pages built and tested per campaign",
      "Cost per lead reported monthly, alongside the organic figures",
      "The channel stops the day you say stop",
    ],
    excludes: [
      "Ad spend is paid to the platform directly, from your account, never through me",
    ],
    keeps: {
      channel: "Paid traffic, metered",
      found: "Profile and pages, attended",
      landed: "The site, tested and current",
      captured: "The route to your CRM, proven monthly",
    },
  },
];

/* ── The channel ──────────────────────────────────────────────────────── */

/**
 * The paid channel, drawn as a fuel gauge.
 *
 * Under sail you go where the wind allows and it costs nothing to keep going.
 * Under power you go where you point and a meter runs the whole time. Both are
 * legitimate ways to move a boat. Only one of them stops costing money when
 * you stop, and an agent deciding between them deserves that stated in one
 * breath rather than discovered in month three.
 *
 * ── On these numbers ─────────────────────────────────────────────────────
 *
 * They are a WORKED EXAMPLE with stated inputs, not published market data and
 * not a quote. That distinction is load-bearing and the page states it in
 * plain sight: a cost-per-lead figure presented as a fact is a promise about
 * an auction nobody controls, and this studio does not make those. The inputs
 * are ordinary for a small local real-estate campaign; the real figures depend
 * on the market, the season, and the competition, and get quoted in writing
 * before anything runs.
 *
 * Every derived figure below is computed from the inputs rather than typed, so
 * the arithmetic on the page can never drift from the arithmetic here.
 */
export const CHANNEL_INPUTS = {
  /** The monthly floor below which a campaign cannot gather enough signal. */
  floor: 2000,
  /** Modelled cost per click. */
  cpc: 2.03,
  /** Modelled share of clicks that become a real, validated enquiry. */
  conversionRate: 0.0129,
} as const;

const clicks = CHANNEL_INPUTS.floor / CHANNEL_INPUTS.cpc;
const leads = clicks * CHANNEL_INPUTS.conversionRate;

export const CHANNEL_MODEL = {
  clicks: Math.round(clicks),
  leads: Math.round(leads * 10) / 10,
  costPerLead: Math.round((CHANNEL_INPUTS.floor / leads) * 100) / 100,
} as const;

/** The one sentence that has to survive if the rest of the panel is skipped. */
export const CHANNEL_RULE =
  "Under sail, the wind is free and you go where it allows. Under power, you go where you point and a meter runs the whole time. The channel is under power. It stops the day you stop paying, and I would rather you knew that now than in month three.";
