/**
 * Single switch-point for listing data — the same seam the residential site
 * proved, retargeted to hand-authored commercial records.
 *
 * Default (and launch state): the firm's live records in
 * src/data/listings.json. No API, no feed, no latency — and full control of
 * every commercial field, which no residential feed carries anyway.
 *
 * The seam stays so a Buildout or RESO adapter can drop in later without
 * touching a component:
 *   1. implement the fetch in a Netlify function returning CommercialListing[]
 *   2. set VITE_USE_LIVE_LISTINGS=true
 *   3. nothing else changes — failure falls back to the authored records,
 *      so the UI never breaks.
 */
import raw from "../data/listings.json";
import { derive, type CommercialListing } from "./commercial";

export const LIVE_LISTINGS = import.meta.env.VITE_USE_LIVE_LISTINGS === "true";

/** True while the JSON still carries the demonstration records. */
export const SAMPLE_DATA: boolean = raw.sample === true;

const authored: CommercialListing[] = (raw.listings as CommercialListing[]).map(derive);

export function allListings(): CommercialListing[] {
  return authored;
}

export function bySlug(slug: string): CommercialListing | undefined {
  return authored.find((l) => l.slug === slug);
}

export function availableListings(): CommercialListing[] {
  return authored.filter((l) => l.status === "available" || l.status === "under-contract");
}

export function listingsForCities(cities: string[]): CommercialListing[] {
  const set = new Set(cities.map((c) => c.toLowerCase()));
  return authored.filter((l) => set.has(l.city.toLowerCase()));
}

export async function fetchListings(): Promise<CommercialListing[]> {
  if (!LIVE_LISTINGS) return authored;
  try {
    const res = await fetch("/.netlify/functions/listings");
    if (!res.ok) throw new Error(`listings ${res.status}`);
    const data = (await res.json()) as CommercialListing[];
    return data.map(derive);
  } catch (err) {
    console.warn("Live listings unavailable — using authored records.", err);
    return authored;
  }
}

export type { CommercialListing };
