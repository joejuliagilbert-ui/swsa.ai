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

test("contact page offers prefilled local and ADT-monitored security-system texts", () => {
  const h = readSite("contact.html");
  assert.ok(h.includes("local%20security%20system%20with%20cameras"), "local-system text link missing");
  assert.ok(h.includes("ADT-monitored%20security%20system%20with%20cameras%20included"), "ADT-system text link missing");
  assert.ok(h.includes("%2469.99%2Fmo%20or%20less"), "ADT text link must carry approved price");
  assert.ok(h.includes("Secure24, an ADT Authorized Dealer"), "contact page must explain the referral path");
});

test("homepage emits the camera-first production title", () => {
  const h = readSite("index.html");
  assert.match(h, /<title>Security Camera Installation in New Mexico &amp; the Four Corners \| SWSA\.ai<\/title>/);
});

test("homepage presents the two core services and both security-system paths", () => {
  const h = readSite("index.html");
  for (const copy of [
    "Cameras only",
    "Cameras + security",
    "Local system",
    "ADT monitored",
    "Door &amp; window sensors",
    "Life-safety devices",
    "Motion detection",
    "Flood &amp; extreme-temperature detection"
  ]) assert.ok(h.includes(copy), `homepage missing core-service copy: ${copy}`);
  assert.ok(h.includes('href="/home-security.html"'), "local system path missing");
  assert.ok(h.includes('href="/adt-installation-new-mexico.html"'), "ADT-monitored path missing");
});

test("security-systems page names both paths, camera-inclusive pricing, and core components", () => {
  const h = readSite("home-security.html");
  for (const copy of [
    "Local system",
    "ADT monitored",
    "$69.99",
    "/mo or less",
    "cameras included",
    "Door &amp; window sensors",
    "Life-safety devices",
    "Motion detection",
    "Flood &amp; extreme temperatures"
  ]) assert.ok(h.toLowerCase().includes(copy.toLowerCase()), `security-systems page missing: ${copy}`);
  assert.ok(h.includes("Secure24, an ADT Authorized Dealer"), "ADT referral relationship missing");
});

test("regional camera pages bridge to both local and professionally monitored systems", () => {
  for (const route of [
    "albuquerque-home-security.html",
    "santa-fe-home-security.html",
    "farmington-home-security.html",
    "durango-home-security.html"
  ]) {
    const h = readSite(route);
    assert.ok(h.includes("local system"), `${route} missing local-system path`);
    assert.ok(h.includes("professionally monitored option"), `${route} missing monitored path`);
    assert.ok(h.includes('href="/home-security.html"'), `${route} missing system comparison link`);
  }
});

test("customer-facing navigation labels use Security Systems consistently", () => {
  const routes = [
    "index.html", "home-security.html", "about.html", "404.html",
    "albuquerque-home-security.html", "santa-fe-home-security.html",
    "farmington-home-security.html", "durango-home-security.html"
  ];
  for (const route of routes) {
    const h = readSite(route);
    assert.ok(h.includes("Security Systems"), `${route} missing Security Systems label`);
  }
});

test("evidence-bearing routes reference only approved project crops", () => {
  const approved = new Set([
    "src/assets/img-src/recent-work/santa-fe-camera.jpg",
    "src/assets/img-src/recent-work/santa-fe-life-safety.jpg",
    "src/assets/img-src/recent-work/albuquerque-march-doorbell.jpg",
    "src/assets/img-src/recent-work/rio-rancho-outdoor-camera.jpg",
    "src/assets/img-src/recent-work/rio-rancho-garage-camera-power.jpg",
    "src/assets/img-src/recent-work/rio-rancho-camera-display.jpg",
    "src/assets/img-src/recent-work/rio-rancho-nest-thermostat.jpg",
    "src/assets/img-src/recent-work/rio-rancho-eave-camera.jpg",
    "src/assets/img-src/recent-work/rio-rancho-doorbell-camera.jpg",
    "src/assets/img-src/recent-work/rio-rancho-smart-lock.jpg",
    "src/assets/img-src/recent-work/bosque-farms-adt-panel.jpg",
    "src/assets/img-src/recent-work/bosque-farms-door-sensor.jpg",
    "src/assets/img-src/recent-work/bosque-farms-outdoor-camera.jpg"
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
