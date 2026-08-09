import { Link } from "react-router-dom";
import { PROCESS, FAQ } from "../lib/offer";
import Page from "../components/Page";

/**
 * The two supporting destinations — how a project runs, and what people ask
 * before they say yes.
 *
 * Both are real, linkable, prerendered pages, but neither is in the primary
 * navigation: they answer questions raised by the packages, so they are linked
 * from where those questions come up. The commercial nav stays at five items.
 *
 * The copy is carried over unchanged from the scrolling build. It was accurate
 * and hard-won; only the frame around it is new.
 */

export function Process() {
  return (
    <Page eyebrow="How it goes" title="No surprises">
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
            <span className="font-mono text-body-sm text-(--color-signal)">
              {step.step}
            </span>
            <div>
              <h2 className="text-title font-medium">
                {step.name}
              </h2>
              <p className="mt-2 text-body-sm leading-relaxed text-(--color-ink-soft)">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link to="/contact" className="btn btn-primary btn-sm">
          Start the conversation
        </Link>
        <Link to="/packages" className="btn btn-ghost btn-sm">
          View packages →
        </Link>
      </div>
    </Page>
  );
}

export function Questions() {
  return (
    <Page eyebrow="Questions" title="The things people ask">
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
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-title font-medium [&::-webkit-details-marker]:hidden">
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
            <p className="mt-3 text-body-sm leading-relaxed text-(--color-ink-soft)">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-(--line) pt-6">
        <Link to="/contact" className="btn btn-primary btn-sm">
          Ask me directly
        </Link>
        <Link to="/packages" className="btn btn-ghost btn-sm">
          View packages →
        </Link>
      </div>
    </Page>
  );
}
