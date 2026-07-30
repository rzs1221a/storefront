/**
 * The Seamark Studio mark.
 *
 * A daymark, drawn the way daymarks are actually made: a diamond board with a
 * solid center panel. US channel markers use exactly this nested geometry, and
 * it happens to be the site's own visual grammar in one glyph — the solid
 * center is the shipped work, the open frame around it is the concept ring.
 *
 * Geometry beats illustration below about 20px, so both shapes are pure
 * diamonds; at 16px it reads as a mark, at 30px (the og card) the nesting
 * becomes visible. Keep in sync with public/favicon.svg and scripts/og.mjs.
 */
export default function BrandMark({
  className = "",
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8 1.2 14.8 8 8 14.8 1.2 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 5.4 10.6 8 8 10.6 5.4 8Z" fill="currentColor" />
    </svg>
  );
}
