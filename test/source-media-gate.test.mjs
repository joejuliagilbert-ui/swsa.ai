// Source-media gate (correction 2): proves the build-time validator REJECTS a
// source carrying EXIF/GPS and REJECTS incomplete/false consent-provenance, and
// ACCEPTS a clean source with a complete approval record. Fixtures are synthetic
// (npm run fixtures) — no customer media.
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

test("REJECT: source carrying GPS metadata (even with complete approval)", () => {
  const r = validateSource({ file: GPS, approval: completeApproval, baseDir });
  assert.equal(r.ok, false);
  assert.ok(r.reasons.some((x) => /GPS/.test(x)), r.reasons.join("; "));
});

test("REJECT: missing / false / incomplete consent-provenance", () => {
  for (const bad of [
    undefined,
    { ...completeApproval, publicUseApproved: false },
    { ...completeApproval, privacyReview: "pending" },
    { sourceId: "x", provenance: "y" } // missing fields
  ]) {
    assert.equal(validateApproval(bad).ok, false, JSON.stringify(bad));
    assert.equal(validateSource({ file: CLEAN, approval: bad, baseDir }).ok, false);
  }
});

test("ACCEPT: clean source with a complete, approved record", () => {
  const r = validateSource({ file: CLEAN, approval: completeApproval, baseDir });
  assert.equal(r.ok, true, r.reasons.join("; "));
});
