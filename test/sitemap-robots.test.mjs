// Generated robots.txt + sitemap.xml: preserve all current URLs; exclude
// non-indexable pages.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = join(ROOT, "_site");
const ORIGIN = "https://swsa.ai";

test("robots.txt is generated and references the sitemap", () => {
  const robots = readFileSync(join(SITE, "robots.txt"), "utf8");
  assert.match(robots, /Allow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${ORIGIN}/sitemap\\.xml`));
});

test("generated sitemap preserves every current URL and excludes non-indexable pages", () => {
  const current = [...readFileSync(join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  const generated = readFileSync(join(SITE, "sitemap.xml"), "utf8");
  for (const url of current) {
    assert.ok(generated.includes(`<loc>${url}</loc>`), `sitemap missing current URL ${url}`);
  }
  for (const excluded of ["/404.html", "/review.html", "/recent-work/sample-installation.html"]) {
    assert.ok(!generated.includes(`<loc>${ORIGIN}${excluded}</loc>`), `sitemap should exclude ${excluded}`);
  }
});
