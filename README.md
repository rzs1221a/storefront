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

Note it forces `scroll-behavior: auto` first. The site sets smooth scrolling,
and a stepped `scrollTo` loop retargets the in-flight animation on every
iteration — the page never reaches most offsets, IntersectionObserver never
fires, and the capture comes out full of blank sections that look exactly like
a layout bug. Real users scroll natively and are unaffected.
