# Route Story Studio

Route Story Studio is a local-first web application for turning GPX tracks and planned GPX routes into configurable, shareable route posters.

> **Development status:** this repository is progressing towards `v0.1.0: Local GPX Studio`. The package version remains `0.0.0-development` until the release-preparation commit.

## Current capability

- Import common GPX 1.0 and GPX 1.1 files in the browser
- Preserve multiple track and route segments
- Distinguish recorded tracks from planned routes
- Calculate distance, duration, elevation gain and elevation loss
- Choose portrait, square or landscape poster layouts
- Export SVG and standard or 2× PNG files
- Use metric or imperial display
- Use an included sample route
- Enforce file, point, segment, render and export resource limits
- Deploy as a static GitHub Pages application

## Local validation

```bash
npm run validate
npm run site-smoke
```

The built-site smoke test expects `python3` on the execution path. A simple development server can be started with:

```bash
python3 -m http.server 8000
```

## Privacy boundary

GPX parsing, statistics, rendering and export occur in the browser. The current application has no upload endpoint, user account, analytics service, cloud persistence, map tile request or external routing request.

## Security boundary

GPX files are untrusted input. The application rejects XML entity declarations, limits input to 8 MB, limits point and segment counts, bounds SVG complexity and limits PNG export size. See [SECURITY.md](SECURITY.md) and [security hardening](docs/security-hardening.md).

## Dependabot automation

Eligible Dependabot PRs can be approved and set to squash auto-merge after repository auto-merge, Actions permissions and required checks are configured. See [the auto-merge policy](docs/dependabot-auto-merge.md).

## GitHub Pages

The Pages workflow builds `dist/` and deploys it after project checks and tests succeed. Configure **Settings → Pages → Build and deployment → GitHub Actions**.

## Release roadmap

- `v0.1.0`: hardened Local GPX Studio with SVG and PNG export and browser assurance
- `v0.2.0`: richer composition, image/map backgrounds and local project persistence
- `v0.3.0`: provenance-aware map-link-to-GPX conversion through provider adapters
