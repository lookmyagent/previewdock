# Format support matrix

Support means rendering useful content, not merely recognizing a filename.

| Family | Current status | Implementation direction |
| --- | --- | --- |
| Text, source, CSV, TSV, JSON, XML, Markdown | Prototype | Raw text and sanitized Markdown/source modes |
| PNG, JPEG, GIF, WebP, BMP, ICO, JFIF, SVG | Prototype | Native image decode |
| TIFF, TGA, PSD | Experimental | Canvas composition, dimensions, transforms, and PSD layer information |
| PDF | Prototype | Browser-native PDF viewer; PDF.js controls planned |
| OFD, RTF | Experimental | OFD pages/text layers and sanitized formatted RTF reading |
| DOCX, XLSX, PPTX and OpenXML templates | Prototype | `docx-preview`, workbook-style XLSX grid, PPTX renderer, simplified fallback |
| XLS, XLT, XLA | Experimental | SheetJS BIFF parser with bounded read-only workbook UI |
| DOC, DOT, PPT, WPS, WPT, DPS | Experimental | Lazy ZetaOffice / LibreOffice WASM; documents to DOCX and presentations to PDF |
| ET, ETT | Experimental | Read-only SheetJS workbooks with sheet switching |
| ODT, ODS, OTS, ODP, OTP, OTT, FODT, FODS | Experimental | Structured ZIP/XML document, workbook, and slide views |
| EPUB, EML, XMind, BPMN | Experimental | Chapter reader, mail view, mind-map tree, and BPMN-DI SVG workflow |
| ZIP, TAR, GZIP, JAR | Prototype | Hierarchical browsing, nested preview, downloads, resource budgets |
| 7z, RAR | Research | Optional archive WASM pack |
| MP3, WAV, MP4, WebM, Ogg | Prototype | Native browser playback; codec support varies by browser and OS |
| AVI, WMV, RMVB, FLV, and unsupported codecs | Research | Optional FFmpeg WASM transcoding; excluded from this production bundle |
| glTF, GLB, OBJ, STL, PLY, FBX, DAE, 3DS, 3MF, WRL | Experimental | Lazy Three.js loaders with interaction controls |
| OFF, STEP/STP, IGES/IGS, BREP | Experimental | OFF mesh parsing and lazy OpenCascade WASM with interactive 3D controls |
| DXF | Experimental | 2D entities rendered as an interactive line model |
| 3DM | Experimental | Rhino3dm/openNURBS WASM with an interactive 3D view |
| IFC | Experimental | Web-IFC WASM geometry parsing with an interactive, element-colored 3D view |
| DWG, FCSTD, BIM | Research | Legally compatible or format-specific conversion/WASM engines required |
| VSD, WMF, EMF | Experimental | Lazy ZetaOffice Draw conversion to PDF |
| VSDX | Experimental | Structured SVG view from page XML, shapes, and labels |
| SWF | Unsupported | Flash active content is never executed; only safe static/video conversion may be considered |

Prototype means implemented but not production-hardened. Experimental means representative samples work but malformed, unusual, or very large inputs may fail. Planned means a viable path is known. Research means feasibility, licensing, fidelity, or resource use remains under evaluation.
