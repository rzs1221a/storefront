# Storefront — Seamark Studio

The commercial front door: a map you navigate, selling custom websites to real
estate agents — a 24-option catalog of everything on offer, with six real
shipped projects as the proof layer — one of which is this site itself.

```bash
npm install
npm run dev        # local dev on :5173
npm run build      # type-check + build + prerender every route
npm run preview    # serve the build
```

Netlify-ready — build `npm run build`, publish `dist` (already in `netlify.toml`).

## The shape

A storefront that has a map, not a map that has a storefront. **The document
scrolls**: content flows over a fixed, living satellite chart of the coast, and
`.chart-window` gaps between sections open the map at full height wherever the
camera has just flown. Every section declares a `data-frame`; `observeFrames`
flies the camera to whichever owns the viewport, and navigation flies it
between destinations.

The home page argues in selling order — hero, shipped work, the four tier cards
with real prices, the catalog, and a close that embeds the lead form itself.

The catalog (`/options`) is 24 offerings in five categories, each a real
prerendered route, on two axes: **builds** (whole sites, priced by tier) and
**modules** (add-ons with their own `priceFrom`, attachable to any build).
Two statuses, and the map draws the line itself: **shipped** patterns are solid
beacons proven by a named project in `work.ts`; **concepts** are hollow dashed
beacons spread down the corridor — St. Marys to St. Augustine — labeled Concept
everywhere they appear. `work.ts` keeps its "nothing aspirational" rule
absolutely; `catalog.ts` holds the mirror rule (everything is for sale, nothing
is presented as shipped without a `proofSlug`; every build resolves a real
tier, every module carries a finite from-price), and the prerender fails the
build on any violation.

| | |
|---|---|
| `src/lib/destinations.ts` | the route table: URL, camera frame, nav label, beacon |
| `src/lib/work.ts` | the six shipped projects (incl. this site) — verifiable claims only |
| `src/lib/offer.ts` | the four build tiers (Daymark / Beacon / Light Station / Flagship) |
| `src/lib/catalog.ts` | the 24 offerings — builds + modules, five categories, the honesty contract |
| `src/lib/cameraFrames.ts` | verified coordinates and the flight queue |
| `src/components/Shell.tsx` | the app frame; the map mounts here **once** |
| `src/components/LiveMap.tsx` | MapLibre, beacons (solid work / hollow concept), idle orbit |
| `src/components/SiteHeader.tsx` | sticky glass masthead: wordmark, nav, command bar, CTA |
| `src/components/SiteFooter.tsx` | chart instruments, live conditions, directory |
| `src/routes/Coast.tsx` | the home page — the long scrolling storefront |
| `src/routes/*` | route components; `/work/:slug` and `/options/:slug` are generic |

The map instance must **never remount on navigation** — the whole effect depends
on the camera flying between destinations rather than the plate reloading.

## The offer

Two axes, published. `SHOW_PRICING` in `brand.ts` is **true**; flip it off and
every figure on the site reads "Let's talk" again without touching a number.

| What | Where | Note |
|---|---|---|
| **Build tiers** | `src/lib/offer.ts` → `TIERS` | Daymark $1,500 · Beacon $3,500 · Light Station from $6,500 · Flagship from $12,000 — one-time, named as the coast names its lights. |
| **Modules** | `src/lib/catalog.ts` → `kind: "module"` | The six `tools` offerings, from $500 to $4,500, each with optional `includedIn` tier attribution. |
| **Phone + email** | `src/lib/brand.ts` → `CONTACT` | Live: (904) 548-8222 / zander@seamark.studio (forwards via Squarespace/Mailgun). |
| **Brand name** | `src/lib/brand.ts` → `BRAND` | "Seamark Studio". A seamark is a charted object mariners navigate by — the same idea as the beacons this site draws. Worth a trademark check. |
| **Domain** | `src/lib/brand.ts` → `BRAND.domain`/`origin` | Live: `seamark.studio` — registered at Squarespace, DNS stays there (the Mailgun MX records live in that zone; never delegate nameservers to Netlify), apex A record on Netlify's load balancer. `origin` is stamped into every canonical, og:url, sitemap and robots entry. |

## The Living Chart

The redesign's organizing idea: the site behaves like a working nautical
chart of the offer. Nothing on it is decoration — every chart element is data.

