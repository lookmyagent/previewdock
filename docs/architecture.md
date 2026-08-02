# Architecture

## Design goals

1. Keep the initial browser bundle small.
2. Load format engines only when a matching file is opened.
3. Keep parsing and conversion away from the main thread.
4. Allow Vue, React, Web Components and plain JavaScript to share one runtime.
5. Support browser, desktop and explicitly enabled remote compute providers.

## Runtime flow

```text
FileSource
  -> read a small header
  -> detect MIME/extension/magic bytes
  -> resolve adapter manifest
  -> dynamically import adapter
  -> create cancellable preview session
  -> mount into host element
  -> dispose session and temporary resources
```

## Planned heavy runtimes

Heavy packages will be isolated from the core:

- Office WASM
- FFmpeg WASM
- libarchive WASM
- OpenCascade WASM
- LibreDWG WASM

Each runtime must support cancellation, progress reporting, resource budgets
and deterministic cleanup.

The current Office adapter already imports Word and PowerPoint renderers only
after a matching file is opened. It applies compressed and expanded size
budgets, disables active content, and falls back to simplified local extraction
when a high-fidelity renderer cannot open a malformed document. Moving all
OpenXML parsing into dedicated workers remains a hardening task for large files.

## Internationalization

The Vue package currently ships English (`en`) and Simplified Chinese
(`zh-CN`) messages. Hosts select a locale through the component's `locale`
property and may override messages without changing the core runtime.

## Source policy

The runtime accepts `Blob`, `File`, `ArrayBuffer`, `Uint8Array`, and URL
sources. Remote URLs are fetched by the browser and therefore follow normal
CORS and authentication rules. Applications may provide their own source
loader in a future API.
