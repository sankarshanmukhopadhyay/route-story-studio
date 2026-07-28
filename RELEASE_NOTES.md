# Route Story Studio v0.2.0 — Route Composition Studio

Route Story Studio v0.2.0 expands the local-first route workflow into a reusable composition environment for GPX and KML routes.

## Highlights

- Import GPX 1.0/1.1 and supported KML 2.2 route structures.
- Save projects in the browser and exchange portable `.rssproj` project files.
- Add validated JPEG, PNG or WebP photo backgrounds without uploading them.
- Add consent-based, route-aligned OpenStreetMap backgrounds.
- Choose portrait, square, landscape, editorial, expedition, A4 and Letter layouts.
- Add route-relative annotations that survive layout changes.
- Export SVG, PNG and JPEG outputs.
- Preserve route provenance and map attribution in saved projects and generated artefacts.

## Map-provider reliability and policy alignment

The map workflow now sends a web-compatible Referer, uses the official HTTPS tile URL, preserves browser caching, limits each composition to nine tiles, loads at most two tiles concurrently and paces requests. It does not prefetch zoom levels or build offline tile archives.

The studio detects HTTP 403 responses and the standard OpenStreetMap blocked-tile image. Blocked responses are rejected before composition so they cannot be embedded in exported route stories. The interface presents recovery links to the OpenStreetMap blocked-tiles guidance, tile usage policy and project issue tracker.

## Privacy

GPX, KML, project, photograph, annotation and export processing remain in the browser. Map mode is the only feature that initiates a third-party network request, and it does so only after explicit user consent. The request discloses the visible route area, website origin and ordinary network metadata to the selected provider.

## Security and availability controls

The release includes bounded route, project, image, map and export processing; DTD/entity rejection; coordinate validation; image pixel limits; project schema validation; map request timeouts; tile response-size limits; blocked-tile detection; rendering budgets; and browser-level accessibility assurance.

## Known limitations

- Route geometry cannot yet be edited.
- Google Maps links cannot yet be converted into GPX.
- Projects do not synchronise across devices automatically.
- OpenStreetMap's standard tile service is best-effort and may be unavailable or blocked.
- Offline map packages are not supported.
- Animated route export remains deferred.

## Assurance

The release pipeline runs structural, security, documentation and unit checks; builds and smoke-tests the static site; and exercises the core workflow in Chromium, Firefox, WebKit and a mobile Chromium viewport. It also checks for serious and critical automated accessibility violations.
