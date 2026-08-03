# kkFileView 样例目录兼容性审计

审计目录：`/Users/du/Downloads/kkfileview`

最近验证：2026-08-03

目录包含 203 个文件、106 种扩展名。这里的“支持”表示已有对应
适配器，不表示每个损坏文件或格式变体都能成功渲染。

## 当前支持（92 种）

| 类型 | 扩展名 |
| --- | --- |
| 文本与代码 | `txt`, `md`, `csv`, `tsv`, `json`, `xml`, `js`, `ts`, `css`, `java`, `php`, `py` |
| 常见图片 | `png`, `jpg`, `jpeg`, `gif`, `webp`, `bmp`, `ico`, `jfif`, `svg` |
| 专业图片 | `tif`, `tiff`, `tga`, `psd` |
| PDF | `pdf` |
| 浏览器原生音视频 | `mp3`, `wav`, `ogg`, `mp4`, `webm`, `mov` |
| 压缩包 | `zip`, `jar`, `tar`, `gzip`, `rar`, `7z` |
| OpenXML Office | `docx`, `dotm`, `dotx`, `xlsx`, `xlsm`, `xltm`, `xlam`, `pptx` |
| 旧版 Excel | `xls`, `xlt`, `xla` |
| 旧版 Office / WPS | `doc`, `dot`, `ppt`, `wps`, `wpt`, `dps`, `et`, `ett` |
| OpenDocument / 专用文档 | `odt`, `ods`, `ots`, `odp`, `otp`, `ott`, `fodt`, `fods`, `ofd`, `rtf` |
| 结构化文档 | `bpmn`, `eml`, `epub`, `xmind`, `vsd`, `vsdx` |
| Windows 图元 | `wmf`, `emf` |
| 3D 模型 | `gltf`, `glb`, `obj`, `stl`, `ply`, `fbx`, `dae`, `3ds`, `3mf`, `3dm`, `wrl` |
| CAD / 工程模型 | `off`, `dxf`, `ifc`, `brep`, `step`, `iges` |

## 当前不支持（14 种）

| 原因 | 扩展名 |
| --- | --- |
| CAD / BIM，需要许可兼容或格式专用内核 | `bim`, `dwg`, `fcstd` |
| 浏览器不能稳定原生播放，需要转码 | `3gp`, `avi`, `flv`, `mkv`, `mpeg`, `mpg`, `rm`, `rmvb`, `swf`, `wmv` |
| 非标准 / 待确认格式 | `six` |

## 真实文件验证

- 成功：`Panda.glb`、`xiaofangche.gltf`、`Characters_Lis.obj`、
  `product.stl`、`generated-ply.ply`、`teaport.fbx`。
- 成功：`ZZ.tif`（1870 × 3665）、`generated-tga.tga`（640 × 360）、
  `07_Dark_Dashboard.psd`（1920 × 2004，4 个顶层图层）。
- 成功：`费用预算查询(月度)_20240328190528.xls`，读取 1 个工作表并在
  只读网格中显示；多工作表文件会生成可切换标签。
- 成功：BPMN SVG 流程图（12 节点 / 11 连线）、XMind 思维导图（506
  节点）、VSDX 图形页、2 页 OFD、ODT、EPUB、EML 与 RTF 格式化视图。
- 成功：WPS 文字转换为 DOCX、ET 读取为工作簿、DPS / VSD / WMF / EMF
  通过 ZetaOffice Draw/Impress 转为 PDF。
- 成功：`all.dxf`、`sample.off`、`游戏手柄.STEP`、`ceshi001.iges` 均在
  浏览器中生成可交互画布；STEP / IGES 使用按需加载的 OpenCascade WASM。
- 成功：`uploads_files_93987_Motore_Radiale_14_Cilindri.3dm` 通过
  Rhino3dm / openNURBS WASM 渲染为带材质的交互式模型。
- 成功：`Duplex.ifc` 通过 Web-IFC WASM 解析几何并渲染为带构件颜色的
  交互式建筑模型。
- `left-corners.psd` 的文件头声明为 0-bit channel，系统 `file` 和 PSD
  解析器均判定为异常文件，因此不计作正常 PSD 兼容失败。
- `generated-3ds.3ds`、`generated-3mf.3mf` 是纯文本占位文件，不是对应
  格式；`generated-dae.dae` 和 `generated-wrl.wrl` 没有可见几何体，
  因而不能用于验证渲染正确性。
- `generated-xlt.xlt` 和 `generated-xla.xla` 也是纯文本占位文件，不能
  作为旧版 Excel 模板或加载项的有效测试样例。
- 部分样例扩展名与真实内容不一致；专业图片适配器会先尝试浏览器的
  内容解码，以兼容“TIFF 后缀但实际为 JPEG”等情况。

## 支持等级说明

- OpenXML Office 当前侧重浏览器端可读性，不执行宏，也不保证与桌面
  Office 像素级一致。
- MOV、Ogg 等音视频是否可播放还取决于文件内部编码和用户浏览器。
- 3D 模型如果依赖未嵌入的外部纹理或二进制文件，单独选择主文件时可能
  缺失材质；GLB 和数据内嵌的 glTF 最稳定。
