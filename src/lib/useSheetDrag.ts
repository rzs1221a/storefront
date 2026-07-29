/**
 * Swipe-down-to-dismiss for the mobile bottom sheets. The drag begins only
 * when the sheet is scrolled to its top and the finger moves downward, so it
 * never fights the sheet's own scrolling. Listeners are native and
 * non-passive because React's synthetic touch events can't preventDefault.
 */
import { useEffect, useRef } from "react";

export function useSheetDrag(enabled: boolean, onDismiss: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  const dismiss = useRef(onDismiss);
  useEffect(() => { dismiss.current = onDismiss; }, [onDismiss]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let startY = 0;
    let startT = 0;
    let dy = 0;
    let dragging = false;
    let eligible = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { eligible = false; return; }
      eligible = el.scrollTop <= 2;
      startY = e.touches[0].clientY;
      startT = Date.now();
      dy = 0;
      dragging = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!eligible || e.touches.length !== 1) return;
      const delta = e.touches[0].clientY - startY;
      if (!dragging) {
        if (delta > 10) {
          dragging = true;
          el.style.transition = "none";
        } else if (delta < -6) {
          eligible = false; // an upward scroll, not a dismissal
          return;
        } else return;
      }
      dy = Math.max(0, delta);
      e.preventDefault();
      el.style.transform = `translateY(${dy}px)`;
    };

    const onEnd = () => {
      if (!dragging) { eligible = false; return; }
      const dt = Math.max(1, Date.now() - startT);
      const flick = dy / dt > 0.55;
      el.style.transition = "";
      if (dy > 140 || (flick && dy > 48)) {
        el.style.transform = "";
        dismiss.current();
      } else {
        el.style.transform = "translateY(0)";
      }
      dragging = false;
      eligible = false;
      dy = 0;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [enabled]);

  return ref;
}
