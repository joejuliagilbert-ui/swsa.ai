// C4A safe-first migration acceptance: the eleven route replacements have unique
// metadata, breadcrumbs, spec-conformant internal links, sitemap inclusion, and
// carry no prohibited (partner / customer / superiority) claims.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = join(process.cwd(), "_site");
const read = (r) => readFileSync(join(SITE, r), "utf8");
const ORIGIN = "https://swsa.ai";

const ROUTES = [
  "video-surveillance.html",
  "access-control.html",
  "commercial-alarm-systems.html",
  "remote-monitoring.html",
  "security-assessments.html",
  "security-cameras-new-mexico.html",
  "albuquerque-home-security.html",
  "santa-fe-home-security.html",
  "farmington-home-security.html",
  "durango-home-security.html",
  "about.html"
];

// Required contextual destinations per the specification's internal-link matrix.
const LINKS = {
  "video-surveillance.html": ["/commercial-security.html", "/security-assessments.html", "/security-cameras-new-mexico.html", "/recent-installations.html"],
  "access-control.html": ["/commercial-security.html", "/security-assessments.html", "/video-surveillance.html"],
  "commercial-alarm-systems.html": ["/commercial-security.html", "/remote-monitoring.html", "/security-assessments.html", "/video-surveillance.html"],
  "remote-monitoring.html": ["/commercial-security.html", "/commercial-alarm-systems.html", "/video-surveillance.html", "/security-assessments.html"],
  "security-assessments.html": ["/commercial-security.html", "/video-surveillance.html", "/commercial-alarm-systems.html", "/access-control.html"],
  "security-cameras-new-mexico.html": ["/home-security.html", "/video-surveillance.html", "/recent-installations.html", "/albuquerque-home-security.html", "/santa-fe-home-security.html", "/farmington-home-security.html", "/durango-home-security.html"],
  "albuquerque-home-security.html": ["/home-security.html", "/security-cameras-new-mexico.html", "/commercial-security.html", "/recent-installations.html"],
  "santa-fe-home-security.html": ["/home-security.html", "/security-cameras-new-mexico.html", "/recent-installations.html", "/contact.html"],
  "farmington-home-security.html": ["/home-security.html", "/security-cameras-new-mexico.html", "/durango-home-security.html", "/recent-installations.html"],
  "durango-home-security.html": ["/home-security.html", "/security-cameras-new-mexico.html", "/farmington-home-security.html", "/recent-installations.html"],
  "about.html": ["/commercial-security.html", "/home-security.html", "/recent-installations.html", "/contact.html"]
};

const title = (h) => (h.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
const desc = (h) => (h.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || "";

test("all eleven routes have unique, non-empty titles and descriptions", () => {
  const titles = new Set(), descs = new Set();
  for (const r of ROUTES) {
    const h = read(r);
    const t = title(h), d = desc(h);
    assert.ok(t && d, `${r} missing title/description`);
    assert.ok(t.includes("SWSA.ai"), `${r} title missing brand`);
    assert.ok(!titles.has(t), `duplicate title: ${t}`);
    assert.ok(!descs.has(d), `duplicate description: ${d}`);
    titles.add(t); descs.add(d);
  }
});

test("each route has one H1, breadcrumbs + BreadcrumbList, and self-canonical", () => {
  for (const r of ROUTES) {
    const h = read(r);
    assert.equal((h.match(/<h1\b/gi) || []).length, 1, `${r} H1 count`);
    assert.ok(/class="breadcrumbs"/.test(h), `${r} missing visible breadcrumbs`);
    assert.ok(/"@type":"BreadcrumbList"/.test(h), `${r} missing BreadcrumbList schema`);
    assert.ok(h.includes(`<link rel="canonical" href="${ORIGIN}/${r}">`), `${r} canonical`);
  }
});

test("internal links match the specification matrix", () => {
  for (const r of ROUTES) {
    const h = read(r);
    for (const dest of LINKS[r]) {
      assert.ok(h.includes(`href="${dest}"`), `${r} missing required link ${dest}`);
    }
  }
});

test("each route is included exactly once in the generated sitemap", () => {
  const sm = read("sitemap.xml");
  for (const r of ROUTES) {
    const loc = `<loc>${ORIGIN}/${r}</loc>`;
    const count = sm.split(loc).length - 1;
    assert.equal(count, 1, `${r} sitemap count = ${count}`);
  }
});

test("no prohibited partner / customer / superiority claims", () => {
  const banned = [
    /\bADT\b/, /Secure24/i, /\bVivint\b/i, /\bNest\b/, /facial recognition/i,
    /license[ -]?plate/i, /\bguarantee/i, /best-in-class/i, /market-leading/i,
    /fully licensed/i, /\binsured\b/i, /\bwarranty\b/i, /\bcertified\b/i,
    /certification/i, /years in business/i, /live intervention/i
  ];
  for (const r of ROUTES) {
    const h = read(r);
    for (const re of banned) {
      const m = h.match(re);
      assert.ok(!m, `${r} contains prohibited claim ${re} -> "${m && m[0]}"`);
    }
  }
});

test("remote-monitoring publishes the required future-service boundary and no active-guarding claim", () => {
  const h = read("remote-monitoring.html");
  assert.ok(h.includes("Video remote guarding is a planned future service and is not currently offered."), "boundary statement missing");
  assert.ok(!/remote guarding[^.]*\bis (currently )?offered\b/i.test(h.replace("is not currently offered", "")), "must not claim guarding is offered");
});
