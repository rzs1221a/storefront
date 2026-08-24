# IEC Jacksonville — static marketing site mockup

A pitch mockup for a proposed **IEC Jacksonville** chapter (Independent Electrical
Contractors, Northeast Florida). Not production, no CMS, no backend.

## Opening it

Double-click `index.html`. That's the whole workflow — there is no build step,
no dev server and no install. Every page is a standalone HTML file.

Tailwind and the webfonts load from public CDNs, so the pages want an internet
connection to look right. `assets/site.css` carries the brand tokens and a
font-stack fallback, so the content is still readable offline, just unstyled in
its layout.

## Structure

| File | Page |
|---|---|
| `index.html` | Hero, three program/value cards, what the chapter does, stats band, upcoming-events strip (empty state), contact strip |
| `about.html` | Mission, what IEC is + link to national, board/staff/instructor grids |
| `apprenticeship.html` | Overview, three tracks, how sponsorship works, curriculum, eligibility, apply |
| `membership.html` | Contractor vs. industry partner side by side, partner tiers, apply |
| `events.html` | Calendar with a designed empty state, recurring event types |
| `faqs.html` | Eight-question accordion |
| `contact.html` | Non-functional form markup, office details, map placeholder |
| `privacy.html` `terms.html` `accessibility.html` | Footer stub pages |
| `assets/site.css` | Brand tokens, buttons, placeholder markers, accordion + nav state |
| `assets/site.js` | Mobile nav drawer and FAQ accordion. Nothing else. |

Header, footer and nav markup are duplicated in each page on purpose — that's the
cost of "one file per page, no build step". Changing the nav means editing all ten.

## Information architecture

Modeled on `iec-fecc.org` (IEC Florida East Coast Chapter): the two-tier header with
a utility bar, the About → board/staff/instructors split, the Apprenticeship →
career-prep / electrical / low-voltage tracks, the contractor vs. industry-partner
membership split with Gold/Silver/Bronze partner tiers, and the month-grouped events
calendar. **All copy here is original** — no text or assets were taken from their site.

## Placeholders

Everything unresolved is marked, never filled with plausible-looking fiction:

- `[BRACKETED TEXT]` on a tinted dotted background — an unconfirmed fact (dates, dues,
  hours, names, addresses, phone numbers).
- Hatched navy blocks with an orange **IMAGE PLACEHOLDER** badge — where photography goes.
- Dashed amber panels — section-level warnings (e.g. the legal stubs are not real policies).

Phone numbers use the reserved `555-01xx` range and emails use `example.org`, so nothing
here can reach a real person. Before this becomes a real site, search for `class="ph`
and `img-ph` — that's the complete to-do list.

## Design

Navy (`#0B1E33`) with a burnt-orange accent (`#A85413` where it carries text,
`#D97A1F` for decoration only — the brighter tone fails contrast behind type).
Archivo for display, Source Sans 3 for body. "IEC JACKSONVILLE" is set as a
type-only wordmark; no logo has been invented.

## Verified

Checked in headless Chromium across all ten pages at 1360px and 390px:

- No console errors; no horizontal overflow at either width.
- Mobile drawer opens/closes from both triggers, on Escape, on link click, and
  unlocks body scroll when resized back to desktop.
- Accordion works by mouse and keyboard with correct `aria-expanded` state.
- All internal links and anchor targets resolve; balanced tags; one `<h1>` per page.
- Sampled text meets WCAG AA contrast on every page.
