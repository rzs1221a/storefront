import { BRAND, CONTACT } from "../lib/brand";
import { WORK } from "../lib/work";
import BrandMark from "./BrandMark";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--line) py-14">
      <div className="shell">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="flex items-center gap-2 text-[0.9375rem] font-medium">
              <BrandMark size={17} className="text-(--color-signal)" />
              {BRAND.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-(--color-ink-muted)">
              {BRAND.tagline} Built on {CONTACT.location.split(",")[0]}, for
              agents who would rather own their site than rent it.
            </p>
          </div>

          <nav aria-label="Footer" className="flex gap-14">
            <div>
              <p className="mono-label">Work</p>
              <ul className="mt-4 space-y-2.5">
                {WORK.filter((w) => w.liveUrl).map((w) => (
                  <li key={w.slug}>
                    <a
                      href={w.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[32px] items-center text-sm text-(--color-ink-soft) transition-colors hover:text-(--color-ink)"
                    >
                      {w.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mono-label">Get in touch</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="inline-flex min-h-[32px] items-center text-sm text-(--color-ink-soft) transition-colors hover:text-(--color-ink)"
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="inline-flex min-h-[32px] items-center text-sm text-(--color-ink-soft) transition-colors hover:text-(--color-ink)"
                  >
                    Email
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="inline-flex min-h-[32px] items-center text-sm text-(--color-ink-soft) transition-colors hover:text-(--color-ink)"
                  >
                    Get a quote
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Non-affiliation notice. Worth keeping: this site markets to BHHS
            agents and shows BHHS-branded client work, and an independent
            studio should not imply it speaks for the brokerage. */}
        <p className="mt-12 border-t border-(--line) pt-8 text-xs leading-relaxed text-(--color-ink-faint)">
          © {year} {BRAND.name}. An independent studio — not affiliated with,
          endorsed by, or acting on behalf of Berkshire Hathaway HomeServices.
          All trademarks belong to their respective owners.
          {/* Esri's terms require visible attribution wherever World Imagery
              is displayed. The background map has its own control switched
              off, so the credit lives here. */}
          <span className="mt-2 block">
            Background imagery © Esri, Maxar, Earthstar Geographics. Building
            data © OpenStreetMap contributors.
          </span>
        </p>
      </div>
    </footer>
  );
}
