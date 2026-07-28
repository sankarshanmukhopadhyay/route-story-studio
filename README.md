# Route Story Studio

**Route Story Studio v0.2.0**, with v0.3.0 route-acquisition development on `main`, turns GPX and KML routes into reusable route stories directly in the browser.

[Open the live studio](https://sankarshanmukhopadhyay.github.io/route-story-studio/) · [Read the user guide](https://sankarshanmukhopadhyay.github.io/route-story-studio/docs/)

> **Local by default:** route-file parsing, statistics, photographs, projects, annotations and image export happen on the user's device. Place resolution, routing and map tiles are separate, explicit network actions.

## What you can do

1. Review a supported full Google Maps directions link locally.
2. Resolve named places through a user-selected routing provider.
3. Confirm ambiguous provider candidates before route generation.
4. Build a provider-generated **planned route**.
5. Import GPX or supported KML route geometry.
6. Save and reopen local projects.
7. Add solid, photograph or consent-based map backgrounds.
8. Adjust map framing with bounded zoom controls.
9. Add route-relative annotations.
10. Export SVG, PNG or JPEG.

A sample route is included so the studio can be explored without personal location data.

## Guided documentation

| Goal | Guide |
|---|---|
| Understand the complete sequence | [Getting started](docs/getting-started.html) |
| Start from a map link | [Route acquisition](docs/route-acquisition.html) |
| Review supported map links | [Map-link review](docs/converting-map-links.html) |
| Configure routing and credentials | [Routing providers](docs/routing-providers.html) |
| Check route-file support | [Supported GPX](docs/supported-gpx.html) and [Supported KML](docs/supported-kml.html) |
| Save or reopen work | [Local projects](docs/local-projects.html) |
| Add a photo or map | [Backgrounds](docs/backgrounds.html) |
| Consent, zoom and recover map loading | [Map backgrounds](docs/map-backgrounds.html) |
| Choose layouts and annotations | [Templates and annotations](docs/templates-and-annotations.html) |
| Export for web or print | [Exporting images](docs/exporting-images.html) |
| Understand external processing | [Privacy model](docs/privacy-model.html) |
| Review hardening controls | [Security model](docs/security-model.html) |
| Understand current constraints | [Known limitations](docs/known-limitations.html) |

## Route-acquisition boundary

The first provider adapter is **openrouteservice** and requires the user's own API key. The application:

- sends place text only when the user selects **Resolve named places**;
- sends confirmed coordinates only when the user selects **Build confirmed planned route**;
- returns at most five candidates for each named place;
- supports at most 25 intermediate waypoints;
- limits the browser session to 20 external acquisition requests;
- stores credentials only in browser storage;
- excludes credentials from projects, route data and exports;
- never silently falls back to another provider;
- always labels provider-generated geometry as a reconstructed planned route.

Google Maps short links are recognised but are not expanded by the static browser application.

## Map backgrounds and zoom

Map mode requires **Consent and load map now**. The − and + controls offer wide, fitted and closer framing. Closer views may crop route ends and are labelled accordingly.

The map loader uses the official OpenStreetMap HTTPS tile endpoint, ordinary browser caching, bounded concurrency, a nine-tile budget and blocked-response detection. Attribution remains visible.

## Supported input and limits

- GPX 1.0 and 1.1
- KML `LineString`, `Point` placemarks and `gx:Track`
- Maximum route file: **8 MB**
- Maximum route points: **100,000**
- Maximum segments/features: **2,000**
- Maximum photograph: **5 MB / 40 megapixels**
- Maximum map request: **9 tiles**
- DTD and entity declarations are rejected

## Development

Requires Node.js 22 or later. CI uses Node.js 24.

```bash
npm install
npm run validate
npm run site-smoke
```

Browser assurance:

```bash
npm run test:e2e:install
npm run test:e2e
```

## Deployment

GitHub Pages deploys `dist/` after validation succeeds. Configure **Settings → Pages → Build and deployment → GitHub Actions**.

## Security and privacy

Do not put private route data or API keys in public issues. See [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md).

## Roadmap

- `v0.2.0`: route composition, KML, projects, backgrounds, annotations and publication exports
- `v0.3.0`: controlled route acquisition, provider adapters, provenance-marked GPX/KML generation
- `v0.4.0`: timelines, route animation and richer storytelling

## Licence

MIT. See [LICENSE](LICENSE).

## v0.3.0 acquisition hardening

Commit 4 adds a constrained `maps.app.goo.gl` resolver reference implementation under `gateway/`. Short-link expansion and openrouteservice routing remain separate authorities: the gateway returns an approved final Google Maps URL, while openrouteservice resolves confirmed places and generates planned geometry. The application records resolution metadata in the provenance receipt without exporting the complete short URL.
