import { WORK } from "../lib/work";
import WorkCard from "../components/WorkCard";
import Reveal from "../components/Reveal";

/**
 * The portfolio — the page's center of gravity. Everything else on this site
 * is an argument; this section is evidence.
 */
export default function Work() {
  return (
    <section id="work" className="section">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">Selected work</p>
          <h2 className="headline mt-4 max-w-[16ch]">
            Five sites. All of them real.
          </h2>
          <p className="lede mt-5">
            Every screenshot below is the actual site, captured from the live
            deployment or a production build — not a mockup, not a theme demo.
            Two are public right now and linked; the rest are client sites you
            can see on a call.
          </p>
        </Reveal>

        <Reveal stagger={90} className="mt-16 space-y-24 sm:mt-20 sm:space-y-32">
          {WORK.map((item, index) => (
            <WorkCard key={item.slug} item={item} index={index} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
