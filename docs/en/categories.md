# Seven format categories

PreviewDock provides seven official category presets based on product use cases. Integrators only decide which file types the product exposes, then choose All mode or the corresponding category packages.

| Category | Official preset | Representative formats |
| --- | --- | --- |
| Office & Documents | `@previewdock/preset-documents` | PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, WPS, ODF, OFD, RTF, EPUB, EML |
| Text & Data | `@previewdock/preset-text-data` | TXT, Markdown, logs, source code, CSV, TSV, JSON, XML |
| Archives | `@previewdock/preset-archives` | ZIP, JAR, TAR, GZIP, TGZ, RAR, 7Z |
| Images | `@previewdock/preset-images` | PNG, JPEG, GIF, WebP, BMP, ICO, SVG, TIFF, TGA, PSD |
| Media | `@previewdock/preset-media` | MP3, WAV, OGG, M4A, AAC, FLAC, MP4, WebM, MOV |
| Diagrams | `@previewdock/preset-diagrams` | BPMN, XMind, VSD, VSDX, WMF, EMF |
| 3D & CAD | `@previewdock/preset-3d-cad` | GLB, glTF, OBJ, STL, FBX, DXF, STEP, IGES, 3DM, IFC |

## Why product categories

Users care whether a product can preview documents, images, or engineering models—not which implementation sits behind each format. The seven categories keep product messaging, installation, and future expansion consistent.

Every category follows the same usage model:

1. the host provides a `File`, `Blob`, or accessible URL;
2. PreviewDock selects an installed preview capability;
3. one component presents loading, success, failure, and unsupported states;
4. unused categories can be omitted and added later as the product grows.

## Runtime requirements

Some complex formats need additional runtime assets or host capabilities. RAR/7Z need archive resources; STEP, IGES, 3DM, and IFC need engineering-model resources; legacy DOC/PPT and drawing formats need optional conversion; media codec support depends on the browser.

See [Worker and WASM deployment](/en/deployment) and the [format support matrix](/en/format-support).
