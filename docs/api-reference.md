# API 参考

本页记录当前 Early Preview 的核心公共接口。稳定版本前可能调整。

## `createViewerEngine(packs)`

创建文件预览引擎。引擎负责关闭上一会话、检测文件、解析适配器并管理取消信号。

```ts
const engine = createViewerEngine([basicPack, officePack])
```

## `defineAdapterPack(options)`

将一组 Manifest 组织成业务能力包。

```ts
const basicPack = defineAdapterPack({
  id: 'basic',
  label: 'Basic previews',
  adapters: [textAdapterManifest, imageAdapterManifest],
})
```

## `ViewerEngine`

### `open(source, options?)`

接受 `Blob | ArrayBuffer | Uint8Array | string`，返回文件描述信息、预览 Session 和取消信号。

### `close()`

取消正在进行的打开操作并释放当前 Session。

### `onStatus(listener)`

监听 `idle`、`loading-source`、`detecting`、`loading-adapter`、`opening`、`ready` 和 `error` 状态。

## `PreviewAdapter`

```ts
interface PreviewAdapter {
  id: string
  label: string
  supports(file: FileDescriptor): boolean
  open(file: FileDescriptor, signal: AbortSignal): Promise<PreviewSession>
}
```

## `PreviewSession`

Session 声明能力、挂载渲染结果并负责确定性清理。

```ts
interface PreviewSession {
  adapterId: string
  adapterLabel: string
  capabilities: PreviewCapability[]
  mount(container: HTMLElement, signal: AbortSignal): void | Promise<void>
  dispose(): void | Promise<void>
}
```

## Vue 组件

主要 Props：

| Prop | 说明 |
| --- | --- |
| `engine` | 已注册能力包的 `ViewerEngine` |
| `source` | 文件、二进制数据或 URL |
| `fileName` | 用于扩展名检测和界面显示 |
| `locale` | `zh-CN` 或 `en` |
| `showToolbar` | 是否显示宿主工具栏 |

主要事件：`status`、`ready`、`error`。
