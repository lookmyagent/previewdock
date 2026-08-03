# PreviewDock 接入文档

PreviewDock 是一个本地优先、按需加载的浏览器文件预览运行时。接入时只安装业务需要的能力包；文件命中某种格式后，才加载对应解析器。

## 快速接入

轻量 Vue 预览器只需要核心、Vue 宿主和基础适配器：

```bash
pnpm add vue \
  @previewdock/core \
  @previewdock/vue \
  @previewdock/adapter-text \
  @previewdock/adapter-image \
  @previewdock/adapter-pdf
```

创建 Engine，并通过 Manifest 注册需要的格式：

```ts
import { createViewerEngine, defineAdapterPack } from '@previewdock/core'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { pdfAdapterManifest } from '@previewdock/adapter-pdf/manifest'

const engine = createViewerEngine([
  defineAdapterPack({
    id: 'basic',
    adapters: [textAdapterManifest, imageAdapterManifest, pdfAdapterManifest],
  }),
])
```

Manifest 只包含识别信息和动态加载入口，不会在注册时下载解析器。

## 按场景选择能力

| 使用场景 | 推荐能力 | 典型浏览器增量 |
| --- | --- | --- |
| 附件、审批和文件详情 | `core + vue + basic` | 约 80 KB，压缩前 |
| 知识库和办公文档中心 | 增加 `adapter-openxml` | Office 渲染器约 1.3 MB |
| 网盘和压缩包浏览 | 增加 `adapter-archive` | RAR / 7Z 运行时约 1.1 MB |
| 设计资产、3D、旧版 Office | 按需增加专业能力包 | 大型资源独立、延迟加载 |

不要安装业务不会开放的格式。安装能力包也不等于把全部解析器放进首屏。

## 运行流程

```text
File / Blob / URL
  -> 读取文件名、MIME 和特征字节
  -> 匹配适配器 Manifest
  -> 动态加载命中的适配器
  -> 创建可取消的预览 Session
  -> 关闭时释放 Worker、对象 URL 和临时资源
```

## 部署要求

- 文本、常见图片、PDF 和浏览器原生音视频不需要额外运行时。
- DOCX、XLSX、PPTX 使用现代 Office 适配器并按文件类型加载。
- RAR、7Z 需要部署 Worker 和 WASM 静态资源。
- DOC、PPT 属于可选的旧版 Office 转换路径，可能增加大型 WASM 和字体资源。
- 宿主系统必须限制文件大小、压缩包展开量、内存和执行时间。
- 不执行宏、嵌入脚本或其他活动内容。

详细配置可继续查看左侧的“部署 Worker / WASM”“格式支持矩阵”和“API 参考”。这些都是同一套接入文档的章节，不再设置额外的文档落地页。
