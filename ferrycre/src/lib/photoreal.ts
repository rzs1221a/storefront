/**
 * True photogrammetry for close-up "walk the streets" views. When a Google
 * Map Tiles API key is present, street level renders Google's Photorealistic
 * 3D Tiles — the same photo-geometry meshes behind Google Earth — through a
 * deck.gl overlay interleaved with the MapLibre scene. Without a key, the view
 * stays on the OSM building extrusions and nothing breaks.
 *
 * Ported from The Aerial (lib/photoreal.ts), adapted from Next.js to Vite:
 * the key is read from import.meta.env.VITE_GOOGLE_3D_TILES_KEY.
 *
 * Setup (one time):
 *   1. Google Cloud Console → enable "Map Tiles API" on a project with billing.
 *   2. Create an API key, restrict it to Map Tiles API + your domains.
 *   3. .env → VITE_GOOGLE_3D_TILES_KEY=your_key
 *
 * Google's terms require visible attribution while these tiles render; the
 * caller shows "© Google" for as long as the overlay is attached. The deck.gl
 * stack is imported dynamically so it costs nothing until the first close-up.
 */
import type { Map as MLMap, IControl } from "maplibre-gl";

const KEY = import.meta.env.VITE_GOOGLE_3D_TILES_KEY as string | undefined;

export function photorealAvailable(): boolean {
  return Boolean(KEY && KEY.length > 10);
}

type OverlayHandle = { overlay: IControl; detach: () => void };
let active: OverlayHandle | null = null;
let pending: Promise<boolean> | null = null;

export async function attachPhotoreal(map: MLMap): Promise<boolean> {
  if (!photorealAvailable() || active) return Boolean(active);
  // The zoom can cross the threshold repeatedly while the deck.gl stack is
  // still loading; everyone awaits the same attach instead of stacking overlays.
  if (pending) return pending;
  pending = doAttach(map).finally(() => {
    pending = null;
  });
  return pending;
}

async function doAttach(map: MLMap): Promise<boolean> {
  try {
    const [{ MapboxOverlay }, { Tile3DLayer }] = await Promise.all([
      import("@deck.gl/mapbox"),
      import("@deck.gl/geo-layers"),
    ]);

    const layer = new Tile3DLayer({
      id: "google-photoreal",
      data: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${KEY}`,
      opacity: 1,
      operation: "terrain+draw",
    });

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [layer],
    }) as unknown as IControl;
    map.addControl(overlay);

    // The flat plate steps back while the photo-geometry is on stage.
    if (map.getLayer("buildings-3d"))
      map.setLayoutProperty("buildings-3d", "visibility", "none");

    active = {
      overlay,
      detach: () => {
        try {
          map.removeControl(overlay);
          if (map.getLayer("buildings-3d"))
            map.setLayoutProperty("buildings-3d", "visibility", "visible");
        } catch {
          /* map may already be gone */
        }
        active = null;
      },
    };
    return true;
  } catch (err) {
    console.warn("Photorealistic tiles unavailable; staying on extrusions.", err);
    return false;
  }
}

export function detachPhotoreal() {
  active?.detach();
}

export function photorealActive(): boolean {
  return active !== null;
}
