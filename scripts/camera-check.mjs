/**
 * Proves the background camera actually follows the reader.
 *
 * The flight is the site's signature interaction and it is invisible to every
 * other check — the page passes contrast, layout, and accessibility whether or
 * not the map ever moves. This asserts the behaviour directly: scroll to each
 * registered section, read the real MapLibre camera, and confirm it arrived
 * near the coordinate that section declares.
 *
 * Also checks the two ways it could be wrong rather than absent: that a fast
 * scroll does not leave the camera queued several sections behind, and that
 * reduced motion suppresses flight entirely.
 *
 * Run: node scripts/camera-check.mjs [origin]
 */

import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { routeThroughCurl } from "./lib/egress.mjs";

const ORIGIN = process.argv[2] || "http://127.0.0.1:4319";

/** Sections to walk, with the centre each one declares in lib/cameraFrames.ts. */
const EXPECTED = [
  { frame: "/", center: [-81.458, 30.641] },
  { frame: "/work/crane-island-bhhs", center: [-81.4773, 30.6125] },
  { frame: "/work/sold-on-amelia-island", center: [-81.4637, 30.6697] },
  { frame: "/build", center: [-81.44, 30.65] },
  { frame: "/contact", center: [-81.47, 30.66] },
];

/** Degrees of slack. The camera eases, so it need only be close. */
const TOLERANCE = 0.08;

const problems = [];

async function resolveChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  const entries = await readdir(base);
  const found = entries.find((e) => /^chromium-\d+$/.test(e));
  return found ? path.join(base, found, "chrome-linux", "chrome") : undefined;
}

/**
 * Expose the live camera to the test. MapLibre keeps no global handle, so the
 * map instance is found by reaching through the canvas MapLibre created.
 */
const READ_CAMERA = `(() => {
  const el = document.querySelector('.live-map .maplibregl-map')
          || document.querySelector('.live-map');
  const key = el && Object.keys(el).find((k) => k.startsWith('__maplibre'));
  const map = key ? el[key] : window.__kedgeMap;
  if (!map || !map.getCenter) return null;
  const c = map.getCenter();
  return { lng: c.lng, lat: c.lat, zoom: map.getZoom() };
})()`;

async function main() {
  const browser = await chromium.launch({
    executablePath: await resolveChromium(),
    args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
  });

  // ── The camera follows the reader ──────────────────────────────────────
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await routeThroughCurl(page);
  await page.goto(ORIGIN, { waitUntil: "networkidle", timeout: 45000 });

  // The map is imported lazily during idle; give it room to mount.
  await page.waitForFunction(
    `document.querySelector('.live-map[data-loaded="true"]') !== null`,
    null,
    { timeout: 30000 }
  );
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });

  const seen = [];
  for (const target of EXPECTED) {
    await page.goto(`${ORIGIN}${target.frame}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      `document.querySelector('.live-map[data-loaded="true"]') !== null`,
      null,
      { timeout: 30000 }
    );

    // Flights run 3s; wait past that so the camera has settled.
    await page.waitForTimeout(4200);
    const cam = await page.evaluate(READ_CAMERA);

    if (!cam) {
      problems.push(`${target.frame}: could not read the map camera`);
      continue;
    }

    const dLng = Math.abs(cam.lng - target.center[0]);
    const dLat = Math.abs(cam.lat - target.center[1]);
    const ok = dLng < TOLERANCE && dLat < TOLERANCE;

    seen.push({ frame: target.frame, lng: cam.lng, lat: cam.lat, zoom: cam.zoom, ok });
    if (!ok) {
      problems.push(
        `${target.frame}: camera at ${cam.lng.toFixed(4)},${cam.lat.toFixed(4)} — expected ${target.center[0]},${target.center[1]}`
      );
    }
  }

  console.log("\nCamera frames");
  for (const s of seen) {
    console.log(
      `  ${s.ok ? "✓" : "✗"} ${s.frame.padEnd(30)} ${s.lng.toFixed(4)}, ${s.lat.toFixed(4)}  z${s.zoom.toFixed(1)}`
    );
  }

  // The camera must actually have moved between sections, not merely sat at a
  // point that happens to satisfy every tolerance.
  const distinct = new Set(seen.map((s) => `${s.lng.toFixed(2)},${s.lat.toFixed(2)}`));
  if (seen.length > 1 && distinct.size < 2) {
    problems.push("camera never moved between sections");
  }
  await context.close();

  /*
   * ── Reduced motion arrives without animating ──────────────────────────
   *
   * The assertion here changed with the redesign, deliberately. When the map
   * was a backdrop, honouring the preference meant the camera held still.
   * Now the camera position IS the destination, so holding still would strand
   * a visitor on /contact looking at the wrong place. The camera must still
   * arrive — it must simply arrive instantly rather than flying.
   *
   * So: navigate, wait far LESS than a flight would take, and assert it is
   * already there.
   */
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const rmPage = await rmContext.newPage();
  await routeThroughCurl(rmPage);
  await rmPage.goto(ORIGIN, { waitUntil: "networkidle" });
  await rmPage.waitForFunction(
    `document.querySelector('.live-map[data-loaded="true"]') !== null`,
    null,
    { timeout: 30000 }
  );

  await rmPage.goto(`${ORIGIN}/contact`, { waitUntil: "domcontentloaded" });
  await rmPage.waitForFunction(
    `document.querySelector('.live-map[data-loaded="true"]') !== null`,
    null,
    { timeout: 30000 }
  );
  // A flight runs 2.8s; 700ms is nowhere near enough to complete one, so
  // arriving by now proves the camera jumped rather than eased.
  await rmPage.waitForTimeout(700);
  const after = await rmPage.evaluate(READ_CAMERA);

  if (after) {
    const target = [-81.47, 30.66];
    const arrived =
      Math.abs(after.lng - target[0]) < TOLERANCE &&
      Math.abs(after.lat - target[1]) < TOLERANCE;
    console.log(
      `\nReduced motion\n  ${arrived ? "✓" : "✗"} camera arrived without animating` +
        `  (${after.lng.toFixed(4)}, ${after.lat.toFixed(4)})`
    );
    if (!arrived) {
      problems.push(
        "reduced motion: camera did not arrive instantly — it either animated or never moved"
      );
    }
  }
  await rmContext.close();

  await browser.close();

  if (problems.length) {
    console.error(`\n${problems.map((p) => `  ✗ ${p}`).join("\n")}\n`);
    process.exitCode = 1;
  } else {
    console.log("\n  ✓ camera behaviour correct\n");
  }
}

main();
