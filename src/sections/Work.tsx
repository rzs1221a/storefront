import { WORK } from "../lib/work";
import WorkCard from "../components/WorkCard";
import SectionHeader from "../components/SectionHeader";
import Reveal from "../components/Reveal";

/**
 * The portfolio — the page's centre of gravity. Everything else here is an
 * argument; this section is evidence, so it gets the most room and the only
 * full-bleed moment on the page.
 *
 * The flagship renders as a feature and the remaining four alternate beneath
 * it. Previously all five were identical rows, which made the most important
 * section the flattest one.
 */
export default function Work() {
  const [flagship, ...rest] = WORK;

  return (
    <section id="work" className="section">
      <div className="shell">
        <SectionHeader
          index="01"
          eyebrow="Selected work"
          variant="split"
          headline={<>Five sites. All&nbsp;of&nbsp;them real.</>}
          lede="Every screenshot below is the actual site, captured from the live deployment or a production build — not a mockup, not a theme demo. Two are public right now and linked; the rest are client sites you can see on a call."
        />
      </div>

      {/* The flagship breaks the shell on the right so the section opens wide. */}
      <Reveal stagger={0} className="mt-16 sm:mt-20">
        <div className="pl-[var(--gutter)] pr-[var(--gutter)] xl:pl-[max(var(--gutter),calc((100vw-90rem)/2+var(--gutter)))] xl:pr-[max(var(--gutter),calc((100vw-90rem)/2+var(--gutter)))]">
          <WorkCard item={flagship} index={0} feature />
        </div>
      </Reveal>

      <div className="shell">
        <Reveal stagger={110} className="mt-24 space-y-24 sm:mt-32 sm:space-y-32">
          {rest.map((item, i) => (
            <WorkCard key={item.slug} item={item} index={i + 1} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
