# 模块化接入与体积

PreviewDock 同时提供两条接入路径：多数系统使用 `@previewdock/preset-all` 一次注册全部格式；对依赖体积或许可有严格要求的系统，按本页选择独立适配器。两种路径都按格式延迟加载解析器。

## 官方全格式预设

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine()
```

这会安装所有官方适配器依赖，但不会把所有解析器打进首屏。RAR / 7Z、CAD 和旧版 DOC / PPT 仍需传入运行时资源配置，详见[部署 Worker / WASM](/deployment)。

## 能力分组

以下数据来自当前工作区。安装体积指 `node_modules` 中的未压缩依赖，浏览器资源指首次使用该能力时下载的近似未压缩代码；去重、压缩和缓存会影响最终结果。

| 分组 | 安装包 | 格式 | 近似成本 |
| --- | --- | --- | --- |
| 宿主 | `core`、`vue` | 框架宿主与文件检测 | dist 约 68 KB，另加应用的 Vue peer |
| 基础 | `adapter-text`、`adapter-image`、`adapter-pdf` | 文本、代码、Markdown、CSV/TSV、JSON/XML、常见图片、SVG、PDF | 浏览器代码约 80 KB |
| 现代 Office | `adapter-openxml` | DOCX、DOCM、DOTX、XLSX、XLSM、PPTX 等 | 每个渲染器约 1.3 MB |
| 旧版 Office | `adapter-legacy-office`，DOC/PPT 另加 `converter-zetaoffice` | DOC、XLS/XLT/XLA、PPT | SheetJS 安装约 7.8 MB；DOC/PPT WASM 约 53 MB |
| 归档 | `adapter-archive` | ZIP、JAR、TAR、GZIP、TGZ、RAR、7Z | Worker 与 WASM 约 1.1 MB |
| 媒体 | `adapter-media` | 浏览器原生音视频 | 无额外解码器；不支持的编码需转码服务 |
| 高级图片 | `adapter-advanced-image` | TIFF、TGA、PSD | `ag-psd` 约 18 MB，另有共享 Three.js |
| 3D | `adapter-3d` | glTF、GLB、OBJ、STL、PLY、FBX、DAE、3DS、3MF、WRL | 懒加载代码约 1.2 MB |

Playground 中的 16 MB 中文字体只是旧版 DOC/PPT 演示资源，不属于 `core`、`vue` 或普通适配器包。

## 轻量基础预览

```bash
pnpm add vue \
  @previewdock/core \
  @previewdock/vue \
  @previewdock/adapter-text \
  @previewdock/adapter-image \
  @previewdock/adapter-pdf
```

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

宿主随后把 engine 传给 Vue 组件；增加能力包不会改变组件接入方式：

```vue
<PreviewDock :engine="engine" :source="file" :file-name="file.name" />
```

## 增加归档能力

```bash
pnpm add @previewdock/adapter-archive
```

```ts
const archivePack = defineAdapterPack({
  id: 'archive',
  adapters: [createArchiveAdapterManifest({
    workerUrl: '/ufv/libarchive/worker-bundle.js',
    previewEntry: openEmbeddedFile,
  })],
})
```

RAR/7Z 的 Worker 和 `libarchive.wasm` 应复制到应用静态目录或 CDN。严格 CSP 还需要允许 `worker-src blob:`。
`previewEntry` 可选；配置后，宿主已经安装的格式也能继续预览归档内文件。

## 现代与旧版 Office 分开接入

现代 Office 不需要 LibreOffice WASM：

```ts
const modernOfficePack = defineAdapterPack({
  id: 'modern-office',
  adapters: [openXmlAdapterManifest],
})
```

旧版 XLS 可直接解析；DOC 和 PPT 需要单独的转换器，因此是可选路径：

```ts
const legacyOfficePack = defineAdapterPack({
  id: 'legacy-office',
  adapters: [createLegacyOfficeAdapterManifest({ converter })],
})
```

## 手工组合完整预览器

不使用官方预设时，也可以手工组合选中的能力包：

```ts
const engine = createViewerEngine([
  basicPack, modernOfficePack, legacyOfficePack, archivePack,
  mediaPack, advancedImagePack, modelPack,
])
```

两条路径使用相同 Engine 和 Vue 组件。预设优化接入效率，手工组合优化安装依赖；宿主系统始终负责存储、网络、安全、浏览器兼容性和资源预算。
