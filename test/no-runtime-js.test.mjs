// Near-zero-JS + no-third-party-origin gate. Confirms the build ships no runtime
// JavaScript, no third-party asset origins, and no third-party FORM endpoint.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SITE = join(process.cwd(), "_site");

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

const files = htmlFiles(SITE);

test("build produced HTML pages", () => {
  assert.ok(files.length >= 24, `expected all pages, found ${files.length}`);
});

test("no runtime JavaScript (only ld+json inline scripts, no external scripts)", () => {
  for (const f of files) {
    const html = readFileSync(f, "utf8");
    assert.ok(!/<script\s+[^>]*\bsrc=/i.test(html), `external <script src> in ${f}`);
    for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
      assert.ok(/type\s*=\s*["']application\/ld\+json["']/i.test(m[1]), `unexpected inline <script> in ${f}`);
    }
  }
});

test("no third-party asset or form origins", () => {
  const banned = ["fonts.googleapis.com", "fonts.gstatic.com", "formspree.io"];
  for (const f of files) {
    const html = readFileSync(f, "utf8");
    for (const bad of banned) assert.ok(!html.includes(bad), `third-party origin ${bad} in ${f}`);
    for (const m of html.matchAll(/<form\b([^>]*)>/gi)) {
      assert.ok(!/\baction\s*=/i.test(m[1]), `<form> emits an action attribute in ${f}`);
    }
  }
});
