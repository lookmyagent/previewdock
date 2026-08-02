# Legacy Office browser integration

The legacy Office adapter deliberately uses two different routes.

## XLS, XLT and XLA

Binary Excel workbooks are parsed directly with SheetJS and rendered through
the same bounded, read-only workbook UI used by the other spreadsheet
adapters. SheetJS is imported only when a matching file is opened.

The browser limits each preview to:

- 30 MB input
- 20 worksheets
- 500 rows per worksheet
- 100 columns per worksheet

These limits protect the UI from malicious or accidentally enormous workbook
ranges. Macros are never executed.

## DOC and PPT

DOC and PPT require a full document layout engine for useful fidelity. The
optional `converter-zetaoffice` package implements the adapter contract with
LibreOffice WebAssembly. It is dynamically imported only after a DOC or PPT is
opened:

```ts
import { createLegacyOfficeAdapter } from '@previewdock/adapter-legacy-office'

const adapter = createLegacyOfficeAdapter({
  converter: {
    id: 'zetaoffice-wasm',
    async convert(request) {
      const { createZetaOfficeConverter } = await import(
        '@previewdock/converter-zetaoffice'
      )
      const { default: zetaJsUrl } = await import('zetajs/zeta.js?url')
      return createZetaOfficeConverter({
        // `free` is useful for evaluation. Use your own static URL in production.
        wasmPackage: 'https://static.example.com/zetaoffice/',
        zetaJsUrl,
      }).convert(request)
    },
  },
})
```

After conversion, the adapter creates a local object URL and displays the PDF
inside the existing PDF preview surface. The original file and generated PDF
do not need to leave the browser.

## ZetaOffice deployment requirements

ZetaOffice is not a normal JavaScript-only dependency. The converter defaults
to the official `free` beta CDN so the playground works without copying the
large runtime. Production systems should review the service terms and normally
self-host these static runtime files:

- `soffice.js`
- `soffice.wasm`
- `soffice.data`
- `soffice.data.js.metadata`

The small `zeta.js` wrapper is emitted by the host bundler through
`zetajs/zeta.js?url`; the `zetaHelper.js` wrapper and conversion worker are
bundled with the optional converter package. The large `soffice.*` files remain
separate and cacheable.

For the playground, point to a self-hosted runtime with:

```bash
VITE_ZETAOFFICE_ASSET_URL=https://static.example.com/zetaoffice/ pnpm dev
```

The document page must be cross-origin isolated:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

When the runtime files are hosted on another origin, that origin must also
provide compatible CORS and `Cross-Origin-Resource-Policy` headers.

Before enabling it in production:

- test existing iframe, SSO, payment and third-party integrations under COOP / COEP;
- host and version the WASM assets rather than depending permanently on a demo CDN;
- expose loading progress and cache immutable runtime files with a Service Worker;
- keep conversion in the ZetaOffice worker and enforce memory and input limits;
- disable macros, links and network-enabled document loading;
- review LibreOffice, ZetaOffice and redistributed binary licenses.

The converter opens documents read-only, disables macro execution, disables
linked-document updates, serializes conversions, removes temporary files from
the in-browser filesystem, and rejects input above the adapter's 30 MB limit.

The official ZetaJS repository includes a `convertpdf` example that writes a
local file into the Emscripten filesystem, invokes LibreOffice through UNO, and
reads the generated PDF back into the page.
