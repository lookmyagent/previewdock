# 七大格式分类

PreviewDock 按业务场景提供七个官方分类预设。接入方只需要确认产品要开放哪些文件类型，再选择 All 模式或对应分类包。

| 分类 | 官方预设 | 当前覆盖的代表格式 |
| --- | --- | --- |
| Office 与文档 | `@previewdock/preset-documents` | PDF、DOC/DOCX、XLS/XLSX、PPT/PPTX、WPS、ODF、OFD、RTF、EPUB、EML |
| 文本与数据 | `@previewdock/preset-text-data` | TXT、Markdown、日志、源码、CSV、TSV、JSON、XML |
| 压缩包 | `@previewdock/preset-archives` | ZIP、JAR、TAR、GZIP、TGZ、RAR、7Z |
| 图片 | `@previewdock/preset-images` | PNG、JPEG、GIF、WebP、BMP、ICO、SVG、TIFF、TGA、PSD |
| 音视频 | `@previewdock/preset-media` | MP3、WAV、OGG、M4A、AAC、FLAC、MP4、WebM、MOV |
| 图表与流程图 | `@previewdock/preset-diagrams` | BPMN、XMind、VSD、VSDX、WMF、EMF |
| 3D 与 CAD | `@previewdock/preset-3d-cad` | GLB、glTF、OBJ、STL、FBX、DXF、STEP、IGES、3DM、IFC |

## 为什么按业务分类

用户通常关心的是“能否预览文档、图片或工程模型”，而不是格式背后的技术实现。七个分类统一了产品说明、安装方式和后续扩展路径。

无论选择哪个分类，使用方式都保持一致：

1. 宿主系统提供 `File`、`Blob` 或可访问的文件地址；
2. PreviewDock 自动选择已安装的预览能力；
3. 页面使用统一组件呈现加载、成功、失败和不支持状态；
4. 不需要的类别可以不安装，后续也能按业务增长继续增加。

## 运行时要求

部分复杂格式需要额外运行资源或宿主能力：

- RAR、7Z 需要 Archive Worker/WASM；
- STEP、IGES、3DM、IFC 需要相应模型 WASM；
- 旧版 DOC、PPT、VSD、WMF、EMF 需要可选转换器；
- 音视频编码支持取决于浏览器，其他编码需要业务侧转码。

具体配置见[部署 Worker / WASM](/deployment)，支持等级见[格式支持矩阵](/format-support)。
