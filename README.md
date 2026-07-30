# Storefront — Seamark Studio

The commercial front door: a map you navigate, selling custom websites to real
estate agents — a 24-option catalog of everything on offer, with five real
shipped projects as the proof layer.

```bash
npm install
npm run dev        # local dev on :5173
npm run build      # type-check + build + prerender every route
npm run preview    # serve the build
```

Netlify-ready — build `npm run build`, publish `dist` (already in `netlify.toml`).

## The shape

This is not a page with a map on it. It is a map with destinations on it.

Each project is a beacon at its **real coordinate**. Click one and the camera
descends while a glass sheet rises with the case study — read about Crane Island
and you are looking at Crane Island. Pricing, Process, Questions and Contact are
destinations on the same plane. A rail on the left names every one of them.

The catalog (`/options`) is 24 offerings in five categories, each a real
prerendered route. Two kinds, and the map draws the line itself: **shipped**
patterns are solid beacons proven by a named project in `work.ts`; **concepts**
are hollow dashed beacons spread down the corridor — St. Marys to St. Augustine
— labeled Concept everywhere they appear. `work.ts` keeps its "nothing
aspirational" rule absolutely; `catalog.ts` holds the mirror rule (everything is
for sale, nothing is presented as shipped without a `proofSlug`), and the
prerender fails the build on any violation.

**The document never scrolls.** `html, body { height: 100%; overflow: hidden }`.
Sheets scroll inside themselves. That is the brief, and `scripts/verify.mjs`
asserts it on every route at every breakpoint rather than trusting it.

The model is borrowed from the flagship in this portfolio. The Aerial's README
states it: *"No homepage, no nav, no scroll feed — you open it and you're above
the real county, and you descend into places."* Applied here it makes the site
self-demonstrating — it claims maps are the product, and it is one.

| | |
|---|---|
| `src/lib/destinations.ts` | the route table: URL, camera frame, rail label, beacon |
| `src/lib/work.ts` | the five shipped projects — verifiable claims only |
| `src/lib/catalog.ts` | the 24 offerings, five categories, the honesty contract |
| `src/lib/cameraFrames.ts` | verified coordinates and the flight queue |
| `src/components/Shell.tsx` | the app frame; the map mounts here **once** |
| `src/components/LiveMap.tsx` | MapLibre, beacons (solid work / hollow concept), idle orbit |
| `src/components/Sheet.tsx` | the glass panel, focus handling, swipe dismiss |
| `src/components/Rail.tsx` | desktop navigation |
| `src/components/MobileFrame.tsx` | phone tab bar, derived from `PRIMARY_NAV` |
| `src/routes/*` | route components; `/work/:slug` and `/options/:slug` are generic |

The map instance must **never remount on navigation** — the whole effect depends
on the camera flying between destinations rather than the plate reloading.

## Before this goes live

Four placeholders, each in exactly one file.

| What | Where | Note |
|---|---|---|
| **Prices** | `src/lib/offer.ts` → `TIERS` | $1,500 / $3,500 / $6,500 are invented. `SHOW_PRICING` in `brand.ts` is currently **false**, so every tier reads "Let's talk". |
| **Phone + email** | `src/lib/brand.ts` → `CONTACT` | Live: (904) 548-8222 / rzs1221a@gmail.com. |
| **Brand name** | `src/lib/brand.ts` → `BRAND` | "Seamark Studio". A seamark is a charted object mariners navigate by — the same idea as the beacons this site draws. Worth a trademark check. |
| **Domain** | `src/lib/brand.ts` → `BRAND.domain`/`origin` | Currently the Netlify URL we actually control. `kedge.studio` was never ours — it belongs to a third party. Do not name a domain here until it is registered and pointed at this site: `origin` is stamped into every canonical, og:url and sitemap entry. |

## SEO — read this before changing the build

A map application with no crawlable text will not rank, and this site exists to
generate leads. **Every route is prerendered to static HTML with its full written
content** by `scripts/prerender.mjs`, wired into `npm run build`. React renders
over it on load.

Ported from `heymann-williams-coastal/scripts/prerender.mjs`, which does the same
for 26 neighborhood routes. No headless browser — the script runs through `tsx`
(a devDependency) so it can **import the real `src/lib` modules** rather than
carry duplicated content. Adding a destination means editing
`src/lib/destinations.ts` (or the data it derives from) and nothing else; the
script ends with assertions over the actual invariants — one page per
destination, unique paths, every camera frame resolvable, every beacon
coordinate finite, every "shipped" offering carrying a real proof — and fails
the build loudly on any violation.

