# 七大格式分类

PreviewDock 将所有格式归入七个稳定的产品分类。All 模式一次启用七类；分类模式只安装业务需要的预设。两种模式使用相同的 Engine 和组件 API。

## Office 与文档

`@previewdock/preset-documents`

- 文字文档：DOC、DOCX、DOCM、DOT、DOTX、DOTM、WPS、WPT、RTF、ODT、OTT、FODT
- 电子表格：XLS、XLSX、XLSM、XLSB、XLT、XLTX、XLTM、XLA、XLAM、ET、ETT、ODS、OTS、FODS、Numbers
- 演示文稿：PPT、PPTX、PPTM、POTX、POTM、PPSX、PPSM、DPS、ODP、OTP
- 版式文档：PDF、OFD、Typst
- 邮件与电子书：EML、MSG、MBOX、EPUB、UMD

## 文本与数据

`@previewdock/preset-text-data`

- 文本与标记：TXT、Markdown、HTML、XML、CSV、TSV、日志
- 源代码：JavaScript、TypeScript、Vue、React、Java、Python、PHP、C/C++、C#、Go、Rust、Ruby、Swift、Kotlin、Shell、SQL
- 配置与交换：JSON/JSONC/JSON5、YAML、INI、TOML、Proto、HCL、TeX、Graphviz、HTTP、Diff/Patch
- 笔记本与数据：IPYNB、SQLite、Parquet、Avro、WASM、WebArchive

## 压缩包

`@previewdock/preset-archives`

- ZIP 系列：ZIP、ZIPX、JAR、WAR、EAR、APK、CBZ
- TAR 与流压缩：TAR、GZ/GZIP、TGZ、BZ2、XZ、LZMA、ZST
- 通用容器：7Z、RAR、CBR、CAB、AR、CPIO、ISO、XAR、LHA/LZH

## 图片与设计

`@previewdock/preset-images`

- 常见图片：PNG、JPEG/JFIF、GIF、BMP、WebP、AVIF、ICO、TIFF、TGA、SVG
- 现代编码：HEIC/HEIF、JPEG XL
- 设计与字体：PSD、AI、EPS、WMF、EMF、TTF、OTF、WOFF、WOFF2

## 音视频

`@previewdock/preset-media`

- 音频：MP3/MPEG、WAV、OGG/OGA、Opus、M4A、AAC、FLAC、WebA
- 视频：MP4、WebM、OGV、MOV、M4V、M3U8/HLS
- 音乐结构：MID/MIDI

## 图表与工程

`@previewdock/preset-diagrams`

- 业务图表：BPMN、XMind、VSD/VSDX
- 绘图语言：Excalidraw、Draw.io、Mermaid、PlantUML
- 地理空间：GeoJSON、KML、GPX、SHP
- EDA：OLB、DRA、GDS、OAS/OASIS

## 3D 与 CAD

`@previewdock/preset-3d-cad`

- CAD：DXF、DWG、DWF/DWFX、XPS
- 网格与场景：GLB/glTF、OBJ、STL、PLY、FBX、DAE、3DS、3MF、AMF、KMZ
- 工程模型：STEP/STP、IGES/IGS、IFC、3DM、BREP
- 场景与点云：USD/USDA/USDC/USDZ、PCD、XYZ、VTK/VTP、WRL/VRML、OFF

## 支持等级

- **标准预览**：提供对应格式的页面、表格、媒体或交互模型视图。
- **结构预览**：展示文件中的真实元数据、文本、目录、图层、实体或字节结构，适合快速检查，不等同于桌面专业软件。

部署资源见[运行环境与部署](/deployment)，各框架示例见[Vue / React / Web 接入](/frameworks)。
