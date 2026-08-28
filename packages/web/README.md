# @previewdock/web

PreviewDock 的原生 JavaScript 与 Web Component 接入层，提供 `mountPreviewDock()` 和 `<preview-dock>` Custom Element。

通过 `watermark: '仅供内部使用'` 或水印配置对象，可以为所有格式添加不影响交互的重复水印；Custom Element 也支持 `watermark` attribute。

```bash
pnpm add @previewdock/web @previewdock/preset-all
```

适用于原生 Web、微前端、iframe 宿主以及未提供专用组件包的框架。完整示例见[多框架接入文档](https://playground.yigeren.me/docs/frameworks)。

License: Apache-2.0
