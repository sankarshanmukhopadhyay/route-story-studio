# Changelog

## Unreleased

### Added

- Hardened GPX 1.0 and GPX 1.1 ingestion
- Track, route and multi-segment normalisation
- Recorded-track and planned-route provenance distinction
- Structured import warnings and route summary
- Included sample route
- Portrait, square and landscape poster layouts
- Metric and imperial display
- Route, background and text colour controls
- Endpoint marker and statistic toggles

### Changed

- Canonical route schema now preserves segment boundaries
- Statistics no longer connect disconnected segments
- GitHub Actions upgraded to current requested major versions
- CI and Pages workflows use Node.js 24

### Security

- Reject XML document type and entity declarations
- Enforce GPX file-size, point-count and coordinate limits
