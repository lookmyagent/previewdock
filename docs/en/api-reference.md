# API reference

This page records the core public API for the current Early Preview. Names may change before the first stable release.

## `createViewerEngine(packs)`

Creates the preview engine. It closes the previous session, detects the file, resolves an adapter, and manages cancellation.

```ts
const engine = createViewerEngine([basicPack, officePack])
```

## `defineAdapterPack(options)`

Groups manifests into a product capability:

```ts
const basicPack = defineAdapterPack({
  id: 'basic',
  label: 'Basic previews',
  adapters: [textAdapterManifest, imageAdapterManifest],
})
```

## `ViewerEngine`

- `open(source, options?)` accepts `Blob | ArrayBuffer | Uint8Array | string` and returns file information, a preview session, and cancellation.
- `close()` cancels the current operation and disposes the active session.
- `onStatus(listener)` observes `idle`, `loading-source`, `detecting`, `loading-adapter`, `opening`, `ready`, and `error`.

## `PreviewAdapter` and `PreviewSession`

```ts
interface PreviewAdapter {
  id: string
  label: string
  supports(file: FileDescriptor): boolean
  open(file: FileDescriptor, signal: AbortSignal): Promise<PreviewSession>
}

interface PreviewSession {
  adapterId: string
  adapterLabel: string
  capabilities: PreviewCapability[]
  mount(container: HTMLElement, signal: AbortSignal): void | Promise<void>
  dispose(): void | Promise<void>
}
```

## Vue component

Main props are `engine`, `source`, `fileName`, `locale` (`zh-CN` or `en`), and `showToolbar`. Main events are `status`, `ready`, and `error`.
