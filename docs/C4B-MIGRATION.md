# SWSA.ai — C4B migration (local)

**Branch:** `codex/swsa-overhaul-c1` · start `4a99de1`. Implements the six
evidence-gated routes + approved partner/identity/media integration. No push/PR/
merge/deploy/Pages/DNS/Formspree/production; not C5.

## Routes
- **ADT referral** `/adt-installation-new-mexico.html` — dedicated page with the two
  exact approved relationship statements (SWSA = local contact; Secure24 = ADT
  Authorized Dealer). CTA "Ask about ADT options" → `/contact.html`. Dealer-specific
  Secure24/ADT composite mark on a light panel with clearspace, octagon ≥30px,
  aspect preserved, **only on this route**. One restrained Home Security → ADT link.
- **Three anonymized stories** (`/installs/albuquerque-security-installation-june-2026`,
  `…-march-2026`, `/installs/santa-fe-security-installation-march-2026`) — edited
  case studies (What needed attention / What we installed / The handoff), self-canonical,
  in sitemap once, no customer names/manufacturer names.
- **Two transition routes** (`…-june-2026-diego`, `…-march-2026-annette`) — preserved
  URLs; "Project Moved" page; canonical + og:url + zero-delay meta refresh to
  `/recent-installations.html`; sitemap-excluded; no runtime JS; **no customer name
  displayed** (name remains only in the unavoidable file path). GitHub Pages-compatible
  transition, not an HTTP 301.
- **Recent Work** now presents exactly the three real anonymized stories; the synthetic
  prototype was removed from the visible collection.

## Media sanitization (fail-closed gate preserved)
Raw `/installs` JPEGs untouched (20/20 rejected by the gate). A temporary, non-committed
sharp process produced tightly-cropped, metadata-clean sources; each passes
`inspectSourceMetadata` and has a complete `media-approvals.json` record
(provenance = sanitized crop of the exact legacy filename, `publicUseApproved:true`,
`approvalDate 2026-07-24`, `privacyReview:passed`). Produced:
- `recent-work/albuquerque-march-doorbell.jpg` (device-lens detail; manufacturer mark + property context excluded)
- `recent-work/santa-fe-camera.jpg`, `recent-work/santa-fe-life-safety.jpg`
- `joseph-gilbert-about.jpg` (head-and-shoulders; apparel dealer mark excluded)

**Omitted** (could not satisfy every restriction): the Albuquerque June installer image
(face + readable ADT/partner branding + panel screen → June story is text-only) and the
Albuquerque March camera image (readable setup/serial QR on the device face). No
substitutions. Per-story image caps respected (June 0, March 1, Santa Fe 2).

## Identity + asset allowlisting
- Header wordmark = `src/assets/brand/components/swsa-ai-navy.png` → `/assets/brand/swsa-ai-navy.png`,
  alt "SWSA.ai", explicit dimensions (no layout shift), aspect preserved, verified 320px→desktop.
- About portrait placed restrained (≈220px, far below fold), not a hero.
- Exact-file passthrough for only the wordmark PNG and the partner SVG; containing
  `brand/` and `partners/` dirs are NOT copied. Partner SVG validated (no script, event
  handlers, entities, external refs, embedded rasters, or data/JS URLs) and preserved
  byte-for-byte.

## Results
- `npm test`: **52/52 pass** (43 prior − updated 2 for transition behavior + new C4B suite).
- No overflow at 320/375/768/1024/1280; no broken images; one H1 per page; zero client JS.
- Only `swsa-ai-navy.png` and `secure24-adt-authorized-dealer-blue.svg` in `_site` static
  brand/partner dirs; no raw `/installs` JPEG referenced or copied; no prohibited customer
  names or authorization/pricing/guarantee claims (test-enforced).
- `main` unchanged at `f407698`. Every protected-scope file except the six explicitly
  selected assets remains untracked, unreferenced, and unpublished.
