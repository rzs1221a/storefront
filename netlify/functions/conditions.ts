/**
 * /api/conditions — National Weather Service (api.weather.gov). Free, no key.
 *
 * Ported from the-aerial/app/api/conditions/route.ts. points → hourly forecast
 * grid → current wind and short forecast.
 *
 * Degrades to nulls with `source: "unavailable"`, and the caller drops the
 * clause rather than showing an error. NWS asks for a descriptive User-Agent
 * and will reject requests without one.
 */

const UA = { "User-Agent": "(kedge.studio, storefront)" };
const POINT = "30.61,-81.46"; // Amelia Island

const CACHE = "public, s-maxage=900, stale-while-revalidate=1800";

type Conditions = {
  windSpeed: string | null;
  windDirection: string | null;
  shortForecast: string | null;
  temperature: number | null;
  source: "nws" | "unavailable";
};

const json = (body: Conditions) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": CACHE },
  });

const UNAVAILABLE: Conditions = {
  windSpeed: null,
  windDirection: null,
  shortForecast: null,
  temperature: null,
  source: "unavailable",
};

export default async function handler(): Promise<Response> {
  try {
    const ptRes = await fetch(`https://api.weather.gov/points/${POINT}`, {
      headers: UA,
    });
    if (!ptRes.ok) throw new Error("points");

    const pt = await ptRes.json();
    const hourlyUrl: string | undefined = pt?.properties?.forecastHourly;
    if (!hourlyUrl) throw new Error("no grid");

    const fcRes = await fetch(hourlyUrl, { headers: UA });
    if (!fcRes.ok) throw new Error("forecast");

    const fc = await fcRes.json();
    const now = fc?.properties?.periods?.[0];
    if (!now) throw new Error("no period");

    return json({
      windSpeed: now.windSpeed ?? null,
      windDirection: now.windDirection ?? null,
      shortForecast: now.shortForecast ?? null,
      temperature: typeof now.temperature === "number" ? now.temperature : null,
      source: "nws",
    });
  } catch {
    return json(UNAVAILABLE);
  }
}

export const config = { path: "/api/conditions" };
