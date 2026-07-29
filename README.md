# Storefront — Kedge

The commercial front door: a single-page site that sells custom websites to
real estate agents, using five real shipped projects as the proof.

```bash
npm install
npm run dev        # local dev on :5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the build
```

Netlify-ready — build `npm run build`, publish `dist` (already in `netlify.toml`).

## Before this goes live

Four things are placeholders. Each lives in exactly one file.

| What | Where | Note |
|---|---|---|
| **Prices** | `src/lib/offer.ts` → `TIERS` | $1,500 / $3,500 / $6,500 are invented. Confirm or replace. |
| **Phone + email** | `src/lib/brand.ts` → `CONTACT` | Currently a 555 number. Lead notifications go to `CONTACT.email`. |
| **Brand name** | `src/lib/brand.ts` → `BRAND` | "Kedge". Worth a trademark and domain check before printing it on anything. |
| **Domain** | `src/lib/brand.ts`, `index.html`, `public/sitemap.xml`, `public/robots.txt` | Canonical, OG, and sitemap URLs all say `kedge.studio` — not yet registered. |

`SHOW_PRICING` in `src/lib/brand.ts` flips every price to "Let's talk" if you
would rather gate the numbers behind a conversation.

## Routing the leads

The form posts to **Netlify Forms** under the name `storefront-enquiry`.
Netlify discovers forms by scanning deployed HTML, and this form is rendered by
React — so `public/__forms.html` declares it statically for the build-time
scan. **If you add a field to `src/components/LeadForm.tsx`, add it there too**,
or that field is silently dropped from every submission.

After the first deploy: Netlify → Forms → `storefront-enquiry` → add an email
notification pointing at wherever you want enquiries to land.

## The background

A single MapLibre instance sits fixed behind the whole page: real Esri
satellite imagery of Amelia Island and the Nassau County coast, dark-graded,
slowly orbiting. It is the ground all five portfolio projects cover, so the
page answers "where am I" before a word is read. Ported from
`heymann-williams-coastal/src/components/BackgroundMap.tsx` and reduced to what
a single-page site needs — no routes, no markers, no interaction.

- `src/lib/mapStyle.ts` — the style and camera. Both tile sources are key-free.
- `src/components/BackgroundMap.tsx` — lazy MapLibre + idle orbit.
- `src/components/Atmosphere.tsx` — map, tint, vignette as one fixed stack.

maplibre-gl is ~210 kB gzipped, so it is **dynamically imported after first
paint during idle time** and lands in its own chunk. Initial JS is unaffected.
If WebGL is missing, the import fails, or tiles never arrive, the gradient
underneath simply stays — the page is designed to look right without the map
and better with it. The orbit stops when the tab is hidden and never starts
under `prefers-reduced-motion`.

**The tint is load-bearing.** `.atmosphere-wash` in `src/index.css` is what
keeps the coast subordinate to five portfolio screenshots and every line of
copy. Lighten it and the imagery starts competing; darken it and there was no
point putting a map there. If you touch those alpha values, re-run
`scripts/verify.mjs` — it measures real text contrast against the rendered
background (see below), and the current values sit just above the line.

### The camera follows the reader

The map does not just orbit — it flies. Each section declares a frame in
`src/lib/cameraFrames.ts`, and as that section becomes the dominant thing on
screen the coast beneath the page moves there. Hovering a project card flies to
where that project actually is. Read about Crane Island and you are looking at
Crane Island.

Every coordinate is real, taken from `the-aerial/lib/geo.ts` and the USGS
figure for Crane Island. **Do not invent coordinates here** — a map that flies
to the wrong place is worse than one that does not fly.

One IntersectionObserver drives it, not a scroll listener. Only the most recent
target is ever flown to, so a fast scroll past four sections does not queue four
flights; a flight already in the air shortens the next so the camera keeps up
with the reader instead of trailing behind. The idle orbit yields while a
scripted flight owns the camera, and under `prefers-reduced-motion` nothing
flies at all.

`scripts/camera-check.mjs` asserts this directly — see Verification.

### Live conditions

`src/components/Conditions.tsx` shows the real tide and weather in the hero:
*"It is 9:57 pm on the coast. The tide at Fernandina Beach is 5.9 feet and
falling."* Backed by two Netlify Functions ported from The Aerial
(`netlify/functions/tide.ts`, `conditions.ts`) hitting NOAA CO-OPS station
8720030 and the National Weather Service. Both APIs are key-free.

