import LeadForm from "../components/LeadForm";
import { SITE, telHref, mailHref } from "../lib/site";
import { useCanonical, useDocumentTitle } from "../lib/seo";

export default function Contact() {
  useDocumentTitle(
    "Contact · Ferry CRE · Antoinette Ferry",
    `Reach ${SITE.name} directly: ${SITE.phone}, ${SITE.email}. Commercial sales and leasing across Nassau County, Florida.`
  );
  useCanonical("/contact");
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-40">
      <p className="eyebrow">Contact</p>
      <h1 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
        Requirements welcome. Off-market conversations too.
      </h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[380px_1fr]">
        <div>
          <div className="glass p-7">
            <p className="text-lg font-medium">{SITE.name}</p>
            <p className="mt-1 text-sm text-signal-soft">{SITE.title}</p>
            <p className="mt-4 text-sm text-stone">
              <a href={telHref} className="block py-1 hover:text-bone">
                {SITE.phone} — direct
              </a>
              <a href={mailHref} className="block py-1 hover:text-bone">
                {SITE.email}
              </a>
            </p>
            <p className="mt-4 border-t border-white/10 pt-4 text-sm text-stone">
              {SITE.brokerageShort}
              <br />
              {SITE.officeAddress}
              <br />
              Office {SITE.officePhone}
            </p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-faint">
            Calls and texts go to her directly, not a front desk. If you're standing on a property
            right now, call — the traffic count can wait.
          </p>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
