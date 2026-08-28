/**
 * The commercial domain model — written from scratch, on purpose.
 *
 * Nothing in the residential codebases speaks commercial: their listing types
 * require beds/baths/HOA and branch on WaterfrontYN. Those assumptions are
 * load-bearing through every residential component, so this file starts clean
 * rather than extending them. Every field a commercial buyer, tenant, or
 * broker actually asks about lives here — including the position fields
 * (frontage, traffic counts, ingress, distances) that make the map an
 * instrument instead of a locator.
 */

export type UseType =
  | "office"
  | "retail"
  | "industrial"
  | "flex"
  | "medical"
  | "hospitality"
  | "multifamily"
  | "land"
  | "special-purpose";

export type Transaction = "sale" | "lease" | "sale-or-lease";

export type LeaseBasis = "NNN" | "MG" | "FSG" | "IG" | "absolute-net";

export type ListingStatus = "available" | "under-contract" | "leased" | "sold";

export type ListingSource = "mls-nefmls" | "mls-aincar" | "buildout" | "direct";

export type CommercialListing = {
  id: string;
  /** The URL — address-derived, stable. Never regenerate for a live listing. */
  slug: string;
  transaction: Transaction;
  useType: UseType;
  secondaryUses?: UseType[];

  // identity
  address: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  lat: number;
  lon: number;
  parcelId?: string;
  /** Zoning code + plain-language gloss, e.g. "C-2 — General Commercial". */
  zoning?: string;
  zoningNote?: string;

  // money
  salePrice?: number;
  /** Per SF per year. */
  leaseRate?: number;
  leaseBasis?: LeaseBasis;
  capRate?: number;
  noi?: number;
  /** Derived at load time from salePrice / buildingSF. Never hand-author. */
  pricePerSF?: number;

  // physical
  buildingSF?: number;
  /** What's actually on the market — may be less than the building. */
  availableSF?: number;
  landAcres?: number;
  yearBuilt?: number;
  yearRenovated?: number;
  stories?: number;
  ceilingHeight?: string;
  dockDoors?: number;
  driveInDoors?: number;
  /** e.g. "400A 3-phase". */
  power?: string;
  parkingSpaces?: number;
  parkingRatio?: string;
  divisible?: boolean;
  minDivisibleSF?: number;

  // position — the fields that make the map an instrument
  frontageFt?: number;
  /** "A1A" / "SR-200" / "US-17". */
  frontageOn?: string;
  /** AADT. Always cite trafficCountSource + trafficCountYear alongside. */
  trafficCount?: number;
  trafficCountYear?: number;
  /** FDOT station or program — cite it. */
  trafficCountSource?: string;
  /** "full median cut, signalized". */
  ingress?: string;
  corner?: boolean;
  driveTimes?: { label: string; minutes: number }[];
  /** I-95, JAX, port, downtown. */
  distances?: { label: string; miles: number }[];

  // tenancy
  tenancy?: "single" | "multi" | "vacant" | "owner-user";
  occupancyPct?: number;
  tenants?: { name: string; sf: number; expires?: string }[];
  /** The retail co-tenancy question. */
  neighboringTenants?: string[];

  // narrative
  headline: string;
  /** 2–3 sentences, hers. */
  summary: string;
  /** Who this property is FOR. */
  positioning?: string;
  photos: { src: string; alt: string; caption?: string }[];
  documents?: { label: string; href: string }[];

  // status
  status: ListingStatus;
  /** ISO date the listing went live, when known. */
  listedAt?: string;
  /** Listing agent of record when it isn't Antoinette — company listings she represents. */
  listingAgent?: string;
  source: ListingSource;
  mlsNumber?: string;
};

export const USE_TYPE_LABEL: Record<UseType, string> = {
  office: "Office",
  retail: "Retail",
  industrial: "Industrial",
  flex: "Flex",
  medical: "Medical",
  hospitality: "Hospitality",
  multifamily: "Multifamily",
  land: "Land",
  "special-purpose": "Special Purpose",
};

export const LEASE_BASIS_LABEL: Record<LeaseBasis, string> = {
  NNN: "Triple net (NNN)",
  MG: "Modified gross",
  FSG: "Full-service gross",
  IG: "Industrial gross",
  "absolute-net": "Absolute net",
};

export const TRANSACTION_LABEL: Record<Transaction, string> = {
  sale: "For Sale",
  lease: "For Lease",
  "sale-or-lease": "Sale or Lease",
};

export const STATUS_LABEL: Record<ListingStatus, string> = {
  available: "Available",
  "under-contract": "Under Contract",
  leased: "Leased",
  sold: "Sold",
};

/**
 * Derived figures are computed here, never hand-authored — a hand-typed
 * price-per-foot goes stale the day the price changes. The prerender build
 * fails if listings.json carries a value the pipeline derives.
 */
export function derive(raw: CommercialListing): CommercialListing {
  const l = { ...raw };
  if (l.salePrice && l.buildingSF && !l.pricePerSF) {
    l.pricePerSF = Math.round(l.salePrice / l.buildingSF);
  }
  if (l.salePrice && l.noi && !l.capRate) {
    l.capRate = Math.round((l.noi / l.salePrice) * 10000) / 100;
  }
  return l;
}

/** Fields listings.json must never author because derive() owns them. */
export const DERIVED_FIELDS = ["pricePerSF"] as const;

/** The headline money figure, formatted for cards and titles. */
export function priceLine(l: CommercialListing): string {
  if (l.transaction === "lease" && l.leaseRate) {
    return `$${l.leaseRate.toFixed(2)}/SF/yr${l.leaseBasis ? ` ${l.leaseBasis}` : ""}`;
  }
  if (l.salePrice) {
    const sale = `$${l.salePrice.toLocaleString("en-US")}`;
    if (l.transaction === "sale-or-lease" && l.leaseRate) {
      return `${sale} · $${l.leaseRate.toFixed(2)}/SF/yr`;
    }
    return sale;
  }
  return "Inquire for pricing";
}

/** The headline size figure: building SF for improved, acres for land. */
export function sizeLine(l: CommercialListing): string {
  const parts: string[] = [];
  if (l.buildingSF) parts.push(`${l.buildingSF.toLocaleString("en-US")} SF`);
  if (l.landAcres) parts.push(`${l.landAcres} ac`);
  return parts.join(" on ") || "—";
}
