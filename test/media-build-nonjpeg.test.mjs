// Fail-closed media gate — BUILD-LEVEL non-JPEG proofs. A manifested-AND-APPROVED
// PNG (and WebP) that carries EXIF must still fail the real Eleventy build.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

function runBuild(inputDir, outDir, manifest) {
  return spawnSync(
    "npx",
    ["@11ty/eleventy", "--input", inputDir, "--output", outDir, "--config", "eleventy.config.js"],
    { cwd: process.cwd(), encoding: "utf8", env: { ...process.env, SWSA_MEDIA_MANIFEST: manifest } }
  );
}

test("BUILD FAILS: manifested+approved PNG with EXIF cannot build", () => {
  const out = "test/_neg/c/_site";
  rmSync(out, { recursive: true, force: true });
  const r = runBuild("test/_neg/c", out, "test/_neg/neg-manifest-png-approved.json");
  assert.notEqual(r.status, 0, "build unexpectedly succeeded for EXIF PNG");
  assert.match(`${r.stdout}${r.stderr}`, /REJECTED|EXIF/i);
  assert.ok(!existsSync(`${out}/neg-png-exif.html`), "no output should be produced");
});

test("BUILD FAILS: manifested+approved WebP with EXIF cannot build", () => {
  const out = "test/_neg/d/_site";
  rmSync(out, { recursive: true, force: true });
  const r = runBuild("test/_neg/d", out, "test/_neg/neg-manifest-webp-approved.json");
  assert.notEqual(r.status, 0, "build unexpectedly succeeded for EXIF WebP");
  assert.match(`${r.stdout}${r.stderr}`, /REJECTED|EXIF/i);
  assert.ok(!existsSync(`${out}/neg-webp-exif.html`), "no output should be produced");
});
