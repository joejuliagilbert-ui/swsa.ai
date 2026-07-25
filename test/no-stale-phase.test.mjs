// Prevents stale phase promises / future-state delivery claims from returning in
// built public HTML (C3 correction 2).
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

const banned = [
  /\bC[12]\b/,                 // bare phase tokens
  /Work Package/i,
  /delivered in C\d/i,
  /pending Work Package/i,
  /C1 proof/i
];

test("no stale phase / future-state delivery claims in built HTML", () => {
  const hits = [];
  for (const f of htmlFiles(SITE)) {
    const html = readFileSync(f, "utf8");
    for (const re of banned) {
      const m = html.match(re);
      if (m) hits.push(`${f}: ${re} -> "${m[0]}"`);
    }
  }
  assert.equal(hits.length, 0, `stale phase language found:\n${hits.join("\n")}`);
});
