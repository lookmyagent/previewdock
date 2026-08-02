# Modular integration

Universal File Viewer is published as a small Vue host plus independent format
adapters. An application should install only the capability groups it needs.
Import adapter metadata from each package's `/manifest` entry: this entry does
not load the parser. The parser is downloaded only when the engine detects a
matching file.

## Capability groups

The sizes below are measurements from this workspace. "Install" is unpacked
dependency size in `node_modules`; "browser resources" is the approximate
uncompressed code/runtime downloaded when that group is first used. Package
manager deduplication and production compression will change the final figures.

| Group | Install these packages | Formats | Approximate cost |
| --- | --- | --- | --- |
| Host | `core`, `vue` | Framework host and detection | package dist about 68 KB, plus the application's Vue peer |
| Basic | `adapter-text`, `adapter-image`, `adapter-pdf` | Text/code, MD, CSV/TSV, JSON/XML, common images, SVG, PDF | text dependencies about 2.2 MB installed; roughly 80 KB browser code before compression |
| Modern Office | `adapter-openxml` | DOCX/DOCM/DOTX/DOTM, XLSX/XLSM/XLTX/XLTM/XLAM, PPTX/PPTM/POTX/POTM/PPSX/PPSM | roughly 1.3 MB browser code, loaded per renderer |
| Legacy Office | `adapter-legacy-office`; add `converter-zetaoffice` for DOC/PPT | DOC, XLS/XLT/XLA, PPT | SheetJS about 7.8 MB installed; DOC/PPT runtime is an optional cached WASM pack of about 53 MB |
| Archive | `adapter-archive` | ZIP/JAR/TAR/GZIP/TGZ/RAR/7Z | dependencies about 3.1 MB installed; RAR/7Z worker and WASM about 1.1 MB |
| Media | `adapter-media` | Browser-native audio/video codecs | no decoder dependency; codecs unsupported by the browser still require an optional transcoder/service |
| Advanced image | `adapter-advanced-image` | TIFF/TGA/PSD | `ag-psd` about 18 MB and shared Three.js about 25 MB installed |
| 3D | `adapter-3d` | glTF/GLB/OBJ/STL/PLY/FBX/DAE/3DS/3MF/WRL | Three.js about 25 MB installed; roughly 1.2 MB browser code across lazy chunks |

The 16 MB Chinese font in the Playground is a demonstration asset for legacy
DOC/PPT conversion. It is not part of `core`, `vue`, or an adapter package.

## Small basic viewer

```bash
pnpm add vue \
  @universal-file-viewer/core \
  @universal-file-viewer/vue \
  @universal-file-viewer/adapter-text \
  @universal-file-viewer/adapter-image \
  @universal-file-viewer/adapter-pdf
```

```ts
import { createViewerEngine, defineAdapterPack } from '@universal-file-viewer/core'
import { textAdapterManifest } from '@universal-file-viewer/adapter-text/manifest'
import { imageAdapterManifest } from '@universal-file-viewer/adapter-image/manifest'
import { pdfAdapterManifest } from '@universal-file-viewer/adapter-pdf/manifest'

export const engine = createViewerEngine([
  defineAdapterPack({
    id: 'basic',
    adapters: [textAdapterManifest, imageAdapterManifest, pdfAdapterManifest],
  }),
])
```

The host application then passes this engine to the Vue component. Adding a
capability does not change the component UI:

```vue
<UniversalFileViewer :engine="engine" :source="file" :file-name="file.name" />
```

## Add an optional archive group

```bash
pnpm add @universal-file-viewer/adapter-archive
```

```ts
import { createArchiveAdapterManifest } from '@universal-file-viewer/adapter-archive/manifest'

const archivePack = defineAdapterPack({
  id: 'archive',
  adapters: [createArchiveAdapterManifest({
    workerUrl: '/ufv/libarchive/worker-bundle.js',
    // Optional: delegate DOCX/XLSX/PPTX/DOC/PSD/3D and other embedded files
    // to a separate ViewerEngine that shares the host registry.
    previewEntry: openEmbeddedFile,
  })],
})
```

The RAR/7Z worker and `libarchive.wasm` should be copied to the application's
static asset directory or CDN. The adapter repairs the libarchive.js 2.0.x 7Z
entry-type issue in memory; a strict CSP must therefore allow `worker-src blob:`.
Set `patchWorker: false` only when hosting an already repaired worker.
ZIP/JAR/TAR/GZIP/TGZ do not initialize that runtime.

`previewEntry` is optional. Without it, built-in text, image, PDF and media
files are previewed and every other extracted file remains downloadable. With
it, the host can create a child `ViewerEngine` using the same registry, so any
format installed in the host can also be opened from inside an archive without
closing the archive browser.

## Add modern and legacy Office separately

Modern Office does not need the LibreOffice WASM runtime:

```ts
import { openXmlAdapterManifest } from '@universal-file-viewer/adapter-openxml/manifest'

const modernOfficePack = defineAdapterPack({
  id: 'modern-office',
  adapters: [openXmlAdapterManifest],
})
```

Legacy XLS works after installing `adapter-legacy-office`. DOC and PPT require a
converter, so they remain a separate opt-in path:

```ts
import { createLegacyOfficeAdapterManifest } from '@universal-file-viewer/adapter-legacy-office/manifest'

const legacyOfficePack = defineAdapterPack({
  id: 'legacy-office',
  adapters: [createLegacyOfficeAdapterManifest({ converter })],
})
```

See [Legacy Office integration](legacy-office.md) for the ZetaOffice runtime,
font, caching, and cross-origin isolation requirements.

## Full viewer

There is deliberately no mandatory umbrella dependency. A full viewer is just
all selected packs passed to `createViewerEngine`:

```ts
const engine = createViewerEngine([
  basicPack,
  modernOfficePack,
  legacyOfficePack,
  archivePack,
  mediaPack,
  advancedImagePack,
  modelPack,
])
```

This keeps the right-drawer integration unchanged while allowing each host
system to choose its own storage, network, security, and browser-compatibility
budget.
