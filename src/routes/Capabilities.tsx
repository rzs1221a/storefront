import { Link } from "react-router-dom";
import Sheet from "../components/Sheet";
import Conditions from "../components/Conditions";

/**
 * The capability showcase.
 *
 * The novelty on this site is not decoration and should not be filed under
 * "about us" — it is the product demo. The map behind this sheet is a running
 * instance of the same engine an agent would be buying, and the tide line
 * below is a live NOAA gauge reading, fetched when this page loaded.
 *
 * So every capability is framed twice: what it is, and why it earns money.
 * A feature list persuades developers. "Your listing pages will still be
 * indexed when the JavaScript fails" persuades the person paying.
 */

interface Capability {
  title: string;
  body: string;
  /** The commercial argument. Why an agent should care that this exists. */
  matters: string;
  proof: string;
  proofPath?: string;
}

const CAPABILITIES: Capability[] = [
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

export default function Capabilities() {
  return (
    <Sheet wide eyebrow="Capabilities demo" title="Things a template cannot do for you">
      <p className="lede">
        Not a longer feature list — a different category of thing. Every item
        below is running in a site you can open, and two of them are running
        behind this panel right now.
      </p>

      {/* The showcase: the live engine, pointed at rather than described. */}
      <section className="showcase mt-8">
        <p className="eyebrow">Live, on this page</p>
        <h2 className="showcase-title">Real-time API integration engine</h2>
        <p className="showcase-body">
          Live maps, marine tide gauges, and dynamic data feeds, built into
          client sites. Not a widget embed — direct integrations against NOAA
          and the National Weather Service through serverless functions, with
          the failure case designed rather than left to chance.
        </p>

        <div className="showcase-panels">
          <div className="showcase-panel">
            <p className="mono-label">Feed 01 — NOAA + NWS</p>
            {/*
              The instrument itself, not a screenshot of one. This reads the
              Fernandina Beach gauge and the NWS forecast on load. On a local
              preview the functions do not exist and it renders nothing at
              all — which is the designed behaviour, and the honest one.
            */}
            <Conditions className="mt-3" />
            <p className="showcase-note">
              Tide height, direction, next high or low water, wind and
              conditions. Cached at the edge so the gauge is never hammered.
            </p>
          </div>

          <div className="showcase-panel">
            <p className="mono-label">Feed 02 — the map behind this panel</p>
            <p className="showcase-body mt-3">
              Esri World Imagery draped over the real coast, with OpenStreetMap
              building footprints extruding at street level and the star field
              projected from a real catalogue for this latitude. Both tile
              sources are key-free, so there is no per-request bill to inherit.
            </p>
            <p className="showcase-note">
              Close this panel and fly it. Every marker is a site I shipped.
            </p>
          </div>
        </div>
      </section>

      <ul className="mt-10 space-y-px overflow-hidden rounded-xl border border-(--line) bg-(--line)">
        {CAPABILITIES.map((cap) => (
          <li key={cap.title} className="group bg-white/[0.02] p-5">
            <h3 className="text-[1.0625rem] font-medium tracking-[-0.015em]">
              {cap.title}
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
              {cap.body}
            </p>
            <p className="cap-matters">
              <span className="mono-label">Why it matters</span>
              {cap.matters}
            </p>
            <p className="mono-label mt-4 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px w-4 bg-(--color-signal) transition-all duration-500 group-hover:w-7"
              />
              {cap.proofPath ? (
                <Link to={cap.proofPath} className="hover:text-(--color-ink)">
                  {cap.proof} →
                </Link>
              ) : (
                cap.proof
              )}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-(--line) pt-6">
        <Link to="/packages" className="btn btn-primary btn-sm">
          View packages
        </Link>
        <Link to="/contact" className="btn btn-ghost btn-sm">
          Schedule a consultation
        </Link>
      </div>
    </Sheet>
  );
}
