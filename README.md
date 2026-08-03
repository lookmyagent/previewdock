# PreviewDock

A local-first, framework-agnostic file preview runtime for the browser.

[Documentation](./docs/index.md) · [Online playground](./apps/playground) · [Issues](https://github.com/lookmyagent/previewdock/issues) · [Releases](https://github.com/lookmyagent/previewdock/releases)

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
| `@previewdock/core` | File detection, adapter registry, lifecycle and cancellation |
| `@previewdock/vue` | Vue 3 host component |
| `@previewdock/adapter-text` | Safe text preview and sanitized Markdown source/rendered modes |
| `@previewdock/adapter-image` | Browser-native image preview |
| `@previewdock/adapter-pdf` | Browser-native PDF preview |
| `@previewdock/adapter-media` | Browser-native audio/video player |
| `@previewdock/adapter-archive` | ZIP/JAR/TAR/GZIP/TGZ/RAR/7Z directory browsing and embedded file preview |
| `@previewdock/adapter-openxml` | High-fidelity browser-side DOCX/XLSX/PPTX preview with safe fallback |
| `@previewdock/adapter-legacy-office` | XLS/XLT/XLA preview and optional DOC/PPT PDF-converter contract |
| `@previewdock/converter-zetaoffice` | On-demand, pure-browser DOC/PPT to PDF conversion through ZetaOffice WASM |
| `@previewdock/adapter-advanced-image` | TIFF/TGA/PSD canvas preview |
| `@previewdock/adapter-3d` | Interactive browser-side 3D model preview |
| `@previewdock/playground` | Development and integration playground |

## Quick start

```bash
pnpm install
pnpm dev
```

The workspace exposes three separate product surfaces so the public portal does
not bundle the full preview playground:

```bash
pnpm dev             # product portal
pnpm dev:docs        # documentation
pnpm dev:playground  # full-capability file preview playground
```

GitHub is the primary source repository. A Gitee mirror can be enabled later by
setting `gitee` in [`config/project.ts`](config/project.ts); empty repository
links are intentionally not rendered.

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
import { createViewerEngine, defineAdapterPack } from '@previewdock/core'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'

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
- WPS/WPT documents, ET/ETT workbooks, DPS presentations, VSD drawings, and
  WMF/EMF metafiles through the same lazy Office conversion pack
- Structured ODF, OFD, RTF, EPUB, EML, XMind, BPMN, and VSDX previews
- Interactive OFF/DXF, Rhino3dm/openNURBS 3DM, Web-IFC building models, plus
  OpenCascade-WASM STEP/IGES/BREP previews
- Simplified text/data fallback for malformed or partially supported OpenXML files
- DOCX/DOCM/DOTX/DOTM, XLSX/XLSM/XLTX/XLTM/XLAM, and
  PPTX/PPTM/POTX/POTM/PPSX/PPSM are routed through the Office adapter
- English and Simplified Chinese UI

## Roadmap

- Phase 1: harden text, images, PDF, OpenXML Office, audio/video and archives
- Phase 2: harden structured document renderers and accessibility
- Phase 3: evaluate legally compatible DWG/IFC/3DM/FCSTD import
- Phase 4: browser-side transcoding for non-native media codecs

Support levels will be published as `stable`, `beta`, `experimental`, or
`fallback`; an extension will never be advertised as fully supported solely
because one sample file opens.

See the honest [format support matrix](docs/format-support.md) and the
[architecture notes](docs/architecture.md).

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
