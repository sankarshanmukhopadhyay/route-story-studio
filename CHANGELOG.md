# Changelog

## Unreleased — v0.3.0 development

- Added a canonical Route Intent model and JSON Schema.
- Added local parsing for supported Google Maps directions URLs.
- Added origin, destination, waypoint and travel-mode review before routing.
- Added HTTPS, host-allowlist, credential and link-length controls.
- Recognise short Google Maps links without following redirects.
- Fixed map-consent focus assurance across Playwright browser targets.
- Fixed release workflow setup when no npm lockfile is committed.

## 0.2.0 - 2026-07-28

### Added
- KML `LineString`, `Point` and `gx:Track` import alongside GPX.
- Local IndexedDB projects and portable `.rssproj` exchange.
- Validated photo backgrounds and explicit-consent map backgrounds.
- Route-aware map fitting, publication templates, annotations and JPEG export.
- User-facing map help covering provider policy, blocked tiles and recovery.

### Changed
- Map requests now use `strict-origin-when-cross-origin`, normal browser caching, bounded concurrency and request pacing.
- Release identity updated to Route Composition Studio v0.2.0.

### Fixed
- Prevented OpenStreetMap blocked-tile notices from being embedded into exported posters.
- Added detection for HTTP 403 responses and the standard blocked-tile image.
- Added an explicit fallback state that keeps export disabled until a valid map is loaded or another background is selected.

All notable changes to Route Story Studio are documented here.

## Unreleased

### Fixed

- Serve axe-core through a same-origin test-only endpoint so browser accessibility assurance runs with the production Content Security Policy still enforced.
- Replace inline accessibility-script injection, which was correctly blocked by `script-src 'self'` in Chromium, Firefox and WebKit.


## [Unreleased]

### Added

- Reviewed export of provider-generated planned routes as GPX and KML.
- Machine-readable route-generation provenance receipts with canonical intent hashes.
- Material coordinate-displacement warnings and explicit reconstructed-route semantics.


### Added

- KML `LineString`, `Point` placemark and `gx:Track` import
- Versioned Route Story project model
- IndexedDB project save and reopen workflow
- Portable `.rssproj` project import and export
- Project and KML resource-admission controls

## [0.1.0] - 2026-07-28

### Added

- Local GPX 1.0 and GPX 1.1 import
- Track, route and multi-segment normalisation
- Distance, duration and elevation statistics
- Portrait, square and landscape route-story layouts
- Metric and imperial presentation
- SVG, standard PNG and 2× PNG export
- Sample-route onboarding
- Structured import warnings and source classification
- User-focused documentation with guided navigation
- Playwright browser assurance for Chromium, Firefox, WebKit and mobile Chromium
- Automated accessibility checks
- Dependabot approval and squash auto-merge policy

### Security

- 8 MB file-size limit
- 100,000-point and 2,000-structure limits
- DTD and entity rejection
- Metadata, render-complexity and PNG pixel limits
- Export timeout and temporary-resource cleanup
- Restrictive browser content policy
- Automated security and built-site checks

### Known limitations

The release does not include a geographic map background, geometry editing, photo composition, project persistence, animation, cloud storage or Google Maps link-to-GPX conversion.

### Added — v0.2.0 development, composition backgrounds

- Local photo background validation and composition.
- Explicit-consent OpenStreetMap tile loading with a nine-tile budget.
- Background opacity and overlay controls.
- Mandatory map attribution in route-story output.
- Documentation and automated boundary tests for background processing.

### Added — v0.2.0 development, publication composition

- Route-bounds-aware OpenStreetMap tile fitting and shared geographic projection.
- Prominent, focused map consent step with export gating until map load completes.
- Editorial Photo, Expedition Log, A4 and Letter layouts.
- Route-linked annotations with a 500-item limit.
- Local JPEG export alongside SVG and PNG.
- Documentation for templates, annotations and print output.

## Unreleased — v0.3.0 development

### Added
- Provider-neutral geocoding and routing contracts with an openrouteservice adapter.
- User-confirmed candidate selection for ambiguous named places.
- Browser-local provider credential controls and a 20-request session budget.
- Route reconstruction from confirmed map-link intent as a planned route.
- Map zoom controls from wide context to closer route-centred views.
- Re-sequenced workspace and comprehensive acquisition/provider documentation.

## v0.3.0 development — acquisition security and interoperability

- Added a separately deployable Cloudflare Worker for constrained `maps.app.goo.gl` redirect expansion.
- Added exact redirect-host allowlists, HTTPS enforcement, redirect and timeout limits, origin-restricted CORS and private-address rejection.
- Added user-controlled short-link expansion, resolver endpoint persistence and cancellation.
- Integrated expanded full URLs with the existing route-intent parser and openrouteservice workflow.
- Added privacy-preserving short-link resolution evidence to route-generation receipts.
- Added adversarial redirect and resolver-client tests plus A1–A3 acquisition assurance documentation.
