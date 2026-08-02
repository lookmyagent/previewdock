# PreviewDock — 会话交接说明

> 更新时间：2026-08-02
>
> 目标：将项目作为独立的、可嵌入其他 Vue/Web 系统的多格式文件预览组件继续开发。

## 1. 当前项目位置

当前项目仍位于：

```text
/Users/du/IdeaProjects/cugpt0709/universal-file-viewer
```

当前目录名仍是旧名；如果要迁移到独立目录，建议直接从 GitHub 克隆到：

```text
/Users/du/IdeaProjects/previewdock
```

不要直接删除原目录。确认新目录可以正常启动、构建和测试后，再决定是否清理旧副本。

## 2. 项目定位

这是一个基于 TypeScript、Vue 3、Vite 和 pnpm workspace 的浏览器文件预览组件项目。

核心设计：

- 本地优先：文件默认只在浏览器中处理，不自动上传后端。
- 轻量核心：核心负责识别文件、路由适配器、生命周期和取消操作。
- 按需加载：Office、3D、压缩包、复杂图片和 WASM 能力按格式懒加载。
- 模块化：开发者可以按项目需要安装和注册不同适配器包。
- 可嵌入：最终接入形态是 Vue 组件，也保留框架无关的 TypeScript 核心。

## 3. 已完成内容

### 门户页

入口：`http://127.0.0.1:5173/`

主要文件：

- `apps/playground/src/App.vue`
- `apps/playground/src/styles.css`
- `apps/playground/index.html`

门户页目前包含：

- 产品 Hero 区域和品牌导航
- 核心能力介绍
- 格式支持分类
- 懒加载适配器架构说明
- Vue 接入代码示例及复制按钮
- 在线文件预览实验室
- 中文/英文切换
- 移动端响应式布局

首页默认选中轻量的 `README.md`，避免打开门户时自动加载 DOC/PPT 的大型 ZetaOffice WASM 资源。旧版 Word 示例仍在样例列表第一项，用户可以手动点击验证。

### 预览能力

当前代码已经包含以下包：

| 包 | 作用 |
| --- | --- |
| `@previewdock/core` | 文件检测、适配器注册、生命周期和取消 |
| `@previewdock/vue` | Vue 3 组件宿主 |
| `@previewdock/adapter-text` | TXT、源码、JSON、XML、CSV、TSV、Markdown |
| `@previewdock/adapter-image` | 浏览器原生图片和 SVG |
| `@previewdock/adapter-advanced-image` | TIFF、TGA、PSD |
| `@previewdock/adapter-pdf` | PDF |
| `@previewdock/adapter-media` | 音频和视频 |
| `@previewdock/adapter-archive` | ZIP、JAR、TAR、GZIP、RAR、7Z 等压缩包 |
| `@previewdock/adapter-openxml` | DOCX、XLSX、PPTX 等新版 Office |
| `@previewdock/adapter-legacy-office` | XLS、XLT、XLA 等旧版 Excel，及 DOC/PPT 转换路由 |
| `@previewdock/converter-zetaoffice` | 浏览器内 DOC/PPT 转 PDF |
| `@previewdock/adapter-3d` | GLB、glTF、OBJ、STL、PLY、FBX、DAE、3DS、3MF、WRL 等 |

压缩包支持目录树、多级查看、内嵌文件预览和原文件下载。Markdown 支持格式化预览和原文切换。

详细矩阵见：

- `docs/format-support.md`
- `docs/modular-integration.md`
- `docs/legacy-office.md`
- `docs/architecture.md`

## 4. DOC/PPT 方案及注意事项

`DOC` 和 `PPT` 不能像 DOCX、PPTX 一样用轻量 OpenXML 解析器直接读取。当前方案是：

```text
DOC/PPT
  -> 按需加载 ZetaOffice / LibreOffice WebAssembly
  -> 浏览器内转换为 PDF
  -> 交给 PDF 预览器展示
```

特点：

- 文件不上传后端。
- 只有用户打开 DOC/PPT 时才加载大型 WASM 资源。
- 首次资源约几十 MB，具体以实际构建产物和版本为准。
- 后续可通过浏览器缓存和 Service Worker 缓存。
- 复杂字体、旧版 Word 特殊控件、宏、嵌入对象、部分图表和动画不能保证完全还原。

生产环境使用多线程 WASM 时，需要重点确认静态服务器是否支持：

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

如果这些响应头会影响宿主系统的 iframe、第三方登录、支付或跨域资源，需要评估是否把转换能力放到独立 Worker/CDN 页面，或者提供后端转换降级方案。

## 5. 启动、构建和测试

项目要求 Node.js 和 pnpm，根目录已声明 `pnpm@9.15.9`。

首次安装：

```bash
pnpm install
```

启动门户和体验台：

```bash
pnpm dev
```

默认地址：

```text
http://127.0.0.1:5173/
```

生产构建：

```bash
pnpm build
```

类型检查：

```bash
pnpm typecheck
```

运行测试：

```bash
pnpm test
```

也可以只验证体验台：

```bash
pnpm --filter @previewdock/playground typecheck
pnpm --filter @previewdock/playground build
```

## 6. 当前验证结果

最近一次验证结果：

- Playground typecheck：通过。
- Playground production build：通过。
- 全量 Vitest：通过，4 个测试文件、9 个测试用例。
- `http://127.0.0.1:5173/`：HTTP 200。
- 中文/英文门户切换：通过。
- 390px 移动端：无横向溢出。
- 默认样例：`README.md`，不会自动触发 DOC/PPT WASM 加载。
- 浏览器控制台：无错误。

构建时可能出现大 chunk warning，主要来自 Three.js、XLSX、PPTX 和 Office 相关可选能力。这些是性能提示，不是构建失败。

## 7. 新会话接续建议

新会话开始时，先执行：

```bash
cd /Users/du/IdeaProjects/previewdock
sed -n '1,260p' HANDOFF.md
pnpm install
pnpm dev
```

然后告诉新会话：

```text
请读取 HANDOFF.md，先检查项目现状和测试结果，再继续开发，不要修改 cugpt0709 中的业务系统代码。
```

后续开发优先级建议：

1. 将项目复制/迁移到独立目录并初始化 Git。
2. 补充真实 Office、压缩包、中文 DOC 样例的自动化和视觉回归测试。
3. 完善 DOC/PPT 的字体、中文编码、页眉页脚和嵌入对象兼容性。
4. 把各适配器的安装组合、产物大小和许可证要求整理成公开文档。
5. 将门户页中的“实验性/可选转换”状态与格式支持矩阵保持同步。

## 8. 安全和发布前检查

发布前必须继续检查：

- 不执行宏、脚本和文档活动内容。
- SVG、HTML、Markdown、EML 内容必须经过清洗。
- 压缩包需要限制文件数量、解压层级、展开大小和处理时间。
- 对超大文件、异常 Office 文件和移动端内存不足提供降级提示。
- 各个适配器及 WASM 依赖的许可证单独核对。
- 只有明确启用远程 provider 时才允许文件离开浏览器。
