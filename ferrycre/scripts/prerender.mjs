// Static prerender for every ranking route.
//
// The app is a client-rendered SPA — fine for humans, invisible to no-JS
// crawlers and most AI agents, and those are exactly the readers the property
// and geo pages exist to win. After `vite build`, this script stamps a real
// HTML file per route from dist/index.html: per-page <title>, meta
// description, canonical/OG tags, schema.org JSON-LD, and the full written
// content injected into #root as semantic HTML. React renders over it on
// load. No headless browser, so it runs unchanged on Netlify's build image.
//
// It also regenerates dist/sitemap.xml, and it is the build's honesty gate:
// it FAILS the build on hand-authored derived fields, uncited traffic
// counts, slug collisions, duplicated geo prose, or residential IDX / Fair
// Housing boilerplate that has no business on a commercial site.
//
// Run: node scripts/prerender.mjs   (wired into `npm run build`)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const ORIGIN = (process.env.URL || "https://ferrycre.com").replace(/\/$/, "");

const listingData = JSON.parse(await readFile(path.join(root, "src/data/listings.json"), "utf8"));
const marketData = JSON.parse(await readFile(path.join(root, "src/data/markets.json"), "utf8"));
const profile = JSON.parse(await readFile(path.join(root, "src/data/profile.json"), "utf8"));
const template = await readFile(path.join(dist, "index.html"), "utf8");

const SAMPLE = listingData.sample === true;
const listings = listingData.listings;
const markets = marketData.markets;

/* ---------------------------------------------------------------------------
 * The honesty gate. A broken record fails the build, not the reader.
 * ------------------------------------------------------------------------- */
const errors = [];
const warnings = [];

const slugs = new Set();
for (const l of listings) {
  const where = `listing "${l.id ?? l.slug ?? "?"}"`;
  for (const field of ["id", "slug", "transaction", "useType", "address", "city", "county", "state", "zip", "lat", "lon", "headline", "summary", "photos", "status", "source"]) {
    if (l[field] === undefined || l[field] === null || l[field] === "") errors.push(`${where}: missing required field "${field}"`);
  }
  if (slugs.has(l.slug)) errors.push(`${where}: duplicate slug "${l.slug}"`);
  slugs.add(l.slug);
  // derived, never authored
  if (l.pricePerSF !== undefined) errors.push(`${where}: pricePerSF is derived at build time — remove it from listings.json`);
  if (l.capRate !== undefined && l.noi !== undefined && l.salePrice !== undefined)
    errors.push(`${where}: capRate is derived from NOI and price — remove it from listings.json`);
  // cite the source and year on any traffic count
  if (l.trafficCount !== undefined && (!l.trafficCountYear || !l.trafficCountSource))
    errors.push(`${where}: trafficCount requires trafficCountYear and trafficCountSource (FDOT — cite it)`);
  if (!l.photos?.length || l.photos.some((p) => !p.alt)) errors.push(`${where}: every photo needs real alt text`);
}

const intros = new Map();
for (const m of markets) {
  const where = `market "${m.slug}"`;
  for (const field of ["slug", "name", "h1", "tagline", "intro", "faqs", "cities", "corridors"]) {
    if (m[field] === undefined || m[field] === null || m[field] === "") errors.push(`${where}: missing required field "${field}"`);
  }
  const words = (m.intro ?? "").trim().split(/\s+/).length;
  if (words < 120) errors.push(`${where}: intro is ${words} words — the geo prose must be substantial (150–200 words)`);
  // never templated, never duplicated: no two intros may share an opening
  const key = (m.intro ?? "").slice(0, 80);
  if (intros.has(key)) errors.push(`${where}: intro duplicates "${intros.get(key)}" — geo prose must be unique`);
  intros.set(key, m.slug);
}

