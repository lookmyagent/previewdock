import { createViewerEngine, defineAdapterPack } from '@previewdock/core'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'

// 只注册当前项目需要的格式；适配器会在匹配到文件时再按需加载。
export const previewEngine = createViewerEngine([
  defineAdapterPack({
    id: 'common-files',
    adapters: [textAdapterManifest, imageAdapterManifest],
  }),
])
