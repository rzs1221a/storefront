import type { StyleSpecification } from "maplibre-gl";

/**
 * The living-coast style, ported from `heymann-williams-coastal/src/lib/
 * mapStyle.ts` (itself ported from The Aerial). A dark-graded Esri World
 * Imagery raster plate with real OpenStreetMap building footprints extruding
 * in past zoom 14. Both tile sources are key-free — nothing to configure and
 * no per-request billing.
 *
 * The grade here is pushed a stop darker than the client site's. There the map
 * IS the product and carries the page; here it sits behind marketing copy and
 * five portfolio screenshots, and has to stay subordinate to both.
 */

const IMAGERY_TILES =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const VECTOR_TILES = "https://tiles.openfreemap.org/planet";

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
    { id: "base", type: "background", paint: { "background-color": "#06070a" } },
    {
      id: "imagery",
      type: "raster",
      source: "imagery",
      paint: {
        // Desaturated but not drained — the marsh greens and the Atlantic
        // still need to read as a real place through the tint above.
        "raster-saturation": -0.28,
        "raster-contrast": 0.14,
        "raster-brightness-max": 0.84,
        "raster-fade-duration": 120,
      },
    },
    {
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
          "#252b33",
          20,
          "#39434e",
          50,
          "#525d6a",
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
          0.85,
        ] as unknown as number,
      },
    },
  ],
};

/**
 * Where the camera sits: Amelia Island and the Nassau County coast, the
 * ground every one of these five projects covers. Pitched so the shoreline
 * reads as a horizon rather than a flat plan.
 */
export const HOME_VIEW = {
  center: [-81.44, 30.62] as [number, number],
  zoom: 10.4,
  pitch: 42,
  bearing: -18,
};
