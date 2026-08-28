import { Link } from "react-router-dom";
import LeadForm from "../components/LeadForm";
import { SITE } from "../lib/site";
import { useCanonical, useDocumentTitle } from "../lib/seo";

const SERVICES = [
  {
    key: "tenant-rep",
    name: "Tenant representation",
    lead: "Finding the right space costs less than settling for the wrong one.",
    body: "Requirement definition, corridor and co-tenancy analysis, tour management, and lease negotiation on your side of the table — rate, basis, TI, options, and the clauses that matter in year four. In a county where much of the inventory never lists publicly, representation is access.",
  },
  {
    key: "landlord-rep",
    name: "Landlord representation",
    lead: "Vacancy is the most expensive line on the statement.",
    body: "Positioning, pricing against real corridor comps, marketing through both MLSs and the Berkshire network, tenant screening, and lease structuring that protects the asset — basis, escalations, and renewals designed for the exit, not just the signing.",
  },
  {
    key: "investment-sales",
    name: "Investment sales",
    lead: "Small-market assets deserve institutional-grade underwriting.",
    body: "NOI reconstruction, cap-rate and per-foot positioning against what has actually traded in Nassau County, quiet marketing to qualified buyers, and management of diligence through close. For buyers: sourcing on and off market, including 1031 timelines.",
  },
  {
    key: "leasing",
    name: "Commercial leasing",
    lead: "The lease is the asset.",
    body: "Full-cycle leasing for owners and operators — NNN, modified gross, and full-service structures, renewals and expansions, and the documentation discipline that keeps a small portfolio financeable.",
  },
  {
    key: "site-selection",
    name: "Site selection & land",
    lead: "Corridor position decides more than the building does.",
    body: "Traffic counts with FDOT citations, ingress and median analysis, zoning and future land use reads, utility due diligence, and entitlement navigation across Fernandina Beach, Yulee, and the county's western corridors.",
  },
];

export default function Services() {
  useDocumentTitle(
    "Commercial Services · Tenant Rep, Landlord Rep, Investment Sales · Ferry CRE",
    "Tenant representation, landlord representation, investment sales, leasing, and site selection across Nassau County, Florida."
  );
  useCanonical("/services");
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-40">
      <p className="eyebrow">Services</p>
      <h1 className="font-display mt-2 max-w-3xl text-3xl font-semibold sm:text-4xl">
        One commercial practice, both sides of every table.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone">
        {SITE.name} runs the dedicated commercial desk at {SITE.brokerageShort}. The work below is
        the whole job — not a sideline to residential.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {SERVICES.map((s) => (
          <article key={s.key} className="glass p-7">
            <h2 className="text-xl font-medium">{s.name}</h2>
            <p className="mt-2 text-signal-soft">{s.lead}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone">{s.body}</p>
          </article>
        ))}
        <article className="glass-deep flex flex-col justify-between p-7">
          <div>
            <h2 className="text-xl font-medium">Not sure which you need?</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone">
              Most engagements start with a fifteen-minute conversation about the requirement — or
              the property. Start there.
            </p>
          </div>
          <Link to="/contact" className="btn-signal mt-6 self-start px-6 py-3 text-sm">
            Talk to Antoinette
          </Link>
        </article>
      </div>

      <div className="mx-auto mt-16 max-w-4xl" id="engage">
        <h2 className="font-display text-2xl font-semibold">Put the requirement in writing.</h2>
        <div className="mt-6">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
