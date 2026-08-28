import type { StyleSpecification } from "maplibre-gl";

/**
 * The living-coast MapLibre style — ported from The Aerial. A dark-graded Esri
 * World Imagery raster plate (the same source as our static stitches) with real
 * OSM building footprints/heights extruding in past zoom 14. Both tile sources
 * are key-free. Google Photorealistic 3D Tiles (lib/photoreal.ts) overlay this
 * past close zoom when a key is present.
 */

const IMAGERY_TILES =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const VECTOR_TILES = "https://tiles.openfreemap.org/planet";

/**
 * Ad and privacy blockers block the Esri imagery host for some visitors
 * (ERR_BLOCKED_BY_CLIENT) — observed in the field, not hypothetical. When the
 * satellite plate can't load, the scene degrades to OpenFreeMap's dark vector
 * basemap (same host as our building tiles, not on blocklists) instead of
 * sitting on a silent black plate. DOM markers survive the style swap.
 */
export const FALLBACK_STYLE = "https://tiles.openfreemap.org/styles/dark";

export function armImageryFallback(
  map: import("maplibre-gl").Map,
  onSwap?: (message: string) => void
) {
  let imageryOk = false;
  let imageryErrors = 0;
  let swapped = false;

  const swap = () => {
    if (swapped) return;
    swapped = true;
    try {
      map.setStyle(FALLBACK_STYLE);
      console.warn("[ferrycre/map] satellite imagery unavailable (blocked or unreachable) — falling back to chart basemap");
      onSwap?.("Satellite imagery is blocked in this browser (likely an ad blocker) — showing the chart basemap instead.");
    } catch {
      /* map torn down */
    }
  };

  map.on("data", (e) => {
    const ev = e as { sourceId?: string; tile?: unknown };
    if (ev.sourceId === "imagery" && ev.tile) imageryOk = true;
  });
  map.on("error", (e) => {
    const ev = e as { sourceId?: string };
    if (ev.sourceId && ev.sourceId !== "imagery") return;
    imageryErrors += 1;
    if (!imageryOk && imageryErrors >= 3) swap();
  });
  // belt and braces: some blockers fail requests without error events
  setTimeout(() => {
    if (!imageryOk && imageryErrors > 0) swap();
  }, 6000);
}

export const coastStyle: StyleSpecification = {
  version: 8,
  sources: {
    imagery: {
      type: "raster",
      tiles: [IMAGERY_TILES],
      tileSize: 256,
      maxzoom: 18,
      attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    },
    osm: { type: "vector", url: VECTOR_TILES },
  },
  layers: [
    { id: "base", type: "background", paint: { "background-color": "#10131a" } },
    {
      // Lighter grading than the residential plate: the imagery reads as a
      // living chart, not a void — mild desaturation, near-full brightness.
      id: "imagery",
      type: "raster",
      source: "imagery",
      paint: {
        "raster-saturation": -0.16,
        "raster-contrast": 0.04,
        "raster-brightness-max": 0.96,
        "raster-brightness-min": 0.04,
        "raster-fade-duration": 80,
      },
    },
    {
      // Real footprints and heights, easing in between zoom 14 and 15.
      id: "buildings-3d",
      type: "fill-extrusion",
      source: "osm",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "render_height"], 18],
          0,
          "#303741",
          20,
          "#4a5560",
          50,
          "#697581",
        ] as unknown as string,
        "fill-extrusion-height": [
          "coalesce",
          ["get", "render_height"],
          18,
        ] as unknown as number,
        "fill-extrusion-base": [
          "coalesce",
          ["get", "render_min_height"],
          0,
        ] as unknown as number,
        "fill-extrusion-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14,
          0,
          15,
          0.9,
        ] as unknown as number,
      },
    },
  ],
};
