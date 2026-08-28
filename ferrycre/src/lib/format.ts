/** Shared formatting for money, area, and position figures. */

export const usd = (n: number): string => `$${n.toLocaleString("en-US")}`;

export const usdCompact = (n: number): string =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M` : `$${Math.round(n / 1000)}K`;

export const sf = (n: number): string => `${n.toLocaleString("en-US")} SF`;

export const acres = (n: number): string => `${n} ac`;

/** AADT reads as "42,500 AADT" — always cite source + year next to it. */
export const aadt = (n: number): string => `${n.toLocaleString("en-US")} AADT`;

export const pct = (n: number): string => `${n}%`;

export const miles = (n: number): string => `${n} mi`;

export const minutes = (n: number): string => `${n} min`;
