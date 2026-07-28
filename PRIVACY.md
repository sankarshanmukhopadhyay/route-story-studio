# Privacy

Route Story Studio is designed to process GPX files locally in the user’s browser.

## Initial release

- No account is required.
- GPX files are not uploaded by the application.
- No analytics or advertising scripts are included.
- No route data is written to server logs by the application.
- Exported SVG files are created locally.

GitHub Pages and the user’s network provider may receive ordinary web-request metadata when the application assets are loaded. The application itself does not send the imported GPX contents to GitHub.

## Future external routing

Google Maps link-to-GPX reconstruction will require a routing provider when the link does not contain complete route geometry. Before any waypoint data leaves the browser, the interface must identify the recipient, data fields, purpose and expected retention boundary.
