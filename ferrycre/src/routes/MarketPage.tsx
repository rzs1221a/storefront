import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import LeadForm from "../components/LeadForm";

const MiniMap = lazy(() => import("../components/MiniMap"));
import { USE_TYPE_LABEL } from "../lib/commercial";
import { listingsForCities } from "../lib/listingsSource";
import { marketBySlug, markets } from "../lib/markets";
import { record } from "../lib/attunement";
import { SITE } from "../lib/site";
import { useCanonical, useDocumentTitle, useJsonLd } from "../lib/seo";

/**
 * The geo squeeze pages. The crawler-facing version is stamped statically by
 * scripts/prerender.mjs from the same markets.json; this component is the
 * hydrated experience.
 */
export default function MarketPage({ slug }: { slug: string }) {
  const m = marketBySlug(slug)!;
  useDocumentTitle(`${m.h1} · Ferry CRE`, m.tagline);
  useCanonical(`/${m.slug}`);
  useJsonLd(
    m.slug,
    useMemo(
      () => ({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Place",
            name: `${m.name}, Florida`,
            description: m.tagline,
            geo: { "@type": "GeoCoordinates", latitude: m.lat, longitude: m.lon },
          },
          {
            "@type": "FAQPage",
            mainEntity: m.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ],
      }),
      [m]
    )
  );
  useEffect(() => {
    record({ t: "market", slug: m.slug });
  }, [m.slug]);

  const navigate = useNavigate();
  const related = listingsForCities(m.cities);
  const siblings = markets.filter((x) => x.slug !== m.slug);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-40">
      <nav className="text-sm text-faint" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-bone">
          Ferry CRE
        </Link>{" "}
        › Markets
      </nav>
      <p className="eyebrow mt-4">{m.name} · Nassau County · Florida</p>
      <h1 className="font-display mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">{m.h1}</h1>
      <p className="mt-4 max-w-2xl text-lg text-signal-soft">{m.tagline}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-stone">{m.intro}</p>

          <h2 className="eyebrow mb-3 mt-10">The corridors</h2>
          <ul className="flex flex-wrap gap-2">
            {m.corridors.map((c) => (
              <li key={c} className="chip cursor-default">
                {c}
              </li>
            ))}
          </ul>

          <h2 className="eyebrow mb-3 mt-10">What trades here</h2>
          <ul className="flex flex-wrap gap-2">
            {m.useTypes.map((u) => (
              <li key={u} className="chip cursor-default">
                {USE_TYPE_LABEL[u]}
              </li>
            ))}
          </ul>

          <h2 className="eyebrow mb-3 mt-10">The chart</h2>
          <Suspense fallback={<div className="glass h-[340px]" />}>
            <MiniMap
              listings={related.length ? related : []}
              onOpen={(slug) => navigate(`/listings/${slug}`)}
              view={{ lat: m.lat, lon: m.lon, zoom: m.zoom }}
              heightClass="h-[340px]"
            />
          </Suspense>
          <p className="mt-2 text-xs text-faint">
            {m.name} framed from above{related.length ? " — marks are current listings" : ""}. The full instrument
            lives at{" "}
            <Link to="/explore" className="text-signal-soft hover:text-bone">
              /explore
            </Link>
            .
          </p>

          <h2 className="font-display mt-12 text-2xl font-semibold">Buyer &amp; tenant questions</h2>
          <div className="mt-4 space-y-6">
            {m.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-medium text-bone">{f.q}</h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-stone">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="glass p-6 lg:sticky lg:top-28">
            <p className="text-sm leading-relaxed text-stone">
              {SITE.name} is {SITE.title} at {SITE.brokerageShort} — the commercial practice for{" "}
              {m.name}.
            </p>
            <Link to="/contact" className="btn-signal mt-4 w-full px-5 py-2.5 text-sm">
              Talk about {m.shortName}
            </Link>
            <Link to="/explore" className="btn-ghost mt-2 w-full px-5 py-2.5 text-sm">
              Open the map
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="eyebrow mb-4">Current listings in {m.name}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 max-w-4xl">
        <h2 className="font-display text-2xl font-semibold">Looking in {m.name}?</h2>
        <div className="mt-6">
          <LeadForm context={{ market: m.name }} />
        </div>
      </div>

      <nav className="hairline mt-16 pt-8" aria-label="Other markets">
        <h2 className="eyebrow mb-3">Other Nassau County markets</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {siblings.map((s) => (
            <li key={s.slug}>
              <Link to={`/${s.slug}`} className="text-stone hover:text-bone">
                {s.name} commercial real estate
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
