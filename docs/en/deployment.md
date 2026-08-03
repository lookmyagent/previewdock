# Worker and WASM deployment

Text, images, PDF, and native browser media need no extra runtime. RAR, 7Z, legacy Office/WPS, and STEP/IGES/BREP require Worker, WASM, or font assets.

## Archive

RAR/7Z use the `libarchive.js` Worker and `libarchive.wasm`. Copy them to the application static directory or CDN and pass the Worker URL through the manifest:

```ts
createArchiveAdapterManifest({
  workerUrl: '/previewdock/libarchive/worker-bundle.js',
})
```

Strict CSP must allow the Worker origin and `worker-src blob:` when the runtime patches a Worker in memory.

## Legacy Office

Legacy XLS uses SheetJS. DOC/PPT conversion is an opt-in ZetaOffice WASM path and may require about 53 MB of runtime plus fonts. Self-host and version the assets, configure caching and integrity, set file/memory/time limits, review licenses, and provide a clear fallback for unsupported browsers.

## CAD / engineering models

STEP, IGES, and BREP use `occt-import-js.wasm`. Self-host it at a stable same-origin URL and pass that URL to `createModelAdapterManifest({ occtWasmUrl })`. Apply long-lived caching and gateway limits for file size and conversion time. OFF and DXF do not need this WASM.

3DM uses `rhino3dm.js` and `rhino3dm.wasm`. Host both files in one same-origin folder and point `rhinoLibraryPath` at that folder.

IFC uses `web-ifc.wasm`. Host it in a same-origin folder and point `ifcWasmPath` at that folder.

## Security boundary

Do not execute macros, embedded scripts, or active content. Sanitize SVG, HTML, and Markdown. Limit archive entry counts, expansion size, and nesting depth. Remote conversion must be explicitly enabled by the host and clearly disclosed to the user.
