# PreviewDock Vue 消费端 Demo

这是一个刻意保持简洁的独立 Vue 3 + Vite 项目，用来演示另一个 Vue 应用如何接入 PreviewDock。

## 在本仓库运行

```bash
pnpm install
pnpm --filter @previewdock/vue-consumer-demo dev
```

打开终端显示的本地地址。文件选择器不限制格式；页面会先加载一个内置 Markdown 文件。当前 demo 使用官方全格式预设，复杂格式的解析器仍按需加载。

## 在另一个 Vue 项目中使用

正式包发布后，在你的 Vue 项目执行：

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all @previewdock/vite-plugin
```

创建 `src/preview-engine.ts`：

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const previewEngine = createAllFormatEngine({
  assetBaseUrl: '/previewdock/',
})
```

然后在任意 Vue 页面使用组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PreviewDock } from '@previewdock/vue'
import '@previewdock/vue/style.css'
import { previewEngine } from './preview-engine'

const file = ref<File | null>(null)
</script>

<template>
  <input type="file" @change="file = ($event.target as HTMLInputElement).files?.[0] ?? null">
  <div style="height: 600px">
    <PreviewDock :engine="previewEngine" :source="file" :file-name="file?.name" locale="zh-CN" />
  </div>
</template>
```

`PreviewDock` 的父容器必须有明确高度。RAR / 7Z、CAD 和旧版 DOC / PPT 还需要配置对应 Worker、WASM 或转换器；只想安装部分格式时，可以改用独立 adapter manifest。

本 demo 另外配置了 ZetaOffice WASM，以支持旧版 DOC/PPT；首次打开会下载较大的浏览器内 Office 运行时。

Vite 项目还需要复制官方 Worker/WASM 资源：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { previewDockAssets } from '@previewdock/vite-plugin'

export default defineConfig({
  plugins: [previewDockAssets()],
})
```
