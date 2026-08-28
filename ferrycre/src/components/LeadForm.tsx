import { useState, type FormEvent } from "react";
import { SITE, telHref, mailHref } from "../lib/site";
import { record } from "../lib/attunement";

/**
 * The capture path. Captures intent, not just contact: use type, size range,
 * buy-or-lease, timeline, submarket. A commercial lead with those five fields
 * is worth ten anonymous form fills. Submissions go to a Netlify Function
 * that formats a BoldTrail Lead Dropbox email (with direct-email fallback)
 * and logs TCPA consent — timestamp, exact consent language shown.
 */

const USE_OPTIONS = ["Office", "Retail", "Industrial / Flex", "Medical", "Hospitality", "Multifamily", "Land", "Other"];
const GOAL_OPTIONS = ["Buy", "Lease", "Sell my property", "Lease out my property", "Invest (1031 / income)"];
const SIZE_OPTIONS = ["Under 2,000 SF", "2,000–5,000 SF", "5,000–15,000 SF", "15,000+ SF", "Land / acreage"];
const TIMELINE_OPTIONS = ["Now", "1–3 months", "3–12 months", "Exploring"];
const SUBMARKET_OPTIONS = ["Fernandina Beach / Amelia Island", "Yulee / SR-200", "Callahan / West Nassau", "Anywhere in Nassau County"];

type Phase = "idle" | "sending" | "sent" | "failed";

export default function LeadForm({ context }: { context?: Record<string, string> }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    if (!get("consent")) {
      setError("Please confirm consent to be contacted.");
      return;
    }
    setPhase("sending");
    setError(null);

    const payload = {
      firstName: get("firstName"),
      lastName: get("lastName"),
      email: get("email"),
      phone: get("phone"),
      consent: true,
      consentText: SITE.consentText,
      consentTimestamp: new Date().toISOString(),
      sourceUrl: window.location.href,
      honeypot: get("company"),
      context: {
        goal: get("goal"),
        useType: get("useType"),
        sizeRange: get("sizeRange"),
        timeline: get("timeline"),
        submarket: get("submarket"),
        message: get("message"),
        ...context,
      },
    };

    try {
      const res = await fetch("/.netlify/functions/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`submit ${res.status}`);
      record({ t: "lead_submit", intent: `${get("goal")} ${get("useType")}` });
      setPhase("sent");
      form.reset();
    } catch {
      setPhase("failed");
    }
  }

  if (phase === "sent") {
    return (
      <div className="glass-deep p-8 text-center">
        <p className="text-xl font-medium">Received.</p>
        <p className="mt-2 text-stone">
          Antoinette will reach out directly — usually the same business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-deep grid gap-4 p-6 sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-stone">
          First name
          <input name="firstName" required autoComplete="given-name" className="input-glass" />
        </label>
        <label className="grid gap-1.5 text-sm text-stone">
          Last name
          <input name="lastName" required autoComplete="family-name" className="input-glass" />
        </label>
        <label className="grid gap-1.5 text-sm text-stone">
          Email
          <input name="email" type="email" autoComplete="email" className="input-glass" />
        </label>
        <label className="grid gap-1.5 text-sm text-stone">
          Phone
          <input name="phone" type="tel" autoComplete="tel" className="input-glass" />
        </label>
      </div>

      {/* honeypot — hidden from people, filled by bots */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-stone">
          I want to
          <select name="goal" className="input-glass" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {GOAL_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm text-stone">
          Property type
          <select name="useType" className="input-glass" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {USE_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm text-stone">
          Size range
          <select name="sizeRange" className="input-glass" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {SIZE_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm text-stone">
          Timeline
          <select name="timeline" className="input-glass" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {TIMELINE_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5 text-sm text-stone">
        Submarket
        <select name="submarket" className="input-glass" defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {SUBMARKET_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm text-stone">
        Anything else
        <textarea name="message" rows={3} className="input-glass" placeholder="Requirements, questions, or a property you have in mind." />
      </label>

      <label className="flex items-start gap-3 text-xs leading-relaxed text-faint">
        <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 accent-[#a85484]" />
        <span>{SITE.consentText}</span>
      </label>

      {error && <p className="text-sm text-signal-soft">{error}</p>}
      {phase === "failed" && (
        <p className="text-sm text-signal-soft">
          The form couldn't send just now — call{" "}
          <a href={telHref} className="underline">
            {SITE.phone}
          </a>{" "}
          or email{" "}
          <a href={mailHref} className="underline">
            {SITE.email}
          </a>
          .
        </p>
      )}

      <button type="submit" disabled={phase === "sending"} className="btn-signal px-6 py-3 text-sm disabled:opacity-60">
        {phase === "sending" ? "Sending…" : "Start the conversation"}
      </button>
    </form>
  );
}
