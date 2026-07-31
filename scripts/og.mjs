/**
 * Generates public/og.webp — the social preview card.
 *
 * Every shared link (iMessage, LinkedIn, Slack, a text to an agent) renders
 * this image. Without it the preview is a grey box, which is a poor first
 * impression for a studio selling web presence.
 *
 * Rendered with Playwright rather than drawn by hand so it uses the real
 * Fraunces typeface and the real brand tokens — the card and the site cannot
 * drift into looking like two different companies. Reads BRAND, so a rename
 * regenerates correctly with no edits here.
 *
 * Run: tsx scripts/og.mjs   (after a build, which produces the font files)
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { BRAND } from "../src/lib/brand.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Facebook/LinkedIn/X all crop to roughly 1.91:1; 1200×630 is the safe size. */
const WIDTH = 1200;
const HEIGHT = 630;

async function resolveChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  const entries = await readdir(base);
  const found = entries.find((e) => /^chromium-\d+$/.test(e));
  return found ? path.join(base, found, "chrome-linux", "chrome") : undefined;
}

/** The Latin subset of the site's own variable font, inlined as a data URI. */
async function frauncesDataUri() {
  const dir = path.join(root, "dist", "assets");
  const files = await readdir(dir);
  const latin = files.find(
    (f) => f.startsWith("fraunces-latin-opsz-normal") && f.endsWith(".woff2")
  );
  if (!latin) throw new Error("Fraunces latin woff2 not found — run npm run build first");
  const buf = await readFile(path.join(dir, latin));
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}

const font = await frauncesDataUri();

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face {
    font-family: "Fraunces";
    src: url("${font}") format("woff2");
    font-weight: 100 900;
  }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    font-family: "Fraunces", Georgia, serif;
    font-optical-sizing: auto;
    background: #0b0a08;
    color: #f2ede2;
    display: flex; flex-direction: column; justify-content: center;
    padding: 84px 92px;
    position: relative; overflow: hidden;
  }
  /* The coastline the whole product is built on, as a horizon rather than a
     literal map — a screenshot of the map at this size reads as noise. */
  .horizon {
    position: absolute; inset: auto 0 0 0; height: 62%;
    background:
      radial-gradient(120% 100% at 78% 100%, rgba(217,190,130,0.16), transparent 62%),
      linear-gradient(180deg, transparent, rgba(217,190,130,0.05));
  }
  .rule {
    position: absolute; left: 0; right: 0; bottom: 38%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(217,190,130,0.45) 30%, rgba(217,190,130,0.12) 70%, transparent);
  }
  .brand { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
  .brand svg { display: block; }
  .brand span { font-size: 30px; font-weight: 520; letter-spacing: 0; }
  h1 {
    font-size: 62px; font-weight: 470; line-height: 1.12;
    letter-spacing: -0.01em; max-width: 15ch;
    position: relative;
  }
  h1 em { font-style: italic; font-weight: 420; }
  p {
    margin-top: 28px; font-size: 25px; line-height: 1.45;
    color: #c6bfb1; max-width: 30ch; position: relative;
  }
  .foot {
    position: absolute; left: 92px; right: 92px; bottom: 60px;
    display: flex; justify-content: space-between; align-items: baseline;
    font-size: 19px; color: #a9a196; letter-spacing: 0;
  }
</style>
<div class="horizon"></div><div class="rule"></div>

<div class="brand">
  <svg width="30" height="30" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.2 14.8 8 8 14.8 1.2 8Z" stroke="#d9be82"
          stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M8 5.4 10.6 8 8 10.6 5.4 8Z" fill="#d9be82"/>
  </svg>
  <span>${BRAND.name}</span>
</div>

<h1>Your website should be <em>the reason they call you.</em></h1>
<p>Custom websites for real estate professionals. Built once, owned outright, no monthly fee.</p>

<div class="foot">
  <span>${BRAND.domain}</span>
  <span>Amelia Island, Florida</span>
</div>`;

const browser = await chromium.launch({ executablePath: await resolveChromium() });
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
});
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: "png" });
await browser.close();

const { default: sharp } = await import("sharp");
const out = path.join(root, "public", "og.webp");
await writeFile(out, await sharp(png).resize(WIDTH, HEIGHT).webp({ quality: 88 }).toBuffer());

console.log(`Wrote public/og.webp — ${WIDTH}×${HEIGHT}, ${BRAND.name}`);
