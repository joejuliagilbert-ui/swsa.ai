# SWSA.ai — C5A preview-readiness correction (local)

**Branch:** `codex/swsa-overhaul-c1` · start `bd1429d`. Retires the synthetic
prototype system and placeholder/"coming soon" presentation so the local build is
a clean, functional Preview-Gate candidate. No push/PR/merge/deploy/Pages/DNS/
Formspree/production; not C6/Work Package D.

## What changed
- **Synthetic system retired:** removed `npm run sample` from prebuild/serve,
  deleted `scripts/make-sample.mjs`, removed the two synthetic manifest records,
  deleted the two ignored generated JPEGs, and removed every template reference to
  `generated-context.jpg`/`generated-detail.jpg`. The fail-closed media pipeline and
  its negative tests are unchanged.
- **Homepage:** production title; text-led hero with a rules-based service signal
  ("Business security / Home security / Local support", accessible name "SWSA.ai
  service overview"); real Santa Fe project feature (approved `santa-fe-camera.jpg`).
- **Home + Cameras hubs, Albuquerque + Santa Fe locations:** text-led heroes; real
  approved proof (Albuquerque doorbell / Santa Fe camera) linked to the matching story.
- **Farmington + Durango:** text-led heroes; fake local-proof modules removed and
  replaced with a truthful "See how SWSA documents installations" text section.
- **Commercial family (5) + Remote Monitoring:** text-led heroes; synthetic proof and
  "approved proof pending" prose removed; a text-only planning section with a quiet
  "See recent SWSA installations →" link (residential examples, not called commercial
  proof); the monitoring future-service boundary is preserved.
- **Contact:** disabled "coming soon" form removed entirely; now offers working
  **Call (tel), Text (sms), and Email (mailto)** actions; title "Contact", updated H1/lede.
- **CSS:** added `.hero-textled` (single spacious column, no phantom media column) and
  `.service-signal`; removed the now-unused form/`media-note` rules.

## Results
- `npm test`: **58/58 pass** on a clean build. New `test/c5-preview.test.mjs` proves:
  no synthetic/placeholder/prototype/"coming soon" language; no `generated-*` reference
  in src or `_site`; contact has working tel/sms/mailto and no `<form>`/disabled control;
  homepage exact title; evidence routes reference only approved crops; Farmington/Durango
  and the commercial family carry no project image or commercial-proof claim.
- Browser evidence at 320/375/768/1024/1280: no overflow; no broken/distorted media;
  intentional text-led layouts; correct nav transition; no prototype/"coming soon".
- `main` unchanged at `f407698`; protected intake assets untouched.

## Required deviations (flagged for Codex)
Two existing tests referenced artefacts this packet removed and are not in the literal
editable list; keeping the suite green required minimal alignment:
- `test/media-failclosed.test.mjs` — the positive "allowed" case used the now-deleted
  `generated-context.jpg`; repointed to the approved `recent-work/santa-fe-camera.jpg`
  (keeps the **media** category green).
- `test/html-quality.test.mjs` — the "contact form is non-submitting" test asserted a
  form the packet ordered removed; that obsolete test was deleted (contact assertions
  now live in `test/c5-preview.test.mjs`).
