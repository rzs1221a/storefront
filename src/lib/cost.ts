/**
 * The cost of the alternative — the homepage's one wound.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE EDITING A NUMBER.
 *
 * `offer.ts` carries a deliberate rule: COMPARISON describes market *patterns*
 * rather than naming competitors with specific dollar figures, because
 * publishing a named per-vendor price means standing behind a number that can
 * change without notice. This file is the owner's explicit, considered
 * exception to that rule — not an oversight, and not a licence to relax it
 * elsewhere. COMPARISON stays pattern-only.
 *
 * The exception is survivable only because of the shape below. Every figure
 * carries the party it came from, what exactly it measures, and the date it
 * was last verified — and every one of those renders on the page, in mono, at
 * the size of an instrument reading rather than a footnote nobody meant to be
 * read. A figure whose `checked` date has gone stale is a figure that is
 * quietly making a claim on the studio's behalf, so:
 *
 *   Re-verify these at each source before any release that touches this file,
 *   and move `checked` forward when you do. If a source can no longer be
 *   confirmed, delete the tile. Do not leave it up with an old date.
 *
 * `assumption` exists for the third tile, which is arithmetic rather than a
 * published figure. The commission rate in it is an ASSUMPTION, it is stated
 * as one on the page, and it must never be presented as a market fact.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * The band these render into is the only place on the site where the lead
 * accent outweighs the chrome. That is the point of it: it is the picture of
 * value flowing the wrong way — out of the agent, toward somebody else.
 */

export interface CostFigure {
  /** The figure itself, already formatted. Rendered large, in mono, in amber. */
  figure: string;
  /** What the figure is, in one line under it. */
  label: string;
  /** The sentence that makes it mean something to an agent. */
  detail: string;
  /** Who publishes it, and what precisely it measures. */
  source: string;
  /** ISO date this was last verified at that source. Rendered on the page. */
  checked: string;
  /** Set only where the figure is derived rather than published. */
  assumption?: string;
}

export const COST_OF_THE_ALTERNATIVE: CostFigure[] = [
  {
    figure: "40%",
    label: "of the commission, on a referred seller",
    detail:
      "The referral fee on a seller connection the portal originates for you. You do the listing appointment, the photography, the negotiation and the close — and four in every ten dollars of that side goes back up the pipe.",
    source:
      "Zillow Group, published Flex referral-fee terms for seller connections",
    checked: "2026-08-17",
  },
  {
    figure: "$223 / $139",
    label: "per connection, buyer side",
    detail:
      "What a single introduction costs in the higher and lower priced ZIP codes on this coast — paid per connection, whether or not it ever becomes a client, and repriced by the platform rather than by you.",
    source:
      "Zillow Premier Agent connection pricing, sampled for Nassau County ZIP codes",
    checked: "2026-08-17",
  },
  {
    figure: "~$5,500",
    label: "of one closing, gone",
    detail:
      "Run the referral fee against what a house here actually sells for and it stops being a percentage. That is most of a Beacon build, on one transaction, every time.",
    source:
      "Northeast Florida Association of Realtors, Nassau County median sale price of $504,500",
    checked: "2026-08-17",
    assumption:
      "Assumes a 2.75% listing side: $504,500 × 2.75% = $13,874, of which 40% is $5,549.",
  },
];

/**
 * The counter-figure. Not a fourth tile — the band is the wound, and putting
 * the answer inside it would blunt both. This renders in the ownership panel
 * below, in the chrome's own white, because it is the thing you keep.
 */
export const COST_COUNTERPOINT =
  "Nothing above is a fee I charge. It is what the route costs when somebody else owns it.";
