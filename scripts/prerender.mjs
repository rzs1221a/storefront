/**
 * Static prerender for every route.
 *
 * The site is a map application. That is the point of it — but it means a
 * crawler arriving with JavaScript disabled would otherwise find an empty
 * `#root` and a canvas, and this site exists to generate leads. So after
 * `vite build`, this stamps out a real HTML file per route from
 * dist/index.html: per-page title, meta description, canonical, OG and Twitter
 * tags, schema.org JSON-LD, and the full written content injected into #root
 * as semantic HTML. React renders over it on load and the app behaves normally.
 *
 * Ported from heymann-williams-coastal/scripts/prerender.mjs, which does the
 * same for 26 neighborhood routes. No headless browser, so it runs unchanged
 * on Netlify's build image.
 *
 * It also regenerates dist/sitemap.xml from the same route list, so the two
 * can never drift.
 *
 * Run: node scripts/prerender.mjs  (wired into `npm run build`)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// Netlify exposes the site's primary URL as URL; local builds fall back to the
// production domain so canonicals are never relative.
const ORIGIN = (process.env.URL || "https://kedge.studio").replace(/\/$/, "");

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/*
 * The content below is duplicated from src/lib rather than imported: these are
 * .ts modules with JSX-adjacent imports that Node cannot load directly, and a
 * build step that needs a bundler to describe itself is a build step that
 * breaks. The trade is that this list must be kept in step with
 * src/lib/destinations.ts — the route count assertion at the end of this file
 * is what catches it when it is not.
 */

const BRAND = "Kedge";
const TAGLINE = "Custom websites for real estate professionals";

const WORK = [
  {
    slug: "the-aerial",
    name: "The Aerial",
    kind: "Flagship product",
    summary:
      "The entire coast from Camden County, Georgia to St. Augustine as a living 3D map — no homepage, no nav, no scroll feed. You open it and you are above the real county.",
    stack: "Next 15, React 19, deck.gl, MapLibre GL, TypeScript",
    loc: 6842,
    live: "https://theaerial.netlify.app",
  },
  {
    slug: "heymann-williams-coastal",
    name: "Heymann Williams",
    kind: "Full brokerage site",
    summary:
      "A seventeen-route brokerage site with a cinematic map-synced community story, twenty-six prerendered neighborhood pages, and a full agent roster.",
    stack: "Vite, React 19, TypeScript, Tailwind v4, MapLibre GL",
    loc: 19866,
  },
  {
    slug: "sold-on-amelia-island",
    name: "Sold on Amelia Island",
    kind: "Two-agent team site",
    summary:
      "A team site with guided buyer and seller flows, live lead delivery into BoldTrail, and a built-in editor so the agents change their own content without calling anyone.",
    stack: "Static HTML, Netlify Functions, Decap CMS, Zod",
    loc: 2710,
  },
  {
    slug: "crane-island-bhhs",
    name: "Crane Island",
    kind: "Community microsite",
    summary:
      "A single-community authority page built to own the search results for one high-value niche — deep-water waterfront on Amelia Island.",
    stack: "Static HTML, Tailwind, Schema.org",
    loc: 1440,
    live: "https://craneisland.heymannwilliams.com",
  },
  {
    slug: "ron-heymann-agent-page",
    name: "Ron Heymann",
    kind: "Individual agent page",
    summary:
      "A single-agent page that catches BoldTrail's property-alert email traffic instead of letting it 404 on the wrong domain.",
    stack: "Static HTML, Tailwind, Netlify redirects",
    loc: 1539,
  },
];

