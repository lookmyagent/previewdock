# 架构设计

## 设计目标

1. 保持浏览器首屏体积小。
2. 只有打开匹配格式的文件时，才加载对应格式引擎。
3. 将解析和转换尽量放到主线程之外。
4. 让 Vue、React、Web Components 和原生 JavaScript 共用同一套运行时。
5. 支持浏览器、桌面端，以及由宿主明确启用的远程计算服务。

## 运行流程

```text
FileSource
  -> 读取少量文件头
  -> 检测 MIME、扩展名和特征字节
  -> 匹配适配器 Manifest
  -> 动态导入适配器
  -> 创建可取消的预览 Session
  -> 挂载到宿主容器
  -> 关闭时释放 Session 和临时资源
```

## 重型运行时

重型能力会与核心包隔离：

- Office WASM
- FFmpeg WASM
- libarchive WASM
- OpenCascade WASM
- LibreDWG WASM

每个运行时都必须支持取消、进度报告、资源预算和确定性清理。

当前 Office 适配器只在命中对应文件后导入 Word 和 PowerPoint 渲染器，
同时限制压缩后和展开后的资源大小、禁用活动内容，并在高保真渲染失败时
回退到本地简化提取。将完整 OpenXML 解析进一步移入独立 Worker，仍是大文件场景的加固工作。

## 国际化

Vue 包内置 English（`en`）和简体中文（`zh-CN`）消息。宿主通过组件的
`locale` 属性选择语言，也可以覆盖消息文本，而不需要修改核心运行时。

## 文件来源策略

运行时接受 `Blob`、`File`、`ArrayBuffer`、`Uint8Array` 和 URL 来源。
远程 URL 由浏览器按正常的 CORS 和认证规则获取。宿主可以在上层提供自己的文件加载器。
