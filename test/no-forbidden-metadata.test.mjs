// Media-safety gate: every generated public image derivative must carry NO EXIF
// (hence no GPS) metadata. Proves the pipeline strips location data by design.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OPT = join(process.cwd(), "_site", "assets", "img", "opt");

function imageFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...imageFiles(full));
    else if (/\.(jpe?g|webp|avif|png)$/i.test(name)) out.push(full);
  }
  return out;
}

test("responsive image pipeline produced derivatives", () => {
  assert.ok(imageFiles(OPT).length > 0, "no generated derivatives found");
});

test("no generated derivative contains EXIF/GPS metadata", async () => {
  for (const f of imageFiles(OPT)) {
    const meta = await sharp(f).metadata();
    assert.equal(meta.exif, undefined, `EXIF present in derivative ${f}`);
  }
});
