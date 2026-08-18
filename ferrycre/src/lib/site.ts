/**
 * Her identity, contact, and compliance strings — read from
 * src/data/profile.json so she (or anyone she trusts) can edit contact
 * details in /admin without touching code. Edits propagate to the header,
 * footer, JSON-LD, and lead flows automatically.
 */
import profile from "../data/profile.json";

export const BRAND = "Ferry CRE";

export const SITE = profile;

export const NAV = [
  { to: "/listings", label: "Listings" },
  { to: "/explore", label: "Explore" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

/** tel: href from the display number. */
export const telHref = `tel:${SITE.phoneE164}`;
export const mailHref = `mailto:${SITE.email}`;
