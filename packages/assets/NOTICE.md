# PreviewDock runtime assets

The copied runtime directory contains third-party WebAssembly and worker files.
Their original license files remain available in their npm packages:

- `libarchive.js` — MIT
- `occt-import-js` — LGPL-2.1
- `rhino3dm` — MIT
- `web-ifc` — MPL-2.0

Applications redistributing these assets must retain the applicable notices.
LibreDWG is not bundled by this package. Any future optional DWG integration
must stay in an isolated Worker and ship its GPL notice and corresponding
source link separately from the Apache-2.0 runtime.
