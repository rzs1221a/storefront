import SunCalc from "suncalc";

/**
 * The real sky over Amelia Island.
 *
 * The map grade follows actual solar elevation rather than clock hour, so it is
 * correct year-round rather than correct in June and wrong in December. The
 * stars are a real catalogue projected to real altitude and azimuth for this
 * observer at this moment.
 *
 * Ported and extended from the-aerial/lib/sky.ts.
 *
 * On trusting this file: the star projection is checked against an invariant
 * that cannot be satisfied by accident — Polaris sits at an altitude equal to
 * the observer's latitude, always. From here that is 30.6°. See
 * scripts/sky-check.mjs. If the maths were subtly wrong, that number would move.
 */

/** The observer: Amelia Island, Florida. */
export const OBSERVER = { lat: 30.6129, lon: -81.4623 };

const DEG = Math.PI / 180;
const deg = (rad: number) => rad / DEG;

/* ── Sun ──────────────────────────────────────────────────────────────── */

export type Light =
  | "night"
  | "dawn"
  | "morning"
  | "midday"
  | "golden"
  | "dusk";

export interface SkyState {
  /** Solar altitude in degrees. Negative is below the horizon. */
  solarAltitude: number;
  light: Light;
  /** Plain words for the rail, e.g. "golden hour". */
  label: string;
  /** How dark the star canvas should be drawn: 0 by day, 1 deep at night. */
  starOpacity: number;
  moon: { altitude: number; azimuth: number; phase: number; label: string };
  /** Minutes until golden hour begins, or null if it is past for today. */
  minutesToGolden: number | null;
  /**
   * The grade for the map plate — composited over the imagery with
   * `mix-blend-mode: soft-light`, so the satellite ground is lit by the real
   * sun at zero GPU cost. Deliberately quieter than the-aerial's version:
   * this site already carries `.map-tint`, and the grade must read as light,
   * not paint.
   */
  gradient: string;
}

/** One radial wash per light state. Keyed to `Light`, resolved in getSky(). */
const GRADE: Record<Light, string> = {
  night:
    "radial-gradient(120% 90% at 50% 10%, rgba(45, 62, 105, 0.38), rgba(12, 20, 42, 0.5))",
  dawn:
    "radial-gradient(120% 90% at 72% 20%, rgba(122, 140, 190, 0.36), rgba(30, 38, 70, 0.34))",
  morning:
    "radial-gradient(120% 90% at 65% 15%, rgba(214, 224, 235, 0.3), rgba(150, 165, 185, 0.16))",
  midday:
    "radial-gradient(120% 90% at 50% 8%, rgba(255, 252, 240, 0.3), rgba(226, 222, 204, 0.14))",
  golden:
    "radial-gradient(120% 90% at 30% 25%, rgba(255, 205, 130, 0.4), rgba(190, 120, 60, 0.3))",
  dusk:
    "radial-gradient(120% 90% at 28% 22%, rgba(190, 120, 140, 0.34), rgba(58, 40, 74, 0.36))",
};

function moonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return "new moon";
  if (phase < 0.22) return "waxing crescent";
  if (phase < 0.28) return "first quarter";
  if (phase < 0.47) return "waxing gibbous";
  if (phase < 0.53) return "full moon";
  if (phase < 0.72) return "waning gibbous";
  if (phase < 0.78) return "last quarter";
  return "waning crescent";
}

export function getSky(now: Date = new Date()): SkyState {
  const { lat, lon } = OBSERVER;
  const sun = SunCalc.getPosition(now, lat, lon);
  const alt = deg(sun.altitude);

  // Ten minutes ahead tells us which side of the day we are on without
  // needing to know the date — rising or setting.
  const soon = deg(
    SunCalc.getPosition(new Date(now.getTime() + 6e5), lat, lon).altitude
  );
  const rising = soon > alt;

  let light: Light;
  let label: string;
  if (alt < -6) {
    light = "night";
    label = "night";
  } else if (alt < 0) {
    light = rising ? "dawn" : "dusk";
    label = rising ? "first light" : "dusk";
  } else if (alt < 8) {
    light = "golden";
    label = "golden hour";
  } else if (alt < 30) {
    light = rising ? "morning" : "golden";
    label = rising ? "morning" : "late light";
  } else {
    light = "midday";
    label = "high sun";
  }

  /*
   * Stars fade in through civil twilight rather than snapping on at sunset:
   * full dark below −12°, nothing above the horizon, a ramp between.
   */
  const starOpacity =
    alt >= 0 ? 0 : alt <= -12 ? 1 : Math.min(1, Math.max(0, -alt / 12));

  const moonPos = SunCalc.getMoonPosition(now, lat, lon);
  const moonIllum = SunCalc.getMoonIllumination(now);

  const times = SunCalc.getTimes(now, lat, lon);
  const goldenStart = times.goldenHour; // evening golden hour begins
  const minutesToGolden =
    goldenStart && goldenStart.getTime() > now.getTime()
      ? Math.round((goldenStart.getTime() - now.getTime()) / 60000)
      : null;

  return {
    solarAltitude: alt,
    light,
    label,
    starOpacity,
    moon: {
      altitude: deg(moonPos.altitude),
      // SunCalc measures azimuth from due south; convert to the compass
      // convention (0 = north, increasing east) the star projection uses.
      azimuth: (deg(moonPos.azimuth) + 180) % 360,
      phase: moonIllum.phase,
      label: moonPhaseName(moonIllum.phase),
    },
    minutesToGolden,
    gradient: GRADE[light],
  };
}

/* ── Stars ────────────────────────────────────────────────────────────── */

/**
 * Greenwich Mean Sidereal Time, in degrees.
 *
 * Sidereal time is what turns a fixed catalogue position into "where is it in
 * the sky right now" — the Earth's rotation relative to the stars rather than
 * to the Sun, which is why it gains about four minutes a day on the clock.
 */
function gmstDegrees(date: Date): number {
  // Julian Date. 2440587.5 is the JD of the Unix epoch.
  const jd = date.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0; // days from J2000.0
  const t = d / 36525;
  const gmst =
    280.46061837 +
    360.98564736629 * d +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return ((gmst % 360) + 360) % 360;
}

export interface HorizonPosition {
  /** Degrees above the horizon. Negative is below it, and not drawn. */
  altitude: number;
  /** Compass degrees: 0 = north, 90 = east. */
  azimuth: number;
}

/**
 * Convert a catalogue position (right ascension / declination) into where it
 * actually sits in the sky for this observer, now.
 */
export function equatorialToHorizon(
  raDeg: number,
  decDeg: number,
  date: Date = new Date(),
  observer = OBSERVER
): HorizonPosition {
  const lst = gmstDegrees(date) + observer.lon; // local sidereal time
  const hourAngle = (((lst - raDeg) % 360) + 360) % 360;

  const H = hourAngle * DEG;
  const dec = decDeg * DEG;
  const lat = observer.lat * DEG;

  const sinAlt =
    Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
  const altitude = Math.asin(Math.min(1, Math.max(-1, sinAlt)));

  const cosAz =
    (Math.sin(dec) - Math.sin(altitude) * Math.sin(lat)) /
    (Math.cos(altitude) * Math.cos(lat));
  let azimuth = Math.acos(Math.min(1, Math.max(-1, cosAz)));

  // acos loses the sign, so the eastern half of the sky has to be recovered
  // from the hour angle: a positive sine means the object is setting (west).
  if (Math.sin(H) > 0) azimuth = 2 * Math.PI - azimuth;

  return { altitude: deg(altitude), azimuth: deg(azimuth) };
}
