import { STATIONS, type Coverage } from "../lib/passage";

/**
 * The passage in miniature — how much of the route this thing buys.
 *
 * The Passage hero teaches four words in its first loop. This spends them.
 * A buyer comparing two build sizes is no longer parsing two bullet lists to
 * find the delta; they are looking at two diagrams and counting lit stations.
 * That is the entire argument of the /packages page rendered as a picture, and
 * it is why the diagram sits ABOVE the deliverables on every card rather than
 * summarising them at the bottom.
 *
 * Lit versus hollow-and-dashed is not a new convention invented for this
 * component. It is the one the map has drawn since the beginning — a shipped
 * mark carries a light, an unbuilt one does not — applied to a station instead
 * of a project. A hollow station is a leg of the route this purchase does not
 * cover, and it says so rather than being quietly omitted.
 *
 * ── The honesty constraint ───────────────────────────────────────────────
 *
 * A lit station is a claim. `TIER_COVERAGE` in lib/passage.ts is the only
 * place those claims live, and every note in it has to be defensible against
 * that tier's own `deliverables` in offer.ts. Lighting a station a build does
 * not actually deliver would be precisely the dishonesty that work.ts,
 * catalog.ts, and the prerender's invariants exist to prevent — and it would
 * be worse than a bad sentence, because a diagram is read as a fact.
 *
 * The notes are what keep Daymark and Beacon from drawing identically. Both
 * light the same three stations; they light them at different scale, and the
 * note says which rather than leaving the reader to infer it.
 */
export default function PassageDiagram({
  coverage,
  /** Names what is being measured, e.g. "Daymark covers". */
  caption,
  /** Drop the per-station notes where there is no room for them. */
  compact = false,
}: {
  coverage: Coverage;
  caption?: string;
  compact?: boolean;
}) {
  const covered = STATIONS.filter((s) => coverage[s.slug]);

  return (
    <figure className={`mini-passage${compact ? " is-compact" : ""}`}>
      {caption && (
        <figcaption className="mini-passage-caption mono-label">
          {caption} {covered.length} of {STATIONS.length} stations
        </figcaption>
      )}

      <ol className="mini-passage-route">
        {STATIONS.map((station) => {
          const note = coverage[station.slug];
          return (
            <li key={station.slug} data-lit={String(Boolean(note))}>
              <span className="mini-passage-mark" aria-hidden="true" />
              <span className="mini-passage-name">{station.name}</span>
              {!compact && (
                <span className="mini-passage-note">
                  {/* An uncovered station is stated, not hidden. A reader who
                      cannot see what they are NOT buying has not been told
                      the price of anything. */}
                  {note ?? "Not covered"}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
