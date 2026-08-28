import { Link } from "react-router-dom";
import {
  priceLine,
  sizeLine,
  STATUS_LABEL,
  TRANSACTION_LABEL,
  USE_TYPE_LABEL,
  type CommercialListing,
} from "../lib/commercial";
import { aadt } from "../lib/format";

/**
 * One property, at card scale. Leads with the figures a commercial reader
 * scans for — use, transaction, money, size — and one position fact.
 */
export default function ListingCard({ listing }: { listing: CommercialListing }) {
  const l = listing;
  const hero = l.photos[0];
  return (
    <Link
      to={`/listings/${l.slug}`}
      className="glass group block overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-raise">
        <img
          src={hero?.src}
          alt={hero?.alt ?? l.headline}
          width={800}
          height={450}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-paper/80 px-3 py-1 text-xs font-semibold text-bone backdrop-blur">
            {TRANSACTION_LABEL[l.transaction]}
          </span>
          <span className="rounded-full bg-paper/80 px-3 py-1 text-xs text-stone backdrop-blur">
            {USE_TYPE_LABEL[l.useType]}
          </span>
        </div>
        {l.status !== "available" && (
          <span className="absolute right-3 top-3 rounded-full bg-signal-deep px-3 py-1 text-xs font-semibold text-bone">
            {STATUS_LABEL[l.status]}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-sm text-faint">
          {l.address} · {l.city}
        </p>
        <h3 className="mt-1 text-lg font-medium leading-snug text-bone group-hover:text-signal-soft">
          {l.headline}
        </h3>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-lg font-semibold">{priceLine(l)}</span>
          <span className="text-sm text-stone">{sizeLine(l)}</span>
        </div>
        {(l.trafficCount || l.frontageFt) && (
          <p className="mt-2 text-xs text-faint">
            {l.frontageFt ? `${l.frontageFt} ft on ${l.frontageOn}` : l.frontageOn}
            {l.trafficCount ? ` · ${aadt(l.trafficCount)} (${l.trafficCountYear})` : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
