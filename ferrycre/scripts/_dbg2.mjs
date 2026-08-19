import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const seen = new Set();
page.on("console", (m) => { const t = `${m.type()} ${m.text().slice(0,180)}`; if (!seen.has(t)) { seen.add(t); console.log("[console]", t); } });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 300)));
await page.goto(process.env.ROUTE, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => console.log("nav", e.message));
await page.waitForTimeout(9000);
const pins = await page.locator(".ferry-pin").count();
const canvas = await page.locator("canvas.maplibregl-canvas").count();
console.log("pins:", pins, "canvas:", canvas);
await page.screenshot({ path: process.env.OUT });
await browser.close();