// residential boilerplate must not leak onto a commercial brokerage site
const banned = [
  ["personal, non-commercial use", "residential IDX disclaimer"],
  ["Equal Housing", "Fair Housing / Equal Housing block (attaches to residential)"],
  ["Fair Housing Act", "Fair Housing block (attaches to residential)"],
];
const allText = JSON.stringify({ listingData, marketData, profile });
for (const [phrase, why] of banned) {
  if (allText.includes(phrase)) errors.push(`data contains "${phrase}" — ${why}; it does not belong here`);
}

if (!profile.licenseConfirmed) warnings.push("profile.licenseNumber is unconfirmed — Florida advertising rules require it before launch");
if (!profile.titleConfirmed) warnings.push("displayed title is unconfirmed — confirm the exact wording with Antoinette");
if (SAMPLE) warnings.push("SAMPLE inventory: listing pages are noindex'd and left out of the sitemap until real records land");

if (errors.length) {
  console.error("Prerender failed — the data does not meet the publication bar:\n" + errors.map((e) => `  ✗ ${e}`).join("\n"));
  process.exit(1);
}
warnings.forEach((w) => console.warn(`  ⚠ ${w}`));

/* ---------------------------------------------------------------------------
 * Derivations (mirrors src/lib/commercial.ts derive()).
 * ------------------------------------------------------------------------- */
for (const l of listings) {
  if (l.salePrice && l.buildingSF) l.pricePerSF = Math.round(l.salePrice / l.buildingSF);
  if (l.salePrice && l.noi && l.capRate === undefined) l.capRate = Math.round((l.noi / l.salePrice) * 10000) / 100;
}

/* ---------------------------------------------------------------------------
 * Templating helpers.
 * ------------------------------------------------------------------------- */
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const money = (n) => `$${Number(n).toLocaleString("en-US")}`;

const AGENT_LD = {
  "@type": "RealEstateAgent",
  "@id": `${ORIGIN}/#agent`,
  name: `${profile.name} — Commercial Sales & Leasing`,
  url: `${ORIGIN}/`,
  telephone: profile.phoneE164,
  email: profile.email,
  parentOrganization: { "@type": "RealEstateAgent", name: profile.brokerage, telephone: "+1-904-261-9311" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "720 Magnolia Lane",
    addressLocality: "Fernandina Beach",
    addressRegion: "FL",
    postalCode: "32034",
    addressCountry: "US",
  },
  areaServed: profile.serviceAreas,
};

const crumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, url], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: `${ORIGIN}${url}`,
  })),
});

