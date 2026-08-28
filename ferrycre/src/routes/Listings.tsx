import { lazy, Suspense, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { allListings } from "../lib/listingsSource";
import { USE_TYPE_LABEL, type Transaction, type UseType } from "../lib/commercial";
import { describeCommercial, matchesCommercial, parseCommercial, criteriaIsEmpty } from "../lib/intent";
import { record } from "../lib/attunement";
import { useCanonical, useDocumentTitle } from "../lib/seo";

const MiniMap = lazy(() => import("../components/MiniMap"));

const TX_CHIPS: { id: Transaction | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sale", label: "For sale" },
  { id: "lease", label: "For lease" },
];

export default function Listings() {
  useDocumentTitle(
    "Commercial Listings · Nassau County FL · Ferry CRE",
    "Current commercial listings across Nassau County — retail, office, industrial, medical, and land, with traffic counts, frontage, and zoning on every record."
  );
  useCanonical("/listings");
  const navigate = useNavigate();
  const listings = allListings();

  const [tx, setTx] = useState<Transaction | "all">("all");
  const [uses, setUses] = useState<UseType[]>([]);
  const [q, setQ] = useState("");
  // the chart is on the table by default where there's room for it
  const [showMap, setShowMap] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );

  const usedTypes = useMemo(() => {
    const set = new Set<UseType>();
    listings.forEach((l) => {
      set.add(l.useType);
      (l.secondaryUses ?? []).forEach((u) => set.add(u));
    });
    return [...set];
  }, [listings]);

  const criteria = useMemo(() => parseCommercial(q), [q]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (tx === "sale" && l.transaction === "lease") return false;
      if (tx === "lease" && l.transaction === "sale") return false;
      if (uses.length) {
        const lUses = [l.useType, ...(l.secondaryUses ?? [])];
        if (!uses.some((u) => lUses.includes(u))) return false;
      }
      if (!criteriaIsEmpty(criteria) && !matchesCommercial(l, criteria)) return false;
      return true;
    });
  }, [listings, tx, uses, criteria]);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-40">
      <p className="eyebrow">Inventory</p>
      <h1 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">Current listings</h1>
      <p className="mt-3 max-w-2xl text-stone">
        A small, curated book of business — every record carries the commercial fields that matter,
        from zoning and frontage to tenancy, and nothing that hasn't been verified.
      </p>

      {/* plain-phrase search — type the way you talk */}
      <div className="mt-8 max-w-2xl">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value.length > 3) record({ t: "search", q: e.target.value });
          }}
          placeholder='Try "retail on 200 under 1.5m" or "warehouse lease near 95"'
          className="input-glass py-3.5"
          aria-label="Search listings in plain language"
        />
        {q.trim() && (
          <p className="mt-2 text-sm text-faint">{describeCommercial(criteria, filtered.length)}</p>
        )}
      </div>

      {/* facets */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {TX_CHIPS.map((c) => (
          <button key={c.id} type="button" className="chip" data-on={tx === c.id} onClick={() => setTx(c.id)}>
            {c.label}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-white/15 sm:block" />
        {usedTypes.map((u) => (
          <button
            key={u}
            type="button"
            className="chip"
            data-on={uses.includes(u)}
            onClick={() => setUses((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]))}
          >
            {USE_TYPE_LABEL[u]}
          </button>
        ))}
        <button type="button" className="chip ml-auto" data-on={showMap} onClick={() => setShowMap((v) => !v)}>
          {showMap ? "Hide map" : "Show map"}
        </button>
      </div>

      {showMap && (
        <div className="mt-6">
          <Suspense fallback={<div className="glass h-[380px] animate-pulse" />}>
            <MiniMap listings={filtered} onOpen={(slug) => navigate(`/listings/${slug}`)} />
          </Suspense>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="glass-deep mt-8 p-8 text-center">
          <p className="text-lg">Nothing in the current book fits that.</p>
          <p className="mt-2 text-sm text-stone">
            Much of Nassau County trades off-market. Tell Antoinette the requirement — she may
            already know the owner.
          </p>
        </div>
      )}
    </section>
  );
}
