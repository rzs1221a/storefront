# Storefront — Seamark Studio

The commercial front door: a map you navigate, selling custom websites to real
estate agents — a 24-option catalog of everything on offer, with six real
shipped projects as the proof layer — one of which is this site itself.

**What the chart argues, since Act II:** not where the lighthouses are, but the
route a stranger travels between them. See [The Passage](#the-passage) — the
homepage is now one running demonstration of a lead's voyage from a search box
to a contact record, and every other page speaks that same four-station
vocabulary.

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
| **The Watch** | `src/lib/watch.ts` → `WATCH_PLANS` | **Draft, unpriced, noindexed.** Keeper / Tender / Full Watch — what keeps a light lit after launch. See the warning above before linking to it. |
| **Modules** | `src/lib/catalog.ts` → `kind: "module"` | The six `tools` offerings, from $500 to $4,500, each with optional `includedIn` tier attribution. |
| **Phone + email** | `src/lib/brand.ts` → `CONTACT` | Live: (904) 548-8222 / zander@seamark.studio (forwards via Squarespace/Mailgun). |
| **Brand name** | `src/lib/brand.ts` → `BRAND` | "Seamark Studio". A seamark is a charted object mariners navigate by — the same idea as the beacons this site draws. Worth a trademark check. |
| **Domain** | `src/lib/brand.ts` → `BRAND.domain`/`origin` | Live: `seamark.studio` — registered at Squarespace, DNS stays there (the Mailgun MX records live in that zone; never delegate nameservers to Netlify), apex A record on Netlify's load balancer. `origin` is stamped into every canonical, og:url, sitemap and robots entry. |

## The Passage

*Act II of the Living Chart. Stop charting marks; start charting passages.*

A nautical chart does not exist to show where lighthouses are. It exists so a
vessel can get from open water to a berth without dying on the rocks — the
lights are instruments of the **route**. The site used to draw the lights and
forget the route, which proved the studio can build extraordinary *places* at
exactly the moment the offer became *movement*: a stranger travelling from a
Google search box into a contact record in an agent's CRM.

**Four stations**, in `src/lib/passage.ts`, and they are the site's shared
vocabulary rather than one page's graphic:

| | | |
|---|---|---|
| **01 Open water** | where the search happens | nobody owns this water |
| **02 Found** | your light sweeps them | GBP + ranked pages, the local pack |
| **03 Landed** | they arrive on your page | a page you own, built for that intent |
| **04 Captured** | the record reaches your CRM | validated, parsed, into BoldTrail |

Three renderings share those coordinates, which is why they live in `lib` and
not in a component:

- **`components/Passage.tsx`** — the homepage hero. One inline SVG over the
  existing map, one rAF loop, zero new dependencies; the map beneath stays on
  its idle orbit. The vessel follows `getPointAtLength`; the beacon sweeps a
  real rotating wedge and the local pack lands **when the beam actually crosses
  the vessel**, because the causality is the argument.
- **`components/PassageDiagram.tsx`** — the same route in miniature on every
  tier card and Watch plan, lit stations against hollow ones. A buyer comparing
  tiers is comparing how much of the route they are buying, not parsing two
  feature lists. **A lit station is a claim**: `TIER_COVERAGE` is the only place
  those claims live and each one must be defensible against that tier's own
  `deliverables`.
- **`routes/Watch.tsx`** — which stations a plan keeps lit *after* launch.

Everything is a pure function of one number, `progress` (0 → 1). Desktop drives
it with a clock; a phone drives it with **scroll position**, so the route
rotates vertical and the visitor's own thumb walks the lead down the funnel.
Reduced motion sets it to 1 exactly once and never touches it again — which is
why the static rendering is the *completed passage* (route drawn, four stations
lit, beam held as a fixed lit sector, vessel docked, terminal full) rather than
a kill switch. `verify.mjs` already asserts reduced-motion visibility; this
passes it by design rather than by exemption.

**Nothing in it claims a number.** No "+40% leads", no conversion rate, no
outcome — it shows mechanism, which is the same line `work.ts` and `catalog.ts`
hold. A mechanism you can watch beats a statistic you have to trust.

### Colour is semantics

There is exactly one hue on this site and it means one thing.

| | Means | Where |
|---|---|---|
| **White light** | what the agent **owns** | beacons, the site, the profile, route infrastructure, prices |
| **Amber** `#f5b445` | the **lead** — value in motion | the vessel, a form filling, the captured contact, money leaving |
| **Hollow / dashed** | not yet built | concept beacons, uncovered stations (existing convention) |
| **Red** | nothing | never decorative; real errors only |

The design vision asked for cyan-versus-amber. Cyan lost, and should have: the
chrome went monochrome deliberately (five differently-branded client
screenshots have to sit in one frame), and white light is the truer reading of
"what you own" — a beacon shows white. Keeping the frame achromatic also means
amber is the *only* hue anywhere, so it carries more weight than it would as
one of two. The discipline that makes it work is restraint: amber appears where
value is **moving** and nowhere else. The moment it becomes a way to make
something look important, it stops meaning anything.

The one band where amber outweighs white is the homepage cost band — that
imbalance *is* the content: a picture of value moving the wrong way.

### The homepage, and what left it

One demonstration, one wound, one promise, one door:

1. **The Passage**, above the fold
2. **The proof strip** — six shipped sites, evidence for station 03 specifically
3. **The cost of the alternative** — `src/lib/cost.ts`, see the warning below
4. **The ownership contract** in a cartouche, and the only CTA on the page

The tier grid, the catalog, and the embedded lead form left the homepage. None
of them were deleted — every one is still a real prerendered route reachable
from the masthead. The homepage simply stopped trying to be all of them at
once, because a visitor who scrolls past a running demonstration to reach a
price grid has been handed the wrong thing to think about.

### Two things that need re-checking, on purpose

- **`src/lib/cost.ts`** publishes named third-party figures — a deliberate,
  narrow exception to the rule in `offer.ts` that COMPARISON describes market
  *patterns* rather than naming competitors with dollar figures. It survives
  only because every figure carries its source and a `checked` date that
  renders on the page. **Re-verify at source before any release that touches
  that file, and move the date.** If a source cannot be confirmed, delete the
  tile — do not leave it up with an old date. The exception does not extend to
  `COMPARISON`, which stays pattern-only.
- **`src/lib/watch.ts` is a draft.** Every plan's price is `null`, `WATCH_DRAFT`
  is true, and the `/watch` destination carries `draft: true` — so the prerender
  stamps `robots: noindex` and keeps the route out of the sitemap, and the page
  renders a visible draft notice. The prerender **fails the build** if the flag
  and the prices disagree in either direction, or if a draft route acquires a
  `navOrder`. To ship it: fill in the prices, flip the flag, drop `draft`.

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
build) regenerates the social card from BRAND + the live Geist face.

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

