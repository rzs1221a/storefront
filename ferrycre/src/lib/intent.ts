/**
 * The plain-phrase reader, retargeted to commercial vocabulary. No model
 * calls; it reads instantly on the device. A broker or investor types the way
 * they talk and the inventory answers:
 *
 *   "retail on 200 under 1.5m"      → retail, max $1,500,000, Yulee corridor
 *   "warehouse lease near 95"       → industrial/flex, lease
 *   "nnn investment"                → lease-basis NNN or NOI-carrying sale
 *   "5000 sf office fernandina"     → office, minSF 5,000, Fernandina
 */
import type { CommercialListing, Transaction, UseType } from "./commercial";

export type CommercialCriteria = {
  useTypes: UseType[];
  transaction: Transaction | null;
  minPrice: number | null;
  maxPrice: number | null;
  minSF: number | null;
  maxSF: number | null;
  minAcres: number | null;
  nnn: boolean;
  investment: boolean;
  cities: string[];
  corridors: string[];
};

const USE_WORDS: [RegExp, UseType][] = [
  [/\boffice\b|professional space|law|studio/, "office"],
  [/retail|storefront|restaurant|qsr|drive.?thr|pad site|outparcel|shop/, "retail"],
  [/industrial|warehouse|logistics|distribution|manufactur/, "industrial"],
  [/\bflex\b|contractor|shop bay|small bay/, "flex"],
  [/medical|clinic|dental|practice|healthcare|md office/, "medical"],
  [/hotel|inn|hospitality|motel|bed and breakfast|b&b|venue/, "hospitality"],
  [/multifamily|apartment|units\b/, "multifamily"],
  [/\bland\b|\bacreage\b|\bsite\b|\blot\b|\bacres?\b|ground/, "land"],
  [/church|school|self.?storage|car wash|special/, "special-purpose"],
];

const CITY_WORDS: [RegExp, string][] = [
  [/fernandina|downtown|centre st|historic/, "Fernandina Beach"],
  [/yulee|wildlight|sr.?200|state road 200|\bon 200\b|a1a corridor/, "Yulee"],
  [/callahan|us.?1\b|us.?301/, "Callahan"],
  [/amelia|island\b/, "Amelia Island"],
];

const CORRIDOR_WORDS: [RegExp, string][] = [
  [/sr.?200|state road 200|\b200\b|a1a/, "SR-200 / A1A"],
  [/i.?95|interstate|\b95\b/, "I-95"],
  [/us.?17\b/, "US-17"],
  [/us.?1\b|us.?23\b/, "US-1"],
  [/8th|eighth/, "S 8th Street"],
  [/centre/, "Centre Street"],
  [/sadler/, "Sadler Road"],
];

/** "800k", "$1.2m", "2 million", "750000" → dollars. */
function dollars(rawText: string): number | null {
  const m = rawText.replace(/[$,\s]/g, "").match(/^(\d+(?:\.\d+)?)(k|m|million|thousand)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? "").toLowerCase();
  if (unit === "m" || unit === "million") return n * 1_000_000;
  if (unit === "k" || unit === "thousand") return n * 1_000;
  return n >= 10_000 ? n : null;
}

