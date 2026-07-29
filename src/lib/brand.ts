/**
 * Single source of truth for who is selling. Change the name here and it
 * changes everywhere — nav, hero, footer, meta tags, JSON-LD.
 *
 * `Blackline Systems` is carried over from The Aerial's README, which already
 * credits the work that way ("Independent product — no brokerage branding.
 * Built under Blackline Systems").
 */

export const BRAND = {
  name: "Blackline Systems",
  short: "Blackline",
  tagline: "Custom websites for real estate professionals.",
  /**
   * The one-line positioning statement. Deliberately concrete: it names the
   * audience, the deliverable, and the differentiator in a single breath.
   */
  positioning:
    "Bespoke, high-performance websites for BHHS agents — built once, owned outright, no monthly platform fee.",
  domain: "blacklinesystems.com",
  origin: "https://blacklinesystems.com",
} as const;

/**
 * Contact routing. PLACEHOLDERS — these must be replaced with real details
 * before the site goes live. `phone` is used for both tel: and sms: links;
 * `email` is the fallback mailto and the Netlify Forms notification target.
 */
export const CONTACT = {
  email: "rzs1221a@gmail.com",
  /** E.164 for links, `phoneDisplay` for what humans read. */
  phone: "+19045550100",
  phoneDisplay: "(904) 555-0100",
  /** Set to a Calendly/Cal.com URL to swap the form CTA for a booking CTA. */
  bookingUrl: "",
  location: "Amelia Island, Florida",
} as const;

/** Flip to false to hide every price on the site and route to "request a quote". */
export const SHOW_PRICING = true;
