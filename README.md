# Universal File Viewer

A local-first, framework-agnostic file preview runtime for the browser.

The project is organized around lazily loaded format adapters. Opening a text
file does not download Office, CAD, archive, or media engines. Heavy parsers can
run in dedicated Web Workers or WebAssembly runtimes while the UI stays
responsive.

> Status: early architecture prototype. The public package name and project
> branding are working names and may change before the first release.

![Playground](docs/playground-screenshot.png)

## Packages

| Package | Purpose |
| --- | --- |
| `@universal-file-viewer/core` | File detection, adapter registry, lifecycle and cancellation |
| `@universal-file-viewer/vue` | Vue 3 host component |
| `@universal-file-viewer/adapter-text` | Safe text preview and sanitized Markdown source/rendered modes |
| `@universal-file-viewer/adapter-image` | Browser-native image preview |
| `@universal-file-viewer/adapter-pdf` | Browser-native PDF preview |
| `@universal-file-viewer/adapter-media` | Browser-native audio/video player |
| `@universal-file-viewer/adapter-archive` | ZIP/JAR/TAR/GZIP/TGZ/RAR/7Z directory browsing and embedded file preview |
| `@universal-file-viewer/adapter-openxml` | High-fidelity browser-side DOCX/XLSX/PPTX preview with safe fallback |
| `@universal-file-viewer/adapter-legacy-office` | XLS/XLT/XLA preview and optional DOC/PPT PDF-converter contract |
| `@universal-file-viewer/converter-zetaoffice` | On-demand, pure-browser DOC/PPT to PDF conversion through ZetaOffice WASM |
| `@universal-file-viewer/adapter-advanced-image` | TIFF/TGA/PSD canvas preview |
| `@universal-file-viewer/adapter-3d` | Interactive browser-side 3D model preview |
| `@universal-file-viewer/playground` | Development and integration playground |

## Quick start

```bash
pnpm install
pnpm dev
```

Build and test everything:

```bash
pnpm build
pnpm test
pnpm typecheck
```

## Adapter model

Adapters are registered by a lightweight `/manifest` entry. Their implementation
is loaded only after the core has detected a matching file. Applications install
only the format packages they use.

```ts
import { createViewerEngine, defineAdapterPack } from '@universal-file-viewer/core'
import { textAdapterManifest } from '@universal-file-viewer/adapter-text/manifest'

const engine = createViewerEngine([
  defineAdapterPack({ id: 'text', adapters: [textAdapterManifest] }),
])
```

See [modular integration](docs/modular-integration.md) for install combinations,
measured size estimates, archive worker setup, and selective Office support.

## Current support

- Text, source code, JSON, XML, CSV and TSV
- Markdown rendered preview with a switchable original-source view
- Browser-native images and SVG
- TIFF, TGA and PSD composite previews with rotate, mirror and zoom controls
- Interactive glTF/GLB, OBJ, STL, PLY, FBX, DAE, 3DS, 3MF and WRL model
  previews with orbit, zoom, reset and wireframe controls
- Browser-native PDF
- Browser-native audio/video codecs
- ZIP, JAR, TAR, GZIP, TGZ/TAR.GZ, RAR and 7Z hierarchical browsing, embedded
  common-file preview, original-file download, and optional delegation of
  embedded Office/3D/advanced-image files to the host viewer
- High-fidelity browser-side Word preview through `docx-preview`, workbook-style
  XLSX rendering with sheet tabs and sticky headers, and PowerPoint rendering
  through `@aiden0z/pptx-renderer`
- Legacy XLS/XLT/XLA workbooks through a lazily loaded SheetJS adapter
- Pure-browser DOC/PPT-to-PDF conversion through an on-demand ZetaOffice WASM
  pack; the original file never leaves the browser
- Simplified text/data fallback for malformed or partially supported OpenXML files
- DOCX/DOCM/DOTX/DOTM, XLSX/XLSM/XLTX/XLTM/XLAM, and
  PPTX/PPTM/POTX/POTM/PPSX/PPSM are routed through the Office adapter
- English and Simplified Chinese UI

## Roadmap

- Phase 1: harden text, images, PDF, OpenXML Office, audio/video and archives
- Phase 2: EPUB, BPMN, XMind, EML and OpenDocument formats
- Phase 3: DWG/DXF and OpenCascade-based CAD formats
- Phase 4: browser-side Office and media conversion through optional WASM packs

Support levels will be published as `stable`, `beta`, `experimental`, or
`fallback`; an extension will never be advertised as fully supported solely
because one sample file opens.

See the honest [format support matrix](docs/format-support.md), the
[architecture notes](docs/architecture.md), and the original
[design concept](docs/design-concept.png).

The optional DOC/PPT conversion route and deployment requirements are described
in [Legacy Office integration](docs/legacy-office.md).

## Security principles

- Parse untrusted files outside the main UI thread.
- Never execute document macros, embedded scripts, or active content.
- Apply archive expansion, memory, time and entry-count limits.
- Sanitize SVG, HTML, Markdown and email content before rendering.
- Make remote processing an explicit opt-in provider.

## License

Apache-2.0. Individual format adapters may have additional dependency license
requirements and must declare them independently.

## Contributing

Issues and focused adapter pull requests are welcome. Read
[CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before
submitting code that parses untrusted files.
