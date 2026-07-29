import { useEffect, useState } from "react";
import { BRAND } from "../lib/brand";
import BrandMark from "./BrandMark";
import ScrollProgress from "./ScrollProgress";
import MagneticButton from "./MagneticButton";

const LINKS = [
  { href: "#work", label: "Work", frame: "work-the-aerial" },
  { href: "#capabilities", label: "What I build", frame: "capabilities" },
  { href: "#pricing", label: "Pricing", frame: "pricing" },
  { href: "#faq", label: "Questions", frame: null },
];

/**
 * Sticky top bar. Transparent over the hero, then gains a backdrop once the
 * page scrolls so it never competes with the opening statement.
 */
export default function Nav({ activeFrame }: { activeFrame: string | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Every work card registers its own frame, so any `work-*` key means the
  // reader is somewhere in the portfolio.
  const isActive = (frame: string | null) => {
    if (!frame || !activeFrame) return false;
    if (frame === "work-the-aerial") return activeFrame.startsWith("work-");
    return activeFrame === frame;
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-(--line) bg-(--color-plate)/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="shell flex h-16 items-center justify-between gap-6"
      >
        <a
          href="#top"
          className="flex min-h-[36px] items-center gap-2 text-[0.9375rem] font-medium tracking-[-0.01em]"
        >
          <BrandMark size={17} className="text-(--color-signal)" />
          {BRAND.name}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => {
            const active = isActive(link.frame);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={active ? "true" : undefined}
                  className={`relative text-sm transition-colors ${
                    active
                      ? "text-(--color-ink)"
                      : "text-(--color-ink-soft) hover:text-(--color-ink)"
                  }`}
                >
                  {link.label}
                  {/* The marker scales from the centre rather than appearing,
                      so moving between sections reads as one continuous rule. */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-0 h-px w-full origin-center bg-(--color-signal) transition-transform duration-500 ease-[var(--ease-out-expo)]"
                    style={{ transform: `scaleX(${active ? 1 : 0})` }}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <MagneticButton>
          <a href="#contact" className="btn btn-primary btn-sm">
            Get a quote
          </a>
        </MagneticButton>
      </nav>

      <ScrollProgress />
    </header>
  );
}
