/**
 * The visual for a concept offering.
 *
 * Concepts have no screenshot because nothing has been shipped, and a mocked
 * browser shot would cross the one line this site is built on. So the figure
 * is honest about being a drawing: a dashed frame echoing the hollow concept
 * beacon on the map, a wireframe schematic in the offering's hue, and the word
 * CONCEPT written on it — the same visual language everywhere the site says
 * "not yet built".
 */
export default function ConceptFigure({
  name,
  hue,
}: {
  name: string;
  hue: number;
}) {
  return (
    <figure
      className="concept-figure"
      style={{ "--concept-hue": hue } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label={`Schematic placeholder for the ${name} concept — no shipped site exists yet`}
        className="block h-auto w-full"
      >
        {/* A wireframe page: header, hero, content blocks. Deliberately
            diagrammatic — blocks, not content. */}
        <g
          fill="none"
          stroke={`hsl(${hue} 60% 62% / 0.55)`}
          strokeWidth="1.5"
        >
          <rect x="40" y="36" width="360" height="18" rx="4" />
          <rect x="40" y="72" width="560" height="120" rx="8" />
          <rect x="40" y="212" width="264" height="72" rx="8" />
          <rect x="336" y="212" width="264" height="72" rx="8" />
          <rect x="40" y="302" width="180" height="22" rx="11" />
        </g>
        {/* A coastline contour through the hero block, because every build in
            this catalog stands on a map. */}
        <path
          d="M60 168 C 140 120, 200 176, 280 140 S 440 96, 580 132"
          fill="none"
          stroke={`hsl(${hue} 70% 70% / 0.8)`}
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        <circle cx="280" cy="140" r="5" fill="none" stroke={`hsl(${hue} 70% 70% / 0.9)`} strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
      <figcaption className="concept-figure-tag" aria-hidden="true">
        Concept
      </figcaption>
    </figure>
  );
}
