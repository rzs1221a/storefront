/**
 * /api/lead-echo — the capture demo's other half.
 *
 * /capabilities claims that a form submission is validated, parsed into named
 * fields, and ingested into BoldTrail through the Lead Dropbox pattern. This
 * site's whole ethos is that a claim like that gets DEMONSTRATED rather than
 * described — the tide gauge in the footer is a real NOAA reading, not a
 * screenshot of one — so the capture demo fires a real submission through a
 * real serverless function and prints what actually came back.
 *
 * This is the same shape as a client's ingest: validate, split into named
 * fields, stamp it, hand back a record. The only difference — and the page
 * says so in as many words — is the last hop. A client's function posts the
 * parsed record into their BoldTrail Lead Dropbox. This one posts it nowhere
 * and returns it to the browser that sent it.
 *
 * ── Deliberately inert ───────────────────────────────────────────────────
 *
 * It is a demonstration on a public page, so it is built to be useless to
 * anybody who finds it:
 *
 *   - it stores NOTHING, anywhere, ever
 *   - it forwards NOTHING — no mail, no webhook, no CRM. It cannot be used as
 *     a relay, which is the failure mode a public echo endpoint invites
 *   - the body is capped, so it cannot be used to push weight through the edge
 *   - it returns JSON with no-store, and every value it echoes is text the
 *     caller already had. The client renders it as text content, never markup
 *
 * The real lead path is entirely separate: components/LeadForm.tsx posts to
 * Netlify Forms, which is the mechanism already proven in shipped work. This
 * endpoint has nothing to do with it and must never be wired into it.
 */

/** Enough for a realistic enquiry, far too little to be worth abusing. */
const MAX_BODY = 4096;

const FIELDS = [
  { key: "name", label: "name" },
  { key: "email", label: "email" },
  { key: "phone", label: "phone" },
  { key: "intent", label: "intent" },
  { key: "timeline", label: "timeline" },
  { key: "message", label: "notes" },
] as const;

type Parsed = {
  ok: boolean;
  receivedAt: string;
  /** Milliseconds the function itself spent, so the page reports a real one. */
  parseMs: number;
  fields: { label: string; value: string }[];
  rejected: string[];
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

/** Trim, collapse whitespace, and cap — the same hygiene a real ingest does. */
function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 400);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const started = Date.now();
  const raw = (await request.text()).slice(0, MAX_BODY);
  const params = new URLSearchParams(raw);

  const fields: Parsed["fields"] = [];
  const rejected: string[] = [];

  for (const field of FIELDS) {
    const value = clean(params.get(field.key) ?? "");
    if (!value) continue;

    /* Validation is a real part of the claim: "validated submissions" means
       the junk never reaches the CRM in the first place, rather than being
       filtered by the agent on the other end. */
    if (field.key === "email" && !/^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(value)) {
      rejected.push(`email: "${value}" is not a deliverable address`);
      continue;
    }
    if (field.key === "phone" && (value.match(/\d/g)?.length ?? 0) < 10) {
      rejected.push(`phone: "${value}" is not a complete number`);
      continue;
    }

    fields.push({ label: field.label, value });
  }

  if (!fields.some((f) => f.label === "name")) {
    rejected.push("name: required, and missing");
  }

  return json({
    ok: rejected.length === 0 && fields.length > 0,
    receivedAt: new Date().toISOString(),
    parseMs: Date.now() - started,
    fields,
    rejected,
  } satisfies Parsed);
}

export const config = { path: "/api/lead-echo" };
