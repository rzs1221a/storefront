import { PROCESS } from "../lib/offer";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

/**
 * What happens after they say yes. Buying a website is unfamiliar and feels
 * risky; naming the steps removes most of that friction on its own.
 */
export default function Process() {
  return (
    <section className="section">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SectionHeader
            index="05"
            eyebrow="How it goes"
            headline="No surprises."
            lede="You will know the price, the timeline, and what the site looks like before any real money changes hands."
            className="lg:col-span-4"
          />

          <Reveal stagger={80} direction="right" as="ol" className="lg:col-span-8">
            {PROCESS.map((step, i) => (
              <li
                key={step.step}
                data-reveal-item
                className={`flex gap-6 py-6 sm:gap-10 ${
                  i === 0 ? "" : "border-t border-(--line)"
                }`}
              >
                <span className="font-mono text-sm text-(--color-signal)">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-[1.0625rem] font-medium tracking-[-0.015em]">
                    {step.name}
                  </h3>
                  <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
