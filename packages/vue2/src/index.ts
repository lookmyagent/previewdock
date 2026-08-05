import type { FileSource, OpenResult, ViewerEngine, ViewerStatus } from '@previewdock/core'
import {
  mountPreviewDock,
  type PreviewDockController,
  type PreviewDockLocale,
  type PreviewDockMessages,
} from '@previewdock/web'

type VueHost = {
  $el: HTMLElement
  $emit(event: string, value: unknown): void
  engine: ViewerEngine
  source?: FileSource | null
  fileName?: string
  mimeType?: string
  showToolbar?: boolean
  emptyTitle?: string
  locale?: PreviewDockLocale
  messages?: Partial<PreviewDockMessages>
  controller?: PreviewDockController
  sync(): void
}

export const PreviewDock = {
  name: 'PreviewDock',
  props: {
    engine: { type: Object, required: true },
    source: { default: null },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    showToolbar: { type: Boolean, default: true },
    emptyTitle: { type: String, default: '' },
    locale: { type: String, default: 'en' },
    messages: { type: Object, default: undefined },
  },
  render(createElement: (tag: string, data?: unknown) => unknown) {
    return createElement('div', { style: { height: '100%' } })
  },
  mounted(this: VueHost) {
    this.controller = mountPreviewDock(this.$el, {
      engine: this.engine,
      source: this.source,
      fileName: this.fileName,
      mimeType: this.mimeType,
      showToolbar: this.showToolbar,
      emptyTitle: this.emptyTitle,
      locale: this.locale,
      messages: this.messages,
      onReady: (result: OpenResult) => this.$emit('ready', result),
      onError: (error: unknown) => this.$emit('error', error),
      onStatus: (status: ViewerStatus) => this.$emit('status', status),
    })
  },
  beforeDestroy(this: VueHost) {
    void this.controller?.dispose()
    this.controller = undefined
  },
  watch: {
    source(this: VueHost) { this.sync() },
    fileName(this: VueHost) { this.sync() },
    mimeType(this: VueHost) { this.sync() },
    showToolbar(this: VueHost) { this.sync() },
    emptyTitle(this: VueHost) { this.sync() },
    locale(this: VueHost) { this.sync() },
    messages: { deep: true, handler(this: VueHost) { this.sync() } },
  },
  methods: {
    sync(this: VueHost) {
      this.controller?.update({
        source: this.source,
        fileName: this.fileName,
        mimeType: this.mimeType,
        showToolbar: this.showToolbar,
        emptyTitle: this.emptyTitle,
        locale: this.locale,
        messages: this.messages,
      })
    },
    open(this: VueHost, source: FileSource, options?: { fileName?: string; mimeType?: string }) {
      return this.controller?.open(source, options)
    },
  },
}

export const PreviewDockPlugin = {
  install(Vue: { component(name: string, component: unknown): void }) {
    Vue.component('PreviewDock', PreviewDock)
  },
}

export default PreviewDockPlugin
export type { PreviewDockLocale, PreviewDockMessages } from '@previewdock/web'
