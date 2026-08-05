# Format support and compatibility

“Supported” means useful read-only content can be presented in the browser. It does not promise pixel parity with desktop software. The table below is rendered directly from the same catalog used by presets, the portal, and Playground.

<FormatCatalog locale="en" />

- **Standard preview** provides a page, table, image, media, diagram, or model view appropriate to the file type.
- **Structural / quick preview** shows real metadata, readable content, and byte structure without pretending to provide desktop-editor fidelity.
- The release matrix still requires valid samples, non-empty mounting, and browser acceptance before publication.

PreviewDock does not execute macros, embedded scripts, or active content. The host should define file-size, archive-expansion, codec, and model-resource boundaries.

Remote ZIP/JAR files in large-file mode require HTTP Range support. When the file server cannot return byte ranges, files over 100 MB are not downloaded in full and the viewer presents a clear environment message.
