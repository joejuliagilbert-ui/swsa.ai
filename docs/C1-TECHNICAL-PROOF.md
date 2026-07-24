# SWSA.ai — Work Package C1 Technical Proof (local)

**Branch:** `codex/swsa-overhaul-c1`
**Scope:** Local technical proof only. No push, PR, merge, Pages-settings change,
deployment, DNS change, production-data change, or customer-media inspection.
**Framework decision:** **Eleventy** (recorded here per the C1 gate).

## What this proves

A compile-time static build that reproduces the current URL surface, ends the
per-file drift, and adds the pipelines the audit said were missing — with no
client JavaScript and no third-party asset origins.

| Capability | Result |
|---|---|
| Shared shell | `src/_includes/layouts/base.njk` + partials (head, header, footer) — one semantic `header`/`nav`/`main`/`footer`, skip link, single H1 per page |
| URL preservation | All **19** current sitemap URLs emitted at exact paths with correct self-canonicals (`test/routes.test.mjs`) + new `/home-security`, `/about`, `/contact`, `/404`, `/review` |
| Self-hosted fonts | Inter (variable) **47.1 KB** + Newsreader 400 **22.0 KB** = **69.1 KB**; no Google Fonts request |
| Responsive image pipeline | AVIF/WebP/JPEG at 400/800/1200/1600 with `srcset`/`sizes`, intrinsic `width`/`height`, lazy by default, hero `fetchpriority="high"`; metadata stripped on re-encode |
| Generated metadata/entity | Per-page title/description/canonical, OpenGraph/Twitter, one stable `LocalBusiness` `@id` (`#organization`) |
| Near-zero JS | 0 runtime scripts (only `ld+json`); verified by `test/no-runtime-js.test.mjs` |
| 320px reflow | No horizontal overflow at 320 CSS px (measured: scrollWidth == clientWidth == 320) — resolves `AUD-RESP-001` |
| Homepage payload | ≈ **70 KB** mobile (placeholder imagery) vs 1.5 MB budget; current production ≈ 36.8 MB |

## Test gates (all pass — `npm test`)

- `routes.test.mjs` — every current sitemap URL emitted + correct canonical; new routes present.
- `no-runtime-js.test.mjs` — no external/inline JS (except `ld+json`); no `fonts.googleapis`/`gstatic`.
- `no-forbidden-metadata.test.mjs` — no EXIF/GPS in any generated derivative.

## Deliberate boundaries honored

- **No customer media inspected.** The image pipeline is proven on a **synthetic
  placeholder** (`scripts/make-sample.mjs`); the current `installs/` originals were
  never opened. Install routes are **route-preservation scaffolds** with no media/PII.
- **No fabricated claims.** ADT relationship and `sameAs` are omitted (owner-verification
  dependencies); proof content is placeholder-labeled pending C2.
- **Formspree is planned only.** `src/contact.njk` posts to a clearly-marked placeholder
  endpoint; not a live account. Wiring + privacy notice is a later authorized step.
- **Actions workflow is INACTIVE.** `.github/workflows/pages.yml` runs on `workflow_dispatch`
  only and requires an owner-authorized Pages-settings change before it can deploy.
- Current root `*.html`/`style.css`/images are untouched (production baseline preserved).
  New build lives in `src/` → `_site/` (gitignored), giving source/artifact separation.

## Bug found and fixed during verification

- Header "Call or Text" CTA rendered navy-on-navy (invisible) because a nav-link
  color rule out-specified `.header-cta`. Scoped nav-link color to `ul a`. Verified
  white-on-navy after fix.
- Initial `<details>`-only nav hid links on desktop (UA collapses closed `<details>`).
  Refactored to always-visible desktop nav + a mobile-only `<details>` disclosure.

## Build / run

```
npm install
npm run build      # prebuild copies fonts + generates the synthetic sample, then eleventy
npm test           # build + node --test gates
npm run serve      # local preview (http://localhost:8080)
```

## Open items for Codex/owner before C2

1. Contact-form delivery: confirm Formspree endpoint + privacy notice, or choose an
   alternative (mailto / serverless). Static host has no mail backend.
2. Repo governance: protect `main`, enable the Actions→Pages artifact deploy + preview
   (Pages-settings change) — required before any production-bound build.
3. Confirm the Newsreader accent stays (22 KB) and where it is used.
4. C2 content, consented/sanitized media, and final composition remain owner-gated.