function retag(html, { title, description, url, noindex = false }) {
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${esc(url)}" />`)
    .replace(/<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${esc(url)}" />`)
    .replace(/<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  if (noindex) out = out.replace("</head>", `<meta name="robots" content="noindex" />\n</head>`);
  return out;
}

function inject(html, jsonLd, body) {
  return html
    .replace("</head>", `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root"><div style="max-width:52rem;margin:0 auto;padding:6rem 1.25rem;color:#f7f7f9;background:#12151d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6">${body}</div></div>`
    );
}

const footerHtml = `<hr style="border:none;border-top:1px solid rgba(255,255,255,.15);margin:3rem 0 1rem"/>
<p style="font-size:.8em;opacity:.7">${esc(profile.name)} · ${esc(profile.title)} · ${esc(profile.brokerage)}, ${esc(profile.officeAddress)} · ${esc(profile.phone)} · <a href="mailto:${esc(profile.email)}" style="color:#c98cad">${esc(profile.email)}</a></p>
<p style="font-size:.7em;opacity:.55">${esc(profile.franchiseDisclosure)}</p>`;

const TX_LABEL = { sale: "For Sale", lease: "For Lease", "sale-or-lease": "Sale or Lease" };
const USE_LABEL = {
  office: "Office", retail: "Retail", industrial: "Industrial", flex: "Flex", medical: "Medical",
  hospitality: "Hospitality", multifamily: "Multifamily", land: "Land", "special-purpose": "Special Purpose",
};

function listingPriceLine(l) {
  if (l.transaction === "lease" && l.leaseRate) return `$${l.leaseRate.toFixed(2)}/SF/yr${l.leaseBasis ? ` ${l.leaseBasis}` : ""}`;
  if (l.salePrice) return money(l.salePrice) + (l.transaction === "sale-or-lease" && l.leaseRate ? ` · $${l.leaseRate.toFixed(2)}/SF/yr` : "");
  return "Inquire for pricing";
}

function listingSpecsHtml(l) {
  const rows = [
    ["Transaction", TX_LABEL[l.transaction]],
    ["Use", USE_LABEL[l.useType] + (l.secondaryUses?.length ? ` (${l.secondaryUses.map((u) => USE_LABEL[u]).join(", ")})` : "")],
    ["Price", listingPriceLine(l)],
    l.pricePerSF && ["Price / SF", money(l.pricePerSF)],
    l.noi && ["NOI", `${money(l.noi)}/yr`],
    l.capRate && ["Cap rate", `${l.capRate}%`],
    l.buildingSF && ["Building", `${l.buildingSF.toLocaleString("en-US")} SF`],
    l.availableSF && l.availableSF !== l.buildingSF && ["Available", `${l.availableSF.toLocaleString("en-US")} SF`],
    l.landAcres && ["Land", `${l.landAcres} acres`],
    l.zoning && ["Zoning", l.zoning],
    l.yearBuilt && ["Built", l.yearBuilt + (l.yearRenovated ? ` · renovated ${l.yearRenovated}` : "")],
    l.ceilingHeight && ["Clear height", l.ceilingHeight],
    l.dockDoors && ["Dock doors", l.dockDoors],
    l.driveInDoors && ["Drive-in doors", l.driveInDoors],
    l.power && ["Power", l.power],
    l.parkingSpaces && ["Parking", `${l.parkingSpaces} spaces${l.parkingRatio ? ` · ${l.parkingRatio}` : ""}`],
    l.divisible && ["Divisible", `Yes${l.minDivisibleSF ? `, from ${l.minDivisibleSF.toLocaleString("en-US")} SF` : ""}`],
    l.frontageFt && ["Frontage", `${l.frontageFt} ft on ${l.frontageOn}`],
    l.trafficCount && ["Traffic", `${l.trafficCount.toLocaleString("en-US")} AADT (${l.trafficCountYear})`],
    l.ingress && ["Ingress", l.ingress],
    l.tenancy && ["Tenancy", l.tenancy],
    l.occupancyPct !== undefined && ["Occupancy", `${l.occupancyPct}%`],
  ].filter(Boolean);
  return `<table style="width:100%;border-collapse:collapse;font-size:.95em">${rows
    .map(([k, v]) => `<tr><td style="padding:.4em .8em .4em 0;opacity:.6;vertical-align:top">${esc(k)}</td><td style="padding:.4em 0">${esc(v)}</td></tr>`)
    .join("")}</table>`;
}

/* ---------------------------------------------------------------------------
 * The pages.
 * ------------------------------------------------------------------------- */
const pages = [];
const marketPath = (m) => `/${m.slug}`;
const listingPath = (l) => `/listings/${l.slug}`;

// Home
pages.push({
  route: "/",
  file: "index.html",
  title: "Ferry CRE · Nassau County Commercial Real Estate · Antoinette Ferry",
  description:
    "Commercial sales and leasing across Nassau County, Florida — Fernandina Beach, Amelia Island, Yulee, and Callahan. Antoinette Ferry, BHHS Heymann Williams Realty.",
  jsonLd: { "@context": "https://schema.org", "@graph": [AGENT_LD] },
  body: `<h1>Nassau County commercial real estate</h1>
<p>${esc(profile.name)} is ${esc(profile.title)} at ${esc(profile.brokerageShort)} — the county's dedicated commercial practice. Sales, leasing, tenant and landlord representation across Fernandina Beach, Amelia Island, Yulee, and Callahan.</p>
<h2>Current listings</h2>
<ul>${listings.map((l) => `<li><a href="${listingPath(l)}" style="color:#c98cad">${esc(l.address)}, ${esc(l.city)}</a> — ${esc(TX_LABEL[l.transaction])}, ${esc(USE_LABEL[l.useType])}, ${esc(listingPriceLine(l))}</li>`).join("")}</ul>
<h2>Markets</h2>
<ul>${markets.map((m) => `<li><a href="${marketPath(m)}" style="color:#c98cad">${esc(m.h1)}</a> — ${esc(m.tagline)}</li>`).join("")}</ul>
<h2>Services</h2>
<p><a href="/services" style="color:#c98cad">Tenant representation, landlord representation, investment sales, leasing, and site selection</a> — one commercial practice, both sides of every table.</p>
${footerHtml}`,
});

// Listings index
pages.push({
  route: "/listings",
  title: "Commercial Listings · Nassau County FL · Ferry CRE",
  description:
    "Current commercial listings across Nassau County — retail, office, industrial, medical, and land, with traffic counts, frontage, and zoning on every record.",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Nassau County Commercial Listings",
    url: `${ORIGIN}/listings`,
    breadcrumb: crumbs([["Ferry CRE", "/"], ["Listings", "/listings"]]),
    publisher: AGENT_LD,
  },
  body: `<h1>Current commercial listings</h1>
<p>Every record carries the commercial fields that matter: traffic counts with their FDOT citation, frontage, ingress, zoning, power, and tenancy.</p>
<ul>${listings.map((l) => `<li><a href="${listingPath(l)}" style="color:#c98cad">${esc(l.headline)}</a><br/>${esc(l.address)}, ${esc(l.city)} — ${esc(TX_LABEL[l.transaction])} · ${esc(USE_LABEL[l.useType])} · ${esc(listingPriceLine(l))}</li>`).join("")}</ul>
${footerHtml}`,
});

// Property pages — the ranking asset (noindex'd while inventory is sample)
for (const l of listings) {
  const url = `${ORIGIN}${listingPath(l)}`;
  pages.push({
    route: listingPath(l),
    noindex: SAMPLE,
    title: `${l.address}, ${l.city} FL — ${TX_LABEL[l.transaction]} ${USE_LABEL[l.useType]} · Ferry CRE`,
    description: l.summary,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "RealEstateListing",
          name: l.headline,
          url,
          ...(l.listedAt ? { datePosted: l.listedAt } : {}),
          about: {
            "@type": "Place",
            name: l.address,
            address: {
              "@type": "PostalAddress",
              streetAddress: l.address,
              addressLocality: l.city,
              addressRegion: l.state,
              postalCode: l.zip,
              addressCountry: "US",
            },
            geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lon },
          },
          ...(l.salePrice ? { offers: { "@type": "Offer", price: l.salePrice, priceCurrency: "USD" } } : {}),
        },
        crumbs([["Ferry CRE", "/"], ["Listings", "/listings"], [l.address, listingPath(l)]]),
        AGENT_LD,
      ],
    },
    body: `<nav><a href="/listings" style="color:#c98cad">Listings</a></nav>
<h1>${esc(l.headline)}</h1>
<p><strong>${esc(l.address)}, ${esc(l.city)}, ${esc(l.state)} ${esc(l.zip)}</strong> — ${esc(TX_LABEL[l.transaction])} · ${esc(USE_LABEL[l.useType])}</p>
<p>${esc(l.summary)}</p>
${l.positioning ? `<p><em>${esc(l.positioning)}</em></p>` : ""}
<h2>The record</h2>
${listingSpecsHtml(l)}
${l.trafficCount ? `<p style="font-size:.8em;opacity:.6">Traffic source: ${esc(l.trafficCountSource)}.</p>` : ""}
${(l.distances ?? []).length ? `<h2>Logistics</h2><p>${l.distances.map((d) => `${esc(d.label)}: ${d.miles} mi`).join(" · ")}</p>` : ""}
${(l.driveTimes ?? []).length ? `<p>${l.driveTimes.map((d) => `${esc(d.label)}: ${d.minutes} min drive`).join(" · ")}</p>` : ""}
${(l.neighboringTenants ?? []).length ? `<p>Nearby: ${l.neighboringTenants.map(esc).join(", ")}.</p>` : ""}
<p>Listed by ${esc(l.listingAgent ?? profile.name)}, ${esc(profile.brokerage)}.${l.mlsNumber ? ` MLS #${esc(l.mlsNumber)}.` : ""} Call ${esc(profile.phone)}.</p>
${footerHtml}`,
  });
}

// Geo squeeze pages — the 30-day win
for (const m of markets) {
  const url = `${ORIGIN}${marketPath(m)}`;
  const related = listings.filter((l) => m.cities.map((c) => c.toLowerCase()).includes(l.city.toLowerCase()));
  pages.push({
    route: marketPath(m),
    title: `${m.h1} · Ferry CRE`,
    description: m.tagline,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Place",
          name: `${m.name}, Florida`,
          description: m.tagline,
          url,
          geo: { "@type": "GeoCoordinates", latitude: m.lat, longitude: m.lon },
          containedInPlace: { "@type": "Place", name: "Nassau County, Florida" },
        },
        {
          "@type": "FAQPage",
          mainEntity: m.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        },
        crumbs([["Ferry CRE", "/"], [m.name, marketPath(m)]]),
        { ...AGENT_LD, "@type": "LocalBusiness", "@id": `${ORIGIN}${marketPath(m)}#business`, areaServed: `${m.name}, Florida`, priceRange: "$$$" },
      ],
    },
    body: `<nav><a href="/" style="color:#c98cad">Ferry CRE</a></nav>
<h1>${esc(m.h1)}</h1>
<p><em>${esc(m.tagline)}</em></p>
<p>${esc(m.intro)}</p>
<h2>Notable corridors</h2>
<p>${m.corridors.map(esc).join(" · ")}</p>
<h2>What trades here</h2>
<p>${m.useTypes.map((u) => esc(USE_LABEL[u])).join(" · ")}</p>
${related.length ? `<h2>Current listings in ${esc(m.name)}</h2><ul>${related.map((l) => `<li><a href="${listingPath(l)}" style="color:#c98cad">${esc(l.address)}, ${esc(l.city)}</a> — ${esc(TX_LABEL[l.transaction])} · ${esc(listingPriceLine(l))}</li>`).join("")}</ul>` : ""}
<h2>Buyer &amp; tenant questions</h2>
${m.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("\n")}
<h2>Other Nassau County markets</h2>
<ul>${markets.filter((x) => x.slug !== m.slug).map((x) => `<li><a href="${marketPath(x)}" style="color:#c98cad">${esc(x.h1)}</a></li>`).join("")}</ul>
${footerHtml}`,
  });
}

