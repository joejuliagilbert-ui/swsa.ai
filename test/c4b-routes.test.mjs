// C4B acceptance: ADT referral route, anonymized project stories, name-bearing
// transition routes, partner-mark scoping, wordmark, asset allowlisting, and
// customer-privacy guarantees.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = join(ROOT, "_site");
const ORIGIN = "https://swsa.ai";
const read = (r) => readFileSync(join(SITE, r), "utf8");

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

const ADT = "adt-installation-new-mexico.html";
const STORIES = [
  "installs/albuquerque-security-installation-june-2026.html",
  "installs/albuquerque-security-installation-march-2026.html",
  "installs/santa-fe-security-installation-march-2026.html"
];
const TRANSITIONS = [
  "installs/albuquerque-security-installation-june-2026-diego.html",
  "installs/albuquerque-security-installation-march-2026-annette.html"
];
const SVG = "/assets/partners/secure24-adt-authorized-dealer-blue.svg";

test("ADT route contains the two exact approved relationship statements", () => {
  const h = read(ADT);
  assert.ok(h.includes("If you're looking for an ADT system, you've found the right place. SWSA helps homeowners discuss their security needs and handles ADT referrals through Secure24, an ADT Authorized Dealer."), "lead statement missing");
  assert.ok(h.includes("SWSA is your local point of contact for the initial conversation. Secure24 is the ADT Authorized Dealer associated with the referral."), "boundary statement missing");
});

test("ADT route contains the owner-approved monthly camera-inclusive offer", () => {
  const h = read(ADT);
  assert.ok(h.includes("Complete ADT security systems, including cameras"), "camera-inclusive offer missing");
  assert.ok(h.includes("69.99"), "monthly amount missing");
  assert.ok(h.includes("/mo or less"), "monthly qualifier missing");
});

test("ADT route names the four owner-specified security component groups", () => {
  const h = read(ADT);
  for (const component of [
    "Door &amp; window sensors",
    "Life-safety devices",
    "Motion detection",
    "Flood &amp; extreme temperatures"
  ]) assert.ok(h.includes(component), `ADT route missing ${component}`);
});

test("ADT route has no prohibited authorization / guarantee language", () => {
  const h = read(ADT);
  const banned = [/\bguarantee/i, /\bofficial\b/i, /\bexclusive\b/i, /\bpreferred\b/i, /\bcertified\b/i, /\bbest\b/i, /\bsavings\b/i, /\bpromotion/i, /response time/i, /\bcontract\b/i,
    // SWSA must never be claimed as the authorized dealer (the mark belongs to Secure24)
    /SWSA(?:\s+is)?,?\s+(?:an?|the)\s+(?:ADT\s+)?Authorized Dealer/i];
  for (const re of banned) {
    const m = h.match(re);
    assert.ok(!m, `ADT route contains prohibited language ${re} -> "${m && m[0]}"`);
  }
});

test("partner composite mark appears only on the ADT route", () => {
  for (const f of ALL_HTML) {
    const html = readFileSync(f, "utf8");
    if (html.includes(SVG)) assert.ok(f.endsWith(`/${ADT}`), `partner mark used off the ADT route: ${f}`);
  }
});

test("only the two allowlisted static brand/partner assets exist in _site", () => {
  assert.deepEqual(readdirSync(join(SITE, "assets", "brand")).sort(), ["swsa-ai-navy.png"]);
  assert.deepEqual(readdirSync(join(SITE, "assets", "partners")).sort(), ["secure24-adt-authorized-dealer-blue.svg"]);
  // no unapproved partner/brand asset referenced anywhere
  const banned = ["adt-authorized-dealer.jpg", "secure24-adt-authorized-dealer-white", "eye-full-color", "eye-grayscale", "southwest-", "security-and-automation-", "swsa-ai-white", "swsa-navy", "swsa-white"];
  for (const f of ALL_HTML) {
    const html = readFileSync(f, "utf8");
    for (const b of banned) assert.ok(!html.includes(b), `unapproved asset ${b} referenced in ${f}`);
  }
});

test("SWSA wordmark is the only newly published SWSA brand image", () => {
  for (const f of ALL_HTML) {
    const html = readFileSync(f, "utf8");
    for (const m of html.matchAll(/src="(\/assets\/brand\/[^"]+)"/g)) {
      assert.equal(m[1], "/assets/brand/swsa-ai-navy.png", `unexpected brand image ${m[1]} in ${f}`);
    }
  }
});

test("transition routes: meta refresh + canonical to Recent Work, no customer name displayed", () => {
  for (const t of TRANSITIONS) {
    const h = read(t);
    assert.match(h, /<meta http-equiv="refresh" content="0; url=\/recent-installations\.html">/);
    assert.ok(h.includes(`<link rel="canonical" href="${ORIGIN}/recent-installations.html">`), `${t} canonical`);
    assert.ok(h.includes('href="/recent-installations.html"'), `${t} visible link`);
    // No runtime JS: the only inline scripts allowed anywhere are ld+json structured data.
    assert.ok(!/<script[^>]*\bsrc=/i.test(h), `${t} must have no external script`);
    for (const mm of h.matchAll(/<script\b([^>]*)>/gi)) {
      assert.ok(/application\/ld\+json/i.test(mm[1]), `${t} unexpected inline script`);
    }
  }
});

test("three retained stories are anonymous full pages, self-canonical, one H1", () => {
  for (const s of STORIES) {
    const h = read(s);
    assert.equal((h.match(/<h1\b/gi) || []).length, 1, `${s} H1`);
    assert.ok(h.includes(`<link rel="canonical" href="${ORIGIN}/${s}">`), `${s} canonical`);
    assert.ok(h.includes('class="sticky-start"'), `${s} camera pricing action`);
    assert.ok(h.includes("Installed from $349"), `${s} camera starting price`);
    const sm = read("sitemap.xml");
    assert.equal(sm.split(`<loc>${ORIGIN}/${s}</loc>`).length - 1, 1, `${s} sitemap once`);
  }
});

test("no prohibited customer names in any built HTML", () => {
  const names = [/\bDiego\b/, /\bAnnette\b/, /\bFabian\b/, /Lori Lopez/i, /Cody Bertellotti/i, /Rasc[oó]n-?Thorpe/i, /\bAndr[eé]a\b/];
  for (const f of ALL_HTML) {
    const html = readFileSync(f, "utf8");
    for (const re of names) {
      const m = html.match(re);
      assert.ok(!m, `prohibited customer name ${re} in ${f} -> "${m && m[0]}"`);
    }
  }
});

test("no raw /installs JPEG is referenced or copied into _site", () => {
  for (const f of ALL_HTML) {
    const html = readFileSync(f, "utf8");
    assert.ok(!/\/installs\/[^"']*\.(jpe?g)/i.test(html), `raw installs JPEG referenced in ${f}`);
  }
  const installsDir = join(SITE, "installs");
  if (existsSync(installsDir)) {
    const nonHtml = readdirSync(installsDir).filter((n) => !n.endsWith(".html"));
    assert.equal(nonHtml.length, 0, `unexpected non-HTML files in _site/installs: ${nonHtml.join(", ")}`);
  }
});
