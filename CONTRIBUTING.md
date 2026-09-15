# Contributing

Route Story Studio is maintained through proposal-driven development. Contributions should preserve the local-first processing boundary unless a change explicitly documents why external processing is required and what new privacy, authority or operational consequences follow.

## Development lifecycle

Use the repository issue forms as the entry point for new work:

1. **Propose or reproduce** — file a structured feature proposal or bug report with bounded scope and non-sensitive evidence.
2. **Assess** — establish user value, compatibility impact, local-first/privacy/network impact and testable acceptance criteria before implementation.
3. **Implement modularly** — work on a bounded branch linked to the issue; keep commits iterative and independently understandable where practical.
4. **Prove** — add or update deterministic unit, negative, browser, accessibility, privacy/security or built-site tests appropriate to the change.
5. **Review and merge** — merge only when the required repository checks are green and the evidence satisfies the issue acceptance criteria.
6. **Close or promote** — close the issue when complete. Promote work into `ROADMAP.md` only when a validated set of proposals requires coordinated multi-issue delivery.

`main` is the releasable authority. A feature request is an input to prioritization, not a release commitment.

## Pull-request requirements

1. Link the controlling issue and state the proposition being implemented.
2. Include tests for calculation, parsing, persistence, playback or other behavioral changes.
3. Update architecture, privacy, security, schema, user or release documentation when relevant boundaries change.
4. Identify the evidence produced by the change and the commands/checks used to validate it.
5. State compatibility and migration consequences explicitly when saved projects, schemas, exports or supported browsers are affected.
6. Avoid committing API keys, GPX/KML tracks containing private journeys, sensitive photographs, embedded private metadata or unlicensed map assets.

## Validation

At minimum, run:

```bash
npm run check
npm test
npm run build
```

For changes that affect the built product, browser behavior or release boundaries, use the repository's broader validation and browser-assurance workflows as applicable. A green workflow is evidence of the tested propositions only; it does not substitute for documenting any changed privacy, authority or compatibility boundary.
