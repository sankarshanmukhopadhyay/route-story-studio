# Changelog

All notable changes to Route Story Studio are documented here.

## Unreleased

### Fixed

- Serve axe-core through a same-origin test-only endpoint so browser accessibility assurance runs with the production Content Security Policy still enforced.
- Replace inline accessibility-script injection, which was correctly blocked by `script-src 'self'` in Chromium, Firefox and WebKit.


## [Unreleased]

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
