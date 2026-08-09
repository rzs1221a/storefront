/**
 * Static prerender for every route.
 *
 * The site is a map application. That is the point of it — but it means a
 * crawler arriving with JavaScript disabled would otherwise find an empty
 * `#root` and a canvas, and this site exists to generate leads. So after
 * `vite build`, this stamps out a real HTML file per route from
 * dist/index.html: per-page title, meta description, canonical, OG and Twitter
 * tags, and the full written content injected into #root as semantic HTML.
 * React renders over it on load and the app behaves normally.
 *
 * All content is imported from src/lib — the same modules the React app
 * renders from — so the prerendered pages and the live ones cannot drift.
 * That requires running through tsx rather than bare node:
 *
 * Run: tsx scripts/prerender.mjs  (wired into `npm run build`)
 *
 * It also regenerates dist/sitemap.xml from the same route list, and ends with
 * assertions over the real invariants: one page per destination, unique paths,
 * every camera frame resolvable, every beacon coordinate finite.
 */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BRAND, CONTACT } from "../src/lib/brand.ts";
import { DESTINATIONS } from "../src/lib/destinations.ts";
import { FRAMES } from "../src/lib/cameraFrames.ts";
import { WORK, TOTALS } from "../src/lib/work.ts";
import { TIERS, COMPARISON, PROCESS, FAQ } from "../src/lib/offer.ts";
import { CAPABILITIES } from "../src/lib/capabilities.ts";
import {
  CATALOG,
  CATEGORIES,
  CATALOG_TOTALS,
  MODULES,
  priceLabelFor,
  includedInLabel,
} from "../src/lib/catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// Netlify exposes the site's primary URL as URL; local builds fall back to the
// production domain so canonicals are never relative.
const ORIGIN = (process.env.URL || BRAND.origin).replace(/\/$/, "");

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Swap the template's head tags for page-specific ones. */
function retag(html, { title, description, url }) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${esc(description)}" />`
    )
    .replace(
      /<link rel="canonical"[^>]*\/>/,
      `<link rel="canonical" href="${esc(url)}" />`
    )
    .replace(
      /<meta property="og:title"[\s\S]*?\/>/,
      `<meta property="og:title" content="${esc(title)}" />`
    )
    .replace(
      /<meta property="og:description"[\s\S]*?\/>/,
      `<meta property="og:description" content="${esc(description)}" />`
    )
    .replace(
      /<meta property="og:url"[^>]*\/>/,
      `<meta property="og:url" content="${esc(url)}" />`
    )
    .replace(
      /<meta name="twitter:title"[\s\S]*?\/>/,
      `<meta name="twitter:title" content="${esc(title)}" />`
    )
    .replace(
      /<meta name="twitter:description"[\s\S]*?\/>/,
      `<meta name="twitter:description" content="${esc(description)}" />`
    )
    /*
     * The card image, rewritten from ORIGIN rather than trusted from the
     * template. It is an absolute URL by spec — no scraper resolves a relative
     * one — which makes it another place a stale domain can hide, and it did
     * hide one: after a domain move the preview image kept pointing at the old
     * host. Same treatment as robots.txt.
     */
    .replace(
      /<meta property="og:image"[^>]*\/>/,
      `<meta property="og:image" content="${ORIGIN}/og.webp" />`
    )
    .replace(
      /<meta name="twitter:image"[^>]*\/>/,
      `<meta name="twitter:image" content="${ORIGIN}/og.webp" />`
    );
}

