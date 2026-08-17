import { Link } from "react-router-dom";
import Page from "../components/Page";
import Conditions from "../components/Conditions";
import CaptureDemo from "../components/CaptureDemo";
import LocalPack from "../components/LocalPack";
import { CAPABILITIES } from "../lib/capabilities";

/**
 * The capability showcase — the demo floor.
 *
 * The novelty on this site is not decoration and should not be filed under
 * "about us" — it is the product demo. The map behind this sheet is a running
 * instance of the same engine an agent would be buying, and the tide line
 * below is a live NOAA gauge reading, fetched when this page loaded.
 *
 * So every capability is framed twice: what it is, and why it earns money.
 * A feature list persuades developers. "Your listing pages will still be
 * indexed when the JavaScript fails" persuades the person paying.
 *
 * ── Why capture leads the page now ───────────────────────────────────────
 *
 * The map and the tide gauge are the most impressive things here and they used
 * to open the page. They are also not what anybody buys. An agent buys the
 * last station of the passage — the record arriving in the CRM they already
 * open every morning — and that was previously a paragraph two-thirds of the
 * way down, in a list, described rather than shown.
 *
 * So the demo floor is rearranged around the passage: capture first, because
 * it is the pillar that sells, and the visitor can fire it themselves. The
 * tide gauge and the map keep their panel directly underneath, which is where
 * they belong — the thing that makes the work memorable, sitting under the
 * thing that makes it worth paying for.
 *
 * The capability list itself lives in lib/capabilities.ts so the prerendered
 * body and this one cannot drift.
 */

export default function Capabilities() {
  return (
    <Page wide shortWindow eyebrow="Capabilities demo" title="Things a template cannot do for you">
      <p className="lede">
        Not a longer feature list — a different category of thing. Nothing on
        this page is described where it could be demonstrated: the first thing
        below is a real submission you can fire yourself, and it prints what a
        real serverless function did with it.
      </p>

      {/* ── Station 04, running, on the page that sells it ──────────── */}
      <section className="showcase mt-8">
        <p className="eyebrow">Station 04 — Captured. Live, on this page</p>
        <h2 className="showcase-title">Fire a lead through the wiring</h2>
        <p className="showcase-body">
          Every platform says it captures leads. This is what capture actually
          is: a submission validated before it goes anywhere, split into named
          fields, timestamped, and handed on as a record rather than an email
          somebody has to read. Change the values, press the button, and watch
          the parse.
        </p>

        <div className="mt-6">
          <CaptureDemo />
        </div>
      </section>

      {/* ── Station 02, drawn ──────────────────────────────────────── */}
      <section className="showcase mt-12">
        <p className="eyebrow">Station 02 — Found</p>
        <h2 className="showcase-title">The five levers in the local pack</h2>
        <p className="showcase-body">
          This is the interface that decides whether a search on this coast ever
          reaches you, and most of it is fields somebody has to be responsible
          for rather than facts about your business. Here is which parts move.
        </p>

        <div className="mt-6">
          <LocalPack />
        </div>
      </section>

      {/* The showcase: the live engine, pointed at rather than described. */}
      <section className="showcase mt-12">
        <p className="eyebrow">Live, on this page</p>
        <h2 className="showcase-title">Real-time API integration engine</h2>
        <p className="showcase-body">
          Live maps, marine tide gauges, and dynamic data feeds, built into
          client sites. Not a widget embed — direct integrations against NOAA
          and the National Weather Service through serverless functions, with
          the failure case designed rather than left to chance.
        </p>

        <div className="showcase-panels">
          <div className="showcase-panel">
            <p className="mono-label">Feed 01 — NOAA + NWS</p>
            {/*
              The instrument itself, not a screenshot of one. This reads the
              Fernandina Beach gauge and the NWS forecast on load. On a local
              preview the functions do not exist and it renders nothing at
              all — which is the designed behaviour, and the honest one.
            */}
            <Conditions className="mt-3" />
            <p className="showcase-note">
              Tide height, direction, next high or low water, wind and
              conditions. Cached at the edge so the gauge is never hammered.
            </p>
          </div>

          <div className="showcase-panel">
            <p className="mono-label">Feed 02 — the map behind this panel</p>
            <p className="showcase-body mt-3">
              Esri World Imagery draped over the real coast, with OpenStreetMap
              building footprints extruding at street level and the star field
              projected from a real catalogue for this latitude. Both tile
              sources are key-free, so there is no per-request bill to inherit.
            </p>
            <p className="showcase-note">
              Close this panel and fly it. Every marker is a site I shipped.
            </p>
          </div>
        </div>
      </section>

      <ul className="mt-10 space-y-px overflow-hidden rounded-xl border border-(--line) bg-(--line)">
        {CAPABILITIES.map((cap) => (
          <li key={cap.title} className="group bg-white/[0.02] p-5">
            <h3 className="text-[1.0625rem] font-medium tracking-[-0.004em]">
              {cap.title}
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
              {cap.body}
            </p>
            <p className="cap-matters">
              <span className="mono-label">Why it matters</span>
              {cap.matters}
            </p>
            <p className="mono-label mt-4 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px w-4 bg-(--color-signal) transition-all duration-500 group-hover:w-7"
              />
              {cap.proofPath ? (
                <Link to={cap.proofPath} className="hover:text-(--color-ink)">
                  {cap.proof} →
                </Link>
              ) : (
                cap.proof
              )}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-(--line) pt-6">
        <Link to="/packages" className="btn btn-primary btn-sm">
          View packages
        </Link>
        <Link to="/contact" className="btn btn-ghost btn-sm">
          Schedule a consultation
        </Link>
      </div>
    </Page>
  );
}
