# Format support and compatibility

“Supported” means useful read-only content can be presented in the browser. It does not promise pixel parity with desktop professional software. Validate production compatibility with real business files.

| Category | Formats | Status | Usage note |
| --- | --- | --- | --- |
| Office & Documents | DOCX, XLSX, PPTX and common templates | Available | Suitable for normal document reading; complex fonts, charts, and layout may differ |
| Office & Documents | DOC, XLS, PPT, WPS, ET, DPS | Experimental | Legacy XLS can be viewed directly; other legacy formats may need optional conversion |
| Office & Documents | PDF | Available | Uses the browser-supported PDF reading experience |
| Office & Documents | ODT, ODS, ODP, OFD, RTF, EPUB, EML | Experimental | Structured reading; validate complex styling with real files |
| Text & Data | TXT, Markdown, logs, source code, CSV, TSV, JSON, XML | Available | Read-only presentation; scripts are not executed |
| Archives | ZIP, JAR | Available | Standard mode supports 100 MB; large-file mode supports up to 1 GB with directory-only indexing and selected-entry extraction |
| Archives | TAR, GZIP, TGZ | Available | Standard mode supports up to 100 MB; sequential formats may need a scan from the beginning |
| Archives | RAR, 7Z | Experimental | Standard mode supports up to 100 MB and needs additional runtime assets; solid archives may process a complete data block |
| Images | PNG, JPEG, GIF, WebP, BMP, ICO, SVG | Available | Broad browser compatibility; active SVG content is not executed |
| Images | TIFF, TGA, PSD | Experimental | Intended for asset review, not professional editing |
| Media | MP3, WAV, OGG, AAC, FLAC, MP4, WebM, MOV | Available | Playback depends on the file codec and browser |
| Diagrams | BPMN, XMind, VSDX | Experimental | Workflow, mind-map, or page-oriented reading views |
| Diagrams | VSD, WMF, EMF | Experimental | May require optional conversion capability |
| 3D & CAD | GLB, glTF, OBJ, STL, PLY, FBX, 3MF and more | Experimental | Interactive viewing; external textures may need to be supplied |
| 3D & CAD | DXF, STEP, IGES, BREP, 3DM, IFC | Experimental | Some engineering formats need additional runtime assets and stricter limits |
| Not offered | DWG, FCSTD, BIM, SWF, and selected legacy media | Unsupported | Outside the current production commitment |

PreviewDock does not execute macros, embedded scripts, or active content. The host should define file-size, archive-expansion, codec, and model-resource boundaries.

Remote ZIP/JAR files in large-file mode require HTTP Range support. When the file server cannot return byte ranges, files over 100 MB are not downloaded in full and the viewer presents a clear environment message.
