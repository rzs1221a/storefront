import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { routeThroughCurl } from "./lib/egress.mjs";

const ORIGIN = process.argv[2] || "http://127.0.0.1:4319";
const OUT = "/tmp/claude-0/-home-user/f78437df-948f-5592-b19d-0362b874783c/scratchpad/shots";

async function resolveChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  const entries = await readdir(base);
  const found = entries.find((e) => /^chromium-\d+$/.test(e));
  return found ? path.join(base, found, "chrome-linux", "chrome") : undefined;
}

const ROUTES = [
  "/",
  "/packages",
  "/work",
  "/work/the-aerial",
  "/capabilities",
  "/contact",
  "/contact?package=community-site",
];

async function main() {
  const browser = await chromium.launch({
    executablePath: await resolveChromium(),
    args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const errors = [];

  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: width > 900 ? 900 : 844 },
    });
    const page = await context.newPage();
    await routeThroughCurl(page);
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`${width}px console: ${msg.text()}`);
    });
    page.on("pageerror", (err) => errors.push(`${width}px pageerror: ${err.message}`));

    for (const route of ROUTES) {
      await page.goto(`${ORIGIN}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page
        .waitForFunction(
          `document.querySelector('.live-map[data-loaded="true"]') !== null`,
          null,
          { timeout: 20000 }
        )
        .catch(() => {});
      await page.waitForTimeout(1200);
      const file = `${OUT}/${width}${route.replace(/\W+/g, "_") || "_home"}.png`;
      await page.screenshot({ path: file });
      console.log(`  saved ${file}`);
    }
    await context.close();
  }

  await browser.close();

  if (errors.length) {
    console.error("\nConsole/page errors:");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exitCode = 1;
  } else {
    console.log("\n  ✓ no console or page errors across all routes/widths");
  }
}

main();
