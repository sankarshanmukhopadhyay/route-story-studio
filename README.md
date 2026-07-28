# Route Story Studio

**Route Story Studio v0.2.0** turns GPX and KML routes into reusable, publication-ready route stories directly in the browser.

[Open the live studio](https://sankarshanmukhopadhyay.github.io/route-story-studio/) · [Read the user guide](https://sankarshanmukhopadhyay.github.io/route-story-studio/docs/)

> **Local-first by default:** route parsing, statistics, photographs, projects, annotations and image export happen on the user's device. Map tiles are requested only after explicit consent.

## What you can do

1. Import GPX or supported KML route geometry.
2. Review distance, duration, elevation and provenance.
3. Save work locally or exchange a portable `.rssproj` project.
4. Add a solid, photograph or consent-based map background.
5. Choose social, editorial, expedition or print-oriented layouts.
6. Add route-relative annotations.
7. Export SVG, PNG or JPEG.

A sample route is included, so the studio can be explored without supplying personal location data.

## Documentation

| Need | Guide |
|---|---|
| Create a first route story | [Getting started](docs/getting-started.html) |
| Check route-file support | [Supported GPX](docs/supported-gpx.html) and [Supported KML](docs/supported-kml.html) |
| Save or reopen work | [Local projects](docs/local-projects.html) |
| Use photographs or maps | [Backgrounds](docs/backgrounds.html) |
| Understand consent, blocked tiles and map recovery | [Map backgrounds](docs/map-backgrounds.html) |
| Choose layouts and annotations | [Templates and annotations](docs/templates-and-annotations.html) |
| Export for web or print | [Exporting images](docs/exporting-images.html) |
| Understand data handling | [Privacy model](docs/privacy-model.html) |
| Review safety controls | [Security model](docs/security-model.html) |
| Understand the release boundary | [Known limitations](docs/known-limitations.html) |
| Verify release readiness | [Release checklist](docs/release-checklist.html) |

## Supported input and limits

- GPX 1.0 and GPX 1.1
- KML 2.2-compatible `LineString`, `Point` placemarks and `gx:Track`
- Tracks, routes and multiple segments
- Optional elevation and timestamps
- Maximum route file: **8 MB**
- Maximum route points: **100,000**
- Maximum segments/features: **2,000**
- Maximum photograph: **5 MB / 40 megapixels**
- Maximum map request: **9 tiles**
- DTD and entity declarations are rejected

A planned route is labelled as planned geometry. It is not represented as evidence that a journey occurred.

## Map usage

Map mode requires an explicit **Consent and load map now** action. Route Story Studio:

- uses the official OpenStreetMap HTTPS tile URL;
- sends a valid website Referer;
- uses ordinary browser caching;
- limits concurrency and request rate;
- keeps attribution visible;
- rejects HTTP 403 and recognisable blocked-tile responses;
- prevents export while a requested map is unavailable.

OpenStreetMap's standard tile service is best-effort. A solid colour or imported photograph provides a fully local fallback.

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

## Deployment

GitHub Pages deploys `dist/` after validation succeeds. Configure **Settings → Pages → Build and deployment → GitHub Actions**.

For Dependabot auto-merge, follow [the repository setup guide](docs/dependabot-auto-merge.md).

## Security and privacy

Do not place private route data in public issues. See [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md).

## Roadmap

- `v0.2.0`: route composition, local projects, KML, backgrounds, annotations and publication exports
- `v0.3.0`: provenance-aware map-link-to-GPX conversion through provider adapters
- `v0.4.0`: timelines, route animation and richer storytelling

## Licence

MIT. See [LICENSE](LICENSE).
