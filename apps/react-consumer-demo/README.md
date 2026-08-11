# PreviewDock React Demo

这个独立 React + Vite 项目使用发布包入口验证 React host。

```bash
pnpm --filter @previewdock/react-consumer-demo dev
```

外部 React 项目接入：

```bash
pnpm add react react-dom @previewdock/react @previewdock/preset-all @previewdock/vite-plugin
```

```tsx
import { PreviewDock } from '@previewdock/react'
import '@previewdock/web/style.css'
import { createAllFormatEngine } from '@previewdock/preset-all'

const engine = createAllFormatEngine({ assetBaseUrl: '/previewdock/' })

export function FilePreview({ file }: { file: File | null }) {
  return <div style={{ height: 600 }}>
    <PreviewDock engine={engine} source={file} fileName={file?.name} locale="zh-CN" />
  </div>
}
```

在 `vite.config.ts` 加入 `previewDockAssets()`，将 Worker/WASM 资源复制到 `public/previewdock`。
所有非 Vue 3 宿主都应导入 `@previewdock/web/style.css`，以使用与 Vue 3 相同的预览器样式。
旧版 DOC/PPT 还需安装 `@previewdock/converter-zetaoffice` 与 `zetajs`，并传入 `legacyOffice.converter`；本 demo 已包含该配置。
