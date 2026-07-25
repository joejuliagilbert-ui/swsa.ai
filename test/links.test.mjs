// No broken internal links: every internal href in the built site resolves to a
// generated file (or in-page fragment).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
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

function resolves(href) {
  if (/^(https?:|tel:|sms:|mailto:|#)/i.test(href)) return true; // external / in-page
  const path = href.split("#")[0].split("?")[0];
  if (path === "" || path === "/") return existsSync(join(SITE, "index.html"));
  const rel = path.replace(/^\//, "");
  const target = join(SITE, rel);
  if (existsSync(target)) return true;
  if (rel.endsWith("/")) return existsSync(join(target, "index.html"));
  return false;
}

test("no broken internal links", () => {
  const broken = [];
  for (const f of htmlFiles(SITE)) {
    const html = readFileSync(f, "utf8");
    for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
      if (!resolves(m[1])) broken.push(`${f}: ${m[1]}`);
    }
  }
  assert.equal(broken.length, 0, `broken links:\n${broken.join("\n")}`);
});
