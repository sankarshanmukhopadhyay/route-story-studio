# Security and overload-resistance design

## Threat model

The primary untrusted input is a user-selected GPX/XML file. The principal availability risks are oversized files, excessive point or segment counts, XML entity expansion, expensive coordinate projection, oversized SVG paths, repeated render events and high-resolution raster exports.

## Enforcement points

| Stage | Control | Evidence |
|---|---|---|
| File admission | 8 MB browser-side limit | Parser test and visible UI limit |
| XML preflight | Reject DTD/entity declarations; count points and segments | `security-check` and unit tests |
| Normalisation | Validate coordinates and bound metadata | Parser failures |
| Statistics | Preserve segment boundaries | Unit tests |
| SVG rendering | Deterministic sampling caps | Export-security tests |
| UI rendering | Coalesce updates with animation frames | Source inspection and browser smoke test |
| PNG export | Pixel budget, timeout and URL revocation | Export helper tests |
| Automation | No checkout in privileged Dependabot workflow | Security-policy check |

## Residual risks

DOM-based XML parsing still requires memory proportional to accepted input size. The 8 MB input cap is therefore an operational control, not a proof of constant resource use. Future releases may move GPX parsing to a dedicated worker or adopt a streaming parser once browser compatibility and package assurance are established.
