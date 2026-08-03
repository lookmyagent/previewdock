# 旧版 Office 浏览器接入

旧版 Office 适配器提供两条处理路径：旧版 Excel 在浏览器内读取，DOC/PPT 通过可选的 LibreOffice WebAssembly 转换。

## XLS、XLT 和 XLA

二进制 Excel 工作簿由 SheetJS 直接解析，并使用与其他表格适配器相同的受限只读工作簿界面渲染。只有打开匹配文件时才会导入 SheetJS。

浏览器对每次预览限制为：

- 输入文件不超过 30 MB；
- 不超过 20 个工作表；
- 每个工作表最多读取 500 行；
- 每个工作表最多读取 100 列。

这些限制用于保护界面，避免恶意文件或意外的超大范围占用资源。不会执行宏。

## DOC 和 PPT

DOC 和 PPT 需要完整的文档布局引擎才能获得有用的还原度。可选的 `converter-zetaoffice` 包使用 LibreOffice WebAssembly，并且只在打开 DOC/PPT 后动态加载：

```ts
import { createLegacyOfficeAdapter } from '@previewdock/adapter-legacy-office'

const adapter = createLegacyOfficeAdapter({
  converter: {
    id: 'zetaoffice-wasm',
    async convert(request) {
      const { createZetaOfficeConverter } = await import('@previewdock/converter-zetaoffice')
      const { default: zetaJsUrl } = await import('zetajs/zeta.js?url')
      return createZetaOfficeConverter({
        wasmPackage: 'https://static.example.com/zetaoffice/',
        zetaJsUrl,
      }).convert(request)
    },
  },
})
```

转换完成后，适配器创建本地对象 URL，并在现有 PDF 预览区域中展示结果。原始文件和生成的 PDF 默认不会离开浏览器。

## ZetaOffice 部署要求

ZetaOffice 不是普通的纯 JavaScript 依赖。转换器默认使用官方 `free` beta CDN，让 Playground 无需复制大型运行时即可工作。生产环境建议审查服务条款并自行托管：

- `soffice.js`
- `soffice.wasm`
- `soffice.data`
- `soffice.data.js.metadata`

生产环境应固定并缓存 WASM 资源版本：

```bash
VITE_ZETAOFFICE_ASSET_URL=https://static.example.com/zetaoffice/ pnpm dev
```

文档页面必须启用跨源隔离：

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

如果资源托管在其他源，还需要提供兼容的 CORS 和 `Cross-Origin-Resource-Policy` 响应头。

上线前请验证：

- COOP / COEP 对 iframe、SSO、支付和第三方集成的影响；
- WASM 资源的自托管、版本固定和不可变缓存；
- 转换进度、内存限制、输入限制和 Worker 生命周期；
- LibreOffice、ZetaOffice 及字体资源的许可证；
- 宏、链接和联网文档加载均被禁用。

转换器以只读模式打开文档，不执行宏，不更新链接文档，完成后清理临时文件，并拒绝超过适配器限制的输入。
