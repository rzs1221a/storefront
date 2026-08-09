/*
 * Performance budget — asserted against the real production build in dist/.
 *
 * Ceilings are set from measured 2026-08 numbers plus small headroom, so a
 * regression fails the day it lands, not the day someone notices the site
 * got slow. Raise a ceiling only with a reason written next to it.
 *
 * Run: npm run perf  (after npm run build)
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const ASSETS = join(DIST, "assets");

if (!existsSync(ASSETS)) {
  console.error("perf-budget: dist/assets missing — run `npm run build` first");
  process.exit(1);
}

const failures = [];
const gzKB = (p) => gzipSync(readFileSync(p)).length / 1024;

const assets = readdirSync(ASSETS);
const entry = assets.find((f) => /^index-.*\.js$/.test(f));
const css = assets.find((f) => /^index-.*\.css$/.test(f));
const maplibre = assets.find((f) => /^maplibre/.test(f));

/* 1 — the entry bundle. Measured 114.9 kB gz after route splitting. */
const ENTRY_CEILING = 125;
const entryKB = gzKB(join(ASSETS, entry));
if (entryKB > ENTRY_CEILING) {
  failures.push(
    `entry ${entry}: ${entryKB.toFixed(1)} kB gz > ${ENTRY_CEILING} kB ceiling`
  );
}

/* 2 — the stylesheet. Measured 13.96 kB gz. */
const CSS_CEILING = 16;
const cssKB = gzKB(join(ASSETS, css));
if (cssKB > CSS_CEILING) {
  failures.push(`css ${css}: ${cssKB.toFixed(1)} kB gz > ${CSS_CEILING} kB ceiling`);
}

/* 3 — the WebGL engine must exist as its own chunk and be referenced by NO
   prerendered HTML: it is fetched on demand, after first paint, never on
   map-free routes. This is the single largest performance decision on the
   site; a stray import that pulls maplibre into the entry graph fails here. */
if (!maplibre) {
  failures.push("maplibre chunk missing — did it get bundled into the entry?");
}
const htmlFiles = readdirSync(DIST).filter((f) => f.endsWith(".html"));
for (const f of htmlFiles) {
  const html = readFileSync(join(DIST, f), "utf8");
  if (html.includes("maplibre")) {
    failures.push(`${f} references the maplibre chunk — it must load on demand`);
  }
}
const entrySource = readFileSync(join(ASSETS, entry), "utf8");
if (/maplibre-gl\/dist|new\s+Map\(\{container/.test(entrySource)) {
  failures.push("entry bundle appears to contain maplibre code");
}

/* 4 — route chunks stay small; a route that grows past this has probably
   swallowed a shared module that belongs in the entry graph. */
const ROUTE_CEILING = 15;
for (const f of assets.filter(
  (f) =>
    /\.js$/.test(f) &&
    !/^index-|^maplibre|^rolldown-runtime|^catalog-/.test(f)
)) {
  const kb = gzKB(join(ASSETS, f));
  if (kb > ROUTE_CEILING) {
    failures.push(`chunk ${f}: ${kb.toFixed(1)} kB gz > ${ROUTE_CEILING} kB ceiling`);
  }
}

/* 5 — the display font is on the LCP path (the hero is type on a plate);
   prerender.mjs injects its preload and that must not silently stop. */
const indexHtml = readFileSync(join(DIST, "index.html"), "utf8");
if (!/rel="preload" as="font"[^>]*geist-latin/.test(indexHtml)) {
  failures.push("index.html is missing the geist-latin font preload");
}

if (failures.length) {
  console.error(`perf-budget: ${failures.length} violation(s)\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(
  `perf-budget: clean — entry ${entryKB.toFixed(1)} kB gz (≤${ENTRY_CEILING}), ` +
    `css ${cssKB.toFixed(1)} kB gz (≤${CSS_CEILING}), maplibre on demand only`
);
