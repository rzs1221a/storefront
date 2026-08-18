// Capture demo screenshots of the built site (vite preview on :4173).
// Chromium comes from the environment's preinstalled Playwright browsers.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = process.env.SHOT_DIR || "shots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

const shots = [
  ["/", "01-home", 900],
  ["/listings", "02-listings", 900],
  ["/listings/sr200-retail-outparcel-yulee", "03-listing-detail", 900],
  ["/yulee-commercial-real-estate", "04-geo-yulee", 900],
  ["/explore?listing=sr200-retail-outparcel-yulee", "05-explore", 900],
  ["/services", "06-services", 900],
];

for (const [route, name, h] of shots) {
  await page.setViewportSize({ width: 1440, height: h });
  await page.goto(`http://localhost:4173${route}`, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(route.startsWith("/explore") ? 9000 : 1200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(name);
}

// full-page shot of a listing page — the SEO asset in full
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://localhost:4173/listings/amelia-medical-suite-fernandina", { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/07-listing-full.png`, fullPage: true });
console.log("07-listing-full");

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await mob.goto("http://localhost:4173/", { waitUntil: "networkidle" }).catch(() => {});
await mob.waitForTimeout(1000);
await mob.screenshot({ path: `${OUT}/08-mobile-home.png` });
console.log("08-mobile-home");

await browser.close();
