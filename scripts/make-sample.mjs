// Generates a SYNTHETIC placeholder image so the responsive image pipeline can
// be proven end-to-end WITHOUT touching any customer media. This is not proof
// content and must never represent a real installation.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT_DIR = "src/assets/img-src";
mkdirSync(OUT_DIR, { recursive: true });

const W = 1600;
const H = 1067;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#25324E"/>
      <stop offset="1" stop-color="#72B7E1"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="47%" fill="#F7F7F4" font-family="sans-serif" font-size="56" font-weight="700" text-anchor="middle">SWSA · Quiet Precision</text>
  <text x="50%" y="55%" fill="#F7F7F4" font-family="sans-serif" font-size="28" text-anchor="middle">SYNTHETIC PLACEHOLDER — NOT CUSTOMER MEDIA</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(`${OUT_DIR}/generated-context.jpg`);
console.log(`Generated synthetic placeholder ${OUT_DIR}/generated-context.jpg (${W}x${H})`);
