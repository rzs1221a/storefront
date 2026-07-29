import { PROCESS } from "../lib/offer";
import Reveal from "../components/Reveal";

/**
 * What happens after they say yes. Buying a website is unfamiliar and feels
 * risky; naming the steps removes most of that friction on its own.
 */
export default function Process() {
  return (
    <section className="section">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">How it goes</p>
            <h2 className="headline mt-4">No surprises.</h2>
            <p className="lede mt-5">
              You will know the price, the timeline, and what the site looks
              like before any real money changes hands.
            </p>
          </Reveal>

          <Reveal stagger={80} as="ol" className="lg:col-span-8">
            {PROCESS.map((step, i) => (
              <li
                key={step.step}
                data-reveal-item
                className={`flex gap-6 py-6 sm:gap-10 ${
                  i === 0 ? "" : "border-t border-[--line]"
                }`}
              >
                <span className="font-mono text-sm text-[--color-signal]">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-[1.0625rem] font-medium tracking-[-0.015em]">
                    {step.name}
                  </h3>
                  <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-[--color-ink-soft]">
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
