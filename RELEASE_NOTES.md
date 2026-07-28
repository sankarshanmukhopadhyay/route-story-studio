# Route Story Studio v0.1.0 — Local GPX Studio

Route Story Studio is a local-first browser application for turning GPX tracks and routes into configurable, shareable route-story images.

## Highlights

- Import GPX 1.0 and GPX 1.1 files directly in the browser.
- Preserve multiple tracks, routes and segment boundaries.
- Calculate distance, elapsed duration, elevation gain and elevation loss.
- Choose portrait, square or landscape layouts.
- Customise titles, colours, route width, units and visible statistics.
- Export route stories as SVG, standard-resolution PNG or high-resolution PNG.
- Start immediately with the included sample route.

## Privacy model

GPX parsing, analysis and image generation happen locally in the browser. This release does not include route uploads, accounts, analytics, cloud storage, external map tiles or external routing requests.

## Security and availability controls

The release rejects DTD and entity declarations and enforces bounded processing limits, including an 8 MB GPX file limit, 100,000 route points and 2,000 segments or routes. Rendering and PNG export are also bounded to reduce browser overload and resource-exhaustion risk.

## Supported input

The release supports common GPX 1.0 and GPX 1.1 files containing tracks, multiple track segments, routes, optional elevation and optional timestamps. Malformed files, invalid coordinates and inputs above the documented limits are rejected with an explanatory error.

## Known limitations

- No geographic map background.
- No route-geometry editor.
- No photograph background or waypoint annotation interface.
- No project persistence or cloud synchronisation.
- No external elevation correction.
- No Google Maps link-to-GPX conversion in this release.
- Planned GPX routes are not evidence that a journey was completed.

## Assurance

The release pipeline runs structural, security, documentation and unit checks; builds and smoke-tests the static site; and exercises the core workflow in Chromium, Firefox, WebKit and a mobile Chromium viewport. It also checks for serious and critical automated accessibility violations.

## Documentation

The deployed application includes a guided documentation site covering first use, supported GPX input, image export, privacy, security, browser support and known limitations.
