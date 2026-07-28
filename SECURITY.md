# Security policy

## Supported version

The latest tagged release and the current `main` development branch receive security fixes.

## Reporting

Do not disclose a suspected vulnerability through a public issue and do not include private route data or API keys in reports. Use GitHub private vulnerability reporting when available, or contact the repository owner through the profile contact channel.

## Processing and trust boundaries

Route Story Studio separates three boundaries:

1. **Local browser processing:** GPX, KML, projects, photographs, composition and image export.
2. **Explicit route acquisition:** named-place text and confirmed coordinates sent to the selected routing provider.
3. **Explicit map loading:** visible route area requested from the selected tile provider.

No account or analytics service is included.

## Route and document hardening

- 8 MB route-file limit
- 100,000 route-point limit
- 2,000 route structures
- DTD and entity rejection
- coordinate and metadata validation
- 6,000 rendered route points
- 2,000 elevation points
- bounded project, image and export sizes

## Provider and network hardening

- fixed HTTPS provider endpoints
- browser-local API credentials
- credentials excluded from projects and exports
- five geocoding candidates per place
- 25 intermediate waypoints
- 20 external acquisition requests per browser session
- geocoding and routing timeouts
- 2 MB provider-response limit
- 100,000 generated-point limit
- JSON/GeoJSON content-type validation
- no silent provider fallback
- explicit map consent and nine-tile limit
- blocked OpenStreetMap response detection

## Browser controls

The application declares a restrictive Content Security Policy and uses `strict-origin-when-cross-origin`, which supports provider identification while limiting cross-origin path disclosure. GitHub Pages cannot set every desired response header from repository content alone.

## Automated controls

CI runs structural, unit, security-policy, documentation, static-build and browser-assurance checks. The Dependabot auto-merge workflow never checks out or executes pull-request code.
