# Runtime and deployment

PreviewDock's basic capabilities can ship with the frontend application. Complex archives, engineering models, and legacy Office files need additional runtime assets that the host should manage, cache, and authorize centrally.

## Base environment

- Use an HTTPS production origin.
- Ensure file URLs are authorized for frontend access and have correct cross-origin policy.
- Version and cache static assets while keeping the application entry updatable.
- Define business limits for file size, preview time, concurrency, and memory.
- Validate target desktop and mobile browsers with representative business files.

## Complex-format resources

Copy runtime assets that match the installed package versions:

```bash
pnpm add @previewdock/assets
pnpm exec previewdock-copy-assets ./public/previewdock
```

Vite applications can install `@previewdock/vite-plugin` and add
`previewDockAssets()` to the plugin list. Then provide one shared base URL:

```ts
const engine = createAllFormatEngine({ assetBaseUrl: '/previewdock/' })
```

All mode can receive shared runtime configuration. Category mode can configure each Pack separately:

```ts
const archives = createArchivesPack({
  archive: { workerUrl: '/previewdock/archive/worker.js' },
})

const models = createThreeDCadPack({
  model: { occtWasmUrl: '/previewdock/models/engineering.wasm' },
})

const documents = createDocumentsPack({
  legacyOffice: { converter },
})
```

The host controls asset URLs, filenames, and CDN structure. Pin versions in production so runtime assets always match the frontend packages.

## Large archive mode

PreviewDock provides two browser tiers:

| Mode | File range | Formats | Behavior |
| --- | --- | --- | --- |
| Standard | Up to 100 MB | ZIP, JAR, TAR, GZIP, TGZ, RAR, 7Z | Browse directories and content in the browser |
| Large file | 100 MB–1 GB | ZIP, JAR | Build a directory index, then read and extract only the selected entry |

Local files need no additional configuration. Remote ZIP/JAR servers must:

- accept `Range: bytes=...` and return `206 Partial Content`;
- provide correct `Content-Length`, `Content-Range`, and `Accept-Ranges: bytes`;
- allow the application origin in cross-origin deployments;
- avoid dynamic content encoding for ZIP/JAR responses so byte offsets remain stable.

RAR, 7Z, and TGZ files over 100 MB should use a server-assisted workflow because solid or sequential compression may require processing a full data block.

## Cross-origin isolation

Some large document-conversion capabilities require:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Before enabling these headers, test iframe, SSO, payment, and third-party script integrations. Cross-origin assets also need compatible CORS and resource-policy headers.

## Security boundary

- Never execute macros, embedded scripts, or active content.
- Sanitize text and graphics that may contain active content.
- Limit archive entry count, expansion size, and nesting depth.
- Remote conversion must be explicitly enabled by the host with clear user disclosure.
- Review runtime-asset and font licenses for the intended product use.

See [Legacy Office usage](/en/legacy-office) for product behavior and [Format support and compatibility](/en/format-support) for format status.
