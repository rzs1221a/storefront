import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";
import { WORK } from "../lib/work";

/**
 * The technical differentiator, in the buyer's language.
 *
 * Every item here is implemented in one of the five portfolio repositories —
 * the `proof` line names the project so nothing on this page is a claim I
 * cannot immediately demonstrate. Keep it that way.
 */

const CAPABILITIES = [
  {
    title: "Maps that are the product",
    body:
      "Real terrain, satellite imagery, and 3D buildings you descend into — not an embedded Google Map with a pin on it. Past a certain zoom the photorealistic tiles fade in and you are looking at the actual rooftops.",
    proof: "The Aerial",
  },
  {
    title: "Search that speaks English",
    body:
      "\"Oceanfront under 2m.\" \"4 bed with a dock in St Marys.\" The search field parses plain phrasing into structured criteria against the same fields an MLS feed carries, and writes back what it understood.",
    proof: "The Aerial",
  },
  {
    title: "Pages that actually rank",
    body:
      "Neighborhood pages stamped out as real static HTML at build time, so crawlers and AI assistants see complete written content instead of an empty page waiting on JavaScript. Twenty-six of them on one site.",
    proof: "Heymann Williams",
  },
  {
    title: "Leads into BoldTrail, properly",
    body:
      "Validated submissions ingested into BoldTrail through the Lead Dropbox parser, so your follow-up, campaigns, and reporting keep working exactly as they do today. Already built and running.",
    proof: "Sold on Amelia Island",
  },
  {
    title: "You edit it yourself",
    body:
      "Log in, change your photos, bio, listings, and text, hit publish. Live in about a minute. No ticket, no developer, no waiting on me to have a free afternoon.",
    proof: "Sold on Amelia Island",
  },
  {
    title: "Live local data",
    body:
      "Real tide readings from the NOAA gauge, conditions from the National Weather Service, and golden-hour times computed for a specific address. The kind of detail that makes a coastal site feel like it belongs there.",
    proof: "The Aerial",
  },
];

export default function Capabilities() {
  const [lead, ...others] = CAPABILITIES;
  // The flagship map, used as the lead cell's own illustration.
  const mapShot = WORK[0];

  return (
    <section id="capabilities" data-frame="capabilities" className="section">
      <div className="shell">
        <SectionHeader
          index="02"
          eyebrow="What I build"
          headline="Things a template cannot do for you."
          lede="Not a longer feature list — a different category of thing. Each of these is running in one of the sites above, so any of it can be demonstrated rather than described."
        />

        {/*
          An asymmetric bento rather than the 3×2 of equal boxes this used to
          be. The lead capability earns a double-width cell; the rest fill
          around it. Cards are glass, not opaque slabs — the coast reads
          through them, which is the entire reason there is a map back there.
        */}
        <Reveal
          stagger={70}
          as="ul"
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/*
            The lead cell is double-width and double-height, which left a large
            empty middle when it held text alone. It now shows the thing it is
            describing — the flagship map, cropped — so the claim illustrates
            itself and the cell earns its size.
          */}
          <li
            data-reveal-item
            className="panel lift group flex flex-col overflow-hidden sm:col-span-2 lg:row-span-2"
          >
            <div className="p-8 pb-6">
              <h3 className="text-2xl font-medium leading-snug tracking-[-0.022em]">
                {lead.title}
              </h3>
              <p className="lede mt-4 max-w-[46ch]">{lead.body}</p>
              <p className="mono-label mt-6 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-px w-5 bg-(--color-signal) transition-all duration-500 group-hover:w-9"
                />
                {lead.proof}
              </p>
            </div>

            <div className="relative mt-auto min-h-[13rem] flex-1 overflow-hidden">
              <img
                src={mapShot.desktop}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                width={1440}
                height={900}
                className="absolute inset-0 h-full w-full scale-[1.04] object-cover object-top transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.09]"
              />
              {/* Feather the top edge so the screenshot emerges from the card
                  rather than sitting in it like a pasted rectangle. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-(--color-plate) via-transparent to-transparent"
              />
            </div>
          </li>

          {others.map((cap) => (
            <li
              key={cap.title}
              data-reveal-item
              className="panel lift group flex flex-col p-7"
            >
              <h3 className="text-[1.0625rem] font-medium leading-snug tracking-[-0.015em]">
                {cap.title}
              </h3>
              <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
                {cap.body}
              </p>
              <p className="mono-label mt-6 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-px w-4 bg-(--color-signal) transition-all duration-500 group-hover:w-7"
                />
                {cap.proof}
              </p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
