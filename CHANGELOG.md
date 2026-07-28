# Changelog

## Unreleased

### Added

- Deterministic SVG and standard or 2× PNG export.
- Dependabot auto-merge workflow for GitHub Actions and eligible npm updates.
- Grouped Dependabot update policy.
- Automated security-policy and built-site HTTP smoke checks.
- Security and overload-resistance architecture documentation.

### Security

- Reduced the maximum GPX file size to 8 MB.
- Added preflight point and segment counting before XML parsing.
- Added a 100,000-point and 2,000-segment limit.
- Retained DTD and entity rejection.
- Added bounded route and elevation rendering.
- Added PNG pixel and timeout limits.
- Added Content Security, permissions and referrer policies.
- Removed warning rendering through HTML string interpolation.