// Services
pages.push({
  route: "/services",
  title: "Commercial Services · Tenant Rep, Landlord Rep, Investment Sales · Ferry CRE",
  description: "Tenant representation, landlord representation, investment sales, leasing, and site selection across Nassau County, Florida.",
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      { ...AGENT_LD, makesOffer: ["Tenant representation", "Landlord representation", "Investment sales", "Commercial leasing", "Site selection"].map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })) },
      crumbs([["Ferry CRE", "/"], ["Services", "/services"]]),
    ],
  },
  body: `<h1>Commercial services</h1>
<p>${esc(profile.name)} runs the dedicated commercial desk at ${esc(profile.brokerageShort)}.</p>
<h2>Tenant representation</h2><p>Requirement definition, corridor and co-tenancy analysis, tour management, and lease negotiation on the tenant's side of the table.</p>
<h2>Landlord representation</h2><p>Positioning, pricing against corridor comps, marketing through realMLS and AINCAR and the Berkshire network, tenant screening, and lease structuring.</p>
<h2>Investment sales</h2><p>NOI reconstruction, cap-rate and per-foot positioning, quiet marketing to qualified buyers, and diligence through close — including 1031 timelines.</p>
<h2>Commercial leasing</h2><p>Full-cycle leasing for owners and operators: NNN, modified gross, and full-service structures, renewals and expansions.</p>
<h2>Site selection &amp; land</h2><p>Traffic counts with FDOT citations, ingress and median analysis, zoning and future land use, utility due diligence, and entitlements.</p>
${footerHtml}`,
});

