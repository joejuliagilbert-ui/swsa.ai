# SWSA.ai — Release Runbook

Documentation only. This runbook does not authorize any push, deployment,
settings change, or production action. Each step below is performed only under an
explicit, separate owner authorization.

## Boundary & status

- Project: SWSA.ai · Repo: `joejuliagilbert-ui/swsa.ai` · Host: `swsa.ai`
- Excluded project: Install Trax
- **Production authorization: No.** No push, merge, deploy, Pages/DNS/branch-
  protection/environment change, or Formspree activation is authorized by this
  document.
- Release candidate lives on the local feature branch `codex/swsa-overhaul-c1`.
  `main` (`f40769899be155f8c18f5e5dabbf3fbe133787ef`) and production are unchanged.

## Hosting

- **Current (legacy) source:** GitHub Pages "Deploy from a branch" — the **root of
  `main`** (the current live hand-authored site).
- **Recommended release source:** GitHub Pages **"GitHub Actions"** artifact
  deployment, using `.github/workflows/deploy-pages.yml` (manual `workflow_dispatch`
  only). This keeps source (`src/`) and the deployed artifact (`_site/`) separate and
  gates deployment behind an owner action.

## Preflight checklist (before any push)

- [ ] `npm ci` clean on Node 24 (`.nvmrc` = 24).
- [ ] `npm test` green (full suite).
- [ ] `CNAME` is exactly `swsa.ai`.
- [ ] No protected intake asset staged (only `swsa-ai-navy.png` and
      `secure24-adt-authorized-dealer-blue.svg` are tracked from intake scope).
- [ ] No synthetic/prototype/"coming soon" language in `_site`.
- [ ] Contact offers working Call, Text, and Email; no form.
- [ ] Route/canonical/sitemap/robots and media-safety tests pass.

## Stage 1 — Feature branch push + draft PR (owner-authorized)

1. With explicit owner authorization, push `codex/swsa-overhaul-c1` to origin.
2. Open a **draft** pull request into `main`.
3. `Validate SWSA.ai` (`validate.yml`) runs automatically on the PR (read-only:
   `npm ci` + `npm test`). It performs no deployment.
4. Codex reviews the rendered branch/diff; the owner reviews the experience.

## Stage 2 — Production Gate (owner decision, required)

Deployment proceeds only after the owner explicitly authorizes the exact release
version. Before that authorization the owner confirms:

- the reviewed commit is the intended release;
- switching the Pages source to GitHub Actions is approved;
- branch protection / required checks on `main` are in place (recommended);
- the rollback path below is understood.

## Stage 3 — Controlled release sequence (only after the Production Gate)

1. Merge the approved PR into `main` (squash or merge per the agreed policy).
2. In repository **Settings → Pages**, set **Source = GitHub Actions** (this is the
   one-time source switch; it is an owner action, not performed by CI).
3. Run **`Deploy SWSA.ai to GitHub Pages`** via **Run workflow** (`workflow_dispatch`).
   The build job runs `npm ci` + `npm test` and uploads `_site`; the deploy job
   publishes it to the `github-pages` environment.
4. Confirm the deployment's environment URL resolves to `https://swsa.ai/`.

## Production verification checklist (immediately after deploy)

- [ ] `https://swsa.ai/` serves the new homepage over HTTPS; `CNAME` intact.
- [ ] Representative routes return `200` with correct self-canonicals; the two
      transition routes reach `/recent-installations.html`.
- [ ] `robots.txt` and `sitemap.xml` correct; sitemap excludes the transition routes.
- [ ] Call, Text, and Email actions work on Contact; no form present.
- [ ] Partner mark appears only on the ADT route; wordmark renders in the header.
- [ ] No broken images; no prohibited customer content.
- [ ] No unexpected console errors; no third-party requests.

## Rollback

**Triggers:** wrong content live, broken critical route, TLS/hostname failure,
partner/privacy exposure, or any failed item in the verification checklist.

**Procedure:** in **Settings → Pages**, set **Source** back to **"Deploy from a
branch" → `main` / root**, restoring the previous hand-authored production site
immediately. (Equivalently, revert the release merge on `main` if the branch source
is retained.) DNS and `CNAME` are unchanged by rollback. No DNS action is required.

## Post-launch review

- **24 hours:** route/status/canonical spot-check; contact actions; error/log check.
- **7 days:** Search Console coverage/indexing; broken-link and Core-Web-Vitals check;
  inquiry-channel sanity (calls/texts/emails arriving).
- **30 days:** search-migration review vs. the preserved URLs; qualified-inquiry
  review; prioritized iteration and any next-gate decisions.

## Release v1 contact model

Release v1 uses **Call, Text, and Email** as the contact paths. **Formspree is not
activated** in v1; adding a live inquiry form is a separate, later, owner-authorized
step with its own privacy notice and data-flow review.
