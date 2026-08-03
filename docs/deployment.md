# Worker 与 WASM 部署

基础文本、图片、PDF 和浏览器原生媒体不需要额外运行时。RAR、7Z、旧版 Office / WPS 与 STEP / IGES / BREP 需要单独部署 Worker、WASM 或字体资源。

## Archive

RAR/7Z 使用 `libarchive.js` Worker 和 `libarchive.wasm`。将资源复制到应用静态目录或 CDN，并通过 Manifest 传入地址：

```ts
createArchiveAdapterManifest({
  workerUrl: '/previewdock/libarchive/worker-bundle.js',
})
```

严格 CSP 环境需要允许对应 Worker 来源。使用运行时内存修补时还需要 `worker-src blob:`。

## Legacy Office

旧版 XLS 由 SheetJS 在浏览器中解析。DOC/PPT 的高成本转换是独立 opt-in 能力，当前 ZetaOffice WASM 运行时约 53 MB，并可能需要中文字体资源。

生产环境应：

- 自行托管并固定 WASM 资源版本；
- 配置缓存与完整性策略；
- 设置文件大小、内存和执行时间限制；
- 审查 ZetaOffice、LibreOffice 与字体许可；
- 对不支持的浏览器提供明确降级信息。

完整配置见 [Legacy Office 集成](/legacy-office)。

## CAD / 工程模型

STEP、IGES 与 BREP 使用 `occt-import-js.wasm`。将 WASM 文件部署到稳定的同源静态地址，并在 Manifest 中配置：

```ts
createModelAdapterManifest({
  occtWasmUrl: '/previewdock/occt/occt-import-js.wasm',
})
```

建议为 WASM 设置长期缓存，并在网关层限制工程文件大小和转换时长。OFF 与 DXF 不需要该 WASM。

3DM 使用 `rhino3dm.js` 与 `rhino3dm.wasm`。将两者部署在同一个同源目录，并通过 `rhinoLibraryPath` 指向该目录。

IFC 使用 `web-ifc.wasm`。将其部署到同源目录，并通过 `ifcWasmPath` 指向该目录。

## 安全边界

- 不执行宏、嵌入脚本和活动内容；
- 对 SVG、HTML 和 Markdown 做内容清洗；
- 为压缩包设置条目数、展开大小和嵌套深度限制；
- 远程转换只能由宿主系统明确启用并提示用户。
