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

// C4B: the two name-bearing transition routes are intentionally removed from the
// sitemap; every other current URL is preserved.
const TRANSITION = [
  "/installs/albuquerque-security-installation-june-2026-diego.html",
  "/installs/albuquerque-security-installation-march-2026-annette.html"
];

test("generated sitemap preserves current content URLs and excludes non-indexable/transition pages", () => {
  const current = [...readFileSync(join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  const generated = readFileSync(join(SITE, "sitemap.xml"), "utf8");
  for (const url of current) {
    const path = url.replace(ORIGIN, "");
    if (TRANSITION.includes(path)) {
      assert.ok(!generated.includes(`<loc>${url}</loc>`), `sitemap must exclude transition route ${url}`);
    } else {
      assert.ok(generated.includes(`<loc>${url}</loc>`), `sitemap missing current URL ${url}`);
    }
  }
  for (const excluded of ["/404.html", "/review.html", ...TRANSITION]) {
    assert.ok(!generated.includes(`<loc>${ORIGIN}${excluded}</loc>`), `sitemap should exclude ${excluded}`);
  }
});
