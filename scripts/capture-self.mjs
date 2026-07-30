/**
 * Captures the storefront's own screenshots for its work entry.
 *
 * Separate from capture.mjs, which drives the sibling project repos — this one
 * points the camera at the site itself, so its subject is the running build in
 * ./dist. Same conventions as capture.mjs: desktop 1800w and mobile 780w,
 * WebP q80, output committed under public/work/<slug>/ so the build never
 * depends on a capture step.
 *
 * Run: npm run build && npx serve -l 4319 dist &  then  tsx scripts/capture-self.mjs
 */

import { mkdir, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { routeThroughCurl } from "./lib/egress.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = process.argv[2] || "http://127.0.0.1:4319";
const OUT = path.join(root, "public", "work", "seamark-storefront");

async function resolveChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  const entries = await readdir(base);
  const found = entries.find((e) => /^chromium-\d+$/.test(e));
  return found ? path.join(base, found, "chrome-linux", "chrome") : undefined;
}

const { default: sharp } = await import("sharp");
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: await resolveChromium(),
  args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});

for (const shot of [
  { name: "desktop", width: 1440, height: 900, mobile: false, max: 1800 },
  { name: "mobile", width: 390, height: 844, mobile: true, max: 780 },
]) {
  const ctx = await browser.newContext({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: 2,
    isMobile: shot.mobile,
    hasTouch: shot.mobile,
  });
  const page = await ctx.newPage();
  await routeThroughCurl(page);

  // First visit only marks the session so the Opening never covers the shot.
  await page.goto(ORIGIN, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.evaluate(() => {
    try {
      sessionStorage.setItem("seamark:opened", "1");
    } catch {
      /* ignore */
    }
  });
  await page.goto(ORIGIN, { waitUntil: "domcontentloaded", timeout: 45000 });

  // Software rendering draws tiles slowly; give the plate time to fill.
  await page.waitForTimeout(12000);

  // Freeze every animation at its lit state — a light signature caught
  // mid-eclipse would ship a permanently dim beacon.
  const freeze = await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-play-state: paused !important;
      transition: none !important;
    }
    .beacon-dot { opacity: 1 !important; }`,
  });
  const png = await page.screenshot({ type: "png" });
  await freeze.evaluate((n) => n.remove());
  await ctx.close();

  /*
   * Blank guard, same as capture.mjs: a capture whose pixels barely vary is a
   * failed render (tiles never arrived, or the page died), and a blank frame
   * on a portfolio page is worse than a missing one.
   */
  const stats = await sharp(png).stats();
  const stdev =
    stats.channels.reduce((sum, c) => sum + c.stdev, 0) / stats.channels.length;
  if (stdev < 12) {
    throw new Error(
      `capture-self: ${shot.name} frame is blank (stdev ${stdev.toFixed(1)}) — did the map render?`
    );
  }

  const out = path.join(OUT, `${shot.name}.webp`);
  await writeFile(
    out,
    await sharp(png)
      .resize({ width: shot.max, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
  );
  console.log(`capture-self: wrote ${path.relative(root, out)}`);
}

await browser.close();
