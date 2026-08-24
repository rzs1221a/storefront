# IEC Jacksonville — site mockup

A pitch mockup for a proposed Jacksonville chapter of Independent Electrical
Contractors. **Not a real IEC property and not a live site** — every page carries
a "MOCKUP" strip above the header saying so.

Open `index.html` by double-clicking it. There is no build step, no server and no
install; each page is a single self-contained HTML file that loads Tailwind and
Google Fonts from their CDNs, so the pages need an internet connection to render
styled.

## Pages

| File | What it is |
|---|---|
| `index.html` | Hero, what the chapter does, three program cards, both CTAs, events strip with empty state, contact strip |
| `about.html` | Mission, what IEC is, link to national, founding board and staff grids |
| `apprenticeship.html` | Program overview, how sponsorship works, curriculum by year, eligibility, what it costs |
| `membership.html` | Contractor and industry partner memberships side by side, comparison table, how to join |
| `events.html` | Calendar with a designed empty state and a labeled layout preview |
| `contact.html` | Non-functional form markup, chapter details, map placeholder |
| `faqs.html` | Eight-question accordion |
| `privacy.html` `terms.html` `accessibility.html` | Footer stub pages, so no footer link is a dead `#` |

## Reading the placeholders

Nothing here is real content, and every placeholder is meant to be visible at a
glance rather than discovered later:

- **Inline placeholders** — cream highlight with a dashed underline, e.g. `[ZIP]`,
  `[$X,XXX / year]`, `[Fall 2026]`. Names, dues, dates, addresses and counts are
  all placeholders.
- **Images** — hatched blocks with an orange `IMAGE` badge and a one-line
  description of the photograph that belongs there, plus its intended crop.
- **Wordmark** — "IEC JACKSONVILLE" set in type. No logo has been invented; the
  footer says so.
- **Dead ends** — Member Login and the social icons say out loud that they are not
  wired up. The contact form intercepts submit and shows a notice; nothing is sent.

Body copy is placeholder writing in the chapter's voice, not lorem ipsum. It reads
as finished prose so the pitch shows tone and density, but no claim in it has been
verified — program figures, chapter counts and formation status all need real
numbers before any of this goes near a public site.

## Design

Navy (`#0B2340`) with a warm ember accent (`#D97919`), Archivo for display and
Source Sans 3 for text, square corners and hairline rules. Responsive down to
360px; the mobile nav and the FAQ accordion are the only JavaScript, written
inline as vanilla JS in each page.

Header and footer are duplicated across pages by design — that is the cost of
having no build step. Change one, change all ten.
