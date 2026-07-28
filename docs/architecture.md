# Architecture

## System boundary

Route Story Studio is a static, local-first browser application. GitHub Pages supplies immutable application assets. GPX content is read through browser file APIs and is not submitted to GitHub or an application backend.

## Functional pipeline

```text
GPX file or bundled sample
  → constrained XML validation
  → GPX 1.0/1.1 normalisation
  → canonical route document
  → segment-aware statistics
  → layout and presentation state
  → deterministic SVG poster
  → local download
```

## Canonical route model

The model preserves segments rather than flattening disconnected geometry. This prevents the statistics and renderer from inventing a line between independent tracks. Each document records whether its source was interpreted as a recorded track or a planned route, together with import warnings and source metadata.

## Authority and provenance

The source GPX remains authoritative for imported geometry and elevation. Route Story Studio computes presentation statistics but does not correct coordinates, infer a travelled route or claim that planned geometry was recorded. Any future map-link conversion must mark output as a reconstructed planned route and identify the routing provider.

## Enforcement boundaries

- Maximum file size: 25 MB
- Maximum route points: 250,000
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- XML document type and entity declarations: rejected
- External processing: absent from the current release line

## Evidence

CI runs structural checks, unit tests and a deterministic static build. The built site is uploaded as workflow evidence and Pages deployment depends on successful validation.
