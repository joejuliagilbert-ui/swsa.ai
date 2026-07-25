// D1A release-readiness: runtime contract, CI validation workflow, manual-only
// Pages deploy workflow, intake staging guard, and CNAME integrity.
// Text assertions only (no YAML dependency added).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const validate = read(".github/workflows/validate.yml");
const deploy = read(".github/workflows/deploy-pages.yml");

// Extract the indented body of a top-level `key:` block until the next
// top-level (column-0) key.
function topBlock(text, key) {
  const m = text.match(new RegExp(`(^|\\n)${key}:[^\\n]*\\n([\\s\\S]*?)(?=\\n\\S|$)`));
  return m ? m[2] : "";
}

test(".nvmrc is exactly 24", () => {
  assert.equal(read(".nvmrc").trim(), "24");
});

test("package.json requires Node 24.x and adds no dependency churn", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.engines?.node, "24.x");
});

test("CNAME remains exactly swsa.ai", () => {
  assert.equal(read("CNAME").trim(), "swsa.ai");
});

test("validate.yml triggers only on pull_request -> main, read-only, runs ci+test", () => {
  const on = topBlock(validate, "on");
  assert.match(on, /pull_request:/);
  assert.match(on, /branches:\s*\[\s*main\s*\]/);
  assert.ok(!/workflow_dispatch|push:|schedule:/.test(on), "validate must trigger only on pull_request");
  const perms = topBlock(validate, "permissions");
  assert.match(perms, /contents:\s*read/);
  assert.ok(!/write/.test(perms), "validate permissions must be read-only");
  assert.match(validate, /run:\s*npm ci/);
  assert.match(validate, /run:\s*npm test/);
  assert.match(validate, /runs-on:\s*ubuntu-latest/);
  assert.match(validate, /timeout-minutes:\s*(\d|10)\b/);
});

test("deploy-pages.yml triggers only on workflow_dispatch (no push/pr/schedule)", () => {
  const on = topBlock(deploy, "on");
  assert.match(on, /workflow_dispatch:/);
  assert.ok(!/\bpush:/.test(on), "no push trigger");
  assert.ok(!/pull_request:/.test(on), "no pull_request trigger");
  assert.ok(!/schedule:/.test(on), "no schedule trigger");
});

test("deploy-pages.yml has exactly the required top-level permissions", () => {
  const perms = topBlock(deploy, "permissions");
  const keys = [...perms.matchAll(/^\s*([a-z-]+):/gim)].map((m) => m[1]).sort();
  assert.deepEqual(keys, ["contents", "id-token", "pages"]);
  assert.match(perms, /contents:\s*read/);
  assert.match(perms, /pages:\s*write/);
  assert.match(perms, /id-token:\s*write/);
});

test("deploy-pages.yml uploads _site and deploys via a separate github-pages job", () => {
  assert.match(deploy, /upload-pages-artifact@v\d+/);
  assert.match(deploy, /path:\s*_site\b/);
  assert.match(deploy, /concurrency:\s*\n\s*group:\s*pages/);
  assert.match(deploy, /cancel-in-progress:\s*false/);
  // separate deploy job that needs build and targets the github-pages environment
  const deployJob = deploy.slice(deploy.indexOf("\n  deploy:"));
  assert.match(deployJob, /needs:\s*build/);
  assert.match(deployJob, /environment:\s*\n\s*name:\s*github-pages/);
  assert.match(deployJob, /deploy-pages@v\d+/);
});

test(".gitignore guards the four intake areas and retains the two selected assets", () => {
  const gi = read(".gitignore");
  assert.match(gi, /^docs\/brand-assets\/$/m);
  assert.match(gi, /^src\/assets\/people\/$/m);
  assert.match(gi, /^src\/assets\/brand\/components\/\*$/m);
  assert.match(gi, /^!src\/assets\/brand\/components\/swsa-ai-navy\.png$/m);
  assert.match(gi, /^src\/assets\/partners\/\*$/m);
  assert.match(gi, /^!src\/assets\/partners\/secure24-adt-authorized-dealer-blue\.svg$/m);
});

test("no workflow references secrets, Formspree, or a third-party deploy target", () => {
  for (const wf of [validate, deploy]) {
    assert.ok(!/secrets\./.test(wf), "no secret references");
    assert.ok(!/formspree/i.test(wf), "no Formspree action");
    assert.ok(!/(cloudflare|netlify|vercel|amazonaws|s3-|rsync|ftp-deploy|surge\.sh)/i.test(wf), "no third-party deploy target");
  }
});

test("workflows pin the exact official major action versions", () => {
  // Required exact pins in the correct workflows.
  assert.match(validate, /actions\/checkout@v7\b/);
  assert.match(validate, /actions\/setup-node@v7\b/);
  assert.match(deploy, /actions\/checkout@v7\b/);
  assert.match(deploy, /actions\/setup-node@v7\b/);
  assert.match(deploy, /actions\/configure-pages@v6\b/);
  assert.match(deploy, /actions\/upload-pages-artifact@v5\b/);
  assert.match(deploy, /actions\/deploy-pages@v5\b/);
  // No superseded pin may remain in either workflow.
  const superseded = [
    /actions\/checkout@v[1-6]\b/, /actions\/setup-node@v[1-6]\b/,
    /actions\/configure-pages@v[1-5]\b/, /actions\/upload-pages-artifact@v[1-4]\b/,
    /actions\/deploy-pages@v[1-4]\b/
  ];
  for (const wf of [validate, deploy]) {
    for (const re of superseded) assert.ok(!re.test(wf), `superseded pin present: ${re}`);
  }
});
