# Security Policy

## Supported versions

The `main` branch is the supported development line until the first stable release.

## Reporting

Report vulnerabilities through GitHub private vulnerability reporting when enabled. Do not include private GPX tracks, home coordinates or other sensitive location data in a public issue.

## Baseline controls

- Maximum GPX file size of 25 MB
- Maximum route-point count of 250,000
- Latitude and longitude range validation
- Browser-native XML parsing without external entity resolution
- No server-side upload endpoint
- No embedded API credentials
- CI validation and test execution before Pages deployment
- Dependabot coverage for GitHub Actions
