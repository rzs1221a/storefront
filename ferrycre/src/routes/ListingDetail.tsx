import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LeadForm from "../components/LeadForm";
import ListingCard from "../components/ListingCard";

const MiniMap = lazy(() => import("../components/MiniMap"));
import {
  LEASE_BASIS_LABEL,
  priceLine,
  STATUS_LABEL,
  TRANSACTION_LABEL,
  USE_TYPE_LABEL,
  type CommercialListing,
} from "../lib/commercial";
import { aadt, acres, miles, minutes, pct, sf, usd } from "../lib/format";
import { allListings, bySlug } from "../lib/listingsSource";
import { record } from "../lib/attunement";
import { SITE } from "../lib/site";
import { useCanonical, useDocumentTitle, useJsonLd } from "../lib/seo";

function Spec({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="spec-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function jsonLdFor(l: CommercialListing) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        name: l.headline,
        url: `${SITE.domain}/listings/${l.slug}`,
        ...(l.listedAt ? { datePosted: l.listedAt } : {}),
        about: {
          "@type": "Place",
          name: l.address,
          address: {
            "@type": "PostalAddress",
            streetAddress: l.address,
            addressLocality: l.city,
            addressRegion: l.state,
            postalCode: l.zip,
            addressCountry: "US",
          },
          geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lon },
        },
        ...(l.salePrice
          ? { offers: { "@type": "Offer", price: l.salePrice, priceCurrency: "USD" } }
          : {}),
      },
      { "@id": `${SITE.domain}/#agent` },
    ],
  };
}