One thing that will silently destroy this if you are not careful:

- **The SPA fallback in `netlify.toml` is deliberately not forced.** Netlify
  serves matching static files before applying an unforced redirect, so
  `/pricing` resolves to the prerendered `dist/pricing.html`. Force it and every
  route collapses to the generic index, undoing the entire SEO layer with no
  visible symptom.

`scripts/verify.mjs` loads every route **with JavaScript disabled** and asserts
real text, a page-specific `<title>`, and a correct canonical. That check is what
protects the lead flow.

## The live conditions

`src/components/Conditions.tsx` reads the real tide and weather into the rail:
*"It is 9:57 pm on the coast. The tide at Fernandina Beach is 5.9 feet and
falling."* Backed by two Netlify Functions (`netlify/functions/tide.ts`,
`conditions.ts`) hitting NOAA CO-OPS station 8720030 and the National Weather
Service. Both APIs are key-free.

This is the one place the site proves rather than claims — `/capabilities` says I wire
up live local data, and this is that, running.

**Silence is required behaviour, not a fallback.** On `npm run preview` the
functions do not exist and it renders nothing. Nothing may depend on its height.

## Design

Near-monochrome on purpose. The client work is the color — Crane Island and
Heymann Williams are gold-and-cabernet, The Aerial is deep glass and blue — so
the chrome stays neutral and lets five differently-branded screenshots sit in the
same frame. One accent (`--color-signal`) for live state, eyebrows, and focus.

**Glass is load-bearing here, not decorative.** `.panel` is two layers: a light
tint that reads as material, over a dark floor at 74% that makes it predictable.
Without the floor the effective background is whatever the camera is framing, and
contrast drifts as it flies — muted text measured 3.84:1 against a bright
shoreline. If you lighten that floor, re-run `verify.mjs`; it samples real text
contrast at four camera positions.

Layout selectors are scoped under `.shell-frame` deliberately. The rail, sheets,
and coast card all wear `.panel`, which sets `position: relative` to contain its
own grain and rim pseudo-elements — at equal specificity that rule won, and the
sheet silently fell into flow and rendered half off-screen.

## Verification

```bash
npm run preview &
npm run verify                 # routes, no-scroll, no-JS content, contrast, keyboard
npx tsx scripts/verify.mjs http://127.0.0.1:4319 --quick   # faster iteration pass
node scripts/camera-check.mjs  # the camera actually goes where the URL says
```

`verify.mjs` derives its route list (and each route's expected phrase) from
`src/lib/destinations.ts`, so a new destination is verified without touching the
script. `--quick` runs every route at mobile + desktop and samples the rest of
the viewport matrix.

`verify.mjs` covers four breakpoints: every route renders, the document never
scrolls, sheets scroll internally when they overflow, prerendered HTML carries
real content with correct titles and canonicals, text clears 4.5:1 against the
live camera at four positions, and the rail, sheet close, and Escape all work
from a keyboard.

`camera-check.mjs` exists because the flight is invisible to every other check —
the site passes contrast, layout, and accessibility whether or not the map ever
moves. It reads the real MapLibre camera per route and asserts it arrived.

**A note on reduced motion.** It removes the animation, not the navigation. When
the map was a backdrop, honouring the preference meant holding the camera still;
now the camera position *is* the destination, and holding still would strand
someone on `/contact` looking at the wrong place. The camera jumps instead of
easing, and `camera-check.mjs` asserts it arrives within 700 ms — far less than a
flight would take.

The verifier ignores `net::ERR_ABORTED` on map tiles: a camera that flies cancels
requests for viewports it has left, which is MapLibre working correctly. Every
other failed request is still reported with its URL and reason.

## Screenshots

`npm run capture` drives the environment's Chromium over all five client projects
and writes desktop + mobile frames to `public/work/<slug>/`. Output is
**committed**, so the build never depends on the network or on the sibling repos
being present.

Two things it handles that are easy to get wrong:

- **Egress.** This environment's proxy only accepts CONNECT-tunnelled traffic,
  which Chromium does not negotiate — every external request returns
  `ERR_CONNECTION_RESET`. That fails *silently*: CDN-hosted Tailwind never
  arrives and you get a blank white capture. Requests route through `curl`
  instead (`scripts/lib/egress.mjs`). TLS verification stays on.
- **Blank detection.** Every capture is checked for pixel variance before it is
  written, because a blank frame on a portfolio page is worse than a missing one.

Error responses are never fulfilled and failed embeds are hidden before the
shutter — otherwise a third-party iframe returning a bot-challenge page renders
"We couldn't verify the security of your connection" across a client's hero.
