/**
 * Chart arithmetic — legs between marks.
 *
 * Distances are great-circle, reported in nautical miles because this is a
 * chart; bearings are the initial great-circle course, boxed to the sixteen
 * winds. Straight lines over water, not routes — the same honesty note The
 * Aerial attaches to its distances.
 */

const R_MILES = 3958.8;
const NM_PER_MILE = 0.868976;
const DEG = Math.PI / 180;

const WINDS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const;

export interface Leg {
  /** Nautical miles, one decimal's worth of honesty. */
  nm: number;
  /** Initial course, compass degrees. */
  bearing: number;
  /** The sixteen-wind name for it, e.g. "NNE". */
  compass: string;
}

export function legBetween(
  a: [number, number],
  b: [number, number]
): Leg {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;

  const φ1 = lat1 * DEG;
  const φ2 = lat2 * DEG;
  const Δφ = (lat2 - lat1) * DEG;
  const Δλ = (lon2 - lon1) * DEG;

  const h =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const miles = 2 * R_MILES * Math.asin(Math.min(1, Math.sqrt(h)));

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = ((Math.atan2(y, x) / DEG) + 360) % 360;

  return {
    nm: Math.round(miles * NM_PER_MILE * 10) / 10,
    bearing,
    compass: WINDS[Math.round(bearing / 22.5) % 16],
  };
}
