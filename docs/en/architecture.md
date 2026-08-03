# Architecture

## Design goals

1. Keep the initial browser bundle small.
2. Load a format engine only when a matching file is opened.
3. Keep parsing and conversion away from the main thread where possible.
4. Let Vue, React, Web Components, and plain JavaScript share one runtime.
5. Support browser, desktop, and explicitly enabled remote compute providers.

## Runtime flow

```text
FileSource
  -> read a small header
  -> detect MIME, extension, and magic bytes
  -> match an adapter manifest
  -> dynamically import the adapter
  -> create a cancellable preview session
  -> mount into the host container
  -> dispose the session and temporary resources
```

## Heavy runtimes

Office WASM, FFmpeg WASM, libarchive WASM, OpenCascade WASM, and LibreDWG WASM are isolated from the core. Each runtime must support cancellation, progress, resource budgets, and deterministic cleanup.

The Office adapter imports Word and PowerPoint renderers only after a matching file is opened. It applies resource budgets, disables active content, and falls back to simplified local extraction when high-fidelity rendering cannot open a malformed document.

## Internationalization and sources

The Vue package ships English (`en`) and Simplified Chinese (`zh-CN`) messages. Hosts select a locale through the `locale` property. The runtime accepts `Blob`, `File`, `ArrayBuffer`, `Uint8Array`, and URL sources; remote URLs follow normal browser CORS and authentication rules.
