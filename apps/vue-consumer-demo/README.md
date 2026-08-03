# PreviewDock Vue 消费端 Demo

这是一个刻意保持简洁的独立 Vue 3 + Vite 项目，用来演示另一个 Vue 应用如何接入 PreviewDock。

## 在本仓库运行

```bash
pnpm install
pnpm --filter @previewdock/vue-consumer-demo dev
```

打开终端显示的本地地址。页面会先加载一个内置 Markdown 文件；也可以选择本地文本或图片文件。

## 在另一个 Vue 项目中使用

正式包发布后，在你的 Vue 项目执行：

```bash
pnpm add vue @previewdock/core @previewdock/vue \
  @previewdock/adapter-text @previewdock/adapter-image
```

创建 `src/preview-engine.ts`：

```ts
import { createViewerEngine, defineAdapterPack } from '@previewdock/core'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'

export const previewEngine = createViewerEngine([
  defineAdapterPack({
    id: 'common-files',
    adapters: [textAdapterManifest, imageAdapterManifest],
  }),
])
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

`PreviewDock` 的父容器必须有明确高度。按需增加其它 adapter manifest，即可扩展 PDF、Office、压缩包等预览能力。
