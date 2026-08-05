# Vue、React 与原生 Web 接入

所有框架包都只负责生命周期和 DOM 挂载，文件识别、格式能力和错误状态由同一个 `ViewerEngine` 提供。

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine({
  assetBaseUrl: '/previewdock/',
})
```

## Vue 3

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

```vue
<PreviewDock :engine="engine" :source="file" locale="zh-CN" />
```

## Vue 2.6 / 2.7

```bash
pnpm add @previewdock/vue2 @previewdock/preset-all
```

```ts
import Vue from 'vue'
import PreviewDock from '@previewdock/vue2'
Vue.use(PreviewDock)
```

Vue 2 使用同样的 `engine`、`source`、`file-name`、`mime-type`、`locale` 属性和 `ready/error/status` 事件。

## React 16.8–19

```bash
pnpm add react @previewdock/react @previewdock/preset-all
```

```tsx
import PreviewDock from '@previewdock/react'

export function FilePreview({ file }) {
  return <PreviewDock engine={engine} source={file} locale="zh-CN" style={{ height: 720 }} />
}
```

## 原生 JS / Web Component

```bash
pnpm add @previewdock/web @previewdock/preset-all
```

```ts
import { mountPreviewDock } from '@previewdock/web'

const viewer = mountPreviewDock(document.querySelector('#viewer'), {
  engine,
  source: file,
  locale: 'zh-CN',
})

await viewer.dispose()
```

Custom Element 使用 `registerPreviewDockElement()` 注册；通过元素的 `engine`、`source` 属性传入对象，通过 `src`、`file-name`、`mime-type` 和 `locale` attribute 传入字符串配置。
