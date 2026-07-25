// C4A correction: guards against unsupported localized-prevalence claims and the
// unapproved named-town list re-entering built HTML.
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

// Rejected localized-prevalence phrasings + unapproved town list.
const banned = [
  /Most Albuquerque homes/i,
  /Santa Fe installs focus/i,
  /Four Corners homes often/i,
  /Durango-area homes often/i,
  /\bAztec\b/,
  /\bBloomfield\b/,
  /\bKirtland\b/
];

test("no unsupported localized-prevalence claims or unapproved town list in built HTML", () => {
  const hits = [];
  for (const f of htmlFiles(SITE)) {
    const html = readFileSync(f, "utf8");
    for (const re of banned) {
      const m = html.match(re);
      if (m) hits.push(`${f}: ${re} -> "${m[0]}"`);
    }
  }
  assert.equal(hits.length, 0, `rejected localized claim(s) found:\n${hits.join("\n")}`);
});
