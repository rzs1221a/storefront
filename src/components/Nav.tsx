import { useEffect, useState } from "react";
import { BRAND } from "../lib/brand";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#capabilities", label: "What I build" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "Questions" },
];

/**
 * Sticky top bar. Transparent over the hero, then gains a backdrop once the
 * page scrolls so it never competes with the opening statement.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-[--line] bg-[--color-plate]/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="shell flex h-16 items-center justify-between gap-6"
      >
        <a
          href="#top"
          className="flex min-h-[36px] items-center gap-2.5 text-[0.9375rem] font-medium tracking-[-0.01em]"
        >
          <span
            aria-hidden="true"
            className="h-3.5 w-[3px] rounded-full bg-[--color-signal]"
          />
          {BRAND.name}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-[--color-ink-soft] transition-colors hover:text-[--color-ink]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact" className="btn btn-primary btn-sm">
          Get a quote
        </a>
      </nav>
    </header>
  );
}