/** Inject the written content into #root, above where React will mount. */
function inject(html, bodyHtml) {
  return html.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyHtml}</div>`
  );
}

/**
 * Every page carries the same navigation, so no prerendered page is a dead
 * end — and every destination is an internal link on every other page, which
 * is exactly what a crawler should find. Generated from the route table.
 */
function navHtml(currentPath) {
  const links = DESTINATIONS.filter((d) => d.path !== currentPath)
    .map((d) => `<li><a href="${d.path}">${esc(d.label)}</a></li>`)
    .join("");
  return `<nav aria-label="Pages"><ul>${links}</ul></nav>`;
}

const list = (lines) =>
  `<ul>${lines.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>`;

/** The written body for one destination, as semantic HTML. */
function bodyFor(dest) {
  if (dest.path === "/") {
    return `
      <header><h1>Built once. Owned outright.</h1></header>
      <p>High-converting custom web systems and interactive real estate platforms for BHHS agents — no monthly platform fee. Static-fast pages that rank on their own, live map and market data wired in, and every lead routed straight into BoldTrail. ${esc(String(TOTALS.projects))} sites shipped along the Amelia Island coast, totalling ${TOTALS.loc.toLocaleString("en-US")} lines of production source.</p>
      <h2>The work is the pitch.</h2>
      <ul>${WORK.map((w) => `<li><a href="/work/${w.slug}"><strong>${esc(w.name)}</strong></a> — ${esc(w.kind)}. ${esc(w.summary)}</li>`).join("")}</ul>
      <h2>This is the engine.</h2>
      <p>The same mapping engine an agent buys, running on this page as a live exhibit — type where you want to go in plain English and the camera answers. Every mark is a shipped site at its true coordinate.</p>
      <h2>Pay once. Own it forever.</h2>
      <p>${CATALOG_TOTALS.options} site types across ${CATEGORIES.length} categories — from a one-week agent page to a full 3D market platform. ${CATALOG_TOTALS.shipped} are patterns running today in the shipped work above; the rest are build-ready concepts and say so. <a href="/options">See the full catalog</a>.</p>
    `;
  }

  if (dest.group === "work") {
    const w = WORK.find((item) => `/work/${item.slug}` === dest.path);
    return `
      <article>
        <header><h1>${esc(w.name)}</h1><p>${esc(w.kind)}</p></header>
        <p>${esc(w.summary)}</p>
        <p>${esc(w.detail)}</p>
        <p>Built with ${esc(w.stack.join(", "))}. ${w.loc.toLocaleString("en-US")} lines of source.</p>
        ${list(w.highlights)}
        ${w.liveUrl ? `<p><a href="${esc(w.liveUrl)}">Visit the live site</a></p>` : ""}
      </article>
    `;
  }

  // The catalog index: every option under its category, each a real link.
  if (dest.path === "/options") {
    return `
      <article>
        <header><h1>${esc(dest.title)}</h1></header>
        <p>${esc(dest.blurb)}</p>
        ${CATEGORIES.map(
          (cat) => `
          <h2>${esc(cat.name)}</h2>
          <p>${esc(cat.blurb)}</p>
          <ul>${CATALOG.filter((o) => o.category === cat.slug)
            .map(
              (o) =>
                `<li><a href="/options/${o.slug}"><strong>${esc(o.name)}</strong></a> — ${esc(o.pitch)} (${o.kind === "module" ? "add-on module, " : ""}${o.status === "concept" ? "build-ready concept" : "shipped pattern"})</li>`
            )
            .join("")}</ul>`
        ).join("")}
      </article>
    `;
  }

  // One offering. A concept's status is stated in the crawlable HTML itself,
  // so no snippet anywhere can read a concept as shipped work.
  if (dest.group === "catalog") {
    const o = CATALOG.find((item) => `/options/${item.slug}` === dest.path);
    const proof = o.proofSlug ? WORK.find((w) => w.slug === o.proofSlug) : null;
    const tier =
      o.kind === "build" ? TIERS.find((t) => t.slug === o.tierSlug) : null;
    const included = includedInLabel(o);
    const priceLine =
      o.kind === "module"
        ? `This is an add-on module — ${esc(o.timeline.toLowerCase())}, ${esc(priceLabelFor(o))} or to the site you already have.${included ? ` ${esc(included)}.` : ""}`
        : `This is a ${esc(tier.name)} build — ${esc(o.timeline.toLowerCase())}, ${esc(priceLabelFor(o))}, and you own it outright.`;
    return `
      <article>
        <header><h1>${esc(o.name)}</h1><p>${esc(
          o.kind === "module"
            ? o.status === "concept"
              ? "Build-ready add-on module"
              : "Add-on module"
            : o.status === "concept"
              ? "Build-ready concept"
              : "Shipped pattern"
        )}</p></header>
        ${
          o.status === "concept"
            ? `<p><strong>Status: build-ready concept — not a shipped client site.</strong> This is what I will build for the first buyer.</p>`
            : ""
        }
        <p>${esc(o.pitch)}</p>
        <p>${esc(o.detail)}</p>
        <h2>What's included</h2>
        ${list(o.includes)}
        <p>${priceLine}</p>
        ${
          proof
            ? `<p>${o.status === "concept" ? "The parts are proven in" : "The pattern is running today in"} <a href="/work/${proof.slug}">${esc(proof.name)}</a>.</p>`
            : ""
        }
      </article>
    `;
  }

  // Studio pages, each from the module the React route renders from.
  const bodies = {
    "/packages": () =>
      list([
        ...TIERS.map(
          (t) => `${t.name}, ${t.system.toLowerCase()} — ${t.summary} ${t.turnaroundTime}.`
        ),
        ...MODULES.map(
          (m) =>
            `${m.name} (add-on module) — ${m.pitch} ${priceLabelFor(m)}.`
        ),
        ...COMPARISON.rows.map((r) => `${r.question} ${r.us}`),
      ]),
    "/work": () =>
      list(WORK.map((w) => `${w.name} — ${w.kind}. ${w.summary}`)),
    "/capabilities": () =>
      list(
        CAPABILITIES.map((c) => `${c.title} — ${c.body}`)
      ),
    "/process": () => list(PROCESS.map((p) => `${p.name} — ${p.detail}`)),
    "/questions": () => list(FAQ.map((f) => `${f.q} ${f.a}`)),
    "/contact": () =>
      list([
        `Call or text ${CONTACT.phoneDisplay}.`,
        `Email ${CONTACT.email}.`,
        `Based on ${CONTACT.location}. I reply within one business day.`,
        // BRAND.short, matching routes/Contact.tsx — the full name ends in
        // "Studio", and "Seamark Studio is an independent studio" stutters.
        `${BRAND.short} is an independent studio — not affiliated with, endorsed by, or acting on behalf of Berkshire Hathaway HomeServices.`,
      ]),
  };

  const body = bodies[dest.path];
  if (!body) {
    throw new Error(`prerender: no body builder for ${dest.path}`);
  }
  return `
    <article>
      <header><h1>${esc(dest.title)}</h1></header>
      <p>${esc(dest.blurb)}</p>
      ${body()}
    </article>
  `;
}

function titleFor(dest) {
  if (dest.path === "/") {
    return `${BRAND.name} — High-Converting Custom Web Systems & Interactive Real Estate Platforms`;
  }
  return `${dest.title} | ${BRAND.name}`;
}

const pages = DESTINATIONS.map((dest) => ({
  route: dest.path,
  title: titleFor(dest),
  description: dest.blurb,
  body: `${bodyFor(dest)}${navHtml(dest.path)}`,
}));

let template = await readFile(path.join(dist, "index.html"), "utf8");

/*
 * The hero is type on an opaque plate, which puts the display font on the
 * LCP path. The woff2 name is hashed per build, so the preload cannot live
 * in index.html — find the built latin Geist file and inject it here, where
 * the hash is knowable. font-display: swap still guards the failure case.
 */
{
  const assets = await readdir(path.join(dist, "assets"));
  const geist = assets.find(
    (f) => /^geist-latin-wght-normal.*\.woff2$/.test(f)
  );
  if (geist) {
    template = template.replace(
      "</head>",
      `  <link rel="preload" as="font" type="font/woff2" href="/assets/${geist}" crossorigin />\n  </head>`
    );
  }
}

for (const page of pages) {
  const url = `${ORIGIN}${page.route === "/" ? "/" : page.route}`;
  let html = retag(template, {
    title: page.title,
    description: page.description,
    url,
  });
  html = inject(html, page.body);

  // "/" is dist/index.html; everything else is <route>.html, which Netlify
  // serves at the extensionless path without a trailing-slash redirect.
  const out =
    page.route === "/"
      ? path.join(dist, "index.html")
      : path.join(dist, `${page.route.replace(/^\//, "")}.html`);

  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html, "utf8");
}

// Sitemap, from the same list so the two cannot drift.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${ORIGIN}${p.route === "/" ? "/" : p.route}</loc>
    <changefreq>monthly</changefreq>
    <priority>${p.route === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");

/*
 * robots.txt, from the same ORIGIN as the sitemap.
 *
 * The Sitemap directive takes an absolute URL, which means a hand-edited
 * robots.txt is one more place a stale domain can hide — and it hid one: the
 * checked-in file pointed crawlers at a domain the studio does not own.
 * Generating it here means it can only ever name the origin actually built.
 */
await writeFile(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
  "utf8"
);

/*
 * The tripwire, rebuilt as assertions over the actual invariants rather than a
 * hand-counted route total. Adding a destination now means editing exactly one
 * file — src/lib/destinations.ts (or the data it derives from) — and the build
 * fails loudly if any page would ship broken instead of silently shipping a
 * page with no crawlable content.
 */
const failures = [];

if (pages.length !== DESTINATIONS.length) {
  failures.push(
    `built ${pages.length} pages for ${DESTINATIONS.length} destinations`
  );
}

const seen = new Set();
for (const dest of DESTINATIONS) {
  if (seen.has(dest.path)) failures.push(`duplicate path ${dest.path}`);
  seen.add(dest.path);

  if (!FRAMES[dest.frame]) {
    failures.push(`${dest.path} names camera frame "${dest.frame}", which does not exist`);
  }
  if (dest.beacon) {
    const [lng, lat] = dest.beacon.center ?? [];
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      failures.push(`${dest.path} has a beacon with a non-finite coordinate`);
    }
  }
  if (!dest.blurb || dest.blurb.length < 40) {
    failures.push(`${dest.path} blurb is too short to serve as a meta description`);
  }
}

/*
 * The honesty contract, enforced: an offering may only claim "shipped" when a
 * real project in WORK proves it. work.ts holds itself to "nothing
 * aspirational"; this keeps the catalog from borrowing credibility it has not
 * earned.
 */
for (const o of CATALOG) {
  if (o.status === "shipped" && !WORK.some((w) => w.slug === o.proofSlug)) {
    failures.push(
      `catalog offering "${o.slug}" claims shipped without a real proof project`
    );
  }
  // The two-axis contract: a build must price against a real tier, a module
  // must carry its own from-price. Rendering either without breaks the page.
  if (o.kind === "build" && !TIERS.some((t) => t.slug === o.tierSlug)) {
    failures.push(
      `catalog build "${o.slug}" names tier "${o.tierSlug}", which does not exist`
    );
  }
  if (o.kind === "module" && !Number.isFinite(o.priceFrom)) {
    failures.push(
      `catalog module "${o.slug}" has no finite priceFrom`
    );
  }
}

if (CATALOG_TOTALS.options !== CATALOG.length) {
  failures.push("CATALOG_TOTALS drifted from the catalog itself");
}

if (failures.length) {
  console.error(
    `\nPrerender failed its invariants:\n${failures.map((f) => `  ✗ ${f}`).join("\n")}\n`
  );
  process.exit(1);
}

console.log(`Prerendered ${pages.length} routes + sitemap (${ORIGIN}).`);
