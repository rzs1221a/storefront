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
    { id: "base", type: "background", paint: { "background-color": "#070707" } },
    {
      id: "imagery",
      type: "raster",
      source: "imagery",
      paint: {
        "raster-saturation": -0.32,
        "raster-contrast": 0.08,
        "raster-brightness-max": 0.82,
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
