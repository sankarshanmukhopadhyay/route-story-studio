# Route Story Studio

Route Story Studio is a local-first static web application that turns GPX and KML routes into shareable route posters and portable route stories.

## v0.4 story workflow

The v0.4 line extends the existing poster workflow without replacing it. After importing a route, users can now:

1. derive a timestamped timeline when the complete route contains timestamps, or fall back to normalized route progress;
2. add ordered narrative moments at explicit route positions;
3. attach privacy-bounded local photo waypoints with explicit captions/alt text;
4. play, pause, seek and restart the journey using deterministic playback semantics;
5. save and reopen story state locally with the project;
6. retain prepared photo payloads locally in IndexedDB without uploading them;
7. export a self-contained HTML story with a restrictive CSP and no external runtime dependency.

Photo ingestion decodes and re-encodes the selected image locally before it becomes story media. Source EXIF/XMP/IPTC metadata is therefore not copied into the prepared story payload. Route position and any story timestamp remain explicit user/project inputs rather than inferred photo metadata.

The original SVG, PNG and JPEG poster exports remain available when a project contains no story events.

## Elevation terminology

Route Story Studio distinguishes cumulative climbing from vertical span:

- **Elevation gain** is cumulative uphill change for a recorded track.
- **Estimated ascent** is cumulative uphill change for a planned or terrain-derived route.
- **Elevation range** is highest point minus lowest point.
- **Net elevation change** is finish elevation minus start elevation.

The studio does not redefine elevation gain as elevation range. Planned-route ascent is labelled as estimated because dense or terrain-derived elevation samples can introduce cumulative noise. See `docs/elevation-metrics.html`.

## Start here

1. Import a GPX or KML file.
2. Choose a portrait, square, landscape, editorial or print layout.
3. Select a solid colour, local photograph or consent-based map background.
4. Adjust map zoom, route styling and annotations.
5. Optionally add narrative/photo story moments and review playback.
6. Export SVG, PNG or JPEG, export a portable HTML story, or save a local project.

Route files, photographs, projects, story media and poster/story generation remain in the browser. Map tiles are requested only after explicit consent.

## Experimental advanced option

A collapsed **Advanced: build a planned route from Google Maps** section retains map-link review, constrained short-link expansion and openrouteservice-based planned-route generation. It is intentionally secondary because it requires a separately deployed resolver and user-supplied provider credentials. Generated geometry is always labelled as a reconstructed planned route.

## Development

```bash
npm install --ignore-scripts
npm run validate
npm run site-smoke
```

Browser assurance:

```bash
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

## Documentation

Open [`docs/index.html`](docs/index.html) or the published GitHub Pages site.

## Release

Current stable release: **v0.3.0 — Route Poster Studio**.

The v0.4.0 **Timelines and motion** implementation is on the release-candidate path. Its release gate is the repository's complete validation, browser/accessibility, privacy/security regression and built-site smoke evidence.

## Elevation in the poster and summary

The generated poster shows **Elevation range**, which is the highest point minus the lowest point represented in the route. The route summary uses simpler wording and shows **Total climb**, **Elevation range**, **Highest point** and **Lowest point** so the numbers are easier to understand.

> **Poster metric:** every generated poster shows **Elevation range**, calculated as the highest elevation minus the lowest elevation represented in the route.
