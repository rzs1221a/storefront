import { useEffect, useMemo, useRef, useState } from "react";
import {
  BEATS,
  DEMO_QUERY,
  LOOP_SECONDS,
  ROUTE_TALL,
  ROUTE_WIDE,
  STATIONS,
  beatProgress,
  litAt,
  type RouteGeometry,
  type StationSlug,
} from "../lib/passage";
import { prefersReducedMotion } from "../lib/renderMotion";

/**
 * The Passage — one lead's journey, drawn as a voyage on the chart.
 *
 * The rest of this site proves the studio can build extraordinary *places*.
 * This proves the thing actually being sold, which is *movement*: a stranger
 * travelling from a search box to a contact record in an agent's CRM. It plays
 * above the fold because a realtor decides whether to keep scrolling in about
 * eight seconds, and no paragraph wins that argument faster than watching the
 * system run.
 *
 * Two properties make it worth its weight:
 *
 *   It is honest by construction. Nothing here claims a number — no "+40%
 *   leads", no conversion rate, no outcome at all. It shows MECHANISM, which
 *   is exactly the line work.ts and catalog.ts already hold. A mechanism you
 *   can watch is more persuasive than a statistic you have to trust, and it is
 *   the only kind of persuasion this codebase permits.
 *
 *   It is cheap. This is NOT another GL layer — the map engine underneath is
 *   untouched and stays on its idle orbit. This is one inline SVG, one rAF
 *   loop, zero new dependencies, and it stops itself the moment it scrolls out
 *   of view. Nothing here can touch the LCP the prerender already protects.
 *
 * ── The one number everything is a function of ───────────────────────────
 *
 * `progress`, 0 → 1. Every element the scene draws is derived from it and
 * nothing else, which buys three things at once:
 *
 *   - desktop drives it with a clock (a 21-second loop)
 *   - a phone drives it with scroll position, so the route runs top-to-bottom
 *     and the visitor's own thumb walks the lead down the funnel
 *   - reduced motion sets it to 1 exactly once and never touches it again
 *
 * That last one matters. The reduced-motion rendering here is not a kill
 * switch bolted on afterward — it is the same scene at the end of its own
 * story: route complete, all four stations lit, beam held on the crossing
 * bearing as a fixed lit sector, vessel docked, terminal full. The diagram
 * version, fully legible, nothing moving. verify.mjs asserts reduced-motion
 * visibility per route, and this passes it by design rather than by exemption.
 */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Lines the CRM terminal prints as the record lands. */
const TERMINAL_LINES = [
  { key: "cmd", text: "> parse  storefront-enquiry", tone: "cmd" },
  { key: "name", text: "  name    A. Marsh", tone: "field" },
  { key: "intent", text: "  intent  sell · 90 days", tone: "field" },
  { key: "band", text: "  band    $500–600k", tone: "field" },
  { key: "done", text: "✓ contact created", tone: "ok" },
] as const;

/** Which way the beacon must be pointing to catch the vessel on open water. */
function crossingBearing(g: RouteGeometry): number {
  const [fx, fy] = g.at.found;
  const [vx, vy] = g.at.channel;
  return (Math.atan2(vy - fy, vx - fx) * 180) / Math.PI;
}

