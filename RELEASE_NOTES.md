# Route Story Studio v0.4.0 — Timelines and motion

Route Story Studio v0.4.0 extends the local-first route-poster workflow into a route-story workflow without making story authoring mandatory.

## Highlights

- GPX 1.0/1.1 and supported KML import remain the primary workflow.
- Timestamp-derived journey timelines with deterministic route-progress fallback when timestamps are unavailable.
- Ordered narrative moments anchored explicitly to route progress.
- Privacy-bounded local photo waypoints with mandatory accessible captions/descriptions.
- Browser-local image decode and canvas re-encode so source EXIF/XMP/IPTC metadata is not copied into prepared story media.
- Deterministic play, pause, seek and restart controls with reduced-motion behavior.
- Rich story sequences combining narrative/photo moments with existing route annotations.
- Schema 3.0 project persistence with deterministic migration from supported schema 2.0 projects.
- Dedicated browser-local IndexedDB retention for prepared story-photo payloads, separate from bounded project metadata.
- Self-contained portable HTML story export with escaped authored content and a restrictive network-free CSP.
- Existing SVG, PNG and JPEG poster exports remain available with zero story events.

## Privacy and security

GPX, KML, project, story, photograph, playback and story-export processing remain local by default. Story photographs are not uploaded. Photo location/time are not inferred from embedded metadata. Portable story HTML allows embedded `data:` images and contains no external scripts or runtime network dependency.

The existing OpenStreetMap consent boundary and experimental provider-based route-acquisition disclosures remain unchanged.

## Compatibility

Existing schema 2.0 project files migrate deterministically to schema 3.0 with empty story state. Existing route, composition and annotation state is retained. Unsupported project schemas fail closed.

The established GPX/KML → poster workflow remains regression-covered and does not require story authoring.

## Assurance

Release acceptance is evidence-backed by unit/negative tests, project migration and round-trip tests, built-site smoke testing, Chromium/Firefox/WebKit end-to-end coverage, accessibility checks, story save/reopen tests and portable-export security tests. See `docs/v0.4-assurance.md`.

## Advanced route acquisition

Google Maps link review, constrained short-link expansion and openrouteservice-based planned-route generation remain under the collapsed **Advanced** workflow. Generated geometry is explicitly classified as reconstruction of a planned route rather than evidence of completed travel.
