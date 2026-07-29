/**
 * /api/tide — NOAA CO-OPS, station 8720030 (Fernandina Beach), datum MLLW.
 *
 * Ported from the-aerial/app/api/tide/route.ts and adapted to a Netlify
 * Function. The site claims live NOAA tide data in its capabilities section;
 * this is what makes that claim a demonstration rather than an assertion.
 *
 * Degradation is the whole design here. Observed height when the gauge is up,
 * cosine interpolation between bracketing hi/lo predictions when it is not,
 * and a quiet semidiurnal model as a last resort. The caller renders nothing
 * at all if this endpoint is missing, so a failed deploy costs one line of
 * text rather than a broken hero.
 *
 * No API key. The response is identical for every visitor, so the CDN serves
 * it and refreshes in the background — a handful of invocations a day rather
 * than one per browser.
 */

const BASE = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
const STATION = "8720030";
const TZ = "America/New_York";

const CACHE = "public, s-maxage=300, stale-while-revalidate=600";
const CACHE_SHORT = "public, s-maxage=60, stale-while-revalidate=120";

type Tide = {
  heightFt: number;
  direction: "rising" | "falling";
  next: { type: "high" | "low"; time: string } | null;
  source: "observed" | "predicted" | "modeled";
};

function yyyymmdd(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(d)
    .replaceAll("-", "");
}

/** NOAA lst_ldt stamps ("YYYY-MM-DD HH:mm") are already island-local. */
function localStampToMs(stamp: string) {
  return new Date(stamp.replace(" ", "T")).getTime();
}

/** "Now", expressed in the same island-local terms, so the two are comparable. */
function nowLocalMs() {
  const s = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
  return new Date(s.replace(" ", "T")).getTime();
}

function fmtLocal(stamp: string) {
  const d = new Date(stamp.replace(" ", "T"));
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

/** ~12h25m semidiurnal model. Quiet fallback only, and labelled as such. */
function modeled(): Tide {
  const hrs = (nowLocalMs() / 3600000) % 12.42;
  const phase = Math.sin((hrs / 12.42) * 2 * Math.PI);
  const slope = Math.cos((hrs / 12.42) * 2 * Math.PI);
  return {
    heightFt: +(3.0 + 2.9 * phase).toFixed(1),
    direction: slope >= 0 ? "rising" : "falling",
    next: null,
    source: "modeled",
  };
}

const json = (body: unknown, cache: string) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": cache },
  });

export default async function handler(): Promise<Response> {
  try {
    const today = yyyymmdd(new Date());
    const common = `station=${STATION}&datum=MLLW&time_zone=lst_ldt&units=english&format=json`;

    const [hiloRes, levelRes] = await Promise.allSettled([
      fetch(
        `${BASE}?product=predictions&interval=hilo&begin_date=${today}&range=48&${common}`
      ),
      fetch(`${BASE}?product=water_level&date=latest&${common}`),
    ]);

    let next: Tide["next"] = null;
    let direction: Tide["direction"] | null = null;
    let prevEvent: { t: string; v: number } | null = null;
    let nextEvent: { t: string; v: number; type: string } | null = null;

    if (hiloRes.status === "fulfilled" && hiloRes.value.ok) {
      const data = await hiloRes.value.json();
      const preds: { t: string; v: string; type: "H" | "L" }[] =
        data.predictions ?? [];
      const now = nowLocalMs();
      for (const p of preds) {
        const ms = localStampToMs(p.t);
        if (ms <= now) prevEvent = { t: p.t, v: parseFloat(p.v) };
        else {
          nextEvent = { t: p.t, v: parseFloat(p.v), type: p.type };
          break;
        }
      }
      if (nextEvent) {
        next = {
          type: nextEvent.type === "H" ? "high" : "low",
          time: fmtLocal(nextEvent.t),
        };
        direction = nextEvent.type === "H" ? "rising" : "falling";
      }
    }

    let heightFt: number | null = null;
    let source: Tide["source"] = "observed";

    if (levelRes.status === "fulfilled" && levelRes.value.ok) {
      const data = await levelRes.value.json();
      const v = data?.data?.[0]?.v;
      if (v !== undefined && v !== "") heightFt = +parseFloat(v).toFixed(1);
    }

    if (heightFt === null && prevEvent && nextEvent) {
      // Cosine interpolation between the bracketing predictions — the tide
      // curve is far closer to a cosine than to the straight line a linear
      // interpolation would draw.
      const now = nowLocalMs();
      const t0 = localStampToMs(prevEvent.t);
      const t1 = localStampToMs(nextEvent.t);
      const frac = Math.min(1, Math.max(0, (now - t0) / (t1 - t0)));
      const w = (1 - Math.cos(Math.PI * frac)) / 2;
      heightFt = +(prevEvent.v + (nextEvent.v - prevEvent.v) * w).toFixed(1);
      source = "predicted";
    }

    if (heightFt === null || direction === null) {
      const m = modeled();
      return json({ ...m, next: next ?? m.next }, CACHE_SHORT);
    }

    return json({ heightFt, direction, next, source } satisfies Tide, CACHE);
  } catch {
    return json(modeled(), CACHE_SHORT);
  }
}

export const config = { path: "/api/tide" };
