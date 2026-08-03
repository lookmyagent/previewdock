# PreviewDock 接入文档

PreviewDock 为 Web 系统提供统一的文件预览能力。它将常见文件整理为七大业务分类，并提供 All 模式和分类模式两种接入方式，让文件中心、审批附件、知识库和设计资产系统使用同一套组件完成预览。

## 三步完成接入

1. 根据业务范围选择 All 模式或分类模式；
2. 创建 PreviewDock Engine，并传给 Vue 组件；
3. 把 `File`、`Blob` 或文件 URL 作为预览来源传入组件。

详细代码见[快速开始](/getting-started)。

## 两种接入模式

### All 模式

适合文件中心、网盘以及文件类型不固定的系统。

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

const engine = createAllFormatEngine()
```

### 分类模式

适合只开放部分格式的业务系统。例如仅接入 Office 文档和图片：

```bash
pnpm add vue @previewdock/core @previewdock/vue \
  @previewdock/preset-documents @previewdock/preset-images
```

```ts
import { createViewerEngine } from '@previewdock/core'
import { documentsPack } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'

const engine = createViewerEngine([documentsPack, imagesPack])
```

两种模式使用相同的 Vue 组件。区别仅在于一次接入全部七类，还是只安装业务实际需要的类别。查看[All 模式与分类模式](/modular-integration)。

## 七大格式分类

| 分类 | 代表格式 |
| --- | --- |
| Office 与文档 | DOC/DOCX、XLS/XLSX、PPT/PPTX、PDF、ODF、OFD、RTF、EPUB |
| 文本与数据 | TXT、Markdown、源码、CSV、TSV、JSON、XML、日志 |
| 压缩包 | ZIP、JAR、TAR、GZIP、TGZ、RAR、7Z |
| 图片 | PNG、JPEG、GIF、WebP、SVG、TIFF、TGA、PSD |
| 音视频 | MP3、WAV、OGG、FLAC、MP4、WebM、MOV |
| 图表与流程图 | BPMN、XMind、VSD/VSDX、WMF、EMF |
| 3D 与 CAD | GLB、glTF、OBJ、STL、FBX、DXF、STEP、IGES、3DM、IFC |

完整范围和使用说明见[七大格式分类](/categories)与[格式支持与兼容性](/format-support)。

## 产品特点

- 一套组件覆盖七类文件，减少业务页面重复开发；
- All 与分类模式可以按项目规模选择，后续扩展不需要重写页面；
- 默认优先在浏览器侧完成预览，文件传输策略由宿主系统控制；
- 对加载、失败、不支持和资源释放提供统一体验；
- 复杂格式可按需配置额外运行资源，不影响基础格式接入。

## 上线前需要确认

- 生产环境的文件来源、鉴权与跨域策略；
- 业务允许的格式、大小、数量和预览时长；
- RAR/7Z、工程模型和旧版 Office 所需的额外运行资源；
- 不执行宏、嵌入脚本或其他活动内容；
- 在目标浏览器和真实业务样本上完成兼容性验收。

当前包已具备发布配置，但尚未完成 npm 首次发布；仓库内可通过 workspace 直接使用。