**Draft routes.** A destination may carry `draft: true` (see
`src/lib/destinations.ts`). It is still built, still linked from every other
page, still shareable — it is simply never offered up to be indexed: the
prerender injects `robots: noindex, follow` and drops it from the sitemap.
Submitting a noindex URL in a sitemap is a contradiction Search Console reports
as an error against the whole site, so the two are derived from one list. The
flag exists for pages whose *commercial terms* are unsettled, and the build
fails if it drifts from the prices it is protecting.

Two things that will silently destroy this if you are not careful:

- **The SPA fallback in `netlify.toml` is deliberately not forced.** Netlify
  serves matching static files before applying an unforced redirect, so
  `/pricing` resolves to the prerendered `dist/pricing.html`. Force it and every
  route collapses to the generic index, undoing the entire SEO layer with no
  visible symptom.
- **The prerendered body may never be richer than the rendered page.** It is
  derived from the same `src/lib` modules for exactly this reason, but the
  home-page branch of `bodyFor` is hand-written and is the one place where
  carrying content a visitor never sees — cloaking — would be easy to do by
  accident.

`scripts/verify.mjs` loads every route **with JavaScript disabled** and asserts
real text, a page-specific `<title>`, and a correct canonical. That check is what
protects the lead flow.

## The live conditions