This is the one place the site proves rather than claims — the capabilities
section says I wire up live local data, and this is that, running, two screens
above the claim.

**Silence is a required behaviour, not a fallback.** On `npm run preview` the
functions do not exist and this renders nothing at all. Nothing in the hero
layout may depend on its height.

Esri's terms require visible attribution wherever World Imagery is displayed.
The map's own control is off, so the credit lives in the footer. Keep it.

## Design

Near-monochrome on purpose. The client work is the color — Crane Island and
Heymann Williams are gold-and-cabernet, The Aerial is deep glass and blue — so
the studio frame stays neutral and lets five differently-branded screenshots
sit on one page without fighting each other. One accent (`--color-signal`,
cyan) is reserved for live state, eyebrows, and focus rings; primary CTAs
invert to cream-on-black for maximum contrast.

Deliberately *not* the Playfair/Inter + gold system in
`heymann-williams-coastal` — that vocabulary belongs to the BHHS client work,
and reusing it would make this read as a brokerage microsite.

Tokens and utilities: `src/index.css`. Content lives in `src/lib/`
(`brand` · `offer` · `work`); `src/sections/` is presentation only.

## Screenshots

`npm run capture` drives the environment's Chromium over all five projects and
writes desktop + mobile frames to `public/work/<slug>/`. Output is **committed**
so the build never depends on the network or on the sibling repos being present.

Re-run it after any client site changes. A single target: `npm run capture the-aerial`.

Two things it handles that are easy to get wrong:

- **Egress.** This environment's proxy only accepts CONNECT-tunnelled traffic,
  which Chromium does not negotiate — every external request returns
  `ERR_CONNECTION_RESET`. That fails *silently*: CDN-hosted Tailwind never
  arrives and you get a blank white capture. Requests are routed through `curl`
  instead, which traverses the proxy correctly. TLS verification stays on.
- **Blank detection.** Every capture is checked for mean channel standard
  deviation before it is written. Below the threshold it errors instead of
  saving, because a blank frame on a portfolio page is worse than a missing one.

Error responses are never fulfilled, and embeds that fail to load are hidden
before the shutter — otherwise a third-party iframe returning a bot-challenge
page renders "We couldn't verify the security of your connection" across the
client's hero.

## Verification

```bash
npm run preview &
node scripts/verify.mjs
```

Checks four breakpoints for horizontal overflow, broken images, missing alt
text and dimensions, unlabeled form controls, undersized tap targets, console
errors, that the page scrolls to its own bottom, that every reveal fires, and
that content is still visible with `prefers-reduced-motion: reduce`.
Screenshots land in `/tmp/storefront-verify`.

It also measures **real text contrast against the live background**. With a
satellite plate behind the copy the effective background is no longer a known
token — it is whatever the camera is framing, and a bright sandbar drifting
under a paragraph is a regression no static color audit would catch. The check
screenshots the page with every glyph turned transparent, samples the true
surface behind each text block, and computes the WCAG ratio. (Sampling a fixed
offset below the text does not work: under a label sits its own value, and you
end up measuring cream against cream.)

Then, separately:

```bash
node scripts/camera-check.mjs
```

This proves the background camera actually follows the reader — the signature
interaction is invisible to every other check, since the page passes contrast,
layout, and accessibility whether or not the map ever moves. It scrolls to each
registered section, reads the real MapLibre camera, and asserts it arrived near
the declared coordinate. It also confirms the camera moved *between* sections
rather than sitting somewhere that happens to satisfy every tolerance, and that
reduced motion suppresses flight entirely.

A note on what the verifier ignores: a camera that flies cancels tile requests
for viewports it has already left, which produces dozens of `net::ERR_ABORTED`
entries per scroll. That is MapLibre working correctly. Any other failed
request is still reported, with its URL and reason.

Note it forces `scroll-behavior: auto` first. The site sets smooth scrolling,
and a stepped `scrollTo` loop retargets the in-flight animation on every
iteration — the page never reaches most offsets, IntersectionObserver never
fires, and the capture comes out full of blank sections that look exactly like
a layout bug. Real users scroll natively and are unaffected.
