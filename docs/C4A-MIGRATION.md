# SWSA.ai — C4A safe-first migration (local)

**Branch:** `codex/swsa-overhaul-c1` · start `5f43f1c`. Implements the eleven
safe-first routes from the C4 Migration Specification. No push/PR/merge/deploy/
Pages/DNS/Formspree/production; C4B not started.

## Migrated (11 full dedicated pages, replacing scaffolds)

Commercial service family: `/video-surveillance.html`, `/access-control.html`,
`/commercial-alarm-systems.html`, `/remote-monitoring.html`,
`/security-assessments.html`. Camera gateway: `/security-cameras-new-mexico.html`.
Location family: `/albuquerque-`, `/santa-fe-`, `/farmington-`,
`/durango-home-security.html`. Company: `/about.html`.

Each follows its route brief: exact pathname + self-canonical, unique title/
description/H1, orientation label, outcome headline, support statement, the
specified primary action + Call/Text, breadcrumbs + BreadcrumbList, section order,
internal-link matrix, and editorial ceilings. Built with accepted C2/C3 components
plus six bounded macros (process, fit list, planning principles, outcomes, related
rail, compact FAQ). No new runtime JavaScript.

## Out of scope (kept exactly as preserved scaffolds)

`/adt-installation-new-mexico.html` + five `/installs/*` legacy routes remain at
their exact paths via the scaffold system, with neutral non-fabricated copy and
**no ADT/partner language and no customer content**. Not edited, redirected, or
claim-added.

## Truthfulness & boundaries

- No manufacturer/dealer/partner/reseller authorization claims or logos; no ADT,
  Secure24, Nest, Vivint, facial recognition, license-plate, 24/7, guarantee,
  licensed/insured/warranty/certified, or years-in-business language (test-enforced).
- No customer names, quotes, images, addresses, job identifiers, or precise
  locations. Synthetic media only, via the fail-closed source-media gate; every
  proof region is explicitly labeled synthetic and links to Recent Work.
- Remote Monitoring publishes verbatim: "Video remote guarding is a planned future
  service and is not currently offered."; no active-guarding/live-intervention claim.
- No phase language in public HTML. About is text-first (no portrait); operating
  model uses the approved wording ("owner-led, supported by a small operating team
  and qualified contractors as projects require").

## Results

- `npm test`: **41/41 pass** (35 prior + 6 new C4A tests: unique metadata,
  breadcrumbs, internal-link matrix, sitemap inclusion, prohibited claims, monitoring
  boundary). Existing tests remain green; all 11 routes in the sitemap once.
- Responsive: no horizontal overflow at 320/375/768/1023/1024/1280 on commercial,
  camera, location, and About pages; one H1 each; no duplicate IDs; semantic
  landmarks; reduced-motion + AA contrast from the shared system.
- Client JS zero except JSON-LD. Quiet Precision + Business-first hierarchy preserved.
- Protected paths `docs/brand-assets/`, `src/assets/brand/`, `src/assets/partners/`,
  `src/assets/people/` unchanged, untracked, unreferenced, unpublished. One new local
  C4A commit after `5f43f1c`; nothing pushed or deployed.
