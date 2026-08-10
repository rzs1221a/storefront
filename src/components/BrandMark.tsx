/**
 * The Seamark Studio mark: the slash key.
 *
 * Lifted from the site's own search affordance — press `/` anywhere and the
 * command bar answers in plain English. A keycap with the slash inside is
 * that promise as a glyph: type to it, it takes you there. The rounded
 * square reads as a key at 16px and as an app tile at 512.
 *
 * Keep in sync with public/favicon.svg and scripts/og.mjs.
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
      <rect
        x="1.2"
        y="1.2"
        width="13.6"
        height="13.6"
        rx="3.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.6 4.4 6.4 11.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
