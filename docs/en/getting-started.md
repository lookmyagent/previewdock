# Getting started

This page builds a lightweight Vue viewer for text, images, and PDF. PreviewDock is currently an Early Preview, so package names and APIs may change before the first stable release.

## Install

```bash
pnpm add vue \
  @previewdock/core \
  @previewdock/vue \
  @previewdock/adapter-text \
  @previewdock/adapter-image \
  @previewdock/adapter-pdf
```

## Create an engine

Manifests provide detection metadata and lazy loaders:

```ts
import { createViewerEngine, defineAdapterPack } from '@previewdock/core'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { pdfAdapterManifest } from '@previewdock/adapter-pdf/manifest'

export const engine = createViewerEngine([
  defineAdapterPack({
    id: 'basic',
    adapters: [textAdapterManifest, imageAdapterManifest, pdfAdapterManifest],
  }),
])
```

Pass the engine to the Vue component:

```vue
<PreviewDock :engine="engine" :source="file" :file-name="file.name" locale="en" />
```

The host owns file selection, authentication, storage, and any remote conversion policy.
