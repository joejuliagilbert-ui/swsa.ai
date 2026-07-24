// Fail-closed media gate (C2 hardening) — function-level proofs at the exact
// choke point the image pipeline calls (assertSourceAllowed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertSourceAllowed, loadManifest } from "../scripts/check-source-media.mjs";

const baseDir = process.cwd();

test("missing manifest -> throws (fail-closed)", () => {
  assert.throws(() => loadManifest("does/not/exist.json"), /missing/i);
});

test("malformed manifest -> throws (fail-closed)", () => {
  assert.throws(() => loadManifest("test/_neg/malformed-manifest.json"), /malformed/i);
});

test("unmanifested source -> rejected", () => {
  assert.throws(
    () => assertSourceAllowed("test/fixtures/unmanifested.jpg", { baseDir }),
    /unmanifested/i
  );
});

test("manifested but unapproved source -> rejected", () => {
  assert.throws(
    () => assertSourceAllowed("test/fixtures/clean-source.jpg", { baseDir, manifestPath: "test/_neg/neg-manifest-unapproved.json" }),
    /REJECTED/i
  );
});

test("manifested + approved + clean source -> allowed", () => {
  assert.equal(assertSourceAllowed("src/assets/img-src/generated-context.jpg", { baseDir }), true);
});
