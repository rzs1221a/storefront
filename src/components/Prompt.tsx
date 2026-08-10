import { type ReactNode } from "react";
import { ask } from "../lib/ask";

/**
 * The asked-and-answered grammar, shared by every route: section headers
 * are the buyer's own questions, typed into the site's slash prompt, and
 * clicking one opens the real search sheet with the question prefilled —
 * the header demonstrates the product.
 */

/** A section opener: the buyer's question in the slash prompt. */
export function PromptChip({ question }: { question: string }) {
  return (
    <button type="button" className="prompt-chip" onClick={() => ask(question)}>
      <span className="prompt-chip-key" aria-hidden="true">
        /
      </span>
      <span className="prompt-chip-q">{question}</span>
    </button>
  );
}

/** The link pair: accent text links with the › that means "go". */
export function TileLinks({ children }: { children: ReactNode }) {
  return <p className="tile-links">{children}</p>;
}
