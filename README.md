# Route Story Studio

[![CI](https://github.com/sankarshanmukhopadhyay/route-story-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/sankarshanmukhopadhyay/route-story-studio/actions/workflows/ci.yml)
[![Deploy GitHub Pages](https://github.com/sankarshanmukhopadhyay/route-story-studio/actions/workflows/pages.yml/badge.svg)](https://github.com/sankarshanmukhopadhyay/route-story-studio/actions/workflows/pages.yml)

Route Story Studio is a local-first web application for turning GPX tracks into clean, shareable route artefacts. GPX parsing, statistics and poster rendering happen in the browser.

## First-release capability

- Drag-and-drop GPX import
- Route geometry validation
- Distance, elapsed duration, elevation gain and loss
- Responsive route-poster preview
- Configurable title, subtitle, line width and visible statistics
- SVG export suitable for high-resolution publishing
- GitHub Pages deployment
- Machine-readable route-document schema
- CI tests and build evidence

## Run locally

No runtime dependencies are required.

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` and import a GPX file.

## Validate

```bash
npm run check
npm test
npm run build
```

## Processing boundary

| Operation | Processing location |
|---|---|
| GPX import and parsing | Browser |
| Route statistics | Browser |
| Poster rendering | Browser |
| SVG export | Browser |
| Map-link reconstruction | Not yet implemented |
| External map tiles | Not yet used |

The planned Google Maps link-to-GPX capability will be introduced behind a provider-neutral routing boundary. It will label reconstructed routes distinctly from recorded tracks and require explicit consent before sending waypoints to an external routing provider.

## Project status

This is an initial implementation baseline. See [ROADMAP.md](ROADMAP.md) for planned increments.
