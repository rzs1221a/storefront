// Map verification harness: renders /explore in headless Chromium with all
// external tile traffic tunneled through curl (works behind egress proxies),
// optionally emulating an ad blocker (BLOCK_ESRI=1 aborts Esri requests with
// ERR_BLOCKED_BY_CLIENT). Usage:
//   npx vite preview --port 4173 &
//   OUT=shot.png [BLOCK_ESRI=1] node scripts/verify-map.mjs
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BLOCK_ESRI = process.env.BLOCK_ESRI === "1";
const tmp = mkdtempSync(path.join(tmpdir(), "tiles-"));
const cache = new Map();
let n = 0;
const failures = [];

function curlFetch(url) {
  if (cache.has(url)) return cache.get(url);
  const body = path.join(tmp, `b${++n}`);
  const hdr = path.join(tmp, `h${n}`);
  try {
    execFileSync("curl", ["-sL", "--max-time", "20", "-D", hdr, "-o", body, url], { timeout: 25000 });
    const headers = readFileSync(hdr, "utf8");
    const codes = [...headers.matchAll(/HTTP\/[\d.]+\s+(\d+)/g)].map((m) => m[1]);
    const m = headers.match(/content-type:\s*([^\r\n]+)/gi);
    const ct = m ? m[m.length - 1].replace(/content-type:\s*/i, "").trim() : "application/octet-stream";
    const buf = readFileSync(body);
    const last = codes[codes.length - 1];
    if (last !== "200") { failures.push(`${last} ${url.slice(0, 90)}`); return null; }
    const out = { buf, ct };
    cache.set(url, out);
    return out;
  } catch (e) {
    failures.push(`curlerr ${url.slice(0, 90)}`);
    return null;
  }
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const logs = [];
page.on("console", (m) => { const t = m.text(); if (t.includes("ferrycre") && !logs.includes(t.slice(0,80))) logs.push(t.slice(0, 80)); });

await page.route("**/*", async (route) => {
  const url = route.request().url();
  if (url.startsWith("http://localhost")) return route.continue();
  if (BLOCK_ESRI && url.includes("arcgisonline")) return route.abort("blockedbyclient");
  const got = curlFetch(url);
  if (!got) return route.abort("failed");
  return route.fulfill({ status: 200, contentType: got.ct, body: got.buf });
});

await page.goto(`http://localhost:4173${process.env.ROUTE ?? "/explore"}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(BLOCK_ESRI ? 14000 : 16000);
console.log("pins:", await page.locator(".ferry-pin").count());
console.log("failures:", JSON.stringify(failures.slice(0, 12), null, 0));
console.log("logs:", JSON.stringify(logs, null, 0));
await page.screenshot({ path: process.env.OUT });
await browser.close();
