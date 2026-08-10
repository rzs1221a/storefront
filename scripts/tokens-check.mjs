/*
 * Token guardrail — the design system stays a system only if drift fails loudly.
 *
 * Fails on:
 *   1. Arbitrary-value type/radius/shadow utilities in TSX (`text-[…]`,
 *      `rounded-[…]`, `shadow-[…]`) — every size must be a named step.
 *   2. Raw white-alpha literals in TSX — the tint ladder is the only source.
 *   3. Bare `ease` transitions in index.css — easing goes through the tokens.
 *
 * Run: npm run tokens. Deliberately NOT part of `npm run build` — the build
 * stays fast and always shippable; this is the review gate.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const failures = [];

function walk(dir, ext, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

function check(file, re, message) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (re.test(line)) {
      failures.push(`${relative(ROOT, file)}:${i + 1} — ${message}\n    ${line.trim()}`);
    }
  });
}

// MapLibre paint properties are WebGL values — CSS variables cannot reach
// them, so map styling files are exempt from the tint-ladder rule.
const MAP_STYLE_FILES = new Set(["LiveMap.tsx", "StarSky.tsx"]);

for (const file of walk(join(ROOT, "src"), ".tsx")) {
  check(file, /\b(?:text|rounded|shadow)-\[/, "arbitrary value; use a named token step");
  if (!MAP_STYLE_FILES.has(file.split("/").pop())) {
    check(file, /rgba\(\s*255\s*,\s*255\s*,\s*255/, "raw white alpha; use the --tint ladder");
  }
}

const css = join(ROOT, "src", "index.css");
check(css, /transition[^;]*\s+ease\s*[,;]/, "bare `ease`; use an --ease-* token");
check(css, /transition:\s*[^;]*\s+ease$/, "bare `ease`; use an --ease-* token");

// Backdrop blur exists for exactly one reason: overlays floating over the
// live chart inside the exhibit (--glass-filter-heavy). Any other
// backdrop-filter is decoration with nothing to refract, at GPU cost.
{
  const text = readFileSync(css, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    // Declarations only — @supports feature-query conditions also contain
    // the property name but never end in a semicolon.
    if (!/backdrop-filter:[^;]*;/.test(line)) return;
    if (
      /var\(--glass-filter-heavy\)|var\(--glass-filter-nav\)|backdrop-filter:\s*none/.test(
        line
      )
    )
      return;
    if (/^\s*\*/.test(line) || /^\s*\/\*/.test(line)) return; // comments
    failures.push(
      `src/index.css:${i + 1} — backdrop-filter outside the exhibit; use --glass-filter-heavy or none\n    ${line.trim()}`
    );
  });
}

if (failures.length) {
  console.error(`tokens-check: ${failures.length} violation(s)\n`);
  for (const f of failures) console.error(`  ${f}\n`);
  process.exit(1);
}
console.log("tokens-check: clean");
