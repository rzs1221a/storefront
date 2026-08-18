// Renders public/og.png (1200×630) from an inline SVG via sharp.
// Run once (`npm run og`) and commit the PNG; crawlers want raster OG images.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#14161c"/>
      <stop offset="0.7" stop-color="#0a0a0e"/>
      <stop offset="1" stop-color="#341629"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g stroke="#a85484" stroke-opacity="0.25" stroke-width="1.5">
    <line x1="0" y1="470" x2="1200" y2="410"/>
    <line x1="0" y1="500" x2="1200" y2="448"/>
  </g>
  <circle cx="1020" cy="120" r="9" fill="#a85484"/>
  <text x="96" y="300" font-family="Helvetica, Arial, sans-serif" font-size="96" font-weight="700" fill="#f5f5f7">FERRY <tspan fill="#c98cad" font-weight="300">CRE</tspan></text>
  <text x="96" y="370" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#b9bac2">Nassau County commercial real estate</text>
  <text x="96" y="540" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#7e808c">Antoinette Ferry · BHHS Heymann Williams Realty · ferrycre.com</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(path.join(root, "public/og.png"));
console.log("Wrote public/og.png");
