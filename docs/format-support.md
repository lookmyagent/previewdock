# 格式支持矩阵

支持表示能够呈现有用内容，不只是识别文件名。

| 家族 | 当前状态 | 实现方向 |
| --- | --- | --- |
| 文本、源码、CSV、TSV、JSON、XML、Markdown | 原型 | 原始文本与经过清洗的 Markdown 渲染 / 源码模式 |
| PNG、JPEG、GIF、WebP、BMP、ICO、JFIF、SVG | 原型 | 浏览器原生图片解码 |
| TIFF、TGA、PSD | 实验性 | Canvas 合成、尺寸、旋转、镜像、缩放和 PSD 图层信息 |
| PDF | 原型 | 浏览器原生 PDF 查看器，PDF.js 控件仍在规划中 |
| OFD、RTF | 实验性 | OFD 页面与文字层；RTF 清洗后格式化阅读 |
| DOCX、XLSX、PPTX 与 OpenXML 模板 | 原型 | `docx-preview` 分页、XLSX 表格和 PPTX 渲染器，并提供简化回退 |
| XLS、XLT、XLA | 实验性 | SheetJS BIFF 解析、工作表切换和受限只读表格 |
| DOC、DOT、PPT、WPS、WPT、DPS | 实验性 | 按需加载 ZetaOffice / LibreOffice WASM，文档转 DOCX，演示转 PDF |
| ET、ETT | 实验性 | SheetJS 只读工作簿、工作表切换与受限表格 |
| ODT、ODS、OTS、ODP、OTP、OTT、FODT、FODS | 实验性 | ZIP / XML 结构化文档、表格和幻灯片视图 |
| EPUB、EML、XMind、BPMN | 实验性 | 章节阅读器、邮件视图、思维导图树与 BPMN-DI SVG 流程图 |
| ZIP、TAR、GZIP、JAR | 原型 | 层级浏览、嵌套文件预览、下载和资源预算 |
| 7z、RAR | 研究中 | 可选归档 WASM 能力包 |
| MP3、WAV、MP4、WebM、Ogg | 原型 | 浏览器原生播放，具体编码取决于浏览器和操作系统 |
| AVI、WMV、RMVB、FLV 及不支持的编码 | 研究中 | 可选 FFmpeg WASM 转码；本轮未纳入上线包 |
| glTF、GLB、OBJ、STL、PLY、FBX、DAE、3DS、3MF、WRL | 实验性 | 按需加载 Three.js，提供旋转、缩放、重置、动画和线框控制 |
| OFF、STEP/STP、IGES/IGS、BREP | 实验性 | OFF 网格解析与按需加载 OpenCascade WASM，提供交互式 3D 视图 |
| DXF | 实验性 | 2D 实体解析为可缩放、旋转的线框视图 |
| 3DM | 实验性 | Rhino3dm / openNURBS WASM 与交互式 3D 视图 |
| IFC | 实验性 | Web-IFC WASM 几何解析与带构件颜色的交互式 3D 视图 |
| DWG、FCSTD、BIM | 研究中 | 需要许可兼容或格式专用的转换 / WASM 内核 |
| VSD、WMF、EMF | 实验性 | ZetaOffice Draw 按需转 PDF |
| VSDX | 实验性 | 页面 XML、图形与文字的结构化 SVG 视图 |
| SWF | 不支持 | 不执行 Flash 活动内容；后续只考虑安全的静态/视频转码 |

## 状态说明

- **原型**：仓库已实现，但还没有完成生产级加固。
- **实验性**：已有代表性样例验证，异常文件、大文件和特殊编码仍可能失败。
- **规划中**：已知可行的浏览器实现路径。
- **研究中**：仍需评估可行性、许可、还原度或资源消耗。

任何适配器都不会执行宏、嵌入脚本或其他活动内容。OpenXML 的还原度取决于格式：
DOCX 和 PPTX 通常比文本提取保留更多布局，XLSX 当前优先保证数据可读和工作表操作，
不承诺完整复刻所有样式、图表、宏和公式行为。
