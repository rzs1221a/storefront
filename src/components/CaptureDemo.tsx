import { useState, type FormEvent } from "react";

/**
 * The capture demo — station 04, running, on the page that sells it.
 *
 * The tide gauge in the footer is the site's oldest and best idea: /capabilities
 * says "I wire up live local data", and rather than describing it, the page
 * reads the actual NOAA gauge in front of you. This applies the same rule to
 * the pillar that actually sells — lead capture — and lets the visitor fire it
 * themselves.
 *
 * Type into the form, submit, and the pane beside it prints what a real
 * serverless function actually did with it: validated, split into named
 * fields, timestamped. The elapsed figure is MEASURED, not written. The design
 * vision proposed the caption "That took 1.8 seconds", and 1.8 seconds is
 * exactly the kind of number this codebase refuses to publish — so the demo
 * reports the round trip it just made, whatever that turns out to be.
 *
 * The one thing it does not do is reach a CRM, and the caption says so
 * plainly. Same wiring, same validation, same parse — the last hop points at
 * this screen instead of at a client's BoldTrail. Overstating that by a single
 * word would make the most impressive thing on the page the least trustworthy.
 *
 * Degradation is designed, not incidental: on `npm run preview` the function
 * does not exist, and the pane says so in the same voice rather than
 * pretending. See netlify/functions/lead-echo.ts — it stores nothing and
 * forwards nothing.
 */

type Field = { label: string; value: string };
type Result = {
  ok: boolean;
  receivedAt: string;
  parseMs: number;
  fields: Field[];
  rejected: string[];
};

type State =
  | { phase: "idle" }
  | { phase: "sending" }
  | { phase: "done"; result: Result; roundTripMs: number }
  | { phase: "unavailable" };

export default function CaptureDemo() {
  const [state, setState] = useState<State>({ phase: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new URLSearchParams(
      new FormData(form) as unknown as Record<string, string>
    ).toString();

    setState({ phase: "sending" });
    const started = performance.now();
    try {
      const response = await fetch("/api/lead-echo", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!response.ok && response.status !== 400) throw new Error();
      const result = (await response.json()) as Result;
      setState({
        phase: "done",
        result,
        roundTripMs: Math.round(performance.now() - started),
      });
    } catch {
      /* The function is not deployed — a local preview, or a failed deploy.
         Saying so is the honest behaviour and costs nothing; faking a
         successful parse on the page that sells honest engineering would be
         the single most expensive lie on this site. */
      setState({ phase: "unavailable" });
    }
  }

  return (
    <div className="capture">
      <form className="capture-form" onSubmit={handleSubmit}>
        <p className="mono-label">A real submission — try it</p>

        <div className="capture-fields">
          <label>
            <span className="mono-label">Name</span>
            <input name="name" defaultValue="A. Marsh" required className="field" />
          </label>
          <label>
            <span className="mono-label">Email</span>
            <input
              name="email"
              type="email"
              defaultValue="a.marsh@example.com"
              className="field"
            />
          </label>
          <label>
            <span className="mono-label">Intent</span>
            <select name="intent" defaultValue="Selling" className="field">
              <option>Selling</option>
              <option>Buying</option>
              <option>Both</option>
            </select>
          </label>
          <label>
            <span className="mono-label">Timeline</span>
            <select name="timeline" defaultValue="90 days" className="field">
              <option>30 days</option>
              <option>90 days</option>
              <option>Just looking</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mono-label">Notes</span>
          <textarea
            name="message"
            rows={2}
            defaultValue="Three bed near the beach, want to know what mine is worth."
            className="field resize-y"
          />
        </label>

        <button
          type="submit"
          disabled={state.phase === "sending"}
          className="btn btn-primary btn-sm mt-4 disabled:opacity-60"
        >
          {state.phase === "sending" ? "Sending…" : "Fire it"}
        </button>

        <p className="capture-privacy">
          Nothing here is stored, mailed, or forwarded anywhere. The function
          parses what you send and hands it straight back to your browser.
        </p>
      </form>

      {/* The pane. A terminal, because this is an instrument reading and not
          a success message — the whole point is watching the parse happen. */}
      <div className="capture-pane" aria-live="polite">
        <div className="capture-pane-bar">
          <span className="mono-label">/api/lead-echo</span>
          <span className="capture-chip">DEMO TARGET</span>
        </div>

        <pre className="capture-out reading">
          {state.phase === "idle" &&
            "> waiting for a submission\n\n  Fill the form and press Fire it. What\n  prints here is what the function\n  actually returned."}

          {state.phase === "sending" && "> posting…"}

          {state.phase === "unavailable" &&
            "> no function at this origin\n\n  This is a local preview or a build\n  without functions deployed. Nothing is\n  faked here, so nothing prints."}

          {state.phase === "done" && (
            <>
              {`> parse  storefront-capture-demo\n`}
              {state.result.fields.map((f) => (
                <span key={f.label} className="capture-field">
                  {`  ${f.label.padEnd(9)}${f.value}\n`}
                </span>
              ))}
              {state.result.rejected.map((r) => (
                <span key={r} className="capture-reject">{`  ✗ ${r}\n`}</span>
              ))}
              {`\n  received  ${state.result.receivedAt}\n`}
              {`  parse     ${state.result.parseMs} ms\n`}
              {`  round trip ${state.roundTripMs} ms\n\n`}
              <span className={state.result.ok ? "capture-ok" : "capture-reject"}>
                {state.result.ok
                  ? "✓ record ready for ingest"
                  : "✗ rejected before ingest"}
              </span>
            </>
          )}
        </pre>
      </div>

      <p className="capture-caption">
        {state.phase === "done" ? (
          <>
            That round trip took{" "}
            <strong className="reading">{state.roundTripMs} ms</strong> — measured,
            not claimed.{" "}
          </>
        ) : null}
        It is the same wiring every client gets: validated, split into named
        fields, timestamped, ready for ingest. The only difference is the last
        hop. On a client site that record posts into their BoldTrail Lead
        Dropbox; here it posts nowhere and comes straight back to this screen.
      </p>
    </div>
  );
}
