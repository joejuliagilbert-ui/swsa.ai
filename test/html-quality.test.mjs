// HTML-quality + claim-alignment gate (corrections 3, 4, 5, 7, 1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = join(ROOT, "_site");

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

test("exactly one H1 per page", () => {
  for (const f of files) {
    const n = (readFileSync(f, "utf8").match(/<h1\b/gi) || []).length;
    assert.equal(n, 1, `${f} has ${n} H1s`);
  }
});

test("no duplicate element IDs", () => {
  for (const f of files) {
    const ids = [...readFileSync(f, "utf8").matchAll(/\bid="([^"]+)"/gi)].map((m) => m[1]);
    assert.equal(ids.length, new Set(ids).size, `duplicate id in ${f}: ${ids.join(",")}`);
  }
});

test("public brand identity is SWSA.ai (wordmark + title)", () => {
  for (const f of files) {
    const html = readFileSync(f, "utf8");
    // Header wordmark is an image whose accessible name is SWSA.ai.
    assert.ok(/class="brand-wordmark"[^>]*alt="SWSA\.ai"/.test(html), `header wordmark missing accessible SWSA.ai in ${f}`);
    const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
    assert.ok(title.includes("SWSA.ai"), `title missing SWSA.ai in ${f}: "${title}"`);
  }
});

// Truthfulness is a property of CONTROLS, not prose: an action link whose label
// says "Text" must use sms:, one that says "Call" must use tel:. A control
// labeled "Call or Text" would require both schemes at once and correctly fails.
test("Call/Text action controls are truthful (Call=tel:, Text=sms:)", () => {
  for (const f of files) {
    const html = readFileSync(f, "utf8");
    for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      const href = m[1];
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      if (/\bText\b/.test(text)) assert.ok(href.startsWith("sms:"), `control "${text}" is not sms: in ${f}`);
      if (/\bCall\b/.test(text)) assert.ok(href.startsWith("tel:"), `control "${text}" is not tel: in ${f}`);
    }
  }
});

test("contact form is non-submitting (no action, no submit, no novalidate)", () => {
  const html = readFileSync(join(SITE, "contact.html"), "utf8");
  const form = (html.match(/<form\b[\s\S]*?<\/form>/i) || [])[0] || "";
  assert.ok(form, "no form found on contact.html");
  assert.ok(!/\baction\s*=/i.test(form), "form has an action");
  assert.ok(!/\bnovalidate\b/i.test(form), "form uses novalidate");
  assert.ok(!/type\s*=\s*["']submit["']/i.test(form), "form has a submit control");
  assert.ok(/type\s*=\s*["']button["']/i.test(form) && /\bdisabled\b/i.test(form), "submit control is not a disabled button");
  assert.ok(!/autocomplete\s*=\s*["']tel email["']/i.test(form), "invalid combined autocomplete present");
});

test("no executable deploy workflow present in the repo", () => {
  const wf = join(ROOT, ".github", "workflows");
  const yml = existsSync(wf) ? readdirSync(wf).filter((n) => /\.ya?ml$/i.test(n)) : [];
  assert.equal(yml.length, 0, `unexpected workflow file(s): ${yml.join(", ")}`);
});
