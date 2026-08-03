import { createAllFormatEngine } from '@previewdock/preset-all'

// 一次注册全部官方格式；真正的解析器仍在匹配到文件后按需加载。
export const previewEngine = createAllFormatEngine()
