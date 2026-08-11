# PreviewDock

> 浏览器端全格式文件预览组件：一套运行时覆盖 Office、文本与数据、压缩包、图片、音视频、图表工程和 3D/CAD。

[![CI](https://github.com/lookmyagent/previewdock/actions/workflows/ci.yml/badge.svg)](https://github.com/lookmyagent/previewdock/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@previewdock/preset-all?label=npm)](https://www.npmjs.com/package/@previewdock/preset-all)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

[在线体验](https://playground.yigeren.me/playground/) · [接入文档](https://playground.yigeren.me/docs/) · [格式矩阵](https://playground.yigeren.me/docs/format-support) · [问题反馈](https://github.com/lookmyagent/previewdock/issues)

PreviewDock 是面向文件中心、知识库、审批附件、网盘和专业资料系统的本地优先文件预览基础设施。文件默认留在浏览器内处理，解析器按格式动态加载；产品既可以一键启用全部格式，也可以只安装业务需要的分类。

![PreviewDock 文件预览实验室](docs/playground-screenshot.png)

## 为什么选择 PreviewDock

- **纯浏览器与可自托管**：文件无需上传到第三方预览服务，Worker、WASM 和字体资源可随应用部署。
- **七大格式类别**：统一管理文档、数据、归档、设计、媒体、工程图和 3D/CAD 文件。
- **真正按需加载**：只有命中对应格式时才加载 Office、CAD、压缩或媒体解析器。
- **多框架同一 API**：支持 Vue 3、Vue 2.6/2.7、React 16.8–19、原生 JS 和 Web Component。
- **两种交付模式**：`preset-all` 适合通用文件中心，分类 preset 适合强调体积和边界的业务系统。
- **面向生产环境**：统一加载、错误、取消和释放生命周期，支持国际化、全屏、跨域隔离与大文件策略。

## 三分钟接入

以 Vue 3 和全格式模式为例：

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

```ts
// preview-engine.ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine({
  assetBaseUrl: '/previewdock/',
})
```

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

重型格式需要部署与 npm 包版本匹配的运行资源：

```bash
pnpm add -D @previewdock/assets
pnpm exec previewdock-copy-assets ./public/previewdock
```

Vite 项目也可以使用 `@previewdock/vite-plugin` 自动复制资源。完整说明见[快速开始](https://playground.yigeren.me/docs/getting-started)和[生产部署](https://playground.yigeren.me/docs/deployment)。

## All 模式与分类模式

```bash
# All：一次启用全部七类，运行时仍按文件格式懒加载
pnpm add @previewdock/preset-all

# 分类：只安装文档和图片能力
pnpm add @previewdock/core @previewdock/preset-documents @previewdock/preset-images
```

```ts
import { createViewerEngine } from '@previewdock/core'
import { documentsPack } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'

const engine = createViewerEngine([documentsPack, imagesPack])
```

两种模式使用相同的 Engine 和 UI 组件。区别是安装全部类别，还是从依赖层面只保留选中的类别。

## 框架支持

| 使用场景 | 包 | 兼容范围 |
| --- | --- | --- |
| Vue 3 | `@previewdock/vue` | Vue 3.4+ |
| Vue 2 | `@previewdock/vue2` | Vue 2.6.14 / 2.7 |
| React | `@previewdock/react` | React 16.8 / 17 / 18 / 19 |
| 原生 Web | `@previewdock/web` | JS API、Custom Element、iframe 宿主 |
| Vite 资源部署 | `@previewdock/vite-plugin` | Vite 5–7 |

所有接入层共享 `engine`、`source`、`fileName`、`mimeType`、`locale` 和 `messages` 参数，以及 `ready`、`error`、`status` 生命周期。

## 七大格式类别

| 类别 | 代表格式 |
| --- | --- |
| Office 与文档 | DOC/DOCX、XLS/XLSX/XLSB、PPT/PPTX、WPS/ET/DPS、PDF/OFD、ODF、RTF、邮件、电子书 |
| 文本与数据 | TXT、Markdown、源码与配置、CSV/TSV、JSON/XML、IPYNB、SQLite、Parquet、Avro、WASM |
| 压缩包 | ZIP/ZIPX、RAR、7Z、TAR、GZIP、BZ2、XZ、ZST、CAB、ISO、APK、漫画容器 |
| 图片与设计 | PNG、JPEG、WebP、SVG、TIFF、TGA、PSD、AVIF、HEIC/HEIF、JXL、AI/EPS、字体 |
| 音视频 | MP3、WAV、FLAC、MP4、WebM、MOV、MPEG、HLS、MIDI |
| 图表与工程 | BPMN、XMind、VSD/VSDX、Draw.io、Excalidraw、Mermaid、GeoJSON、KML、GPX、EDA |
| 3D 与 CAD | GLB/glTF、OBJ、STL、FBX、3MF、DXF/DWG、STEP、IGES、IFC、3DM、USD、点云 |

不同格式提供标准视觉预览或结构/快速预览，具体等级以[格式支持矩阵](https://playground.yigeren.me/docs/format-support)为准。PreviewDock 不会把“可下载”冒充“已支持预览”。

## 核心包

| 包 | 用途 |
| --- | --- |
| `@previewdock/core` | 文件识别、适配器注册、生命周期和取消控制 |
| `@previewdock/preset-all` | 官方全格式预设 |
| `@previewdock/preset-*` | 七类模块化预设 |
| `@previewdock/vue` / `vue2` / `react` / `web` | 多框架 UI 接入层 |
| `@previewdock/assets` | Worker、WASM、字体资源清单与复制 CLI |
| `@previewdock/vite-plugin` | Vite 自动复制运行资源 |
| `@previewdock/adapter-*` | 可独立组合的格式适配器 |

## 本地开发

```bash
pnpm install
pnpm dev             # 门户
pnpm dev:docs        # 文档
pnpm dev:playground  # 文件预览实验室

pnpm test
pnpm typecheck
pnpm build
pnpm release:npm:dry-run
```

## 安全边界

- 不执行文档宏、嵌入脚本或活动内容；
- 对 SVG、HTML、Markdown 和邮件内容进行净化；
- 对压缩包设置文件大小、展开体积、条目数和处理时限；
- 文件 URL 的鉴权、授权和跨域策略由接入系统负责；
- 专业格式上线前应使用真实业务样本完成浏览器兼容性验收。

## License

[Apache-2.0](./LICENSE)。部分可选格式依赖具有独立许可证，详见各包清单与 NOTICE。

欢迎通过 [Issues](https://github.com/lookmyagent/previewdock/issues) 反馈问题。贡献解析器前请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [SECURITY.md](SECURITY.md)。