export default function ListingDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const l = slug ? bySlug(slug) : undefined;

  useDocumentTitle(
    l ? `${l.address}, ${l.city} — ${TRANSACTION_LABEL[l.transaction]} · Ferry CRE` : "Listing · Ferry CRE",
    l?.summary
  );
  useCanonical(l ? `/listings/${l.slug}` : "/listings");
  useJsonLd(l?.slug ?? "none", useMemo(() => (l ? jsonLdFor(l) : null), [l]));

  useEffect(() => {
    if (l) {
      record({
        t: "listing_open",
        id: l.id,
        useType: l.useType,
        transaction: l.transaction,
        price: l.salePrice ?? null,
      });
      const opened = Date.now();
      return () => record({ t: "listing_dwell", id: l.id, ms: Date.now() - opened });
    }
  }, [l]);

  if (!l) {
    return (
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-44 text-center">
        <h1 className="text-2xl font-medium">That listing isn't in the current book.</h1>
        <Link to="/listings" className="btn-signal mt-6 inline-flex px-6 py-3 text-sm">
          Current listings
        </Link>
      </section>
    );
  }

  const others = allListings().filter((x) => x.id !== l.id).slice(0, 3);
  const hero = l.photos[0];

  return (
    <article className="mx-auto max-w-6xl px-5 pb-16 pt-40">
      <nav className="text-sm text-faint" aria-label="Breadcrumb">
        <Link to="/listings" className="hover:text-bone">
          Listings
        </Link>{" "}
        › {l.city}
      </nav>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow">
            {TRANSACTION_LABEL[l.transaction]} · {USE_TYPE_LABEL[l.useType]}
            {l.status !== "available" ? ` · ${STATUS_LABEL[l.status]}` : ""}
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{l.headline}</h1>
          <p className="mt-2 text-lg text-stone">
            {l.address} · {l.city}, {l.state} {l.zip}
          </p>
        </div>
        <div className="glass px-6 py-4 text-right">
          <p className="text-2xl font-semibold">{priceLine(l)}</p>
          {l.pricePerSF ? <p className="mt-1 text-sm text-stone">{usd(l.pricePerSF)}/SF</p> : null}
          {l.capRate ? <p className="mt-1 text-sm text-stone">{l.capRate}% cap</p> : null}
        </div>
      </header>

      <div className="mt-8 overflow-hidden rounded-3xl">
        <img src={hero?.src} alt={hero?.alt ?? l.headline} width={1600} height={900} className="aspect-[16/9] w-full object-cover" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <section>
            <h2 className="text-xl font-medium">The property</h2>
            <p className="mt-3 leading-relaxed text-stone">{l.summary}</p>
            {l.positioning && <p className="mt-3 leading-relaxed text-signal-soft">{l.positioning}</p>}
          </section>

          <section className="mt-10 grid gap-10 sm:grid-cols-2">
            <dl>
              <h3 className="eyebrow mb-3">The numbers</h3>
              <Spec label="Sale price" value={l.salePrice ? usd(l.salePrice) : null} />
              <Spec label="Lease rate" value={l.leaseRate ? `$${l.leaseRate.toFixed(2)}/SF/yr` : null} />
              <Spec label="Lease basis" value={l.leaseBasis ? LEASE_BASIS_LABEL[l.leaseBasis] : null} />
              <Spec label="NOI" value={l.noi ? `${usd(l.noi)}/yr` : null} />
              <Spec label="Cap rate" value={l.capRate ? `${l.capRate}%` : null} />
              <Spec label="Price / SF" value={l.pricePerSF ? usd(l.pricePerSF) : null} />
              <h3 className="eyebrow mb-3 mt-8">The building</h3>
              <Spec label="Building" value={l.buildingSF ? sf(l.buildingSF) : null} />
              <Spec label="Available" value={l.availableSF && l.availableSF !== l.buildingSF ? sf(l.availableSF) : null} />
              <Spec label="Land" value={l.landAcres ? acres(l.landAcres) : null} />
              <Spec label="Built" value={l.yearBuilt} />
              <Spec label="Renovated" value={l.yearRenovated} />
              <Spec label="Stories" value={l.stories} />
              <Spec label="Clear height" value={l.ceilingHeight} />
              <Spec label="Dock doors" value={l.dockDoors} />
              <Spec label="Drive-in doors" value={l.driveInDoors} />
              <Spec label="Power" value={l.power} />
              <Spec label="Parking" value={l.parkingSpaces ? `${l.parkingSpaces} spaces${l.parkingRatio ? ` · ${l.parkingRatio}` : ""}` : l.parkingRatio} />
              <Spec label="Divisible" value={l.divisible ? `Yes${l.minDivisibleSF ? `, from ${sf(l.minDivisibleSF)}` : ""}` : null} />
            </dl>

            <dl>
              <h3 className="eyebrow mb-3">The position</h3>
              <Spec label="Zoning" value={l.zoning} />
              <Spec label="Frontage" value={l.frontageFt ? `${l.frontageFt} ft on ${l.frontageOn}` : l.frontageOn} />
              <Spec label="Traffic" value={l.trafficCount ? `${aadt(l.trafficCount)} (${l.trafficCountYear})` : null} />
              <Spec label="Ingress" value={l.ingress} />
              <Spec label="Corner" value={l.corner ? "Yes" : null} />
              <Spec label="Parcel" value={l.parcelId} />
              {l.zoningNote && <p className="mt-2 text-sm leading-relaxed text-faint">{l.zoningNote}</p>}
              {l.trafficCount && (
                <p className="mt-2 text-xs leading-relaxed text-faint">Source: {l.trafficCountSource}.</p>
              )}

              {(l.distances?.length || l.driveTimes?.length) && <h3 className="eyebrow mb-3 mt-8">Logistics</h3>}
              {(l.distances ?? []).map((d) => (
                <Spec key={d.label} label={d.label} value={miles(d.miles)} />
              ))}
              {(l.driveTimes ?? []).map((d) => (
                <Spec key={d.label} label={`${d.label} (drive)`} value={minutes(d.minutes)} />
              ))}

              {(l.tenancy || l.tenants?.length || l.neighboringTenants?.length) && (
                <h3 className="eyebrow mb-3 mt-8">Tenancy</h3>
              )}
              <Spec label="Tenancy" value={l.tenancy ? l.tenancy.replace("-", " ") : null} />
              <Spec label="Occupancy" value={l.occupancyPct !== undefined ? pct(l.occupancyPct) : null} />
              {(l.tenants ?? []).map((t) => (
                <Spec key={t.name} label={t.name} value={`${sf(t.sf)}${t.expires ? ` · to ${t.expires}` : ""}`} />
              ))}
              {l.neighboringTenants?.length ? (
                <p className="mt-2 text-sm leading-relaxed text-faint">
                  Nearby: {l.neighboringTenants.join(", ")}.
                </p>
              ) : null}
            </dl>
          </section>

          {l.documents?.length ? (
            <section className="mt-10">
              <h3 className="eyebrow mb-3">Documents</h3>
              <ul className="flex flex-wrap gap-3">
                {l.documents.map((d) => (
                  <li key={d.href}>
                    <a
                      href={d.href}
                      className="btn-ghost px-4 py-2 text-sm"
                      onClick={() => record({ t: "doc_open", id: l.id, label: d.label })}
                    >
                      {d.label} ↓
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10">
            <h3 className="eyebrow mb-3">The position</h3>
            <Suspense fallback={<div className="glass h-[320px]" />}>
              <MiniMap
                listings={[l]}
                onOpen={() => navigate(`/explore?listing=${l.slug}`)}
                view={{ lat: l.lat, lon: l.lon, zoom: 14.6 }}
                heightClass="h-[320px]"
              />
            </Suspense>
            <Link
              to={`/explore?listing=${l.slug}`}
              className="glass mt-3 block p-6 transition-transform hover:-translate-y-0.5"
            >
              <p className="eyebrow">The instrument</p>
              <p className="mt-2 text-lg font-medium">Walk this frontage on the map →</p>
              <p className="mt-1 text-sm text-stone">
                Ingress, neighboring rooftops, and the drive to I-95 — measured, not described.
              </p>
            </Link>
          </section>

          <p className="mt-10 text-xs leading-relaxed text-faint">
            Listed by {l.listingAgent ?? SITE.name}, {SITE.brokerage}.{l.mlsNumber ? ` MLS #${l.mlsNumber}.` : ""}
            {l.listedAt ? ` Listed ${l.listedAt}.` : ""} All information deemed reliable but not guaranteed; verify
            independently.
          </p>
        </div>

        <aside>
          <div className="lg:sticky lg:top-28">
            <h2 className="text-lg font-medium">Ask about this property</h2>
            <div className="mt-4">
              <LeadForm context={{ listing: `${l.address}, ${l.city} (${l.slug})` }} />
            </div>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-16">
          <h2 className="eyebrow mb-4">Also in the book</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <ListingCard key={o.id} listing={o} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
