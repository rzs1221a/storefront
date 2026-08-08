import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolve, type Resolution } from "../lib/semantic";

/**
 * Type plainly and it takes you there.
 *
 * The site claims search that speaks English; this demonstrates it rather than
 * describing it. Press `/` from anywhere, or click the field.
 *
 * It writes back what it understood, and when it does not understand it says
 * so instead of guessing — on a sales page a confident wrong answer costs more
 * than an honest shrug.
 *
 * `onResolve` lets a host redirect a hit somewhere other than the router —
 * the demo helm on the home page flies the map camera instead of navigating.
 * Return true to suppress the navigation; the readback still happens, because
 * saying what was understood IS the demonstration.
 */

const EXAMPLES = [
  "I sell waterfront",
  "what does this cost",
  "how long does it take",
  "show me the brokerage site",
];

export default function CommandBar({
  examples = EXAMPLES,
  onResolve,
}: {
  examples?: string[];
  onResolve?: (hit: Resolution) => boolean | void;
} = {}) {
  const [value, setValue] = useState("");
  const [said, setSaid] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState(examples[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  // The bar can mount twice on one page (masthead + demo helm); ids must not.
  const inputId = useId();

  /* `/` focuses the field, the way every serious tool does. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const el = document.activeElement;
      // Never steal the key from someone already typing.
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Cycle the examples so the field teaches its own syntax. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % examples.length;
      setPlaceholder(examples[i]);
    }, 4200);
    return () => window.clearInterval(id);
  }, [examples]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const hit = resolve(value);
    if (!hit) {
      setSaid(
        "I did not follow that. Try a place, a price, or what you sell — or use the list above."
      );
      return;
    }
    setSaid(hit.understood);
    setValue("");
    if (onResolve?.(hit) !== true) {
      navigate(hit.destination.path);
    }
    // Clear the confirmation after it has been read, so the rail does not
    // accumulate stale sentences.
    window.setTimeout(() => setSaid(null), 5200);
  }

  return (
    <form onSubmit={submit} className="command">
      <label htmlFor={inputId} className="sr-only">
        Describe what you are looking for
      </label>
      <div className="command-field">
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          aria-hidden="true"
          className="flex-none text-(--color-ink-faint)"
        >
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8.5 8.5L11.5 11.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <input
          id={inputId}
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="command-input"
        />
        <kbd className="command-key" aria-hidden="true">
          /
        </kbd>
      </div>

      {/* Announced politely: it is a confirmation, not an interruption. */}
      <p className="command-said" role="status" aria-live="polite">
        {said}
      </p>
    </form>
  );
}
