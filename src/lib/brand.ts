/**
 * Single source of truth for who is selling. Change the name here and it
 * changes everywhere — nav, hero, footer, meta tags, JSON-LD.
 *
 * A seamark is a fixed, charted object that mariners navigate by — a marker
 * that exists so people can find their way. That is what this studio sells:
 * not a brochure, but the thing an agent gets found by. The product is
 * literally a map with markers on it, and every beacon in LiveMap.tsx is a
 * seamark in the original sense.
 */

export const BRAND = {
  name: "Seamark Studio",
  short: "Seamark",
  tagline: "Custom websites for real estate professionals.",
  /**
   * The one-line positioning statement. Deliberately concrete: it names the
   * audience, the deliverable, and the differentiator in a single breath.
   */
  positioning:
    "Bespoke, high-performance websites for BHHS agents — built once, owned outright, no monthly platform fee.",
  /**
   * The live address. Registered at Squarespace, DNS there too (the Mailgun MX
   * records for zander@ live in that zone, so the nameservers must NOT be
   * delegated to Netlify), apex pointed at Netlify's load balancer.
   *
   * `origin` is stamped into every canonical, og:url and sitemap entry by
   * scripts/prerender.mjs. Only ever name a domain here that actually serves
   * this site over HTTPS — an aspirational one tells search engines somebody
   * else's page is the authoritative copy of ours.
   */
  domain: "seamark.studio",
  origin: "https://seamark.studio",
} as const;

/**
 * Contact routing. PLACEHOLDERS — these must be replaced with real details
 * before the site goes live. `phone` is used for both tel: and sms: links;
 * `email` is the fallback mailto and the Netlify Forms notification target.
 */
export const CONTACT = {
  /** Forwards to the personal inbox via Squarespace/Mailgun. */
  email: "zander@seamark.studio",
  /** E.164 for links, `phoneDisplay` for what humans read. */
  phone: "+19045488222",
  phoneDisplay: "(904) 548-8222",
  /** Set to a Calendly/Cal.com URL to swap the form CTA for a booking CTA. */
  bookingUrl: "",
  location: "Amelia Island, Florida",
} as const;

/**
 * Prices are not public yet. With this false every tier reads "Let's talk"
 * and routes to the contact form — the packages, inclusions, and timelines
 * still do their work, but no number is committed to in writing.
 *
 * Set the figures in src/lib/offer.ts and flip this to true to publish them.
 */
export const SHOW_PRICING = false;
