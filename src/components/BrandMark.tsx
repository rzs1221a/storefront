/**
 * The Kedge mark.
 *
 * A rhombus — the fluke of an anchor, reduced to one shape. An earlier
 * attempt drew a literal kedge anchor (stem, stock, and hook), but at
 * wordmark size the stem and crossbar simply read as a lowercase "t" sitting
 * in front of the name. Geometry beats illustration below about 20px.
 *
 * Keep this in sync with public/favicon.svg.
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
        d="M8 1.4 14.6 8 8 14.6 1.4 8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
