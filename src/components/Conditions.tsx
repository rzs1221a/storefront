import { useEffect, useState } from "react";

/**
 * The live conditions line.
 *
 * "It is 9:57 pm on the coast. The tide at Fernandina Beach is 5.9 feet and
 * falling." Real NOAA gauge, real NWS forecast, read at page load.
 *
 * This is the one piece of the page that proves rather than claims. The
 * capabilities section says I wire up live local data; this is that, running,
 * two screens above the claim.
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
  shortForecast: string | null;
  source: "nws" | "unavailable";
}

/** Island-local clock, phrased the way a person would say it. */
function islandTime() {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(now)
    .toLowerCase();

  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    }).format(now)
  );

  const partOfDay =
    hour < 5
      ? "in the night"
      : hour < 12
        ? "in the morning"
        : hour < 17
          ? "in the afternoon"
          : hour < 21
            ? "in the evening"
            : "in the night";

  return { time, partOfDay };
}

export default function Conditions({ className = "" }: { className?: string }) {
  const [tide, setTide] = useState<Tide | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

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

    void load<Tide>("/api/tide", setTide);
    void load<Weather>("/api/conditions", setWeather);

    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing real to say yet — render nothing, and reserve no space.
  if (!tide && !weather) return null;

  const { time, partOfDay } = islandTime();

  return (
    <p
      className={`text-[0.9375rem] leading-relaxed text-(--color-ink-soft) ${className}`}
    >
      <span className="live-dot mr-2 inline-block align-middle" />
      It is {time} on the coast, {partOfDay}.
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
          )}
          .
        </>
      )}
      {weather?.source === "nws" && weather.windSpeed && (
        <>
          {" "}
          Wind {weather.windSpeed}
          {weather.shortForecast ? `, ${weather.shortForecast.toLowerCase()}` : ""}.
        </>
      )}
    </p>
  );
}
