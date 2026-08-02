import type { ViewerPhase } from '@universal-file-viewer/core'

export type ViewerLocale = 'en' | 'zh-CN'

export interface ViewerMessages {
  empty: string
  previewUnavailable: string
  unsupported: string
  phases: Record<ViewerPhase, string>
}

export const viewerMessages: Record<ViewerLocale, ViewerMessages> = {
  en: {
    empty: 'Open a file to preview',
    previewUnavailable: 'Preview unavailable',
    unsupported: 'No preview adapter is available for this format',
    phases: {
      idle: 'Idle',
      'loading-source': 'Loading file',
      detecting: 'Detecting format',
      'loading-adapter': 'Loading renderer',
      opening: 'Opening preview',
      ready: 'Preview ready',
      error: 'Preview failed',
    },
  },
  'zh-CN': {
    empty: '打开文件以开始预览',
    previewUnavailable: '暂不支持在线预览',
    unsupported: '当前没有适用于此格式的预览适配器',
    phases: {
      idle: '空闲',
      'loading-source': '正在读取文件',
      detecting: '正在识别格式',
      'loading-adapter': '正在加载渲染器',
      opening: '正在打开预览',
      ready: '预览已就绪',
      error: '预览失败',
    },
  },
}
