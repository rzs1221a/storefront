/**
 * The attunement event bus — commercial edition. Phase 2 wires the full
 * profile scoring and CRM sync; phase 1 ships the bus itself so every
 * surface already reports through one seam and nothing needs rewiring later.
 *
 * Everything lives on the device: events persist in localStorage, no server
 * calls. On a commercial site with a small repeat-visitor pool this is the
 * differentiator — the third visit from someone who keeps opening the same
 * flex listing is a phone call, not a pageview.
 *
 * The export shape targets BoldTrail (kvCORE) contact custom fields via
 * `toBoldTrailPayload()`. Her instance: antoinetteferry.heymannwilliams.com.
 */

export type CommercialEvent =
  | { t: "search"; q: string }
  | { t: "market"; slug: string }
  | { t: "listing_open"; id: string; useType: string; transaction: string; price: number | null }
  | { t: "listing_dwell"; id: string; ms: number }
  | { t: "explore_open"; id: string | null }
  | { t: "doc_open"; id: string; label: string }
  | { t: "lead_submit"; intent: string };

type Stamped = CommercialEvent & { at: number };

const KEY = "ferrycre-attunement";
const MAX_EVENTS = 400;

type Store = { sessions: number; sessionMark: number; events: Stamped[] };

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* fresh */
  }
  return { sessions: 0, sessionMark: 0, events: [] };
}

function persist(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* full or private */
  }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(s: Store) {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persist(s);
  }, 800);
}

let store: Store | null = null;
function ensure(): Store {
  if (!store) {
    store = load();
    const now = Date.now();
    if (now - store.sessionMark > 45 * 60_000) store.sessions += 1;
    store.sessionMark = now;
  }
  return store;
}

export function record(e: CommercialEvent) {
  const s = ensure();
  s.events.push({ ...e, at: Date.now() });
  if (s.events.length > MAX_EVENTS) s.events.splice(0, s.events.length - MAX_EVENTS);
  s.sessionMark = Date.now();
  schedulePersist(s);
}

export type CommercialProfile = {
  sessions: number;
  events: number;
  lastActive: number;
  useTypes: { useType: string; weight: number }[];
  listingsOpened: { id: string; opens: number }[];
  searches: string[];
  leadSubmitted: boolean;
};

export function profile(): CommercialProfile {
  const s = ensure();
  const byUse = new Map<string, number>();
  const byListing = new Map<string, number>();
  const searches: string[] = [];
  let lead = false;
  for (const e of s.events) {
    if (e.t === "listing_open") {
      byUse.set(e.useType, (byUse.get(e.useType) ?? 0) + 1);
      byListing.set(e.id, (byListing.get(e.id) ?? 0) + 1);
    }
    if (e.t === "search" && e.q.trim()) searches.push(e.q.trim());
    if (e.t === "lead_submit") lead = true;
  }
  return {
    sessions: s.sessions,
    events: s.events.length,
    lastActive: s.sessionMark,
    useTypes: [...byUse.entries()]
      .map(([useType, weight]) => ({ useType, weight }))
      .sort((a, b) => b.weight - a.weight),
    listingsOpened: [...byListing.entries()]
      .map(([id, opens]) => ({ id, opens }))
      .sort((a, b) => b.opens - a.opens),
    searches: searches.slice(-8),
    leadSubmitted: lead,
  };
}

/**
 * BoldTrail (kvCORE) export seam. Phase 2 posts this as contact custom
 * fields plus an activity note when a visitor identifies themselves through
 * the lead form. Field names are provisional until the CRM mapping is agreed.
 */
export function toBoldTrailPayload(): {
  customFields: Record<string, string | number>;
  activityNote: string;
} {
  const p = profile();
  return {
    customFields: {
      ferrycre_sessions: p.sessions,
      ferrycre_use_types: p.useTypes.map((u) => u.useType).join(", "),
      ferrycre_listings_viewed: p.listingsOpened.map((l) => l.id).join(", "),
      ferrycre_searches: p.searches.join(" | "),
      ferrycre_last_active: new Date(p.lastActive).toISOString(),
    },
    activityNote:
      `ferrycre.com: ${p.sessions} sessions` +
      (p.useTypes.length ? `, strongest interest in ${p.useTypes.slice(0, 2).map((u) => u.useType).join(" and ")}` : "") +
      (p.listingsOpened.length ? `, opened ${p.listingsOpened.length} listings` : "") +
      ".",
  };
}