export function parseCommercial(text: string): CommercialCriteria {
  const t = text.toLowerCase();
  const c: CommercialCriteria = {
    useTypes: [],
    transaction: null,
    minPrice: null,
    maxPrice: null,
    minSF: null,
    maxSF: null,
    minAcres: null,
    nnn: false,
    investment: false,
    cities: [],
    corridors: [],
  };
  if (!t.trim()) return c;

  for (const [re, use] of USE_WORDS) if (re.test(t)) c.useTypes.push(use);
  for (const [re, city] of CITY_WORDS) if (re.test(t) && !c.cities.includes(city)) c.cities.push(city);
  for (const [re, cor] of CORRIDOR_WORDS) if (re.test(t) && !c.corridors.includes(cor)) c.corridors.push(cor);

  if (/\blease\b|\brent\b|for lease|tenant/.test(t)) c.transaction = "lease";
  else if (/\bbuy\b|\bsale\b|purchase|own\b|owner.?user/.test(t)) c.transaction = "sale";

  if (/\bnnn\b|triple.?net|absolute net/.test(t)) c.nnn = true;
  if (/invest|cap rate|\bnoi\b|income|1031|stabilized|passive/.test(t)) c.investment = true;

  // price: "under 1.5m", "over 500k", "600k to 900k"
  let m = t.match(/(?:under|below|less than|up to|max)\s+\$?([\d.,]+\s?(?:k|m|million|thousand)?)/);
  if (m) c.maxPrice = dollars(m[1]);
  m = t.match(/(?:over|above|more than|at least|min)\s+\$?([\d.,]+\s?(?:k|m|million|thousand)?)/);
  if (m) c.minPrice = dollars(m[1]);
  m = t.match(/\$?([\d.,]+\s?(?:k|m|million|thousand)?)\s*(?:to|-|–)\s*\$?([\d.,]+\s?(?:k|m|million|thousand)?)/);
  if (m) {
    const lo = dollars(m[1]);
    const hi = dollars(m[2]);
    if (lo && hi && hi > lo) {
      c.minPrice = lo;
      c.maxPrice = hi;
    }
  }

  // size: "5000 sf", "10,000 square feet", "5 acres"
  m = t.match(/([\d,]+)\s*(?:sf|sq\.?\s?ft|square feet)/);
  if (m) c.minSF = parseInt(m[1].replace(/,/g, ""), 10);
  m = t.match(/([\d.]+)\s*acres?\b/);
  if (m) c.minAcres = parseFloat(m[1]);

  return c;
}

export function criteriaIsEmpty(c: CommercialCriteria): boolean {
  return (
    c.useTypes.length === 0 &&
    !c.transaction &&
    !c.minPrice &&
    !c.maxPrice &&
    !c.minSF &&
    !c.minAcres &&
    !c.nnn &&
    !c.investment &&
    c.cities.length === 0 &&
    c.corridors.length === 0
  );
}

export function matchesCommercial(l: CommercialListing, c: CommercialCriteria): boolean {
  if (c.useTypes.length) {
    const uses = [l.useType, ...(l.secondaryUses ?? [])];
    if (!c.useTypes.some((u) => uses.includes(u))) return false;
  }
  if (c.transaction === "lease" && l.transaction === "sale") return false;
  if (c.transaction === "sale" && l.transaction === "lease") return false;
  if (c.nnn && l.leaseBasis !== "NNN" && l.leaseBasis !== "absolute-net" && !l.noi) return false;
  if (c.investment && !l.noi && l.tenancy !== "multi" && l.tenancy !== "single") return false;
  const price = l.salePrice ?? null;
  if (c.maxPrice && price && price > c.maxPrice) return false;
  if (c.minPrice && price && price < c.minPrice) return false;
  const size = l.availableSF ?? l.buildingSF ?? null;
  if (c.minSF && (!size || size < c.minSF)) return false;
  if (c.minAcres && (!l.landAcres || l.landAcres < c.minAcres)) return false;
  if (c.cities.length && !c.cities.some((city) => l.city.toLowerCase() === city.toLowerCase() || (city === "Amelia Island" && l.city === "Fernandina Beach"))) return false;
  if (c.corridors.length) {
    const hay = `${l.frontageOn ?? ""} ${l.address} ${(l.distances ?? []).map((d) => d.label).join(" ")}`.toLowerCase();
    if (!c.corridors.some((cor) => hay.includes(cor.split(" ")[0].toLowerCase().replace("s ", "")))) return false;
  }
  return true;
}

/** A written line describing what was understood — the hint under the input. */
export function describeCommercial(c: CommercialCriteria, count: number): string {
  const parts: string[] = [];
  if (c.useTypes.length) parts.push(c.useTypes.join(" / "));
  else parts.push("commercial");
  if (c.transaction) parts.push(c.transaction === "lease" ? "for lease" : "for sale");
  if (c.nnn) parts.push("NNN");
  if (c.minSF) parts.push(`${c.minSF.toLocaleString()}+ SF`);
  if (c.minAcres) parts.push(`${c.minAcres}+ ac`);
  if (c.maxPrice) parts.push(`under $${c.maxPrice >= 1e6 ? (c.maxPrice / 1e6).toFixed(1) + "M" : Math.round(c.maxPrice / 1e3) + "K"}`);
  if (c.cities.length) parts.push(`in ${c.cities.join(", ")}`);
  const what = parts.join(" · ");
  if (count === 0) return `Nothing in the current inventory fits ${what}. Antoinette may know of something off-market — ask.`;
  if (count === 1) return `One property fits: ${what}.`;
  return `${count} properties fit: ${what}.`;
}
