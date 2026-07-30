/**
 * Copy helpers for derived counts.
 *
 * The site used to hand-type "Five sites" and "Three packages" in half a dozen
 * places, and every one of them was a lie waiting to happen the day the count
 * changed. Anything that states a count now derives it through here.
 */

const WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

/** "Five" for 5, "Twelve" for 12, "24" past twelve — sentence-leading case. */
export function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/** Lowercase variant for mid-sentence use: "five sites", "24 options". */
export function numberWordLower(n: number): string {
  return WORDS[n] ? WORDS[n].toLowerCase() : String(n);
}
