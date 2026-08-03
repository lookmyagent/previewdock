# KKFileView sample audit

This page records the sample-format audit used to plan PreviewDock adapters. “Supported” means that an adapter exists; it does not guarantee that every damaged file or format variant will render successfully.

## Current coverage (92 of 106 extensions)

The current workspace covers representative text and source files, common and advanced images, PDF, browser-native media, ZIP/RAR/7Z archives, OpenXML and legacy/WPS Office, OpenDocument, OFD, RTF, EPUB, EML, XMind, BPMN, VSD/VSDX, WMF/EMF, mainstream 3D models, DXF, OFF, STEP, IGES, and BREP.

## Known gaps

The 14 extensions without a working adapter are `3gp`, `avi`, `bim`, `dwg`, `fcstd`, `flv`, `mkv`, `mpeg`, `mpg`, `rm`, `rmvb`, `six`, `swf`, and `wmv`. Most require licensed CAD/BIM import or browser-side media transcoding; `six` needs format identification.

Representative browser checks succeeded for BPMN, XMind, VSDX, OFD, ODT, EPUB, EML, RTF, WPS, ET, DPS, WMF, DXF, OFF, STEP, IGES, Rhino 3DM, and IFC. Some files in the source directory are plain-text placeholders or have a misleading extension, so those are not treated as valid compatibility failures.

Use the [format support matrix](/en/format-support) before promising production compatibility for a specific customer format.
