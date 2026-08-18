import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // The map stacks must never ride in the main bundle: maplibre is
          // lazy-loaded by the /listings mini-map and /explore, and the
          // deck.gl photoreal stack is dynamic-imported behind /explore.
          if (id.includes("node_modules/maplibre-gl")) return "maplibre";
          if (
            id.includes("node_modules/@deck.gl") ||
            id.includes("node_modules/@loaders.gl") ||
            id.includes("node_modules/@luma.gl") ||
            id.includes("node_modules/@math.gl")
          ) {
            return "geo-3d";
          }
          if (id.includes("/src/data/")) return "app-data";
        },
      },
    },
  },
});
