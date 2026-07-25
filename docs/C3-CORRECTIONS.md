# SWSA.ai — C3 correction cycle (local)

**Branch:** `codex/swsa-overhaul-c1` · start `e3b6ab4`. Bounded to the two C3
corrections. No push/PR/merge/deploy/Pages/DNS/Formspree/production; not C4.
Accepted C2 architecture, page scope, design, responsive behavior, routes,
sitemap, contact state, and synthetic-only boundary are unchanged.

## Correction 1 — non-JPEG metadata bypass closed (format-aware, fail-closed)

The detector previously parsed only JPEG APP1/TIFF, so a PNG/WebP carrying EXIF
was returned as clean and could pass with a complete approval record. Now:

- `inspectSourceMetadata()` uses **sharp** metadata for every supported raster
  source format and rejects any EXIF, GPS, XMP, or IPTC.
- Supported source formats are an allowlist — **jpeg / png / webp**. Any other
  format (e.g. TIFF) or unreadable input is **explicitly rejected**.
- JPEG keeps the byte-level GPS-IFD scan as extra defense.
- The gate stays inside the image shortcode (`await assertSourceAllowed`), so a
  direct `eleventy` build cannot bypass it. Manifest / provenance / privacy-review
  / unmanifested / unapproved / missing-manifest / malformed-manifest gates are
  all preserved. Derivative metadata stripping remains defense #2.
- Validators are now async (`validateSource`, `assertSourceAllowed`,
  `validateManifest`); tests updated accordingly.

Synthetic fixtures (generated, `test/fixtures/`): `exif-png.png` (EXIF),
`exif-webp.webp` (EXIF), `unsupported.tiff` (clean, unsupported format).

**Build-level negative results (real Eleventy builds, non-zero exit, no output):**

- BUILD FAILS: manifested+approved **PNG** with EXIF cannot build ✔
- BUILD FAILS: manifested+approved **WebP** with EXIF cannot build ✔
- BUILD FAILS: unmanifested source cannot build ✔ (retained)
- BUILD FAILS: shortcode-referenced unapproved source cannot build ✔ (retained)

Function-level: PNG-EXIF rejected, WebP-EXIF rejected, TIFF rejected (unsupported),
non-image rejected, clean JPEG accepted.

## Correction 2 — truthful preview-state language

Removed phase-number promises and future-state claims from public/generated HTML
and stale internal labels:

- Homepage: hero note now "Synthetic placeholder — not a real installation. This is
  a local, non-production preview."; proof copy "…in this preview" (was "C1 proof").
- Scaffold pages: "Preview scaffold … owner-gated and are not part of this synthetic
  preview" (removed "delivered in Work Package C2").
- Preserved install routes: "Preserved project route. This synthetic preview shows
  no real customer content." (removed "pending Work Package C2").
- Recent Work: h1 "Recent work"; description/lede describe a synthetic preview, not
  existing approved proof; card labels "Synthetic preview".
- Internal labels updated: `package.json` description, `style.css` header/section
  comments, `contact.njk` scaffold comment, `routes.js` comments.

New guard test `no-stale-phase.test.mjs` fails the suite if `C1`/`C2`,
`Work Package`, `delivered in C#`, or `C1 proof` reappear in built HTML.

## Results

- `npm test`: **35/35 pass** (was 27 + 8 new).
- No residual stale phase strings in `_site` HTML.
- Design, responsive behavior, routes, sitemap, schema, and contact non-submitting
  state unchanged (only copy + the media validator changed).
- Protected paths `docs/brand-assets/`, `src/assets/brand/`, `src/assets/partners/`,
  `src/assets/people/` untouched, untracked, unreferenced, unpublished. Only
  generated synthetic fixtures used. One new local commit after `e3b6ab4`; nothing
  pushed or deployed.
