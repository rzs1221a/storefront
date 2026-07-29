import { useState, type FormEvent } from "react";
import { BRAND, CONTACT } from "../lib/brand";
import { TIERS } from "../lib/offer";

/**
 * The conversion point.
 *
 * Submits to Netlify Forms — the same mechanism already proven in
 * sold-on-amelia-island. Netlify detects the form from public/__forms.html at
 * deploy time, so the React markup does not need to be crawlable.
 *
 * Unlike heymann-williams-coastal/src/components/LeadForm.tsx, which is a demo
 * stub that deliberately submits nowhere, this one posts for real and reports
 * honestly when it fails. A silent failure on the one form that makes money is
 * the worst bug this site could have.
 */

const FORM_NAME = "storefront-enquiry";

type Status = "idle" | "sending" | "sent" | "error";

function encode(data: Record<string, string>) {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export default function LeadForm({
  /**
   * A tier name to pre-select in the interest dropdown, from the `?package=`
   * parameter an offer card carries. Asking someone to re-choose the thing
   * they just clicked is the cheapest conversion leak there is.
   *
   * Pre-selected, never locked: it is a select the visitor can still change,
   * because a card click is a signal of interest and not a commitment.
   */
  selectedPackage,
  /**
   * A catalog offering name, from the `?option=` parameter an option page
   * carries. Rendered as its own entry in the dropdown — the enquiry then
   * names the exact thing the visitor was reading, not just its build size.
   */
  selectedOption,
}: {
  selectedPackage?: string;
  selectedOption?: string;
} = {}) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(
      new FormData(form) as unknown as Iterable<[string, string]>
    );

    setStatus("sending");
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": FORM_NAME, ...data }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="panel p-8 text-center sm:p-10" role="status">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-(--color-signal) text-(--color-signal)">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M4 9.5L7.5 13L14 5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-medium">That's through. Thank you.</h3>
        <p className="lede mx-auto mt-3 text-[0.9375rem]">
          I read every one of these myself and reply within one business day —
          usually the same evening. If it is urgent, call or text{" "}
          <a
            href={`tel:${CONTACT.phone}`}
            className="text-(--color-ink) underline decoration-(--line-strong) underline-offset-4"
          >
            {CONTACT.phoneDisplay}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      name={FORM_NAME}
      method="POST"
      data-netlify="true"
      netlify-honeypot="company-website"
      onSubmit={handleSubmit}
      className="panel p-6 sm:p-8"
    >
      <input type="hidden" name="form-name" value={FORM_NAME} />

      {/* Honeypot. Visually hidden, never announced, never tab-reachable. */}
      <p className="hidden" aria-hidden="true">
        <label>
          Leave this empty
          <input name="company-website" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-name" className="mono-label mb-2 block">
            Name
          </label>
          <input
            id="lf-name"
            name="name"
            required
            autoComplete="name"
            className="field"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="lf-email" className="mono-label mb-2 block">
            Email
          </label>
          <input
            id="lf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
            placeholder="you@brokerage.com"
          />
        </div>

        <div>
          <label htmlFor="lf-phone" className="mono-label mb-2 block">
            Phone <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="lf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="field"
            placeholder="(904) 555-0123"
          />
        </div>

        <div>
          <label htmlFor="lf-interest" className="mono-label mb-2 block">
            What are you after?
          </label>
          <select
            id="lf-interest"
            name="interest"
            className={`field${selectedPackage || selectedOption ? " is-prefilled" : ""}`}
            // Keyed on the selection so arriving from a different offer card
            // or option page remounts the select with the new default. Without
            // the key React would keep the first uncontrolled value it
            // rendered.
            key={selectedOption ?? selectedPackage ?? "none"}
            defaultValue={selectedOption ?? selectedPackage ?? ""}
          >
            <option value="" disabled>
              Choose one
            </option>
            {selectedOption && (
              <option value={selectedOption}>{selectedOption}</option>
            )}
            {TIERS.map((tier) => (
              <option key={tier.slug} value={tier.name}>
                {tier.name}
              </option>
            ))}
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="lf-message" className="mono-label mb-2 block">
          What is not working about your current site?
        </label>
        <textarea
          id="lf-message"
          name="message"
          rows={4}
          className="field resize-y"
          placeholder="Tell me where you sell, who you sell to, and what you want this site to do."
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Start the conversation"}
        </button>
        <a href={`tel:${CONTACT.phone}`} className="btn btn-ghost">
          Call {CONTACT.phoneDisplay}
        </a>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          That did not send — something went wrong on the way out. Please email{" "}
          <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-4">
            {CONTACT.email}
          </a>{" "}
          or call {CONTACT.phoneDisplay} and I will pick it up directly.
        </p>
      )}

      <p className="mt-5 text-xs leading-relaxed text-(--color-ink-faint)">
        Goes straight to {BRAND.short}. No list, no newsletter, no third party.
      </p>
    </form>
  );
}
