# Privacy

Route Story Studio is local-first, but some optional features use external services.

## Local processing

The following remain in the browser:

- GPX and KML files
- local and portable projects
- imported photographs
- route statistics and composition settings
- annotations
- SVG, PNG and JPEG generation
- Google Maps URL parsing and route-intent review

No account, analytics or advertising scripts are included.

## Explicit external processing

### Place resolution and routing

When the user selects the relevant action, the chosen provider receives:

- named place text for geocoding;
- confirmed origin, destination and waypoint coordinates;
- selected travel mode.

The initial adapter is openrouteservice. API keys are stored in browser session storage by default, or persistent browser storage only when “Remember key” is selected. Keys are excluded from projects, generated route data and exports.

### Map backgrounds

After explicit consent, OpenStreetMap receives the visible route area through tile requests and ordinary network metadata. Solid-colour and photograph backgrounds avoid this request.

## User control

Users can clear saved provider credentials, reset the workspace, clear browser projects, avoid map backgrounds and use coordinate inputs to avoid geocoding.

## Short-link resolution

When the user explicitly expands a `maps.app.goo.gl` link, that short URL is sent to the configured resolver gateway. The reference gateway follows only approved Google Maps redirects and returns the final URL plus minimal redirect metadata. Complete URLs should not be retained in operational logs. The later provenance receipt contains a hash of the original short URL rather than the URL itself.
