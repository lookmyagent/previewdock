# PreviewDock Vue 2 消费端 Demo

这是一个不依赖源码别名的 Vue 2.7 + Vite 项目。它使用 `@previewdock/vue2` 挂载组件，`@previewdock/preset-all` 注册全部维护中的格式适配器，`previewDockAssets()` 在开发和构建时提供所需 Worker/WASM 资源。

```bash
pnpm install
pnpm --filter @previewdock/vue2-consumer-demo dev
```

文件选择器没有 `accept` 限制。入口中导入 `@previewdock/web/style.css`，因此视觉样式与 Vue 3、React、原生 Web 一致。旧版 DOC/PPT/WPS/DPS 则额外配置了可选的 `@previewdock/converter-zetaoffice`；首次打开这类文件会下载 ZetaOffice 的免费 WASM 运行时。
