import { DESTINATIONS, type Destination } from "./destinations";

/**
 * The command bar's resolver.
 *
 * The site claims "search that speaks English" as a capability, so it should
 * demonstrate it the same way the tide line demonstrates live data.
 *
 * Deliberately deterministic — a keyword resolver over the destinations plus
 * synonyms, in the spirit of the-aerial/lib/semantic.ts. No model, no fuzzy
 * matching, no ranking that cannot be explained. It either understands you and
 * says what it understood, or it says plainly that it did not. A search box
 * that guesses wrong on a sales page is worse than one that admits defeat.
 */

export interface Resolution {
  destination: Destination;
  /** What it understood, written back in a sentence. */
  understood: string;
}

/** Words that point at a destination, beyond its own label. */
const SYNONYMS: Record<string, string[]> = {
  "/packages": [
    "price", "pricing", "cost", "costs", "how much", "budget", "fee", "fees",
    "quote", "rate", "rates", "expensive", "cheap", "afford", "package",
    "packages", "tier", "tiers", "money", "pay", "payment", "dollars",
    "plans", "build size", "build sizes",
  ],
  "/options": [
    "options", "option", "catalog", "catalogue", "everything", "menu",
    "site types", "what can i buy", "store", "shop", "buy", "offerings",
    "what do you sell", "all of it",
  ],
  "/work": [
    "work", "portfolio", "case study", "case studies", "examples", "example",
    "projects", "samples", "show me", "what have you built", "past work",
  ],
  "/process": [
    "process", "how it works", "how it goes", "timeline", "how long",
    "steps", "start", "begin", "schedule", "when", "deadline", "turnaround",
  ],
  "/questions": [
    "question", "questions", "faq", "own", "ownership", "hosting", "host",
    "boldtrail", "crm", "leads", "brokerage", "switch", "leave", "cancel",
    "contract", "update", "edit",
  ],
  "/capabilities": [
    "build", "capabilities", "features", "what do you", "map", "maps", "3d",
    "seo", "rank", "ranking", "search", "cms", "tech", "stack", "tide",
    "data", "integration", "demo", "api", "live data", "what can you do",
  ],
  "/contact": [
    "contact", "talk", "call", "phone", "email", "reach", "hire", "book",
    "meeting", "get started", "work with", "interested",
  ],
  "/work/the-aerial": ["aerial", "flagship", "3d map", "living map", "best work"],
  "/work/heymann-williams-coastal": [
    "heymann", "williams", "brokerage", "brokerage site", "big site",
    "full site", "team site", "roster",
  ],
  "/work/sold-on-amelia-island": [
    "sold on amelia", "kelly", "will", "two agents", "couple", "spouses",
    "buyer flow", "seller flow", "cms site",
  ],
  "/work/crane-island-bhhs": [
    "crane", "crane island", "community", "microsite", "niche", "waterfront",
    "deep water", "single community", "one community",
  ],
  "/work/ron-heymann-agent-page": [
    "ron", "heymann agent", "single agent", "one page",
    "simple site", "cheapest", "smallest",
  ],
  "/work/seamark-storefront": [
    "this site", "the site", "this storefront", "how was this made",
    "who made this", "meta", "seamark storefront", "your site", "this page",
  ],

  /*
   * High-intent phrases straight into the catalog. Each of these is a job the
   * visitor already has words for; the command bar's whole promise is that
   * typing those words works.
   */
  "/options/open-house-page": [
    "open house", "open houses", "sign in sheet", "sign-in", "walk in",
    "walk-ins", "qr code",
  ],
  "/options/plain-english-idx": [
    "idx", "mls search", "property search", "listing search", "search bar",
    "natural language",
  ],
  "/options/market-report-engine": [
    "market report", "market reports", "market update", "market stats",
    "monthly report",
  ],
  "/options/home-valuation-funnel": [
    "home worth", "what's my home worth", "valuation", "home value", "cma",
    "seller leads", "seller magnet",
  ],
  "/options/relocation-guide": [
    "relocation", "relocating", "moving to", "out of state", "newcomer",
  ],
  "/options/recruiting-funnel": [
    "recruit", "recruiting", "recruitment", "hire agents", "grow the office",
  ],
  "/options/development-launch-site": [
    "new construction", "development", "pre construction", "preconstruction",
    "new community", "builder",
  ],
  "/options/single-listing-site": [
    "single listing", "listing site", "property website", "one property",
    "listing website",
  ],
  "/options/transaction-client-portal": [
    "transaction", "closing", "under contract", "escrow", "client portal",
    "any update",
  ],
  "/options/sold-portfolio": [
    "sold portfolio", "past sales", "my sales", "track record", "closings map",
  ],
  "/options/tour-media-page": [
    "matterport", "virtual tour", "video tour", "drone", "photography page",
  ],
  "/options/self-serve-editor": [
    "editor", "edit myself", "update myself", "change my photos", "cms",
  ],
};

