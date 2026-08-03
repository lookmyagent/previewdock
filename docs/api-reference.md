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
    <PreviewDock v-if="file" :engine="engine" :source="file" :file-name="file.name" locale="zh-CN" />
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

页面可以监听 `status`、`ready` 和 `error` 事件，展示加载状态、成功结果和友好错误提示。宿主系统继续负责文件选择、权限和下载策略。
