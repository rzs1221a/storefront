/**
 * The Seamark Studio mark.
 *
 * A rhombus — a seamark's daymark board, reduced to one shape. Illustration was
 * tried and abandoned: at wordmark size any drawn object collapses into a
 * smudge or, worse, reads as a stray letterform sitting in front of the name.
 * Geometry beats illustration below about 20px, and a knapped edge is already
 * geometry.
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
