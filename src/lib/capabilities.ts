/**
 * The capability showcase content, hoisted out of the route so the prerender
 * script can import it — the crawler-facing /capabilities body and the React
 * one must come from the same list or they drift.
 */

export interface Capability {
  title: string;
  body: string;
  /** The commercial argument. Why an agent should care that this exists. */
  matters: string;
  proof: string;
  proofPath?: string;
}

export const CAPABILITIES: Capability[] = [
  {
    title: "Maps that are the product",
    body:
      "Real terrain, satellite imagery, and 3D buildings you descend into — not an embedded Google Map with a pin on it. Past a certain zoom the photorealistic tiles fade in and you are looking at the actual rooftops.",
    matters:
      "A buyer who is exploring stays. Time on page is the signal every ranking system reads, and it is also just how someone falls in love with a neighborhood before they have seen a listing.",
    proof: "The Aerial",
    proofPath: "/work/the-aerial",
  },
  {
    title: "Search that speaks English",
    body:
      '"Oceanfront under 2m." "4 bed with a dock in St Marys." The search field parses plain phrasing into structured criteria against the same fields an MLS feed carries, and writes back what it understood.',
    matters:
      "Every filter dropdown you remove is a visitor who does not abandon the search. People type the way they talk, and a site that answers them looks like it was built this decade.",
    proof: "The Aerial",
    proofPath: "/work/the-aerial",
  },
  {
    title: "Pages that actually rank",
    body:
      "Neighborhood pages stamped out as real static HTML at build time, so crawlers and AI assistants see complete written content instead of an empty page waiting on JavaScript. Twenty-six of them on one site.",
    matters:
      "This is the difference between a site that generates leads and a brochure. Each page is a separate entry point from search, and it works whether the visitor is Google, ChatGPT, or a person.",
    proof: "Heymann Williams",
    proofPath: "/work/heymann-williams-coastal",
  },
  {
    title: "The profile that decides whether you are found at all",
    body:
      "Your Google Business Profile is the second station of the passage, and it is a set of fields rather than a description of you: primary category, service areas, hours, photos, and a review stream that has to be answered. Most of it is a lever; almost nobody treats it as one.",
    matters:
      "It is the cheapest lead route an agent has and the one most often left unattended. It also carries a risk nobody warns you about until it happens — a profile suspended over a category or an address is a light that goes out overnight, and there is no website in the world that compensates for it.",
    proof: "The five levers, annotated on this page",
  },
  {
    title: "Leads into BoldTrail, properly",
    body:
      "Validated submissions ingested into BoldTrail through the Lead Dropbox parser, so your follow-up, campaigns, and reporting keep working exactly as they do today. Already built and running.",
    matters:
      "You do not change how you work. The site becomes another source feeding the CRM you already use, instead of a second inbox you forget to check.",
    proof: "Sold on Amelia Island",
    proofPath: "/work/sold-on-amelia-island",
  },
  {
    title: "You edit it yourself",
    body:
      "Log in, change your photos, bio, listings, and text, hit publish. Live in about a minute. No ticket, no developer, no waiting on me to have a free afternoon.",
    matters:
      "A site you cannot update goes stale in a season. This one stays current because updating it costs you a minute rather than an email and three days.",
    proof: "Sold on Amelia Island",
    proofPath: "/work/sold-on-amelia-island",
  },
];
