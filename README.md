# Route Story Studio

Route Story Studio is a local-first static web application that turns GPX and KML routes into shareable route posters.

## Start here

1. Import a GPX or KML file.
2. Choose a portrait, square, landscape, editorial or print layout.
3. Select a solid colour, local photograph or consent-based map background.
4. Adjust map zoom, route styling and annotations.
5. Export SVG, PNG or JPEG, or save a local project.

Route files, photographs, projects and poster generation remain in the browser. Map tiles are requested only after explicit consent.

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

Current release: **v0.3.0 — Route Poster Studio**.
