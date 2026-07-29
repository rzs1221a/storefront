import { useEffect, useRef, useState } from "react";

/** True when the visitor has asked for less motion, or IO is unavailable. */
function shouldSkipAnimation() {
  if (typeof window === "undefined") return true;
  if (typeof IntersectionObserver === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Counts a number up when it scrolls into view. Used for the portfolio totals
 * in the hero — numbers that animate read as measured rather than asserted.
 *
 * The final value renders immediately under reduced motion, and the value is
 * always present as real text, so it is never hidden from assistive tech.
 */
export default function CountUp({
  to,
  duration = 1600,
  format = (n: number) => n.toLocaleString("en-US"),
  className = "",
}: {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);

  // Resolved during the initial render rather than in an effect: setting
  // state synchronously inside an effect triggers a second cascading render.
  const [value, setValue] = useState(() => (shouldSkipAnimation() ? to : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || shouldSkipAnimation()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // easeOutExpo — fast start, long settle. Matches the page's easing.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setValue(Math.round(to * eased));
          if (t < 1) frameRef.current = requestAnimationFrame(tick);
        };
        frameRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
