/**
 * The local pack, annotated.
 *
 * Every realtor has stared at this interface a thousand times. Almost none of
 * them know which parts of it are LEVERS — things a person can change on
 * purpose — and which are just output. That gap is the entire reason the
 * "found" station of the passage feels like luck to the people it happens to.
 *
 * So this is a diagram, not a screenshot: a faithful mock of a local pack
 * result with each element numbered and explained underneath. Labelling it is
 * a small masterclass on its own, and it makes the suspension-risk
 * conversation visual — an agent can see that the category and the hours are
 * fields somebody has to be responsible for, rather than facts about them.
 *
 * ── Why it is a drawing and not a capture ────────────────────────────────
 *
 * A real screenshot of a real local pack would show real competing businesses
 * on this coast, ranked, on a page selling them a way to outrank each other.
 * That is not a diagram, it is a comparison nobody consented to. So every row
 * is fictional, the top card is the reader's own hypothetical, and the panel
 * says MOCK in plain sight. The site does not present concepts as shipped work
 * and it does not present drawings as evidence.
 */

interface Annotation {
  n: number;
  what: string;
  lever: string;
}

const ANNOTATIONS: Annotation[] = [
  {
    n: 1,
    what: "Primary category",
    lever:
      "A field, not a description. It decides which searches you are eligible for at all, and one wrong choice quietly removes you from the ones that matter.",
  },
  {
    n: 2,
    what: "Rating and review count",
    lever:
      "Volume and recency both count. Five reviews from four years ago reads as a business that stopped, and the count is compared against whoever else is in the pack — not against a threshold.",
  },
  {
    n: 3,
    what: "Review recency and replies",
    lever:
      "Every review answered, in your voice. An unanswered run of reviews is the single most visible sign that nobody is attending the profile.",
  },
  {
    n: 4,
    what: "Hours, and whether they are true",
    lever:
      "Wrong hours are worse than no hours: they produce a closed door, and closed doors produce the one-star reviews that cost you the pack.",
  },
  {
    n: 5,
    what: "The link out",
    lever:
      "This is where station 02 hands off to station 03. It should reach a page you own, built for that intent — not a brokerage profile you cannot change.",
  },
];

export default function LocalPack() {
  return (
    <figure className="localpack">
      <div className="localpack-frame">
        <p className="localpack-tag">
          <span className="mono-label">Mock</span>
          A drawing of the interface, not a live result. Every row below is
          fictional.
        </p>

        {/* Position 1 — the reader's own hypothetical profile. */}
        <div className="localpack-row is-mine">
          <span className="localpack-rank reading">1</span>
          <div className="localpack-body">
            <p className="localpack-name">Your name here</p>
            <p className="localpack-line">
              <span className="localpack-stars" aria-hidden="true">
                ★★★★★
              </span>
              <span className="reading">4.9</span>
              <Marker n={2} />
              <span className="localpack-meta">(87)</span>
              <span className="localpack-dot" aria-hidden="true">
                ·
              </span>
              <span className="localpack-meta">Real estate agency</span>
              <Marker n={1} />
            </p>
            <p className="localpack-line">
              <span className="localpack-open">Open</span>
              <span className="localpack-meta">· Closes 6 PM</span>
              <Marker n={4} />
            </p>
            <p className="localpack-line localpack-quote">
              “Answered every question before I asked it.” — 2 weeks ago
              <Marker n={3} />
            </p>
            <p className="localpack-actions">
              <span className="localpack-btn">Website</span>
              <Marker n={5} />
              <span className="localpack-btn">Directions</span>
            </p>
          </div>
        </div>

        {/* Two fictional competitors, deliberately featureless. Naming real
            ones would turn a diagram into a comparison nobody agreed to. */}
        {[2, 3].map((rank) => (
          <div key={rank} className="localpack-row">
            <span className="localpack-rank reading">{rank}</span>
            <div className="localpack-body">
              <p className="localpack-name is-blank">————— —————</p>
              <p className="localpack-line">
                <span className="localpack-stars" aria-hidden="true">
                  ★★★★☆
                </span>
                <span className="localpack-meta">Real estate agency</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <figcaption>
        <p className="mono-label">What each part actually is</p>
        <ol className="localpack-key">
          {ANNOTATIONS.map((a) => (
            <li key={a.n}>
              <span className="localpack-key-n reading">{a.n}</span>
              <span>
                <strong>{a.what}.</strong> {a.lever}
              </span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

function Marker({ n }: { n: number }) {
  return (
    <span className="localpack-marker reading" aria-hidden="true">
      {n}
    </span>
  );
}