- **Light signatures.** Every shipped mark identifies itself by rhythm, the
  way real lighted seamarks do. Authored in `work.ts` (`light`), drawn as
  luminance keyframes in `index.css` (0.65–1.0, never a strobe):

  | Mark | Characteristic |
  |---|---|
  | The Aerial | Fl(2) 10s |
  | Heymann Williams | Fl 6s |
  | Sold on Amelia Island | Iso 4s |
  | Crane Island | Oc 8s |
  | Ron Heymann | LFl 8s |
  | This Storefront | F — fixed; the mark you are standing on |

  Concepts are **unlit** — an unbuilt mark carries no light, and the type in
  `destinations.ts` enforces it. Reduced motion freezes every dot lit.
- **The wake** (`src/lib/wake.ts`). The visitor's own track, session-scoped:
  a 1px hairline drawn between visited marks (`setData` per navigation, never
  per frame) and a footer counter — "4 of 12 marks charted." No badges.
- **Chart legs** (`src/lib/chart.ts`). Distance and course between the last
  two marks, in nautical miles, sixteen-wind compass. Straight lines, not
  routes.
- **The sky grade.** `sky.ts` hands Shell a gradient keyed to real solar
  elevation; one `soft-light` div tints the imagery — golden hour on the site
  is golden hour on the coast. The conditions line carries the same truth:
  the astronomical light label, the tide *source* ("— observed"), wind
  direction, and a golden-hour countdown, polled live (tide 6 min,
  forecast 15 min, clock 30 s).
- **Padding choreography.** Every flight declares the chrome's occupancy, so
  a destination's subject frames in the clear ground beside the sheet rather
  than behind it.
- **The deck** (`MarkDeck.tsx`, phones). All twelve marks as a snap carousel;
  swiping flies the camera (URL stays home — a spyglass, like desktop
  hover-fly), tapping commits. `Text Zander` (`sms:`) is the thumb-first
  conversion path.
- **Datum lines.** Each case study opens with its light characteristic and
  true position: `OC 8S · 30.613° N 81.477° W`.

Asset runbooks: `npm run capture:self` (serve dist on 4319 first) regenerates
the storefront's own case-study screenshots; `tsx scripts/og.mjs` (after a
build) regenerates the social card from BRAND + the live Fraunces face.

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

`src/components/Conditions.tsx` reads the real tide and weather into the hero and footer:
*"It is 9:57 pm on the coast. The tide at Fernandina Beach is 5.9 feet and
falling."* Backed by two Netlify Functions (`netlify/functions/tide.ts`,
`conditions.ts`) hitting NOAA CO-OPS station 8720030 and the National Weather
Service. Both APIs are key-free.

This is the one place the site proves rather than claims — `/capabilities` says I wire
up live local data, and this is that, running.

**Silence is required behaviour, not a fallback.** On `npm run preview` the
functions do not exist and it renders nothing. Nothing may depend on its height.

## Design

Near-monochrome on purpose, in a warm editorial register. The client work is
the color — Crane Island and Heymann Williams are gold-and-cabernet, The Aerial
is deep glass and blue — so the chrome stays quiet and lets five
differently-branded screenshots sit in the same frame. The storefront's own
voice is **Fraunces Variable** (all-serif, optical sizing on, italics as the
emphasis register) over warm ink-black plates with parchment cream text, Geist
Mono as the chart-instrument voice, and one champagne-brass accent
(`--color-signal`) for live state, eyebrows, prices, and focus. Explicitly not
the Playfair/Inter + gold/cabernet vocabulary of the client work.

**Glass is load-bearing here, not decorative.** `.panel` is two layers: a light
tint that reads as material, over a dark floor at 74% that makes it predictable.
Without the floor the effective background is whatever the camera is framing, and
contrast drifts as it flies — muted text measured 3.84:1 against a bright
shoreline. If you lighten that floor, re-run `verify.mjs`; it samples real text
contrast at four camera positions.

Layout selectors are scoped under `.shell-frame` deliberately. The header and
footer wear `.panel`, which sets `position: relative` to contain its own grain
and rim pseudo-elements — at equal specificity that rule wins, so layout must
outrank it by scope.

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

`verify.mjs` covers four breakpoints: every route renders, vertical scroll
works and horizontal overflow never exists, prerendered HTML carries real
content with correct titles and canonicals, text clears 4.5:1 against the live
camera at four positions, and the nav and consultation CTA are reachable from a
keyboard.

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
