import { FAQ } from "../lib/offer";
import Reveal from "../components/Reveal";

/**
 * Objection handling. Native <details>/<summary> so it works without
 * JavaScript, is keyboard-operable for free, and is searchable in-page by the
 * browser's own find.
 */
export default function Faq() {
  return (
    <section id="faq" className="section">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Questions</p>
            <h2 className="headline mt-4">The things people ask.</h2>
            <p className="lede mt-5">
              If yours is not here, ask it directly — I would rather answer than
              have you guess.
            </p>
          </Reveal>

          <Reveal stagger={60} className="lg:col-span-8">
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                data-reveal-item
                className={`group py-5 ${i === 0 ? "" : "border-t border-[--line]"}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.0625rem] font-medium tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="flex-none text-[--color-ink-muted] transition-transform duration-300 group-open:rotate-45"
                  >
                    <path
                      d="M7 2.5V11.5M2.5 7H11.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </summary>
                <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[--color-ink-soft]">
                  {item.a}
                </p>
              </details>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
