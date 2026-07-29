import { useRef, type ReactNode } from "react";

/**
 * Ported from heymann-williams-coastal/src/components/MagneticButton.tsx.
 *
 * The wrapped element drifts a little toward the pointer and springs back on
 * leave. Reserved for primary CTAs — applied broadly it stops reading as craft
 * and starts reading as a gimmick.
 *
 * Returns a plain span under reduced motion, so there is no listener and no
 * transform at all rather than a disabled-but-present effect.
 */
export default function MagneticButton({
  children,
  strength = 0.28,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) return <span className={className}>{children}</span>;

  return (
    <span
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const el = ref.current;
        const r = el?.getBoundingClientRect();
        if (!el || !r) return;
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "translate3d(0, 0, 0)";
      }}
    >
      {children}
    </span>
  );
}
