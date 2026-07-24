// Fail-closed media gate — BUILD-LEVEL proofs. Runs the real Eleventy build
// against isolated fixtures and asserts the build FAILS (non-zero, no output)
// when a source image is unmanifested or manifested-but-unapproved.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

function runBuild(inputDir, outDir, env) {
  return spawnSync(
    "npx",
    ["@11ty/eleventy", "--input", inputDir, "--output", outDir, "--config", "eleventy.config.js"],
    { cwd: process.cwd(), encoding: "utf8", env: { ...process.env, ...env } }
  );
}

test("BUILD FAILS: unmanifested source cannot build", () => {
  const out = "test/_neg/a/_site";
  rmSync(out, { recursive: true, force: true });
  const r = runBuild("test/_neg/a", out, { SWSA_MEDIA_MANIFEST: "" });
  assert.notEqual(r.status, 0, "build unexpectedly succeeded for unmanifested source");
  assert.match(`${r.stdout}${r.stderr}`, /unmanifested/i);
  assert.ok(!existsSync(`${out}/neg-unmanifested.html`), "no output should be produced");
});

test("BUILD FAILS: shortcode-referenced unapproved source cannot build", () => {
  const out = "test/_neg/b/_site";
  rmSync(out, { recursive: true, force: true });
  const r = runBuild("test/_neg/b", out, { SWSA_MEDIA_MANIFEST: "test/_neg/neg-manifest-unapproved.json" });
  assert.notEqual(r.status, 0, "build unexpectedly succeeded for unapproved source");
  assert.match(`${r.stdout}${r.stderr}`, /REJECTED|publicUseApproved|not approved/i);
  assert.ok(!existsSync(`${out}/neg-unapproved.html`), "no output should be produced");
});
