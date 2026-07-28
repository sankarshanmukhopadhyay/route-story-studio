# Route Story Studio

Route Story Studio is a local-first web application for turning GPX tracks and planned GPX routes into configurable, shareable route posters.

> **Development status:** this repository is progressing towards `v0.1.0: Local GPX Studio`. The package version remains `0.0.0-development` until the release-preparation commit.

## Current capability

- Import GPX 1.0 and GPX 1.1 files in the browser
- Preserve multiple track and route segments
- Distinguish recorded tracks from planned routes
- Validate coordinate, file-size and point-count boundaries
- Calculate distance, duration, elevation gain and elevation loss
- Use an included sample route for immediate onboarding
- Choose portrait, square or landscape poster layouts
- Switch between metric and imperial display
- Customise route, background and text colours
- Toggle elevation, duration and endpoint markers
- Export the canonical poster as SVG
- Deploy as a static GitHub Pages application

## Local development

```bash
npm run validate
python3 -m http.server 8000
```

Open `http://localhost:8000`. A local HTTP server is required for the sample-route request.

## Privacy boundary

GPX parsing, statistics and rendering occur in the browser. The current application has no upload endpoint, user account, analytics service, cloud persistence, map tile request or external routing request.

## GitHub Pages

The Pages workflow builds `dist/` and deploys it after project checks and tests succeed. Configure **Settings → Pages → Build and deployment → GitHub Actions**.

## Release roadmap

- `v0.1.0`: hardened Local GPX Studio with SVG and PNG export and browser assurance
- `v0.2.0`: richer composition, image/map backgrounds and local project persistence
- `v0.3.0`: provenance-aware map-link-to-GPX conversion through provider adapters

See [ROADMAP.md](ROADMAP.md), [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md) and [architecture documentation](docs/architecture.md).
