/**
 * Real geography, WGS84 — Nassau County and its logistics context.
 * Coordinates are approximate centroids unless marked verified.
 */

export const COUNTY_CENTER: [number, number] = [-81.65, 30.61];

/** Camera constrained to the county and its approaches. */
export const MAX_BOUNDS: [[number, number], [number, number]] = [
  [-82.3, 30.2], // SW past Baldwin
  [-81.1, 31.0], // NE past Cumberland
];

/** Opening frame: the whole county, port to rail junction. */
export const HOME_VIEW = {
  center: [-81.63, 30.62] as [number, number],
  zoom: 9.8,
  pitch: 30,
  bearing: 0,
};

export const ZOOM_RANGE = { minZoom: 8.4, maxZoom: 17.8 };

/** The logistics anchors a commercial buyer measures against. */
export const ANCHORS: { key: string; name: string; lat: number; lon: number }[] = [
  { key: "i95-373", name: "I-95 · Exit 373 (SR-200)", lat: 30.642, lon: -81.55 },
  { key: "i95-380", name: "I-95 · Exit 380 (US-17)", lat: 30.735, lon: -81.585 },
  { key: "port", name: "Port of Fernandina", lat: 30.6715, lon: -81.4657 },
  { key: "jax-air", name: "Jacksonville International", lat: 30.4941, lon: -81.6879 },
  { key: "downtown-fb", name: "Downtown Fernandina", lat: 30.6697, lon: -81.4637 },
  { key: "callahan-jct", name: "Callahan · US-1/US-301/CSX", lat: 30.562, lon: -81.83 },
  { key: "wildlight", name: "Wildlight", lat: 30.653, lon: -81.62 },
];

/** Corridor labels drawn faint on the plate. */
export const CORRIDORS: { name: string; lat: number; lon: number; minZoom?: number }[] = [
  { name: "SR-200 · A1A", lat: 30.6295, lon: -81.54, minZoom: 9.6 },
  { name: "US-17", lat: 30.68, lon: -81.6, minZoom: 10 },
  { name: "US-1 · US-23", lat: 30.52, lon: -81.79, minZoom: 9.6 },
  { name: "US-301", lat: 30.63, lon: -81.9, minZoom: 9.6 },
  { name: "S 8th Street", lat: 30.658, lon: -81.459, minZoom: 11.6 },
  { name: "Centre Street", lat: 30.6699, lon: -81.4622, minZoom: 12.6 },
  { name: "Sadler Road", lat: 30.6367, lon: -81.4453, minZoom: 11.6 },
  { name: "atlantic ocean", lat: 30.6, lon: -81.35, minZoom: 8.8 },
  { name: "amelia river · icw", lat: 30.645, lon: -81.485, minZoom: 10.4 },
  { name: "st. marys river", lat: 30.77, lon: -81.78, minZoom: 9.4 },
];

/** Straight-line miles between two points — the logistics input. */
export function milesBetween(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)) * 10) / 10;
}
