# Roadmap

## v0.3.0 — Route Poster Studio

Delivered: a clear GPX/KML-first workflow for producing colour, photograph or consent-based map-backed route posters; reusable local projects; map zoom; templates and annotations; SVG, PNG and JPEG export; and provenance-aware generated GPX/KML.

The Google Maps acquisition workflow remains available under an experimental advanced section. It requires a separately deployed resolver and user-supplied routing-provider credentials and is not part of the primary user journey.

## v0.4.0 — Timelines and motion

Delivered: deterministic trip timelines with timestamp/progress fallback; narrative moments; privacy-bounded local photo waypoints; accessible play, pause, seek and restart controls; richer ordered story sequences; schema 3.0 project persistence with v0.3 migration; browser-local story-media retention; and self-contained portable HTML story export.

Release acceptance is evidence-gated by the repository validation, built-site smoke, cross-browser/accessibility and privacy/security regression suite.

## Post-v0.4 — Maintained, proposal-driven development

The committed v0.3 and v0.4 product roadmap is complete. The repository is now maintained without a standing speculative feature backlog.

Future development starts through structured GitHub issues. A proposal may be promoted into an implementation tranche when it has:

1. a concrete user problem and expected value;
2. bounded scope and compatibility impact;
3. an explicit local-first, privacy and network-processing assessment;
4. testable acceptance criteria and evidence expectations; and
5. sufficient justification to preserve or deliberately revise the current product and governance boundaries.

Accepted work should proceed through a bounded issue → branch → pull request → validation/evidence → merge lifecycle. `main` remains the releasable authority. Roadmap entries are created only when validated proposals justify coordinated multi-issue delivery; filing a feature request does not itself commit the project to a release or milestone.

Bug fixes, security work, compatibility maintenance and documentation corrections may be prioritized directly when evidence demonstrates a concrete defect or maintenance need.
