import { useEffect, useState } from "react";

/**
 * A hairline across the bottom of the nav tracking how far through the page
 * the reader is. Wayfinding on a page this long, and it costs one scroll
 * listener with a rAF gate.
 *
 * Deliberately not a percentage badge or a circular indicator — the point is
 * to be felt rather than read.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden"
    >
      <div
        className="h-full origin-left bg-(--color-signal)"
        style={{
          transform: `scaleX(${progress})`,
          // No transition: this must track the scroll exactly, and easing it
          // makes the line lag behind the page in a way that reads as broken.
          opacity: progress > 0.005 ? 0.85 : 0,
        }}
      />
    </div>
  );
}