`src/components/Conditions.tsx` reads the real tide and weather into the hero and footer:
*"It is 9:57 pm on the coast. The tide at Fernandina Beach is 5.9 feet and
falling."* Backed by two Netlify Functions (`netlify/functions/tide.ts`,
`conditions.ts`) hitting NOAA CO-OPS station 8720030 and the National Weather
Service. Both APIs are key-free.

This is one of two places the site proves rather than claims — `/capabilities`
says I wire up live local data, and this is that, running.

The other is the **capture demo** (`src/components/CaptureDemo.tsx`, backed by
`netlify/functions/lead-echo.ts`), which now leads `/capabilities` because it is
the pillar that actually sells. The visitor fills a real form, fires it at a
real serverless function, and the pane prints what came back: validated, split
into named fields, timestamped. **The elapsed figure is measured, not written** —
the design vision proposed the caption "that took 1.8 seconds", which is exactly
the kind of number this codebase refuses to publish, so the demo reports the
round trip it just made.

The function stores nothing, forwards nothing, and cannot be used as a relay;
the real lead path is `LeadForm.tsx` → Netlify Forms and must never be wired
through it. Degradation is designed: on `npm run preview` the function does not
exist and the pane says so, because faking a successful parse on the page that
sells honest engineering would be the single most expensive lie on this site.

**Silence is required behaviour, not a fallback.** On `npm run preview` the
functions do not exist and it renders nothing. Nothing may depend on its height.

## Design

Monochrome on purpose, in a minimal register: **Geist Variable** as the only
reading voice (tight grotesk tracking, no italics — emphasis is a lighter
weight in softer ink), Geist Mono as the chart-instrument voice, and one hue —
amber, and only where value is in motion. See
[Colour is semantics](#colour-is-semantics). The client work is the color; the
frame is achromatic so five differently-branded screenshots sit in one frame.

**Prose and readings are different voices.** Anything that is an instrument
reading — a price, a coordinate, a timestamp, a terminal line, a source
citation — is set in `.reading`: Geist Mono with `tabular-nums`, which is the
whole point. A column of figures whose digits do not line up reads as
decoration, and a figure that changes width as it counts reads as broken. The
chart aesthetic lives or dies on that distinction.

**Chart furniture** (`.soundings`, `.cartouche`, the compass rose) is the only
genuinely decorative thing here: the scattered depth numerals that fill open
water on a real chart, and the title block where a chart declares its datum and
its authority. Held under 8% opacity and never behind body text — the instant
one of them competes with something readable it has failed at its only job.

**The material is Surface Liquid Glass**, ported from
`heymann-williams-coastal` at the owner's direction — the glass MATERIAL is
shared; the typography and palette are explicitly not (no Playfair/Inter, no
gold/cabernet). Three tiers of one achromatic material: near-clear `.glass`
for chrome and buttons, `.glass-deep` (alias `.panel`) as the legibility
floor under body text, `.glass-card` for grids — each an opaque frosted
fallback plus a `@supports` upgrade to the refractive pane, with a dark
backing layer HW never needed because the backdrop here is a moving satellite
map. A render-motion governor (`src/lib/renderMotion.ts`) watches real frame
times and steps `data-render-load` silk/steady/austere on `<html>`, which the
glass filter tokens read — the material lightens before the page gets slow
(`?motionHud=1` shows the verdict). Route navigations bloom the incoming
page's glass in over the flying chart, and first arrival runs a startup gate
that holds until the map reports ready (capped, skippable, once per
session).

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
