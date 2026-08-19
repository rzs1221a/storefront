import LeadForm from "../components/LeadForm";
import { SITE, telHref, mailHref } from "../lib/site";
import { useCanonical, useDocumentTitle } from "../lib/seo";

export default function About() {
  useDocumentTitle(
    `About ${SITE.name} · ${SITE.title} · Ferry CRE`,
    `${SITE.name} is ${SITE.title} at ${SITE.brokerage} in Fernandina Beach, Florida.`
  );
  useCanonical("/about");

  return (
    <section className="mx-auto max-w-4xl px-5 pb-16 pt-40">
      <p className="eyebrow">About</p>
      <h1 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{SITE.name}</h1>
      <p className="mt-2 text-lg text-signal-soft">{SITE.title}</p>
      <p className="mt-1 text-stone">{SITE.brokerage}</p>
      <img
        src="/brand/hw-commercial-lockup-cream.svg"
        alt="Berkshire Hathaway HomeServices Heymann Williams Realty — Commercial Division"
        width={874}
        height={302}
        loading="lazy"
        className="mt-6 h-20 w-auto opacity-90"
      />

      {/* Her bio, in her voice, arrives via /admin. Until then the page states
          only verifiable facts — no ghost-written prose. */}
      {SITE.bioConfirmed ? (
        <p className="mt-8 max-w-2xl leading-relaxed text-stone">{SITE.bio}</p>
      ) : (
        <div className="glass mt-8 max-w-2xl p-7">
          <dl>
            <div className="spec-row">
              <dt>Practice</dt>
              <dd>Commercial sales &amp; leasing, Nassau County FL</dd>
            </div>
            <div className="spec-row">
              <dt>Office</dt>
              <dd>{SITE.officeAddress}</dd>
            </div>
            {SITE.memberships.map((m) => (
              <div className="spec-row" key={m}>
                <dt>Member</dt>
                <dd>{m}</dd>
              </div>
            ))}
            <div className="spec-row">
              <dt>Direct</dt>
              <dd>
                <a href={telHref} className="hover:text-signal-soft">
                  {SITE.phone}
                </a>
              </dd>
            </div>
            <div className="spec-row">
              <dt>Email</dt>
              <dd>
                <a href={mailHref} className="hover:text-signal-soft">
                  {SITE.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      )}

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-faint">
        Antoinette works both of the region's listing networks — realMLS across Northeast Florida
        and AINCAR on the island — so a Nassau County property is marketed to the mainland and the
        island at once, alongside the Berkshire Hathaway HomeServices commercial network.
      </p>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-semibold">Reach her directly.</h2>
        <div className="mt-6">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