// About
pages.push({
  route: "/about",
  title: `About ${profile.name} · ${profile.title} · Ferry CRE`,
  description: `${profile.name} is ${profile.title} at ${profile.brokerage} in Fernandina Beach, Florida — commercial sales and leasing across Nassau County.`,
  jsonLd: { "@context": "https://schema.org", "@graph": [AGENT_LD, crumbs([["Ferry CRE", "/"], ["About", "/about"]])] },
  body: `<h1>${esc(profile.name)}</h1>
<p><strong>${esc(profile.title)}</strong> · ${esc(profile.brokerage)}</p>
<p>Commercial sales and leasing across Nassau County, Florida. ${esc(profile.memberships.join(". "))}.</p>
<p>Direct: ${esc(profile.phone)} · <a href="mailto:${esc(profile.email)}" style="color:#c98cad">${esc(profile.email)}</a></p>
${footerHtml}`,
});

// Contact
pages.push({
  route: "/contact",
  title: "Contact · Ferry CRE · Antoinette Ferry",
  description: `Reach ${profile.name} directly: ${profile.phone}, ${profile.email}. Commercial sales and leasing across Nassau County, Florida.`,
  jsonLd: { "@context": "https://schema.org", "@graph": [AGENT_LD, crumbs([["Ferry CRE", "/"], ["Contact", "/contact"]])] },
  body: `<h1>Contact</h1>
<p>${esc(profile.name)}, ${esc(profile.title)}, ${esc(profile.brokerageShort)}.</p>
<p>Direct: ${esc(profile.phone)}<br/>Email: <a href="mailto:${esc(profile.email)}" style="color:#c98cad">${esc(profile.email)}</a><br/>Office: ${esc(profile.officeAddress)} · ${esc(profile.officePhone)}</p>
${footerHtml}`,
});

