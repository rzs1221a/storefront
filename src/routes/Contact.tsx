import { CONTACT } from "../lib/brand";
import Sheet from "../components/Sheet";
import LeadForm from "../components/LeadForm";

/**
 * The close. Reachable from the rail, the tab bar, and the end of every
 * project sheet — on a map interface the conversion path has to be permanently
 * one tap away, because there is no "scroll to the bottom" to fall back on.
 */
export default function Contact() {
  return (
    <Sheet eyebrow="Start here" title="Tell me what you need">
      <p className="lede">
        Twenty minutes on the phone and you will know whether this is worth
        doing. If it is not a fit, I will say so — I would rather turn down work
        than build something that does not earn its keep.
      </p>

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
        <LeadForm />
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
