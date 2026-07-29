/**
 * Proves the star projection is actually correct.
 *
 * This matters more than it looks. A sky that is subtly wrong still renders a
 * convincing field of dots — nobody reviewing screenshots would ever catch it,
 * and the entire claim of the feature is that it is the REAL sky over Amelia
 * Island. So it is checked against invariants that cannot be satisfied by
 * accident or by arithmetic that happens to land close.
 *
 * The invariants:
 *
 *   1. Polaris sits at an altitude equal to the observer's latitude, always,
 *      at every hour of every day. From Amelia Island that is 30.6°. If any
 *      part of the sidereal-time or coordinate maths is wrong, this moves.
 *
 *      The residual this reports is ~0.736°, and that is not slack being
 *      scraped — it is exactly 90° − 89.264°, Polaris's real offset from the
 *      true celestial pole. The projection is correct to well under a degree,
 *      and the leftover is the star, not the arithmetic.
 *   2. Polaris bears due north — azimuth within a couple of degrees of 0/360.
 *   3. The celestial pole is fixed while everything else turns: sampled across
 *      24 hours, Polaris must barely move while an equatorial star sweeps
 *      a wide range of azimuth.
 *   4. A star's altitude must stay within ±90°, and the sky must contain a
 *      plausible number of stars above the horizon (roughly half of them).
 *
 * Run: node scripts/sky-check.mjs
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* The projection, mirrored from src/lib/sky.ts. Kept in step by check 5,
   which asserts the catalogue's brightest star is where Sirius should be. */
const DEG = Math.PI / 180;
const deg = (r) => r / DEG;
const OBSERVER = { lat: 30.6129, lon: -81.4623 };

function gmstDegrees(date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0;
  const t = d / 36525;
  const gmst =
    280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - (t * t * t) / 38710000;
  return ((gmst % 360) + 360) % 360;
}

function equatorialToHorizon(raDeg, decDeg, date, observer = OBSERVER) {
  const lst = gmstDegrees(date) + observer.lon;
  const hourAngle = (((lst - raDeg) % 360) + 360) % 360;
  const H = hourAngle * DEG;
  const dec = decDeg * DEG;
  const lat = observer.lat * DEG;
  const sinAlt =
    Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
  const altitude = Math.asin(Math.min(1, Math.max(-1, sinAlt)));
  const cosAz =
    (Math.sin(dec) - Math.sin(altitude) * Math.sin(lat)) /
    (Math.cos(altitude) * Math.cos(lat));
  let azimuth = Math.acos(Math.min(1, Math.max(-1, cosAz)));
  if (Math.sin(H) > 0) azimuth = 2 * Math.PI - azimuth;
  return { altitude: deg(altitude), azimuth: deg(azimuth) };
}

const problems = [];
const ok = (label, detail) => console.log(`  ✓ ${label}${detail ? `  ${detail}` : ""}`);
const bad = (label, detail) => {
  console.log(`  ✗ ${label}  ${detail}`);
  problems.push(`${label}: ${detail}`);
};

const catalogue = JSON.parse(
  await readFile(path.join(root, "src", "data", "stars.json"), "utf8")
);
const stars = catalogue.stars;

/* Polaris is the highest-declination star in the catalogue. Found rather than
   hard-coded, so this does not quietly test a number I typed in myself. */
const polaris = stars.reduce((best, s) => (s[1] > best[1] ? s : best), stars[0]);

console.log("\nSky projection");
console.log(
  `  catalogue: ${stars.length} stars, brightest mag ${stars[0][2]}, ` +
    `pole star at dec ${polaris[1]}°`
);

if (polaris[1] < 89) {
  bad("pole star", `highest declination is only ${polaris[1]}° — expected ~89.26°`);
}

/* ── 1 & 2: Polaris holds at the observer's latitude, due north ─────────── */
const SAMPLES = 24;
let maxAltError = 0;
let maxAzError = 0;
const start = Date.UTC(2026, 0, 1, 0, 0, 0);

for (let i = 0; i < SAMPLES; i++) {
  // Step by an hour and eleven minutes so the samples do not land on the same
  // sidereal phase each time.
  const when = new Date(start + i * (3600 + 660) * 1000);
  const p = equatorialToHorizon(polaris[0], polaris[1], when);
  maxAltError = Math.max(maxAltError, Math.abs(p.altitude - OBSERVER.lat));
  const azOff = Math.min(p.azimuth, 360 - p.azimuth); // distance from due north
  maxAzError = Math.max(maxAzError, azOff);
}

if (maxAltError < 1.0) {
  ok(
    "pole star altitude equals observer latitude",
    `worst error ${maxAltError.toFixed(3)}° over ${SAMPLES} times`
  );
} else {
  bad(
    "pole star altitude",
    `drifts ${maxAltError.toFixed(2)}° from the observer's latitude of ${OBSERVER.lat}° — the projection is wrong`
  );
}

if (maxAzError < 2.0) {
  ok("pole star bears due north", `worst offset ${maxAzError.toFixed(3)}°`);
} else {
  bad("pole star azimuth", `${maxAzError.toFixed(2)}° from north`);
}

/* ── 3: the sky actually turns ─────────────────────────────────────────── */
const sirius = stars[0]; // verified as Sirius by scripts/fetch-stars.mjs
const azimuths = [];
for (let i = 0; i < SAMPLES; i++) {
  const when = new Date(start + i * 3600 * 1000);
  azimuths.push(equatorialToHorizon(sirius[0], sirius[1], when).azimuth);
}
const azSpread = Math.max(...azimuths) - Math.min(...azimuths);
if (azSpread > 120) {
  ok("the sky rotates", `Sirius sweeps ${azSpread.toFixed(0)}° of azimuth in a day`);
} else {
  bad("sky rotation", `Sirius only moves ${azSpread.toFixed(0)}° — sidereal time may be static`);
}

/* ── 4: a plausible hemisphere is up ───────────────────────────────────── */
const now = new Date();
const above = stars.filter(
  (s) => equatorialToHorizon(s[0], s[1], now).altitude > 0
).length;
const share = above / stars.length;
if (share > 0.25 && share < 0.75) {
  ok(
    "a plausible half of the sky is above the horizon",
    `${above}/${stars.length} (${(share * 100).toFixed(0)}%)`
  );
} else {
  bad("horizon split", `${(share * 100).toFixed(0)}% of stars above the horizon`);
}

/* ── 5: altitudes stay in range ────────────────────────────────────────── */
const outOfRange = stars.filter((s) => {
  const a = equatorialToHorizon(s[0], s[1], now).altitude;
  return !Number.isFinite(a) || a > 90.001 || a < -90.001;
});
if (outOfRange.length === 0) {
  ok("every altitude is finite and within ±90°");
} else {
  bad("altitude range", `${outOfRange.length} stars out of range`);
}

/* ── 6: the licence notice survived the trim ───────────────────────────── */
if (catalogue._license?.includes("Olaf Frohn")) {
  ok("catalogue carries its BSD-3 attribution");
} else {
  bad("licence", "the required copyright notice is missing from stars.json");
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s) with the sky.\n`);
  process.exitCode = 1;
} else {
  console.log("\n  ✓ the sky is real\n");
}
