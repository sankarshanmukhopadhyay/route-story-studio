# Route Story short-link resolver

A narrowly scoped Cloudflare Worker that expands `maps.app.goo.gl` redirects. It accepts no arbitrary hosts, follows at most five approved Google redirects, returns redirect metadata only, and does not geocode or route.

## Deploy

```bash
npx wrangler deploy
```

Set `ALLOWED_ORIGINS` to the exact Route Story Studio origins. Configure the resulting Worker URL in the application UI or deployment configuration.
