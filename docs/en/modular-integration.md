# Modular integration and size

PreviewDock is a small Vue host plus independent format adapters. Install only the capability groups your product exposes. Import metadata from each package's `/manifest` entry; the parser is downloaded only after a matching file is detected.

## Capability groups

| Group | Install | Formats | Approximate cost |
| --- | --- | --- | --- |
| Host | `core`, `vue` | Host lifecycle and detection | dist about 68 KB plus Vue peer |
| Basic | `adapter-text`, `adapter-image`, `adapter-pdf` | Text, code, Markdown, data, common images, SVG, PDF | About 80 KB browser code |
| Modern Office | `adapter-openxml` | DOCX, XLSX, PPTX and OpenXML variants | About 1.3 MB per renderer |
| Legacy Office | `adapter-legacy-office`, optional `converter-zetaoffice` | DOC, XLS/XLT/XLA, PPT | Optional DOC/PPT WASM about 53 MB |
| Archive | `adapter-archive` | ZIP, JAR, TAR, GZIP, TGZ, RAR, 7Z | Worker and WASM about 1.1 MB |
| Media | `adapter-media` | Native browser audio/video | No decoder dependency |
| Advanced image | `adapter-advanced-image` | TIFF, TGA, PSD | `ag-psd` and shared Three.js |
| 3D | `adapter-3d` | glTF, GLB, OBJ, STL, PLY, FBX, DAE, 3DS, 3MF, WRL | About 1.2 MB lazy browser code |

The 16 MB Chinese font in Playground is a demonstration asset for legacy DOC/PPT conversion, not part of the core or normal adapters.

## Optional groups

```ts
const archivePack = defineAdapterPack({
  id: 'archive',
  adapters: [createArchiveAdapterManifest({
    workerUrl: '/ufv/libarchive/worker-bundle.js',
    previewEntry: openEmbeddedFile,
  })],
})
```

RAR/7Z Worker and `libarchive.wasm` must be hosted as static assets or on a CDN. Strict CSP needs `worker-src blob:`. `previewEntry` lets already installed adapters preview files nested in an archive.

## Modern and legacy Office

Modern Office does not need LibreOffice WASM:

```ts
const modernOfficePack = defineAdapterPack({
  id: 'modern-office',
  adapters: [openXmlAdapterManifest],
})
```

Legacy XLS is parsed in the browser. DOC and PPT use the separate opt-in converter path. There is no mandatory umbrella dependency; pass only the selected packs to `createViewerEngine`.
