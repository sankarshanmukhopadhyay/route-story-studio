# Route Story Studio v0.3.0 — Route Poster Studio

Route Story Studio v0.3.0 closes the release around the product's simplest and clearest promise: import a GPX or KML file, choose a colour, photograph or consent-based map background, and export a polished route poster.

## Highlights

- GPX 1.0/1.1 and supported KML import remain the primary workflow.
- Solid-colour, local photograph and route-aligned OpenStreetMap backgrounds.
- Explicit map consent, provider-policy safeguards and bounded zoom controls.
- Portrait, square, landscape, editorial, expedition, A4 and Letter layouts.
- Route-relative annotations and reusable browser-local projects.
- SVG, PNG and JPEG export.
- Generated GPX/KML and provenance receipts for reconstructed planned routes.

## Experimental advanced route acquisition

Google Maps link review, short-link expansion and openrouteservice-based route generation remain available under a collapsed **Advanced** section. They are secondary because they require external infrastructure and credentials and do not yet offer the reliability or simplicity of direct GPX/KML import.

The advanced workflow is explicitly classified as reconstruction of a planned route, not evidence of completed travel.

## Privacy

GPX, KML, local project, photograph and image-export processing remain in the browser. OpenStreetMap requests occur only after explicit map consent. The experimental acquisition workflow sends data externally only after deliberate user actions.

## Upgrade note

No project migration is required. Existing v0.2.0 projects remain compatible.


## Elevation in the poster and summary

The generated poster now shows **Elevation range**, which is the highest point minus the lowest point represented in the route. The route summary uses simpler wording and shows **Total climb**, **Elevation range**, **Highest point** and **Lowest point** so the numbers are easier to understand.
