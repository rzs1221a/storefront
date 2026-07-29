import Reveal from "../components/Reveal";

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
  return (
    <section id="capabilities" className="section">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">What I build</p>
          <h2 className="headline mt-4 max-w-[20ch]">
            Things a template cannot do for you.
          </h2>
          <p className="lede mt-5">
            Not a longer feature list — a different category of thing. Each of
            these is running in one of the sites above, so any of it can be
            demonstrated rather than described.
          </p>
        </Reveal>

        <Reveal
          stagger={70}
          as="ul"
          className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-(--line) bg-(--line) sm:grid-cols-2 lg:grid-cols-3"
        >
          {CAPABILITIES.map((cap) => (
            <li
              key={cap.title}
              data-reveal-item
              className="group flex flex-col bg-(--color-plate-raised) p-7 transition-colors duration-500 hover:bg-(--color-plate-high)"
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
