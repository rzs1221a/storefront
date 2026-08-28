import { Link } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import LeadForm from "../components/LeadForm";
import { availableListings } from "../lib/listingsSource";
import { markets } from "../lib/markets";
import { SITE, telHref } from "../lib/site";
import { useCanonical, useDocumentTitle } from "../lib/seo";

export default function Home() {
  useDocumentTitle(
    "Ferry CRE · Nassau County Commercial Real Estate · Antoinette Ferry",
    "Commercial sales and leasing across Nassau County, Florida — Fernandina Beach, Amelia Island, Yulee, and Callahan."
  );
  useCanonical("/");
  const listings = availableListings();

  return (
    <>
      {/* her, her market, her inventory */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-40 sm:pt-44">
        <p className="eyebrow">Nassau County · Florida</p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Commercial real estate, from the port to the interstate.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone">
          {SITE.name} is {SITE.title} at {SITE.brokerageShort} — the county's dedicated commercial
          practice. Sales, leasing, tenant and landlord representation across Fernandina Beach,
          Amelia Island, Yulee, and Callahan.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/listings" className="btn-signal px-6 py-3 text-sm">
            View current listings
          </Link>
          <a href={telHref} className="btn-ghost px-6 py-3 text-sm">
            Call {SITE.phone}
          </a>
        </div>
      </section>

      {/* the inventory — small, curated, high-value; every property answered in full */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Current inventory</p>
            <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
              Every listing, answered in full.
            </h2>
          </div>
          <Link to="/listings" className="text-sm text-signal-soft hover:text-bone">
            All listings →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 6).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-faint">
          Traffic counts, frontage, ingress, zoning, power, and drive times are on every property
          page — the numbers a site selector pulls from three databases, already assembled. Then{" "}
          <Link to="/explore" className="text-signal-soft hover:text-bone">
            walk the street on the map
          </Link>
          .
        </p>
      </section>

      {/* the chart window — the section steps aside and the living background
          shows through; the map IS the page here */}
      <section className="relative mx-auto flex min-h-[52vh] max-w-6xl flex-col items-start justify-end px-5 py-12">
        <div className="glass max-w-md p-6">
          <p className="eyebrow">The county</p>
          <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
            Every position on the chart behind this page.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone">
            The marks are her current listings. The full instrument adds traffic counts, frontage,
            drive distances, and the street-level walk.
          </p>
          <Link to="/explore" className="btn-signal mt-4 px-6 py-2.5 text-sm">
            Open the instrument
          </Link>
        </div>
      </section>

      {/* the markets */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <p className="eyebrow">The submarkets</p>
        <h2 className="font-display mt-2 max-w-2xl text-2xl font-semibold sm:text-3xl">
          One county, four different commercial markets.
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {markets
            .filter((m) => m.slug !== "nassau-county-commercial-real-estate")
            .map((m) => (
              <Link key={m.slug} to={`/${m.slug}`} className="glass block p-6 transition-transform duration-200 hover:-translate-y-0.5">
                <h3 className="text-lg font-medium text-bone">{m.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{m.tagline}</p>
                <p className="mt-3 text-xs text-faint">{m.corridors.slice(0, 3).join(" · ")}</p>
              </Link>
            ))}
        </div>
        <Link
          to="/nassau-county-commercial-real-estate"
          className="mt-5 inline-block text-sm text-signal-soft hover:text-bone"
        >
          The whole county, in one read →
        </Link>
      </section>

      {/* why her */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="glass-deep grid gap-8 p-8 sm:p-10 md:grid-cols-3">
          <div>
            <p className="text-3xl font-semibold text-signal-soft">Both MLSs</p>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              Member of realMLS (Northeast Florida) and AINCAR — every listing works both networks,
              island and mainland.
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-signal-soft">Commercial only</p>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              The firm's dedicated commercial desk. Zoning, lease structures, cap rates, and corridor
              data — not a residential sideline.
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-signal-soft">Berkshire behind it</p>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              {SITE.brokerageShort} — local ownership with the Berkshire Hathaway HomeServices
              network's reach.
            </p>
          </div>
        </div>
      </section>

      {/* the close */}
      <section className="mx-auto max-w-4xl px-5 py-16" id="contact">
        <p className="eyebrow">Start here</p>
        <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
          Tell her what you're looking for.
        </h2>
        <p className="mt-3 max-w-2xl text-stone">
          Five fields, one conversation. Requirements stay confidential.
        </p>
        <div className="mt-8">
          <LeadForm />
        </div>
      </section>
    </>
  );
}
