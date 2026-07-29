/**
 * Pricing and packaging — the single file to edit when the numbers change.
 *
 * ⚠️  THE PRICES BELOW ARE PLACEHOLDERS and must be confirmed before launch.
 *
 * The model is deliberate: one-time build fee, no recurring platform charge,
 * the agent owns the code and the hosting account. That is the one claim the
 * subscription platforms structurally cannot match, so the whole page is built
 * around it.
 */

export interface Tier {
  slug: string;
  name: string;
  /** Price in whole dollars. `null` renders as "Let's talk". */
  price: number | null;
  /** Shown after the price, e.g. "one-time". */
  priceNote: string;
  /** Who this is for, in one line. */
  audience: string;
  summary: string;
  includes: string[];
  /** Slug from work.ts — the real project that proves this tier. */
  exampleSlug: string;
  timeline: string;
  featured?: boolean;
}

export const TIERS: Tier[] = [
  {
    slug: "agent-page",
    name: "Agent Page",
    price: 1500,
    priceNote: "one-time",
    audience: "A single agent who needs a real home online.",
    summary:
      "One authoritative page that loads instantly, ranks for your name, and routes every enquiry into your CRM.",
    includes: [
      "Custom design — not a template with your headshot dropped in",
      "Bio, listings, testimonials, and contact",
      "Lead form routed into BoldTrail or your inbox",
      "BoldTrail property-alert links resolving on your own domain",
      "Full SEO: metadata, Open Graph, schema.org, sitemap",
      "Free hosting on Netlify, in your account",
    ],
    exampleSlug: "ron-heymann-agent-page",
    timeline: "About one week",
  },
  {
    slug: "community-site",
    name: "Community Site",
    price: 3500,
    priceNote: "one-time",
    audience: "An agent who wants to own one niche completely.",
    summary:
      "Stop fighting the whole county for one keyword. Take a single community — a neighborhood, a development, a price band — and become the definitive source for it.",
    includes: [
      "Everything in Agent Page",
      "Deep single-community authority content",
      "Geo-targeted metadata and structured data for that specific search intent",
      "Interactive map of the community",
      "Guided buyer and seller lead flows",
      "Content editor so you update it yourself, no developer needed",
    ],
    exampleSlug: "crane-island-bhhs",
    timeline: "Two to three weeks",
    featured: true,
  },
  {
    slug: "flagship",
    name: "Flagship",
    price: 6500,
    priceNote: "starting, one-time",
    audience: "A team or brokerage that wants something nobody else has.",
    summary:
      "The full build. Multi-route, map-driven, prerendered for search, with whatever the business actually needs rather than whatever the template allowed.",
    includes: [
      "Everything in Community Site",
      "Multi-route architecture with a full agent roster",
      "Live 3D mapping — real terrain, buildings, satellite imagery",
      "Per-neighborhood pages prerendered to static HTML for SEO",
      "Plain-English property search",
      "Live local data — tide, weather, light, market signals",
      "Complete design system documented for future work",
    ],
    exampleSlug: "heymann-williams-coastal",
    timeline: "Four to eight weeks",
  },
];

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
    a: "An agent page is about a week. A community site is two to three. A flagship build runs four to eight weeks depending on scope. You get a real date with your quote, not an estimate that slips.",
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
