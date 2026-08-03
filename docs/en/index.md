# PreviewDock integration guide

PreviewDock gives web applications one consistent file-preview capability. Common files are organized into seven product categories with two integration choices—All mode and category mode—so file centers, approval attachments, knowledge bases, and design asset systems can use the same component.

## Integrate in three steps

1. Choose All mode or category mode for the product scope.
2. Create a PreviewDock engine and pass it to the Vue component.
3. Pass a `File`, `Blob`, or file URL to the component.

See [Getting started](/en/getting-started) for the complete example.

## Two integration modes

### All mode

For file centers, drives, and products with open-ended file types:

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

const engine = createAllFormatEngine()
```

### Category mode

For products that expose a defined set of formats. This example enables Office documents and images:

```bash
pnpm add vue @previewdock/core @previewdock/vue \
  @previewdock/preset-documents @previewdock/preset-images
```

```ts
import { createViewerEngine } from '@previewdock/core'
import { documentsPack } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'

const engine = createViewerEngine([documentsPack, imagesPack])
```

Both modes use the same Vue component. The only difference is whether all seven categories or selected categories are installed. See [All mode and category mode](/en/modular-integration).

## Seven format categories

| Category | Representative formats |
| --- | --- |
| Office & Documents | DOC/DOCX, XLS/XLSX, PPT/PPTX, PDF, ODF, OFD, RTF, EPUB |
| Text & Data | TXT, Markdown, source code, CSV, TSV, JSON, XML, logs |
| Archives | ZIP, JAR, TAR, GZIP, TGZ, RAR, 7Z |
| Images | PNG, JPEG, GIF, WebP, SVG, TIFF, TGA, PSD |
| Media | MP3, WAV, OGG, FLAC, MP4, WebM, MOV |
| Diagrams | BPMN, XMind, VSD/VSDX, WMF, EMF |
| 3D & CAD | GLB, glTF, OBJ, STL, FBX, DXF, STEP, IGES, 3DM, IFC |

See [Seven format categories](/en/categories) and [Format support and compatibility](/en/format-support) for the full scope.

## Product benefits

- One component covers seven file categories and reduces duplicate UI work.
- All and category modes fit different product scopes without changing the page later.
- Preview stays browser-first by default; the host controls file-transfer policy.
- Loading, failure, unsupported, and cleanup states share one experience.
- Complex formats can add runtime resources without affecting basic integrations.

## Before production

- Confirm file-source authentication and cross-origin policy.
- Define allowed formats, sizes, counts, and preview time limits.
- Prepare additional runtime resources for RAR/7Z, engineering models, and legacy Office.
- Never execute macros, embedded scripts, or other active content.
- Validate target browsers with representative business files.

Packages are publish-ready but have not completed their first npm release. They can currently be consumed through the repository workspace.
