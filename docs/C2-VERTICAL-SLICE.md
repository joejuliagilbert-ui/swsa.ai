# SWSA.ai — Work Package C2 Representative Vertical Slice (local)

**Branch:** `codex/swsa-overhaul-c1` · **Scope:** bounded local implementation.
No push, PR, merge, deploy, Pages-settings/DNS/production change, Formspree
account, or live form endpoint. Not C4.

## Mandatory first task — fail-closed media safety (done, passing)

The C1 gate was manifest-driven but fail-OPEN for an unlisted source. C2 makes the
image pipeline **fail-closed**:

- `imageShortcode` (eleventy.config.js) calls `assertSourceAllowed()` before any
  processing. Every source consumed by the pipeline must be manifested + EXIF/GPS-clean
  + approved.
- Unmanifested source → build throws. Missing/malformed manifest → build throws.
- Negative tests prove **an unmanifested image and a shortcode-referenced unapproved
  image cannot build** — at the function level and via a real Eleventy build (non-zero
  exit, no output).

Automated proof (all pass):

| Test | Proves |
|---|---|
| `media-failclosed.test.mjs` | missing manifest → throw; malformed manifest → throw; unmanifested → reject; manifested-unapproved → reject; approved+clean → allow |
| `media-build-failclosed.test.mjs` | BUILD FAILS (non-zero, no output) for unmanifested and for shortcode-referenced unapproved sources |
| `source-media-gate.test.mjs` | GPS source rejected; incomplete/false consent rejected; clean+approved accepted |
| `no-forbidden-metadata.test.mjs` | derivatives carry no EXIF/GPS (defense #2) |

## Vertical slice implemented (only this)

1. Shared header/nav/footer/metadata + structured data (org `@id`, per-page
   Breadcrumb schema via `partials/breadcrumbs.njk`).
2. Homepage — `/`.
3. Business Security hub — `/commercial-security.html` (dedicated template).
4. Representative residential page — `/home-security.html` (dedicated template).
5. Recent Work index — `/recent-installations.html` (dedicated template).
6. Synthetic project-detail prototype — `/recent-work/sample-installation.html`
   (clearly labeled, `noindex`, excluded from sitemap).
7. Contact — `/contact.html` (non-submitting preview).
8. Custom 404 — `/404.html`.

Plus generated `/robots.txt` and `/sitemap.xml` (sitemap preserves all 19 current
URLs; excludes 404/review/synthetic prototype).

## Design & content law honored

- Quiet Precision hybrid preserved; warm synthetic imagery + restrained editorial
  proof accent; short sections, strong hierarchy, generous space, proof near decisions.
- Business ordered first (60/40) without hiding residential.
- Only verified SWSA.ai facts; unresolved proof marked as **preview placeholders**.
- Call / Text / Send-a-message kept distinct and truthful (`tel:` / `sms:` / message).
- Every current public URL preserved (route + canonical snapshot test).
- No manufacturer/partner logo; no customer image, name, address, location, job data,
  or customer-derived metadata. Synthetic media + text-first SWSA.ai identity only.

## Automated results — `npm test`: 27/27 pass

Route/canonical (19 current + new), no-runtime-JS + no third-party form/asset origins,
no broken internal links, one H1 + no duplicate IDs, brand identity (SWSA.ai), truthful
Call/Text, non-submitting form, no executable deploy workflow, generated
robots/sitemap (current URLs preserved, non-indexable excluded), and the media-gate
suite above.

## Manual / browser evidence (375 / 768 / 1023 / 1024 / 1280)

- No horizontal overflow at any width, on homepage, hubs, Recent Work grid, contact,
  and the image-heavy project prototype (scrollWidth == clientWidth at 375).
- Header breakpoint 1024px content-safe: compact menu at 375/768/1023; full nav at
  1024/1280; no header-row overflow.
- Landmarks: `header`/`nav`/`main`/`footer` on every page; single H1; skip link is the
  first focusable element and targets `#main`; `.skip-link:focus` reveals it.
- Focus: `:focus-visible` = 3px solid outline, 2px offset. (Rendered focus-state
  screenshots not capturable — the automation pane lacks OS focus so `:focus` visuals
  don't paint; mechanism verified in CSS + DOM order.)
- Contrast: body text 17.17:1, primary CTA text 5.47:1 (both pass AA).
- Reduced motion: `prefers-reduced-motion` rule present (removes non-essential motion).
- Client JS: **0 external scripts, 0 inline non-JSON scripts, 0 third-party requests.**
- Page weight: homepage ≈ 90 KB total (HTML 8.8 + CSS 22.5 + Inter 48.6 + images 12.3)
  vs 1.5 MB budget.

Desktop + mobile screenshots captured for all included page types and returned to Codex
via Joseph.

## Boundaries / protected assets

`docs/brand-assets/`, `src/assets/brand/`, `src/assets/partners/`, `src/assets/people/`
were not inspected, edited, referenced by templates, copied into `_site`, staged, or
committed — they remain untracked. Current production-root files untouched. One new
local C2 commit, separate from `ec56dab`.
