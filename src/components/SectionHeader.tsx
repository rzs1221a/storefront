import type { ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * The fix for the page's worst layout problem: before this, every section was
 * eyebrow → left headline → lede → grid, eight times running. On a site whose
 * argument is "I don't sell you a template," the layout itself read as one.
 *
 * Variants let consecutive sections take different silhouettes, and the mono
 * index gives a long page some wayfinding. Content is unchanged — only the
 * shape it arrives in.
 */

type Variant =
  /** Headline left, lede directly beneath it. The base rhythm. */
  | "stacked"
  /** Headline left, lede in a right-hand column. Wide sections. */
  | "split"
  /** Everything centered on a narrow measure. Use sparingly — once or twice. */
  | "centered";

export default function SectionHeader({
  index,
  eyebrow,
  headline,
  lede,
  variant = "stacked",
  aside,
  className = "",
}: {
  /** Two-digit section number, e.g. "02". Omit to hide. */
  index?: string;
  eyebrow: string;
  headline: ReactNode;
  lede?: ReactNode;
  variant?: Variant;
  /** Optional extra content, placed under the lede. */
  aside?: ReactNode;
  className?: string;
}) {
  const eyebrowRow = (
    <div className="flex items-baseline gap-3">
      {index && (
        <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-(--color-ink-faint)">
          {index}
        </span>
      )}
      <span className="eyebrow">{eyebrow}</span>
    </div>
  );

  if (variant === "centered") {
    return (
      <Reveal className={`mx-auto max-w-[46rem] text-center ${className}`}>
        <div className="flex justify-center">{eyebrowRow}</div>
        <h2 className="headline mt-5 text-balance">{headline}</h2>
        {lede && <p className="lede mx-auto mt-5">{lede}</p>}
        {aside}
      </Reveal>
    );
  }

  if (variant === "split") {
    return (
      <Reveal
        className={`grid gap-x-14 gap-y-6 lg:grid-cols-12 lg:items-end ${className}`}
      >
        <div className="lg:col-span-7">
          {eyebrowRow}
          <h2 className="headline mt-5">{headline}</h2>
        </div>
        {(lede || aside) && (
          <div className="lg:col-span-5 lg:pb-2">
            {lede && <p className="lede">{lede}</p>}
            {aside}
          </div>
        )}
      </Reveal>
    );
  }

  return (
    <Reveal className={className}>
      {eyebrowRow}
      <h2 className="headline mt-5 max-w-[20ch]">{headline}</h2>
      {lede && <p className="lede mt-5">{lede}</p>}
      {aside}
    </Reveal>
  );
}
