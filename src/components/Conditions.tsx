import { useEffect, useState } from "react";
import { getSky } from "../lib/sky";

/**
 * The live conditions line — the chart's instrument cluster.
 *
 * "It is 9:57 pm on the coast — golden hour. The tide at Fernandina Beach is
 * 5.9 feet and falling, high water at 4:12 pm — observed." Real NOAA gauge,
 * real NWS forecast, real solar geometry, and the instruments keep reading:
 * the tide refreshes every six minutes, the forecast every fifteen, the clock
 * and light every thirty seconds. A living page whose live data froze at page
 * load stopped being live a minute in.
 *
 * The word after the tide is the honesty signal: "observed" means the
 * Fernandina gauge itself, "predicted" means NOAA's tables, "modeled" means
 * our fallback curve. A page built on proving rather than claiming should say
 * which one it is.
 *
 * Silence is a required behaviour, not a fallback. On a local preview the
 * Netlify Functions do not exist, and on a failed deploy they return 404 — in
 * both cases this renders nothing at all. A sales page must never show a
 * spinner that never resolves or an error where a flourish was meant to be.
 */

interface Tide {
  heightFt: number;
  direction: "rising" | "falling";
  next: { type: "high" | "low"; time: string } | null;
  source: "observed" | "predicted" | "modeled";
}

interface Weather {
  windSpeed: string | null;
  windDirection: string | null;
  temperature: number | null;
  shortForecast: string | null;
  source: "nws" | "unavailable";
}

const TIDE_MS = 6 * 60_000;
const WEATHER_MS = 15 * 60_000;
const CLOCK_MS = 30_000;

/** Island-local clock. The light phrase comes from real solar geometry. */
function islandTime(now: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(now)
    .toLowerCase();
}

/** "2 h 14 m" — the golden-hour countdown, in instrument shorthand. */
function goldenCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${m} m` : `${m} m`;
}

export default function Conditions({
  className = "",
  compact = false,
}: {
  className?: string;
  /** Phone top bar: the tide only, since there is no room for the sentence. */
  compact?: boolean;
}) {
  const [tide, setTide] = useState<Tide | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;

    // Both are independent: a tide reading is worth showing without wind, and
    // the reverse. Neither failure blocks the other.
    const load = async <T,>(url: string, set: (v: T) => void) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as T;
        if (!cancelled) set(data);
      } catch {
        /* Silence is the designed outcome. */
      }
    };

    const pullTide = () => void load<Tide>("/api/tide", setTide);
    const pullWeather = () => void load<Weather>("/api/conditions", setWeather);

    pullTide();
    pullWeather();
    const tideTimer = window.setInterval(pullTide, TIDE_MS);
    const weatherTimer = window.setInterval(pullWeather, WEATHER_MS);
    const clockTimer = window.setInterval(() => setNow(new Date()), CLOCK_MS);

    return () => {
      cancelled = true;
      window.clearInterval(tideTimer);
      window.clearInterval(weatherTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  // Nothing real to say yet — render nothing, and reserve no space.
  if (!tide && !weather) return null;

  const time = islandTime(now);
  const sky = getSky(now);

  if (compact) {
    return (
      <p className={`flex items-center gap-2 ${className}`}>
        <span className="live-dot" />
        <span className="font-mono text-micro uppercase tracking-[0.1em] text-(--color-ink-muted)">
          {time}
          {tide && ` · ${tide.heightFt.toFixed(1)}ft ${tide.direction}`}
          {tide?.source === "observed" && " · obs"}
        </span>
      </p>
    );
  }

  const showGolden =
    sky.minutesToGolden !== null &&
    sky.minutesToGolden > 0 &&
    sky.minutesToGolden <= 720;

  return (
    <div className={className}>
      <p className="text-body-sm leading-relaxed text-(--color-ink-soft)">
        <span className="live-dot mr-2 inline-block align-middle" />
        It is {time} on the coast — {sky.label}.
        {tide && (
          <>
            {" "}
            The tide at Fernandina Beach is{" "}
            <span className="text-(--color-ink)">
              {tide.heightFt.toFixed(1)} feet and {tide.direction}
            </span>
            {tide.next && (
              <>
                , {tide.next.type} water at {tide.next.time}
              </>
            )}{" "}
            — {tide.source}.
          </>
        )}
        {weather?.source === "nws" &&
          (weather.windSpeed || weather.shortForecast) && (
            <>
              {" "}
              {weather.windSpeed
                ? `Wind ${weather.windDirection ? `${weather.windDirection} ` : ""}${weather.windSpeed}`
                : "Currently"}
              {weather.shortForecast
                ? `${weather.windSpeed ? "," : ""} ${weather.shortForecast.toLowerCase()}`
                : ""}
              .
            </>
          )}
      </p>
      {showGolden && (
        <p className="conditions-golden mt-1.5">
          Golden hour in {goldenCountdown(sky.minutesToGolden!)}
        </p>
      )}
    </div>
  );
}
