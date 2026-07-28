# Route Story Studio

**Route Story Studio v0.1.0** turns GPX tracks and planned GPX routes into clean, shareable route images directly in the browser.

[Open the live studio](https://sankarshanmukhopadhyay.github.io/route-story-studio/) · [Read the user guide](https://sankarshanmukhopadhyay.github.io/route-story-studio/docs/)

> **Local-first:** route parsing, statistics, visualisation and image export happen on the user's device. The application has no GPX upload endpoint, account, analytics service, map-tile request or cloud persistence.

## What you can do

1. Import a GPX 1.0 or GPX 1.1 track or route.
2. Review distance, duration, elevation and import warnings.
3. Choose portrait, square or landscape output.
4. Adjust units, colours, route width and visible details.
5. Download scalable SVG or standard/high-resolution PNG.

A sample route is included, so the application can be explored without supplying personal location data.

## Documentation

| Need | Guide |
|---|---|
| Create a first route image | [Getting started](docs/getting-started.html) |
| Check whether a file is supported | [Supported GPX](docs/supported-gpx.html) |
| Choose SVG or PNG | [Exporting images](docs/exporting-images.html) |
| Understand local processing | [Privacy model](docs/privacy-model.html) |
| Review safety controls | [Security model](docs/security-model.html) |
| Understand the release boundary | [Known limitations](docs/known-limitations.html) |
| Verify release readiness | [Release checklist](docs/release-checklist.html) |

## Supported input and limits

- GPX 1.0 and GPX 1.1
- Tracks, routes and multiple segments
- Optional elevation and timestamps
- Maximum file size: **8 MB**
- Maximum route points: **100,000**
- Maximum tracks, routes and segments: **2,000**
- DTD and entity declarations are rejected

A planned route is labelled as planned geometry. It is not represented as evidence that a journey occurred.

## Development

Requires Node.js 22 or later. CI uses Node.js 24.

```bash
npm install
npm run validate
npm run site-smoke
```

Browser assurance uses Playwright:

```bash
npm run test:e2e:install
npm run test:e2e
```

The browser suite covers Chromium, Firefox, WebKit and a mobile Chromium viewport. It also checks for serious or critical automated accessibility violations.

## Deployment

GitHub Pages deploys the contents of `dist/` after validation succeeds. Configure:

**Settings → Pages → Build and deployment → GitHub Actions**

For Dependabot auto-merge, follow [the repository setup guide](docs/dependabot-auto-merge.md).

## Security and privacy

Do not place private route data in public issues. See [SECURITY.md](SECURITY.md) for responsible reporting and [PRIVACY.md](PRIVACY.md) for the formal privacy boundary.

## Roadmap

- `v0.2.0`: richer composition, image/map backgrounds and local project persistence
- `v0.3.0`: provenance-aware map-link-to-GPX conversion through provider adapters

## Licence

MIT. See [LICENSE](LICENSE).
