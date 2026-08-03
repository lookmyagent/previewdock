# Legacy Office browser integration

The legacy Office adapter has two routes: binary Excel is parsed in the browser, while DOC/PPT use an optional LibreOffice WebAssembly converter.

## XLS, XLT, and XLA

SheetJS parses binary Excel workbooks and the read-only workbook UI renders them. SheetJS loads only after a matching file is opened.

Each preview is limited to 30 MB input, 20 worksheets, 500 rows per worksheet, and 100 columns per worksheet. These limits protect the UI from malicious or accidentally enormous ranges. Macros are never executed.

## DOC and PPT

DOC and PPT need a full document layout engine. The optional `converter-zetaoffice` package uses LibreOffice WebAssembly and is dynamically imported only after a DOC/PPT file is opened:

```ts
const adapter = createLegacyOfficeAdapter({
  converter: {
    id: 'zetaoffice-wasm',
    async convert(request) {
      const { createZetaOfficeConverter } = await import('@previewdock/converter-zetaoffice')
      return createZetaOfficeConverter({
        wasmPackage: 'https://static.example.com/zetaoffice/',
        zetaJsUrl,
      }).convert(request)
    },
  },
})
```

After conversion, the adapter creates a local object URL and displays the PDF in the existing PDF surface. The original file and generated PDF stay in the browser by default.

## Deployment requirements

Production systems should self-host and version `soffice.js`, `soffice.wasm`, `soffice.data`, and `soffice.data.js.metadata`, rather than relying permanently on a demo CDN.

The page must be cross-origin isolated:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

When assets are hosted on another origin, provide compatible CORS and `Cross-Origin-Resource-Policy` headers. Test iframe, SSO, payment, and third-party integrations under COOP/COEP; show conversion progress; enforce memory and input limits; disable macros and network-enabled document loading; and review the relevant licenses.
