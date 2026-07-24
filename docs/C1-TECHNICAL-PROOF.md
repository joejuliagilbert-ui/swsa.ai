# SWSA.ai — Work Package C1 Technical Proof (local)

**Branch:** `codex/swsa-overhaul-c1`
**Scope:** Local technical proof + one Codex correction cycle. No push, PR, merge,
Pages-settings change, deployment, DNS change, production-data change, or
customer-media inspection.
**Framework decision:** **Eleventy** (recorded per the C1 gate).

## What this proves

A compile-time static build that reproduces the current URL surface, ends the
per-file drift, and adds the pipelines the audit said were missing — with no
client JavaScript and no third-party asset origins — plus a build-time
source-media consent/EXIF gate.

## Evidence — automated (`npm test`, 18/18 pass, `node --test`)

| Gate (test file) | Result |
|---|---|
| Route/canonical snapshot (`routes.test.mjs`) | ✅ all **19** current sitemap URLs at exact paths + correct canonicals; new routes present |
| No runtime JS / no third-party asset or **form** origin (`no-runtime-js.test.mjs`) | ✅ 0 external/inline scripts (only `ld+json`); no `googleapis`/`gstatic`/`formspree`; no `<form action>` |
| No broken internal links (`links.test.mjs`) | ✅ every internal href resolves to a built file |
| One H1, no duplicate IDs (`html-quality.test.mjs`) | ✅ per page |
| Public brand = SWSA.ai wordmark + title (`html-quality.test.mjs`) | ✅ |
| Truthful Call=`tel:` / Text=`sms:` controls (`html-quality.test.mjs`) | ✅ |
| Contact form non-submitting: no action, no submit, no `novalidate` (`html-quality.test.mjs`) | ✅ |
| No executable deploy workflow in repo (`html-quality.test.mjs`) | ✅ |
| Source-media gate: **reject** EXIF/GPS source (`source-media-gate.test.mjs`) | ✅ synthetic GPS fixture rejected |
| Source-media gate: **reject** missing/false/incomplete consent (`source-media-gate.test.mjs`) | ✅ |
| Source-media gate: **accept** clean + complete approval (`source-media-gate.test.mjs`) | ✅ |
| Derivatives carry no EXIF/GPS — defense #2 (`no-forbidden-metadata.test.mjs`) | ✅ |

## Evidence — manual / browser observation (not automated)

- **Intermediate-width navigation (correction 6).** Measured `documentElement` and
  `.header-inner` overflow at each width; breakpoint set to **1024px** (content-safe):

  | Width | Nav state | Doc overflow | Header-row overflow |
  |---|---|---|---|
  | 769 | compact menu | none | none |
  | 800 | compact menu | none | none |
  | 900 | compact menu | none | none |
  | 1023 | compact menu (widest) | none | none |
  | 1024 | full nav (narrowest) | none | none (nav content 744px in 1009px row) |
  | 1280 | full nav | none | none |

  Screenshots captured for the narrowest desktop-nav (1024) and widest compact-menu
  (1023) states.
- **320px reflow:** no horizontal overflow (scrollWidth == clientWidth == 320) after the
  header refactor — resolves `AUD-RESP-001`.
- **Contact form:** rendered fields disabled; submit is a disabled `type="button"`;
  `autocomplete` = `name` / `off` (valid).
- **Homepage mobile payload:** ≈ 70 KB (synthetic placeholder imagery) vs 1.5 MB budget.
- Self-hosted fonts: Inter 47.1 KB + Newsreader 400 22.0 KB = 69.1 KB.

## Future deploy model — documentation only (correction 1)

There is **no executable workflow in this branch.** GitHub Actions/Pages are not
configured. The intended future model (recorded here as documentation, not as a
runnable file) is: build in CI → upload the `_site` artifact → deploy the artifact
(source/artifact separation, preview-first). It must not be created or enabled until
the owner authorizes (a) switching the Pages source to GitHub Actions and (b) branch
protection / required checks on `main`. Enabling it changes production and requires the
Production Gate.

## Source-media gate (correction 2)

- `scripts/check-source-media.mjs` runs in **prebuild, before image processing**. It
  rejects any manifested source that carries EXIF/GPS or lacks a complete, approved
  consent/provenance record. Dependency-free EXIF/GPS detection parses the JPEG
  APP1/TIFF structure (GPS IFD tag `0x8825`).
- Approval record (`src/_data/media-approvals.json`): `sourceId`, `provenance`,
  `publicUseApproved` (must be `true`), `approvalDate`, `privacyReview` (must be
  `passed`).
- Synthetic fixtures (`scripts/make-fixtures.mjs`) prove reject/accept. **No customer
  media is inspected or used**; the pipeline demo uses a synthetic placeholder only.
- Derivative metadata stripping remains as defense #2.

## Deliberate boundaries honored

- No customer media inspected. Install routes remain route-preservation scaffolds with
  no media/PII.
- No fabricated claims. ADT relationship and `sameAs` omitted; entity `name` = `SWSA.ai`,
  `legalName` = full LLC, stable `@id`.
- No Formspree account/endpoint; the message form is non-submitting in C1.
- The four untracked Codex asset-intake paths (`docs/brand-assets/`, `src/assets/brand/`,
  `src/assets/partners/`, `src/assets/people/`) were not inspected, edited, or committed.
- Current production-root files unchanged. New build lives in `src/` → `_site/` (gitignored).

## Build / run

```
npm install
npm run build      # prebuild: fonts + synthetic sample + source-media gate, then eleventy
npm test           # build + fixtures + node --test (18 gates)
npm run serve      # local preview
```

## Open items for Codex/owner before C2

1. Contact-form delivery: authorize the real SWSA Formspree endpoint (+ privacy notice)
   or choose an alternative. Static host has no mail backend.
2. Repo governance: protect `main`; when authorized, (re)introduce the Actions→Pages
   artifact deploy + preview (a Pages-settings change) before any production-bound build.
3. Confirm the Newsreader accent (22 KB) stays and where it is used.
4. C2 content, consented/sanitized media, and final composition remain owner-gated.
