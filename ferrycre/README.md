# ferrycre.com — Ferry CRE

Nassau County commercial real estate. Antoinette Ferry, Director of Commercial
Sales & Leasing, BHHS Heymann Williams Realty. Her domain, her code, her lead
data — portable wherever she goes.

```bash
npm install
npm run dev        # local dev on :5173
npm run build      # type-check + build + prerender every ranking route
npm run preview    # serve the build
```

Netlify-ready: if deploying from the monorepo, set the site's **base
directory** to `ferrycre`; `netlify.toml` here does the rest. Point
`ferrycre.com` at Netlify with a **real DNS pointer** (never GoDaddy registrar
forwarding — it breaks ad destination verification).

## The shape

Six listings, hand-authored — a small, curated, high-value book, which is a
different design problem than a portal. Nobody constructs a search to find six
properties; the site puts everything on the table and makes each property page
the deepest document about that property on the internet.

| | |
|---|---|
| `src/lib/commercial.ts` | the commercial domain model — written from scratch; no residential assumptions |
| `src/data/listings.json` | the six records (**sample data until hers land** — see below) |
| `src/data/markets.json` | the five geo squeeze pages, unique authored prose each |
| `src/data/profile.json` | her identity, contact, license, consent language — editable at `/admin` |
| `src/lib/listingsSource.ts` | one switch point for listing data; a Buildout/RESO adapter drops in later |
| `src/lib/intent.ts` | plain-phrase search ("retail on 200 under 1.5m") — commercial vocabulary |
| `src/lib/attunement.ts` | local-only behavioral profile; BoldTrail export seam (phase 2) |
| `src/routes/Explore.tsx` | the map instrument — lazy, code-split, never prerendered |
| `scripts/prerender.mjs` | stamps static HTML + JSON-LD per route, regenerates sitemap, **fails the build** on dirty data |
| `netlify/functions/lead-submit.mts` | form → BoldTrail Lead Dropbox (email-parser protocol) with direct-email fallback, TCPA logging |

## The honesty gate

`scripts/prerender.mjs` fails the build if:

- a listing hand-authors a derived figure (`pricePerSF`, or `capRate` with NOI+price present)
- a traffic count lacks its FDOT source + year
- geo prose is under length or duplicated between markets
- residential IDX / Fair Housing boilerplate appears anywhere in the data
- slugs collide or required fields are missing

While `listings.json` has `"sample": true`, listing pages are `noindex` and
excluded from the sitemap, and the site shows a discreet preview notice.

## Before launch (she supplies)

1. The six real listings — full detail per `commercial.ts`; flip `"sample": false`
2. Bio and service copy **in her own voice** (`bioConfirmed: true` turns it on)
3. FL license number (`licenseConfirmed: true`) — required on advertising
4. Exact displayed title confirmation
5. Photography of the actual properties (SVG placeholders stand in)
6. `BOLDTRAIL_DROPBOX_EMAIL` + a mail transport in the Netlify env

## Performance rules (non-negotiable)

- Sub-second FCP on prerendered routes; system font stack; zero third-party
  scripts above the fold
- maplibre and the deck.gl photoreal stack are code-split (`manualChunks`) and
  dynamic-imported; they must never land in the main bundle
- `/explore` is an instrument, not a document: lazy, unprerendered, unindexed

## Compliance notes

- **No IDX disclaimer, no Fair Housing block** — her listings are her own
  commercial inventory; the residential boilerplate is affirmatively banned by
  the build gate
- **Do carry**: BHHS franchise attribution, her FL license number, brokerage
  identification (footer, every page)
- TCPA: every submission stores timestamp, source URL, and the exact consent
  language shown, keyed by correlation ID (Netlify Blobs)
- Traffic counts always render with source + year
