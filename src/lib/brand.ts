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
   * The live address. Deliberately the Netlify URL we actually control rather
   * than an aspirational custom domain: `origin` is stamped into every
   * canonical, og:url and sitemap entry by scripts/prerender.mjs, so naming a
   * domain we do not own would tell search engines that someone else's site is
   * the authoritative copy of ours. Change both lines the day a real domain is
   * registered and pointed here — and not before.
   */
  domain: "kstorefront.netlify.app",
  origin: "https://kstorefront.netlify.app",
} as const;

/**
 * Contact routing. PLACEHOLDERS — these must be replaced with real details
 * before the site goes live. `phone` is used for both tel: and sms: links;
 * `email` is the fallback mailto and the Netlify Forms notification target.
 */
export const CONTACT = {
  email: "rzs1221a@gmail.com",
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
