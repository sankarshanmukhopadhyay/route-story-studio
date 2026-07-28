# Contributing

Contributions should preserve the local-first processing boundary unless a change explicitly documents why external processing is required.

## Pull-request requirements

1. Include tests for calculation or parsing changes.
2. Update architecture or privacy documentation when processing boundaries change.
3. Identify evidence produced by the change.
4. Avoid committing API keys, GPX tracks containing private journeys or unlicensed map assets.

Run:

```bash
npm run check
npm test
npm run build
```
