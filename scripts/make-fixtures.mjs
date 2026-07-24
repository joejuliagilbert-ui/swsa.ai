// Generates SYNTHETIC test fixtures for the source-media gate. No customer media.
//  - clean-source.jpg      : sharp-encoded, no metadata
//  - gps-tagged-source.jpg : clean JPEG with a hand-crafted EXIF APP1 + GPS IFD
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { detectExifGps } from "./check-source-media.mjs";

const DIR = "test/fixtures";
mkdirSync(DIR, { recursive: true });

// 1) Clean source (no metadata)
const clean = await sharp({
  create: { width: 64, height: 64, channels: 3, background: { r: 120, g: 130, b: 150 } }
}).jpeg().toBuffer();
writeFileSync(`${DIR}/clean-source.jpg`, clean);

// 2) GPS-tagged source: build a minimal little-endian TIFF/EXIF with a GPS IFD.
// IFD0 holds one entry: GPSInfo pointer (tag 0x8825) -> GPS IFD offset.
const tiff = Buffer.alloc(44);
tiff.write("II", 0, "ascii");     // little-endian
tiff.writeUInt16LE(0x002a, 2);    // TIFF magic
tiff.writeUInt32LE(8, 4);         // IFD0 at offset 8
// IFD0 @8
tiff.writeUInt16LE(1, 8);         // 1 entry
tiff.writeUInt16LE(0x8825, 10);   // tag: GPSInfo IFD pointer
tiff.writeUInt16LE(4, 12);        // type: LONG
tiff.writeUInt32LE(1, 14);        // count
tiff.writeUInt32LE(26, 18);       // value: GPS IFD offset
tiff.writeUInt32LE(0, 22);        // next IFD = 0
// GPS IFD @26
tiff.writeUInt16LE(1, 26);        // 1 entry
tiff.writeUInt16LE(0x0001, 28);   // tag: GPSLatitudeRef
tiff.writeUInt16LE(2, 30);        // type: ASCII
tiff.writeUInt32LE(2, 32);        // count
tiff.write("N\0", 36, "ascii");   // inline value
tiff.writeUInt32LE(0, 40);        // next IFD = 0

const exifPayload = Buffer.concat([Buffer.from("Exif\0\0", "ascii"), tiff]);
const app1 = Buffer.concat([
  Buffer.from([0xff, 0xe1]),
  (() => { const b = Buffer.alloc(2); b.writeUInt16BE(exifPayload.length + 2, 0); return b; })(),
  exifPayload
]);
const gpsTagged = Buffer.concat([Buffer.from([0xff, 0xd8]), app1, clean.subarray(2)]);
writeFileSync(`${DIR}/gps-tagged-source.jpg`, gpsTagged);

// Self-check
const c = detectExifGps(clean);
const g = detectExifGps(gpsTagged);
console.log(`  clean-source.jpg      -> hasExif=${c.hasExif} hasGps=${c.hasGps}`);
console.log(`  gps-tagged-source.jpg -> hasExif=${g.hasExif} hasGps=${g.hasGps}`);
if (c.hasGps || !g.hasGps) { console.error("Fixture self-check FAILED"); process.exit(1); }
console.log("Fixtures generated and self-checked.");
