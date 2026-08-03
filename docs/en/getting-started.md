# Getting started

This page builds a Vue viewer with the official all-format preset. PreviewDock is currently an Early Preview, so package names and APIs may change before the first stable release.

## Install

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

## Create an engine

All mode provides all seven file categories through one engine:

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine()
```

Pass the engine to the Vue component:

```vue
<PreviewDock :engine="engine" :source="file" :file-name="file.name" locale="en" />
```

The host owns file selection, authentication, storage URLs, and access policy. PreviewDock presents files that the host has already authorized.

RAR/7Z, engineering CAD, and legacy DOC/PPT need additional runtime assets. See [Worker and WASM deployment](/en/deployment). Use [modular integration](/en/modular-integration) when only selected formats should be installed.

See [seven format categories](/en/categories) for the product capability boundaries.
