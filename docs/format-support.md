# Format support

Support means rendering useful content, not merely recognizing a filename.

| Family | Current | Target approach |
| --- | --- | --- |
| Text, source code, CSV, TSV, JSON, XML, Markdown | Prototype | Raw text plus sanitized rendered/source Markdown modes |
| PNG, JPEG, GIF, WebP, BMP, ICO, JFIF, SVG | Prototype | Native image decode |
| TIFF, TGA, PSD | Experimental | Canvas composite decode, dimensions, rotate, mirror and zoom; PSD layer count |
| PDF | Prototype | Browser-native PDF viewer; PDF.js controls remain planned |
| OFD, RTF | Planned | Dedicated OFD/RTF adapters |
| DOCX, XLSX, PPTX and OpenXML templates | Prototype | `docx-preview` pagination, workbook-style XLSX grid, and `@aiden0z/pptx-renderer`; simplified content fallback |
| XLS, XLT, XLA | Experimental | SheetJS BIFF parser with workbook tabs and bounded read-only grid |
| DOC, PPT | Experimental | On-demand ZetaOffice/LibreOffice WASM conversion in the browser; converted PDF uses the existing preview surface |
| Other legacy WPS formats | Research | Optional WASM conversion pack or remote provider |
| ODT, ODS, ODP and related OpenDocument formats | Planned | ZIP/XML parsers in workers |
| EPUB, EML, XMind, BPMN | Planned | Sandboxed domain renderers |
| ZIP, TAR, GZIP, JAR | Prototype | Hierarchical browser, common embedded-file preview, downloads, and resource budgets |
| 7z, RAR | Research | Optional archive WASM pack |
| MP3, WAV, MP4, WebM, Ogg and related native codecs | Prototype | Native browser playback; exact codec support depends on browser/OS |
| AVI, WMV, RMVB, FLV and unsupported codecs | Research | Optional FFmpeg WASM transcoding pack |
| glTF, GLB, OBJ, STL, PLY, FBX, DAE, 3DS, 3MF, WRL | Experimental | Three.js loaders on demand; orbit, zoom, reset, animation and wireframe controls |
| STEP, IGES, IFC, BREP and other CAD/BIM | Research | Large optional OpenCascade/IFC WASM packs |
| DWG, DXF | Research | DXF parser; DWG requires a legally compatible engine |
| VSD/VSDX, WMF/EMF, SWF | Research | Format-specific decoders; SWF active content remains disabled |

Levels:

- `prototype`: implemented in this repository but not production-hardened.
- `experimental`: implemented and verified with representative samples, but
  malformed files, external model resources, unusual encodings and very large
  inputs can still fail.
- `planned`: a viable browser-side implementation path is known.
- `research`: feasibility, licensing, fidelity, or resource use still needs validation.

No adapter will execute document macros or active content.

OpenXML fidelity is format-specific: DOCX and PPTX preserve substantially more
layout and styling than the original text extractor. XLSX currently prioritizes
readable data, worksheet navigation, and familiar spreadsheet interaction over
pixel-perfect reproduction of every Excel style, chart, macro, and formula
behavior.
