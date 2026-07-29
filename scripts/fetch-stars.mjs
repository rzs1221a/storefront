/**
 * One-shot: trim a real star catalogue into src/data/stars.json.
 *
 * Source: d3-celestial's stars.6.json (BSD-3-Clause, © 2015 Olaf Frohn).
 * https://github.com/ofrohn/d3-celestial
 *
 * The output is COMMITTED. Runtime must never fetch this — a sky that depends
 * on a third-party CDN is a sky that disappears when GitHub has a bad day, and
 * the licence requires the copyright notice travel with the data anyway.
 *
 * Coordinate convention, verified rather than assumed: each feature's geometry
 * is [RA degrees wrapped to ±180, Dec degrees]. Confirmed by checking that the
 * four brightest records resolve to Sirius (101.287, −16.716), Canopus
 * (95.988, −52.696), Arcturus (−146.085, 19.182) and Vega (−80.765, 38.784),
 * which match their true positions. This script re-asserts that on every run,
 * so a change in the upstream format fails loudly instead of silently
 * producing a wrong sky.
 *
 * Run: node scripts/fetch-stars.mjs
 */

import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE =
  "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/stars.6.json";

/** Magnitude cut. 5.0 keeps 1,627 stars — every naked-eye constellation. */
const MAX_MAG = 5.0;

/** Known objects used to prove the coordinate convention has not changed. */
const FIXTURES = [
  { name: "Sirius", ra: 101.287, dec: -16.716, mag: -1.44 },
  { name: "Canopus", ra: 95.988, dec: -52.696, mag: -0.62 },
  { name: "Arcturus", ra: -146.085, dec: 19.182, mag: -0.05 },
  { name: "Vega", ra: -80.765, dec: 38.784, mag: 0.03 },
];

// curl rather than fetch: this environment's proxy only accepts
// CONNECT-tunnelled traffic, which Node's fetch does not negotiate.
const { stdout } = await execFileAsync(
  "curl",
  ["-sSL", "--max-time", "60", SOURCE],
  { maxBuffer: 64 * 1024 * 1024 }
);

const data = JSON.parse(stdout);
if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
  throw new Error("Upstream catalogue is not a FeatureCollection — format changed.");
}

const near = (a, b, tol = 0.01) => Math.abs(a - b) < tol;

for (const fixture of FIXTURES) {
  const hit = data.features.find(
    (f) =>
      near(f.geometry.coordinates[0], fixture.ra, 0.05) &&
      near(f.geometry.coordinates[1], fixture.dec, 0.05)
  );
  if (!hit) {
    throw new Error(
      `${fixture.name} not found at its true position — the coordinate ` +
        `convention has changed and the projection would be wrong.`
    );
  }
  if (!near(hit.properties.mag, fixture.mag, 0.1)) {
    throw new Error(
      `${fixture.name} found but magnitude is ${hit.properties.mag}, expected ~${fixture.mag}.`
    );
  }
}

const stars = data.features
  .filter((f) => typeof f.properties?.mag === "number" && f.properties.mag <= MAX_MAG)
  .map((f) => [
    // Wrap RA into 0–360 once, here, so the runtime never has to think about it.
    Number((((f.geometry.coordinates[0] % 360) + 360) % 360).toFixed(3)),
    Number(f.geometry.coordinates[1].toFixed(3)),
    Number(f.properties.mag.toFixed(2)),
  ])
  .sort((a, b) => a[2] - b[2]);

const out = {
  _license:
    "Star positions from d3-celestial (https://github.com/ofrohn/d3-celestial), " +
    "BSD-3-Clause, Copyright (c) 2015 Olaf Frohn. All rights reserved. " +
    "Redistributed with this notice as the licence requires.",
  _format: "[rightAscensionDegrees0to360, declinationDegrees, visualMagnitude]",
  _maxMagnitude: MAX_MAG,
  stars,
};

await mkdir(path.join(root, "src", "data"), { recursive: true });
await writeFile(
  path.join(root, "src", "data", "stars.json"),
  JSON.stringify(out),
  "utf8"
);

console.log(
  `Wrote ${stars.length} stars (mag ≤ ${MAX_MAG}). Fixtures verified: ` +
    FIXTURES.map((f) => f.name).join(", ")
);
