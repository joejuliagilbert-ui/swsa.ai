// Generates SYNTHETIC placeholder images so the responsive image pipeline can be
// proven WITHOUT touching any customer media. These are not proof content and
// must never represent a real installation. Every output is listed (approved) in
// src/_data/media-approvals.json.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT_DIR = "src/assets/img-src";
mkdirSync(OUT_DIR, { recursive: true });

async function make(file, w, h, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#25324E"/><stop offset="1" stop-color="#72B7E1"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="46%" fill="#F7F7F4" font-family="sans-serif" font-size="${Math.round(w/28)}" font-weight="700" text-anchor="middle">${label}</text>
    <text x="50%" y="54%" fill="#F7F7F4" font-family="sans-serif" font-size="${Math.round(w/48)}" text-anchor="middle">SYNTHETIC PLACEHOLDER — NOT CUSTOMER MEDIA</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(`${OUT_DIR}/${file}`);
  console.log(`Generated ${OUT_DIR}/${file} (${w}x${h})`);
}

await make("generated-context.jpg", 1600, 1067, "SWSA · Quiet Precision");
await make("generated-detail.jpg", 1200, 1200, "SWSA · Installation detail");
