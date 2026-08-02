# Contributing

PreviewDock is intentionally split into a small core and independent
format adapters. Contributions should preserve that boundary.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```

## Adding an adapter

1. Create a package under `packages/adapter-<format>`.
2. Export a lightweight manifest and a lazily loaded adapter.
3. Keep parsing off the main thread when work may exceed one animation frame.
4. Implement cancellation and deterministic cleanup.
5. Add malformed, oversized, and representative sample tests.
6. Document dependency licenses and the actual support level.

Do not claim support based on extension matching alone. A format is `stable`
only after compatibility, resource-budget, malformed-input, and browser tests.

## Pull requests

Keep changes focused, include tests, and explain any new WASM/runtime download
size. Generated fixtures must be redistributable and free of sensitive data.
