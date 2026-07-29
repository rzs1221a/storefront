import { Link, useSearchParams } from "react-router-dom";
import { CONTACT, SHOW_PRICING } from "../lib/brand";
import { tierBySlug } from "../lib/offer";
import Sheet from "../components/Sheet";
import LeadForm from "../components/LeadForm";

/**
 * The close. Reachable from the rail, the tab bar, and the end of every
 * project sheet — on a map interface the conversion path has to be permanently
 * one tap away, because there is no "scroll to the bottom" to fall back on.
 *
 * Arriving from an offer card carries `?package=<slug>`, which pre-selects
 * that tier in the form and acknowledges the choice above it. Carrying the
 * selection in the URL rather than in component state is deliberate: it
 * survives a reload, it can be sent to someone, and it works from the
 * prerendered HTML before React has mounted.
 */
export default function Contact() {
  const [params] = useSearchParams();
  const tier = tierBySlug(params.get("package"));

  return (
    <Sheet
      eyebrow={tier ? `Packages — ${tier.name}` : "Start here"}
      title={tier ? `Let's talk about your ${tier.name}` : "Tell me what you need"}
    >
      <p className="lede">
        Twenty minutes on the phone and you will know whether this is worth
        doing. If it is not a fit, I will say so — I would rather turn down work
        than build something that does not earn its keep.
      </p>

      {tier && (
        <div className="selected-package">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="selected-package-name">
              {tier.name}
              <span className="selected-package-system"> · {tier.system}</span>
            </p>
            <p className="font-mono text-sm text-(--color-signal)">
              {SHOW_PRICING && tier.price !== null
                ? `$${tier.price.toLocaleString("en-US")} ${tier.priceNote}`
                : "Fixed quote, in writing"}
            </p>
          </div>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-(--color-ink-soft)">
            {tier.summary}
          </p>
          <p className="mono-label mt-3">
            {tier.turnaroundTime} ·{" "}
            <Link to="/packages" className="hover:text-(--color-ink)">
              Compare all three →
            </Link>
          </p>
        </div>
      )}

      <div className="mt-6 divide-y divide-(--line) overflow-hidden rounded-xl border border-(--line)">
        <a
          href={`tel:${CONTACT.phone}`}
          className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.04]"
        >
          <span className="mono-label">Call</span>
          <span className="text-[0.9375rem]">{CONTACT.phoneDisplay}</span>
        </a>
        <a
          href={`sms:${CONTACT.phone}`}
          className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.04]"
        >
          <span className="mono-label">Text</span>
          <span className="text-[0.9375rem]">{CONTACT.phoneDisplay}</span>
        </a>
        <a
          href={`mailto:${CONTACT.email}`}
          className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.04]"
        >
          <span className="mono-label">Email</span>
          <span className="truncate text-[0.9375rem]">{CONTACT.email}</span>
        </a>
      </div>

      <div className="mt-6">
        <LeadForm selectedPackage={tier?.name} />
      </div>

      <p className="mt-6 flex items-center gap-2 text-sm text-(--color-ink-faint)">
        <span className="live-dot" />
        Based in {CONTACT.location}. I reply within one business day.
      </p>

      {/* The non-affiliation notice has to live somewhere now that there is no
          footer; the close is where a visitor is most likely to read it. */}
      <p className="mt-8 border-t border-(--line) pt-6 text-xs leading-relaxed text-(--color-ink-faint)">
        Kedge is an independent studio — not affiliated with, endorsed by, or
        acting on behalf of Berkshire Hathaway HomeServices. All trademarks
        belong to their respective owners. Background imagery © Esri, Maxar,
        Earthstar Geographics. Building data © OpenStreetMap contributors.
      </p>
    </Sheet>
  );
}
