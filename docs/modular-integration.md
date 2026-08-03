# All 模式与分类模式

PreviewDock 的产品接入只有两种选择。两种模式使用相同的 Engine 和 Vue 组件。

## All 模式

一次安装全部七个官方分类，适合文件中心、网盘和文件类型不可预知的系统。

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine()
```

All 表示一次获得全部七类产品能力，适合不希望逐类维护依赖的团队。

## 分类模式

只安装业务实际开放的分类，适合审批、聊天附件、知识库和垂直业务系统。

```bash
pnpm add vue @previewdock/core @previewdock/vue \
  @previewdock/preset-documents \
  @previewdock/preset-images \
  @previewdock/preset-text-data
```

```ts
import { createViewerEngine } from '@previewdock/core'
import { documentsPack } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'
import { textDataPack } from '@previewdock/preset-text-data'

export const engine = createViewerEngine([
  documentsPack,
  imagesPack,
  textDataPack,
])
```

七个分类包及其格式范围见[七大格式分类](/categories)。增加分类只需要安装对应包并把 Pack 加入数组，Vue 页面不需要改变。

## 怎么选择

| 对比 | All 模式 | 分类模式 |
| --- | --- | --- |
| 安装操作 | 1 个预设包 | 选择 1–7 个分类包 |
| 接入代码 | `createAllFormatEngine()` | `createViewerEngine([packs])` |
| 安装范围 | 包含全部官方分类 | 只包含选中的分类 |
| 页面组件 | 统一组件 | 同一个统一组件 |
| 新增格式类别 | All 包升级后自动获得 | 显式安装新的分类包 |
| 推荐场景 | 通用文件平台 | 格式范围明确的业务系统 |

## 带运行时配置的分类

RAR/7Z、工程 CAD 和旧版 Office 需要额外资源。分类 Pack 可以接收配置：

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

宿主系统始终负责文件选择、权限、存储、网络策略、文件大小限制和远程转换授权。
