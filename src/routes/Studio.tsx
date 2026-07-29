import { Link } from "react-router-dom";
import { TIERS, COMPARISON, PROCESS, FAQ } from "../lib/offer";
import { SHOW_PRICING } from "../lib/brand";
import { WORK } from "../lib/work";
import Sheet from "../components/Sheet";

/**
 * The studio destinations — everything that is an argument rather than a
 * project. Each is its own route and its own sheet.
 *
 * The copy is carried over unchanged from the scrolling build. It was accurate
 * and hard-won; only the frame around it is new.
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
      '"Oceanfront under 2m." "4 bed with a dock in St Marys." The search field parses plain phrasing into structured criteria against the same fields an MLS feed carries, and writes back what it understood.',
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

export function Build() {
  return (
    <Sheet eyebrow="What I build" title="Things a template cannot do for you">
      <p className="lede">
        Not a longer feature list — a different category of thing. Each of these
        is running in one of the sites on this coast, so any of it can be
        demonstrated rather than described.
      </p>

      <ul className="mt-7 space-y-px overflow-hidden rounded-xl border border-(--line) bg-(--line)">
        {CAPABILITIES.map((cap) => (
          <li key={cap.title} className="group bg-white/[0.02] p-5">
            <h2 className="text-[1.0625rem] font-medium tracking-[-0.015em]">
              {cap.title}
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
              {cap.body}
            </p>
            <p className="mono-label mt-4 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px w-4 bg-(--color-signal) transition-all duration-500 group-hover:w-7"
              />
              {cap.proof}
            </p>
          </li>
        ))}
      </ul>

      <Link to="/pricing" className="btn btn-ghost btn-sm mt-8">
        What it costs →
      </Link>
    </Sheet>
  );
}

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export function Pricing() {
  return (
    <Sheet eyebrow="Pricing" title="Pay once. Own it forever">
      <p className="lede">
        One fee, agreed in writing before anything starts. After launch you owe
        me nothing — hosting is free at the traffic these sites see, and the
        code is yours.
      </p>

      <ul className="mt-7 space-y-4">
        {TIERS.map((tier) => {
          const example = WORK.find((w) => w.slug === tier.exampleSlug);
          return (
            <li
              key={tier.slug}
              className={`rounded-xl border p-5 ${
                tier.featured
                  ? "border-(--color-signal)/35 bg-white/[0.04]"
                  : "border-(--line) bg-white/[0.02]"
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-medium tracking-[-0.015em]">
                  {tier.name}
                </h2>
                <span className="font-mono text-xl tracking-tight">
                  {SHOW_PRICING && tier.price !== null
                    ? money(tier.price)
                    : "Let's talk"}
                </span>
              </div>
              <p className="mt-1.5 text-[0.875rem] text-(--color-ink-muted)">
                {tier.audience}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
                {tier.summary}
              </p>

              <ul className="mt-4 space-y-2 border-t border-(--line) pt-4">
                {tier.includes.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2.5 text-[0.875rem] leading-relaxed text-(--color-ink-soft)"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-(--color-signal)"
                    />
                    {line}
                  </li>
                ))}
              </ul>

              <p className="mono-label mt-4">
                {tier.timeline}
                {example && ` · e.g. ${example.name}`}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-xs text-(--color-ink-faint)">
        Hosting runs on Netlify's free tier in your own account. Your only
        ongoing cost is the domain — around $15 a year.
      </p>

      {/* The ownership argument, which is the real objection-handler. */}
      <h2 className="mt-10 border-t border-(--line) pt-8 text-lg font-medium tracking-[-0.015em]">
        {COMPARISON.headline}
      </h2>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
        Platform sites typically run a setup fee plus a few hundred dollars a
        month, for as long as you want the site to stay up. That is a reasonable
        business — it is just worth being clear about what you get and what you
        are renting.
      </p>

      <dl className="mt-6 space-y-4">
        {COMPARISON.rows.map((row) => (
          <div key={row.question} className="border-t border-(--line) pt-4">
            <dt className="text-[0.9375rem] font-medium">{row.question}</dt>
            <dd className="mt-2 text-[0.875rem] leading-relaxed text-(--color-ink-muted)">
              <span className="mono-label">A platform</span> {row.platform}
            </dd>
            <dd className="mt-1.5 text-[0.875rem] leading-relaxed text-(--color-ink-soft)">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-(--color-signal)">
                Built by me
              </span>{" "}
              {row.us}
            </dd>
          </div>
        ))}
      </dl>

      <Link to="/contact" className="btn btn-primary btn-sm mt-8">
        Get a quote
      </Link>
    </Sheet>
  );
}

export function Process() {
  return (
    <Sheet eyebrow="How it goes" title="No surprises">
      <p className="lede">
        You will know the price, the timeline, and what the site looks like
        before any real money changes hands.
      </p>

      <ol className="mt-7">
        {PROCESS.map((step, i) => (
          <li
            key={step.step}
            className={`flex gap-5 py-5 ${i === 0 ? "" : "border-t border-(--line)"}`}
          >
            <span className="font-mono text-sm text-(--color-signal)">
              {step.step}
            </span>
            <div>
              <h2 className="text-[1.0625rem] font-medium tracking-[-0.015em]">
                {step.name}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Link to="/contact" className="btn btn-primary btn-sm mt-6">
        Start the conversation
      </Link>
    </Sheet>
  );
}

export function Questions() {
  return (
    <Sheet eyebrow="Questions" title="The things people ask">
      <p className="lede">
        If yours is not here, ask it directly — I would rather answer than have
        you guess.
      </p>

      <div className="mt-6">
        {FAQ.map((item, i) => (
          <details
            key={item.q}
            className={`group py-4 ${i === 0 ? "" : "border-t border-(--line)"}`}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.0625rem] font-medium tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
              {item.q}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="flex-none text-(--color-ink-muted) transition-transform duration-300 group-open:rotate-45"
              >
                <path
                  d="M7 2.5V11.5M2.5 7H11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Sheet>
  );
}
