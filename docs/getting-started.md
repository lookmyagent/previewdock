# 快速开始

本页使用官方全格式预设构建 Vue 预览器。PreviewDock 尚处于 Early Preview；npm 正式发布前，可从仓库 workspace 运行示例。

## 安装

正式包发布后：

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

## 创建 Engine

All 模式一次提供七类文件能力，页面只需维护一个 Engine。

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine()
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

- 配置 RAR / 7Z、CAD 和旧版 DOC / PPT：阅读 [Worker 与 WASM 部署](/deployment)。
- 了解七个业务能力边界：阅读[七大格式分类](/categories)。
- 只安装部分格式：阅读[模块化接入](/modular-integration)。
- 查看所有格式的实际状态：阅读[格式支持矩阵](/format-support)。

宿主系统负责文件选择、登录鉴权、存储地址和访问权限；PreviewDock 负责把允许访问的文件呈现在统一预览界面中。
