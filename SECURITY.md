# Security policy

## Supported version

The current development branch is supported until the first public release. Security fixes are applied to `main` and included in the next tagged release.

## Reporting

Do not disclose a suspected vulnerability through a public issue. Use GitHub's private vulnerability reporting feature when enabled, or contact the repository owner through the profile contact channel.

Include reproduction steps, affected inputs, expected impact and any evidence that route data left the browser.

## Processing and trust boundary

GPX files are processed locally. The application has no upload endpoint, account system, analytics service, external map request or routing provider in the current scope.

## Resource-exhaustion controls

The application treats GPX input as untrusted data and enforces:

- an 8 MB input limit;
- a maximum of 100,000 route points;
- a maximum of 2,000 segments or routes;
- preflight point and segment counting before XML DOM construction;
- rejection of XML document type and entity declarations;
- coordinate validation;
- bounded metadata lengths;
- route-path sampling to at most 6,000 rendered points;
- elevation sampling to at most 2,000 rendered points;
- a maximum PNG pixel budget;
- an export timeout and object-URL revocation;
- render coalescing through `requestAnimationFrame`.

These controls reduce browser freezing, memory exhaustion, oversized SVG output and malicious XML expansion. They do not make arbitrary untrusted XML risk-free.

## Browser controls

The page declares a restrictive Content Security Policy and no-referrer policy. GitHub Pages cannot set every desired response header from repository content alone, so deployment-level controls such as `Permissions-Policy`, `X-Content-Type-Options` and CSP `frame-ancestors` are documented limitations.

## Automated controls

CI runs structural, unit, security-policy and static-build checks. The Dependabot auto-merge workflow does not check out or execute pull-request code and only operates for the `dependabot[bot]` actor.
