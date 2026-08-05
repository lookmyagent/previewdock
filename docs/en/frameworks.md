# Vue, React and Web integration

All framework packages use the same engine and adapter lifecycle.

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'
export const engine = createAllFormatEngine({ assetBaseUrl: '/previewdock/' })
```

## Vue 3

Install `vue`, `@previewdock/vue` and `@previewdock/preset-all`, then render:

```vue
<PreviewDock :engine="engine" :source="file" locale="en" />
```

## Vue 2.6 / 2.7

Install `@previewdock/vue2`, register its default plugin with `Vue.use()`, and use the same component props and events.

## React 16.8–19

```tsx
import PreviewDock from '@previewdock/react'
<PreviewDock engine={engine} source={file} style={{ height: 720 }} />
```

## Vanilla JS / Web Component

```ts
import { mountPreviewDock } from '@previewdock/web'
const viewer = mountPreviewDock(document.querySelector('#viewer'), { engine, source: file })
await viewer.dispose()
```

Call `registerPreviewDockElement()` for `<preview-dock>`. Every integration exposes ready, error and status lifecycle notifications plus an imperative `open()` method.
