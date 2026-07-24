// Route-preservation gate: every CURRENT sitemap URL must be emitted by the new
// build at its exact path, with a correct self-canonical. New Foundation-Gate
// routes must also exist. Fails if any current URL would be dropped.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = join(ROOT, "_site");
const ORIGIN = "https://swsa.ai";

function sitemapPaths() {
  const xml = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
    m[1].replace(ORIGIN, "")
  );
}

// "/" -> _site/index.html ; "/foo.html" -> _site/foo.html
function outputFileFor(urlPath) {
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");
  return join(SITE, rel);
}

// C4B: two name-bearing legacy routes are preserved as transition pages that
// canonicalize to Recent Work (not self).
const TRANSITION = new Set([
  "/installs/albuquerque-security-installation-june-2026-diego.html",
  "/installs/albuquerque-security-installation-march-2026-annette.html"
]);

test("every current URL is emitted; content routes self-canonical, transitions point to Recent Work", () => {
  const paths = sitemapPaths();
  assert.equal(paths.length, 19, "expected 19 current sitemap URLs");
  for (const p of paths) {
    const file = outputFileFor(p);
    assert.ok(existsSync(file), `missing output for ${p} (${file})`);
    const html = readFileSync(file, "utf8");
    const expected = TRANSITION.has(p)
      ? `<link rel="canonical" href="${ORIGIN}/recent-installations.html">`
      : `<link rel="canonical" href="${ORIGIN}${p}">`;
    assert.ok(html.includes(expected), `wrong/absent canonical for ${p}`);
  }
});

test("new Foundation-Gate routes are emitted", () => {
  for (const p of ["/home-security.html", "/about.html", "/contact.html", "/404.html", "/review.html"]) {
    assert.ok(existsSync(outputFileFor(p)), `missing new route ${p}`);
  }
});
