# 组件使用

本页只介绍业务系统接入 PreviewDock 所需的公开用法。

## 创建预览能力

All 模式：

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine()
```

分类模式：

```ts
import { createViewerEngine } from '@previewdock/core'
import { documentsPack } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'

export const engine = createViewerEngine([documentsPack, imagesPack])
```

## 在 Vue 页面使用

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
  <div class="preview-area">
    <PreviewDock
      v-if="file"
      :engine="engine"
      :source="file"
      :file-name="file.name"
      locale="zh-CN"
      :watermark="{ text: '仅供内部使用', opacity: 0.14, rotate: -24 }"
    />
  </div>
</template>

<style scoped>
.preview-area { height: 640px; }
</style>
```

## 常用属性

| 属性 | 用途 |
| --- | --- |
| `engine` | All 或分类模式创建的预览能力 |
| `source` | `File`、`Blob`、二进制数据或授权 URL |
| `fileName` | 用于展示文件名和确认文件类型 |
| `locale` | `zh-CN` 或 `en` |
| `showToolbar` | 是否显示预览工具栏 |
| `watermark` | 水印文字，或包含样式参数的水印配置；传入 `false` 关闭 |

`watermark` 可以直接传字符串，也可以传入以下配置：

```ts
const watermark = {
  text: '张三 · 仅供内部使用',
  color: '#64748b',
  opacity: 0.14,
  fontSize: 14,
  rotate: -24,
  gapX: 220,
  gapY: 140,
}
```

水印覆盖所有预览格式，但不会阻止滚动、缩放或 3D 操作，也不会修改原文件。它是界面提示能力，不应替代鉴权、下载控制和审计。

页面可以监听 `status`、`ready` 和 `error` 事件，展示加载状态、成功结果和友好错误提示。宿主系统继续负责文件选择、权限和下载策略。