/** Phrases describing what the visitor sells, mapped to the best example. */
const INTENT: { match: string[]; path: string; because: string }[] = [
  {
    match: ["waterfront", "deep water", "dock", "oceanfront", "beachfront"],
    path: "/work/crane-island-bhhs",
    because: "you sell waterfront",
  },
  {
    match: ["luxury", "high end", "premium", "million"],
    path: "/work/crane-island-bhhs",
    because: "you sell at the top of the market",
  },
  {
    match: ["team", "partner", "two of us", "we are", "my team"],
    path: "/work/sold-on-amelia-island",
    because: "you work as a team",
  },
  {
    match: ["just me", "solo", "myself", "one agent", "i am an agent"],
    path: "/work/ron-heymann-agent-page",
    because: "you are working on your own",
  },
  {
    match: ["neighborhood", "neighbourhood", "community", "subdivision"],
    path: "/work/crane-island-bhhs",
    because: "you want to own one community",
  },
  {
    match: ["i have a listing", "listing to launch", "new listing", "just listed"],
    path: "/options/single-listing-site",
    because: "you have a listing to launch",
  },
  {
    match: ["open house this weekend", "running an open house"],
    path: "/options/open-house-page",
    because: "you are running an open house",
  },
  {
    match: ["i run a brokerage", "my brokerage", "my office", "broker owner"],
    path: "/options/recruiting-funnel",
    because: "you run a brokerage",
  },
];

const normalize = (input: string) =>
  input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

export function resolve(input: string): Resolution | null {
  const q = normalize(input);
  if (q.length < 2) return null;

  const byPath = (path: string) => DESTINATIONS.find((d) => d.path === path);

  // 1. What they sell, which is the most useful thing they can tell us.
  for (const intent of INTENT) {
    if (intent.match.some((m) => q.includes(m))) {
      const destination = byPath(intent.path);
      if (destination) {
        return {
          destination,
          understood: `${intent.because} — here is the closest thing I have built.`,
        };
      }
    }
  }

  /*
   * 2. An exact destination name.
   *
   * Home is skipped rather than matched: its label is a word people use to
   * mean something else entirely — "I need a home page", "homes for sale" —
   * and sending them to the page they are already on is the worst possible
   * answer. The brand mark already goes home.
   */
  for (const dest of DESTINATIONS) {
    if (dest.path !== "/" && q.includes(normalize(dest.label))) {
      return { destination: dest, understood: `Opening ${dest.label}.` };
    }
  }

  // 3. Synonyms. Longest match wins, so "how much" beats a stray "how".
  let best: { path: string; term: string } | null = null;
  for (const [path, terms] of Object.entries(SYNONYMS)) {
    for (const term of terms) {
      if (q.includes(term) && (!best || term.length > best.term.length)) {
        best = { path, term };
      }
    }
  }
  if (best) {
    const destination = byPath(best.path);
    if (destination) {
      return {
        destination,
        understood: `Read “${best.term}” — opening ${destination.label}.`,
      };
    }
  }

  return null;
}
