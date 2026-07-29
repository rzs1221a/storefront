import { CONTACT } from "../lib/brand";
import LeadForm from "../components/LeadForm";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

/**
 * The close. Form for the considered, phone and text for the ones who move
 * fast — both paths visible without scrolling past the other.
 */
export default function Contact() {
  return (
    <section id="contact" data-frame="contact" className="section scroll-mt-20">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <SectionHeader
              index="07"
              eyebrow="Start here"
              headline={<>Tell me what you need.</>}
              lede="Twenty minutes on the phone and you will know whether this is worth doing. If it is not a fit, I will say so — I would rather turn down work than build something that does not earn its keep."
            />

            <div className="panel mt-10 divide-y divide-(--line) overflow-hidden">
              <a
                href={`tel:${CONTACT.phone}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <span className="mono-label">Call</span>
                <span className="text-[0.9375rem]">{CONTACT.phoneDisplay}</span>
              </a>
              <a
                href={`sms:${CONTACT.phone}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <span className="mono-label">Text</span>
                <span className="text-[0.9375rem]">{CONTACT.phoneDisplay}</span>
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <span className="mono-label">Email</span>
                <span className="truncate text-[0.9375rem]">{CONTACT.email}</span>
              </a>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-(--color-ink-faint)">
              <span className="live-dot" />
              Based in {CONTACT.location}. I reply within one business day.
            </p>
          </Reveal>

          <Reveal delay={100} direction="right" className="lg:col-span-7">
            <LeadForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
