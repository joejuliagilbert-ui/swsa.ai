// Source-media gate: rejects EXIF/GPS sources and missing/false/incomplete
// consent-provenance; accepts a clean, approved source. Fixtures are synthetic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSource, detectExifGps, validateApproval } from "../scripts/check-source-media.mjs";
import { readFileSync } from "node:fs";

const baseDir = process.cwd();
const CLEAN = "test/fixtures/clean-source.jpg";
const GPS = "test/fixtures/gps-tagged-source.jpg";

const completeApproval = {
  sourceId: "fixture-1",
  provenance: "synthetic",
  publicUseApproved: true,
  approvalDate: "2026-07-24",
  privacyReview: "passed"
};

test("detector: GPS fixture is GPS-positive, clean fixture is clean", () => {
  assert.equal(detectExifGps(readFileSync(GPS)).hasGps, true);
  assert.equal(detectExifGps(readFileSync(CLEAN)).hasGps, false);
  assert.equal(detectExifGps(readFileSync(CLEAN)).hasExif, false);
});

test("REJECT: source carrying GPS metadata (even with complete approval)", async () => {
  const r = await validateSource({ file: GPS, approval: completeApproval, baseDir });
  assert.equal(r.ok, false);
  assert.ok(r.reasons.some((x) => /GPS|EXIF/.test(x)), r.reasons.join("; "));
});

test("REJECT: missing / false / incomplete consent-provenance", async () => {
  for (const bad of [
    undefined,
    { ...completeApproval, publicUseApproved: false },
    { ...completeApproval, privacyReview: "pending" },
    { sourceId: "x", provenance: "y" }
  ]) {
    assert.equal(validateApproval(bad).ok, false, JSON.stringify(bad));
    assert.equal((await validateSource({ file: CLEAN, approval: bad, baseDir })).ok, false);
  }
});

test("ACCEPT: clean source with a complete, approved record", async () => {
  const r = await validateSource({ file: CLEAN, approval: completeApproval, baseDir });
  assert.equal(r.ok, true, r.reasons.join("; "));
});
