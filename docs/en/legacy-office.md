# Legacy Office usage

PreviewDock places legacy Word, Excel, and PowerPoint files in the Office & Documents category. Integrators still use the same preview component, while selected legacy formats need an additional runtime capability.

## Coverage

| File type | Representative extensions | Product behavior |
| --- | --- | --- |
| Legacy Word | DOC, DOT, WPS, WPT | Convert to browser-friendly read-only content |
| Legacy Excel | XLS, XLT, XLA, ET, ETT | Present a read-only workbook view |
| Legacy PowerPoint | PPT, DPS | Convert to browser-friendly read-only content |
| Legacy drawings | VSD, WMF, EMF | Display through an optional conversion capability |

Legacy formats have many historical variants. Validate production support with real customer files. Preview targets readable content rather than pixel-perfect desktop Office reproduction.

## Integration

Both All mode and category mode accept a host-provided conversion capability:

```ts
const documents = createDocumentsPack({
  legacyOffice: { converter },
})
```

The host chooses a conversion service or local runtime and decides whether files may leave the browser. When a required capability is not configured, the component provides a clear unsupported or configuration message.

## Production checklist

- Serve the page and runtime assets over HTTPS with correct cross-origin headers.
- Limit input size, processing time, concurrency, and memory.
- Show progress and let users cancel long-running work.
- Disable macros, external-link updates, and network-enabled document loading.
- Tell users whether processing is local or server-side.
- Review commercial licenses for the selected conversion capability and fonts.

Large browser-side conversions may require cross-origin isolation headers. See [Runtime and deployment](/en/deployment).
