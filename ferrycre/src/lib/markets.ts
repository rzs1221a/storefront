/**
 * The geo squeeze pages' single source of truth. Raw records live in
 * src/data/markets.json so scripts/prerender.mjs reads the same file without
 * a TypeScript toolchain; this module adds types and lookups for the app.
 */
import raw from "../data/markets.json";
import type { UseType } from "./commercial";

export interface MarketFaq {
  q: string;
  a: string;
}

export interface Market {
  /** Full route slug, e.g. "yulee-commercial-real-estate". */
  slug: string;
  name: string;
  shortName: string;
  h1: string;
  tagline: string;
  lat: number;
  lon: number;
  zoom: number;
  /** Listing cities that belong to this market page. */
  cities: string[];
  useTypes: UseType[];
  corridors: string[];
  /** Unique 150–200 word authored prose. Never templated, never duplicated. */
  intro: string;
  faqs: MarketFaq[];
}

export const markets: Market[] = raw.markets as Market[];

export const marketBySlug = (slug: string): Market | undefined =>
  markets.find((m) => m.slug === slug);
