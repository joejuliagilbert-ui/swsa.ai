// Format-aware metadata gate (C3 correction 1): non-JPEG EXIF is detected and
// rejected, unsupported formats are rejected, clean JPEG is accepted.
import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectSourceMetadata } from "../scripts/check-source-media.mjs";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p);

test("REJECT: PNG carrying EXIF metadata", async () => {
  const r = await inspectSourceMetadata(read("test/fixtures/exif-png.png"));
  assert.equal(r.ok, false);
  assert.ok(r.reasons.some((x) => /EXIF/i.test(x)), r.reasons.join("; "));
});

test("REJECT: WebP carrying EXIF metadata", async () => {
  const r = await inspectSourceMetadata(read("test/fixtures/exif-webp.webp"));
  assert.equal(r.ok, false);
  assert.ok(r.reasons.some((x) => /EXIF/i.test(x)), r.reasons.join("; "));
});

test("REJECT: unsupported source format (TIFF)", async () => {
  const r = await inspectSourceMetadata(read("test/fixtures/unsupported.tiff"));
  assert.equal(r.ok, false);
  assert.ok(r.reasons.some((x) => /unsupported/i.test(x)), r.reasons.join("; "));
});

test("REJECT: non-image / unreadable source", async () => {
  const r = await inspectSourceMetadata(Buffer.from("this is not an image"));
  assert.equal(r.ok, false);
});

test("ACCEPT: clean JPEG", async () => {
  const r = await inspectSourceMetadata(read("test/fixtures/clean-source.jpg"));
  assert.equal(r.ok, true, r.reasons.join("; "));
});
