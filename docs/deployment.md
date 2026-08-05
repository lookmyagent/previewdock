# 运行环境与部署

PreviewDock 的基础预览能力可以直接随前端应用部署。压缩包、工程模型和旧版 Office 等复杂格式需要额外运行资源，建议由宿主系统统一托管、缓存和授权。

## 基础环境

- 使用 HTTPS 生产域名；
- 文件地址允许前端访问，并正确配置鉴权和跨域；
- 静态资源设置版本化缓存，应用入口保留及时更新能力；
- 对文件大小、预览时长、并发数和内存使用设置业务限制；
- 使用真实业务样本验证桌面端与移动端目标浏览器。

## 复杂格式资源

推荐自动复制与 npm 包版本匹配的运行资源：

```bash
pnpm add @previewdock/assets
pnpm exec previewdock-copy-assets ./public/previewdock
```

Vite 项目可以安装 `@previewdock/vite-plugin`，在配置中加入 `previewDockAssets()`。随后只需要提供统一路径：

```ts
const engine = createAllFormatEngine({ assetBaseUrl: '/previewdock/' })
```

All 模式可以统一传入运行配置；分类模式也可分别配置对应 Pack：

```ts
const archives = createArchivesPack({
  archive: { workerUrl: '/previewdock/archive/worker.js' },
})

const models = createThreeDCadPack({
  model: { occtWasmUrl: '/previewdock/models/engineering.wasm' },
})

const documents = createDocumentsPack({
  legacyOffice: { converter },
})
```

资源地址、文件名和 CDN 结构由宿主系统决定。生产环境应固定版本，避免运行资源与前端包不匹配。

## 压缩包大文件模式

PreviewDock 默认提供两个浏览器档位：

| 模式 | 文件范围 | 适用格式 | 行为 |
| --- | --- | --- | --- |
| 普通模式 | 最大 100 MB | ZIP、JAR、TAR、GZIP、TGZ、RAR、7Z | 浏览器内查看目录和内容 |
| 大文件模式 | 100 MB–1 GB | ZIP、JAR | 只建立目录索引，点击文件后再读取并解压该条目 |

本地文件不需要额外配置。远程 ZIP/JAR 需要文件服务器：

- 支持 `Range: bytes=...` 请求并返回 `206 Partial Content`；
- 提供正确的 `Content-Length`、`Content-Range` 和 `Accept-Ranges: bytes`；
- 在跨域场景允许应用域名访问文件；
- 不对 ZIP/JAR 响应做动态内容压缩，保证字节偏移稳定。

RAR、7Z、TGZ 等固实或顺序压缩格式超过 100 MB 时，应使用服务端协同方案。

## 跨源隔离

部分大型文档转换能力需要页面启用：

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

启用前需要验证 iframe、单点登录、支付和第三方脚本是否兼容。跨域资源还需要正确配置 CORS 与资源策略响应头。

## 安全边界

- 不执行宏、嵌入脚本或活动内容；
- 对可包含活动内容的文本和图形进行安全处理；
- 对压缩包限制条目数、展开大小和嵌套深度；
- 远程转换必须由宿主系统明确启用，并向用户说明文件处理方式；
- 按项目使用情况审查运行资源与字体许可。

旧版文档的产品行为见[旧版 Office 使用说明](/legacy-office)，格式状态见[格式支持与兼容性](/format-support)。