/** True while the viewport is narrow enough to want the vertical passage. */
function useTallLayout() {
  const [tall, setTall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setTall(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return tall;
}

export default function Passage() {
  const tall = useTallLayout();
  const g = tall ? ROUTE_TALL : ROUTE_WIDE;

  const rootRef = useRef<HTMLDivElement>(null);
  /* The aspect-ratio box around the SVG alone. Kept separate from the root
     because the legend below it is real content with its own height, and an
     aspect-ratio box holding both would spill the legend over whatever
     follows the hero. It is also the correct element to measure for the
     phone's scroll driver: the chart is what the visitor traverses. */
  const frameRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<SVGPathElement>(null);
  const vesselRef = useRef<SVGGElement>(null);
  const beamRef = useRef<SVGGElement>(null);
  const queryRef = useRef<SVGTextElement>(null);
  const caretRef = useRef<SVGRectElement>(null);
  const packRef = useRef<SVGGElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const wireRef = useRef<SVGPathElement>(null);
  const fieldsRef = useRef<(SVGRectElement | null)[]>([]);
  const linesRef = useRef<(SVGTextElement | null)[]>([]);
  const stationsRef = useRef<Partial<Record<StationSlug, SVGGElement | null>>>(
    {},
  );

  /* Where the `landed` station falls along the course line, as a fraction of
     total length. Measured rather than authored: the station coordinates and
     the path are edited together, and a hand-kept constant would be one more
     thing that silently drifts. */
  const landedAt = useRef(0.62);

  const beamPath = useMemo(() => {
    const [fx, fy] = g.at.found;
    const r = g.beamReach;
    const half = (9 * Math.PI) / 180;
    const dx = r * Math.cos(half);
    const dy = r * Math.sin(half);
    return `M ${fx} ${fy} L ${fx + dx} ${fy - dy} A ${r} ${r} 0 0 1 ${fx + dx} ${fy + dy} Z`;
  }, [g]);

  const bearing = useMemo(() => crossingBearing(g), [g]);

  useEffect(() => {
    const root = rootRef.current;
    const run = runRef.current;
    if (!root || !run) return;

    const total = run.getTotalLength();
    run.style.strokeDasharray = String(total);

    /* Find the length fraction closest to the landed marker — a coarse scan is
       plenty at this scale, and it runs once per layout change. */
    {
      const [lx, ly] = g.at.landed;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i <= 240; i++) {
        const p = run.getPointAtLength((total * i) / 240);
        const dist = (p.x - lx) ** 2 + (p.y - ly) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          best = i / 240;
        }
      }
      landedAt.current = best;
    }

    /** The whole scene, as a pure function of one number. */
    function draw(progress: number) {
      const dock = landedAt.current;

      /* ── The vessel, and the course drawn behind it ───────────────── */
      const sailing = beatProgress(progress, BEATS.run);
      const travelled = progress < BEATS.run.from ? 0 : dock * sailing;
      const along = total * travelled;

      if (vesselRef.current) {
        const p = run!.getPointAtLength(along);
        /* Heading from a one-unit chord. Before the light finds them the
           vessel is adrift and points nowhere in particular; the turn toward
           the light is the whole beat, so it is drawn, not assumed. */
        const ahead = run!.getPointAtLength(Math.min(total, along + 1.5));
        const heading =
          (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
        const turn = beatProgress(progress, BEATS.sweep);
        const adrift = heading - 46;
        const angle = adrift + (heading - adrift) * turn;
        const appear = beatProgress(progress, BEATS.query);
        vesselRef.current.setAttribute(
          "transform",
          `translate(${p.x} ${p.y}) rotate(${angle}) scale(${0.6 + 0.4 * appear})`,
        );
        vesselRef.current.style.opacity = String(appear);
      }

      run!.style.strokeDashoffset = String(total * (1 - travelled));

      /* ── The light finds them ─────────────────────────────────────── */
      if (beamRef.current) {
        const sweep =
          progress < BEATS.sweep.from ? 0 : beatProgress(progress, BEATS.sweep);
        /* Rotates through the crossing bearing rather than stopping on it:
           a light that parks on its target is a spotlight, and a spotlight is
           a promise this studio has not made. It sweeps, it catches, it
           carries on — which is what being findable actually looks like. */
        const from = bearing - 130;
        const to = bearing + 46;
        const angle = from + (to - from) * sweep;
        const [fx, fy] = g.at.found;
        beamRef.current.setAttribute(
          "transform",
          `rotate(${angle} ${fx} ${fy})`,
        );
        beamRef.current.style.opacity = String(
          progress < BEATS.sweep.from
            ? 0
            : progress > BEATS.hold.from
              ? 0.5
              : 0.85,
        );
      }

      /* ── The query types itself ───────────────────────────────────── */
      if (queryRef.current) {
        const typed = beatProgress(progress, BEATS.query);
        const chars = Math.round(DEMO_QUERY.length * typed);
        const text = DEMO_QUERY.slice(0, chars);
        if (queryRef.current.textContent !== text) {
          queryRef.current.textContent = text;
        }
        if (caretRef.current) {
          const width = chars ? queryRef.current.getComputedTextLength() : 0;
          caretRef.current.setAttribute(
            "x",
            String(Number(queryRef.current.getAttribute("x")) + width + 2),
          );
          caretRef.current.style.opacity = typed < 1 ? "1" : "0.35";
        }
      }

      /* ── The local pack lands ─────────────────────────────────────── */
      if (packRef.current) {
        /* The pack materializes when the beam actually crosses the vessel,
           not when the beat starts — the causality is the argument. */
        const sweep = beatProgress(progress, BEATS.sweep);
        const crossed = clamp01((sweep - 0.72) / 0.28);
        packRef.current.style.opacity = String(crossed);
        packRef.current.setAttribute(
          "transform",
          `translate(0 ${(1 - crossed) * -14})`,
        );
      }

      /* ── The form fills ───────────────────────────────────────────── */
      const filling = beatProgress(progress, BEATS.capture);
      fieldsRef.current.forEach((field, i) => {
        if (!field) return;
        const step = clamp01((filling - i * 0.14) / 0.3);
        field.style.transform = `scaleX(${step})`;
        field.style.opacity = String(step ? 1 : 0);
      });

      /* ── The record travels off-chart into the CRM ────────────────── */
      if (pulseRef.current) {
        const sending = clamp01((filling - 0.35) / 0.4);
        const p = run!.getPointAtLength(total * (dock + (1 - dock) * sending));
        pulseRef.current.setAttribute("cx", String(p.x));
        pulseRef.current.setAttribute("cy", String(p.y));
        pulseRef.current.style.opacity = String(
          sending > 0 && sending < 1 ? 1 : sending >= 1 ? 0 : 0,
        );
      }
      if (wireRef.current) {
        const sending = clamp01((filling - 0.6) / 0.4);
        wireRef.current.style.opacity = String(sending);
      }

      linesRef.current.forEach((line, i) => {
        if (!line) return;
        line.style.opacity = String(
          clamp01((filling - 0.62 - i * 0.07) / 0.08),
        );
      });

      /* ── Station lamps ────────────────────────────────────────────── */
      const lit = new Set(litAt(progress));
      for (const station of STATIONS) {
        const node = stationsRef.current[station.slug];
        if (node) node.dataset.lit = String(lit.has(station.slug));
      }
    }

    /* Reduced motion: draw the finished story once, then leave. No loop is
       ever started, no listener is ever attached. */
    if (prefersReducedMotion()) {
      root.dataset.static = "true";
      draw(1);
      return;
    }
    root.dataset.static = "false";

    /* ── Phone: the visitor's own scroll is the driver ──────────────── */
    if (tall) {
      let queued = false;
      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          const rect = (frameRef.current ?? root).getBoundingClientRect();
          const vh = window.innerHeight;
          draw(clamp01((vh - rect.top) / (vh + rect.height)));
        });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    /* ── Desktop: a clock, and only while anyone is watching ────────── */
    let frame = 0;
    let start = performance.now();
    let playing = false;

    const tick = (now: number) => {
      draw(((now - start) / 1000 / LOOP_SECONDS) % 1);
      frame = requestAnimationFrame(tick);
    };

    const play = () => {
      if (playing) return;
      playing = true;
      start = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const pause = () => {
      if (!playing) return;
      playing = false;
      cancelAnimationFrame(frame);
    };

    /* One performer per viewport, and none at all off it: a hero animating to
       an empty room is pure battery cost. */
    let onScreen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) play();
        else pause();
      },
      { threshold: 0.08 },
    );
    observer.observe(root);

    /* A backgrounded tab is an empty room too. Resuming has to consult the
       observer's own state rather than re-deriving it — coming back to a tab
       scrolled well past the hero should not restart the loop. */
    const onVisibility = () => {
      if (document.hidden) pause();
      else if (onScreen) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    draw(0);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      pause();
    };
  }, [g, tall, bearing]);

  const p = g.panel;

  return (
    <div className="passage" ref={rootRef} data-tall={tall}>
      <div className="passage-frame" ref={frameRef}>
        <svg
          className="passage-chart"
          viewBox={g.viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="A chart showing one lead's route: a search on open water, a beacon sweep that puts the agent in the local pack, a course line down to the agent's own page, and the finished contact record landing in BoldTrail."
        >
          <defs>
            <linearGradient id="passage-beam" x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="0%"
                stopColor="var(--color-signal)"
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor="var(--color-signal)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* The beam, under everything: it is light on water, not an object. */}
          <g ref={beamRef} className="passage-beam">
            <path d={beamPath} fill="url(#passage-beam)" />
          </g>

          {/* The passage plan, drawn ahead of the vessel exactly as a real one
            is — then the solid course drawn in behind it as it runs. */}
          <path className="passage-plan" d={g.d} />
          <path ref={runRef} className="passage-run" d={g.d} />

          {/* ── 01 · Open water: the search ──────────────────────────── */}
          <g className="passage-panel">
            <rect
              x={p.search.x}
              y={p.search.y}
              width={p.search.w}
              height={p.search.h}
              rx="8"
            />
            <text
              className="passage-cap"
              x={p.search.x + 14}
              y={p.search.y + 22}
            >
              SEARCH
            </text>
            <rect
              className="passage-field"
              x={p.search.x + 14}
              y={p.search.y + 32}
              width={p.search.w - 28}
              height={28}
              rx="5"
            />
            <text
              ref={queryRef}
              className="passage-mono"
              x={p.search.x + 24}
              y={p.search.y + 51}
              fontSize="13"
            />
            <rect
              ref={caretRef}
              className="passage-caret"
              x={p.search.x + 24}
              y={p.search.y + 39}
              width="1.5"
              height="15"
            />
          </g>

          {/* ── 02 · Found: the local pack ───────────────────────────── */}
          <g ref={packRef} className="passage-panel is-pack">
            <rect
              x={p.pack.x}
              y={p.pack.y}
              width={p.pack.w}
              height={p.pack.h}
              rx="8"
            />
            <text className="passage-cap" x={p.pack.x + 14} y={p.pack.y + 22}>
              LOCAL PACK
            </text>
            {[0, 1, 2].map((row) => {
              const y = p.pack.y + 32 + row * 26;
              const mine = row === 0;
              return (
                <g
                  key={row}
                  className={
                    mine ? "passage-pack-row is-mine" : "passage-pack-row"
                  }
                >
                  <rect
                    x={p.pack.x + 12}
                    y={y}
                    width={p.pack.w - 24}
                    height={22}
                    rx="4"
                  />
                  <text
                    className="passage-mono"
                    x={p.pack.x + 22}
                    y={y + 15}
                    fontSize="11"
                  >
                    {mine
                      ? `${row + 1}  Your profile  ★★★★★`
                      : `${row + 1}  ————————`}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ── 03 · Landed: the agent's own page, as a lit pier ──────── */}
          <g className="passage-panel">
            <rect
              x={p.pier.x}
              y={p.pier.y}
              width={p.pier.w}
              height={p.pier.h}
              rx="8"
            />
            <text className="passage-cap" x={p.pier.x + 14} y={p.pier.y + 22}>
              YOUR PAGE
            </text>
            <rect
              className="passage-block"
              x={p.pier.x + 12}
              y={p.pier.y + 30}
              width={p.pier.w - 24}
              height={26}
              rx="4"
            />
            {[0, 1, 2].map((i) => {
              const y = p.pier.y + 64 + i * 15;
              return (
                <g key={i}>
                  <rect
                    className="passage-slot"
                    x={p.pier.x + 12}
                    y={y}
                    width={p.pier.w - 24}
                    height={10}
                    rx="3"
                  />
                  <rect
                    ref={(node) => {
                      fieldsRef.current[i] = node;
                    }}
                    className="passage-fill"
                    x={p.pier.x + 12}
                    y={y}
                    width={p.pier.w - 24}
                    height={10}
                    rx="3"
                    style={{ transformOrigin: `${p.pier.x + 12}px ${y}px` }}
                  />
                </g>
              );
            })}
          </g>

          {/* ── 04 · Captured: the record lands in the CRM ───────────── */}
          <path
            ref={wireRef}
            className="passage-wire"
            d={`M ${g.at.captured[0]} ${g.at.captured[1]} L ${
              tall ? p.terminal.x : g.at.captured[0]
            } ${p.terminal.y}`}
          />
          <g className="passage-panel is-terminal">
            <rect
              x={p.terminal.x}
              y={p.terminal.y}
              width={p.terminal.w}
              height={p.terminal.h}
              rx="8"
            />
            <text
              className="passage-cap"
              x={p.terminal.x + 14}
              y={p.terminal.y + 22}
            >
              BOLDTRAIL
            </text>
            {/* Every fabricated record on this site says so. The rest of the
              storefront refuses to show a mockup as if it were shipped work;
              a demo terminal is held to the same rule. */}
            <g className="passage-chip">
              <rect
                x={p.terminal.x + p.terminal.w - 62}
                y={p.terminal.y + 10}
                width={48}
                height={15}
                rx="3"
              />
              <text
                x={p.terminal.x + p.terminal.w - 38}
                y={p.terminal.y + 21}
                textAnchor="middle"
              >
                SAMPLE
              </text>
            </g>
            {TERMINAL_LINES.map((line, i) => (
              <text
                key={line.key}
                ref={(node) => {
                  linesRef.current[i] = node;
                }}
                className={`passage-mono is-${line.tone}`}
                x={p.terminal.x + 14}
                y={p.terminal.y + 46 + i * 17}
                fontSize="11.5"
              >
                {line.text}
              </text>
            ))}
          </g>

          {/* The record itself, in transit. */}
          <circle
            ref={pulseRef}
            className="passage-pulse"
            r="5"
            cx="0"
            cy="0"
          />

          {/* ── The four stations ────────────────────────────────────── */}
          {STATIONS.map((station, i) => {
            const [x, y] = g.at[station.slug];
            const l = g.label[station.slug];
            return (
              <g
                key={station.slug}
                className="passage-station"
                data-lit="false"
                ref={(node) => {
                  stationsRef.current[station.slug] = node;
                }}
              >
                <circle className="passage-station-halo" cx={x} cy={y} r="16" />
                <circle
                  className="passage-station-ring"
                  cx={x}
                  cy={y}
                  r="8.5"
                />
                <circle
                  className="passage-station-core"
                  cx={x}
                  cy={y}
                  r="3.5"
                />
                <text
                  className="passage-station-name"
                  x={x + l.dx}
                  y={y + l.dy}
                  textAnchor={l.anchor}
                >
                  {String(i + 1).padStart(2, "0")} {station.name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* The lead. The only amber object on the chart, because it is the
            only thing on the chart that is value in motion. */}
          <g ref={vesselRef} className="passage-vessel">
            <path d="M 19 0 L -11 10.5 L -5 0 L -11 -10.5 Z" />
          </g>
        </svg>
      </div>

      {/* The vocabulary, in words. Crawlable, screen-reader-legible, and the
          fallback rendering if the SVG never paints — the four stations are
          the argument, and the argument must not depend on a graphic. */}
      <ol className="passage-legend">
        {STATIONS.map((station, i) => (
          <li key={station.slug}>
            <span className="passage-legend-index reading">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="passage-legend-name">{station.name}</span>
            <span className="passage-legend-role">{station.role}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
