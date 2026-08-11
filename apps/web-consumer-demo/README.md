# PreviewDock Web Demo

这个独立 Vite 项目不依赖框架，使用 `@previewdock/web` 的 DOM host。

```bash
pnpm --filter @previewdock/web-consumer-demo dev
```

外部原生 Web 项目接入：

```bash
pnpm add @previewdock/web @previewdock/preset-all @previewdock/vite-plugin
```

```ts
import { mountPreviewDock } from '@previewdock/web'
import '@previewdock/web/style.css'
import { createAllFormatEngine } from '@previewdock/preset-all'

const engine = createAllFormatEngine({ assetBaseUrl: '/previewdock/' })
mountPreviewDock(document.querySelector('#preview')!, {
  engine,
  source: file,
  fileName: file.name,
  locale: 'zh-CN',
})
```

容器需要明确高度；在 Vite 配置中加入 `previewDockAssets()` 来复制运行时资源。
`@previewdock/web/style.css` 是 Vue 3、React、原生 Web 与 Vue 2 共用的预览器样式入口。
旧版 DOC/PPT 还需安装 `@previewdock/converter-zetaoffice` 与 `zetajs`，并传入 `legacyOffice.converter`；本 demo 已包含该配置。
