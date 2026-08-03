# PreviewDock integration guide

PreviewDock is a local-first, lazy-loaded browser file preview runtime. Install only the capability packs your product needs; the matching parser loads when a file is opened.

## Quick integration

For a lightweight Vue viewer:

```bash
pnpm add vue \
  @previewdock/core \
  @previewdock/vue \
  @previewdock/adapter-text \
  @previewdock/adapter-image \
  @previewdock/adapter-pdf
```

```ts
import { createViewerEngine, defineAdapterPack } from '@previewdock/core'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { pdfAdapterManifest } from '@previewdock/adapter-pdf/manifest'

const engine = createViewerEngine([
  defineAdapterPack({
    id: 'basic',
    adapters: [textAdapterManifest, imageAdapterManifest, pdfAdapterManifest],
  }),
])
```

Manifests contain matching metadata and lazy entry points. Registering a manifest does not download its parser.

## Choose capability packs by scenario

| Scenario | Recommended capability | Typical incremental browser cost |
| --- | --- | --- |
| Attachments and file details | `core + vue + basic` | About 80 KB before compression |
| Knowledge bases and document centers | Add `adapter-openxml` | About 1.3 MB per Office renderer |
| Drives and archive browsing | Add `adapter-archive` | About 1.1 MB for archive Worker/WASM |
| Design assets, 3D, and legacy Office | Add specialist packs | Large assets remain optional and lazy-loaded |

## Runtime flow

```text
File / Blob / URL
  -> read name, MIME, and magic bytes
  -> match an adapter manifest
  -> dynamically load the matched adapter
  -> create a cancellable preview session
  -> dispose workers, object URLs, and temporary data on close
```

## Deployment requirements

- Text, common images, PDF, and native browser media need no extra runtime.
- DOCX, XLSX, and PPTX use the modern Office adapter.
- RAR and 7Z require Worker and WASM static assets.
- DOC and PPT use an optional legacy conversion path with large WASM and font assets.
- Hosts must limit input size, archive expansion, memory, and execution time.
- Macros, embedded scripts, and active content are never executed.

The sidebar contains the same integration chapters as the Chinese documentation. Only the language changes; page order and scope stay aligned.