/* ---------------------------------------------------------------------------
 * Stamp the files. Flat <route>.html so Netlify serves the extensionless URL
 * without a trailing-slash redirect hop; "/" overwrites dist/index.html.
 * ------------------------------------------------------------------------- */
for (const page of pages) {
  const html = inject(
    retag(template, {
      title: page.title,
      description: page.description,
      url: `${ORIGIN}${page.route === "/" ? "/" : page.route}`,
      noindex: page.noindex,
    }),
    page.jsonLd,
    page.body
  );
  const outFile = path.join(dist, page.file ?? `${page.route.slice(1)}.html`);
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, html);
}

/* ---------------------------------------------------------------------------
 * Sitemap. /explore is deliberately absent (an instrument, not a document);
 * listing pages join once the inventory is real.
 * ------------------------------------------------------------------------- */
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ["/", "1.0"],
  ["/listings", "0.9"],
  ...(SAMPLE ? [] : listings.map((l) => [listingPath(l), "0.9"])),
  ...markets.map((m) => [marketPath(m), "0.8"]),
  ["/services", "0.7"],
  ["/about", "0.6"],
  ["/contact", "0.6"],
]
  .map(([route, priority]) => `  <url><loc>${ORIGIN}${route === "/" ? "/" : route}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`)
  .join("\n");
await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

console.log(`Prerendered ${pages.length} routes + sitemap (${ORIGIN})${SAMPLE ? " — sample inventory, listing pages noindex'd" : ""}.`);
