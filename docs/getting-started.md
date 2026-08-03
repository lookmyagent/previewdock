# 快速开始

本页构建一个只包含文本、图片和 PDF 的轻量 Vue 预览器。PreviewDock 尚处于 Early Preview；npm 正式发布前，可从仓库 workspace 运行示例。

## 安装

正式包发布后，基础组合的安装方式为：

```bash
pnpm add vue \
  @previewdock/core \
  @previewdock/vue \
  @previewdock/adapter-text \
  @previewdock/adapter-image \
  @previewdock/adapter-pdf
```

## 创建 Engine

Manifest 只包含匹配信息和动态加载入口，不会立即下载解析器。

```ts
import { createViewerEngine, defineAdapterPack } from '@previewdock/core'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { pdfAdapterManifest } from '@previewdock/adapter-pdf/manifest'

export const engine = createViewerEngine([
  defineAdapterPack({
    id: 'basic',
    adapters: [textAdapterManifest, imageAdapterManifest, pdfAdapterManifest],
  }),
])
```

## 挂载 Vue 组件

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PreviewDock } from '@previewdock/vue'
import '@previewdock/vue/style.css'
import { engine } from './preview-engine'

const file = ref<File>()
</script>

<template>
  <input type="file" @change="file = ($event.target as HTMLInputElement).files?.[0]">
  <PreviewDock v-if="file" :engine="engine" :source="file" :file-name="file.name" />
</template>
```

## 下一步

- 添加 DOCX、XLSX 和 PPTX：阅读[模块化接入](/modular-integration#add-modern-and-legacy-office-separately)。
- 添加压缩包：阅读[Archive 能力组](/modular-integration#add-an-optional-archive-group)。
- 查看所有格式的实际状态：阅读[格式支持矩阵](/format-support)。
