// C5 preview-readiness: no synthetic/prototype/placeholder artefacts remain,
// every offered contact action is functional, and evidence-bearing routes use
// only approved project crops.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = join(ROOT, "_site");
const readSite = (r) => readFileSync(join(SITE, r), "utf8");

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}
const ALL_HTML = htmlFiles(SITE);

test("no synthetic / prototype / placeholder language in built HTML", () => {
  const banned = [
    /synthetic/i, /placeholder/i, /prototype/i, /local, non-production preview/i,
    /content pending approval/i, /proof pending/i, /coming soon/i, /not yet active on this preview/i
  ];
  const hits = [];
  for (const f of ALL_HTML) {
    const html = readFileSync(f, "utf8");
    for (const re of banned) { const m = html.match(re); if (m) hits.push(`${f}: ${re} -> "${m[0]}"`); }
  }
  assert.equal(hits.length, 0, `forbidden language:\n${hits.join("\n")}`);
});

test("no reference to the retired synthetic images anywhere in src or _site", () => {
  const roots = ["src", "_site"];
  const bad = [];
  function walk(dir) {
    for (const n of readdirSync(dir)) {
      const full = join(dir, n);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (/\.(njk|md|html|json|js|css)$/.test(n)) {
        const t = readFileSync(full, "utf8");
        if (t.includes("generated-context.jpg") || t.includes("generated-detail.jpg")) bad.push(full);
      }
    }
  }
  for (const r of roots) if (existsSync(join(ROOT, r))) walk(join(ROOT, r));
  assert.deepEqual(bad, [], `references to retired synthetic images: ${bad.join(", ")}`);
});

test("retired synthetic source files do not exist", () => {
  assert.ok(!existsSync(join(ROOT, "src/assets/img-src/generated-context.jpg")));
  assert.ok(!existsSync(join(ROOT, "src/assets/img-src/generated-detail.jpg")));
});

test("contact page: working tel/sms/mailto, no form, no disabled control, no form claim", () => {
  const h = readSite("contact.html");
  assert.match(h, /href="tel:5053317834"/);
  assert.match(h, /href="sms:5053317834"/);
  assert.match(h, /href="mailto:joe@swsa\.ai"/);
  assert.ok(!/<form\b/i.test(h), "contact must contain no <form>");
  assert.ok(!/\bdisabled\b/i.test(h), "contact must contain no disabled control");
  assert.ok(!/message form|coming soon|not yet active/i.test(h), "contact must not claim a form is available");
});

test("homepage emits the camera-first production title", () => {
  const h = readSite("index.html");
  assert.match(h, /<title>Security Camera Installation in New Mexico &amp; the Four Corners \| SWSA\.ai<\/title>/);
});

test("evidence-bearing routes reference only approved project crops", () => {
  const approved = new Set([
    "src/assets/img-src/recent-work/santa-fe-camera.jpg",
    "src/assets/img-src/recent-work/albuquerque-march-doorbell.jpg"
  ]);
  const files = ["index", "home-security", "security-cameras-new-mexico", "albuquerque-home-security", "santa-fe-home-security"];
  for (const f of files) {
    const src = readFileSync(join(ROOT, "src", `${f}.njk`), "utf8");
    const refs = [...src.matchAll(/\{%\s*image\s+"([^"]+)"/g)].map((m) => m[1]);
    assert.ok(refs.length >= 1, `${f} should reference one approved crop`);
    for (const r of refs) assert.ok(approved.has(r), `${f} references non-approved image ${r}`);
  }
});

test("Farmington, Durango, and the commercial family carry no project image or unpublished-proof copy", () => {
  const noImageRoutes = [
    "farmington-home-security.html", "durango-home-security.html",
    "commercial-security.html", "video-surveillance.html", "access-control.html",
    "commercial-alarm-systems.html", "security-assessments.html", "remote-monitoring.html"
  ];
  for (const r of noImageRoutes) {
    const h = readSite(r);
    assert.ok(!/\/assets\/img\/opt\//.test(h), `${r} must not include a project photo`);
    assert.ok(!/case study|commercial proof/i.test(h), `${r} must not claim commercial proof`);
  }
});
