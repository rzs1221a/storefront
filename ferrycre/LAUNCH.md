# ferrycre.com — go-live runbook

The build is complete and the inventory is live (the firm's four active AINCAR
commercial listings, verified against Antoinette's 2026-08-18 inventory email).
What remains is dashboard clicks, env vars, DNS, and a short list of facts only
Antoinette can supply.

## 1. Netlify (one-time dashboard work)

- **Production branch:** Site settings → Build & deploy → set the production
  branch to `claude/ferrycre-commercial-build-fixp0v`. The root `netlify.toml`
  on this branch already points `base = "ferrycre"` — no other build config.
- **Environment variables** (Site settings → Environment):
  - `BOLDTRAIL_DROPBOX_EMAIL` — her kvCORE/BoldTrail Lead Dropbox address.
    Server-side only; treat it as a write credential into her CRM. Without it,
    leads fall back to direct email — the site still works.
  - Mail transport (**required for lead delivery**): either
    `GMAIL_USER` + `GMAIL_APP_PASSWORD`, or
    `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`.
  - `LEAD_FALLBACK_EMAIL` — defaults to ferry@heymannwilliamsrealty.com.
  - Optional: `VITE_GOOGLE_3D_TILES_KEY` (photoreal street dive),
    `VITE_GA4_ID` (analytics).
- **/admin (Decap CMS):** enable Identity (invite-only) + Git Gateway, then
  invite Antoinette by email. `public/admin/config.yml` commits to this branch;
  change its `branch:` when the project moves to her own repo.

## 2. DNS

Point `ferrycre.com` (and `www`) at Netlify with real DNS records — Netlify DNS
or an A/ALIAS at the registrar. **Never registrar "forwarding"** (it breaks
HTTPS, deep links, and SEO). Let the certificate issue before announcing.

## 3. Facts only Antoinette can supply

| Item | Where | Current state |
|---|---|---|
| FL license number | `src/data/profile.json` → `licenseNumber`, flip `licenseConfirmed` | placeholder, never rendered as fact |
| Displayed title confirmation | `profile.json` → `titleConfirmed` | pending |
| Bio in her own voice | `profile.json` → `bio`, flip `bioConfirmed` | About page shows the factual card only |
| Property photography | replace the `/photos/*-hero.svg` placeholders | authored vector placeholders |
| Callahan parcel details (ML 116892) | acreage, parcel ID, exact coordinates in `listings.json` | price/address/status live; rest marked pending |
| FDOT traffic counts | optional per listing; must cite station + year | omitted rather than guessed |
| Additional inventory in her own name | add via `/admin` or `src/data/listings.json` | user checking manually |

## 4. Keeping inventory current

`src/data/listings.json` is the source of truth; every edit rebuilds and
re-prerenders the site. Statuses (`available` / `under-contract` / `sold`)
should track the MLS. Derived figures (price per SF, cap rate) are computed at
build time — never type them in; the build fails if you do.
