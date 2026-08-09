import { useEffect, useRef } from "react";

/**
 * The one scroll-entrance mechanism on the site.
 *
 * An IntersectionObserver adds `.is-revealed` to the element the first time
 * it approaches the viewport, and never removes it — entrances happen once;
 * a page that keeps re-animating as you scroll back up is a carousel, not a
 * film. CSS owns everything visual from there.
 *
 * The restraint budget lives in the CSS contract, not here: transform and
 * opacity only, travel ≤ 24px, scale ≥ 0.97, stagger ≤ 3 children. And the
 * reduced-motion rule is structural — the revealed state IS the stylesheet's
 * base state; the pre-reveal offset is applied only inside
 * `@media (prefers-reduced-motion: no-preference)` on elements that do not
 * yet carry `.is-revealed`. With animations off, nothing is ever hidden and
 * this hook becomes a no-op that happens to add a class.
 */
export function useReveal<T extends HTMLElement>(
  options: { rootMargin?: string } = {}
) {
  const ref = useRef<T | null>(null);
  const { rootMargin = "0px 0px -12% 0px" } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-revealed");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-revealed");
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return ref;
}

/**
 * Container form: put one ref on a page root and every `[data-reveal]`
 * inside it is observed individually — no ref plumbing per element, and a
 * page cannot ship an element that waits forever for a class no observer
 * will add.
 */
export function useReveals<T extends HTMLElement>(
  options: { rootMargin?: string } = {}
) {
  const ref = useRef<T | null>(null);
  const { rootMargin = "0px 0px -12% 0px" } = options;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootMargin]);

  return ref;
}