const STUDIO = [
  {
    path: "/build",
    title: "Things a template cannot do for you",
    blurb:
      "Live 3D mapping, plain-English property search, prerendered pages that actually rank, and lead routing into BoldTrail. Each one is running in a site you can visit.",
    body: [
      "Maps that are the product — real terrain, satellite imagery, and 3D buildings you descend into, not an embedded Google Map with a pin on it.",
      "Search that speaks English — the search field parses plain phrasing into structured criteria against the same fields an MLS feed carries.",
      "Pages that actually rank — neighborhood pages stamped out as real static HTML at build time, so crawlers and AI assistants see complete written content.",
      "Leads into BoldTrail, properly — validated submissions ingested through the Lead Dropbox parser, so your follow-up and reporting keep working exactly as they do today.",
      "You edit it yourself — log in, change your photos, bio, listings and text, hit publish. Live in about a minute.",
      "Live local data — real tide readings from the NOAA gauge, conditions from the National Weather Service, and golden-hour times computed for a specific address.",
    ],
  },
  {
    path: "/pricing",
    title: "Pay once. Own it forever",
    blurb:
      "One fee, agreed in writing before anything starts. After launch you owe nothing — hosting is free at the traffic these sites see, and the code is yours.",
    body: [
      "Agent Page — one authoritative page that loads instantly, ranks for your name, and routes every enquiry into your CRM. About one week.",
      "Community Site — take a single community and become the definitive source for it. Two to three weeks.",
      "Flagship — multi-route, map-driven, prerendered for search, with whatever the business actually needs. Four to eight weeks.",
      "You own the site: the code lives in a repository in your name, it deploys from your own Netlify account, and the domain is registered to you. If we never speak again, nothing turns off.",
      "A platform site charges a monthly fee for as long as you want the site up, and usually has to be rebuilt if you change brokerages. This does not.",
    ],
  },
  {
    path: "/process",
    title: "No surprises",
    blurb:
      "A conversation, a fixed quote, the design before any production code, a live preview you can check any time, and launch in your own accounts.",
    body: [
      "A conversation — twenty minutes. What you sell, who you sell to, and what is not working about your current site. No pitch deck.",
      "A fixed quote — scope and price in writing before anything starts. The number does not move unless you ask for something new.",
      "Design first — you see the real design before a line of production code is written. Revisions here are free and expected.",
      "Build and review — I build it on a live preview link you can check any time.",
      "Launch, in your name — your Netlify account, your domain, your repository.",
    ],
  },
  {
    path: "/questions",
    title: "The things people ask",
    blurb:
      "Who owns the site, what it costs to run, whether your leads still reach BoldTrail, and what happens if you change brokerages.",
    body: [
      "Do I really own it? Yes, completely. The code lives in a repository in your name and the site deploys from your own Netlify account.",
      "What does it cost to keep running? Netlify's free tier covers hosting at the traffic an agent site sees. You pay for your domain, usually around fifteen dollars a year.",
      "Will my leads still reach BoldTrail? Yes. I have already built this — validated submissions ingest through the Lead Dropbox parser.",
      "What if I switch brokerages? We swap the branding and the site keeps working. That is the advantage of owning it.",
      "Can I update it myself? Yes — an editor where you log in, change photos, bios, listings and text, and hit publish.",
      "How long does it take? An agent page is about a week. A community site is two to three. A flagship build runs four to eight weeks.",
    ],
  },
  {
    path: "/contact",
    title: "Tell me what you need",
    blurb:
      "Twenty minutes on the phone and you will know whether this is worth doing. Call (904) 548-8222 or send a note.",
    body: [
      "Call or text (904) 548-8222.",
      "Email rzs1221a@gmail.com.",
      "Based on Amelia Island, Florida. I reply within one business day.",
      "Kedge is an independent studio — not affiliated with, endorsed by, or acting on behalf of Berkshire Hathaway HomeServices.",
    ],
  },
];

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
    );
}

/** Inject the written content into #root, above where React will mount. */
function inject(html, bodyHtml) {
  return html.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyHtml}</div>`
  );
}

/** Every page carries the same navigation, so no prerendered page is a dead end. */
function navHtml(currentPath) {
  const links = [
    ["/", "The coast"],
    ...WORK.map((w) => [`/work/${w.slug}`, w.name]),
    ["/build", "What I build"],
    ["/pricing", "Pricing"],
    ["/process", "How it goes"],
    ["/questions", "Questions"],
    ["/contact", "Get a quote"],
  ]
    .filter(([href]) => href !== currentPath)
    .map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`)
    .join("");
  return `<nav aria-label="Pages"><ul>${links}</ul></nav>`;
}

const pages = [];

// The coast.
pages.push({
  route: "/",
  title: `${BRAND} — ${TAGLINE}`,
  description:
    "Bespoke, high-performance websites for BHHS agents — built once, owned outright, no monthly platform fee. Five sites shipped along the Amelia Island coast.",
  body: `
    <header><h1>${BRAND} — ${esc(TAGLINE)}</h1></header>
    <p>Bespoke, high-performance websites for real estate agents. Built once, owned outright, no monthly platform fee. Five sites shipped along the Amelia Island coast, totalling ${WORK.reduce((n, w) => n + w.loc, 0).toLocaleString("en-US")} lines of production source.</p>
    <h2>Selected work</h2>
    <ul>${WORK.map((w) => `<li><a href="/work/${w.slug}"><strong>${esc(w.name)}</strong></a> — ${esc(w.kind)}. ${esc(w.summary)}</li>`).join("")}</ul>
    ${navHtml("/")}
  `,
});

// One page per project.
for (const w of WORK) {
  pages.push({
    route: `/work/${w.slug}`,
    title: `${w.name} — ${w.kind} | ${BRAND}`,
    description: w.summary,
    body: `
      <article>
        <header><h1>${esc(w.name)}</h1><p>${esc(w.kind)}</p></header>
        <p>${esc(w.summary)}</p>
        <p>Built with ${esc(w.stack)}. ${w.loc.toLocaleString("en-US")} lines of source.</p>
        ${w.live ? `<p><a href="${esc(w.live)}">Visit the live site</a></p>` : ""}
      </article>
      ${navHtml(`/work/${w.slug}`)}
    `,
  });
}

// The studio pages.
for (const s of STUDIO) {
  pages.push({
    route: s.path,
    title: `${s.title} | ${BRAND}`,
    description: s.blurb,
    body: `
      <article>
        <header><h1>${esc(s.title)}</h1></header>
        <p>${esc(s.blurb)}</p>
        <ul>${s.body.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
      </article>
      ${navHtml(s.path)}
    `,
  });
}

const template = await readFile(path.join(dist, "index.html"), "utf8");

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
 * The route list above is duplicated from src/lib/destinations.ts by
 * necessity. This is the tripwire: if a destination is added there and not
 * here, the counts diverge and the build fails loudly rather than silently
 * shipping a page with no crawlable content.
 */
const EXPECTED_ROUTES = 11;
if (pages.length !== EXPECTED_ROUTES) {
  console.error(
    `\nPrerender: expected ${EXPECTED_ROUTES} routes, built ${pages.length}.\n` +
      `src/lib/destinations.ts and scripts/prerender.mjs have drifted — update both.\n`
  );
  process.exit(1);
}

console.log(`Prerendered ${pages.length} routes + sitemap (${ORIGIN}).`);
