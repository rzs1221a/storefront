import { COMPARISON } from "../lib/offer";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

/**
 * The ownership argument — the strongest objection-handler on the page.
 *
 * Deliberately describes market *patterns* rather than naming specific
 * vendors with specific dollar figures. Published per-competitor pricing goes
 * stale without warning, and standing behind stale numbers on a commercial
 * page is a liability. The pattern is accurate, durable, and makes the point.
 */
export default function Comparison() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHeader
          index="03"
          eyebrow="The honest comparison"
          variant="centered"
          headline={COMPARISON.headline}
          lede="Platform sites typically run a setup fee plus a few hundred dollars a month, for as long as you want the site to stay up. That is a reasonable business — it is just worth being clear about what you get and what you are renting."
        />

        <Reveal className="mt-12 overflow-hidden rounded-2xl border border-(--line)">
          {/* Column headers, desktop only — the stacked mobile layout labels
              each cell inline instead. */}
          <div className="hidden grid-cols-[1.1fr_1fr_1fr] gap-px bg-(--line) md:grid">
            <div className="bg-(--color-plate-high) px-6 py-4" />
            <div className="bg-(--color-plate-high) px-6 py-4">
              <span className="mono-label">A platform site</span>
            </div>
            <div className="bg-(--color-plate-high) px-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-(--color-signal)">
                Built by me
              </span>
            </div>
          </div>

          <div className="grid gap-px bg-(--line)">
            {COMPARISON.rows.map((row) => (
              <div
                key={row.question}
                className="grid gap-px bg-(--line) md:grid-cols-[1.1fr_1fr_1fr]"
              >
                <div className="bg-(--color-plate-raised) px-6 py-5">
                  <p className="text-[0.9375rem] font-medium">{row.question}</p>
                </div>
                <div className="bg-(--color-plate-raised) px-6 py-5">
                  <span className="mono-label mb-1.5 block md:hidden">
                    A platform site
                  </span>
                  <p className="text-[0.9375rem] leading-relaxed text-(--color-ink-muted)">
                    {row.platform}
                  </p>
                </div>
                <div className="bg-(--color-plate-raised) px-6 py-5">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.1em] text-(--color-signal) md:hidden">
                    Built by me
                  </span>
                  <p className="text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
                    {row.us}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
