import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered reveal, modeled on the pattern in
 * heymann-williams-coastal/src/components/Reveal.tsx but simplified — this
 * site has no render-motion engine behind it, so the animation is pure CSS
 * driven by an `is-visible` class (see [data-reveal] in index.css).
 *
 * Fires once. Content is never hidden permanently: if IntersectionObserver is
 * unavailable, or the visitor prefers reduced motion, elements show
 * immediately.
 */

interface RevealProps {
  children: ReactNode;
  /** Milliseconds of delay before this element animates in. */
  delay?: number;
  /** Stagger direct children marked with data-reveal-item by `step` ms each. */
  stagger?: number;
  className?: string;
  as?: ElementType;
  id?: string;
}

export default function Reveal({
  children,
  delay = 0,
  stagger,
  className = "",
  as: Tag = "div",
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = stagger
      ? Array.from(el.querySelectorAll<HTMLElement>("[data-reveal-item]"))
      : [];

    const show = () => {
      el.classList.add("is-visible");
      items.forEach((item, i) => {
        item.style.setProperty("--reveal-delay", `${i * stagger!}ms`);
        item.classList.add("is-visible");
      });
    };

    // Respect the OS setting, and never gate content behind a missing API.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    el.style.setProperty("--reveal-delay", `${delay}ms`);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, stagger]);

  return (
    <Tag ref={ref} id={id} data-reveal className={className}>
      {children}
    </Tag>
  );
}
