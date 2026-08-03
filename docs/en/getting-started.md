# Getting started

This page builds a Vue viewer with the official all-format preset. PreviewDock is currently an Early Preview, so package names and APIs may change before the first stable release.

## Install

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

## Create an engine

The preset registers lightweight manifests while parsers stay lazy:

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine()
```

Pass the engine to the Vue component:

```vue
<PreviewDock :engine="engine" :source="file" :file-name="file.name" locale="en" />
```

The host owns file selection, authentication, storage, and any remote conversion policy.

RAR/7Z, engineering CAD, and legacy DOC/PPT need additional runtime assets. See [Worker and WASM deployment](/en/deployment). Use [modular integration](/en/modular-integration) when only selected formats should be installed.
